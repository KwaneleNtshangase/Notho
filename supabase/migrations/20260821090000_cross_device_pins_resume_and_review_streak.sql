-- ============================================================
-- Cross-device sync: pinned courses, mid-lesson resume,
-- daily-challenge flags, and streak credit for review sessions
-- ------------------------------------------------------------
-- Continues the model established by 20260623000000 and
-- 20260719090000: the client never overwrites the server with a
-- snapshot of its own state. Every write is a MERGE whose rule is
-- written down here, in one place, so two devices that diverged
-- offline have a defined outcome.
--
-- CONFLICT RULES (the whole contract, in one place)
--
--   pinned_courses      LAST-WRITE-WINS on the client-stamped
--                       `updatedAt`, whole-list replace.
--                       Rationale: a pin list is ORDERED and an
--                       unpin is a REMOVAL, so a set-union can't
--                       express it — union would make unpinning
--                       impossible across devices. A pin is a
--                       cheap, re-doable choice, so losing the
--                       older of two offline edits is acceptable
--                       in a way that losing XP never is.
--                       Ties -> the server's copy is kept.
--                       `p_adopt` (first sync on a device that
--                       has only ever had local pins) UNIONS
--                       instead of replacing, so nobody's pins
--                       are wiped by the rollout.
--
--   lesson_resume       LAST-WRITE-WINS on `savedAt` (epoch ms)
--                       decides WHICH lesson you are resuming —
--                       never HOW FAR into it. When both sides sit
--                       in the SAME lesson the position fields take
--                       GREATEST and the qid arrays take the union,
--                       in BOTH directions: a laptop that reached
--                       step 9 offline must not be rewound to step
--                       2 just because the phone synced first.
--                       Same never-go-backwards discipline used for
--                       longest_streak and completed_lessons.
--                       Clearing writes a tombstone {cleared:true}
--                       with a fresh savedAt so "I finished it" can
--                       beat a stale resume point from another
--                       device.
--
--   daily_flags         Same SAST day  -> booleans OR, counters
--                       GREATEST. Strictly newer day -> replace.
--                       Older day -> ignored (stale device).
--                       Identical to merge_weekly_stats' shape.
--
--   review sessions     Not a merge: an ATOMIC CLAIM. The first
--                       qualifying review session of a SAST day
--                       wins the XP and the lessons-today bump
--                       (row lock + flag check), every later one
--                       gets already_claimed and nothing. Streak
--                       itself is NOT set here — it still goes
--                       through /api/progress/sync-streak, which
--                       is already idempotent per SAST day.
--
--   xp / completed_lessons / longest_streak / weekly counters
--                       UNCHANGED. Additive ledger, set union and
--                       GREATEST, per 20260623000000.
--
-- ADDITIVE + NON-DESTRUCTIVE: only ADD COLUMN IF NOT EXISTS and
-- CREATE OR REPLACE FUNCTION. No column is dropped, no row is
-- rewritten, no data is deleted. Safe to re-run.
--
-- RLS: every column added here lives on public.user_progress and
-- is therefore covered by the existing per-user policies from
-- 20260712000000 (explicit USING + WITH CHECK on auth.uid()) as
-- hardened by 20260712020000 (which dropped the read-all policy).
-- No new policy is created, and none is needed — adding a column
-- cannot widen a row-level policy. The RPCs below are SECURITY
-- INVOKER (the default), so they run with the caller's rights and
-- RLS still applies; the explicit auth.uid() guard in each one is
-- defence in depth, matching apply_progress_delta.
-- ============================================================


-- ── 1. Columns ───────────────────────────────────────────────

-- Pinned courses. Shape: {"ids": ["course-id", ...], "updatedAt": "<ISO8601>"}
-- NULL means "this account has never synced pins", which is what
-- triggers one-time adoption of a device's localStorage list.
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS pinned_courses JSONB DEFAULT NULL;

