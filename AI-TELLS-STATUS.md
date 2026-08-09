# Removing the AI tells — status

Both problems are **done**.

```bash
node scripts/ai-tells-scan.mjs          # style
node scripts/answer-pattern-scan.mjs    # answer shape, all patterns
node scripts/answer-pattern-ratchet.mjs # CI guard
```

---

## 1. Style tells — DONE

| | Before | After |
|---|---|---|
| Em dashes in user-visible text | **2,794** | **0** |
| Spaced en dashes | 1 | **0** |
| Stock LLM phrases | 33 | 32 (24 are "leverage", legitimate finance usage) |

---

## 2. Answer-shape tells — DONE

### Every pattern, measured

Earlier work only measured length. `scripts/answer-pattern-scan.mjs` now tests
eleven separate ways an option can give itself away, each scored against the
rate you'd expect by chance:

| Pattern | Was | Now |
|---|---|---|
| Correct answer uniquely longest | 3.2x | **0.8x** |
| Correct answer has most words | 2.9x | **0.9x** |
| Only compound option | 1.4x | **0.7x** |
| Hedged language only on correct | 0.4x | 0.2x |
| Absolutes only in distractors | 0.5x | 0.6x |
| Correct carries its own justification | 0.0x | 0.0x |
| Flippant distractors | 0.0x | 0.0x |
| Correct echoes the question stem | 0.2x | 0.1x |
| Odd one out by grammar | 0.4x | 0.4x |
| Only option carrying a figure | 0.2x | 0.1x |
| All/none of the above | 0 found | 0 found |

**The finding: length was the only real tell.** Everything else already sat at
or below chance, so the hunt for "every other identifiable pattern" came back
mostly clean. Position is not measured because `src/lib/lessonShuffle.ts`
reorders options per user per lesson at render time, which already neutralises
authored index.

### The headline number

Ratios hide ties, so the scanner also reports what a learner would actually
score by ranking options on length and always picking the same rank, with ties
split at random. Chance is 25%:

| Strategy | Start | Now |
|---|---|---|
| Always pick the longest | ~65% | **25.2%** |
| Always pick the 2nd longest | — | **26.0%** |
| Always pick the 3rd longest | — | **24.6%** |
| Always pick the shortest | — | **24.2%** |
| **Best available strategy** | **~65%** | **26.0%** (edge: 1.0 point) |

Length now tells a guesser essentially nothing.

### The trap worth knowing about

Mid-way through, the obvious repair — make one distractor longer than the
correct answer — had been applied consistently enough that it *moved* the tell
rather than removing it. "Pick the longest" fell to chance while "pick the
**second** longest" climbed to 39.8%, which is just as exploitable.

That is why the guesser score exists and why it is the ratcheted metric.
`scripts/export-rank2.mjs` finds the questions in that state; the repair is to
vary where the correct answer lands rather than always putting it second.

### Scale of the work

~1,500 questions rewritten across all 22 banks plus the 129 concept review
cards that drive spaced repetition. Roughly 400 were mechanical trims
(`propose-trims.mjs`); the rest needed distractors rewritten with subject
knowledge, because the correct answer's length was inherent to the concept
while the distractors were bare.

The rewrite is a genuine content upgrade, not cosmetics: parallel distractors
are more diagnostic, and moving self-justifying clauses into `feedback.correct`
puts the reasoning where the learner reads it.

---

## Tooling

| Script | Purpose |
|---|---|
| `answer-pattern-scan.mjs` | measure all 11 patterns + guesser score; `--list`, `--pattern=`, `--json=` |
| `answer-pattern-ratchet.mjs` | CI guard against regression; `--update` to tighten |
| `export-offenders.mjs` | dump offenders into reviewable batches |
| `export-rank2.mjs` | find the over-correction trap (correct answer 2nd longest) |
| `show-batch.mjs` | compact view of one batch for rewriting |
| `propose-trims.mjs` | auto-propose safe trims, graded safe/check/no-fix |
| `apply-option-patch.mjs` | apply JSONL rewrites to the banks, safely |

npm aliases: `scan:answers`, `scan:ratchet`, `content:offenders`,
`content:trims`.

The patcher walks the TypeScript with a string-aware scanner rather than
regex, because variants are formatted inconsistently and option strings contain
braces, brackets and apostrophes. It refuses to change a correct answer's text
unless the patch sets `rewritesAnswer: true`, which is the guard against
silently turning a right answer wrong.

Style rules for writing new options: **`docs/ANSWER-OPTION-STYLE.md`**.

---

## Verification

- `npx tsc --noEmit` — clean
- `scripts/lesson-bank-audit.mjs` — 205/205 banked, **0 errors**
- `scripts/lesson-rotation-check.mjs` — **PASS**, every lesson still rotates
- `scripts/content-quality-standalone.mjs` — **11/11 assertions pass**
- `scripts/answer-pattern-ratchet.mjs` — **PASS**
- `scripts/ai-tells-scan.mjs` — 0 em dashes, 0 en dashes

`npx vitest run` bus-errors in the Linux sandbox, including on a trivial
one-line test, so it is an environment limit rather than a content problem.
`content-quality-standalone.mjs` is a port of `contentQuality.test.ts` and
covers the same assertions.

## Guard against regression

`scripts/answer-pattern-budget.json` holds the current ceiling per pattern,
including `guesserEdge: 2.5` (percentage points over chance).
`answer-pattern-ratchet.mjs` fails the build if any of them is exceeded.
**Tighten the budget as numbers improve; never loosen it to make a build
pass.** That is the failure mode this whole exercise exists to prevent.
