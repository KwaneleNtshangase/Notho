# Cursor Prompt — Phase 3: Budgeted-vs-Actual PDF Report (APPROVED — build directly)

> Fresh session: this spec is **already approved**. Read the listed files to orient, then **build it directly — do NOT re-plan, do NOT re-ask, do NOT re-summarise.** Phases 1–2 (CSV/OFX import, categorisation, merchant rules) are already merged and live in production. There is **no schema change** and **no new dependency** in this phase.

---

You are continuing **Notho** (Next.js + Supabase + Vercel; ZAR; SAST/UTC+2). Build **Phase 3: an exportable, polished, accurate budget report (PDF)** for a user-chosen period. Production app, live data — accuracy and not breaking existing features are non-negotiable.

## Orient first (read, don't re-plan)
- `src/components/BudgetPlanner.tsx` — existing budget UI (month/year, recharts, "Set Budget"). Add the export button here.
- `src/lib/budget/**` — Phase 1–2 pipeline. Reuse `types.ts`/helpers; if `report/` doesn't exist, create it. Do **not** modify the import pipeline.
- `src/lib/dates.ts` — `sastToday`, `sastOffset`, `sastWeekKey`. Use for ALL period math; never raw `new Date()` for boundaries.
- `src/lib/currency.ts` (`formatZarCurrency`, 2dp) and `formatRand` in `src/lib/viewHelpers.ts`.
- `src/lib/apiAuth.ts` (`getUserFromRequest`) and `src/app/api/budget/import/commit/route.ts` (Phase 1 service-role route pattern).

## Data sources (already live — do NOT change schema, do NOT touch useProgress/import/XP/sync)
- **Actuals:** `budget_entries` — `user_id, type ('income'|'expense'), category, amount (NUMERIC), description, entry_date (YYYY-MM-DD)`.
- **Budgeted:** `budget_targets` — `user_id, category, monthly_limit, month_year ('YYYY-MM')`, **expense categories only**.
- `custom_budget_categories` (names/colors/icons), `profiles` (display name).

## Locked decisions
1. Reuse `budget_targets` for budgeted; no new tables.
2. **Period boundaries cap ongoing periods at today:** `periodEnd = min(calendarEnd, sastToday())`. So the current quarter/year runs **to-date**; a past/completed quarter or year uses its full exact range.
3. **Actuals are always exact.** **Budgeted is exact only for whole-month-aligned periods**; partial months are **prorated by day-count and labelled "Estimate"** — never present prorated budget as exact.
4. All internal math in **integer cents**; convert to ZAR (2dp via `formatZarCurrency`) only at display edges.
5. Charts are **static SVG via `@react-pdf/renderer` primitives** (already installed) — do **not** add `sharp`.

## Architecture
| Path | Role |
|---|---|
| `src/lib/budget/report/period.ts` | SAST presets → `{periodStart, periodEnd}` (string YYYY-MM-DD; `periodEnd = min(calendarEnd, sastToday())`) |
| `src/lib/budget/report/types.ts` | `ReportModel`, cents-based shapes |
| `src/lib/budget/report/aggregate.ts` | pure `buildReport(entries, targets, categories, periodStart, periodEnd) → ReportModel` — no I/O |
| `src/lib/budget/report/pdf.tsx` | `@react-pdf/renderer` document + SVG charts |
| `src/app/api/budget/report/route.ts` | POST `{periodStart, periodEnd}`; `getUserFromRequest`; **derive user_id from session only**; service-role fetch; assert; stream PDF |
| `src/components/BudgetPlanner.tsx` | "Export report" button + period-picker modal (match header styling) → download blob |

## PDF layout (A4 portrait, brand: primary #007A4D, expense red #E03C31, accent #FFB612)
- **Page 1 — Cover + summary:** Notho brand bar; "Prepared for {displayName}"; period (human-readable, SAST) + generated timestamp. Summary cards: Income, Expenses, Net, Savings rate. Budget-vs-actual band (Budgeted, Actual, Variance, % used) with **"Estimate" badge** when prorated.
- **Page 2 — Category tables:** Expenses table (category w/ color dot, Budgeted, Actual, Variance R, Variance %, Share %) — red if over-budget, green if under. Income table (category, Actual, Share of income).
- **Page 3 — Charts (SVG):** expense breakdown donut; monthly spend bars (one bar per month in range); budget-vs-actual grouped bars per expense category.
- **Page 4 — Insights:** top 5 merchants/descriptions by spend; 5 largest transactions; top 3 over-budget and top 3 under-budget categories.
- **Footer every page:** "Figures are based on data you entered or imported · Page N of M".