-- Mid-lesson resume point. Shape:
--   {"courseId","lessonId","lessonTitle","stepIndex","answers",
--    "correctCount","mistakes","masteredQids","mistakenQids",
--    "savedAt": <epoch ms>, "cleared": false}
-- Deliberately does NOT carry the resolved `steps` array: it can be
-- several hundred KB, and the receiving device rebuilds it
-- deterministically (shuffleLessonSteps is seeded on
-- userId+courseId+lessonId, so every device produces the same order).
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS lesson_resume JSONB DEFAULT NULL;

-- Daily-challenge condition flags for one SAST day. Shape:
--   {"day":"YYYY-MM-DD","conceptReviewed":bool,"shared":bool,
--    "calcVisited":bool,"budgetVisited":bool,"reviewCounted":bool,
--    "perfectToday":int,"expenseToday":int,"correctStreakToday":int}
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS daily_flags JSONB DEFAULT '{}'::JSONB;

-- The daily-challenge CLAIM map. The client (LearnView's
-- DailyChallenges) has been reading and writing these two columns
-- since the daily-challenge feature shipped, but no migration ever
-- created them — every read failed and every write was a no-op, so
-- claims were localStorage-only and could be re-claimed once per
-- device. Creating them here is the fix; no client change needed.
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS daily_challenges_date    TEXT  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS daily_challenges_claimed JSONB DEFAULT NULL;

-- Same gap, one layer down: apply_progress_delta (20260719090000)
-- and the client's PROGRESS_SELECT both reference daily_xp_today /
-- daily_xp_date, but 20260427 added only the daily_lessons_* pair.
-- TEXT (not DATE) because the RPC compares them against '' and
-- against a TEXT day key.
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS daily_xp_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_xp_date  TEXT    DEFAULT NULL;


