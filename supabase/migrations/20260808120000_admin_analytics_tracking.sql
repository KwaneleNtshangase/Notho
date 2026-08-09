-- ============================================================================
-- Admin analytics: session + feature-usage tracking
-- ----------------------------------------------------------------------------
-- WHY THIS EXISTS
--   Lesson/XP/streak data already lives in user_progress, but "how long is a
--   user actually in the app" and "which features do they touch" only existed
--   in PostHog cloud, where it cannot be joined per-user and is subject to a
--   retention window. Funders and competitions ask for exactly those numbers,
--   so they need to live in our own Postgres where we can query and export them.
--
-- WHAT IT ADDS
--   1. app_sessions   - one row per app session, with ACTIVE seconds accrued by
--                       client heartbeats (not wall-clock tab-open time).
--   2. feature_events - one row per meaningful user action, tagged with the
--                       feature area it belongs to.
--   3. Write RPCs     - heartbeat is a SECURITY DEFINER RPC that derives the
--                       user from auth.uid() and never trusts a client-supplied
--                       user id, and caps per-call seconds so time cannot be
--                       inflated by a tampered client.
--
-- PRIVACY (POPIA)
--   Both tables are user-scoped and RLS-protected. Users can write their own
--   rows and read their own rows; nobody can read anyone else's. The admin
--   read functions further down are SECURITY DEFINER and have EXECUTE revoked
--   from anon + authenticated, so they are callable ONLY by service-role
--   connections (our admin API routes, which gate on profiles.is_admin first).
--   Nothing here stores message content, financial amounts, or free text - only
--   event names, feature areas, and durations.
--
-- ADDITIVE + NON-DESTRUCTIVE: creates new objects only. No existing table is
-- altered, no data is rewritten, no policy on an existing table is changed.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. app_sessions
-- ─────────────────────────────────────────────────────────────────────────────
-- The id is client-generated (crypto.randomUUID) so the client can keep
-- heartbeating the same row without a round-trip to learn its own session id.
-- A hostile client can only ever forge a session id for ITSELF, because the
-- heartbeat RPC stamps user_id from auth.uid().

CREATE TABLE IF NOT EXISTS public.app_sessions (
  id             uuid        PRIMARY KEY,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  -- Sum of heartbeat deltas. This is time the tab was VISIBLE and the user was
  -- not idle, which is the number worth reporting. Wall-clock would count a
  -- forgotten background tab as engagement.
  active_seconds integer     NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
  entry_route    text,
  last_route     text,
  device_type    text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  is_pwa         boolean     NOT NULL DEFAULT false
);

COMMENT ON TABLE public.app_sessions IS
  'One row per app session. active_seconds accrues from client heartbeats and '
  'represents visible, non-idle time - not wall-clock tab-open time.';

CREATE INDEX IF NOT EXISTS app_sessions_user_started_idx
  ON public.app_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS app_sessions_started_idx
  ON public.app_sessions (started_at DESC);

ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own sessions" ON public.app_sessions;
CREATE POLICY "Users read own sessions" ON public.app_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE policy for end users on purpose: all writes go through the
-- record_session_heartbeat RPC below, which controls the seconds cap.


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. feature_events
-- ─────────────────────────────────────────────────────────────────────────────
-- bigserial rather than uuid: this is the highest-volume table in the schema
-- and a bigint PK keeps the index small and the inserts cheap.

