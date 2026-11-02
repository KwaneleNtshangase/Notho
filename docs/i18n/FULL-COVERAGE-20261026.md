# Full translation request, updated 29 October 2026

**Full translation and the full release are not complete.** Production currently serves commit `8859536`, deployment `dpl_H3EoHgaud5UdoYf79V4ToEtmuFtZ`, at https://www.notho.co.za. A separate production release landed on 28 October at 18:50 SAST; its health check returned HTTP 200. The earlier Notto release is historical, not the current production baseline. The expanded implementation and partial bulk packs are deployed for testing at https://notho-4a1scnr2w-notho.vercel.app (`dpl_4vGw7VEVfNh8A8rVGkP5g3M5xabv`). This is a protected preview, not a full production release.

## Scope and progress

The inventory covers 22 courses and 205 lessons, including all question-bank variants. It currently contains 26417 source rows and 26205 unique English strings. There are 1,270 server-only source rows. UI candidates include internal/unchanged terms requiring classification; these totals must not be described as a linguistic coverage percentage.

Implemented locally:

- More than 2,000 text sites and 146 labelled native controls use the translation resolver, across 94 initial UI files. Complete templates preserve values; user names, transaction descriptions and form option values are protected.
- All lesson presentation fields are mapped without changing answer indices, IDs, numeric answers or calculator presets.
- Active-language dictionaries load on demand. Missing, malformed and invalid translations use English. Existing own drafts, original isiZulu and attributed reviewer overrides remain ahead of bulk drafts.
- Secured exam dictionaries remain server-only. Responses are translated only after answer redaction. Private review overrides are separate from client imports.
- Search includes the loaded language. Share-card copy is localised, and language changes refresh its preview.
- Converted count labels use complete singular/plural phrases and `Intl.PluralRules`; numbered placeholders can reorder without being mistaken for numeric quantities.
- Original human/legacy files and unrelated Android work are preserved.

## Bulk status

These counts describe additional structurally accepted bulk records, not all existing app translations and not human-reviewed wording.

| Language | Public drafts | Private drafts | Missing | Rejected | Unchanged, unclassified |
| --- | ---: | ---: | ---: | ---: | ---: |
| af | 24707 | 1265 | 100 | 133 | 226 |
| nr | 24439 | 1265 | 100 | 401 | 207 |
| xh | 24677 | 1269 | 100 | 159 | 284 |
| zu | 24672 | 1270 | 100 | 163 | 268 |
| nso | 21880 | 1166 | 2899 | 260 | 330 |
| st | 22024 | 1166 | 2899 | 116 | 287 |
| tn | 21961 | 1165 | 2899 | 180 | 316 |
| ss | 21305 | 1152 | 3175 | 573 | 305 |
| ve | 21376 | 1146 | 3175 | 508 | 506 |
| ts | 21645 | 1157 | 3175 | 228 | 1129 |

Compiled 29 October. Exact product names, brands and symbolic values are now classified separately as preserved English source, not translated or approved wording. Unchanged counts overlap accepted drafts and are not an additional translation total. Structural acceptance does not establish linguistic correctness.

Google's free public endpoint stopped accepting automated requests (HTTP 429). The local MADLAD experiment produced unusable samples and contributed no translations. The new, privately saved Gemini key works. Initial unhelpful samples were quarantined. Glossary-guided generation now uses the standard free-tier `gemini-3.5-flash-lite` API; the batch endpoint rejected the sample with HTTP 400. No paid translation requests have been authorised or run. Production credentials remain unchanged.

**857 of 920 main generation requests are checkpointed.** The remaining 63 requests and newer supplemental sources are incomplete. The valid private key is working, but the free daily quota for Gemini 3.5 Flash Lite is exhausted. Alternate 3.6 Flash/3.5 Flash samples also reached their shared free daily limit. A 3.1 Flash Lite sample was rejected for consequential semantic errors and contributed no translations. A glossary-guided Gemini 3.8 Flash standard free-tier continuation is now running for the six unfinished languages. Its samples passed structural checks, with financial terminology and metaphor concerns retained for human review. The original Flash Lite quota remains exhausted. No paid requests were made.

Current structural counts are in `output/i18n-generation-v3/validation.json`; raw results are checkpointed separately in `output/i18n-batch-generation/`. The plan is `output/i18n-batch/full-drafts-large-20261027.json`, with completed request IDs in its `.standard.json` companion. Two computer restarts interrupted generation/builds on 27 October; saved batches were recovered. A `.stop` file beside a job pauses dispatch after its current request. Remove that task-specific stop file only when intentionally resuming.

Many lesson bodies and UI strings still fall back to English, especially in Sepedi, Sesotho, Setswana, siSwati, Tshivenda and Xitsonga. The Xitsonga credit/debt title remains deliberately held for review. Dynamic reports, rich-text UI fragments, unchanged terms and imported user content need final contextual classification before a full-coverage claim.

## Checks and continuation

