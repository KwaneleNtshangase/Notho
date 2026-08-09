# Churn feedback: why people leave

Three ways a person leaves Notho. Until now all three were silent.

| Exit | Where | What we learned before | What we learn now |
|---|---|---|---|
| Deletes their account | Settings → Delete My Data | Nothing. Every row wiped, then silence. | A reason, their tenure, and whether an alternative would have kept them. |
| Gets tired of the emails | *There was no unsubscribe link at all.* | Nothing — they marked us as spam instead. | A reason, plus a chance to pick "less often" rather than "never". |
| Quietly stops opening the app | Nowhere | Nothing. This is the **biggest group by volume.** | A one-tap answer from a single win-back email. |

---

## What was actually built

**1. Exit survey on account deletion** (`src/components/churn/ExitSurvey.tsx`)

The bare "Are you sure?" dialog became three steps: ask why → offer the matching
alternative → the same red confirmation as before. Skip is on step one and is
always one click.

**2. A real unsubscribe flow** (`/unsubscribe`)

Notho was sending lifecycle emails with no opt-out link. That is a POPIA
s11(3)(b) problem and a deliverability problem — Gmail and Yahoo both weight a
visible unsubscribe link in bulk-sender reputation, and people with no way out
press "report spam", which damages the domain for every other user.

The page is public and token-authenticated (no login — a lapsed user will not
sign in to turn emails off). It offers four levels, not just on/off: weekly,
pause 30 days, important-updates-only, or stop everything.

**3. Win-back survey for silent churn** (daily cron, sent once ever)

Targets 21–45 days of inactivity. Earlier and you are asking "why did you
leave?" of someone who was on holiday; later and they have forgotten you. Four
tappable reasons straight in the email body — two of which blame us, because a
survey that only offers flattering reasons produces flattering data.

**4. Churn tab in `/admin/analytics`**

Reasons by exit door, save-offer take-up, and verbatim comments behind a
deliberate click.

---

## Three decisions worth knowing about

### exit_feedback deliberately survives account deletion

It has **no foreign key to `auth.users`** and is **not** in the delete route's
`USER_TABLES`. A churn record that gets cascaded away the moment the user is
deleted is worthless — it would erase the answer at the exact instant we finally
have it.

The price is a POPIA obligation, paid by making the row genuinely anonymous:

- No user id, no email, no name. Identity is reduced to `user_ref`, a SHA-256 of
  (user id + server-side pepper). One-way, and useless without the pepper. It
  exists only to notice that the person who unsubscribed on Tuesday and deleted
  on Friday is one departure, not two.
- Tenure/lessons/streak are copied in as plain numbers at exit time, so reasons
  can be segmented by cohort without keeping a joinable identity.
- Free text is the person's own words; the form warns against personal details.
  This is the one field to purge if someone later asks for erasure of something
  they wrote.

> **Disclosed in the privacy policy** — done, in both copies:
> - `src/app/privacy/page.tsx` — Section 5 (Data Retention) gains an *Exit
>   feedback* paragraph; Section 8 (Data Deletion) notes it as the one thing not
>   erased, and the self-service steps now say the question is skippable.
> - `src/components/ProfileView.tsx` — the in-app summary gains section 6a, and
>   the "Last revised" date is bumped to 9 August 2026.
>
> The retention itself is defensible. Not disclosing it would not have been.

### Skip is always available, and that is not negotiable

Under POPIA you cannot make erasure conditional on answering a question. Beyond
the law: a survey somebody had to fight through produces answers you should not
trust anyway. Expect roughly 60–75% response with a visible skip — and the skip
count is itself reported, because a high skip rate is a finding, not a bug.

### "Actually left" and "gave a reason" are separate numbers

Someone who gave a reason and then took the save offer is a response but **not**
a departure. Folding them together would overstate churn while hiding the only
evidence that the offers do anything. The dashboard reports both.

---

## Save offers

Each is something the product can genuinely deliver today. An offer that only
records intent is a dark pattern — the person clicked believing something
changed.

| Reason | Offer |
|---|---|
| No time | Pause all email 30 days |
| Too many emails | Weekly digest (or, at the delete door: "stop the emails, keep the account") |
| Lessons too hard | Point at Money Basics |
| Already knew it | Point at the advanced material |
| Buggy / slow | Report it instead |
| **Privacy worry** | **Delete the bank/budget data only, keep learning progress** |
| Not useful / using something else | **No offer.** Somebody telling us the product missed will not be talked round by a settings change, and pretending otherwise wastes the one moment they are willing to be honest. |