CREATE TABLE IF NOT EXISTS public.feature_events (
  id          bigserial   PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  uuid,
  -- Coarse product area, used for the "which features earn their keep" view.
  feature     text        NOT NULL,
  -- Raw analytics event name, mirrored from src/lib/analytics.ts.
  event       text        NOT NULL,
  -- Low-cardinality, non-sensitive context only (courseId, lessonId, etc).
  props       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.feature_events IS
  'Per-action feature usage log mirrored from src/lib/analytics.ts. '
  'Stores event names and low-cardinality context only - never message '
  'content, transaction amounts, or free text.';

CREATE INDEX IF NOT EXISTS feature_events_user_time_idx
  ON public.feature_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS feature_events_feature_time_idx
  ON public.feature_events (feature, occurred_at DESC);
CREATE INDEX IF NOT EXISTS feature_events_event_time_idx
  ON public.feature_events (event, occurred_at DESC);
CREATE INDEX IF NOT EXISTS feature_events_time_idx
  ON public.feature_events (occurred_at DESC);

ALTER TABLE public.feature_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own feature events" ON public.feature_events;
CREATE POLICY "Users insert own feature events" ON public.feature_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own feature events" ON public.feature_events;
CREATE POLICY "Users read own feature events" ON public.feature_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Explicit grants. RLS policies only narrow an existing privilege - without a
-- table grant the insert fails with "permission denied" before any policy is
-- consulted. Supabase's default privileges usually cover this, but relying on
-- that has bitten this schema before, so state it outright.
-- The sequence grant matters too: a bigserial insert needs nextval().
GRANT SELECT           ON public.app_sessions   TO authenticated;
GRANT SELECT, INSERT   ON public.feature_events TO authenticated;
GRANT USAGE, SELECT    ON SEQUENCE public.feature_events_id_seq TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. record_session_heartbeat - the only way active_seconds ever moves
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER because end users have no direct INSERT/UPDATE on
-- app_sessions. The function derives user_id from auth.uid() and refuses
-- anonymous callers, so a client cannot attribute time to someone else.
--
-- p_seconds is clamped to [0, 120]. The client heartbeats every 30s, so a
-- legitimate call never exceeds ~60 even after a slow network. This makes
-- inflating time-on-app require thousands of forged calls rather than one.

CREATE OR REPLACE FUNCTION public.record_session_heartbeat(
  p_session_id uuid,
  p_seconds    integer DEFAULT 0,
  p_route      text    DEFAULT NULL,
  p_device     text    DEFAULT NULL,
  p_is_pwa     boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid   uuid    := auth.uid();
  delta integer := LEAST(GREATEST(COALESCE(p_seconds, 0), 0), 120);
  dev   text    := CASE WHEN p_device IN ('mobile','tablet','desktop')
                        THEN p_device ELSE NULL END;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'forbidden: authentication required';
  END IF;
  IF p_session_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.app_sessions AS s (
    id, user_id, started_at, last_seen_at, active_seconds,
    entry_route, last_route, device_type, is_pwa
  )
  VALUES (
    p_session_id, uid, now(), now(), delta,
    LEFT(p_route, 120), LEFT(p_route, 120), dev, COALESCE(p_is_pwa, false)
  )
  ON CONFLICT (id) DO UPDATE
    SET last_seen_at   = now(),
        active_seconds = s.active_seconds + delta,
        last_route     = COALESCE(LEFT(p_route, 120), s.last_route),
        device_type    = COALESCE(s.device_type, dev),
        is_pwa         = s.is_pwa OR COALESCE(p_is_pwa, false)
    -- Belt and braces: an attacker who guessed another user's session uuid
    -- still cannot add time to it.
    WHERE s.user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.record_session_heartbeat(uuid, integer, text, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.record_session_heartbeat(uuid, integer, text, text, boolean) TO authenticated;


-- ============================================================================
-- ADMIN READ FUNCTIONS
-- ----------------------------------------------------------------------------
-- All of the below are SECURITY DEFINER (they need to read auth.users for
-- email, and every user's rows) and have EXECUTE revoked from anon and
-- authenticated. Only service-role connections can call them, and our admin
-- API routes check profiles.is_admin before they do. Two independent gates.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_overview - headline KPI numbers for the top of the dashboard
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_overview(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1));
  prev  timestamptz := now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1) * 2);
  out   jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalUsers',        (SELECT count(*) FROM auth.users),
    'newUsers',          (SELECT count(*) FROM auth.users WHERE created_at >= since),
    'newUsersPrev',      (SELECT count(*) FROM auth.users
                           WHERE created_at >= prev AND created_at < since),
    -- "Active" = completed a lesson, or had a tracked session, in the window.
    'activeUsers',       (SELECT count(DISTINCT u) FROM (
                            SELECT user_id AS u FROM public.app_sessions WHERE started_at >= since
                            UNION
                            SELECT user_id FROM public.question_attempts WHERE answered_at >= since
                          ) a),
    'activeUsersPrev',   (SELECT count(DISTINCT u) FROM (
                            SELECT user_id AS u FROM public.app_sessions
                              WHERE started_at >= prev AND started_at < since
                            UNION
                            SELECT user_id FROM public.question_attempts
                              WHERE answered_at >= prev AND answered_at < since
                          ) b),
    'dau',               (SELECT count(DISTINCT user_id) FROM public.app_sessions
                           WHERE started_at >= now() - interval '1 day'),
    'wau',               (SELECT count(DISTINCT user_id) FROM public.app_sessions
                           WHERE started_at >= now() - interval '7 days'),
    'mau',               (SELECT count(DISTINCT user_id) FROM public.app_sessions
                           WHERE started_at >= now() - interval '30 days'),
    'lessonsCompleted',  (SELECT COALESCE(sum(cardinality(completed_lessons)), 0)
                            FROM public.user_progress),
    'totalXp',           (SELECT COALESCE(sum(xp), 0) FROM public.user_progress),
    'totalMinutes',      (SELECT COALESCE(round(sum(active_seconds) / 60.0), 0)
                            FROM public.app_sessions WHERE started_at >= since),
    'sessions',          (SELECT count(*) FROM public.app_sessions WHERE started_at >= since),
    'avgSessionMinutes', (SELECT COALESCE(round((avg(active_seconds) / 60.0)::numeric, 1), 0)
                            FROM public.app_sessions
                           WHERE started_at >= since AND active_seconds > 0),
    'usersWithStreak',   (SELECT count(*) FROM public.user_progress WHERE streak >= 3),
    'answerAccuracy',    (SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE is_correct) / count(*), 1)
                          END FROM public.question_attempts WHERE answered_at >= since),
    'pwaShare',          (SELECT CASE WHEN count(*) = 0 THEN 0
                            ELSE round(100.0 * count(*) FILTER (WHERE is_pwa) / count(*), 1)
                          END FROM public.app_sessions WHERE started_at >= since),
    'windowDays',        GREATEST(COALESCE(p_days, 30), 1),
    'generatedAt',       now()
  ) INTO out;
  RETURN out;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_daily_activity - time series for the trend charts
