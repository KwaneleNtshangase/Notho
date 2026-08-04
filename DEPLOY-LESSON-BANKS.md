# Deploying the lesson-bank work

Everything below runs on your Mac, in `/Users/KwaneleNtshangase/Developer/notho`.
Nothing here has been committed or pushed — the working tree is exactly as I left it.

---

## Before you start: your tree has two unrelated sets of changes

`git status` shows more than the lesson banks. **Only commit what you mean to ship.**

**A. This session's lesson-bank work** — 20 new files + 5 modified:

```
scripts/lesson-bank-audit.mjs            scripts/lesson-bank-qc.mjs
scripts/lesson-rotation-check.mjs        scripts/lesson-overlap-report.mjs
scripts/content-quality-standalone.mjs
src/data/banks/*-extra.ts  (15 files)
src/data/banks/re5-mock-a.ts             src/data/banks/re5-mock-b.ts
src/data/banks/index.ts                  (modified — registers them)
src/data/banks/money-basics.ts           (modified — SARB inflation target)
src/data/banks/business-finance-advanced.ts (modified — SEFA → SEDFA)
src/data/concepts.ts                     (modified — +27 concepts, SEDFA)
src/data/content-extra.ts                (modified — 2 daily facts)
docs/SA-REGULATORY-FIGURES.md            docs/QUESTION-VOICE-GUIDE.md
HANDOFF-NEXT-CHAT.md                     DEPLOY-LESSON-BANKS.md
```

**B. Work from earlier sessions that is NOT mine** — decide separately:

```
src/lib/budget/report/*    (5 files — budget PDF report)
e2e/*                      (3 files — test helpers)
next.config.ts             (deployment-skew handling)
docs/MONITORING.md
NOTHO-CONTEXT-BRIEF.md, NOTHO_Content_Production_Guide.md,
NOTHO_Marketing_Content_Playbook.md   (untracked working docs)
```

I haven't reviewed group B. It looks like finished work, but it's yours to judge.

---

## Step 1 — verify locally (2 minutes)

I could run the first four in my sandbox. **The build I could not** — it ran out of
memory there — so this is the one gate you need to clear yourself.

```bash
cd ~/Developer/notho

npx tsc --noEmit                            # must print nothing
node scripts/content-quality-standalone.mjs # must end: RESULT: PASS
node scripts/lesson-bank-audit.mjs          # must show: ERRORS 0
node scripts/lesson-rotation-check.mjs      # must end: RESULT: PASS

npm run build                               # ← the one I couldn't run
```

If `npm run build` fails, stop and send me the error. Everything else already passes.

Optional, if you want the real test runner rather than my standalone port:

```bash
npx vitest run
```

---

## Step 2 — commit

**Option A — lesson banks only (recommended).** Leaves group B untouched:

```bash
cd ~/Developer/notho

git add scripts/lesson-bank-audit.mjs scripts/lesson-bank-qc.mjs \
        scripts/lesson-rotation-check.mjs scripts/lesson-overlap-report.mjs \
        scripts/content-quality-standalone.mjs \
        src/data/banks/ src/data/concepts.ts src/data/content-extra.ts \
        docs/SA-REGULATORY-FIGURES.md docs/QUESTION-VOICE-GUIDE.md \
        HANDOFF-NEXT-CHAT.md DEPLOY-LESSON-BANKS.md

git status                                  # confirm nothing unexpected is staged

git commit -m "feat(content): every lesson is now bank-backed with rotating questions

205/205 lessons resolve from a question bank (912 slots, 2,636 variants).
Adds banks for the 84 remaining 'extra' lessons across 15 courses, and converts
both RE5 mock exams from a fixed 50-question paper to 50 slots x 2 variants, so
each sitting draws a different full-length exam.

Also corrects stale figures on user-facing surfaces: SARB inflation target
(3-6% band -> 3% point target +/-1pp) in money-basics and DAILY_FACTS_365,
and SEFA -> SEDFA (merged Oct 2024) in business-finance-advanced and concepts.

Adds scripts/ for structural audit, voice QC, rotation proof, user-overlap
measurement, and a standalone port of contentQuality.test.ts."
```

**Option B — everything.** Only if you've reviewed group B:

```bash
git add -A && git status
```

---

## Step 3 — push (this deploys)

```bash
git push origin main
```

That single push triggers **both**:

1. **GitHub Actions** — `.github/workflows/ci.yml` runs typecheck + build on every
   push to main. This is your safety net for the build I couldn't run.
2. **Vercel** — project `fundi-finance` builds and promotes to production.

Watch them:

```bash
gh run watch                                # if you have the GitHub CLI
```

Otherwise: GitHub → Actions tab, and the Vercel dashboard for `fundi-finance`.

---

## Step 4 — check it in the app

The change is invisible in a diff — you have to see a lesson repeat differently.

1. Open any lesson, note the questions, finish or exit it.
2. Start it again. **Roughly two thirds of the questions should be different.**
3. Then try `RE5 Exam Prep → Mock Exam A` twice. It should be a materially
   different 50-question paper the second time.

If a lesson looks identical on replay, the bank didn't attach — send me the
course and lesson name.

---

## If you need to roll back

Content-only changes, so a revert is clean and safe:

```bash
git revert HEAD          # undoes the commit, keeps history honest
git push origin main     # redeploys the previous content
```

---

## One caveat worth knowing

Anti-repeat memory (`notho-seen-variants`) lives in **localStorage**, per device.
Clearing site data resets which variants a learner has already seen. The seeded
selection still varies by user and attempt, so rotation keeps working — the
"don't show me what I just saw" refinement is what resets. Not a bug; just don't
be surprised if it behaves slightly differently in a fresh incognito window.
