# Language and read-aloud refinement, 24 October 2026

Production: https://www.notho.co.za

Release: https://notho-jud12qubr-notho.vercel.app (`dpl_59GqqtVGqjHWkBnesigJDvMWSB6K`). Existing project ID: `prj_4m4b8pLMEx3QrDbkpAIzSsJiaOGX`. Vercel confirmed READY and the production aliases; the health endpoint returned `status: ok` with this deployment ID.

## Changes

- Removed the translation explanation and “About these translations” section at the owner's request. Language options and the compact status label now use “Afrikaans (under review)” and equivalent language names. English remains unlabelled. English recovery and translation feedback remain available.
- Removed em dashes from the generated draft phrases. Preserved existing isiZulu wording and approved overrides; their hashes match the previous release. Research records and reviewer approval requirements are retained internally.
- Read-aloud buttons and voice settings are absent unless the device supplies a voice matching the selected language. Late-arriving voices are detected. A saved English voice cannot be used for another language. Voice choices are stored per language, with matching legacy preferences preserved. Changing language or leaving the speech component cancels speech.
- “Test voice” and lesson read-aloud use the owner's approximate “Noto” pronunciation hint for non-Nguni voices. Native Nguni voices retain the original spelling. The displayed brand name remains Notho. Tests verify speech input and voice selection, not the acoustic output of every device voice.
- Excluded saved release artifacts in `output/` from TypeScript compilation. No new dependencies, paid services, database changes or environment-variable changes.

## Verification

- Full unit suite: 78 files, 834 tests passed. Final translation/speech unit checks: 23 passed.
- Production build, TypeScript, translation integrity check and `git diff --check` passed. ESLint passed for the changed speech components, language UI and browser tests. This does not claim a clean repository-wide lint result.
- Local browser matrix: 15 passed across desktop, tablet and mobile. Following the final speech cleanup adjustment, all three authenticated screen/speech cases passed again.
- Voice tests supply controlled device voice inventories. They cover unsupported languages hiding both settings and lesson controls, late voice availability, rejecting a saved English voice for Afrikaans, correct utterance language/voice, and the Noto hint. Unit tests cover all eleven locales, regional preference and distinguishing Southern from Northern Ndebele.
- Production browser matrix: **15 passed** across desktop, tablet and mobile on the canonical live URL. Production health and deployment identity also verified.
- Inspected desktop and mobile settings screenshots and the live Afrikaans page. No overflow or clipped controls in the tested layouts. Screenshot: `output/i18n-refinement-20261024/production-afrikaans.png`.

## Translation scope and sources

The same ten non-English languages remain selectable: Afrikaans, isiNdebele, isiXhosa, isiZulu, Sepedi, Sesotho, Setswana, siSwati, Tshivenda and Xitsonga. Coverage and English fallbacks are unchanged. Most lesson bodies and some feature screens remain English. The Xitsonga credit/debt course title remains held for review. Mixed-language passages still need an audio review. Voice availability depends on the device.

No additional terminology claims were introduced. See [SOURCES.md](SOURCES.md) for the consulted references and their limits, and [REVIEW.md](REVIEW.md) for reviewer import instructions and priority financial/account/privacy wording. Human review and cultural validation are not claimed. SASL remains unsupported and requires separately reviewed signed content.

## Rollback and source preservation

The previous deployment is https://notho-8mpwpasj7-notho.vercel.app (`dpl_HXbMeg3hbmivahoBUX6RytMkrdMq`). To restore it with the existing Vercel login:

```sh
npx vercel rollback https://notho-8mpwpasj7-notho.vercel.app --yes
npx vercel inspect https://www.notho.co.za
curl --fail https://www.notho.co.za/api/health
```

Rollback has not been executed. No database rollback is needed. This restores the previous translation notice and previous speech behaviour.

The isolated deployment source, SHA-256 overlay manifest and check logs are saved in `output/i18n-refinement-20261024/`. This builds on the prior release's archived Git baseline. Source changes remain local and uncommitted, so include them in future Git-based releases. The unrelated Android Gradle modification and unrelated untracked files were preserved and excluded from the deployment overlay.
