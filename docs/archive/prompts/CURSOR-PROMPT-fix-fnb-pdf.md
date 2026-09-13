# Cursor Prompt — Add FNB PDF template + make the section anchor bank-agnostic

> FNB statements fail today: one parsed **0 rows** ("No transactions parsed under Transaction History") and another mis-parsed (computed closing R26 043.70 vs statement R892.38). Root causes: (a) the parser anchors on the Capitec-specific **"Transaction History"** heading, which FNB doesn't have, and (b) FNB's format is different — single **Amount** column with a **Cr/Dr suffix**, **comma** thousands, `DD Mon` dates. Add an FNB template and generalise the anchor. No schema change.

---

## Verified FNB layout (real "Gold Business Account" statement)
Header/summary, then a **"Transactions in RAND (ZAR)"** section with this column header (note it wraps two lines):
```
Date Description Amount Balance Bank
                              Charges
```
Real rows (verified — the balance chain below reconciles exactly):
```
Opening Balance 182.04Cr
01 Apr  Magtape Unpaid Not Provided For        198.00Cr     380.04Cr
01 Apr                                            6.00       374.04Cr        (bank charge debit)
01 Apr  Internal Debit Order FNB Insure 2864469 R25853 R25853  198.00  176.04Cr
16 Apr  FNB App Transfer From Internal          901.00Cr   1,077.04Cr
16 Apr  FNB App Payment To Yoco Capital Rc-058870  500.00    577.04Cr
22 Apr                                            0.00        577.04Cr   5.00   (accrued bank-charge col)
22 Apr                                           93.00        484.04Cr
23 Apr  FNB OB Pmt Ivungu High School        25,468.00Cr  25,892.38Cr
23 Apr  FNB App Payment To Reverse Loan Kwanele  25,000.00    892.38Cr
Closing Balance 892.38Cr
```
Chain check (passes): 182.04 +198.00 −6.00 −198.00 +901.00 −500.00 −93.00 −59.66 +25,468.00 −25,000.00 = **892.38Cr** = closing. ✓

## FNB parsing rules (these are the differences from Capitec)
1. **Section anchor:** start after **"Transactions in RAND (ZAR)"** and the **`Date Description Amount Balance`** header (the trailing "Bank Charges"/"Accrued" wraps to the next line — don't depend on it). **Do NOT require "Transaction History"** (Capitec-only). End at **"Closing Balance"** / **"Turnover for Statement Period"** or the page footer ("Please contact us…", "First National Bank…", "Page X of Y").
2. **Columns are positional (right-aligned). Use x-positions, not text splitting** — reference numbers (e.g. `R25853`, `Rc-058870`) sit in the Description area (left of the Amount column) and must never be read as amounts. Verified x-ranges (right edges): **Date** ~x12–35, **Description** ~x38–360, **Amount** right-aligned ≈x444–480, **Balance** right-aligned ≈x505–545, **Accrued Bank Charges** right-aligned ≈x548–581.
3. **Sign comes from the Cr/Dr suffix on the Amount** (FNB has ONE amount column, not Money In/Out):
   - `…Cr` suffix → **credit = money IN** → positive (income).
   - no suffix or `…Dr` → **debit = money OUT** → negative (expense).
   - The **Balance** column also carries `Cr`/`Dr` (`Cr` = positive balance) — used only for reconciliation.
4. **Comma thousands separator** (`1,077.04`, `25,468.00`) — strip commas before parsing. (Capitec used spaces; keep both supported.)
5. **Dates are `DD Mon`** with **no year** (`01 Apr`, `06 May`). Infer the year from **"Statement Period : 31 March 2026 to 30 April 2026"**; handle a Dec→Jan rollover within the period.
6. **Opening/Closing balance** come from the **"Statement Balances"** block (`Opening Balance 182.04Cr`, `Closing Balance 892.38Cr`) — Cr/Dr aware. Drive `reconciliation.ok` off the **Amount-column balance chain** ending at Closing Balance (same approach as Capitec).
7. **Accrued "Bank Charges" column** (rightmost) is **informational** — it does NOT affect the running balance (verified), so do **not** add it to transaction amounts. The actual fee debits already appear as their own Amount rows (e.g. the `6.00` debit). Skip `0.00`-amount rows (they only show an accrued charge).
8. Rows may have **no description** (fee/charge lines) — keep them as transactions if they have a non-zero Amount; otherwise skip.

## Generalise the anchor (this is why FNB got 0 rows)
Make the transaction-section detection **bank-agnostic**: anchor on a header row containing **Date + Balance + (Amount | Money In/Out | Debit/Credit)** — not the literal string "Transaction History". Capitec keeps its `Date … Money In Money Out … Balance` header; FNB uses `Date Description Amount Balance`. Pick the bank template by detecting the bank from header text (FNB: "fnb.co.za" / "First National Bank" / "Gold Business Account"), else fall back to the generic header-based extractor.

## Tests + fixture (no PII)
- Add an **FNB fixture** that replicates this layout with fake data: the "Transactions in RAND (ZAR)" section, `Date Description Amount Balance Bank Charges` header, `DD Mon` dates, Cr/Dr-suffixed amounts and balances, comma thousands, a reference-number-in-description row, a no-description fee row, and the "Statement Balances" opening/closing. Store under `src/lib/budget/__tests__/fixtures/` (no real account numbers/names).
- Assert: only Transaction-section rows parse; Cr→income / non-Cr→expense signs; commas parse; reference numbers are NOT read as amounts; the **balance chain reconciles to the printed Closing Balance**; year inferred from Statement Period.
- Also add a regression test that a statement **without** a "Transaction History" heading still parses (the bug that gave FNB 0 rows).
- `npx tsc --noEmit` clean; all existing tests (incl. Capitec) still pass.

## Constraints
No schema change. SAST + ZAR cents. Don't touch `useProgress.ts`/XP/sync or the Capitec template's behaviour. **Commit only** parser/template/test/fixture files — **not `git add -A`** (OneDrive 0-byte'd tracked PDFs). Push to `main`.