The privacy offer performs a real, immediate erasure of every budget table. It
has to — it is being made to somebody who has just said they do not trust us
with their bank data.

---

## Deploying

Four steps. **Order matters for the first two** — the code reads tables the
migration creates, and it signs links with a secret that must exist before any
email goes out. Ship code before the migration and the exit survey silently
fails to save (it is written not to block the deletion, so you would not notice).

### 1. Set the secrets in Vercel — do this first

Project → Settings → Environment Variables. Add to **Production, Preview and
Development**:

| Name | Value |
|---|---|
| `UNSUBSCRIBE_SECRET` | any long random string |
| `EXIT_FEEDBACK_PEPPER` | a different long random string |

Generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`UNSUBSCRIBE_SECRET` signs every unsubscribe link. There is a fallback to
`CRON_SECRET` so nothing breaks if you forget, but set a dedicated one:
**rotating this secret invalidates every unsubscribe link ever sent**, and you
do not want that tied to the secret that also guards your cron endpoints. If
neither exists the code throws rather than using a constant — a predictable key
means anyone can unsubscribe anyone.

`EXIT_FEEDBACK_PEPPER` is what makes the stored user hash irreversible. **Never
change it after go-live**: doing so orphans the dedupe on every existing row.

### 2. Apply the migration

```bash
supabase db push
```

Applies `20260809120000_exit_feedback_and_email_prefs.sql`. Purely additive —
three new tables, two new functions, no existing table altered and no data
rewritten. Safe against production.

If the CLI is not linked, paste the file into Supabase → SQL Editor → Run.

Confirm it landed:

```sql
select table_name
  from information_schema.tables
 where table_schema = 'public'
   and table_name in ('exit_feedback','email_preferences','winback_send_log')
 order by table_name;
-- expect exactly 3 rows
```

And confirm the one thing that must be true — `exit_feedback` has **no** foreign
key, so it survives account deletion:

```sql
select count(*) as fk_count
  from information_schema.table_constraints
 where table_name = 'exit_feedback' and constraint_type = 'FOREIGN KEY';
-- expect 0. Anything else means the churn record dies with the account.
```

### 3. Deploy the code

```bash
git add -A && git commit -m "Add exit feedback capture across all three churn doors"
git push
```

Vercel builds from `main`. No cron changes needed — the win-back pass rides the
existing daily `/api/cron/lifecycle` job already in `vercel.json`.

### 4. Smoke-test in this order

1. **Unsubscribe page renders.** Open `/unsubscribe` with no token — you should
   get "This link isn't valid", not a crash. That proves the route deployed and
   the secret is loading.
2. **A real link works.** Trigger any lifecycle email to yourself, or run the
   cron manually:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://www.notho.co.za/api/cron/lifecycle
   ```
   The JSON now includes `winback` and `suppressed` counts. Check the email
   footer says "Unsubscribe or get fewer emails" and that the link opens the
   preferences page with your name on it.
3. **The opt-out is honoured.** Unsubscribe yourself, then re-run the cron. Your
   `suppressed` count should go up and no email should arrive. This is the step
   worth actually doing — a preferences table nothing reads is worse than none,
   because the person was told we stopped.
4. **The survey saves.** On a throwaway account, Settings → Delete My Data →
   pick a reason → delete. Then:
   ```sql
   select exit_type, reason, completed, days_since_signup, user_ref
     from public.exit_feedback order by created_at desc limit 5;
   ```
   You want `completed = true` and a row that outlived the account. Confirm
   `user_ref` is a meaningless hex string, not anything resembling a user id.
5. **Dashboard reads it.** `/admin/analytics` → **Churn**.

### Rolling back

The code is safe to revert on its own — the tables just stop being written to.
Do **not** drop `exit_feedback` to roll back: it holds answers from people whose
accounts no longer exist, so the data is unrecoverable.

### Tests

```bash
npx vitest run src/lib/churn src/lib/emails
```

22 assertions covering token forgery, secret rotation, hash irreversibility, and
every suppression branch.

---

## The known gap

`frequency: 'weekly'` currently **suppresses** the per-event nudges rather than
batching them into a digest, because no digest exists yet. That is the honest
behaviour until one does — fewer emails, as asked. `canSend()` in
`src/lib/emails/suppression.ts` is where the digest hooks in when it ships.
