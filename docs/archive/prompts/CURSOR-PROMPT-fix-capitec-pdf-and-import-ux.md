# Cursor Prompt — Fix Capitec PDF parsing (real layout) + import preview UX

> A real Capitec statement parsed **486 rows when there are ~80**, with page numbers read as amounts and footer/summary lines treated as transactions. Below is the **actual Capitec layout** (from a real statement) plus three UX fixes. No schema change. One focused parser rewrite + preview UX. Build, test against a fixture that replicates this layout, then commit (not `git add -A`) and push.

---

## Part 1 — Capitec PDF parser is mis-extracting (the main bug)

The Capitec template was built against a synthetic guess and does not match the real statement. Rewrite the Capitec parser (and tighten the generic extractor with the same principles) to the **real layout below**, using `getTextContent()` **x/y positions** (not naive line-splitting).

### Real Capitec statement structure (multi-page; this sample = 14 pages)
- **Page 1 is NOT transactions** — it's the account summary, "Money In/Out Summary", and a fees breakdown. **Skip entirely.**
- Before the transaction table there are non-transaction sections that must be **excluded**:
  - **"Scheduled Payments"** — a TWO-COLUMN block ("Card Subscriptions" left, "Self-Scheduled Payment" right); each text line holds two unrelated entries. These are recurring/projected, not posted transactions.
  - **"Spending Summary"** and any "...Summary" block — category totals like `Digital Payments -R42 689.88`. Not transactions.
- **The posted-transaction table** is anchored by this exact header, repeated on each page:
  ```
  Date Description Category Money In Money Out Fee* Balance
  ```
  Only parse rows under this header. Example real rows:
  ```
  02/06/2025  Payment Received: Snapscan 20250602 ... Other Income   9.66            3 148.48
  03/06/2025  Online Purchase: Uber Cape Town (Card 0379)  Public Transport   -60.00  3 088.48
  10/06/2025  Recurring Payment (...): Gogo Dstv  Digital Subscriptions  -150.00  -2.00  2 954.22
  16/06/2025  Banking App Immediate Payment: Sakhile ...  Digital  -1 000.00  -1.00  1 041.15
  ```

### Parsing rules (critical — these are the bugs)
1. **Columns are positional.** Assign tokens to Date / Description / Category / **Money In** / **Money Out** / **Fee\*** / **Balance** by x-position (read the column header's x-ranges, then bucket each row's words). Do NOT infer amount by "last number on the line."
2. **Amount = Money In (positive) OR Money Out (negative).** Never use the **Balance** column as the amount — Balance is the running total (use it only for reconciliation). The "R1/R2" bug came from reading page numbers; the fix is strict column bucketing.
3. **South African number format:** thousands separator is a **space** (`-1 000.00`, `3 148.48`). Strip internal spaces inside a number before `parseFloat`. Amounts have no "R" prefix in this table.
4. **Fee\* column** is a separate small negative (e.g. `-2.00`). Record it as its own `Bank Charges` expense entry (or attach as a fee field) — but it must be reflected so the balance chain reconciles. Don't merge it into the main amount silently.
5. **Continuation lines:** a row may wrap onto the next line that has **no date in the Date column** — e.g. a reference number (`2474439413`) or a wrapped word (`Subscriptions`, `Payments`). **Append these to the previous transaction's description; never count them as new transactions.**
6. **Exclude footers on every page:** lines matching `Unique Document No.:` or `Page \d+ of \d+` (this is where the bogus `2022-07-09` date + page-number "amount" came from). Also exclude the repeated column-header line and the contact/legal lines.
7. **Row start test:** a real transaction begins with a `DD/MM/YYYY` token in the Date column x-range AND has a value in the Balance column. Anything else is not a transaction.
8. Date format `DD/MM/YYYY` → ISO in SAST.

### Reconciliation (Capitec gives strong signals — use them)
- Page 1 has **Opening Balance** and **Closing Balance** (e.g. opening 3 172.43 → closing 154.16).
- Each row carries a running **Balance**. Verify the chain: `prevBalance + moneyIn + moneyOut + fee ≈ rowBalance` (cents tolerance), and the **last row's balance equals the Closing Balance**. This is a far stronger check than a count and should drive `reconciliation.ok`.
- Keep the existing behaviour: if it doesn't reconcile, warn and block commit — but with the rewrite it should reconcile cleanly on this statement.

### Generic extractor (all other banks)
Apply the same principles generically: find a header row containing **Date** + **Balance** (+ Money In/Out or Debit/Credit), bucket by x-position, merge continuation lines, exclude footers/summaries/headers, handle space-and-comma thousands separators, derive signed amount from in/out columns, treat rightmost as balance.

## Part 2 — Preview UX (the three complaints)
1. **Sticky action bar:** make **Back** / **Import N transactions** a fixed footer that's always visible (no scrolling the whole list to import). Make the reconciliation warning a **sticky banner** at the top of the preview.
2. **Explain "Remember":** add a column header label + tooltip — *"Save this merchant's category for next time."* Add a one-line helper at the top of the preview explaining that editing a category and ticking Remember teaches future imports. Only enable the tick once the row's category is changed.
3. **"Needs review" should be selective:** once parsing reconciles, only flag rows that are genuinely uncertain (failed balance step, unknown/`Other` category, or amount with no in/out column). Don't blanket-flag every row. (Today everything is flagged only because reconciliation failed.)

## Part 3 — Test fixture (no PII)
- Add a fixture that **replicates this real Capitec layout** — the `Date Description Category Money In Money Out Fee* Balance` header, space-thousands amounts, a multi-line reference row, a Fee\* row, the `Unique Document No.: … Page X of Y` footer, and a page-1 summary block — but with **fake data only** (no real names/account numbers). Put it under `src/lib/budget/__tests__/fixtures/` per the README.
- Tests must assert: only posted transactions are parsed (summaries/scheduled/footers excluded), Money In→income / Money Out→expense signs, space-separator amounts parse correctly, continuation lines merge, the balance chain reconciles to the closing balance, and the parsed count matches.
- `npx tsc --noEmit` clean; all existing tests pass.

## Constraints
No schema change. Don't touch `useProgress.ts`/XP/sync. SAST + ZAR cents. **Commit only** the parser files, `BudgetImportPanel.tsx`, and tests/fixtures — **not `git add -A`** (OneDrive 0-byte'd tracked PDFs). Push to `main`.
