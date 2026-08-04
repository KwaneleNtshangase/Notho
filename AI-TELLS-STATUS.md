# Removing the AI tells — status

Two separate problems. **One is finished. One is only started.**

Re-measure anytime with `node scripts/ai-tells-scan.mjs` (add `--list` for offenders).

---

## 1. Style tells — DONE

| | Before | After |
|---|---|---|
| Em dashes in user-visible text | **2,794** | **0** |
| Stock LLM phrases | 33 | 33 (24 are "leverage", legitimate finance usage) |

`scripts/fix-em-dashes.mjs` rewrote all 2,794 across 40 files. It varies the
replacement by grammatical context so a single substitute doesn't become the new
tell: full stop for independent clauses, colon or comma for fragments, brackets
for parentheticals. The hard rule is **never produce a comma splice**, so the
text after a dash only becomes its own sentence when it has a finite verb.

The 25 remaining em dashes are in code comments, which users never see.

---

## 2. Answer-shape tells — PARTIALLY DONE

This is the one you spotted, and you were right about the cause.

| | Before | Now | Target |
|---|---|---|---|
| Correct option is uniquely longest | **87.5%** | **79.2%** | ~25% (chance) |
| ...and ≥40% longer than average | 82.7% | 72.7% | — |
| ...and ≥100% longer | 55.2% | 45.4% | — |
| Avg length spread across options | 207% | 184% | — |

**310 fixed automatically. 1,204 still need a human.**

### Why automation stalls here

The root cause is that the correct option carries its own justification while
the distractors stay bare:

```
✓ (64) "Lower, because your lower income slices are taxed at lower rates"
  ( 6) "Higher"
  (16) "Exactly the same"
  (11) "Always zero"
```

Three rules were safely automatable, and they handled 310 cases:

- **A** — distractors are bare figures, so trim the answer to its figure
  (`"About 18%, 40% inclusion at a 45% marginal rate"` → `"About 18%"`)
- **B** — strip a parenthetical the distractors don't have
  (`"R177.12 (1% of the R17 712 cap)"` → `"R177.12"`)
- **C** — cut a trailing justification clause introduced by *because / so /
  which / meaning*, which belongs in the feedback anyway

The remaining 1,204 can't be trimmed, because the length is **inherent**:

```
✓ (88) "Business profit is added to the owner's personal income and taxed at their marginal rate"
  (13) "At a flat 27%"
  (14) "It isn't taxed"
  ( 6) "At 15%"
```

Nothing can be cut without losing the answer. The fix is to **rewrite the
distractors to be equally specific and grammatically parallel** — here, all four
should read "At X". That needs subject knowledge per question and cannot be
scripted.

### The principle for the remaining work

**Make all four options grammatically parallel.** When they share a form, their
lengths converge on their own and the tell disappears. This also satisfies the
voice guide's requirement that distractors be plausible and diagnostic, so it is
a genuine quality upgrade, not cosmetics.

```
Before                                    After
✓ "Business profit is added to the        ✓ "At the owner's marginal rate, up to 45%"
   owner's personal income and taxed        "At a flat 27% company rate"
   at their marginal rate"                  "At 15%, the VAT rate"
  "At a flat 27%"                           "Not taxed until drawn as salary"
  "It isn't taxed"
  "At 15%"
```

### Where the work sits

```bash
node scripts/fix-answer-shape.mjs --dry --todo   # worst offenders, with lengths
```

Roughly 1,204 questions across `src/data/banks/`. At ~3 distractors each that is
~3,600 option rewrites, so it is a multi-session job. It does not block deploying
what is already done — the content is strictly better than it was.

---

## Guard against regression

`scripts/ai-tells-scan.mjs` is the measurement. Once the ratio comes down,
consider adding a ratchet to `scripts/content-quality-standalone.mjs` that fails
if em dashes rise above 0 or the uniquely-longest rate climbs.

## Verification after these changes

- `npx tsc --noEmit` — clean
- `scripts/lesson-bank-audit.mjs` — 205/205 banked, **0 errors**
- `scripts/content-quality-standalone.mjs` — **11/11 assertions pass**
- `scripts/lesson-rotation-check.mjs` — **PASS**, every lesson still rotates
