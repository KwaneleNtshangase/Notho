# Cursor Prompt — Bank-Statement Import, Auto-Categorisation & Budget Report Export

> Paste everything below the line into Cursor (Composer / Agent mode, with the repo open).
> It is written so Cursor reads the codebase first, confirms the plan, and builds in safe phases.

---

You are working on **Notho**, a Next.js + Supabase + Vercel financial-literacy app for South African Gen Z users (currency ZAR, timezone SAST / UTC+2). This is a **production app with live user data**. Accuracy, privacy, and not breaking existing features are non-negotiable.

## 0. Before writing any code — read and report
Do not assume the codebase. First open and read these files, then give me a short written summary of how the current budget works and your implementation plan. **Wait for my approval before coding.**

- `src/components/BudgetPlanner.tsx` — the existing budget UI (uses the `budget_entries` table: `id, user_id, type ('income'|'expense'), category, amount, description, entry_date`; and `custom_budget_categories`). Charts use `recharts`.
- `supabase/migrations/20260404000000_custom_budget_categories.sql` and `20260404120000_budget_benchmarks_view.sql`
- `src/lib/supabaseClient.ts` (anon client), `src/lib/apiAuth.ts` (`getUserFromRequest` for authenticated API routes), `src/app/api/progress/sync-streak/route.ts` (reference for a server route that uses the `SUPABASE_SERVICE_ROLE_KEY`).
- `src/lib/dates.ts` (ALWAYS use these SAST helpers — never raw `new Date().toISOString()` for dates), `src/lib/currency.ts` and `formatRand` in `src/lib/viewHelpers.ts` (use for all money formatting).
- Existing RLS pattern: every user table uses `auth.uid() = user_id` policies. Migrations are named `YYYYMMDDHHMMSS_description.sql`.

## 1. What to build (4 capabilities)
1. **Import bank statements** → parse → auto-categorise transactions → write them into the user's budget as editable expense/income entries.
2. **Let the user edit everything** — category, amount, description, date, and the auto-assigned category — with bulk edit and re-categorise.
3. **A "budget" layer of planned figures** per category per period, so reports can show **budgeted vs actual**. (Confirm whether a planned-budget concept already exists; the current `budget_entries` table appears to store *actuals* only. If there is no planned-budget table, add one — see §5.)
4. **Export a polished PDF report** for a user-chosen time period showing budgeted vs actual, category breakdowns, and trends — accurate to the cent.

## 2. Locked product decisions (build to these)
- **Input formats:** Phase 1 = **CSV and OFX** (clean bank exports). Phase 2 = **PDF** statements. Build the pipeline format-agnostic behind one interface so PDF slots in later.
- **Categorisation:** **Hybrid** — a deterministic merchant/keyword rules engine for common SA merchants first; only fall back to an AI/LLM call for transactions the rules can't classify. The engine must **learn from user edits** (when a user re-categorises a merchant, remember it for that user).
- **Export:** a **designed, branded PDF report** (aesthetically polished, on-brand with the app).
- **Privacy (POPIA):** **parse-then-discard** — never persist the raw uploaded statement file. Parse server-side in memory, store only structured transaction data, then drop the file. Show a clear consent notice before upload.

## 3. Feature A — Statement import pipeline
- **Upload UI** inside the budget area (a new tab/section in or beside `BudgetPlanner.tsx`, matching existing styling). Accept `.csv`, `.ofx` (Phase 1); `.pdf` (Phase 2). Show file-size/type validation and a privacy/consent line ("Your statement is processed securely and the file is not stored").
- **Server-side parsing** in a Next API route (e.g. `src/app/api/budget/import/route.ts`) authenticated via `getUserFromRequest`. Never parse sensitive financial files purely client-side if it means uploading raw data anywhere persistent; process in memory and discard.
- **Parsers** behind a common interface `parseStatement(file): NormalizedTxn[]` where `NormalizedTxn = { date, description, amountZAR (signed: negative = money out), rawMerchant, balanceAfter? }`. Implement CSV (configurable column mapping with auto-detection for FNB, Standard Bank, Capitec, Nedbank, Absa export headers) and OFX first.
- **Reconciliation guard (critical for accuracy):** after parsing, assert that the count and signed sum of parsed transactions match the statement's own totals/closing balance where available. Surface a clear warning if they don't reconcile, and never silently import a mismatched statement.
- **Deduplication:** detect and skip transactions already imported (hash of date+amount+normalised description per user) so re-uploading an overlapping statement never double-counts. Show the user what was imported vs skipped.
- **Preview-before-commit:** show the parsed, categorised transactions in an editable table; the user reviews/edits, then confirms, and only then are entries written to `budget_entries`.

## 4. Feature B — Categorisation engine
- A pure, unit-tested module `src/lib/categorisation/` exporting `categorise(txn, userRules): { category, confidence, source: 'rule'|'user'|'ai' }`.
- **Rules layer:** a maintainable map of SA merchant patterns → categories (e.g. Woolworths/Checkers/Pick n Pay → Groceries; Uber/Bolt → Transport; Vodacom/MTN/Telkom → Airtime/Data; Netflix/DStv → Entertainment; FNB/Capitec fees → Bank Charges; rent/bond keywords → Housing). Categories must map onto the user's existing `custom_budget_categories` plus sensible defaults.
- **User-learning layer:** a `user_merchant_rules` table (see §5). When a user re-categorises a merchant, upsert a rule so future imports for that user auto-apply it. User rules outrank built-in rules.
- **AI fallback:** only for unmatched transactions, batched in one call. Make the provider configurable via env; **flag this dependency to me before adding it.** Keep it optional/degradable — if no AI key is configured, unmatched txns default to "Uncategorised" for the user to set, and the app still works.

