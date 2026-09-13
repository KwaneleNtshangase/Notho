# Notho — Lesson Banks: COMPLETE

**Status as of this session: every lesson that should have a bank has one.**
Paste this whole file into a new chat to continue. It is self-contained.

## What this project is
**Notho** (Vercel project `fundi-finance`) — a Duolingo-style South African
personal-finance learning app. **Next.js (App Router) + Supabase.**
Working folder: `/Users/KwaneleNtshangase/Developer/notho`.

## The goal of this work stream — achieved
Give **every lesson a "lesson bank"** so:
- Two users doing the same lesson rarely get identical questions, and repeating a
  lesson yields different questions (like Duolingo).
- All questions are **premium, hand-written**, SA-accurate, in a plain concrete
  voice — **no AI-lazy filler**, plausible distractors, one defensible answer.
- Spaced repetition resurfaces hard/missed questions; a lesson isn't complete
  until every question is answered correctly (mastery loop).
- **Uniform premium coverage — every lesson is a bank, no gaps/holes.**

## Final coverage — 100%

| Metric | Value |
|---|---|
| Lessons in `CONTENT_DATA` | **205** |
| Bank-backed lessons | **205 (100%)** |
| Slots | **912** |
| Hand-written variants | **2 636** |
| Concepts in `concepts.ts` | **173** |

**Every lesson rotates its questions.** Verified by `scripts/lesson-rotation-check.mjs`,
which runs the real `resolveLessonSteps()` over all 205 lessons for 3 simulated users ×
6 attempts: **0 lessons repeat an identical paper, averaging 5.70 distinct papers out of
6 attempts**, and no two users get the same first attempt.

**This session added 86 lessons → 436 slots → 1 208 variants → 27 new concepts.**

### The RE5 mock exams
`re5-mock-a` and `re5-mock-b` used to show all 50 questions in a fixed order, every
time. They are now **50 slots × 2 variants each = a 100-question pool per paper**, so
each sitting draws a different full-length 50-question exam over identical topic
coverage — the same way the real RE5 samples from a bank. Mock B's variants are
scenario-led and deliberately harder than Mock A's.

## Architecture (key files)
- **Bank data:** `src/data/banks/*.ts` — one file per course, plus
  `<course>-extra.ts` for that course's extra lessons. Each exports
  `{COURSE}_BANKS: Record<"courseId::lessonId", { layout, slots }>`.
  All registered in `src/data/banks/index.ts` (import + spread into `LESSON_BANKS`).
- **Types** (`src/data/content.ts`): a bank lesson has `layout`
  (`LessonLayoutItem[]` = `info` steps + `{ slot: slotId }` refs) and `slots`
  (`QuestionSlot[]`, each `{ slotId, conceptId, variants: [{ variantId, step }] }`).
  `step` is an mcq / scenario / true-false / fill-blank (fill-blank answer is numeric).
- **`src/data/applyBanks.ts`**: attaches `layout`+`slots` to any lesson whose
  `${course.id}::${lesson.id}` key matches a bank. Runs last in the content pipeline
  (`applyBanks(applyReinforcement(mergeContentExtras(ALL_COURSES)))`).
- **`src/lib/lessonBank.ts`** (Cursor's file — don't edit): `resolveLessonSteps()`
  picks one variant per slot (seeded, anti-repeat). Also `resolveLegacyLessonSteps()`
  for any remaining legacy lessons.
