# Antigravity task: adversarial audit of the bank-statement import parser

## Your job

Try to break the PDF bank-statement parser in `src/lib/budget/`. Specifically, try to make it
produce a **confidently wrong** budget: right-looking rows with wrong amounts or wrong in/out
direction, reported as reconciled.

This is a personal-finance app used mostly by South Africans importing their real bank statements.
A crash is a bad day. A silent sign error is someone's salary recorded as spending, their budget
quietly wrong, and no error message to explain it. **Rank your findings by how silent they are, not
by how easy they are to trigger.**

Do not just confirm the code works. Assume it does not, and go looking.

## Context: what just changed and why

A user (ref `RF8BPO`) could not import a Discovery Bank **certified** statement. The import refused
with "we couldn't tell reliably which were money in and which were money out".

Four bugs were found and fixed. All but one were in the *shared* layer, not the Discovery template:

1. `parseAmountToken` rejected the `R` currency prefix that some banks print inside the amount cell,
   so `"R 1,234.56"` (emitted by the PDF text layer as one item) parsed as `null`. The whole
   document then contained zero recognisable amounts.
2. `isStatementDateToken` did not accept ISO `YYYY-MM-DD`, so the header-anchored path found no date.
3. `findAmountTokens` used `[\s]` as its only thousands separator, so `1,234.56` was read as `234.56`.
4. Money columns were matched by "first item within 55pt of the header anchor". Because amount
   columns are **right-aligned**, an item's start x moves left as the number gets longer, and the
   Balance column sat 46pt from the Credit anchor — so a row whose only movement was a R1,234.56
   debit was read as **+R3,765.44 of income** (the running balance itself, imported as a credit).

The fixes introduced new machinery, and **that new machinery is your primary target**:

- `estimateCharWidth()` / `itemRightEdge()` in `pdfLayout.ts` — estimates a glyph width so columns
  can be compared on right edges instead of start x. It is a heuristic (10th percentile of observed
  inter-item packing, clamped to 2–12, fallback 4.5).
- `moneyBuckets()` in `pdfGeneric.ts` — exclusive nearest-wins assignment of money items to columns.
- `orientByBalanceChain()` and `verifySignsAgainstBalanceChain()` in `reconciliation.ts` — re-orders
  rows into whichever direction the running balance agrees with, then **overwrites** each row's sign
  where the balance delta contradicts the column reading.

## Start here

```bash
npm run test:unit        # 113 tests, all should pass before you change anything
```

Read in this order:

- `src/lib/budget/parsers/pdfLayout.ts` — tokenising and column geometry
- `src/lib/budget/parsers/pdfGeneric.ts` — header-anchored row parsing
- `src/lib/budget/parsers/pdfTemplates.ts` — per-bank templates
- `src/lib/budget/parsers/pdfLastResort.ts` — the no-bank-recognised fallback tier
- `src/lib/budget/parsers/pdf.ts` — tiering, orientation, sign audit, reconciliation
- `src/lib/budget/reconciliation.ts` — the balance-chain logic
- `src/lib/budget/__tests__/pdfDiscoveryCertified.test.ts` — the RF8BPO regression tests
- `src/lib/budget/__tests__/fixtures/*.layout.json` — fixture format

## How to reproduce a layout without a real statement

**Never ask for, use, or generate a real bank statement.** Statements are the most sensitive document
most people own, and the import panel promises they are processed in memory only.

Work with the fixture format instead: `{ y, items: [{ x, text }] }` per line, which is exactly what
`unpdf` gives the parser. `src/lib/budget/parsers/pdfFingerprint.ts` documents how real layouts are
captured from failures without any user data leaving the device — masked rows plus x-coordinates.
`pdf-discovery-certified.layout.json` was reconstructed from such a fingerprint, and its header
comment records the geometry it reproduces. Build new fixtures the same way.

## Specific things to attack

Each of these is a hypothesis. Prove or disprove it with a test.

### The character-width estimate
1. What happens on a statement with very few multi-item lines, so the estimator hits its fallback of
   4.5? Does column clustering still separate Debit from Credit?
2. What about an unusually large or small font, or a statement whose coordinates are in a different
   unit scale? The clamp is 2–12 — construct a layout that legitimately falls outside it.
