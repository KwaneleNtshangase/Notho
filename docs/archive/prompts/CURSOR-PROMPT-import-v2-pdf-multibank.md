# Cursor Prompt — Statement Import v2: PDF + Multi-Bank + Transfers

> Build on the **live** Phase 1–3 import/report system. This adds: (A) PDF statement parsing for **any** bank, (B) uploading **multiple** statements at once with per-bank tagging, (C) detecting **transfers between the user's own accounts** so they aren't double-counted. There IS a small additive schema change and ONE new dependency in this phase — both flagged below. **Write the migration but do NOT apply it** (it will be applied to prod separately). Flag the dependency, then build.

---

You are extending **Notho** (Next.js + Supabase + Vercel; ZAR; SAST/UTC+2). Phases 1–3 (CSV/OFX import → categorise → editable preview → commit; PDF budget report) are merged and in production. Reuse that pipeline; do not rebuild it. Production app, live data — accuracy, privacy (POPIA), and not breaking existing features are non-negotiable.

## Orient first (read, don't rebuild)
- `src/lib/budget/parsers/**`, `src/lib/budget/dedupe.ts`, `reconciliation.ts`, `types.ts` — the existing parse pipeline + `NormalizedTxn`.
- `src/components/BudgetImportPanel*` and `src/components/BudgetPlanner.tsx` — existing upload/preview/commit UI.
- `src/app/api/budget/import/parse/route.ts` + `commit/route.ts` — existing in-memory parse + service-role insert.
- `src/lib/budget/report/aggregate.ts` — Phase 3 report aggregation (must be updated to exclude transfers — see §D).
- `src/lib/dates.ts` (SAST), `src/lib/currency.ts` / `formatRand`, `src/lib/apiAuth.ts`.
- `supabase/migrations/20260624100000_budget_import_and_merchant_rules.sql` — existing import schema (`budget_entries.source/import_batch_id/dedupe_hash`, `budget_import_batches` already allows `file_type='pdf'`, `user_merchant_rules`).

## Locked decisions (from product owner)
1. **All banks must work regardless of which it is** — a generic PDF transaction extractor is the baseline; add tuned templates for **Capitec, Standard Bank, FNB** (the banks we can test with real statements). Everything still flows through the existing **preview → edit → commit + reconciliation** so a wrong parse is caught, never silently saved.
2. **Password-protected PDFs:** the owner's aren't locked, but some users' are — detect encryption and prompt for the PDF password; unlock **in memory**, parse, discard. Never store or log the password.
3. **Multi-account:** tag every transaction with its **source bank**, and **detect transfers between the user's own accounts** and let the user exclude them from income/expense (so a transfer isn't counted as both).

