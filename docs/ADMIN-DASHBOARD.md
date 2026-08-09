# Admin product dashboard

Live product analytics — who uses Notho, for how long, which features they reach
for, whether they come back, and which lessons are landing.

Built to answer two questions: *what should we build next?* and *can we prove
people use this?* (for funding applications and competitions).

## Where to find it

| Environment | URL |
| --- | --- |
| **Production** | **https://www.notho.co.za/admin/analytics** |
| Local dev | http://localhost:3000/admin/analytics |

There is no link to it from the app navigation — bookmark it. Sign in normally
with an admin account first, then go to the URL.

`/admin/*` is marked `noindex` via `src/app/admin/layout.tsx`, so it stays out of
search results. That is tidiness, not the security boundary — the real gate is
below.

### Who can get in

Admin access is granted to:

- `kwanelebc031@gmail.com`
- `hello@notho.co.za`
- `hello@fundiapp.co.za` *(the old domain, from the earlier migration — left in
  place deliberately, since `docs/REBRAND-NOTHO.md` keeps that address alive for
  about 12 months)*

Signing in with any other address shows a clear "not an admin" message rather
than a broken page.

---

## Deploying it

Three steps, in this order.

### 1. Apply the migration

```bash
supabase db push
```

Applies `supabase/migrations/20260808120000_admin_analytics_tracking.sql`. It is
purely additive — two new tables, thirteen new functions, no existing table
altered and no data rewritten. Safe to run against production.

### 2. Confirm the admin grants landed

`20260808130000_grant_admin_notho_emails.sql` sets `profiles.is_admin` for
`kwanelebc031@gmail.com` and `hello@notho.co.za`. **It can only grant access to
an account that already exists** — if an address has never signed up, the
migration prints a NOTICE and skips it.

So sign up with `hello@notho.co.za` first if you have not already, then re-run.
Check who has access:

```sql
select u.email, p.is_admin
  from public.profiles p
  join auth.users u on u.id = p.user_id
 where p.is_admin = true
 order by u.email;
```

To add someone later, run this from the Supabase SQL editor (which connects as
service-role — the self-escalation trigger blocks ordinary logged-in sessions
from setting this column, by design):

```sql
update public.profiles
   set is_admin = true
 where user_id = (select id from auth.users where lower(email) = 'their@email.com');
```

`SUPABASE_SERVICE_ROLE_KEY` is already set in Vercel, so nothing to add there.

#### Belt and braces: the `ADMIN_EMAILS` fallback

`src/lib/admin.ts` already accepts a comma-separated `ADMIN_EMAILS` env var as a
secondary check, OR'd with the database flag. It is currently **unset**.

Setting it in Vercel is worth doing, because it works even for an address that
has no account or profile row yet — which is exactly the situation that would
otherwise lock you out at the worst moment:

```
ADMIN_EMAILS=kwanelebc031@gmail.com,hello@notho.co.za
```

Both checks fail closed: if neither the flag nor the env var matches, nobody is
an admin.

### 3. Deploy the app

```bash
git add -A && git commit -m "Add admin product dashboard with session and feature tracking"
git push
```

Tracking starts collecting the moment the deploy is live. **The dashboard will
look empty for the first day or two** — that is expected, not a bug. Retention
cohorts need a week before day-7 numbers mean anything, and 30 days before day-30
numbers do.

---

## What gets tracked, and how

### Session time

A heartbeat every 30 seconds while the tab is visible **and** the user has
interacted in the last minute. This measures *active* time, not wall-clock time.

That distinction matters: a tab left open overnight would otherwise report nine
hours of "engagement" and quietly ruin every average on the dashboard. When you
show these numbers to a funder, they are defensible.

Time is inflation-resistant in two places — the client caps each heartbeat at one
interval's worth, and `record_session_heartbeat` clamps again at 120 seconds
server-side and stamps `user_id` from `auth.uid()` rather than trusting the
client. Faking time-on-app would need thousands of forged calls, not one.

### Feature usage

Every event in `src/lib/analytics.ts` is mirrored into `feature_events`, tagged
with the product area it belongs to. **PostHog is unchanged** — this is a second
sink, not a replacement. PostHog keeps session replay and ad-hoc exploration;
Postgres gives per-user joins and data you own outright.

