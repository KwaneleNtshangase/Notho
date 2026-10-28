-- ============================================================================
-- Admin analytics v2 - bug fixes + the decision-support views
-- ----------------------------------------------------------------------------
-- WHY THIS EXISTS
--   The first analytics migration answered "what happened". This one answers
--   "so what do I do about it". It fixes three real bugs and adds the views the
--   revamped /admin/analytics dashboard needs to rank actions instead of just
--   listing numbers.
--
-- THE BUGS FIXED
--   1. admin_user_detail failed at runtime for every user. It reads columns on
--      user_progress (level, hearts, perfect_lessons_total) that are not
--      guaranteed to exist - parts of this schema were added straight in the
--      Supabase dashboard and never made it into a migration file. Because the
--      function is plpgsql, a missing column is not caught when the function is
--      created, only when it runs, which is exactly what the drill-down drawer
--      was hitting. It is now schema-tolerant: optional columns are read out of
--      to_jsonb(row) so a missing one yields NULL instead of an exception.
--   2. dau / wau / mau counted app_sessions only, while activeUsers counted
--      sessions OR answers. On a day where the only tracked activity was an
--      answer, DAU read 0 while "active" read 1 - and DAU/MAU stickiness read
--      100% off a single session. All of them now use one definition of
--      "active", via admin_activity_since().
--   3. admin_daily_activity had the same split-brain: the chart's "active
--      users" line ignored answers and feature events entirely.
--
-- WHAT IS ADDED
--   admin_activity_since     - one definition of "a user did something"
--   admin_activation_funnel  - signup -> opened -> answered -> finished -> stuck
--   admin_engagement_segments- champions / regulars / slipping / dormant / lost
--   admin_retention_matrix   - cohort x week-since heatmap
--   admin_activity_clock     - day-of-week x hour, for notification timing
--   admin_at_risk_users      - who to win back, ranked by what is at stake
--   admin_feature_lift       - which features actually correlate with returning
--   admin_question_offenders - the individual questions to rewrite
--   admin_growth_accounting  - new / retained / resurrected / churned per week
--   admin_streak_distribution- habit formation at a glance
--
-- SAFETY
--   Additive and idempotent. No table is altered, no data is written. Every
--   function is SECURITY DEFINER, read-only, and has EXECUTE revoked from
--   PUBLIC/anon/authenticated at the bottom, so only service-role (the admin
--   API route, which gates on profiles.is_admin first) can call them.
--   A smoke-test block at the very end executes every function once so a bad
--   column reference fails THIS migration loudly instead of failing silently in
--   the dashboard six weeks later.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- One definition of "active"
-- ─────────────────────────────────────────────────────────────────────────────
-- Every activity number in the dashboard is built on this. A user is active if
-- they had a tracked session, answered a question, or triggered a feature event.
-- Sessions alone under-counts (the heartbeat can miss short visits); answers
-- alone under-counts everyone who read without answering.

