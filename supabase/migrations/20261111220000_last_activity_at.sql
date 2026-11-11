-- Precise timestamp of the last qualifying lesson so reminders can fire
-- ~23 hours later (habit-aligned) instead of fixed clock times.
-- Safe to run more than once.

alter table public.user_progress
  add column if not exists last_activity_at timestamptz;

comment on column public.user_progress.last_activity_at is
  'UTC instant of the last lesson that extended or refreshed the streak. Used by the 23-hour push window.';

-- Backfill from the civil date so existing users still get a first window.
update public.user_progress
   set last_activity_at = (last_activity_date::timestamp + interval '12 hours') at time zone 'Africa/Johannesburg'
 where last_activity_at is null
   and last_activity_date is not null;