-- ── 2. merge_pinned_courses ──────────────────────────────────
-- LWW on p_updated_at, whole-list replace. p_adopt unions instead,
-- for the one-time migration of a device whose pins only exist in
-- localStorage. Returns the winning value so the caller can adopt it.
CREATE OR REPLACE FUNCTION public.merge_pinned_courses(
  p_user_id    UUID,
  p_ids        TEXT[],
  p_updated_at TIMESTAMPTZ,
  p_adopt      BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  cur        JSONB;
  cur_at     TIMESTAMPTZ;
  in_ids     TEXT[];
  merged_ids TEXT[];
  stamp      TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot modify pins for another user';
  END IF;

  -- Clamp the client clock. A device with a wildly future clock must
  -- not be able to win every merge forever.
  stamp := LEAST(COALESCE(p_updated_at, NOW()), NOW() + INTERVAL '5 minutes');

  -- Sanitise: drop blanks, cap the list, de-duplicate while KEEPING
  -- the caller's order (pin order is the display order).
  SELECT COALESCE(ARRAY_AGG(id ORDER BY ord), '{}')
    INTO in_ids
  FROM (
    SELECT DISTINCT ON (id) id, ord
    FROM UNNEST(COALESCE(p_ids, '{}')) WITH ORDINALITY AS t(id, ord)
    WHERE id IS NOT NULL AND BTRIM(id) <> '' AND LENGTH(id) <= 64
    ORDER BY id, ord
  ) s
  WHERE ord <= 200;

  INSERT INTO public.user_progress (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT pinned_courses INTO cur FROM public.user_progress
  WHERE user_id = p_user_id FOR UPDATE;

  IF cur IS NULL OR cur->'ids' IS NULL THEN
    merged_ids := in_ids;                       -- never synced: adopt
  ELSE
    BEGIN
      cur_at := (cur->>'updatedAt')::TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN
      cur_at := NULL;
    END;

    IF p_adopt THEN
      -- One-time rollout merge: server order first, then this
      -- device's pins that the server has never seen.
      SELECT COALESCE(ARRAY_AGG(id ORDER BY ord), '{}') INTO merged_ids
      FROM (
        SELECT DISTINCT ON (id) id, ord FROM (
          SELECT id, ord
          FROM jsonb_array_elements_text(cur->'ids') WITH ORDINALITY AS c(id, ord)
          UNION ALL
          SELECT id, 1000 + ord
          FROM UNNEST(in_ids) WITH ORDINALITY AS t(id, ord)
        ) u ORDER BY id, ord
      ) s
      WHERE ord <= 200;
    ELSIF cur_at IS NULL OR stamp > cur_at THEN
      merged_ids := in_ids;                     -- strictly newer wins
    ELSE
      -- Stale (or tied) write. Keep the server's copy untouched and
      -- hand it back so the caller adopts it.
      RETURN COALESCE(cur, jsonb_build_object('ids', '[]'::JSONB));
    END IF;
  END IF;

  cur := jsonb_build_object(
    'ids',       COALESCE(to_jsonb(merged_ids), '[]'::JSONB),
    'updatedAt', to_char(stamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );

  UPDATE public.user_progress
  SET pinned_courses = cur, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN cur;
END;
$$;


-- ── 3. merge_lesson_resume ───────────────────────────────────
-- savedAt decides WHICH lesson wins; it never decides how far in.
-- For the case that actually matters — both devices part-way
-- through the SAME lesson — position and counters take GREATEST
-- and the question-id arrays take the union regardless of which
-- side saved last, so reconnecting can only ever move you FORWARD.
-- Mirrored by mergeResume() in src/lib/sync/mergeRules.ts.
CREATE OR REPLACE FUNCTION public.merge_lesson_resume(
  p_user_id UUID,
  p_resume  JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  cur         JSONB;
  in_saved    BIGINT;
  cur_saved   BIGINT;
  same_lesson BOOLEAN;
  newer       JSONB;
  older       JSONB;
  merged      JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot modify resume state for another user';
  END IF;

  IF p_resume IS NULL OR jsonb_typeof(p_resume) <> 'object' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_payload');
  END IF;
  -- Bound what a client can park in the row. The steps array is
  -- deliberately not sent; anything this big is a bug or an attack.
  IF pg_column_size(p_resume) > 65536 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'payload_too_large');
  END IF;

  in_saved := COALESCE((p_resume->>'savedAt')::BIGINT, 0);

  INSERT INTO public.user_progress (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT lesson_resume INTO cur FROM public.user_progress
  WHERE user_id = p_user_id FOR UPDATE;

  IF cur IS NULL THEN
    merged := p_resume;
  ELSE
    cur_saved := COALESCE((cur->>'savedAt')::BIGINT, 0);

    same_lesson :=
      COALESCE(p_resume->>'cleared', 'false') <> 'true'
      AND COALESCE(cur->>'cleared', 'false') <> 'true'
      AND p_resume->>'courseId' IS NOT DISTINCT FROM cur->>'courseId'
      AND p_resume->>'lessonId' IS NOT DISTINCT FROM cur->>'lessonId';

    IF NOT same_lesson THEN
      IF in_saved <= cur_saved THEN
        -- Stale write (or a tie) for a different lesson, or a tombstone
        -- that has been overtaken. Server wins; hand it back so the
        -- caller adopts it.
        RETURN jsonb_build_object('ok', true, 'resume', cur, 'applied', false);
      END IF;
      merged := p_resume;
    ELSE
      -- Same lesson on both devices: never go backwards, whichever side
      -- saved last. The later save supplies the non-positional fields.
      IF in_saved >= cur_saved THEN
        newer := p_resume; older := cur;
      ELSE
        newer := cur;      older := p_resume;
      END IF;

      merged := newer
        || jsonb_build_object(
             'savedAt',      GREATEST(in_saved, cur_saved),
             'stepIndex',    GREATEST(COALESCE((p_resume->>'stepIndex')::INT, 0),
                                      COALESCE((cur->>'stepIndex')::INT, 0)),
             'correctCount', GREATEST(COALESCE((p_resume->>'correctCount')::INT, 0),
                                      COALESCE((cur->>'correctCount')::INT, 0)),
             'mistakes',     GREATEST(COALESCE((p_resume->>'mistakes')::INT, 0),
                                      COALESCE((cur->>'mistakes')::INT, 0)),
             'masteredQids', (SELECT COALESCE(jsonb_agg(DISTINCT q), '[]'::JSONB) FROM (
                                SELECT jsonb_array_elements(COALESCE(cur->'masteredQids', '[]'::JSONB)) AS q
                                UNION
                                SELECT jsonb_array_elements(COALESCE(p_resume->'masteredQids', '[]'::JSONB))
                              ) s),
             'mistakenQids', (SELECT COALESCE(jsonb_agg(DISTINCT q), '[]'::JSONB) FROM (
                                SELECT jsonb_array_elements(COALESCE(cur->'mistakenQids', '[]'::JSONB)) AS q
                                UNION
                                SELECT jsonb_array_elements(COALESCE(p_resume->'mistakenQids', '[]'::JSONB))
                              ) s),
             'answers',      COALESCE(older->'answers', '{}'::JSONB)
                             || COALESCE(newer->'answers', '{}'::JSONB)
           );
    END IF;
  END IF;

  UPDATE public.user_progress
  SET lesson_resume = merged, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'resume', merged, 'applied', true);
END;
$$;


-- ── 4. merge_daily_flags ─────────────────────────────────────
-- Same day -> OR the booleans, GREATEST the counters.
-- Newer day -> replace wholesale. Older day -> ignore.
CREATE OR REPLACE FUNCTION public.merge_daily_flags(
  p_user_id UUID,
  p_day     TEXT,
  p_flags   JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  cur      JSONB;
  cur_day  TEXT;
  in_flags JSONB;
  merged   JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot modify flags for another user';
  END IF;
  IF p_day IS NULL OR p_day !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_day');
  END IF;

  in_flags := jsonb_build_object(
    'day',                p_day,
    'conceptReviewed',    COALESCE((p_flags->>'conceptReviewed')::BOOLEAN, FALSE),
    'shared',             COALESCE((p_flags->>'shared')::BOOLEAN, FALSE),
    'calcVisited',        COALESCE((p_flags->>'calcVisited')::BOOLEAN, FALSE),
    'budgetVisited',      COALESCE((p_flags->>'budgetVisited')::BOOLEAN, FALSE),
    'reviewCounted',      COALESCE((p_flags->>'reviewCounted')::BOOLEAN, FALSE),
    'perfectToday',       LEAST(GREATEST(COALESCE((p_flags->>'perfectToday')::INT, 0), 0), 500),
    'expenseToday',       LEAST(GREATEST(COALESCE((p_flags->>'expenseToday')::INT, 0), 0), 500),
    'correctStreakToday', LEAST(GREATEST(COALESCE((p_flags->>'correctStreakToday')::INT, 0), 0), 500)
  );

  INSERT INTO public.user_progress (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT daily_flags INTO cur FROM public.user_progress
  WHERE user_id = p_user_id FOR UPDATE;

  cur_day := COALESCE(cur->>'day', '');

  IF cur_day = '' OR p_day > cur_day THEN
    merged := in_flags;                                  -- new day: replace
  ELSIF p_day < cur_day THEN
    RETURN jsonb_build_object('ok', true, 'flags', cur); -- stale device: ignore
  ELSE
    merged := jsonb_build_object(
      'day',                p_day,
      'conceptReviewed',    COALESCE((cur->>'conceptReviewed')::BOOLEAN, FALSE) OR (in_flags->>'conceptReviewed')::BOOLEAN,
      'shared',             COALESCE((cur->>'shared')::BOOLEAN, FALSE)          OR (in_flags->>'shared')::BOOLEAN,
      'calcVisited',        COALESCE((cur->>'calcVisited')::BOOLEAN, FALSE)     OR (in_flags->>'calcVisited')::BOOLEAN,
      'budgetVisited',      COALESCE((cur->>'budgetVisited')::BOOLEAN, FALSE)   OR (in_flags->>'budgetVisited')::BOOLEAN,
      'reviewCounted',      COALESCE((cur->>'reviewCounted')::BOOLEAN, FALSE)   OR (in_flags->>'reviewCounted')::BOOLEAN,
      'perfectToday',       GREATEST(COALESCE((cur->>'perfectToday')::INT, 0),       (in_flags->>'perfectToday')::INT),
      'expenseToday',       GREATEST(COALESCE((cur->>'expenseToday')::INT, 0),       (in_flags->>'expenseToday')::INT),
      'correctStreakToday', GREATEST(COALESCE((cur->>'correctStreakToday')::INT, 0), (in_flags->>'correctStreakToday')::INT)
    );
  END IF;

  UPDATE public.user_progress
  SET daily_flags = merged, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'flags', merged);
END;
$$;


-- ── 5. claim_review_session ──────────────────────────────────
-- Streak credit for a spaced-repetition review session.
--
-- "Enough for a day's work" is REVIEW_MIN_CARDS cards answered in
-- one completed session. One card is a three-second tap, and a card
-- answered WRONG is rescheduled to tomorrow by SM-2 — so without a
-- floor a user could keep a streak alive indefinitely by getting the
-- same single card wrong once a day. The floor is enforced here, not
-- only in the client, so a tampered client can't mint streak days.
--
-- The claim is atomic and once-per-SAST-day (row lock + the
-- reviewCounted flag in daily_flags), so re-opening review, a second
-- device, or a queued offline claim replayed after another device
-- already claimed all get already_claimed and NO xp, NO extra
-- lessons-today. XP is computed server-side from the reported
-- correct count and hard-capped.
--
-- The streak itself is NOT written here. It stays with
-- /api/progress/sync-streak, which is already idempotent per SAST
-- day, so review and lessons take exactly the same path.
CREATE OR REPLACE FUNCTION public.claim_review_session(
  p_user_id   UUID,
  p_day       TEXT,
  p_cards     INTEGER,
  p_correct   INTEGER,
  p_week_key  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  REVIEW_MIN_CARDS CONSTANT INTEGER := 5;
  cards    INTEGER;
  correct  INTEGER;
  grant_xp INTEGER;
  cur      public.user_progress;
  flags    JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot claim a review for another user';
  END IF;
  IF p_day IS NULL OR p_day !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_day');
  END IF;

  cards   := LEAST(GREATEST(COALESCE(p_cards, 0), 0), 500);
  correct := LEAST(GREATEST(COALESCE(p_correct, 0), 0), cards);

  IF cards < REVIEW_MIN_CARDS THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_enough_cards',
                              'required', REVIEW_MIN_CARDS, 'answered', cards);
  END IF;

  -- Same formula the review screen has always displayed.
  grant_xp := LEAST(20 + correct * 5, 200);

  INSERT INTO public.user_progress (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO cur FROM public.user_progress
  WHERE user_id = p_user_id FOR UPDATE;

  flags := COALESCE(cur.daily_flags, '{}'::JSONB);

  IF COALESCE(flags->>'day', '') = p_day
     AND COALESCE((flags->>'reviewCounted')::BOOLEAN, FALSE)
  THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  -- Roll the flag object onto today if it is stale, then set the
  -- claim. Same day/newer-day/older-day discipline as merge_daily_flags.
  IF COALESCE(flags->>'day', '') <> p_day THEN
    flags := jsonb_build_object('day', p_day);
  END IF;
  flags := flags || jsonb_build_object('reviewCounted', TRUE, 'conceptReviewed', TRUE);

  UPDATE public.user_progress SET
    daily_flags = flags,

    -- XP: the same additive ledger as every other earn.
    xp = GREATEST(0, xp + grant_xp),

    weekly_xp = CASE
      WHEN p_week_key IS NULL                     THEN weekly_xp
      WHEN p_week_key = week_key                  THEN weekly_xp + grant_xp
      WHEN p_week_key > COALESCE(week_key, '')    THEN grant_xp
      ELSE weekly_xp
    END,
    week_key = CASE
      WHEN p_week_key IS NOT NULL AND p_week_key > COALESCE(week_key, '')
        THEN p_week_key
      ELSE week_key
    END,

    -- Feed the daily counters exactly the way a lesson does.
    -- ::TEXT on both sides: daily_lessons_date was created DATE by
    -- 20260427 while daily_xp_date is TEXT, and comparing either
    -- against a 'YYYY-MM-DD' key without the cast is a runtime error
    -- on one of them. The assignment casts back on the way in.
    daily_xp_today = CASE
      WHEN p_day = COALESCE(daily_xp_date::TEXT, '') THEN COALESCE(daily_xp_today, 0) + grant_xp
      WHEN p_day > COALESCE(daily_xp_date::TEXT, '') THEN grant_xp
      ELSE daily_xp_today
    END,
    daily_xp_date = GREATEST(COALESCE(daily_xp_date::TEXT, ''), p_day),

    daily_lessons_today = CASE
      WHEN p_day = COALESCE(daily_lessons_date::TEXT, '') THEN COALESCE(daily_lessons_today, 0) + 1
      WHEN p_day > COALESCE(daily_lessons_date::TEXT, '') THEN 1
      ELSE daily_lessons_today
    END,
    daily_lessons_date = GREATEST(COALESCE(daily_lessons_date::TEXT, ''), p_day),

    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'xp_granted', grant_xp, 'cards', cards);
END;
$$;


-- ── 6. Grants + pinned search_path (Supabase advisor 0011) ───
GRANT EXECUTE ON FUNCTION public.merge_pinned_courses(UUID, TEXT[], TIMESTAMPTZ, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.merge_lesson_resume(UUID, JSONB)                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.merge_daily_flags(UUID, TEXT, JSONB)                      TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_review_session(UUID, TEXT, INTEGER, INTEGER, TEXT)  TO authenticated;

ALTER FUNCTION public.merge_pinned_courses(UUID, TEXT[], TIMESTAMPTZ, BOOLEAN) SET search_path = public, pg_temp;
ALTER FUNCTION public.merge_lesson_resume(UUID, JSONB)                         SET search_path = public, pg_temp;
ALTER FUNCTION public.merge_daily_flags(UUID, TEXT, JSONB)                     SET search_path = public, pg_temp;
ALTER FUNCTION public.claim_review_session(UUID, TEXT, INTEGER, INTEGER, TEXT) SET search_path = public, pg_temp;


-- ── 7. RLS assertion ─────────────────────────────────────────
-- Fail the migration loudly if the hardening from 20260712020000
-- has been undone, rather than shipping new columns into a table
-- that any signed-in user can read.
DO $$
DECLARE
  leaky INTEGER;
  own   INTEGER;
BEGIN
  -- Any policy that can READ rows must be scoped to auth.uid().
  -- (INSERT policies legitimately have a NULL qual, so they are
  -- checked through with_check below instead.)
  SELECT COUNT(*) INTO leaky
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'user_progress'
    AND cmd IN ('SELECT', 'UPDATE', 'DELETE', 'ALL')
    AND (qual IS NULL OR qual !~ 'auth\.uid');
  IF leaky > 0 THEN
    RAISE EXCEPTION
      'user_progress has % read-capable policy/policies not scoped to auth.uid() — the columns added here would be readable by any signed-in user. See 20260712020000.', leaky;
  END IF;

  SELECT COUNT(*) INTO own
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'user_progress' AND cmd = 'SELECT';
  IF own = 0 THEN
    RAISE EXCEPTION 'user_progress has no SELECT policy — users could not read their own progress.';
  END IF;

  -- Write policies must pin the row being written to the caller.
  SELECT COUNT(*) INTO leaky
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'user_progress'
    AND cmd IN ('INSERT', 'UPDATE', 'ALL')
    AND (with_check IS NULL OR with_check !~ 'auth\.uid');
  IF leaky > 0 THEN
    RAISE WARNING
      'user_progress has % write policy/policies without an auth.uid() WITH CHECK. See 20260712000000.', leaky;
  END IF;
END $$;
