# South African text-language beta and review workflow

English is the default, without a beta label. Afrikaans (`af`), Southern isiNdebele (`nr`), isiXhosa (`xh`), isiZulu (`zu`), Sepedi (`nso`), Sesotho (`st`), Setswana (`tn`), siSwati (`ss`), Tshivenda (`ve`) and Xitsonga (`ts`) are selectable with **(under review)** after the language name. The current release provides partial language support, not a fully translated curriculum.

## Provenance and precedence

1. An approved override with a matching English source, reviewer and date wins.
2. Existing isiZulu wording (`legacyZuMessages.json`, `contentZu.ts`, `stringZu.ts`) is preserved. Its provenance has not been retroactively declared human-approved.
3. Generated drafts apply when there is no usable existing translation and the captured English source still matches.
4. Missing, stale, empty or structurally invalid translations fall back to English. Malformed legacy wording remains on disk for review; it is not rewritten by generation.

`drafts/source.json` captures the English UI source. `drafts/content-source.json` captures title sources. Exact-source lesson strings are keyed by their English text. Draft generation never writes `reviewed/overrides.json`. New English edits require fresh draft review; approvals are tied to the source text too. Browser language and country do not override a saved user choice. Local choice survives reload, is synchronised to the user's existing profile when signed in, and wins over stale remote metadata. Blocked browser storage still allows switching for the current session.

All generated entries are **needs human review**. Neither structural tests nor this release claim linguistic confidence, human review, cultural validation or endorsement. See [SOURCES.md](SOURCES.md) for the actual references and the narrow scope of term verification.

## Coverage and known gaps

Run `npm run i18n:check` for current counts and structural failures. The initial catalog has 113 shared messages, 274 course/unit/lesson title keys and 20,016 unique strings discovered in course content (including descriptions, questions, answer options and feedback). This inventory is not a count of screens. The expanded source inventory also includes interface, rich-text, PDF and secured exam wording. See FULL-COVERAGE-20261026.md for the current release status.

- All 113 shared message keys have draft entries in each language. Two proper-language labels intentionally match English. The shared catalog covers navigation, settings language controls, authentication/recovery, onboarding, goals, lesson actions and read-aloud accessibility labels.
- All 22 course titles have generated drafts. Xitsonga `course.credit-debt` is held in English because the draft does not clearly distinguish credit access from outstanding debt; an approved correction can release it. Other titles resolve through preserved or approved wording before generated bulk drafts. Missing or invalid entries use English.
- Lesson presentation fields now resolve across all 205 lessons, including questions, answer options and explanations. Bulk drafting is still incomplete, so some passages use English. IDs, scoring, answer indices and numeric answer values are not translated.
- Budget tools, calculators, reports, profile/settings, legal pages and RE5 use the translation resolver. Coverage is measured separately from integration. User-provided text is preserved; unresolved app wording uses English. Secured exam drafts and overrides remain server-only.
- Read-aloud buttons and voice settings appear only when the device supplies a voice for the selected language. Voice choices are saved per language; old preferences are honoured only when the language matches. English is never silently substituted as a voice for another language. Voice availability varies by device. Mixed English fallback/translated passages still need a per-passage audio review.
- The brand owner requested the approximate pronunciation “Notto” for English speech. Updated by the brand owner on 26 October 2026. Speech input uses that hint for non-Nguni voices; native Nguni voices retain “Notho”. Displayed brand spelling is unchanged. Exact output depends on the device voice and has not received linguistic audio validation.
- The user-facing translation explanation was removed at the owner’s request on 24 October 2026. Internal provenance and reviewer safeguards remain unchanged.
- Rendered count messages use complete singular/plural phrases selected with Intl.PluralRules. Numeric requirements and numbered placeholders are preserved. Unsupported ICU plural/select syntax is rejected rather than displayed or approximated. Do not concatenate singular nouns with a count.

## Priority human review

Every generated phrase requires review. Prioritise these exact groups in **every language**, including preserved isiZulu:

