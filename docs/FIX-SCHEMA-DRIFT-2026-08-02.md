# Production schema drift — statement import has been broken since 6 July

**Status: needs one SQL run in Supabase. Five minutes.**

## What happened

Migration `20260706122040_account_attribution.sql` exists in the repo but was
never applied to the production database. Verified against production on
2 Aug 2026:

| Object | Production |
|---|---|
| `bank_accounts` table | **missing** (`PGRST205`) |
| `budget_entries.account_id` | **missing** (`42703`) |
| `budget_entries.entry_method` | **missing** (`42703`) |
| `budget_entries.account_label` | present |
| `budget_entries.is_transfer` | present |

Every other migration in `supabase/migrations/` is applied — this is the only
one behind.

## Why it broke imports completely

`/api/budget/import/commit` named `account_id` and `entry_method` in its insert
unconditionally. PostgREST rejects the **whole batch** when a payload names a
column that does not exist, so every statement import failed at the final step
with a 500 — after parsing every transaction correctly.

The reads in `BudgetPlanner` already had a fallback for this exact drift
("prod may lack account_id/entry_method"), so the app *looked* fine. Only the
write path broke, and only at the last moment, which is why it read as a
mysterious "nothing happens".

**This was never a Discovery Bank problem.** Erin's second attempt parsed 784
transactions successfully. It failed on the insert, and it would have failed
identically for FNB, Capitec, Standard Bank or a CSV.

## Fix 1 — run this SQL (the real fix)

Supabase dashboard → your project → **SQL Editor** → New query → paste → **Run**.

Safe to run more than once: every statement is guarded.

```sql
-- Migration 20260706122040_account_attribution.sql, made idempotent.

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  custom_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can manage their own bank accounts"
  ON public.bank_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.budget_entries
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL;

ALTER TABLE public.budget_entries
  ADD COLUMN IF NOT EXISTS entry_method TEXT DEFAULT 'manual';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_entries_entry_method_check'
  ) THEN
    ALTER TABLE public.budget_entries
      ADD CONSTRAINT budget_entries_entry_method_check
      CHECK (entry_method IN ('imported', 'manual'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON public.bank_accounts(user_id);

NOTIFY pgrst, 'reload schema';
```

The final `NOTIFY` forces PostgREST to refresh its schema cache immediately.
Without it the API can keep reporting the old shape for a minute or two, which
is what "in the schema cache" in the original error message referred to.

### Verify it worked

Run in the same SQL editor:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'budget_entries'
  AND column_name IN ('account_id', 'entry_method');
```

Two rows back means done.

## Fix 1b — backfill the missing names (run this too)

Separate bug, same session. Signup writes the user's name to
`auth.users.raw_user_meta_data` only — email signup via `options.data`, OAuth
via the provider. **Nothing ever copied it into `profiles`**, so
`profiles.full_name` stayed empty unless the person later opened Profile or
Settings and pressed save.

Everything that greets someone by name reads `profiles.full_name`: the welcome
and milestone emails, the budget report, the leaderboard first-name fallback,
stokvel member names. All of them have been falling back to a username or
"there" for users whose name we knew perfectly well. Erin Barrett is in the
Supabase dashboard as "Erin Barrett" and her welcome email did not use it.

Onboarding now copies the name across for new signups. This backfills everyone
who already signed up:

```sql
UPDATE public.profiles p
SET full_name = COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'display_name'), '')
    )
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.full_name IS NULL OR TRIM(p.full_name) = '')
  AND COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'display_name'), '')
    ) IS NOT NULL;
```

Only fills blanks — a name someone typed themselves is never overwritten.

Check who is still nameless afterwards:

```sql
SELECT COUNT(*) FILTER (WHERE TRIM(COALESCE(full_name, '')) = '') AS still_blank,
       COUNT(*) AS total
FROM public.profiles;
```

Anyone still blank signed up without giving a name at all — there is nothing to
backfill for them, and the greeting falls back to their username as designed.

## Fix 2 — already in the code

`/api/budget/import/commit` now detects a missing optional column, strips
`account_id` and `entry_method`, and retries. Account attribution is a
nice-to-have; the transactions are the point. Throwing away a correct parse of
784 rows over metadata is the wrong trade.

It logs `[schema-drift]` to the Vercel function logs when this happens, so the
degradation is visible rather than silent. **This is a safety net, not the fix**
— run the SQL above, or imports will keep losing their account labels.

## Why this went unnoticed for four weeks

Nothing surfaced it. The import UI swallowed the failure, no bug report was
sent, and the read path had a fallback that made the app look healthy. All
three of those are now fixed — this exact failure is what produced the first
working bug email.

## Preventing the next one

Migration state is not currently checked anywhere. Worth adding, in order of
effort:

1. **Now**: after any `supabase db push`, run the verify query above.
2. **Soon**: extend `scripts/health-check.js` to probe one column from each of
   the last few migrations and fail loudly if any are missing.
3. **Later**: make deploys run migrations, so the repo and the database cannot
   drift apart in the first place.
