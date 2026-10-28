/**
 * Dev harness: renders a sample budget report PDF through the REAL
 * buildReport pipeline (categorisation, insights, comparison, the lot).
 * Run: npx tsx __harness.tsx
 */
import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import { BudgetReportDocument } from "@/lib/budget/report/pdf";
import { assertReportModel, buildReport } from "@/lib/budget/report/aggregate";
import type { BudgetEntryInput, BudgetTargetInput, CategoryMeta } from "@/lib/budget/report/types";

const customCategories: CategoryMeta[] = [
  { id: "stokvel", name: "Stokvel", color: "#00A9A5", type: "expense" },
  { id: "tithe", name: "Tithe", color: "#8E6CC1", type: "expense" },
  { id: "family", name: "Family Support", color: "#D97742", type: "expense" },
  { id: "bank-charges", name: "Bank Charges", color: "#6B7280", type: "expense" },
  { id: "business-exp", name: "Business", color: "#3B7DD8", type: "expense" },
  { id: "stokvel-income", name: "Stokvel Payout", color: "#00A9A5", type: "income" },
];

const targets: BudgetTargetInput[] = [
  { category: "food", monthly_limit: 4000, month_year: "default" },
  { category: "stokvel", monthly_limit: 5500, month_year: "default" },
  { category: "transport", monthly_limit: 1800, month_year: "default" },
];

const entries: BudgetEntryInput[] = [];
let id = 0;
const add = (
  month: string,
  day: number,
  type: "income" | "expense",
  category: string,
  amount: number,
  description: string
) => {
  entries.push({
    id: String(++id),
    type,
    category,
    amount,
    description,
    entry_date: `${month}-${String(day).padStart(2, "0")}`,
  });
};

// Six complete months + a partial July (report cuts off on the 12th).
// Amounts vary month to month so the sample reads like real bank data.
const MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
MONTHS.forEach((m, i) => {
  const wiggle = (base: number, pct: number) =>
    Math.round(base * (1 + pct * Math.sin(i * 2.1 + base % 7)));
  add(m, 1, "income", "salary", 28500, "Salary - Umlazi Traders");
  add(m, 15, "income", "business", wiggle(4100, 0.45), "Side hustle - sneaker resale");
  if (i % 2 === 0) add(m, 20, "income", "other-income", wiggle(9500, 0.6), "FNB App Transfer From Unknown");
  if (i >= 2) add(m, 25, "income", "stokvel-income", 6100, "Gogo Zwane Imizamo payout");

  add(m, 2, "expense", "stokvel", 5500, "Mama Coka Imizamo-5,500.00 Fee: Payshap Sent R7.50");
  add(m, 3, "expense", "debt", 4650, "Imizamo loan repayment Samke-4,650.00");
  add(m, 4, "expense", "food", wiggle(1750, 0.3), "Checkers Sixty60");
  add(m, 12, "expense", "food", wiggle(1400, 0.35), "Boxer Superstore Umlazi");
  add(m, 5, "expense", "transport", wiggle(1500, 0.4), "Uber trips");
  add(m, 6, "expense", "airtime", wiggle(450, 0.3), "Vodacom data bundle");
  add(m, 7, "expense", "housing", 3800, "Rent - Room Umlazi");
  add(m, 8, "expense", "tithe", 1200, "Church tithe");
  add(m, 9, "expense", "family", wiggle(2000, 0.25), "Send Money Mama-2,000.00");
  add(m, 10, "expense", "bank-charges", 185, "FEE: PAYSHAP + monthly account fee 12345678");
  add(m, 11, "expense", "savings", wiggle(1650, 0.2), "FNB App Payment To Savings Pocket");
  add(m, 18, "expense", "other", 6200, "DALITSO GROUP-6,200.00 ELECT");
  if (i !== 3) add(m, 22, "expense", "other", wiggle(4900, 0.5), "");
  add(m, 27, "expense", "entertainment", wiggle(850, 0.6), "Netflix + braai supplies");
  add(m, 28, "expense", "business-exp", wiggle(3600, 0.5), "Stock purchase - sneakers");
});
// Partial July (1-12)
add("2026-07", 1, "income", "salary", 28500, "Salary - Umlazi Traders");
add("2026-07", 2, "expense", "stokvel", 5500, "Mama Coka Imizamo-5,500.00 Fee: Payshap Sent R7.50");
add("2026-07", 3, "expense", "debt", 4650, "Imizamo loan repayment Samke-4,650.00");
add("2026-07", 4, "expense", "food", 1600, "Checkers Sixty60");
add("2026-07", 7, "expense", "housing", 3800, "Rent - Room Umlazi");
add("2026-07", 10, "expense", "other", 5100, "DALITSO GROUP-5,100.00 ELECT");

// Previous period (equal length before 1 Jan) - sparse, just enough for deltas.
const prevEntries: BudgetEntryInput[] = [];
for (const m of ["2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"]) {
  prevEntries.push(
    { type: "income", category: "salary", amount: 26000, entry_date: `${m}-01`, description: "Salary" },
    { type: "expense", category: "food", amount: 3400, entry_date: `${m}-05`, description: "Groceries" },
    { type: "expense", category: "stokvel", amount: 4500, entry_date: `${m}-02`, description: "Stokvel" },
    { type: "expense", category: "other", amount: 9800, entry_date: `${m}-15`, description: "Misc" }
  );
}

const model = buildReport(
  entries,
  targets,
  customCategories,
  "2026-01-01",
  "2026-07-12",
  "Minenhle",
  new Date().toISOString(),
  {
    prevEntries,
    prevStart: "2025-07-05",
    prevEnd: "2025-12-31",
    historyEntries: entries,
  }
);
assertReportModel(model);
// Reconciliation check for the month-by-month table fix.
for (const m of model.monthlySpend) {
  const ok = m.incomeCents - m.consumptionCents - m.setAsideCents === m.netCents;
  if (!ok) throw new Error(`Month ${m.monthYear} does not reconcile: ${m.incomeCents} - ${m.consumptionCents} - ${m.setAsideCents} !== ${m.netCents}`);
}

console.log("Health:", model.insights.healthScore, `(raw ${model.insights.healthScoreRaw})`, model.insights.healthBand);
console.log("Cap note:", model.insights.healthCapNote);
console.log("Savings rate:", model.savingsRatePct, "% | set aside:", model.setAsideCents / 100);
console.log("Budget used:", model.budgetUsedPct, "% | unbudgeted:", model.unbudgetedActualCents / 100);
console.log("Groups:", Object.fromEntries(Object.entries(model.groupTotals).map(([k, v]) => [k, v / 100])));
console.log("Recurring:", model.recurringCommitments.map((r) => `${r.description} ~R${r.typicalCents / 100} x${r.count}`));
console.log("Largest:", model.largestTransactions.map((t) => `${t.description} R${t.cents / 100}`));
console.log("Actions:", model.insights.actions.map((a) => `${a.isTopPriority ? "[TOP] " : ""}${a.title}`));

renderToFile(
  <BudgetReportDocument model={model} logoDataUri={undefined} />,
  `${process.env.HARNESS_OUT ?? "."}/test-report.pdf`
).then(() => console.log("rendered"));