-- ─────────────────────────────────────────────────────────────────────────────
-- Days are bucketed in SAST (UTC+2). South Africa has no DST, so a fixed
-- offset is exact - "today" on the chart means today in Johannesburg.
CREATE OR REPLACE FUNCTION public.admin_daily_activity(p_days integer DEFAULT 30)
RETURNS TABLE (
  day             date,
  active_users    bigint,
  sessions        bigint,
  minutes         numeric,
  lessons         bigint,
  new_users       bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Built from an integer series rather than generate_series over dates: the
  -- date/timestamp overloads are ambiguous and the timestamptz one would then
  -- re-bucket by the session timezone, silently shifting every day by 2 hours.
  WITH days AS (
    SELECT ((now() AT TIME ZONE 'Africa/Johannesburg')::date - g)::date AS day
      FROM generate_series(0, GREATEST(COALESCE(p_days, 30), 1) - 1) AS g
  ),
  sess AS (
    SELECT (started_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(DISTINCT user_id) AS active_users,
           count(*)                AS sessions,
           round(sum(active_seconds) / 60.0, 1) AS minutes
      FROM public.app_sessions
     WHERE started_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1))
     GROUP BY 1
  ),
  les AS (
    SELECT (answered_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(DISTINCT (user_id::text || lesson_id)) AS lessons
      FROM public.question_attempts
     WHERE answered_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1))
     GROUP BY 1
  ),
  signups AS (
    SELECT (created_at AT TIME ZONE 'Africa/Johannesburg')::date AS day,
           count(*) AS new_users
      FROM auth.users
     WHERE created_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1))
     GROUP BY 1
  )
  SELECT d.day,
         COALESCE(s.active_users, 0),
         COALESCE(s.sessions, 0),
         COALESCE(s.minutes, 0),
         COALESCE(l.lessons, 0),
         COALESCE(n.new_users, 0)
    FROM days d
    LEFT JOIN sess    s ON s.day = d.day
    LEFT JOIN les     l ON l.day = d.day
    LEFT JOIN signups n ON n.day = d.day
   ORDER BY d.day;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_feature_usage - "which features earn their keep"
