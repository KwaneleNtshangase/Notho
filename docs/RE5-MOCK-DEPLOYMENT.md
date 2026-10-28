# RE5 mock integration: reviewed deployment runbook

Nothing in this runbook has been applied or deployed by the integration
branch. Use it only after reviewing the committed diff and the one-time heart
allocation described in `HEARTS-MIGRATION-NOTES.md`.

## 1. Review and preflight

Check out the reviewed integration commit, then run:

```bash
git checkout feat/re5-mock-exam-complete
npm ci
npx tsc --noEmit
npm run test:unit
npm run test:calc
npm run lint
npx eslint src/app/api/mock-attempts src/components/mock-exam \
  src/components/views/MockAttemptExperience.tsx \
  src/data/__tests__/secureMockBoundary.test.ts src/hooks/__tests__ \
  src/lib/mockAttempts src/server
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
npm run build
git diff --check origin/main...HEAD
```

The repository-wide lint command currently reports legacy errors outside this
integration. Do not hide that output. The RE5/API/content/E2E files changed by
this integration must pass a focused ESLint run even if the repository baseline
has not yet been repaired.

Review these two migrations in timestamp order and confirm that no competing
Task 1 or Task 3 mock-attempt migration is present:

1. `supabase/migrations/20260901100000_server_authoritative_hearts.sql`
2. `supabase/migrations/20260901140000_re5_mock_attempts.sql`

The textbook file is an editorial blueprint. Its own qualified-review gates
must be completed before it is published as learner material; including the
plan in this repository is not legal sign-off.

Re-verify the exam format against the official
[FSCA Regulatory Examinations FAQ](https://www.fsca.co.za/Regulatory-Examinations-FAQ/)
at release time. At this review it states a 65% published pass mark and explains
that an RE5 candidate therefore needs at least 33 whole correct answers out of
50.

## 2. Configure server secrets

Keep the existing Supabase service-role key server-only. Add a separate random
audit hashing secret to the deployment environment before releasing the API:

```bash
openssl rand -hex 32
vercel env add MOCK_AUDIT_HASH_SECRET production
vercel env add MOCK_AUDIT_HASH_SECRET preview
```

Enter the generated value when prompted. Do not prefix it with `NEXT_PUBLIC_`.
Confirm that the deployment already has `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

For the manual GitHub Playwright workflow, add repository secrets named
`TEST_SUPABASE_URL` and `TEST_SUPABASE_SERVICE_ROLE_KEY`. The latter must never
be configured as a browser/public variable.

## 3. Dry-run and apply the schema

From the reviewed checkout, target the intended Supabase project explicitly:

```bash
export SUPABASE_PROJECT_REF='<reviewed-project-ref>'
npx supabase login
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx supabase migration list --linked
npx supabase db push --linked --dry-run
```

Stop if the dry run contains any migration other than the two files listed
above, or if either timestamp already exists with different SQL. After database
backup and reviewer approval, apply them in one controlled release window:

```bash
npx supabase db push --linked
npx supabase migration list --linked
```

Do not paste only part of either migration into the SQL editor. Their policies,
function grants, triggers, seed allocation and transactional functions are one
security boundary.

Verify the deployed objects before deploying the app:

```sql
select version
from supabase_migrations.schema_migrations
where version in ('20260901100000', '20260901140000')
order by version;

select relname, relrowsecurity
from pg_class
where relname in (
  'heart_balances', 'heart_ledger', 'mock_attempts',
  'mock_attempt_questions', 'mock_attempt_mutations', 'mock_exam_audit_log'
)
order by relname;

select
  has_function_privilege('authenticated', 'public.spend_heart(uuid)', 'EXECUTE')
    as learner_can_spend,
  has_function_privilege(
    'authenticated',
    'public.grant_hearts(uuid,integer,uuid,jsonb)',
    'EXECUTE'
  ) as learner_can_grant,
  has_table_privilege('authenticated', 'public.mock_attempt_questions', 'SELECT')
    as learner_can_read_private_questions,
  has_function_privilege(
    'service_role',
    'public.grant_hearts(uuid,integer,uuid,jsonb)',
    'EXECUTE'
  ) as service_can_grant,
  has_table_privilege('service_role', 'public.heart_ledger', 'UPDATE')
    as service_can_rewrite_heart_ledger,
  has_table_privilege('service_role', 'public.mock_attempt_questions', 'SELECT')
    as service_can_read_private_questions,
  has_table_privilege('service_role', 'public.mock_exam_audit_log', 'UPDATE')
    as service_can_rewrite_audit;

select count(*) as accounts_without_balance
from auth.users u
left join public.heart_balances h on h.user_id = u.id
where h.user_id is null;
```

Expected: both migration versions exist; all six tables have RLS enabled;
`learner_can_spend` is true; `learner_can_grant` and
`learner_can_read_private_questions` are false; `service_can_grant` and
`service_can_read_private_questions` are true;
`service_can_rewrite_heart_ledger` and `service_can_rewrite_audit` are false;
and no account is missing a heart balance.

## 4. Deploy the application

The schema is backward-compatible with ordinary progress writes, so deploy it
immediately before the application. Then push the reviewed branch and merge its
PR into `main` using the repository's normal review flow:

```bash
git push -u origin feat/re5-mock-exam-complete
# Open and review the PR, then merge it into main. Vercel deploys main.
```

Do not deploy this application commit before both migrations are present: the
heart UI fails closed at zero and protected mock endpoints fail closed without
their database functions and audit table.

## 5. Production smoke checks

1. Confirm an unauthenticated `POST /api/mock-attempts` returns 401 with
   `Cache-Control: private, no-store`.
2. Start each RE5 paper while signed in. Confirm 50 questions, a fixed two-hour
   deadline and no hearts/correctness feedback.
3. Answer, clear, flag and navigate; refresh and sign in on another device.
   Confirm the same option order, answers, flags, position and deadline resume.
4. Inspect active JSON: it must contain no `correctOptionId`, `explanation`,
   `slot_id`, `variant_id` or `concept_id`.
5. Confirm Submit stays locked until all 50 questions have been visited, then
   verify the explicit blank-answer confirmation.
6. Submit once and verify the immutable result, area breakdown, answer review
   and per-question explanation fetch. Retake and confirm new opaque IDs and a
   newly randomized paper.
7. Spend an ordinary-lesson heart on two devices. Confirm the ledger orders the
   deductions, the earliest regeneration deadline is retained and a browser
   local-storage edit cannot increase the balance.
8. Run the manual Playwright workflow with its two new Node-only secrets.

Rollback should be a forward fix. Reverting the app to a client-bundled mock
would re-expose questions, and removing ledger tables would discard authority
history. Preserve both migrations and correct defects with a new ordered
migration.
