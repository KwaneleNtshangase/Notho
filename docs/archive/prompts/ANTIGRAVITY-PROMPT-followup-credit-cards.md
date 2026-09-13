# Antigravity follow-up: credit-card flagging, and two test-quality fixes

Continuation of the adversarial parser audit. Your Finding 1 fix was correct — credit-card
statements no longer have every sign flipped. This is about what it costs.

## 1. Credit-card statements flag 100% of rows (HIGH — alert fatigue)

Run `src/lib/budget/__tests__/fixtures/pdf-credit-card.layout.json` through
`parseGenericPdfLayout` → `orientByBalanceChain` → `verifySignsAgainstBalanceChain` and look at
the output:

```
rows=4  verified=0 corrected=0 unverified=4
  2026-06-01       -500  bal=    10500  needsReview  Woolworths Claremont
  2026-06-03       -150  bal=    10650  needsReview  Uber trip Cape Town
  2026-06-10        200  bal=    10450  needsReview  Payment received thank you
  2026-06-15    -349.99  bal= 10799.99  needsReview  Netflix subscription
```

Every amount and every sign is **correct**. Every row is flagged anyway.

Two problems:

- `selectiveNeedsReview` in `src/components/BudgetImportPanel.tsx` means the user must clear each
  flagged row. A 300-row card statement is 300 clicks on correct data. People will rubber-stamp
  it, and then the flag is worthless on the one row that *is* wrong. Alert fatigue defeats the
  mechanism.
- The warning in `pdf.ts` says *"Most rows could not be checked against the running balance"*.
  They were checked. They were consistently inverted, which is evidence of a known convention, not
  absence of evidence. Saying "could not be checked" trains users to ignore a real warning.

**The reasoning to fix:** `invertedMajority` treats consistent inversion as ambiguity. It is the
opposite — a statement where *every* row inverts is as internally consistent as one where every row
agrees. What is missing is a way to tell "credit-card convention" from "our column reading is
inverted", and the document itself can tell us.

**Suggested approach** (challenge it if you see better):

1. Detect a credit-card statement from `fullText`: `credit card`, `credit limit`,
   `minimum payment`, `available credit`, `payment due`. Discovery, Capitec, FNB and Absa all print
   at least one of these.
2. Pass that hint into `verifySignsAgainstBalanceChain`. When inversion is near-total **and** the
   document says credit card, treat those rows as **verified** — leave the signs from the column
   reading alone and do not flag them.
3. Replace the per-row flags with one statement-level note, e.g. *"This is a credit-card statement,
   where purchases increase the balance. Directions were read from the Debit/Credit columns."*
4. When inversion is near-total but there is **no** credit-card evidence, keep today's behaviour:
   flag, do not flip. That case really is ambiguous.

Add a test asserting a credit-card import produces **zero** `needsReview` rows and correct signs,
and one asserting an inverted-majority statement *without* credit-card markers still flags.

## 2. One test cannot fail (fix the assertion, keep the finding)

`pdfAdversarial.test.ts`, Finding 5:

```js
it("should not join a card number '12' and amount '345.00' into '12345.00'", () => {
  const tokens = findAmountTokens("12 345.00");
  const hasInflated = tokens.some((t) => Math.abs(t.value - 12345) < 0.01);
  const hasCorrect  = tokens.some((t) => Math.abs(t.value - 345) < 0.01);
  expect(hasInflated || hasCorrect).toBe(true);   // ← true whatever the parser does
});
```

The conclusion is right — `"12 345.00"` is genuinely ambiguous because SA banks use space
thousands separators, so this should stay documented rather than "fixed". But the assertion permits
both outcomes, so it will never catch a regression, and the title claims the opposite of what it
checks. Pin the actual current behaviour (`expect(hasInflated).toBe(true)`) and rename it to say it
documents a known ambiguity.

While you are there, check the other `documented limitation` tests (Findings 2 and 4) for the same
shape — an assertion that passes either way is worse than no test, because it looks like coverage.

## 3. Commit hygiene

The parser fix and your whole audit went to `main` in `557f4f0`, whose message is
`fix(lesson): stop scoring action steps as wrong answers`. Nothing needs undoing — but commit this
follow-up separately with a message that describes it, so the import work is findable in `git log`.

## Ground rules (unchanged)

- Never use a real bank statement. Build fixtures in the `{ y, items: [{ x, text }] }` format.
- If in/out cannot be determined, refuse or flag — never guess.
- Do not weaken an existing test to make something pass.
- `npm run test:unit` and `npx tsc --noEmit` must both be clean when you are done.
- There is an uncommitted change to
  `src/lib/budget/report/__tests__/__snapshots__/aggregate.test.ts.snap` from an earlier
  `vitest --update`. Do not commit it without showing me the diff — it may have baked in unrelated
  in-progress report work.