-- ─────────────────────────────────────────────────────────────────────────────
-- Reports reach (how many people), depth (events per user) and stickiness
-- (days used) side by side. A feature with high events but tiny reach is a
-- power-user niche; high reach with one event each is a curiosity click.
CREATE OR REPLACE FUNCTION public.admin_feature_usage(p_days integer DEFAULT 30)
RETURNS TABLE (
  feature          text,
  users            bigint,
  events           bigint,
  events_per_user  numeric,
  active_days      bigint,
  adoption_pct     numeric,
  last_used        timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH since AS (
    SELECT now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1)) AS t
  ),
  base AS (
    SELECT count(DISTINCT user_id) AS total_active
      FROM public.app_sessions, since
     WHERE started_at >= since.t
  )
  SELECT fe.feature,
         count(DISTINCT fe.user_id) AS users,
         count(*)                   AS events,
         round(count(*)::numeric / NULLIF(count(DISTINCT fe.user_id), 0), 1) AS events_per_user,
         count(DISTINCT (fe.occurred_at AT TIME ZONE 'Africa/Johannesburg')::date) AS active_days,
         round(100.0 * count(DISTINCT fe.user_id)
               / NULLIF((SELECT GREATEST(total_active, 1) FROM base), 0), 1) AS adoption_pct,
         max(fe.occurred_at) AS last_used
    FROM public.feature_events fe, since
   WHERE fe.occurred_at >= since.t
   GROUP BY fe.feature
   ORDER BY users DESC, events DESC;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_feature_time - minutes spent per feature area
-- ─────────────────────────────────────────────────────────────────────────────
-- Attributes each session's active time to the route the user was last on.
-- Approximate by design: it answers "where does time go" well enough to make
-- decisions, without needing per-route timers on the client.
CREATE OR REPLACE FUNCTION public.admin_feature_time(p_days integer DEFAULT 30)
RETURNS TABLE (
  feature  text,
  minutes  numeric,
  sessions bigint,
  share_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH s AS (
    SELECT COALESCE(NULLIF(split_part(ltrim(COALESCE(last_route, ''), '/'), '/', 1), ''), 'other') AS feature,
           active_seconds
      FROM public.app_sessions
     WHERE started_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1))
  ),
  tot AS (SELECT GREATEST(sum(active_seconds), 1) AS total FROM s)
  SELECT s.feature,
         round(sum(s.active_seconds) / 60.0, 1) AS minutes,
         count(*)                               AS sessions,
         round(100.0 * sum(s.active_seconds) / (SELECT total FROM tot), 1) AS share_pct
    FROM s
   GROUP BY s.feature
   ORDER BY minutes DESC;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_retention - the cohort table funders ask for first