## 5. Data model / Supabase (FLAG before applying — touches live data)
Propose migrations (don't apply without my OK). Likely needs:
- `budget_plans` (planned figures): `user_id, category, period_type ('monthly'|'custom'), period_start, period_end, planned_amount, type`. RLS `auth.uid() = user_id`. (Only if no planned-budget concept already exists — confirm first.)
- `user_merchant_rules`: `user_id, merchant_pattern, category, created_at`. RLS as above.
- Possibly extend `budget_entries` with `source ('manual'|'import')`, `import_batch_id`, and a `dedupe_hash` (unique per user) — additive, nullable, `IF NOT EXISTS`.
- Reuse the existing `budget_entries` and `custom_budget_categories` tables for actuals — **do not** create a parallel system.
- Migrations must be additive/idempotent (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`), named with the timestamp convention, and include RLS policies.

## 6. Feature C — Editable budget
- Imported entries appear in the existing budget views as normal, fully editable `budget_entries` (edit category/amount/description/date; delete; bulk re-categorise). Editing a category offers "remember this merchant" to feed `user_merchant_rules`.
- Keep the existing `BudgetPlanner.tsx` UX and styling; extend, don't replace.

## 7. Feature D — PDF report export
- User picks a **time period** (month, quarter, custom range) and exports a **polished, branded PDF**. Generate server-side for reliability and consistent fonts (e.g. a `src/app/api/budget/report/route.ts`), or a vetted client-side generator — propose the approach and **flag any new dependency.**
- Report must include, all in ZAR via `formatRand` and SAST dates:
  - Cover/header with brand, user's name, and the selected period.
  - **Budgeted vs Actual** summary (totals: income, expenses, net) with variance and % of budget used.
  - **Per-category breakdown**: budgeted, actual, variance, and share of spend — as a clean table.
  - Visuals: category pie/bar and a spend-over-time line (consistent with the app's `recharts` look, rendered to image for the PDF).
  - Top merchants, largest transactions, and savings-rate for the period.
  - Footer with generation date and a "figures are based on imported/entered data" note.
- **Accuracy:** the report's totals must exactly equal the sum of the underlying `budget_entries` for the period (add an assertion/test). No rounding drift — sum in integer cents internally.

## 8. Constraints & conventions
- Stack is intentional: **Next.js + Supabase + Vercel.** Do not introduce new dependencies without flagging each one to me with the reason (PDF generation, OFX/CSV parsing, PDF text extraction, AI client). Prefer minimal, well-maintained libraries.
- All dates via `src/lib/dates.ts` (SAST). All money via `formatRand`. All new tables get RLS. Match existing component styling and the existing emoji→SVG/lucide icon approach.
- Explain the root cause/approach before large changes; keep PRs reviewable; don't refactor unrelated code.
- Note: `.git` lives in a OneDrive-synced folder and `node_modules` may be incomplete locally — assume CI/Vercel for the authoritative build; tell me if a local `npm install` is needed.

## 9. Acceptance criteria & test plan (this part must be bug-free)
Deliver automated tests, not just a demo. Treat "best of its kind, bug-free" as: deterministic parsing + reconciliation + full test coverage + human-in-the-loop editing.
- **Unit tests** for each parser against real-world sample CSV/OFX from the 5 major SA banks (include anonymised fixtures), and for the categorisation engine (rules, user-rule precedence, AI-fallback mocked).
- **Reconciliation tests:** parsed signed-sum and count match statement totals; mismatches are flagged, never silently imported.
- **Dedupe tests:** overlapping re-uploads never double-count.
- **Report accuracy tests:** report totals equal the DB sum of entries for the period, to the cent, across edge cases (empty period, single txn, refunds/credits, month boundaries in SAST, leap day, large values).
- **RLS tests:** a user can only ever read/import/report their own data.
- **Edge cases:** malformed/garbage file, wrong bank format, empty file, huge file, duplicate upload, negative/positive sign conventions, foreign-currency lines, multi-page PDF (Phase 2).
- Provide a manual QA checklist for the upload→preview→edit→commit→report flow on mobile and desktop.

## 10. Suggested phasing (ship incrementally, each phase green before the next)
1. Schema migrations (flagged) + import API skeleton + CSV/OFX parsers + reconciliation + dedupe + preview/commit UI.
2. Categorisation engine (rules + user-learning) wired into preview; tests.
3. PDF report (budgeted vs actual, breakdowns, charts) + accuracy tests.
4. AI fallback for unknown merchants (flagged dependency).
5. PDF statement parsing for the 5 major SA banks (highest-risk; most tests).

Start with **§0**: read the files, summarise the current budget system, and give me your plan + the exact migrations and dependencies you intend to add. Wait for my approval before coding.