The mirror is wired inside the shared `track()` helper, so any event you add to
`analytics.ts` in future flows to both places automatically. Nothing to remember.

To map a new event to a feature area, add it to `FEATURE_BY_EVENT` in
`src/lib/usageTracking.ts`. Unmapped events fall back to a prefix match, then to
`other`, so forgetting is not fatal.

### What is deliberately not stored

`sanitiseProps` strips anything resembling personal or free-text content —
emails, names, messages, answers, tokens. Rand amounts are **bucketed**
(`2k-10k`) rather than stored exactly, so you keep the distribution without
holding a copy of anyone's finances in an analytics table.

---

## Reading the dashboard

### Overview
Headline numbers. The one to watch is **daily / monthly** — the share of your
monthly users who show up on a given day. Above 20% is strong for a learning app.

### Features
**Reach** is the share of active users who touched a feature; **uses per person**
is how deeply they engage. High reach with low depth is a curiosity click. Low
reach with high depth is a power-user niche worth protecting, not cutting.

*Where the time actually goes* is the honest answer to "is anyone using the
Budget planner". Clicks flatter a feature; minutes do not.

### Retention
Weekly signup cohorts and the share returning on day 1, 7 and 30. This is the
single most-requested chart in funding applications.

Rough consumer-learning benchmarks: **day 1 ~30–40%, day 7 ~15–25%, day 30
~8–15%.** A dash means the cohort is too young to have reached that milestone —
never read it as zero.

### Content
Scored on **first-try accuracy only**. Overall accuracy is meaningless here
because your mastery loop makes people retry until they are correct, so every
lesson eventually reads as 100%.

60–95% first-try is the sweet spot. Below 40% usually means the *question wording*
is unclear rather than the concept being hard — read the question before
rewriting the lesson.

### Users
Every user, searchable and sortable. Click any row for a full drill-down: time
per day, features touched, accuracy, recent activity.

---

## Exporting for funders

Every panel has an **Export CSV** button. The files are dated, so they double as
a defensible point-in-time record.

For an application, the numbers usually asked for are: total and monthly active
users, retention curve, and total learning time. Those are the Overview and
Retention tabs.

---

## Security and POPIA

Two independent gates, both must pass:

1. `/api/admin/analytics` resolves the caller from their Bearer token and checks
   `profiles.is_admin` using a service-role client.
2. The RPCs have `EXECUTE` revoked from `anon` and `authenticated`, so even a
   leaked anon key cannot reach them — only service-role can.

`SECURITY DEFINER` functions default to `EXECUTE` for `PUBLIC`, which would have
let any logged-in user read the entire user base. The revoke block at the bottom
of the migration closes that, and it loops over `admin\_%` so functions added
later are covered automatically.

You are the data controller, so viewing this is legitimate. Two habits worth
keeping: prefer the aggregate tabs over the per-user drill-down when preparing
anything leaving the team, and never screenshot the Users tab for an external
audience — the aggregate views make the same case without exposing anyone.

---

## Housekeeping

`feature_events` grows fastest. `prune_analytics_events()` trims both tables past
365 days:

```sql
select public.prune_analytics_events();
```

Not scheduled — at current volume it will be a long while before it matters. If
you later want multi-year trends, snapshot the monthly rollups before pruning.

---

## Files

| File | What it does |
| --- | --- |
| `supabase/migrations/20260808120000_admin_analytics_tracking.sql` | Tables, RLS, write RPC, 11 admin read functions |
| `supabase/migrations/20260808130000_grant_admin_notho_emails.sql` | Grants admin to the current owner emails |
| `src/app/admin/layout.tsx` | Keeps `/admin/*` out of search indexes |
| `src/lib/usageTracking.ts` | Heartbeat, event buffer, props sanitising |
| `src/components/UsageTracker.tsx` | Mounts tracking inside `(app)` only |
| `src/lib/analytics.ts` | Mirrors every event to both sinks (one edit, in `track()`) |
| `src/app/api/admin/analytics/route.ts` | Admin-gated endpoint |
| `src/app/admin/analytics/` | The dashboard — `page.tsx`, `panels.tsx`, `components.tsx`, `lib.ts` |

`UsageTracker` sits in the `(app)` layout rather than the root layout on purpose:
the root also wraps the marketing and legal pages, and counting time on the
privacy policy as app engagement would flatter the numbers you plan to show
funders.