-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly signup cohorts, with the share who came back on day 1, 7 and 30.
-- "Came back" = had a session or answered a question that many days after
-- signing up. Cohorts too young to have reached a milestone report NULL rather
-- than 0, so a fresh cohort never looks like a retention collapse.
CREATE OR REPLACE FUNCTION public.admin_retention()
RETURNS TABLE (
  cohort_week date,
  cohort_size bigint,
  d1_pct      numeric,
  d7_pct      numeric,
  d30_pct     numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cohorts AS (
    SELECT id AS user_id,
           date_trunc('week', created_at AT TIME ZONE 'Africa/Johannesburg')::date AS cohort_week,
           created_at
      FROM auth.users
     WHERE created_at >= now() - interval '180 days'
  ),
  acts AS (
    SELECT user_id, started_at AS at FROM public.app_sessions
    UNION ALL
    SELECT user_id, answered_at    FROM public.question_attempts
  ),
  flags AS (
    SELECT c.cohort_week,
           c.user_id,
           c.created_at,
           bool_or(a.at >= c.created_at + interval '1 day'
                   AND a.at <  c.created_at + interval '2 days')  AS d1,
           bool_or(a.at >= c.created_at + interval '7 days'
                   AND a.at <  c.created_at + interval '8 days')  AS d7,
           bool_or(a.at >= c.created_at + interval '30 days'
                   AND a.at <  c.created_at + interval '31 days') AS d30
      FROM cohorts c
      LEFT JOIN acts a ON a.user_id = c.user_id
     GROUP BY 1, 2, 3
  )
  SELECT cohort_week,
         count(*) AS cohort_size,
         CASE WHEN min(created_at) > now() - interval '2 days'  THEN NULL
              ELSE round(100.0 * count(*) FILTER (WHERE d1)  / count(*), 1) END,
         CASE WHEN min(created_at) > now() - interval '8 days'  THEN NULL
              ELSE round(100.0 * count(*) FILTER (WHERE d7)  / count(*), 1) END,
         CASE WHEN min(created_at) > now() - interval '31 days' THEN NULL
              ELSE round(100.0 * count(*) FILTER (WHERE d30) / count(*), 1) END
    FROM flags
   GROUP BY cohort_week
   ORDER BY cohort_week DESC;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_user_rows - the searchable per-user table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_user_rows(
  p_search text    DEFAULT NULL,
  p_limit  integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_sort   text    DEFAULT 'last_seen'
)
RETURNS TABLE (
  user_id          uuid,
  email            text,
  username         text,
  full_name        text,
  signed_up        timestamptz,
  last_seen        timestamptz,
  lessons_done     integer,
  xp               integer,
  streak           integer,
  longest_streak   integer,
  total_minutes    numeric,
  sessions         bigint,
  features_used    integer,
  accuracy_pct     numeric,
  goal             text,
  age_range        text,
  days_since_seen  integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH sess AS (
    SELECT user_id,
           round(sum(active_seconds) / 60.0, 1) AS total_minutes,
           count(*)      AS sessions,
           max(last_seen_at) AS last_session
      FROM public.app_sessions
     GROUP BY user_id
  ),
  feats AS (
    SELECT user_id, count(DISTINCT feature)::int AS features_used, max(occurred_at) AS last_event
      FROM public.feature_events
     GROUP BY user_id
  ),
  acc AS (
    SELECT user_id,
           round(100.0 * count(*) FILTER (WHERE is_correct) / NULLIF(count(*), 0), 1) AS accuracy_pct,
           max(answered_at) AS last_answer
      FROM public.question_attempts
     GROUP BY user_id
  ),
  -- Named base_rows, not rows: ROWS is a reserved keyword in Postgres and
  -- would be a syntax error as a CTE name.
  base_rows AS (
    SELECT u.id AS user_id,
           u.email::text,
           p.username,
           p.full_name,
           u.created_at AS signed_up,
           GREATEST(
             COALESCE(s.last_session, 'epoch'::timestamptz),
             COALESCE(f.last_event,   'epoch'::timestamptz),
             COALESCE(a.last_answer,  'epoch'::timestamptz),
             COALESCE(up.updated_at,  'epoch'::timestamptz)
           ) AS last_seen,
           COALESCE(cardinality(up.completed_lessons), 0) AS lessons_done,
           COALESCE(up.xp, 0)             AS xp,
           COALESCE(up.streak, 0)         AS streak,
           COALESCE(up.longest_streak, 0) AS longest_streak,
           COALESCE(s.total_minutes, 0)   AS total_minutes,
           COALESCE(s.sessions, 0)        AS sessions,
           COALESCE(f.features_used, 0)   AS features_used,
           a.accuracy_pct,
           p.goal,
           p.age_range
      FROM auth.users u
      LEFT JOIN public.profiles      p  ON p.user_id  = u.id
      LEFT JOIN public.user_progress up ON up.user_id = u.id
      LEFT JOIN sess  s ON s.user_id = u.id
      LEFT JOIN feats f ON f.user_id = u.id
      LEFT JOIN acc   a ON a.user_id = u.id
     WHERE p_search IS NULL
        OR p_search = ''
        OR u.email     ILIKE '%' || p_search || '%'
        OR p.username  ILIKE '%' || p_search || '%'
        OR p.full_name ILIKE '%' || p_search || '%'
  )
  SELECT r.*,
         CASE WHEN r.last_seen <= 'epoch'::timestamptz THEN NULL
              ELSE EXTRACT(day FROM now() - r.last_seen)::int END AS days_since_seen
    FROM base_rows r
   ORDER BY
     CASE WHEN p_sort = 'lessons'  THEN r.lessons_done  END DESC NULLS LAST,
     CASE WHEN p_sort = 'xp'       THEN r.xp            END DESC NULLS LAST,
     CASE WHEN p_sort = 'minutes'  THEN r.total_minutes END DESC NULLS LAST,
     CASE WHEN p_sort = 'streak'   THEN r.streak        END DESC NULLS LAST,
     CASE WHEN p_sort = 'signup'   THEN r.signed_up     END DESC NULLS LAST,
     CASE WHEN p_sort NOT IN ('lessons','xp','minutes','streak','signup')
          THEN r.last_seen END DESC NULLS LAST
   LIMIT  LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_user_detail - everything about one person, for the drill-down panel
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_user_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  out jsonb;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
               'userId',    u.id,
               'email',     u.email,
               'username',  p.username,
               'fullName',  p.full_name,
               'signedUp',  u.created_at,
               'lastSignIn',u.last_sign_in_at,
               'goal',      p.goal,
               'ageRange',  p.age_range,
               'isAdmin',   COALESCE(p.is_admin, false)
             )
        FROM auth.users u
        LEFT JOIN public.profiles p ON p.user_id = u.id
       WHERE u.id = p_user_id
    ),
    'progress', (
      SELECT jsonb_build_object(
               'xp',            COALESCE(xp, 0),
               'level',         COALESCE(level, 1),
               'streak',        COALESCE(streak, 0),
               'longestStreak', COALESCE(longest_streak, 0),
               'lessonsDone',   COALESCE(cardinality(completed_lessons), 0),
               'perfectTotal',  COALESCE(perfect_lessons_total, 0),
               'hearts',        COALESCE(hearts, 0),
               'lastActivity',  last_activity_date,
               'completedLessons', COALESCE(completed_lessons, '{}')
             )
        FROM public.user_progress WHERE user_id = p_user_id
    ),
    'usage', (
      SELECT jsonb_build_object(
               'totalMinutes', COALESCE(round(sum(active_seconds) / 60.0, 1), 0),
               'sessions',     count(*),
               'firstSeen',    min(started_at),
               'lastSeen',     max(last_seen_at),
               'avgMinutes',   COALESCE(round((avg(active_seconds) / 60.0)::numeric, 1), 0),
               'devices',      COALESCE(jsonb_agg(DISTINCT device_type)
                                        FILTER (WHERE device_type IS NOT NULL), '[]'::jsonb),
               'usesPwa',      COALESCE(bool_or(is_pwa), false)
             )
        FROM public.app_sessions WHERE user_id = p_user_id
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
    'accuracy', (
      SELECT jsonb_build_object(
               'answered',  count(*),
               'correct',   count(*) FILTER (WHERE is_correct),
               'pct',       CASE WHEN count(*) = 0 THEN NULL
                            ELSE round(100.0 * count(*) FILTER (WHERE is_correct) / count(*), 1) END
             )
        FROM public.question_attempts WHERE user_id = p_user_id
    ),
    -- Aggregate first, THEN build the object. Doing it in one step would put an
    -- aggregate inside the GROUP BY target, which Postgres rejects.
    'dailyMinutes', (
      SELECT COALESCE(jsonb_agg(
               jsonb_build_object('day', g.d, 'minutes', g.m) ORDER BY g.d
             ), '[]'::jsonb)
        FROM (
          SELECT (started_at AT TIME ZONE 'Africa/Johannesburg')::date AS d,
                 round(sum(active_seconds) / 60.0, 1)                  AS m
            FROM public.app_sessions
           WHERE user_id = p_user_id
             AND started_at >= now() - interval '30 days'
           GROUP BY 1
        ) g
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
           LIMIT 50
        ) t
    )
  ) INTO out;
  RETURN out;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_content_quality - which lessons are too hard, too easy, or broken