## A. PDF parsing (bank-agnostic + templates)
- Server-side, **in memory only** (parse-then-discard — same POPIA model as CSV/OFX; never write the raw PDF anywhere).
- Add a `pdf.ts` parser behind the existing `parseStatement(file, type)` interface, producing the same `NormalizedTxn[]` (`{ date, description, amountZAR (signed; negative = out), rawMerchant, balanceAfter? }`).
- **Text extraction:** use `pdfjs-dist` (positional text helps reconstruct columns). **FLAG this dependency** (it's the one new dep this phase). Do not add OCR/tesseract now.
- **Generic extractor:** from the positioned text, find transaction rows by detecting a date token + a monetary amount on the same line/row; infer columns from x-positions. Handle the common SA layouts: single signed amount; separate debit/credit columns; and a trailing running-balance column. Robustly parse SA date formats (`DD/MM/YYYY`, `DD Mon YYYY`, `YYYY-MM-DD`, `DD-MM-YY`) to ISO in SAST, inferring year correctly across statements that span a year boundary.
- **Per-bank templates** for Capitec, Standard Bank, FNB: detect the bank from header text, then apply known column order / date format / sign convention to override the generic guesser. Generic fallback for any other bank.
- **Encrypted PDFs:** detect pdfjs `PasswordException` → return a structured `{ needsPassword: true }` response (no parse). The UI prompts for a password; re-call parse with it; unlock in memory; never persist it.
- **Scanned / image-only PDFs (no text layer):** detect (no extractable text) → return a clear, friendly error: "This looks like a scanned image — please upload the downloadable/text PDF or a CSV/OFX." Do NOT attempt OCR this phase (note it as a future option).
- **Reconciliation + confidence:** parse opening/closing balance and any printed totals; reconcile the signed sum + count against them (reuse `reconciliation.ts`). If nothing is available to reconcile against, mark the batch **lower confidence** and flag individual uncertain rows as **"needs review"** in the preview. Never auto-commit a PDF that fails reconciliation — surface the warning and force review (existing 409-on-commit behaviour).

## B. Multiple statements at once + per-bank tagging
- Upload UI: accept **`.pdf`** in addition to `.csv`/`.ofx`, and allow selecting **multiple files** (mixed types OK). Parse each; show **one combined, editable preview** grouped by source file, with a **Bank/Account** column (auto-detected from the statement where possible, editable per file).
- Carry the bank/account label through parse → preview → commit.
- Dedupe is per-user via the existing `dedupe_hash`; distinct banks produce distinct rows, so no false collisions. Re-uploading the same file is still skipped.

## C. Transfer detection (between the user's own accounts)
- After parsing 2+ statements, detect **transfer pairs**: a debit on one account matching a credit on another (same/near amount within a small tolerance, dates within ~3 days, opposite sign, different source banks). Reuse description hints ("transfer", "payment to", beneficiary names) to raise confidence.
- In the preview, show: "These look like transfers between your own accounts — exclude from spending?" with each pair, **user-confirmed, editable** (never silent). Confirmed transfers are marked and **excluded from income/expense totals** (both legs).

## D. Schema (FLAG — additive; write the migration, do NOT apply it)
New migration `supabase/migrations/<timestamp>_import_v2_accounts_transfers.sql`, additive + idempotent:
- `ALTER TABLE budget_entries ADD COLUMN IF NOT EXISTS account_label TEXT;`
- `ALTER TABLE budget_entries ADD COLUMN IF NOT EXISTS is_transfer BOOLEAN NOT NULL DEFAULT false;`
- `ALTER TABLE budget_import_batches ADD COLUMN IF NOT EXISTS account_label TEXT;`
- No RLS change (new columns on already-RLS'd tables). No data backfill needed (defaults are safe).
- **Update `report/aggregate.ts` (Phase 3) to EXCLUDE `is_transfer = true` rows** from income, expense, budgeted-vs-actual, and insights — otherwise reports double-count transfers. Add a test for this.
- Leave applying the migration to prod to the product owner (it will be run in the Supabase dashboard separately). Note in your summary that it must be applied before this deploy is used.

## Dependencies (FLAG)
- **`pdfjs-dist`** — PDF text extraction (the only new dep). Flag it; if you believe you need anything else, stop and flag before adding.
- No OCR/tesseract this phase.

## Privacy (POPIA)
- Raw PDF and any password: **in memory only**, never written to Supabase Storage, disk, or logs. Only structured rows + batch metadata + `account_label`/`is_transfer` persist. Keep the existing consent step; extend its wording to cover PDFs and multiple files.

## Tests (PDF is the highest-risk area — cover it heavily)
- Per-bank parser tests using **real anonymised statement fixtures** for Capitec, Standard Bank, FNB (the owner will provide; strip names/account numbers; **no PII committed** — store under `__tests__/fixtures/` with the existing README policy). Generic-extractor tests with synthetic layouts (signed-amount, debit/credit columns, running-balance).
- Encrypted-PDF detection (mock `PasswordException` → `needsPassword`); unlock-with-password path.
- Scanned/no-text-layer detection → friendly error.
- Date-format parsing incl. year-boundary; reconciliation pass/fail + needs-review flagging.
- Multi-file merge: distinct banks don't false-dedupe; combined preview totals correct.
- Transfer detection: a matching debit/credit pair across two banks is flagged; non-matching amounts/dates are NOT flagged; confirmed transfers excluded from report totals.
- `report/aggregate.ts` excludes `is_transfer` rows. `npx tsc --noEmit` clean; all existing tests still pass.

## Constraints / won't touch
- Don't touch `useProgress.ts`, XP/sync, or the cross-device delta system. SAST everywhere; ZAR with integer-cent math; RLS; `getUserFromRequest`; service role only server-side.
- **Commit hygiene — do NOT `git add -A`** (OneDrive truncates tracked study PDFs to 0 bytes). Stage only: the new/changed `src/lib/budget/**`, import API routes, `BudgetImportPanel*`/`BudgetPlanner.tsx`, `report/aggregate.ts`, the new migration, and tests. Run `git status` and confirm no 0-byte PDFs or unrelated binaries are staged. Then commit and push to `main`.

Build it. In your final summary, explicitly list: (1) the new dependency added, (2) that the new migration must be applied to prod before use, and (3) any bank whose parser is generic-only (untested against a real statement).
