-- Learner opt-out for masked PostHog session replay.
--
-- Default TRUE so recording is on for signed-in learners until they turn it
-- off in Settings. FALSE is read before a recording is allowed to start, and
-- the same row follows the learner across devices.
-- Existing "Users manage own settings" RLS already covers this column.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS session_replay_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.user_settings.session_replay_enabled IS
  'POPIA opt-out for masked PostHog session replay. TRUE (default) allows a signed-in recording. FALSE stops it. Written from Settings.';