- **`src/lib/lessonMastery.ts`** (Cursor's): Duolingo re-queue / mastery.
- **`src/data/concepts.ts`**: `CONCEPTS` with `reviewCard`s (spaced-repetition). Every
  slot's `conceptId` must exist here.
- **Logging:** `src/lib/questionAttempts.ts` + migration
  `supabase/migrations/20260722120000_question_attempts.sql` (table + RLS **live on
  remote**; migration history is drifted — fix with
  `npx supabase migration repair --status applied 20260722120000`).

## Bank files (all registered in `src/data/banks/index.ts`)

Core: `money-basics`, `salary-payslip`, `banking-debit`, `credit-debt`,
`emergency-fund`, `insurance`, `investing-basics`, `sa-investing`, `property`,
`taxes`, `scams-fraud`, `bible-money`, `money-psychology`, `retirement`,
`rand-economy`, `crypto-basics`, `business-finance`, `advanced-tax`,
`estate-planning`, `advanced-investing`, `business-finance-advanced`, `re5-exam-prep`.

Extras (one per course, added over the last two sessions):
`money-basics-extra` (8), `salary-payslip-extra` (7), `banking-debit-extra` (5),
`credit-debt-extra` (10), `emergency-fund-extra` (1), `investing-basics-extra` (9),
`sa-investing-extra` (2), `property-extra` (1), `taxes-extra` (5),
`scams-fraud-extra` (4), `bible-money-extra` (8), `money-psychology-extra` (7),
`retirement-extra` (5), `rand-economy-extra` (8), `crypto-basics-extra` (5),
`business-finance-extra` (7), plus `re5-mock-a` (1) and `re5-mock-b` (1).

**variantId prefixes** (keep unique per file): `mbx- spx- bdx- cdx- efx- ibx- sax-
ppx- txx- sfx- bmx- mpx- rtx- rex- cbx- bfx- r5a- r5b-`.

## Hard rules (enforced by `src/data/__tests__/contentQuality.test.ts`)
- Every `slotId` and `variantId` **globally unique**. Use a per-file variantId prefix.
- Every slot has a `conceptId` that **exists in CONCEPTS**, and **≥2 variants** (use 3).
- Every lesson has **>3 questions** (banks use 4 slots → 4 questions).
- Voice: plain, concrete, SA context (rands, SARS, local names/examples), empathetic;
  distractors plausible; exactly one defensible correct answer. Option **positions are
  shuffled at render**, so `correct: 0` in data is fine; but avoid making the correct
  option the longest — the test ratchets on length bias.
- Rotate question type within a slot (mcq / true-false / scenario / fill-blank).
- **fill-blank answers are checked with a ±10% tolerance** (`LessonView.tsx`). Don't
  use percentages as answers — 10% of "10.5" makes the question trivial. Use rand amounts.

## Accuracy — figures verified THIS session (all now in `docs/SA-REGULATORY-FIGURES.md`)
These corrected stale values found in the legacy content:

- **SARB inflation target is now a 3% POINT target with a ±1pp band** — the old
  "3–6% range" is out of date and must not be used (note: `docs/QUESTION-VOICE-GUIDE.md`
  still contains a 3–6% example — worth fixing).
- **Single Discretionary Allowance is R2 million** per calendar year (doubled from
  R1m in Budget 2026), no SARS clearance. FIA R10m with approval. Calendar year, no rollover.
- **SA exited the FATF grey list on 24 October 2025** (listed Feb 2023).
- **SEFA + SEDA + CBDA merged into SEDFA** on 1 Oct 2024 — don't reference SEFA/SEDA
  as live agencies. NEF is separate (B-BBEE mandate).
- **IRP5 code 4102 is PAYE**, not 4001 (4001 = retirement fund contributions,
  4005 = medical scheme fees, 3601 = income). Legacy content had this wrong.
- **Life policies are deemed property for estate duty** even when paid to a nominated
  beneficiary — nomination avoids executor's fees and delays, not duty. A **spouse**
  beneficiary gets the s4(q) deduction (no duty, no fees).
- **Retirement fund death benefits** are distributed by **trustees under s37C**; the
  nomination form guides but doesn't bind them.
- **Living annuity capital is NOT forfeited to the insurer on death** — it passes to
  nominated beneficiaries. Drawdown band is 2.5%–17.5%.
- **Transfer duty exemption (R1 210 000) applies to ALL buyers**, not only first-time
  buyers. First Home Finance (formerly FLISP) is the first-time-buyer subsidy.

Everything else follows the existing `docs/SA-REGULATORY-FIGURES.md` (TFSA R46k/R500k,
RA 27.5% capped R430k, threshold R99k, CGT 40%/R50k/R3m, estate duty R3.5m abatement,
MTC R376/R376/R254, UIF ceiling R17 712 → R177.12, VAT 15% / R1m threshold,
company tax 27%, Reg 28 offshore 45%, NFO 0860 800 900, debit-order dispute 60 days).

## Verification status (this session)
- `npx tsc --noEmit` — **clean**.
- `scripts/lesson-bank-audit.mjs` — **205/205 banked, 0 errors**: no orphan bank keys,
  no broken slot-refs, no duplicate slot/variant IDs, every conceptId exists, every
  slot has ≥2 variants, every lesson has >3 questions.
- `scripts/lesson-bank-qc.mjs` — over the 1 208 new variants: **0 duplicate question
  stems, 0 banned phrases, 0 length-bias warnings**; type mix 442 mcq / 392 scenario /
  329 true-false / 45 fill-blank; true-false 56% "true".
- `scripts/lesson-rotation-check.mjs` — **PASS**: all 205 lessons vary their questions
  between attempts (avg 5.70 distinct papers per 6 attempts, 0 failures).
- **Not run in this sandbox:** `npm run build` and the full `vitest` suite (they OOM
  here). **Cursor should run both.**

## Handy commands
```bash
npx tsc --noEmit
node scripts/lesson-bank-audit.mjs      # structural integrity + coverage
node scripts/lesson-bank-qc.mjs         # voice/quality QC over authored banks
node scripts/lesson-rotation-check.mjs  # proves every lesson rotates
npm run build
node --max-old-space-size=3000 ./node_modules/.bin/vitest run --pool=forks \
  --poolOptions.forks.singleFork=true src/data/__tests__/contentQuality.test.ts
```

Run all three scripts after every authoring batch. `lesson-bank-audit.mjs` must print
`ERRORS 0`; `lesson-bank-qc.mjs` must print 0 duplicate stems and 0 banned phrases;
`lesson-rotation-check.mjs` must print `RESULT: PASS`.

## Division of labour
- **Content agent:** authors `src/data/banks/**` + `src/data/concepts.ts` and edits
  content data files.
- **Cursor:** owns `src/lib/**` (lessonBank, lessonMastery), tests, page.tsx,
  migration — has the working build/test env. Don't edit its files.
- **AG:** read-only QA reviews.

## Deploy (Cursor prompt — the sandbox can't push)
```
On the notho repo (main), the working tree has the completed lesson-bank content:
the new src/data/banks/*-extra.ts files plus banks/index.ts, src/data/concepts.ts
(+27 concepts), docs/SA-REGULATORY-FIGURES.md and HANDOFF-NEXT-CHAT.md.
tsc passes clean on this tree. Please:
  npx tsc --noEmit && npm run build && npx vitest run
  git add -A
  git commit -m "feat(content): premium lesson banks for all remaining lessons (203/205 banked, 2436 variants)"
  git push origin main
This triggers the fundi-finance Vercel production deploy. Confirm it goes green.
If the CI 'health check branding assertion' fails, report the error — do NOT revert
the content to fix it.
```

## Stale-figure sweep (done this session)
Every **user-facing** surface was swept and corrected. User-facing means three places,
not just lessons:

1. **`src/data/banks/**`** — bank content overrides legacy `steps` at render.
   Fixed: `money-basics.ts` (SARB 3–6% band → 3% ±1pp, in both a question and a
   teaching step); `business-finance-advanced.ts` (SEFA → SEDFA, 3 places).
2. **`src/data/concepts.ts`** — review cards render in spaced repetition.
   Fixed: SEFA → SEDFA.
3. **`DAILY_FACTS_365` in `content-extra.ts`** — easy to miss. It renders on **six
   different screens** (HomeTab, LearnView, LessonView, CourseView, QuestsView,
   OnboardingView) and is **not** covered by the bank system at all. Two facts carried
   the old 3–6% inflation band; both corrected.

`docs/QUESTION-VOICE-GUIDE.md` was also updated: TFSA R36k → R46k, the fill-blank
worked example no longer uses a percentage answer, and it now points authors at
`docs/SA-REGULATORY-FIGURES.md` before using any figure.

Legacy `steps` arrays in `content*.ts` still hold some stale figures, but with 205/205
lessons banked they are never rendered. They'd only resurface if a bank key were
renamed — low priority, but worth knowing.

## What's left (optional follow-ups, not blockers)
1. **SR weighting of selection** — biasing `resolveLessonSteps` toward due/weak
   concepts is still the clean follow-up noted in `docs/LESSON-BANK-ARCHITECTURE.md`.
2. **Difficulty calibration** — `question_attempts` is logging; once there's enough
   data, run the `p_correct` outlier query in the architecture doc to find variants
   that are much harder or easier than their slot-mates.
3. **Deepen the RE5 mock pools** — 2 variants per slot gives a 100-question pool per
   paper. The architecture doc flags RE5 as the biggest integrity risk and suggests
   5+ variants per slot; a third variant per slot is the natural next increment.
4. **`content-level3.ts` SBC brackets** — the exact R95 750 band is still quoted there
   and is flagged unverified in `docs/SA-REGULATORY-FIGURES.md`. Bank-overridden, so
   not user-facing, but verify before ever surfacing it.
