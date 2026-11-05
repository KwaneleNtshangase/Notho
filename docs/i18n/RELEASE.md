# South African language beta release — 23 October 2026

For the current deployment, coverage and rollback, see [the 5 November release](RELEASE-20261105.md). The remainder of this file records the earlier beta.

Historical release record. See [the full app and lesson release](FULL-COVERAGE-20261026.md) for current status and rollback instructions.

## Production deployment

- Canonical URL: https://www.notho.co.za
- Immutable release URL: https://notho-8mpwpasj7-notho.vercel.app
- Deployment: `dpl_HXbMeg3hbmivahoBUX6RytMkrdMq`
- Existing Vercel project: `notho`, ID `prj_4m4b8pLMEx3QrDbkpAIzSsJiaOGX`, existing Notho team.
- Vercel reported READY and aliased the canonical production domain successfully.
- No database migration or production environment-variable change was needed.
- Local source base: `74dfae4` on the existing `feat/speech-on-questions` branch, plus the files recorded in the release manifest. No Git commit or push was made by this task.

The isolated source snapshot, base archive, change patch and SHA-256 manifest are saved under `output/i18n-release-20261023/`. The original Android Gradle change and unrelated untracked assets/documents were left in place and excluded from the release overlay. All 108 existing isiZulu message values were checked against the starting commit and preserved exactly; the isiZulu content/string dictionaries were not rewritten.

During staging, an early CLI invocation created an empty temporary Vercel project named `source`. It had no deployments, was deleted, and the release folder was explicitly relinked and checked against the established project ID before the successful deployment. The canonical production project was not changed by that attempt.

## Checks

- `npm ci --no-audit --no-fund` restored dependencies from the existing lockfile (lockfile unchanged).
- `npm run i18n:check`: zero structural failures; coverage in [coverage.json](coverage.json).
- TypeScript and `npm run build`: passed.
- Full Vitest suite: **77 files, 830 tests passed**; translation/search/public-page tests rerun after subsequent fixes.
- New translation modules, review script and browser tests: ESLint passed.
- Existing lint failures in touched legacy components were reproduced from `HEAD`: SettingsView (5 errors), SpeakButton (1), LocaleProvider (1), plus existing warnings. They predate this change; no whole-repository clean-lint claim is made.
- `git diff --check`: passed.
- Review export exercised for isiNdebele (20,403 rows); pure merge tests cover approval attribution, stale sources, unknown locales/keys, conflicting overrides, duplicate rows and preservation of existing approvals. No synthetic approvals were imported into the shipped store.
- Desktop (1280 px), tablet (1024 px) and mobile (320 px) browser matrix: **15 local tests passed**. Covers all ten selections, persistence, English default/recovery, password visibility accessibility labels, invalid locales, restricted storage, feedback download/context, dialog Escape/focus, authenticated settings, navigation, course and lesson screens. Screen captures were visually inspected; fixed-header overlap and label clipping were corrected.
- Existing E2E account used for authenticated checks; its language updates were intercepted locally, not written to the shared account. No test account was created. Service-role values on this machine were Vercel `[SENSITIVE]` placeholders, so the existing ordinary E2E login was used instead.
- Production browser matrix and health verification: see final verification appended below.

## Rollback

The previous ready production deployment is preserved at:

`https://notho-3elxn2qo3-notho.vercel.app` (`dpl_C238qZRPjr8gYjDfaPUfeLDkr9zP`).

From the existing repository, using the existing Vercel login:

```sh
npx vercel rollback https://notho-3elxn2qo3-notho.vercel.app --yes
npx vercel inspect https://www.notho.co.za
curl --fail https://www.notho.co.za/api/health
```

The rollback command was checked against the installed CLI help; it was **not executed**, since doing so would undo this release. It switches the deployment without deleting user data. No database rollback is needed. The user's local saved language choice may be unsupported by the previous app and will safely parse as English there.

Keep the source changes in the next Git-based release: production was published from the isolated local snapshot, so a future deployment from an older Git revision can replace these changes. The release manifest and source snapshot make the exact shipped files recoverable.

## Remaining review work

See [REVIEW.md](REVIEW.md) for import/export commands, priority phrases and SASL work, and [SOURCES.md](SOURCES.md) for the precise research record. This is partial text localisation: most lesson bodies and much of the budget/calculator/legal UI remain English. No generated sentence is claimed as human-reviewed or culturally validated. The Xitsonga credit/debt title deliberately uses English pending review.

## Final production verification

- Ran `BASE_URL=https://www.notho.co.za npx playwright test --config=playwright.i18n.config.ts`: **15 passed**, covering desktop, tablet and mobile on the live deployment.
- `GET https://www.notho.co.za/api/health`: **HTTP 200**, JSON status **ok**.
- Vercel inspection confirmed READY, target production, and `www.notho.co.za` aliased to `dpl_HXbMeg3hbmivahoBUX6RytMkrdMq`.
- Independently opened the live app in the in-app browser and checked the default English selector and Afrikaans beta disclosure, generated text and English recovery button. Screenshot: `output/i18n-release-20261023/production-afrikaans.png`.
- Rechecked all 46 overlay-file hashes after deployment: unchanged from the staged source.
- Removed the temporary environment export and stopped the local verification server. The user's existing environment file was not edited.
- Final verification logs and this release note are retained in `output/i18n-release-20261023/` alongside the source snapshot and rollback metadata.
