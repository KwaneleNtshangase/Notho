-- Which reminder brought someone back.
-- Service role writes these. Clients never read the table.

ALTER TABLE public.push_notification_log
  ADD COLUMN IF NOT EXISTS kind TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lesson_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS push_notification_log_sent_idx
  ON public.push_notification_log (sent_at DESC);