CREATE OR REPLACE FUNCTION public.admin_activity_since(p_since timestamptz)
RETURNS TABLE (user_id uuid, at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id, s.started_at  FROM public.app_sessions      s WHERE s.started_at  >= p_since
  UNION ALL
  SELECT q.user_id, q.answered_at FROM public.question_attempts q WHERE q.answered_at >= p_since
  UNION ALL
  SELECT f.user_id, f.occurred_at FROM public.feature_events    f WHERE f.occurred_at >= p_since
$$;

COMMENT ON FUNCTION public.admin_activity_since(timestamptz) IS
  'Union of every signal that a user was present: sessions, answers, feature events. '
  'The single source of truth for active-user counts across the admin dashboard.';


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_overview - the headline numbers, rebuilt
-- ─────────────────────────────────────────────────────────────────────────────
-- Same name, same signature, superset of keys: the old dashboard keeps working
-- while the new one reads the additions.

CREATE OR REPLACE FUNCTION public.admin_overview(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  win    integer     := GREATEST(COALESCE(p_days, 30), 1);
  since  timestamptz := now() - make_interval(days => win);
  prev   timestamptz := now() - make_interval(days => win * 2);
  result jsonb;
BEGIN
  WITH acts AS (
    SELECT a.user_id, a.at FROM public.admin_activity_since(prev) a
  ),
  cur AS (
    SELECT user_id, count(DISTINCT (at AT TIME ZONE 'Africa/Johannesburg')::date) AS active_days
      FROM acts WHERE at >= since GROUP BY user_id
  ),
  pre AS (
    SELECT DISTINCT user_id FROM acts WHERE at >= prev AND at < since
  ),
  -- Last time we saw each user at all, for the risk buckets below.
  seen AS (
    SELECT user_id, max(at) AS last_at
      FROM public.admin_activity_since('epoch'::timestamptz)
     GROUP BY user_id
  ),
  prog AS (
    SELECT user_id, COALESCE(cardinality(completed_lessons), 0) AS lessons
      FROM public.user_progress
  )
  SELECT jsonb_build_object(
    'totalUsers',        (SELECT count(*) FROM auth.users),
    'newUsers',          (SELECT count(*) FROM auth.users WHERE created_at >= since),
    'newUsersPrev',      (SELECT count(*) FROM auth.users
                           WHERE created_at >= prev AND created_at < since),

    'activeUsers',       (SELECT count(*) FROM cur),
    'activeUsersPrev',   (SELECT count(*) FROM pre),
    -- Same definition at three zoom levels, so DAU/MAU is a real ratio.
    'dau',               (SELECT count(DISTINCT user_id) FROM acts WHERE at >= now() - interval '1 day'),
    'wau',               (SELECT count(DISTINCT user_id) FROM acts WHERE at >= now() - interval '7 days'),
    'mau',               (SELECT count(DISTINCT user_id) FROM acts WHERE at >= now() - interval '30 days'),

    'lessonsCompleted',  (SELECT COALESCE(sum(lessons), 0) FROM prog),
    'lessonsInWindow',   (SELECT count(*) FROM public.feature_events
                           WHERE event = 'lesson_completed' AND occurred_at >= since),
    'lessonsInWindowPrev',(SELECT count(*) FROM public.feature_events
                           WHERE event = 'lesson_completed'
                             AND occurred_at >= prev AND occurred_at < since),
    'totalXp',           (SELECT COALESCE(sum(xp), 0) FROM public.user_progress),

    'totalMinutes',      (SELECT COALESCE(round(sum(active_seconds) / 60.0), 0)
                            FROM public.app_sessions WHERE started_at >= since),
    'totalMinutesPrev',  (SELECT COALESCE(round(sum(active_seconds) / 60.0), 0)
                            FROM public.app_sessions
                           WHERE started_at >= prev AND started_at < since),
    'sessions',          (SELECT count(*) FROM public.app_sessions WHERE started_at >= since),
    'sessionsPrev',      (SELECT count(*) FROM public.app_sessions
                           WHERE started_at >= prev AND started_at < since),
    'avgSessionMinutes', (SELECT COALESCE(round((avg(active_seconds) / 60.0)::numeric, 1), 0)
                            FROM public.app_sessions
                           WHERE started_at >= since AND active_seconds > 0),
    -- The median is the honest one: a single 40-minute session drags the mean
    -- somewhere no real visit has ever been.
    'medianSessionMinutes', (SELECT COALESCE(round((percentile_cont(0.5)
                              WITHIN GROUP (ORDER BY active_seconds) / 60.0)::numeric, 1), 0)
                            FROM public.app_sessions
                           WHERE started_at >= since AND active_seconds > 0),

    'usersWithStreak',   (SELECT count(*) FROM public.user_progress WHERE streak >= 3),
    'streak7Plus',       (SELECT count(*) FROM public.user_progress WHERE streak >= 7),

    'answerAccuracy',    (SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE is_correct) / count(*), 1)
                          END FROM public.question_attempts WHERE answered_at >= since),
    'answerAccuracyPrev',(SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE is_correct) / count(*), 1)
                          END FROM public.question_attempts
                           WHERE answered_at >= prev AND answered_at < since),
    -- First-try accuracy is the difficulty signal; overall accuracy is inflated
    -- by the mastery loop, which lets people retry until they are right.
    'firstTryAccuracy',  (SELECT CASE WHEN count(*) = 0 THEN NULL
                            ELSE round(100.0 * count(*) FILTER (WHERE is_correct) / count(*), 1)
                          END FROM public.question_attempts
                           WHERE answered_at >= since AND attempt_no = 1),
    'answers',           (SELECT count(*) FROM public.question_attempts WHERE answered_at >= since),

    'pwaShare',          (SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE is_pwa) / count(*), 1)
                          END FROM public.app_sessions WHERE started_at >= since),

    -- Activation: an account is only worth something once it finishes a lesson.
    'activatedUsers',    (SELECT count(*) FROM prog WHERE lessons >= 1),
    'activationRate',    (SELECT CASE WHEN (SELECT count(*) FROM auth.users) = 0 THEN 0
                            ELSE round(100.0 * (SELECT count(*) FROM prog WHERE lessons >= 1)
                                       / (SELECT count(*) FROM auth.users), 1) END),
    'neverActivated',    (SELECT count(*) FROM auth.users u
                           WHERE NOT EXISTS (SELECT 1 FROM seen s WHERE s.user_id = u.id)),

    -- Two buckets that translate straight into work: who to nudge now, and who
    -- has probably already gone.
    'atRiskUsers',       (SELECT count(*) FROM seen s JOIN prog p ON p.user_id = s.user_id
                           WHERE p.lessons >= 1
                             AND s.last_at <  now() - interval '7 days'
                             AND s.last_at >= now() - interval '30 days'),
    'dormantUsers',      (SELECT count(*) FROM seen s
                           WHERE s.last_at < now() - interval '30 days'),

    -- Share of this window's actives who showed up on more than one day. One
    -- visit is a trial; two is the start of a habit.
    'returningShare',    (SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE active_days >= 2) / count(*), 1)
                          END FROM cur),
    'avgActiveDays',     (SELECT COALESCE(round(avg(active_days), 1), 0) FROM cur),

    'windowDays',        win,
    'generatedAt',       now()
  ) INTO result;

  RETURN result;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_daily_activity - the trend series, on the unified definition
-- ─────────────────────────────────────────────────────────────────────────────
-- Output columns change (answers is new), so this has to be dropped rather than
-- replaced.

DROP FUNCTION IF EXISTS public.admin_daily_activity(integer);

