# Writing answer options that don't give themselves away

A learner who has not studied should score 25% on a four-option question. If
they can score materially better by reading the *shape* of the options rather
than knowing the subject, the question is broken no matter how good the
teaching around it is.

This is the rule set the banks are being rewritten to, and the one new
questions must follow.

## The one rule that matters

**Every option must be plausible to someone who hasn't studied the topic.**

Everything below is a consequence of that.

## What the scanner measures

`node scripts/answer-pattern-scan.mjs` reports, for each pattern, how often it
lands on the correct answer versus how often it would by chance:

| signal | meaning |
|---|---|
| ~1.0x | the pattern carries no information, which is the goal |
| 1.4x+ | a guesser gains a real edge |
| 2.0x+ | the pattern is close to an answer key |

It also reports the **guesser score**: what a learner would get by ranking the
options on length and always picking the same rank, with ties split at random.
All four ranks should sit near 25%. This is the number to watch, because it is
the only one that prices in ties and catches over-correction.

Position is **not** measured, because `src/lib/lessonShuffle.ts` reorders
options per user per lesson at render time. Authored index is irrelevant. Never
"fix" a pattern by moving the correct answer.

## The rules

### 1. Length must not track correctness

This was the big one: the correct answer was uniquely the longest option in
79% of questions, against 25% by chance.

The fix is **not** to pad distractors. It is to make all four options answer
the question at the same level of detail, so length lands where it lands. In
practice that means the correct answer should be the longest in roughly a
quarter of questions and shorter in the rest.

> **The trap: don't swap one tell for its mirror image.**
>
> The obvious repair is to make one distractor longer than the correct answer.
> Do that consistently and you have not removed the tell, you have moved it:
> "the longest option is right" becomes "the *second* longest is right", which
> is just as exploitable. This happened during the first pass here, and pushed
> the second-longest strategy to 40%.
>
> The scanner's headline number, **guesser score**, exists to catch exactly
> this. It reports what a learner would score by always picking the k-th
> longest option, splitting ties at random, for all four values of k. Every one
> of them should sit near 25%. When you fix a question, vary where the correct
> answer lands: sometimes longest, sometimes shortest, mostly in between.

```
Before                                    After
✓ "Business profit is added to the        ✓ "At the owner's marginal rate, up to 45%"
   owner's personal income and taxed        "At a flat 27% company rate"
   at their marginal rate"                  "At 15%, the same as VAT"
  "At a flat 27%"                           "Not taxed until drawn as a salary"
  "It isn't taxed"
  "At 15%"
```

### 2. Justification belongs in the feedback, not the option

If the correct option explains *why* it is correct while the distractors just
sit there, the reasoning is the tell. Cut the reasoning; the `feedback.correct`
field already exists to carry it, and the learner reads it at exactly the
moment it lands best.

```
✗ "Lower, because your lower income slices are taxed at lower rates"
✓ "Lower"          + feedback: "Right. Your lower slices are still taxed at
                     their own lower rates, so the average sits below the top rate."
```

### 3. Options must be grammatically parallel

All four should open the same way and be the same kind of thing: all noun
phrases, or all imperatives, or all "It ..." clauses. When the correct answer
is the only full sentence among three fragments, it stands out.

```
✗ ✓ "The rate on your next rand earned"      ✓ "The rate on your next rand"
    "A flat 27.5%"                             "A flat 27.5% for everyone"
    "UIF"                                      "The same rate as UIF"
```

### 4. Distractors must be wrong, not silly

"It's correct", "Nothing happens", "A type of company logo" are free
eliminations. Every distractor should be something a half-informed person
might actually believe, ideally a specific misconception the feedback can then
correct.

### 5. Don't concentrate hedges or absolutes

If the correct answer is the only one saying "usually" or "generally", or if
the distractors are the only ones saying "always" and "never", the learner
learns to pattern-match on the qualifier. Spread them, or drop them.

### 6. Don't echo the stem

If the correct option is the only one reusing the stem's distinctive words, it
can be picked without understanding. Either spread the vocabulary across all
options or rephrase.

### 7. No "all of the above"

There are currently none. Keep it that way: it is trivially guessable and
tests reading, not knowledge.

## Workflow

```bash
# where the problems are
node scripts/answer-pattern-scan.mjs
node scripts/answer-pattern-scan.mjs --list --pattern=length

# pull the offenders into reviewable batches
node scripts/export-offenders.mjs
node scripts/show-batch.mjs 014

# questions where the correct answer is 2nd longest (the over-correction trap)
node scripts/export-rank2.mjs
node scripts/export-rank2.mjs --n=50

# mechanical trims (correct answer carries a cuttable justification)
node scripts/propose-trims.mjs --grade=safe --list
node scripts/propose-trims.mjs --grade=safe --emit=patches/trims.jsonl

# write rewrites as JSONL, then apply
node scripts/apply-option-patch.mjs patches/mybatch.jsonl --dry
node scripts/apply-option-patch.mjs patches/mybatch.jsonl

# verify
npx tsc --noEmit
node scripts/lesson-bank-audit.mjs
node scripts/lesson-rotation-check.mjs
node scripts/content-quality-standalone.mjs
node scripts/answer-pattern-ratchet.mjs
```

### Patch format

One JSON object per line:

```json
{"id":"ainv-mpt-co-mcq","rewritesAnswer":true,"correct":0,
 "options":["Lowers volatility more than return","Raises both return and volatility",
            "Leaves volatility and return unchanged","Raises return with no extra volatility"],
 "feedbackCorrect":"optional replacement for feedback.correct"}
```

- `id` is the `variantId`, or `concept:<id>` for a review card. Mock-exam
  variants (`r5a-q11-v2`) resolve through the `S(n, ...)` helper.
- `correct` indexes the **new** options array.
- `rewritesAnswer: true` is required whenever the correct answer's text
  changes. Without it the patcher reports the change and exits non-zero, which
  is the guard against silently rewriting a right answer into a wrong one.

## Guard

`scripts/answer-pattern-ratchet.mjs` fails if any pattern climbs above the
budget in `scripts/answer-pattern-budget.json`. Tighten the budget when a run
comes in under it. Never loosen it to make a build pass: that is the failure
mode this whole exercise exists to prevent.
