-- Keep active legacy learners visible without exposing any real-name fallback.
-- New and returning users are required by the app to choose a username and
-- goal; until then, the client renders these nullable handles as neutral labels.

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
  order by coalesce((up.weekly_xp)::integer, 0) desc,
           coalesce((up.xp)::integer, 0) desc
  limit 500;
$$;

revoke execute on function public.get_leaderboard() from public, anon;
grant execute on function public.get_leaderboard() to authenticated;

comment on function public.get_leaderboard() is
  'Authenticated leaderboard roster. Returns chosen usernames or null; never real names or age ranges. Clients use neutral labels for legacy users without handles.';