CREATE FUNCTION public.admin_daily_activity(p_days integer DEFAULT 30)
RETURNS TABLE (
  day          date,
  active_users bigint,
  sessions     bigint,
  minutes      numeric,
  lessons      bigint,
  answers      bigint,
  new_users    bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT GREATEST(COALESCE(p_days, 30), 1) AS d
  ),
  days AS (
    SELECT ((now() AT TIME ZONE 'Africa/Johannesburg')::date - g)::date AS day
      FROM generate_series(0, (SELECT d FROM win) - 1) AS g
  ),
  act AS (
    SELECT (a.at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(DISTINCT a.user_id) AS active_users
      FROM public.admin_activity_since(now() - make_interval(days => (SELECT d FROM win))) a
     GROUP BY 1
  ),
  sess AS (
    SELECT (started_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(*)                             AS sessions,
           round(sum(active_seconds) / 60.0, 1) AS minutes
      FROM public.app_sessions
     WHERE started_at >= now() - make_interval(days => (SELECT d FROM win))
     GROUP BY 1
  ),
  les AS (
    SELECT (answered_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(DISTINCT (user_id::text || lesson_id)) AS lessons,
           count(*)                                     AS answers
      FROM public.question_attempts
     WHERE answered_at >= now() - make_interval(days => (SELECT d FROM win))
     GROUP BY 1
  ),
  signups AS (
    SELECT (created_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(*) AS new_users
      FROM auth.users
     WHERE created_at >= now() - make_interval(days => (SELECT d FROM win))
     GROUP BY 1
  )
  SELECT d.day,
         COALESCE(a.active_users, 0),
         COALESCE(s.sessions, 0),
         COALESCE(s.minutes, 0),
         COALESCE(l.lessons, 0),
         COALESCE(l.answers, 0),
         COALESCE(n.new_users, 0)
    FROM days d
    LEFT JOIN act     a ON a.day = d.day
    LEFT JOIN sess    s ON s.day = d.day
    LEFT JOIN les     l ON l.day = d.day
    LEFT JOIN signups n ON n.day = d.day
   ORDER BY d.day;
$$;


-- A jsonb value read out of to_jsonb(row) is only an array if the column exists
-- and holds one. This keeps a missing or NULL column from turning into a
-- jsonb_array_length() error two lines later.
CREATE OR REPLACE FUNCTION public.admin_jsonb_array(j jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$ SELECT CASE WHEN jsonb_typeof(j) = 'array' THEN j ELSE '[]'::jsonb END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_user_detail - THE BUG FIX
-- ─────────────────────────────────────────────────────────────────────────────
-- The drill-down drawer returned 'Could not load "user"' for every single user.
-- Root cause: the old version selected user_progress.level / hearts /
-- perfect_lessons_total by name. Several user_progress columns in production
-- were added directly in the Supabase dashboard rather than through a migration
-- in this repo, so the local schema and the live one disagree - and because the
-- function was plpgsql, Postgres never checked those names at CREATE time. It
-- threw on the first real call instead.
--
-- The fix is to stop naming optional columns in SQL. Reading them out of
-- to_jsonb(row) makes a missing column yield NULL rather than an exception, so
-- this function is correct against either schema and cannot break again the
-- next time a column is added or renamed out-of-band.

CREATE OR REPLACE FUNCTION public.admin_user_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH usr AS (
    SELECT u.id, u.email::text AS email, u.created_at, u.last_sign_in_at
      FROM auth.users u WHERE u.id = p_user_id
  ),
  prof AS (
    SELECT to_jsonb(p) AS j FROM public.profiles p WHERE p.user_id = p_user_id
  ),
  prog AS (
    SELECT to_jsonb(up) AS j FROM public.user_progress up WHERE up.user_id = p_user_id
  ),
  sess AS (
    SELECT COALESCE(round(sum(active_seconds) / 60.0, 1), 0)           AS total_minutes,
           count(*)                                                   AS sessions,
           min(started_at)                                            AS first_seen,
           max(last_seen_at)                                          AS last_seen,
           COALESCE(round((avg(active_seconds) / 60.0)::numeric, 1),0) AS avg_minutes,
           COALESCE(jsonb_agg(DISTINCT device_type)
                    FILTER (WHERE device_type IS NOT NULL), '[]'::jsonb) AS devices,
           COALESCE(bool_or(is_pwa), false)                            AS uses_pwa
      FROM public.app_sessions WHERE user_id = p_user_id
  ),
  acc AS (
    SELECT count(*)                                  AS answered,
           count(*) FILTER (WHERE is_correct)        AS correct,
           count(*) FILTER (WHERE attempt_no = 1)    AS first_try_n,
           count(*) FILTER (WHERE attempt_no = 1 AND is_correct) AS first_try_ok,
           min(answered_at)                          AS first_answer,
           max(answered_at)                          AS last_answer
      FROM public.question_attempts WHERE user_id = p_user_id
  ),
  last_any AS (
    SELECT max(at) AS at FROM public.admin_activity_since('epoch'::timestamptz)
     WHERE user_id = p_user_id
  )
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
               'userId',     u.id,
               'email',      u.email,
               'username',   (SELECT j->>'username'   FROM prof),
               'fullName',   (SELECT j->>'full_name'  FROM prof),
               'signedUp',   u.created_at,
               'lastSignIn', u.last_sign_in_at,
               'goal',       (SELECT j->>'goal'       FROM prof),
               'ageRange',   (SELECT j->>'age_range'  FROM prof),
               'isAdmin',    COALESCE((SELECT (j->>'is_admin')::boolean FROM prof), false)
             )
        FROM usr u
    ),
    'progress', (
      SELECT jsonb_build_object(
               'xp',            COALESCE((j->>'xp')::int, 0),
               'level',         COALESCE((j->>'level')::int, 1),
               'streak',        COALESCE((j->>'streak')::int, 0),
               'longestStreak', COALESCE((j->>'longest_streak')::int, 0),
               'lessonsDone',   jsonb_array_length(public.admin_jsonb_array(j->'completed_lessons')),
               'perfectTotal',  COALESCE((j->>'perfect_lessons_total')::int, 0),
               'hearts',        (j->>'hearts')::int,
               'lastActivity',  j->>'last_activity_date',
               'completedLessons', public.admin_jsonb_array(j->'completed_lessons')
             )
        FROM prog
    ),
    'usage', (
      SELECT jsonb_build_object(
               'totalMinutes', s.total_minutes,
               'sessions',     s.sessions,
               'firstSeen',    s.first_seen,
               'lastSeen',     s.last_seen,
               'avgMinutes',   s.avg_minutes,
               'devices',      s.devices,
               'usesPwa',      s.uses_pwa
             )
        FROM sess s
    ),
    'accuracy', (
      SELECT jsonb_build_object(
               'answered',    a.answered,
               'correct',     a.correct,
               'pct',         CASE WHEN a.answered = 0 THEN NULL
                                   ELSE round(100.0 * a.correct / a.answered, 1) END,
               'firstTryPct', CASE WHEN a.first_try_n = 0 THEN NULL
                                   ELSE round(100.0 * a.first_try_ok / a.first_try_n, 1) END,
               'firstAnswer', a.first_answer,
               'lastAnswer',  a.last_answer
             )
        FROM acc a
    ),
    'features', (
      SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'events')::int DESC), '[]'::jsonb)
        FROM (
          SELECT jsonb_build_object(
                   'feature',  feature,
                   'events',   count(*),
                   'lastUsed', max(occurred_at)
                 ) AS x
            FROM public.feature_events
           WHERE user_id = p_user_id
           GROUP BY feature
        ) t
    ),
    -- Minutes and answers on the same axis: a day with answers but no minutes
    -- means the heartbeat missed the visit, which is worth being able to see.
    'dailyMinutes', (
      SELECT COALESCE(jsonb_agg(
               jsonb_build_object('day', g.d, 'minutes', g.m, 'answers', g.a) ORDER BY g.d
             ), '[]'::jsonb)
        FROM (
          SELECT d AS d, sum(m) AS m, sum(a) AS a
            FROM (
              SELECT (started_at AT TIME ZONE 'Africa/Johannesburg')::date AS d,
                     round(sum(active_seconds) / 60.0, 1)                  AS m,
                     0::bigint                                             AS a
                FROM public.app_sessions
               WHERE user_id = p_user_id
                 AND started_at >= now() - interval '60 days'
               GROUP BY 1
              UNION ALL
              SELECT (answered_at AT TIME ZONE 'Africa/Johannesburg')::date,
                     0::numeric,
                     count(*)
                FROM public.question_attempts
               WHERE user_id = p_user_id
                 AND answered_at >= now() - interval '60 days'
               GROUP BY 1
            ) u
           GROUP BY d
        ) g
    ),
    -- Which courses this person actually works in, and how they are coping.
    'courses', (
      SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'attempts')::int DESC), '[]'::jsonb)
        FROM (
          SELECT jsonb_build_object(
                   'courseId',    course_id,
                   'lessons',     count(DISTINCT lesson_id),
                   'attempts',    count(*),
                   'firstTryPct', CASE WHEN count(*) FILTER (WHERE attempt_no = 1) = 0 THEN NULL
                                       ELSE round(100.0 * count(*) FILTER (WHERE attempt_no = 1 AND is_correct)
                                                  / count(*) FILTER (WHERE attempt_no = 1), 1) END,
                   'lastSeen',    max(answered_at)
                 ) AS x
            FROM public.question_attempts
           WHERE user_id = p_user_id
           GROUP BY course_id
        ) t
    ),
    'recentEvents', (
      SELECT COALESCE(jsonb_agg(x), '[]'::jsonb)
        FROM (
          SELECT jsonb_build_object(
                   'event',   event,
                   'feature', feature,
                   'props',   props,
                   'at',      occurred_at
                 ) AS x
            FROM public.feature_events
           WHERE user_id = p_user_id
           ORDER BY occurred_at DESC
           LIMIT 60
        ) t
    ),
    'lastActive',   (SELECT at FROM last_any),
    'daysSinceSeen',(SELECT CASE WHEN at IS NULL THEN NULL
                                 ELSE EXTRACT(day FROM now() - at)::int END FROM last_any)
  )
  FROM usr;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_activation_funnel - where new accounts stall
