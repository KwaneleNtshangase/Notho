-- ============================================================================
-- Churn capture: exit_feedback + email_preferences
-- ----------------------------------------------------------------------------
-- WHY THIS EXISTS
--   Today a person can leave Notho three ways and we learn nothing from any of
--   them: they delete their account (POST /api/account/delete wipes every row
--   and the auth user, then silence), they get tired of the lifecycle emails
--   (and have no unsubscribe link at all, so they mark us as spam instead), or
--   they simply stop opening the app. The last one is the biggest by volume and
--   the most invisible.
--
--   These two tables turn each of those exits into a reason we can read.
--
-- THE ONE DESIGN DECISION THAT MATTERS
--   exit_feedback has NO foreign key to auth.users and is NOT in the delete
--   route's USER_TABLES list. That is deliberate and it is the entire point: a
--   churn record that gets cascaded away the moment the user is deleted tells
--   us nothing. The row has to outlive the account.
--
--   The price of that is a POPIA obligation, paid here:
--     * No user_id, no email, no name. The only link back to a person is
--       user_ref, a SHA-256 of (user id + a server-side pepper), which is
--       one-way and useless without the pepper. It exists to dedupe repeat
--       submissions, nothing else.
--     * The cohort context (days signed up, lessons done, streak) is copied in
--       as plain numbers at exit time, so we can segment reasons by tenure
--       without retaining a joinable identity.
--     * Free text is the user's own words. The form warns them not to include
--       personal details, and this is the one field to purge if someone later
--       asks for erasure of something they wrote.
--   Net effect: the row is anonymised operational data about a decision, not
--   personal information about a person. That distinction needs to be stated in
--   the privacy policy - see docs/CHURN-FEEDBACK.md.
--
-- email_preferences is the opposite: it is squarely about a live user, so it
-- cascades on delete like every other user-scoped table.
--
-- ADDITIVE + NON-DESTRUCTIVE: creates new objects only. No existing table is
-- altered, no data is rewritten, no policy on an existing table is changed.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. exit_feedback
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.exit_feedback (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Which door they walked out of. Kept as a constrained text rather than an
  -- enum type so adding a fourth exit later is an app change, not a migration
  -- that has to take a lock on the type.
  exit_type     text        NOT NULL CHECK (exit_type IN (
                              'account_deletion',   -- Settings > Delete My Data
                              'email_unsubscribe',  -- /unsubscribe from an email footer
                              'inactive_survey'     -- one-click reply to the win-back email
                            )),

  -- The reason code they picked. NULL means they skipped the question, which is
  -- itself a finding worth counting, so skipped and 'other' are not the same
  -- thing and must not be collapsed.
  reason        text        CHECK (reason IS NULL OR reason IN (
                              'too_many_emails',
                              'not_useful',
                              'too_hard',
                              'too_easy',
                              'no_time',
                              'technical',
                              'privacy',
                              'found_alternative',
                              'other'
                            )),
  skipped       boolean     NOT NULL DEFAULT false,

  -- Their own words. Capped in the app at 1000 chars; capped again here so a
  -- forged request cannot write a novel.
  detail        text        CHECK (detail IS NULL OR length(detail) <= 1000),

  -- What we offered them instead of leaving, and whether it worked. Without
  -- these two columns you can measure churn but never whether the intervention
  -- is doing anything, which is the number that decides if this stays.
  offer_shown    text,
  offer_accepted boolean    NOT NULL DEFAULT false,

  -- Did the exit actually complete? An account_deletion row is written BEFORE
  -- the irreversible delete runs (afterwards there is no session left to write
  -- with), so without this flag every abandoned dialog would look like churn.
  completed     boolean     NOT NULL DEFAULT false,

  -- Cohort context, denormalised on purpose: the source rows are gone seconds
  -- after this is written. "People who quit in week one" and "people who quit
  -- at day ninety" are different problems with different fixes.
  days_since_signup  integer,
  lessons_completed  integer,
  current_streak     integer,
  had_budget_data    boolean,

  -- SHA-256 of (user id || pepper). One-way. Dedupes a person who unsubscribes
  -- and then also deletes, so one departure is not counted as two.
  user_ref      text
);

