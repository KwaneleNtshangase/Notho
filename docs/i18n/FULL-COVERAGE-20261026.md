# South African language release, 2 November 2026

Deployed at https://www.notho.co.za on 2 November and verified on 3 November 2026. Production verification and rollback are recorded below.

## Scope

All 920 main batches, 111 supplemental batches and the final correction passes completed. Every one of the 26,339 distinct inventoried English sources has a draft attempt for each of the ten languages. The inventory covers 22 courses, all 205 lessons and their question variants, shared controls, public pages, calculators, budgets, reports and secured exam responses. UI candidates include internal identifiers and genuinely shared words, so these totals are not a claim that every displayed phrase is translated correctly.

English stays the default. Other languages display `(under review)`, with a direct English recovery action and saved selection. There is no “About these translations” panel. Unsupported speech controls are hidden; matching device voices use the selected language. Non-Nguni voices receive the speech-only brand hint `Notto`; native Nguni voices retain `Notho`. Visible branding is unchanged.

Approved reviewer wording takes priority, followed by preserved legacy and authored drafts, then generated bulk drafts. Human files were preserved. Invalid or unavailable drafts use English. Feedback records locale, route and phrase locally; review export/import supports later human corrections. No wording is claimed to have human or cultural validation.

## Remaining review gaps

Zero inventoried sources lack a generation attempt. Rejected drafts and unchanged English remain, so the strict full-translation gate still fails. This release uses the requested English fallback where a usable draft was not obtained after correction passes. Some unchanged entries are names, abbreviations or internal UI candidates; others are complete passages requiring correction. Do not call this 100% translated.

| Language | Rejected drafts | Unchanged, unclassified | Effective public English fallbacks |
| --- | ---: | ---: | ---: |
| af | 8 | 210 | 238 |
| nr | 21 | 183 | 223 |
| xh | 9 | 190 | 218 |
| zu | 9 | 186 | 196 |
| nso | 23 | 306 | 350 |
| st | 10 | 264 | 293 |
| tn | 20 | 306 | 344 |
| ss | 111 | 265 | 389 |
| ve | 52 | 368 | 431 |
| ts | 61 | 349 | 426 |

Counts overlap and must not be added together. Effective fallbacks include all resolver layers and UI candidates. `coverage.json` contains the structural summary; local phrase-level evidence is under `output/i18n-generation-v3/gaps.json`, `review-metadata.json` and `output/i18n-verification/effective-props-20261102.json`. Secured exam sources stay out of public packs. The Xitsonga credit/debt title remains deliberately held for review.

Priority review: tax and legal duties, credit versus debt, interest rates and calculations, investment/retirement risks, insurance exclusions, RE5/FAIS answers and explanations, consent, privacy, deletion and POPIA, financial metaphors, number order and dynamic plurals. Source financial examples were preserved, not fact-updated by translation.

## Sources and provenance

See [SOURCES.md](SOURCES.md) for consulted URLs and their precise limits. DSAC/FSB's multilingual financial glossary supports specific headwords, not whole translated sentences. PanSALB/NLU resources identify orthography and dictionary review routes; some pages were inaccessible and are not claimed as lexical verification. SANLU, FSCA, SARS, Stellenbosch and North-West University resources have their consulted scope recorded separately.

Own context-aware drafts and free Google/Gemini generated drafts are labelled in reviewer evidence. No Google website interface copy was substituted. No paid translation services were added. Production credentials were unchanged. SASL has no text pack and is not claimed as supported; it needs reviewed signed videos, captions, accessible playback and Deaf-community review.

## Verification

- 876 unit tests across 84 files and TypeScript passed after the production merge and calculator fix.
- Catalog integrity checks cover placeholders, numeric sequences, markup, plural handling, invalid/missing fallback, override priority, language persistence and voice matching. The strict completeness gate remains separate and fails on the documented review gaps.
- All six mobile browser scenarios passed on the preceding 920-batch preview. Final release browser/build results are appended below.
- Representative mobile lesson and calculator screenshots were inspected. Long headings fit without horizontal overflow. The inspection found and fixed concatenated calculator assumptions; final browser assertions verify translated assumptions.
- All 1,270 exclusive server-only source passages are absent from every public language pack. Two streaming protocol tests passed. PDF tests verify preserved Tshivenda marks.
- Final curated lint scope: 195 files, 89 errors and 605 warnings. The additional error is in the newly included, existing PersistentAppTabs effect; counts in previously checked files are unchanged. The project is not lint-clean; lint is not an existing CI release gate.
- The latest production loading skeletons and hidden-until-share card behaviour from `39afe20` were merged and preserved. Unrelated original workspace changes remain untouched.

## Release and rollback

Previous production: https://notho-mwn5gcosr-notho.vercel.app (`dpl_9sHpyw276UtZTPqjTERsKr2MvXGM`), based on `39afe20`. Vercel project `prj_4m4b8pLMEx3QrDbkpAIzSsJiaOGX`, team `team_4WDYIteZUPUsv2RylFEkliTh`, canonical https://www.notho.co.za.

From the linked release worktree, restore the previous deployment with:

```sh
npx vercel rollback https://notho-mwn5gcosr-notho.vercel.app --yes
```

Then check the canonical alias and `/api/health`. For a durable source rollback, revert the release changes on main through the normal Git workflow, preserving later unrelated commits. Do not force-reset main. No schema migrations were added.

## Final preview verification

The complete release preview https://notho-b7mc06bkd-notho.vercel.app (`dpl_2JR2ofPHkbCvEhhSUdcuZ2ADaeo9`) built successfully and returned HTTP 200 from `/api/health`. All 18 browser scenarios passed on desktop, tablet and 320px mobile, including the calculator assumptions regression. The release worktree separately passed 876 unit tests, TypeScript and catalog integrity with zero failures. The source snapshot is committed on `codex/sa-language-release`; it incorporates current production `39afe20`.

The final screenshot audit added 127 previously omitted custom-component helper texts (settings descriptions, calculator tooltips, public guide introductions and admin hints). All 1,270 additional language drafts were attempted. Browser checks now wait for translated settings copy before capturing screenshots.

## Verified production release

Published 2 November 2026 and verified on 3 November: https://www.notho.co.za. Immutable deployment: https://notho-baht8pcjq-notho.vercel.app (`dpl_44rbekmZ5EUHrrNk4wXgbXeCTp8z`), application commit `18ab900` on main. Vercel reports READY and the canonical domain resolves to this deployment. `/api/health` returned HTTP 200. All ten publicly served language files returned HTTP 200 and their SHA-256 hashes exactly matched the release files. All six production mobile browser scenarios passed, including fully loaded settings/helper text, lesson navigation, speech matching, Notto, English recovery, persistence and fallback. Screenshots are retained under `output/i18n-verification/browser-production-20261103/`.

The release is deployed; the remaining English fallback and review gaps above are still present. No human/cultural validation is claimed. Rollback remains the pre-release `notho-mwn5gcosr` deployment documented above.