-- ─────────────────────────────────────────────────────────────────────────────
-- first_try_pct is the honest difficulty signal: attempt_no = 1 only. Overall
-- accuracy is inflated by the mastery loop, which makes users retry until they
-- get it right, so every lesson trends toward 100% if you measure all attempts.
CREATE OR REPLACE FUNCTION public.admin_content_quality(
  p_days     integer DEFAULT 90,
  p_min_att  integer DEFAULT 5
)
RETURNS TABLE (
  course_id      text,
  lesson_id      text,
  attempts       bigint,
  learners       bigint,
  first_try_pct  numeric,
  overall_pct    numeric,
  avg_attempts   numeric,
  verdict        text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH a AS (
    SELECT *
      FROM public.question_attempts
     WHERE answered_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1))
  ),
  agg AS (
    SELECT a.course_id,
           a.lesson_id,
           count(*)                    AS attempts,
           count(DISTINCT a.user_id)   AS learners,
           round(100.0 * count(*) FILTER (WHERE a.is_correct AND a.attempt_no = 1)
                 / NULLIF(count(*) FILTER (WHERE a.attempt_no = 1), 0), 1) AS first_try_pct,
           round(100.0 * count(*) FILTER (WHERE a.is_correct) / count(*), 1) AS overall_pct,
           round(avg(a.attempt_no)::numeric, 2) AS avg_attempts
      FROM a
     GROUP BY a.course_id, a.lesson_id
    HAVING count(*) >= GREATEST(COALESCE(p_min_att, 5), 1)
  )
  SELECT agg.*,
         CASE
           WHEN agg.first_try_pct IS NULL      THEN 'Not enough data'
           WHEN agg.first_try_pct < 40         THEN 'Too hard - rewrite'
           WHEN agg.first_try_pct < 60         THEN 'Challenging'
           WHEN agg.first_try_pct > 95         THEN 'Too easy - add depth'
           ELSE                                     'Well pitched'
         END AS verdict
    FROM agg
   ORDER BY agg.first_try_pct ASC NULLS LAST;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_concept_difficulty - the same signal rolled up to concept level
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_concept_difficulty(p_days integer DEFAULT 90)
RETURNS TABLE (
  concept_id    text,
  attempts      bigint,
  learners      bigint,
  first_try_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT concept_id,
         count(*)                  AS attempts,
         count(DISTINCT user_id)   AS learners,
         round(100.0 * count(*) FILTER (WHERE is_correct AND attempt_no = 1)
               / NULLIF(count(*) FILTER (WHERE attempt_no = 1), 0), 1) AS first_try_pct
    FROM public.question_attempts
   WHERE concept_id IS NOT NULL
     AND answered_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1))
   GROUP BY concept_id
  HAVING count(*) >= 5
   ORDER BY first_try_pct ASC NULLS LAST
   LIMIT 40;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_course_engagement - reach and completion per course
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_course_engagement(p_days integer DEFAULT 90)
RETURNS TABLE (
  course_id     text,
  learners      bigint,
  lessons_taken bigint,
  attempts      bigint,
  first_try_pct numeric,
  last_activity timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id,
         count(DISTINCT user_id)   AS learners,
         count(DISTINCT lesson_id) AS lessons_taken,
         count(*)                  AS attempts,
         round(100.0 * count(*) FILTER (WHERE is_correct AND attempt_no = 1)
               / NULLIF(count(*) FILTER (WHERE attempt_no = 1), 0), 1) AS first_try_pct,
         max(answered_at) AS last_activity
    FROM public.question_attempts
   WHERE answered_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 90), 1))
   GROUP BY course_id
   ORDER BY learners DESC;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_dropoff - where people abandon lessons