CREATE INDEX IF NOT EXISTS exit_feedback_created_idx
  ON public.exit_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS exit_feedback_type_reason_idx
  ON public.exit_feedback (exit_type, reason);
CREATE INDEX IF NOT EXISTS exit_feedback_user_ref_idx
  ON public.exit_feedback (user_ref) WHERE user_ref IS NOT NULL;

-- Service-role only. RLS on with zero policies denies anon and authenticated
-- outright, which is what we want: every write goes through /api/exit-feedback
-- (so the cohort numbers are read server-side and cannot be spoofed by the
-- client) and every read goes through the admin dashboard.
ALTER TABLE public.exit_feedback ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.exit_feedback IS
  'Anonymised churn reasons. Deliberately has NO FK to auth.users and is NOT '
  'deleted by /api/account/delete - the record must outlive the account or it '
  'is worthless. Identity is reduced to a one-way hash (user_ref).';
COMMENT ON COLUMN public.exit_feedback.completed IS
  'False means the person opened the exit flow and backed out. Excluding these '
  'from churn counts is the difference between a real number and a scary one.';
COMMENT ON COLUMN public.exit_feedback.user_ref IS
  'SHA-256(user id || EXIT_FEEDBACK_PEPPER). One-way; for dedupe only.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. email_preferences
-- ─────────────────────────────────────────────────────────────────────────────
-- Every lifecycle and broadcast send must consult this first. A table nobody
-- reads is worse than no table, because it tells the user we honoured a request
-- we then ignored.