3. The right-edge model assumes amounts are **right-aligned**. Build a fixture where the amount
   column is left-aligned or centred. Is the result worse than start-x matching would have been?

### Tokenising
4. `findAmountTokens` allows `[\s,]` between thousands groups. Can you make it join two *unrelated*
   adjacent fields into one number — e.g. a card number `12` followed by an amount `345.00` becoming
   `12345.00`? Check both space and comma paths.
5. `parseAmountToken` now accepts a currency prefix but requires 2 decimals when one is present.
   Find a description token that now parses as money and lands near a money column.
6. Statements that print negatives as a trailing minus (`1234.56-`) or with `Cr`/`Dr` suffixes mixed
   into the same column. What happens?

### The sign audit — highest-value target
7. `verifySignsAgainstBalanceChain` **overwrites** signs it believes are inverted. What happens if
   the column it thinks is Balance is actually a second amount column (e.g. a fee column)? Can you
   make it "correct" a set of correct signs into wrong ones? This is the worst available outcome:
   the fix actively introducing sign errors.
8. **Credit-card statements invert the balance convention** — a purchase *increases* the outstanding
   balance. Feed it a credit-card layout. Does the chain audit flip every purchase to positive
   (income)? Discovery, Capitec and FNB all issue credit cards, so this is a realistic import.
9. The chain is seeded with the parsed opening balance. What if the opening balance is misparsed and
   the seed is wrong — does row 1 get silently "corrected" to the wrong sign?
10. `orientByBalanceChain` picks the direction with more agreement, ties going to forward order. Can
    you build a statement where it reverses a correctly-ordered set of rows?
11. `hasRunningBalance` requires 3+ rows with balances. A 2-row statement gets no audit at all — is
    anything else protecting it?

### Multi-account and section boundaries
12. Multi-account detection counts *distinct* account numbers matched by
    `/account\s+(?:number|no\.?)\s*:?\s*(\d[\d\s-]{5,})/i`. Find a real-world phrasing that slips
    past it (other languages, `Rekeningnommer`, an account number split across two text items).
    A missed multi-account statement chains balances across an account boundary.
13. When the chain restarts mid-document, exactly one row per section becomes unverifiable. Confirm
    it is *flagged* and not silently signed.

### Cross-bank regressions
14. The changed functions are shared by Capitec, FNB, Standard Bank and Nedbank. The existing
    fixtures pass, but they are small. Extend them — more rows, larger amounts with thousands
    separators, same-day transactions, a row whose description contains a number.
15. `pdfLastResort.ts` refuses a statement when more than 30% of signs are guesses
    (`MAX_GUESSED_SIGN_SHARE`). Is that threshold still right now that the balance chain reconciles
    more often? Can you find a statement that is silently accepted where it should refuse?

### Numerical
16. Money is compared in cents with `Math.round`. Look for float drift over long statements
    (300+ rows) and for `.005` boundary cases.

## What counts as a finding

A finding is **a failing test committed to the repo**, not a description. For each one give me:

- a minimal `.layout.json` fixture that triggers it
- a test in `src/lib/budget/__tests__/` that fails on current `main`
- the wrong output vs the correct output, in rands
- **severity**, judged by silence:
  - **Critical** — wrong amount or wrong sign, reported as reconciled, no warning
  - **High** — wrong data, but flagged `needsReview` / `lowConfidence`
  - **Medium** — a statement refused that should parse (a user is blocked, but not misled)
  - **Low** — cosmetic, e.g. a description with stray characters

Propose a fix for anything Critical or High, but **keep the fix separate from the failing test** so I
can see the test fail first.

## Ground rules

- If you cannot decide whether a row is money in or money out, the correct behaviour is to **refuse
  or flag, never to guess**. The code comments in `pdfLastResort.ts` explain why: a previous version
  guessed "probably spending" per row, which was defensible once and catastrophic across a whole
  statement — a real user ended up with 700 rows, no income, and expenses inflated by exactly the
  size of her pay cheque. If you find code that guesses, that is a finding in itself.
- Do not weaken an existing test to make something pass.
- Do not add a dependency.
- `npm run test:unit` and `npx tsc --noEmit` must both be clean when you are done.
- Tell me what you tried that did **not** break it. Knowing which attacks the parser survived is
  worth as much as the bugs you find.