-- ─────────────────────────────────────────────────────────────────────────────
-- Reads top to bottom as a story: they signed up, did they open it, did they
-- try a question, did they finish a lesson, did they come back, did it stick.
-- The biggest single drop is almost always where the next week of work is.

CREATE OR REPLACE FUNCTION public.admin_activation_funnel(p_days integer DEFAULT 90)
RETURNS TABLE (
  step      integer,
  step_key  text,
  label     text,
  hint      text,
  users     bigint,
  pct       numeric,
  drop_pct  numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cohort AS (
    SELECT u.id AS user_id
      FROM auth.users u
     WHERE u.created_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1))
  ),
  act AS (
    SELECT a.user_id,
           count(DISTINCT (a.at AT TIME ZONE 'Africa/Johannesburg')::date) AS active_days
      FROM public.admin_activity_since('epoch'::timestamptz) a
      JOIN cohort c ON c.user_id = a.user_id
     GROUP BY a.user_id
  ),
  ans AS (
    SELECT DISTINCT q.user_id
      FROM public.question_attempts q JOIN cohort c ON c.user_id = q.user_id
  ),
  prog AS (
    SELECT up.user_id,
           COALESCE(cardinality(up.completed_lessons), 0) AS lessons,
           GREATEST(COALESCE(up.streak, 0), COALESCE(up.longest_streak, 0)) AS best_streak
      FROM public.user_progress up
      JOIN cohort c ON c.user_id = up.user_id
  ),
  -- One row per person with every flag on it, so each step below can be a
  -- strict subset of the one above. A funnel whose steps are not nested reads
  -- as a bar chart that happens to slope, and invites exactly the wrong
  -- conclusion when a later bar comes out taller than an earlier one.
  people AS (
    SELECT c.user_id,
           COALESCE(a.active_days, 0)  AS active_days,
           (n.user_id IS NOT NULL)     AS answered,
           COALESCE(p.lessons, 0)      AS lessons,
           COALESCE(p.best_streak, 0)  AS best_streak
      FROM cohort c
      LEFT JOIN act  a ON a.user_id = c.user_id
      LEFT JOIN ans  n ON n.user_id = c.user_id
      LEFT JOIN prog p ON p.user_id = c.user_id
  ),
  steps AS (
    SELECT 1 AS step, 'signup' AS step_key, 'Created an account' AS label,
           'Everyone who signed up in this window.' AS hint,
           (SELECT count(*) FROM people) AS users
    UNION ALL
    SELECT 2, 'opened', 'Opened the app',
           'Had any tracked activity at all after signing up.',
           (SELECT count(*) FROM people WHERE active_days >= 1)
    UNION ALL
    SELECT 3, 'answered', 'Answered a question',
           'Engaged with the content rather than just looking around.',
           (SELECT count(*) FROM people WHERE active_days >= 1 AND answered)
    UNION ALL
    SELECT 4, 'first_lesson', 'Finished a lesson',
           'The activation moment. An account below this line is worth nothing yet.',
           (SELECT count(*) FROM people WHERE active_days >= 1 AND answered AND lessons >= 1)
    UNION ALL
    SELECT 5, 'returned', 'Came back another day',
           'Active on two or more separate days. One visit is a trial; two is interest.',
           (SELECT count(*) FROM people
             WHERE active_days >= 2 AND answered AND lessons >= 1)
    UNION ALL
    SELECT 6, 'three_lessons', 'Finished three lessons',
           'Past the novelty. Three lessons is where someone has actually seen what you offer.',
           (SELECT count(*) FROM people
             WHERE active_days >= 2 AND answered AND lessons >= 3)
    UNION ALL
    SELECT 7, 'habit', 'Built a 3-day streak',
           'The habit threshold. These are the users who stay.',
           (SELECT count(*) FROM people
             WHERE active_days >= 2 AND answered AND lessons >= 3 AND best_streak >= 3)
  ),
  ranked AS (
    SELECT s.*,
           first_value(s.users) OVER (ORDER BY s.step) AS start_n,
           lag(s.users)         OVER (ORDER BY s.step) AS prev_n
      FROM steps s
  )
  SELECT step, step_key, label, hint, users,
         round(100.0 * users / NULLIF(start_n, 0), 1) AS pct,
         CASE WHEN prev_n IS NULL OR prev_n = 0 THEN NULL
              ELSE round(100.0 * (prev_n - users) / prev_n, 1) END AS drop_pct
    FROM ranked
   ORDER BY step;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_engagement_segments - everyone, sorted into buckets you can act on