CREATE TABLE IF NOT EXISTS public.email_preferences (
  user_id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The master switch. When true nothing marketing-ish goes out, regardless of
  -- the granular flags below. Transactional mail (password reset, email
  -- confirmation) is NOT governed by this table and must keep sending.
  unsubscribed_all  boolean     NOT NULL DEFAULT false,

  -- Granular opt-outs, so "stop emailing me so much" has an answer that is not
  -- "leave forever".
  lifecycle_emails  boolean     NOT NULL DEFAULT true,   -- D+1 nudge, D7/D14/D30 milestones
  product_emails    boolean     NOT NULL DEFAULT true,   -- announcements, broadcasts

  -- The middle ground most people actually want. 'weekly' collapses the
  -- lifecycle stream to one summary; 'none' silences it without touching
  -- product news.
  frequency         text        NOT NULL DEFAULT 'normal'
                                CHECK (frequency IN ('normal', 'weekly', 'none')),

  -- Snooze rather than stop. Set by the "pause for 30 days" save offer; any
  -- send checks it and skips while it is in the future.
  paused_until      timestamptz,

  unsubscribed_at   timestamptz,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- A signed-in person manages their own row from Settings. The public
-- /unsubscribe page has no session, so it writes via the service role after
-- verifying an HMAC token - see src/lib/unsubscribeToken.ts.
DROP POLICY IF EXISTS email_prefs_select_own ON public.email_preferences;
CREATE POLICY email_prefs_select_own ON public.email_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS email_prefs_insert_own ON public.email_preferences;
CREATE POLICY email_prefs_insert_own ON public.email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS email_prefs_update_own ON public.email_preferences;
CREATE POLICY email_prefs_update_own ON public.email_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.email_preferences IS
  'Per-user email opt-outs. Consulted by /api/cron/lifecycle and '
  '/api/admin/broadcast before every send. Transactional auth mail is out of '
  'scope and always sends.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Win-back send ledger
-- ─────────────────────────────────────────────────────────────────────────────
-- Same idea as broadcast_send_log: the inactivity cron runs daily over a
-- multi-day window, so without a ledger a user sitting in that window gets the
-- "we miss you" email every morning, which is how you turn a lapsed user into
-- an angry one.

CREATE TABLE IF NOT EXISTS public.winback_send_log (
  user_id   uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at   timestamptz NOT NULL DEFAULT now(),
  responded boolean     NOT NULL DEFAULT false
);

ALTER TABLE public.winback_send_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.winback_send_log IS
  'One row per user who has been sent the inactivity win-back email. Makes the '
  'daily cron idempotent so a lapsed user is asked once, not every morning.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. admin_churn_reasons - dashboard read
-- ─────────────────────────────────────────────────────────────────────────────
-- Aggregation belongs in Postgres, matching every other admin_* function. The
-- dashboard gets counts, not rows, so no free text crosses the wire unless the
-- verbatim view is opened explicitly.

CREATE OR REPLACE FUNCTION public.admin_churn_reasons(p_days integer DEFAULT 90)
RETURNS TABLE (
  exit_type       text,
  reason          text,
  n               bigint,
  n_left          bigint,
  n_skipped       bigint,
  n_offer_shown   bigint,
  n_offer_taken   bigint,
  avg_days_tenure numeric,
  avg_lessons     numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ef.exit_type,
    COALESCE(ef.reason, 'skipped')                         AS reason,
    -- Everyone who answered, including the ones the offer kept. This is the
    -- denominator for "what do people say".
    COUNT(*)                                               AS n,
    -- Of those, the ones who actually went through with it. n and n_left are
    -- deliberately separate: somebody who took the save offer gave us a reason
    -- but did NOT churn, and counting them as churn would overstate the number
    -- while the intervention that prevented it goes uncredited. Two columns,
    -- because they answer two different questions.
    COUNT(*) FILTER (WHERE ef.completed AND NOT ef.offer_accepted) AS n_left,
    COUNT(*) FILTER (WHERE ef.skipped)                     AS n_skipped,
    COUNT(*) FILTER (WHERE ef.offer_shown IS NOT NULL)     AS n_offer_shown,
    COUNT(*) FILTER (WHERE ef.offer_accepted)              AS n_offer_taken,
    ROUND(AVG(ef.days_since_signup)::numeric, 1)           AS avg_days_tenure,
    ROUND(AVG(ef.lessons_completed)::numeric, 1)           AS avg_lessons
  FROM public.exit_feedback ef
  WHERE ef.created_at >= now() - make_interval(days => p_days)
    -- An abandoned dialog is not a departure and not an answer. Rows that were
    -- never completed and never converted an offer are someone who opened the
    -- delete screen, read it, and closed it.
    AND (ef.completed OR ef.offer_accepted)
  GROUP BY 1, 2
  ORDER BY n DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_churn_reasons(integer) FROM anon, authenticated;

COMMENT ON FUNCTION public.admin_churn_reasons(integer) IS
  'Churn reasons grouped by exit door, with save-offer take-up. Service-role '
  'only; the admin API route gates on profiles.is_admin before calling.';


-- Verbatim comments, separated from the counts so reading a person's own words
-- is a deliberate act rather than a side effect of loading a dashboard tab.
CREATE OR REPLACE FUNCTION public.admin_churn_verbatims(p_days integer DEFAULT 90, p_limit integer DEFAULT 100)
RETURNS TABLE (
  created_at        timestamptz,
  exit_type         text,
  reason            text,
  detail            text,
  days_since_signup integer,
  lessons_completed integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ef.created_at, ef.exit_type, ef.reason, ef.detail,
         ef.days_since_signup, ef.lessons_completed
  FROM public.exit_feedback ef
  WHERE ef.created_at >= now() - make_interval(days => p_days)
    AND ef.detail IS NOT NULL
    AND length(trim(ef.detail)) > 0
  ORDER BY ef.created_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 500);
$$;

REVOKE ALL ON FUNCTION public.admin_churn_verbatims(integer, integer) FROM anon, authenticated;

COMMENT ON FUNCTION public.admin_churn_verbatims(integer, integer) IS
  'Free-text exit comments, newest first. Separate from admin_churn_reasons so '
  'reading verbatims is an explicit action.';