| Keys / screens | Why / what to review |
| --- | --- |
| `auth.landingFree` | Education versus regulated financial advice: make sure the disclaimer is not softened or changed into “an idea”. |
| `auth.landingBudget` | Privacy promise about in-memory statement reading and not retaining files; do not imply no financial data is ever stored. |
| `auth.errorAge`, `auth.errorPasswordLen`, `onboarding.usernameRules`, `onboarding.errMin/errMax/errChars` | Eligibility and security requirements; distinguish characters from alphabetic letters and preserve numbers, ranges and symbols. |
| `auth.reset*`, `auth.checkInbox`, `auth.clickLink`, `auth.errorCredentials`, `auth.errorDisposable` | Security, account recovery, verification and allowed email addresses; ensure instructions cannot mislead users. |
| `onboarding.usernameBody` | Public visibility and required choice. |
| `course.credit-debt`, `course.taxes`, `course.*insurance*`, `course.retirement`, `course.estate-planning`, `course.re5-exam-prep` | Credit facilities versus outstanding debt, tax/legal/regulatory meaning, retirement and inheritance; titles do not validate underlying content. |
| `onboarding.goal.*`, `goals.claim*` | Saving versus storing, investing versus planting, reward collection versus financial claims. |
| Existing isiZulu HTML/quiz strings | Check negation, percentages, named institutions, correct-answer meaning and wording that no longer matches the English lesson. Existing corrections remain preserved. |

Specific unresolved lexical/register questions: isiNdebele password loanword and budget terminology; siSwati investment and budget terminology; Sesotho budget register; Setswana credit/debt distinction and availability wording; Tshivenda payslip and UI settings terminology; Xitsonga credit/debt distinction and settings terminology; Sepedi computing vocabulary. For Afrikaans check consistent informal `jy/jou`; for isiXhosa/isiZulu check grammatical agreement and borrowed technical terms. These are review flags, not claims that other phrases are verified.

## Export and import corrections

No human pack is required to build, test or deploy. Use an output path that does not already exist:

```sh
npm run i18n:export -- --locale nr --out /tmp/notho-nr-review.json
npm run i18n:import -- --file /path/to/approved-rows.json
npm run i18n:import -- --file /path/to/approved-rows.json --apply
npm run i18n:check
npm run test:unit -- src/lib/__tests__/i18n.test.ts
npm run build
```

Export rows contain the locale, namespace/key, exact English source, current translation, status, priority, reviewer and review date. Review the wording in its actual screen/lesson and submit **only approved rows**. Set `status` to `approved`, provide `reviewer`, and a `reviewedAt` date (`YYYY-MM-DD`). The importer does not grant approval itself. The first import command is a dry run. Unknown languages/keys, changed English, broken placeholders/markup/numbers/brands, duplicate rows and missing approval attribution reject the entire batch.

`--apply` merges corrections without deleting other languages or keys, creates a timestamped `.bak` of the existing store, and uses an atomic rename. An existing approval cannot change unless the operator explicitly supplies `--replace` after reviewing the conflict. Inspect the diff, rerun checks, then redeploy. Keep backups private if reviewer identities are sensitive. Source code, not a production browser, is the approval boundary.

The existing Settings → Send Feedback channel remains available. “Report a translation” on the beta notice creates a **local JSON feedback file** with locale, screen path (no query parameters), selected/entered phrase and suggested correction. For known shared phrases it also identifies the English source/key. The user can share the file with reviewers or paste it into the existing feedback channel. The app does not silently send it, capture account/financial data, or promote feedback to approved wording. The form currently uses English support instructions.

## South African Sign Language (SASL)

SASL is an official language and is **not supported by this text release**. There is no SASL locale option or text pack. A separate project must commission fluent SASL presenters/translators and Deaf reviewers; create concept-led signed videos with financial subject review; obtain consent and usage rights; check regional variation and comprehension with Deaf users; provide accessible video controls, captions/transcripts, discoverable navigation and low-bandwidth options; and version signed content against the English curriculum so corrections trigger a new review. Text translation and text-to-speech cannot substitute for this work.

## Expanded and secured catalogs

`node scripts/compile-i18n-drafts.mjs --write` compiles only validated generated entries and produces source/context snapshots. It does not create approvals. Review exports include compiled UI and curriculum sources. Use `node scripts/i18n.mjs export --private --locale af --out private-review.json` for secured exam wording. Import the reviewed file with the same `--private` flag; dry run remains default, and `--apply` creates a backup before saving. Private approvals stay in `src/i18n/reviewed/private-overrides.json`, which is imported only by server code. Do not place private exam corrections in the public override file.

Generated checkpoint review notes do not count as human approval. Full-coverage claims require resolving/classifying missing, rejected and unchanged entries in the bulk report. Rich UI fragments and plural forms also require contextual inspection.
