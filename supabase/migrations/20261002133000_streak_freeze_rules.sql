-- Streak freeze rules, aligned with src/lib/dates.ts evaluateStreak.
--
-- Inventory is equipped, max 2, bought with XP. The Sunday job that topped
-- every account back up to 2 fought the shop, so it is unscheduled.
-- A freeze covers one missed SAST day. It does not increment the streak.
-- Apply only when the stock covers the whole gap. A bigger gap breaks the
-- streak and leaves the freezes in place. Stamp last activity to yesterday
-- so today still needs a lesson.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'streak-freeze-weekly-reset') THEN
    PERFORM cron.unschedule('streak-freeze-weekly-reset');
  END IF;
END $$;

ALTER TABLE public.user_progress
  ALTER COLUMN streak_freeze_count SET DEFAULT 0;

CREATE OR REPLACE FUNCTION public.auto_apply_streak_freezes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sast_today DATE := (NOW() AT TIME ZONE 'Africa/Johannesburg')::DATE;
  sast_yesterday DATE := sast_today - 1;
BEGIN
  UPDATE public.user_progress
     SET streak_freeze_count = streak_freeze_count - (sast_today - last_activity_date - 1),
         streak_freeze_used_at = NOW(),
         last_activity_date = sast_yesterday,
         updated_at = NOW()
   WHERE streak > 0
     AND last_activity_date IS NOT NULL
     AND last_activity_date < sast_yesterday
     AND (sast_today - last_activity_date - 1) >= 1
     AND streak_freeze_count >= (sast_today - last_activity_date - 1);
END;
$$;

COMMENT ON FUNCTION public.auto_apply_streak_freezes() IS
  'Nightly job. Consumes one freeze per missed SAST day only when the stock covers the gap, and stamps last_activity_date to yesterday. Does not refill inventory and does not burn freezes on a broken streak.';

REVOKE EXECUTE ON FUNCTION public.auto_apply_streak_freezes() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.use_streak_freeze(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_freezes INTEGER;
  v_streak INTEGER;
  v_last DATE;
  sast_today DATE := (NOW() AT TIME ZONE 'Africa/Johannesburg')::DATE;
  sast_yesterday DATE := sast_today - 1;
  v_missed INTEGER;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT streak_freeze_count, streak, last_activity_date
    INTO v_freezes, v_streak, v_last
    FROM public.user_progress
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_progress_row');
  END IF;

  IF v_streak <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_streak', 'streak', v_streak, 'freezes_left', v_freezes);
  END IF;

  IF v_freezes <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_freezes_left', 'streak', v_streak, 'freezes_left', 0);
  END IF;

  -- Already alive through yesterday or today. Spending now would only burn a freeze.
  IF v_last IS NOT NULL AND v_last >= sast_yesterday THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_safe', 'streak', v_streak, 'freezes_left', v_freezes);
  END IF;

  v_missed := CASE WHEN v_last IS NULL THEN NULL ELSE (sast_today - v_last - 1) END;
  IF v_last IS NULL OR v_missed IS NULL OR v_missed < 1 OR v_freezes < v_missed THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'gap_too_big', 'streak', v_streak, 'freezes_left', v_freezes);
  END IF;

  UPDATE public.user_progress
     SET streak_freeze_count = streak_freeze_count - v_missed,
         streak_freeze_used_at = NOW(),
         last_activity_date = sast_yesterday,
         updated_at = NOW()
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'streak', v_streak,
    'freezes_left', v_freezes - v_missed
  );
END;
$$;

COMMENT ON FUNCTION public.use_streak_freeze(uuid) IS
  'Covers a missed SAST gap with equipped freezes and stamps last_activity_date to yesterday. Refuses when the streak is already safe or the stock cannot cover the gap, so a tap cannot burn a freeze for nothing.';

REVOKE EXECUTE ON FUNCTION public.use_streak_freeze(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.use_streak_freeze(uuid) TO authenticated;