-- ─────────────────────────────────────────────────────────────────────────────
-- Each segment maps to a different move: protect the champions, convert the
-- regulars, win back the slipping, and stop paying attention to the lost.

CREATE OR REPLACE FUNCTION public.admin_engagement_segments()
RETURNS TABLE (
  sort_order  integer,
  segment     text,
  label       text,
  action      text,
  users       bigint,
  pct         numeric,
  avg_minutes numeric,
  avg_lessons numeric,
  avg_days_since numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH seen AS (
    SELECT a.user_id, max(a.at) AS last_at
      FROM public.admin_activity_since('epoch'::timestamptz) a
     GROUP BY a.user_id
  ),
  mins AS (
    SELECT user_id, round(sum(active_seconds) / 60.0, 1) AS minutes
      FROM public.app_sessions GROUP BY user_id
  ),
  base AS (
    SELECT u.id AS user_id,
           COALESCE(cardinality(up.completed_lessons), 0) AS lessons,
           COALESCE(up.streak, 0)                         AS streak,
           COALESCE(m.minutes, 0)                         AS minutes,
           s.last_at,
           CASE WHEN s.last_at IS NULL THEN NULL
                ELSE EXTRACT(day FROM now() - s.last_at)::int END AS days_since
      FROM auth.users u
      LEFT JOIN public.user_progress up ON up.user_id = u.id
      LEFT JOIN seen s                  ON s.user_id  = u.id
      LEFT JOIN mins m                  ON m.user_id  = u.id
  ),
  seg AS (
    SELECT b.*,
           CASE
             WHEN b.last_at IS NULL                              THEN 'never_started'
             WHEN b.days_since <= 3 AND (b.streak >= 3 OR b.lessons >= 5) THEN 'champion'
             WHEN b.days_since <= 7                              THEN 'regular'
             WHEN b.days_since <= 21                             THEN 'slipping'
             WHEN b.days_since <= 60                             THEN 'dormant'
             ELSE                                                     'lost'
           END AS segment
      FROM base b
  ),
  meta(segment, sort_order, label, action) AS (
    VALUES
      ('champion',      1, 'Champions',        'Protect them. Ask these people for reviews, referrals and feature feedback.'),
      ('regular',       2, 'Regulars',         'Deepen the habit: streak nudges, a next-course prompt, a weekly goal.'),
      ('slipping',      3, 'Slipping away',    'Win back now, while they still remember you. Personal beats automated.'),
      ('dormant',       4, 'Dormant',          'One good re-entry point - a new course or a streak reset offer.'),
      ('lost',          5, 'Lost',             'Do not spend on these. Learn from why they left instead.'),
      ('never_started', 6, 'Never started',    'Signed up and never did anything. This is an onboarding problem, not a retention one.')
  )
  -- meta on the left so an empty bucket still reports as zero. A segment that
  -- silently disappears from the chart is worse than one that reads 0 - you
  -- stop noticing it is empty.
  SELECT m.sort_order, m.segment, m.label, m.action,
         count(s.user_id) AS users,
         round(100.0 * count(s.user_id) / NULLIF((SELECT count(*) FROM seg), 0), 1) AS pct,
         round(avg(s.minutes), 1)    AS avg_minutes,
         round(avg(s.lessons), 1)    AS avg_lessons,
         round(avg(s.days_since), 1) AS avg_days_since
    FROM meta m
    LEFT JOIN seg s ON s.segment = m.segment
   GROUP BY m.sort_order, m.segment, m.label, m.action
   ORDER BY m.sort_order;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_retention_matrix - the cohort heatmap
-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly signup cohorts down the side, weeks-since-signup across the top. Cells
-- a cohort has not lived long enough to have are omitted, never zeroed.

CREATE OR REPLACE FUNCTION public.admin_retention_matrix(p_weeks integer DEFAULT 12)
RETURNS TABLE (
  cohort_week date,
  cohort_size bigint,
  week_index  integer,
  retained    bigint,
  pct         numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH w AS (SELECT LEAST(GREATEST(COALESCE(p_weeks, 12), 2), 26) AS n),
  cohorts AS (
    SELECT u.id AS user_id,
           date_trunc('week', (u.created_at AT TIME ZONE 'Africa/Johannesburg'))::date AS cw
      FROM auth.users u, w
     WHERE u.created_at >= now() - make_interval(days => w.n * 7)
  ),
  sizes AS (SELECT cw, count(*) AS n FROM cohorts GROUP BY cw),
  acts AS (
    SELECT c.cw,
           a.user_id,
           floor(
             EXTRACT(epoch FROM ((a.at AT TIME ZONE 'Africa/Johannesburg') - c.cw::timestamp)) / 604800
           )::int AS wi
      FROM cohorts c
      JOIN public.admin_activity_since(now() - make_interval(days => (SELECT n FROM w) * 7)) a
        ON a.user_id = c.user_id
  ),
  grid AS (
    SELECT s.cw, s.n, g.wi
      FROM sizes s, w, generate_series(0, w.n - 1) AS g(wi)
     WHERE (now() AT TIME ZONE 'Africa/Johannesburg')::date >= s.cw + (g.wi * 7)
  )
  SELECT grid.cw, grid.n, grid.wi,
         count(DISTINCT a.user_id) AS retained,
         round(100.0 * count(DISTINCT a.user_id) / NULLIF(grid.n, 0), 1) AS pct
    FROM grid
    LEFT JOIN acts a ON a.cw = grid.cw AND a.wi = grid.wi
   GROUP BY grid.cw, grid.n, grid.wi
   ORDER BY grid.cw DESC, grid.wi;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_activity_clock - when your users are actually awake
-- ─────────────────────────────────────────────────────────────────────────────
-- Day of week x hour of day, in SAST. This is the answer to "when should the
-- push notification go out" - a question currently answered by guessing.

CREATE OR REPLACE FUNCTION public.admin_activity_clock(p_days integer DEFAULT 90)
RETURNS TABLE (
  dow    integer,
  hour   integer,
  events bigint,
  users  bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(isodow FROM (a.at AT TIME ZONE 'Africa/Johannesburg'))::int AS dow,
         EXTRACT(hour   FROM (a.at AT TIME ZONE 'Africa/Johannesburg'))::int AS hour,
         count(*)                  AS events,
         count(DISTINCT a.user_id) AS users
    FROM public.admin_activity_since(
           now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1))) a
   GROUP BY 1, 2
   ORDER BY 1, 2;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_at_risk_users - the win-back list, ranked by what is at stake
-- ─────────────────────────────────────────────────────────────────────────────
-- Only people who actually got going (>= 1 lesson) and have since gone quiet.
-- Ranked by value at risk x urgency, so the top of the list is where a single
-- message is worth the most. Someone 40 days gone with 30 lessons outranks
-- someone 5 days gone with one.

CREATE OR REPLACE FUNCTION public.admin_at_risk_users(p_limit integer DEFAULT 50)
RETURNS TABLE (
  user_id        uuid,
  email          text,
  username       text,
  full_name      text,
  lessons_done   integer,
  xp             integer,
  streak         integer,
  longest_streak integer,
  total_minutes  numeric,
  last_seen      timestamptz,
  days_since     integer,
  risk           text,
  risk_score     numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH seen AS (
    SELECT a.user_id, max(a.at) AS last_at
      FROM public.admin_activity_since('epoch'::timestamptz) a
     GROUP BY a.user_id
  ),
  mins AS (
    SELECT user_id, round(sum(active_seconds) / 60.0, 1) AS minutes
      FROM public.app_sessions GROUP BY user_id
  ),
  base AS (
    SELECT u.id AS user_id,
           u.email::text AS email,
           p.username,
           p.full_name,
           COALESCE(cardinality(up.completed_lessons), 0) AS lessons_done,
           COALESCE(up.xp, 0)             AS xp,
           COALESCE(up.streak, 0)         AS streak,
           COALESCE(up.longest_streak, 0) AS longest_streak,
           COALESCE(m.minutes, 0)         AS total_minutes,
           s.last_at,
           EXTRACT(day FROM now() - s.last_at)::int AS days_since
      FROM auth.users u
      JOIN seen s                       ON s.user_id  = u.id
      LEFT JOIN public.profiles p       ON p.user_id  = u.id
      LEFT JOIN public.user_progress up ON up.user_id = u.id
      LEFT JOIN mins m                  ON m.user_id  = u.id
     WHERE s.last_at < now() - interval '4 days'
  )
  SELECT b.user_id, b.email, b.username, b.full_name,
         b.lessons_done, b.xp, b.streak, b.longest_streak, b.total_minutes,
         b.last_at, b.days_since,
         CASE WHEN b.days_since <= 14 THEN 'Slipping'
              WHEN b.days_since <= 30 THEN 'At risk'
              ELSE                         'Probably gone' END AS risk,
         round(
           (b.lessons_done * 2 + b.xp / 50.0 + b.longest_streak * 3 + b.total_minutes / 10.0)
           * CASE WHEN b.days_since <= 14 THEN 1.0
                  WHEN b.days_since <= 30 THEN 0.7
                  ELSE 0.35 END
         , 1) AS risk_score
    FROM base b
   WHERE b.lessons_done >= 1
   ORDER BY risk_score DESC, b.days_since ASC
   LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 300);
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_feature_lift - which features correlate with coming back
-- ─────────────────────────────────────────────────────────────────────────────
-- For every active user in the window: did they touch this feature, and did
-- they return on a second day? The gap between the two return rates is the
-- closest this data gets to "does this feature keep people".
--
-- CORRELATION, NOT CAUSATION - and worth saying out loud because it is the one
-- number here most likely to be over-read. Engaged people try more features, so
-- a positive lift can be the habit causing the feature use rather than the
-- reverse. Treat a big lift as a candidate for an experiment, not a conclusion.

CREATE OR REPLACE FUNCTION public.admin_feature_lift(p_days integer DEFAULT 90)
RETURNS TABLE (
  feature          text,
  users_used       bigint,
  users_not        bigint,
  return_used_pct  numeric,
  return_not_pct   numeric,
  lift_pts         numeric,
  avg_days_used    numeric,
  avg_days_not     numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH since AS (
    SELECT now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1)) AS t
  ),
  act AS (
    SELECT a.user_id,
           count(DISTINCT (a.at AT TIME ZONE 'Africa/Johannesburg')::date) AS active_days
      FROM public.admin_activity_since((SELECT t FROM since)) a
     GROUP BY a.user_id
  ),
  used AS (
    SELECT DISTINCT fe.feature, fe.user_id
      FROM public.feature_events fe, since
     WHERE fe.occurred_at >= since.t
  ),
  feats AS (SELECT DISTINCT feature FROM used)
  SELECT f.feature,
         count(*) FILTER (WHERE u.user_id IS NOT NULL) AS users_used,
         count(*) FILTER (WHERE u.user_id IS NULL)     AS users_not,
         round(100.0 * count(*) FILTER (WHERE u.user_id IS NOT NULL AND a.active_days >= 2)
               / NULLIF(count(*) FILTER (WHERE u.user_id IS NOT NULL), 0), 1) AS return_used_pct,
         round(100.0 * count(*) FILTER (WHERE u.user_id IS NULL AND a.active_days >= 2)
               / NULLIF(count(*) FILTER (WHERE u.user_id IS NULL), 0), 1)     AS return_not_pct,
         round(
           COALESCE(100.0 * count(*) FILTER (WHERE u.user_id IS NOT NULL AND a.active_days >= 2)
                    / NULLIF(count(*) FILTER (WHERE u.user_id IS NOT NULL), 0), 0)
         - COALESCE(100.0 * count(*) FILTER (WHERE u.user_id IS NULL AND a.active_days >= 2)
                    / NULLIF(count(*) FILTER (WHERE u.user_id IS NULL), 0), 0)
         , 1) AS lift_pts,
         round(avg(a.active_days) FILTER (WHERE u.user_id IS NOT NULL), 1) AS avg_days_used,
         round(avg(a.active_days) FILTER (WHERE u.user_id IS NULL), 1)     AS avg_days_not
    FROM feats f
    CROSS JOIN act a
    LEFT JOIN used u ON u.feature = f.feature AND u.user_id = a.user_id
   GROUP BY f.feature
   ORDER BY lift_pts DESC NULLS LAST;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_question_offenders - the individual questions to rewrite