-- ─────────────────────────────────────────────────────────────────────────────
-- Pairs lesson_started against lesson_completed from feature_events. Anything
-- started and not completed is a drop-off, and the abandoned event carries the
-- step where they quit.
CREATE OR REPLACE FUNCTION public.admin_dropoff(p_days integer DEFAULT 30)
RETURNS TABLE (
  lesson_id      text,
  course_id      text,
  starts         bigint,
  completions    bigint,
  completion_pct numeric,
  avg_quit_pct   numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH e AS (
    SELECT props->>'lessonId' AS lesson_id,
           props->>'courseId' AS course_id,
           event,
           (props->>'completionPercent')::numeric AS quit_pct
      FROM public.feature_events
     WHERE occurred_at >= now() - make_interval(days => GREATEST(COALESCE(p_days, 30), 1))
       AND event IN ('lesson_started', 'lesson_completed', 'lesson_abandoned')
       AND props->>'lessonId' IS NOT NULL
  )
  SELECT lesson_id,
         max(course_id) AS course_id,
         count(*) FILTER (WHERE event = 'lesson_started')   AS starts,
         count(*) FILTER (WHERE event = 'lesson_completed') AS completions,
         round(100.0 * count(*) FILTER (WHERE event = 'lesson_completed')
               / NULLIF(count(*) FILTER (WHERE event = 'lesson_started'), 0), 1) AS completion_pct,
         round(avg(quit_pct) FILTER (WHERE event = 'lesson_abandoned'), 1) AS avg_quit_pct
    FROM e
   GROUP BY lesson_id
  HAVING count(*) FILTER (WHERE event = 'lesson_started') >= 3
   ORDER BY completion_pct ASC NULLS LAST
   LIMIT 40;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Lock every admin function to service-role only
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER functions default to EXECUTE for PUBLIC, which would let any
-- logged-in user read the whole user base. Revoking from public/anon/authenticated
-- leaves service_role (which is not subject to these grants) as the only caller.

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
-- Retention housekeeping
-- ─────────────────────────────────────────────────────────────────────────────
-- feature_events grows fastest. This trims anything older than a year, keeping
-- the table cheap. Aggregates the dashboard shows never look back that far;
-- if you later want multi-year trends, snapshot the monthly rollups first.

CREATE OR REPLACE FUNCTION public.prune_analytics_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.feature_events WHERE occurred_at < now() - interval '365 days';
  GET DIAGNOSTICS removed = ROW_COUNT;
  DELETE FROM public.app_sessions WHERE started_at < now() - interval '365 days';
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_analytics_events() FROM PUBLIC, anon, authenticated;