- 874 unit tests across 84 files passed on 28 October, including in-flight language changes for exam mutations and explanations.
- TypeScript and catalog structural validation passed. The newest preview production build completed successfully. Full coverage is a separate failing gate.
- All 18 preview browser scenarios passed across the initial run and targeted reruns on 28 October. The initial run passed 11; reruns resolved service-worker/test-mock races, a multi-screen timeout and temporary internet/DNS failures. The final mobile run blocks service workers so they cannot bypass request mocks or reload during navigation. This verifies translation screens, not the PWA update lifecycle. Tests and screenshots are retained under `output/i18n-verification/`.
- Representative Setswana settings/lessons and the Afrikaans calculator were visually inspected. At 320px the long calculator heading wraps; there is no horizontal clipping. Missing phrases still use English. This is not full linguistic coverage.
- Private-source isolation passed: all 1,270 server-only source passages are absent from all ten public language packs.
- Browser checks cover persistence, invalid locale, restricted storage, English recovery, accessible sign-in, feedback, settings/navigation, course/lesson screens, matching voice selection and hidden unsupported speech controls. These checks do not prove complete linguistic coverage.
- `node scripts/compile-i18n-drafts.mjs --require-complete` remains a strict failing gate while gaps/rejects/unchanged items remain. Detailed checkpoints, review gaps and run evidence are under `output/i18n-generation-v3/` and `output/i18n-verification/`.

Continue the saved standard job with `node scripts/i18n-batch.mjs standard --job output/i18n-batch/full-drafts-large-20261027.json --confirmed-free-project --workers 1`. It skips saved completed requests and stops on service failures. The source inventory has changed since that plan: regenerate the inventory and make a final supplemental plan after the main run. Compile, review gaps and repeat checks before deploying the isolated source snapshot to the established Vercel production project. Do not publish old unused hashed dictionaries or private exam files under public assets.

Additional local work on 27 October: whole rich-text sentences (including legal negation and links), translated PDF rendering with Noto Sans, private-name protection in exports, calendar fallbacks for browsers lacking language data, and API-inventory filtering to exclude internal prompts. 848 unit tests passed. The PDF test preserves Tshivenda marks in rendered/searchable text. The full preview build has completed. Browser verification and translation gap resolution remain before production release.

## Priority human review

Prioritise tax thresholds and obligations; interest, debt and credit distinctions; insurance exclusions; retirement/investment risk; financial calculations and numbers; RE5/FAIS questions, explanations and correct answers; consent, privacy, account deletion and POPIA wording; and singular/plural forms around dynamic counts. All generated wording remains under review. Sources and precise limits are recorded in `SOURCES.md`. SASL still requires separately produced and reviewed signed content, captions, accessible controls and Deaf-community review; no text pack represents SASL support.

## Production synchronization

The 28 October production update adds skeleton loading improvements and idle budget warming in three files. These changes were fetched from `origin/main` and applied cleanly to the local implementation without modifying the Git index or unrelated local work. New loading text and accessibility labels use the translation resolver. The existing preview predates this synchronization and must be rebuilt before release. The original files and exact upstream patch are preserved in `output/i18n-verification/production-sync-20261028/`.

## Release and rollback

Current verified immutable deployment: https://notho-jcx12mvhz-notho.vercel.app. No full-coverage release has been published. Keep this as the rollback target for the next release:

```sh
npx vercel rollback https://notho-jcx12mvhz-notho.vercel.app --yes
```

Run from the linked Notho project, then inspect the canonical alias and `/api/health`. The historical Notto increment was https://notho-694ndmf2c-notho.vercel.app. Recheck the active deployment immediately before publishing and retain that deployment as the rollback target. Rollback has not been executed.

At 19:53 SAST on 28 October, two additional main batches were saved during a resume attempt. The next calls hit the confirmed 500-request daily free quota again, with a service-provided retry delay of about 13 hours. No generator remains active. The latest production changes through `8859536` (sidebar, iOS OAuth noise, unsubscribe theme and alert handling) were merged into the local implementation, preserving translations. TypeScript and 871 unit tests passed. The published preview still contains the earlier 855-batch snapshot; local changes require a fresh build before release.

## 29 October verification

The compiler and job planner now share whitespace, markup, numeric, placeholder and line-break validation, so invalid drafts remain eligible for repair. Public effective-coverage counts include approved, legacy, own and bulk wording in their actual priority order. They are retained in `output/i18n-verification/effective-coverage-857-final.json`; raw bulk coverage alone is not app coverage. Pure names and symbolic values are classified separately. The source inventory excludes non-displayed CSS, event and database identifiers. The latest local code has passed 874 unit tests and TypeScript; the published preview still predates these changes. A full-repository lint invocation included archived staging trees and generated output; use the matching source-file scope for comparison (88 existing errors before the latest change).

The fresh protected preview at https://notho-4a1scnr2w-notho.vercel.app completed its production build on 29 October. Its health endpoint returned HTTP 200. All six desktop scenarios and four representative mobile/tablet scenarios passed. The equivalent 171-file lint scope remains at 88 existing errors and 604 warnings, matching the prior result; it is not lint-clean. Thirteen focused regression tests and TypeScript passed. Private-source isolation was repeated with 1,270 exclusive secured sources and zero public-pack leaks. This preview contains the 857-batch snapshot, not the in-progress newer generation.
