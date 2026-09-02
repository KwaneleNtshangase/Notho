# Server-authoritative hearts migration notes

## Authority boundary

`heart_balances` is the current projection and `heart_ledger` is the immutable
event record. The browser can read its own rows but cannot write either table.
It can call only `get_heart_balance()` and the idempotent `spend_heart(uuid)`
command. Hourly regeneration is calculated under a database row lock.

Positive grants use `grant_hearts(...)`, which is executable by `service_role`
only. The Playwright fixture calls this from its Node process; the service key
is never sent to a page or compiled into the app.

The old `user_progress.hearts` and `last_heart_lost_at` columns remain during
rollout so an older client can still update unrelated progress. A trigger
neutralises inserts and ignores changes to those two retired fields. They are
not read, merged or imported into the new balance.

This makes the balance, regeneration, spend ordering and grants
server-authoritative. Ordinary lesson questions are still rendered in the
browser, so the client tells the spend RPC that an ordinary answer was wrong;
this migration does not claim adversarial server grading for the legacy lesson
engine. RE5 mocks do not use hearts and are graded entirely by their dedicated
server attempt lifecycle.

## Existing-account decision

Every account present when the migration runs receives exactly five hearts and
one `migration_allocation` ledger event. This deliberately does not trust the
old browser-writable value. New accounts receive the same five-heart allocation
through the `auth.users` trigger.

Reviewers must explicitly approve this one-time reset before applying the
migration. The migration has not been applied by this branch.

## Operational test fixture

Manual Playwright runs now require these Node-only secrets:

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`

The fixture resolves `TEST_EMAIL` through the admin API and calls the
service-only grant RPC. Missing secrets fail with a clear setup error instead
of silently seeding `localStorage`.