-- ─────────────────────────────────────────────────────────────────────────────
-- admin_content_quality works at lesson level, which tells you a lesson is
-- broken but not which line to edit. This goes down to the variant, so the
-- output is an edit list rather than a research project.

CREATE OR REPLACE FUNCTION public.admin_question_offenders(
  p_days    integer DEFAULT 180,
  p_min_att integer DEFAULT 4
)
RETURNS TABLE (
  course_id     text,
  lesson_id     text,
  slot_id       text,
  variant_id    text,
  concept_id    text,
  attempts      bigint,
  learners      bigint,
  first_try_pct numeric,
  overall_pct   numeric,
  avg_attempts  numeric,
  verdict       text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (
    SELECT *
      FROM public.question_attempts
     WHERE answered_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 180), 1))
  ),
  agg AS (
    SELECT q.course_id, q.lesson_id, q.slot_id, q.variant_id,
           max(q.concept_id) AS concept_id,
           count(*)                             AS attempts,
           count(DISTINCT q.user_id)            AS learners,
           count(*) FILTER (WHERE q.attempt_no = 1) AS first_n,
           count(*) FILTER (WHERE q.attempt_no = 1 AND q.is_correct) AS first_ok,
           count(*) FILTER (WHERE q.is_correct) AS ok,
           round(avg(q.attempt_no), 2)          AS avg_attempts
      FROM q
     GROUP BY q.course_id, q.lesson_id, q.slot_id, q.variant_id
    HAVING count(*) >= GREATEST(COALESCE(p_min_att, 4), 1)
  )
  SELECT a.course_id, a.lesson_id, a.slot_id, a.variant_id, a.concept_id,
         a.attempts, a.learners,
         CASE WHEN a.first_n = 0 THEN NULL
              ELSE round(100.0 * a.first_ok / a.first_n, 1) END AS first_try_pct,
         round(100.0 * a.ok / NULLIF(a.attempts, 0), 1)         AS overall_pct,
         a.avg_attempts,
         CASE
           WHEN a.first_n = 0                                    THEN 'Not enough first tries'
           WHEN 100.0 * a.first_ok / a.first_n < 25              THEN 'Broken - check the wording or the marked answer'
           WHEN 100.0 * a.first_ok / a.first_n < 45              THEN 'Too hard - rewrite'
           WHEN 100.0 * a.first_ok / a.first_n > 97              THEN 'Too easy - free marks'
           WHEN 100.0 * a.first_ok / a.first_n > 90              THEN 'Easy'
           ELSE                                                       'Well pitched'
         END AS verdict
    FROM agg a
   ORDER BY (CASE WHEN a.first_n = 0 THEN 999 ELSE 100.0 * a.first_ok / a.first_n END) ASC,
            a.attempts DESC
   LIMIT 120;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_growth_accounting - is the active base actually growing?