## Exact aggregation rules (cents; inclusive string-compare on ISO dates)
**Period presets** (`period.ts`, all SAST, `periodEnd = min(calendarEnd, sastToday())`): This month; Last month (full, past → exact); Quarter (calendar Q, capped at today); Year (YYYY-01-01…, capped at today); Custom (picker defaults to month edges). Inclusion: `periodStart <= entry_date <= periodEnd`.

**Actuals:** for each entry, `cents = Math.round(amount*100)`; income → `totalIncomeCents`+`incomeByCategory`; expense → `totalExpenseCents`+`expenseByCategory`. Refunds stored `type='income'` count as income. Category expense share = `categoryExpenseCents/totalExpenseCents*100` (0 if none). Net = income − expense.

**Savings rate** — match existing BudgetPlanner: `expenseByCategory['savings'] / totalIncomeCents * 100` (0 if no income). Not net-surplus, so the report matches the app.

**Budgeted (expense categories only):** for each expense category and each `YYYY-MM` overlapping the period:
```
overlapStart = max(periodStart, firstDayOf(YYYY-MM))
overlapEnd   = min(periodEnd,   lastDayOf(YYYY-MM))
daysInOverlap = inclusiveDayCount(overlapStart, overlapEnd)
daysInMonth   = daysInMonth(YYYY-MM)                 // leap-aware
monthBudgetCents = round(monthly_limit*100) or 0 if no target
if daysInOverlap == daysInMonth:  categoryBudgetCents += monthBudgetCents          // exact
else:                             categoryBudgetCents += round(monthBudgetCents * daysInOverlap / daysInMonth); budgetIsEstimate = true
```
`budgetIsEstimate = true` if any overlapping month is partial for any category with a target → PDF shows "Estimate" badge. Whole-month-aligned periods → `false`.

**Variance** (per expense category where budgeted>0 or actual>0): `varianceCents = actualCents − budgetedCents`; `variancePct = budgeted>0 ? actual/budgeted*100 : null`; `overBudget = actual>budgeted && budgeted>0`. Summary variance = `totalExpenseCents − totalBudgetedExpenseCents`.

**Insights:** top merchants = group expense description (trim, case-fold), sum cents, top 5; largest = top 5 expense entries by cents; over/under = expense categories with budgeted>0 ranked by variance desc/asc. **Monthly series:** for each `YYYY-MM` touched, sum expense cents in that month's overlap slice.

## Pre-render assertions (API route — fail closed)
```
assert sum(expenseByCategory) === totalExpenseCents
assert sum(incomeByCategory)  === totalIncomeCents
assert per-category rows sum to summary totals
// re-query DB sum for period === model totals (cent-level)
```
Any mismatch → 500, do not stream a PDF.

## Tests (`aggregate.test.ts` + fixed-fixture snapshot of `ReportModel`); `npx tsc --noEmit` clean; existing tests still pass
Empty period; single txn; income refund; presets (this/last month, quarter, year) with cap-at-today; custom mid-month proration + `budgetIsEstimate:true`; SAST month boundary (entry at month-end stays in month via string compare); leap-Feb 2024 (29-day denominator); large values (no float drift); category with budget/no spend and spend/no budget.

## UI
"Export report" button in the `BudgetPlanner` header row (beside Import / Month|Year / Add). Modal: preset dropdown + custom range (month-aligned defaults). Submit → POST with Bearer token → download `notho-budget-report-{period}.pdf`. Loading + error states.

## Constraints / won't touch
No schema changes. No new deps (avoid `sharp`). SAST everywhere; ZAR 2dp; integer-cent math. Don't touch `useProgress.ts`, import pipeline, or XP/sync. Don't refactor BudgetPlanner's existing month nav.
**Commit hygiene — do NOT `git add -A`** (OneDrive truncates tracked study PDFs to 0 bytes). Stage only `src/lib/budget/report/**`, `src/app/api/budget/report/**`, `src/components/BudgetPlanner.tsx`, and the new tests. Run `git status` and confirm no 0-byte PDFs or unrelated binaries are staged. Then commit and push to `main`.

Build it now.
