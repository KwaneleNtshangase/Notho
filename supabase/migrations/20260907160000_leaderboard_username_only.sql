-- A leaderboard handle must always be chosen by the user. Never expose any
-- part of a person's real name as an automatic fallback.

drop function if exists public.get_leaderboard();

create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  username text,
  xp integer,
  weekly_xp integer,
  week_key text
)
language sql
security definer
set search_path = public
as $$
  select
    p.user_id,
    nullif(trim(p.username), '')         as username,
    coalesce((up.xp)::integer, 0)        as xp,
    coalesce((up.weekly_xp)::integer, 0) as weekly_xp,
    coalesce(up.week_key, '')            as week_key
  from public.profiles p
  left join public.user_progress up on up.user_id = p.user_id
  where nullif(trim(p.username), '') is not null
  order by coalesce((up.weekly_xp)::integer, 0) desc,
           coalesce((up.xp)::integer, 0) desc
  limit 500;
$$;

revoke execute on function public.get_leaderboard() from public, anon;
grant execute on function public.get_leaderboard() to authenticated;

comment on function public.get_leaderboard() is
  'Leaderboard roster for signed-in users who chose a public username. Never returns real names or age ranges. Authenticated-only.';