-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly: new + resurrected + retained in, churned out. Headline user counts
-- always go up because accounts never disappear; this is the number that tells
-- you whether the living part of the base is growing or being replaced.

CREATE OR REPLACE FUNCTION public.admin_growth_accounting(p_weeks integer DEFAULT 12)
RETURNS TABLE (
  week        date,
  active      bigint,
  new_users   bigint,
  retained    bigint,
  resurrected bigint,
  churned     bigint,
  net         bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH w AS (SELECT LEAST(GREATEST(COALESCE(p_weeks, 12), 2), 26) AS n),
  wk AS (
    SELECT a.user_id,
           date_trunc('week', (a.at AT TIME ZONE 'Africa/Johannesburg'))::date AS week
      FROM public.admin_activity_since(
             now() - make_interval(days => ((SELECT n FROM w) + 1) * 7)) a
     GROUP BY 1, 2
  ),
  -- "New" is the signup week, not the first tracked event: tracking started
  -- long after the first users did, so first-event weeks would relabel a year
  -- of existing users as brand new.
  signup AS (
    SELECT u.id AS user_id,
           date_trunc('week', (u.created_at AT TIME ZONE 'Africa/Johannesburg'))::date AS week
      FROM auth.users u
  ),
  weeks AS (
    SELECT DISTINCT week FROM wk
  ),
  flags AS (
    SELECT c.week,
           c.user_id,
           (p.user_id IS NOT NULL) AS was_active_prev,
           (e.week = c.week) AS is_new
      FROM wk c
      LEFT JOIN wk p ON p.user_id = c.user_id AND p.week = c.week - 7
      LEFT JOIN signup e ON e.user_id = c.user_id
  ),
  gone AS (
    SELECT p.week + 7 AS week, count(*) AS churned
      FROM wk p
      LEFT JOIN wk c ON c.user_id = p.user_id AND c.week = p.week + 7
     WHERE c.user_id IS NULL
     GROUP BY 1
  )
  SELECT ws.week,
         count(f.user_id)                                              AS active,
         count(*) FILTER (WHERE f.is_new)                              AS new_users,
         count(*) FILTER (WHERE f.was_active_prev AND NOT f.is_new)    AS retained,
         count(*) FILTER (WHERE NOT f.was_active_prev AND NOT f.is_new) AS resurrected,
         COALESCE(g.churned, 0)                                        AS churned,
         count(f.user_id) - COALESCE(g.churned, 0)                     AS net
    FROM weeks ws
    LEFT JOIN flags f ON f.week = ws.week
    LEFT JOIN gone  g ON g.week = ws.week
   -- The earliest bucket exists only to give the second one a "last week" to
   -- compare against; reporting it would show the whole base as resurrected.
   WHERE ws.week > (SELECT min(week) FROM wk)
   GROUP BY ws.week, g.churned
   ORDER BY ws.week;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_streak_distribution - habit formation at a glance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_streak_distribution()
RETURNS TABLE (
  sort_order integer,
  bucket     text,
  users      bigint,
  pct        numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (
    SELECT CASE
             WHEN COALESCE(up.streak, 0) = 0            THEN 1
             WHEN COALESCE(up.streak, 0) <= 2           THEN 2
             WHEN COALESCE(up.streak, 0) <= 6           THEN 3
             WHEN COALESCE(up.streak, 0) <= 13          THEN 4
             WHEN COALESCE(up.streak, 0) <= 29          THEN 5
             ELSE                                            6
           END AS sort_order
      FROM auth.users u
      LEFT JOIN public.user_progress up ON up.user_id = u.id
  ),
  labels(sort_order, bucket) AS (
    VALUES (1, 'No streak'), (2, '1-2 days'), (3, '3-6 days'),
           (4, '1-2 weeks'), (5, '2-4 weeks'), (6, '30+ days')
  )
  SELECT l.sort_order, l.bucket,
         count(b.sort_order) AS users,
         round(100.0 * count(b.sort_order) / NULLIF((SELECT count(*) FROM b), 0), 1) AS pct
    FROM labels l
    LEFT JOIN b ON b.sort_order = l.sort_order
   GROUP BY l.sort_order, l.bucket
   ORDER BY l.sort_order;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Lock everything down again
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER functions are granted to PUBLIC by default, which on these
-- would hand any signed-in user the entire user base. service_role is not
-- subject to these grants, so revoking here leaves the admin API route as the
-- only possible caller.

DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname LIKE 'admin\_%'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated;', fn.sig);
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Smoke test - fail this migration, not the dashboard
-- ─────────────────────────────────────────────────────────────────────────────
-- The bug this migration fixes was invisible at deploy time and only appeared
-- when a human clicked a row, because plpgsql resolves column names at runtime.
-- Executing every function once here closes that gap: if any of them references
-- something that does not exist in THIS database, the migration aborts with the
-- real Postgres error instead of shipping a broken panel.

DO $$
DECLARE
  sample uuid;
  n      integer;
BEGIN
  PERFORM public.admin_overview(30);
  SELECT count(*) INTO n FROM public.admin_daily_activity(7);
  SELECT count(*) INTO n FROM public.admin_activation_funnel(90);
  SELECT count(*) INTO n FROM public.admin_engagement_segments();
  SELECT count(*) INTO n FROM public.admin_retention_matrix(12);
  SELECT count(*) INTO n FROM public.admin_activity_clock(90);
  SELECT count(*) INTO n FROM public.admin_at_risk_users(10);
  SELECT count(*) INTO n FROM public.admin_feature_lift(90);
  SELECT count(*) INTO n FROM public.admin_question_offenders(180, 1);
  SELECT count(*) INTO n FROM public.admin_growth_accounting(12);
  SELECT count(*) INTO n FROM public.admin_streak_distribution();

  -- The one that was broken. Run it against a real user if there is one, so the
  -- test exercises the same path the drawer does.
  SELECT id INTO sample FROM auth.users ORDER BY created_at DESC LIMIT 1;
  IF sample IS NOT NULL THEN
    PERFORM public.admin_user_detail(sample);
  END IF;

  RAISE NOTICE 'admin analytics v2: all functions executed cleanly';
END;
$$;
