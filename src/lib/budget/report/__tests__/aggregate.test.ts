import { describe, expect, it } from "vitest";
import { assertReportModel, buildReport } from "../aggregate";
import {
  formatPeriodLabel,
  inclusiveDayCount,
  lastDayOfMonthYear,
  monthAlignedDefaults,
  resolvePeriod,
} from "../period";
import type { BudgetEntryInput, BudgetTargetInput } from "../types";

const FIXED_AT = "2026-06-15T10:00:00.000Z";
const TODAY = "2026-06-15";

function report(
  entries: BudgetEntryInput[],
  targets: BudgetTargetInput[] = [],
  periodStart: string,
  periodEnd: string
) {
  const model = buildReport(entries, targets, [], periodStart, periodEnd, "Test User", FIXED_AT);
  assertReportModel(model);
  return model;
}

describe("buildReport", () => {
  it("empty period returns zero totals", () => {
    const model = report([], [], "2026-06-01", "2026-06-30");
    expect(model.totalIncomeCents).toBe(0);
    expect(model.totalExpenseCents).toBe(0);
    expect(model.netCents).toBe(0);
    expect(model.savingsRatePct).toBe(0);
    expect(model.expenseCategories).toEqual([]);
    expect(model.incomeCategories).toEqual([]);
    expect(model.budgetIsEstimate).toBe(false);
  });

  it("single expense transaction", () => {
    const model = report(
      [{ type: "expense", category: "food", amount: 150.5, entry_date: "2026-06-10" }],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalExpenseCents).toBe(15050);
    expect(model.expenseCategories).toHaveLength(1);
    expect(model.expenseCategories[0].actualCents).toBe(15050);
    expect(model.expenseCategories[0].sharePct).toBe(100);
  });

  it("income refund counts as income", () => {
    const model = report(
      [
        { type: "income", category: "other-income", amount: 89.99, description: "Refund", entry_date: "2026-06-05" },
        { type: "expense", category: "food", amount: 200, entry_date: "2026-06-05" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalIncomeCents).toBe(8999);
    expect(model.totalExpenseCents).toBe(20000);
    expect(model.netCents).toBe(-11001);
    expect(model.incomeCategories[0].categoryId).toBe("other-income");
  });

  it("savings rate matches BudgetPlanner formula", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "savings", amount: 1500, entry_date: "2026-06-02" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.savingsRatePct).toBe(15);
  });

  it("category with budget but no spend", () => {
    const model = report(
      [],
      [{ category: "food", monthly_limit: 3000, month_year: "2026-06" }],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalBudgetedExpenseCents).toBe(300000);
    expect(model.expenseCategories).toHaveLength(1);
    expect(model.expenseCategories[0].actualCents).toBe(0);
    expect(model.expenseCategories[0].budgetedCents).toBe(300000);
    expect(model.budgetIsEstimate).toBe(false);
  });

  it("category with spend but no budget", () => {
    const model = report(
      [{ type: "expense", category: "transport", amount: 450, entry_date: "2026-06-12" }],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    const row = model.expenseCategories.find((r) => r.categoryId === "transport");
    expect(row?.budgetedCents).toBe(0);
    expect(row?.actualCents).toBe(45000);
    expect(row?.variancePct).toBeNull();
  });

  it("custom mid-month proration sets budgetIsEstimate", () => {
    const model = report(
      [{ type: "expense", category: "food", amount: 500, entry_date: "2026-06-10" }],
      [{ category: "food", monthly_limit: 3100, month_year: "2026-06" }],
      "2026-06-10",
      "2026-06-20"
    );
    expect(model.budgetIsEstimate).toBe(true);
    const daysOverlap = inclusiveDayCount("2026-06-10", "2026-06-20");
    const daysInMonth = inclusiveDayCount("2026-06-01", "2026-06-30");
    const expected = Math.round((310000 * daysOverlap) / daysInMonth);
    expect(model.expenseCategories[0].budgetedCents).toBe(expected);
  });

  it("whole-month period is exact budget (no estimate)", () => {
    const model = report(
      [],
      [{ category: "food", monthly_limit: 2500, month_year: "2026-05" }],
      "2026-05-01",
      "2026-05-31"
    );
    expect(model.budgetIsEstimate).toBe(false);
    expect(model.totalBudgetedExpenseCents).toBe(250000);
  });

  it("SAST month boundary - entry on last day of month included", () => {
    const model = report(
      [{ type: "expense", category: "food", amount: 99, entry_date: "2026-05-31" }],
      [],
      "2026-05-01",
      "2026-05-31"
    );
    expect(model.totalExpenseCents).toBe(9900);
  });

  it("leap Feb 2024 uses 29-day denominator", () => {
    const model = report(
      [],
      [{ category: "food", monthly_limit: 2900, month_year: "2024-02" }],
      "2024-02-01",
      "2024-02-15"
    );
    expect(model.budgetIsEstimate).toBe(true);
    const expected = Math.round((290000 * 15) / 29);
    expect(model.expenseCategories[0].budgetedCents).toBe(expected);
    expect(lastDayOfMonthYear("2024-02")).toBe("2024-02-29");
  });

  it("large values avoid float drift", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 999999.99, entry_date: "2026-06-01" },
        { type: "expense", category: "housing", amount: 123456.78, entry_date: "2026-06-02" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalIncomeCents).toBe(99999999);
    expect(model.totalExpenseCents).toBe(12345678);
    expect(model.netCents).toBe(99999999 - 12345678);
  });

  it("excludes is_transfer rows from totals and insights", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "food", amount: 500, entry_date: "2026-06-05" },
        { type: "expense", category: "savings", amount: 3000, entry_date: "2026-06-10", is_transfer: true },
        { type: "income", category: "other-income", amount: 3000, entry_date: "2026-06-10", is_transfer: true },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalIncomeCents).toBe(1000000);
    expect(model.totalExpenseCents).toBe(50000);
    expect(model.savingsRatePct).toBe(0);
    expect(model.incomeCategories).toHaveLength(1);
    expect(model.expenseCategories).toHaveLength(1);
  });

  it("top merchants case-fold and trim descriptions", () => {
    const model = report(
      [
        { type: "expense", category: "food", amount: 100, description: "  Woolworths ", entry_date: "2026-06-01" },
        { type: "expense", category: "food", amount: 50, description: "woolworths", entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 30, description: "Checkers", entry_date: "2026-06-03" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.topMerchants[0].description).toBe("Woolworths");
    expect(model.topMerchants[0].totalCents).toBe(15000);
    expect(model.topMerchants[0].count).toBe(2);
  });

  it("groups merchants by cleaned name (amounts, fees, bank prefixes stripped)", () => {
    const model = report(
      [
        {
          type: "expense",
          category: "other",
          amount: 5500,
          description: "Mama Coka Imizamo-5,500.00 Fee: Payshap Sent R7.50",
          entry_date: "2026-06-01",
        },
        {
          type: "expense",
          category: "other",
          amount: 500,
          description: "FNB App Payment To mama coka imizamo",
          entry_date: "2026-06-08",
        },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.topMerchants).toHaveLength(1);
    expect(model.topMerchants[0].description).toBe("Mama Coka Imizamo");
    expect(model.topMerchants[0].count).toBe(2);
    expect(model.topMerchants[0].totalCents).toBe(600000);
  });

  it("stokvel custom category counts as money set aside, not consumption", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "stokvel", amount: 1500, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 2000, entry_date: "2026-06-03" },
      ],
      [],
      [{ id: "stokvel", name: "Stokvel", color: "#00A9A5", type: "expense" }],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    expect(model.setAsideCents).toBe(150000);
    expect(model.consumptionCents).toBe(200000);
    expect(model.savingsRatePct).toBe(15);
    const row = model.expenseCategories.find((r) => r.categoryId === "stokvel");
    expect(row?.isSavingsVehicle).toBe(true);
    expect(row?.group).toBe("goals");
  });

  it("savingsCategoryIds override wins over auto-detection", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "savings", amount: 1000, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 500, entry_date: "2026-06-03" },
      ],
      [],
      [],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT,
      { savingsCategoryIds: ["food"] }
    );
    assertReportModel(model);
    // Only "food" is a vehicle under the override; "savings" is not.
    expect(model.setAsideCents).toBe(50000);
    expect(model.savingsRatePct).toBe(5);
  });

  it("budget comparison is like-for-like (unbudgeted spend excluded)", () => {
    const model = report(
      [
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-06-05" },
        { type: "expense", category: "other", amount: 50000, entry_date: "2026-06-06" },
      ],
      [{ category: "food", monthly_limit: 4000, month_year: "2026-06" }],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.totalBudgetedExpenseCents).toBe(400000);
    expect(model.budgetedActualCents).toBe(300000);
    expect(model.unbudgetedActualCents).toBe(5000000);
    expect(model.budgetUsedPct).toBe(75); // NOT 1325%
    expect(model.budgetVarianceCents).toBe(-100000);
    const other = model.expenseCategories.find((r) => r.categoryId === "other");
    expect(other?.hasBudget).toBe(false);
    expect(other?.variancePct).toBeNull();
  });

  it("flags partial months and computes monthly net", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 1000, entry_date: "2026-05-10" },
        { type: "expense", category: "food", amount: 400, entry_date: "2026-05-11" },
        { type: "expense", category: "food", amount: 200, entry_date: "2026-06-05" },
      ],
      [],
      "2026-05-01",
      "2026-06-15"
    );
    expect(model.monthlySpend[0].isPartial).toBe(false);
    expect(model.monthlySpend[0].netCents).toBe(60000);
    expect(model.monthlySpend[1].isPartial).toBe(true);
    expect(model.monthlySpend[1].daysCovered).toBe(15);
    expect(model.monthlySpend[1].daysInMonth).toBe(30);
  });

  it("projection uses complete months only", () => {
    const model = report(
      [
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-04-10" },
        { type: "expense", category: "food", amount: 5000, entry_date: "2026-05-10" },
        { type: "expense", category: "food", amount: 100, entry_date: "2026-06-05" },
      ],
      [],
      "2026-04-01",
      "2026-06-10"
    );
    expect(model.projection.monthsUsed).toBe(2);
    expect(model.projection.avgMonthlyExpenseCents).toBe(400000);
    expect(model.projection.annualisedExpenseCents).toBe(4800000);
  });

  it("prior-period comparison computes deltas", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 11000, entry_date: "2026-06-01" },
        { type: "expense", category: "food", amount: 500, entry_date: "2026-06-05" },
      ],
      [],
      [],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT,
      {
        prevEntries: [
          { type: "income", category: "salary", amount: 10000, entry_date: "2026-05-10" },
          { type: "expense", category: "food", amount: 1000, entry_date: "2026-05-12" },
        ],
        prevStart: "2026-05-02",
        prevEnd: "2026-05-31",
      }
    );
    expect(model.comparison).not.toBeNull();
    expect(model.comparison!.incomeDeltaPct).toBe(10);
    expect(model.comparison!.expenseDeltaPct).toBe(-50);
  });

  it("insights: unclassified spend triggers data quality alert and action", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "other", amount: 4000, entry_date: "2026-06-05" },
        { type: "expense", category: "food", amount: 2000, entry_date: "2026-06-06" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(model.dataQuality.unclassifiedExpenseSharePct).toBe(67);
    expect(model.insights.dataQualityAlert).not.toBeNull();
    expect(model.insights.actions[0].title).toMatch(/recategorise/i);
  });

  it("caps savings score and health score when the period runs a deficit", () => {
    // High set-aside (30%) but spent more than earned -> can't be 'Strong'.
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "stokvel", amount: 3000, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-06-03" },
        { type: "expense", category: "housing", amount: 5000, entry_date: "2026-06-04" },
      ],
      [],
      [{ id: "stokvel", name: "Stokvel", color: "#00A9A5", type: "expense" }],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    expect(model.netCents).toBeLessThan(0);
    const savings = model.insights.healthComponents.find((c) => c.label === "Saving habit")!;
    expect(savings.score).toBeLessThanOrEqual(12); // capped, not full marks
    expect(model.insights.healthBand).not.toBe("Strong");
    // Consumption (8000) was within income (10000) - shortfall is the choice to
    // set aside 3000. That should be reframed as an allocation win.
    expect(model.insights.wins.some((w) => /deciding where your money goes/.test(w))).toBe(true);
  });

  it("produces a one-line verdict that leads with the period's story", () => {
    const strong = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "savings", amount: 2500, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-06-03" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(typeof strong.insights.verdict).toBe("string");
    expect(strong.insights.verdict.length).toBeGreaterThan(10);

    const dirty = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "other", amount: 5000, entry_date: "2026-06-05" },
        { type: "expense", category: "food", amount: 1000, entry_date: "2026-06-06" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    expect(dirty.insights.verdict).toMatch(/categor/i);
  });

  it("reframes an allocation deficit instead of alarming, and flags loan-funded saving", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 8000, entry_date: "2026-06-01" },
        { type: "income", category: "loan-in", amount: 2000, description: "Loan", entry_date: "2026-06-02" },
        { type: "expense", category: "stokvel", amount: 5000, entry_date: "2026-06-03" },
        { type: "expense", category: "food", amount: 6000, entry_date: "2026-06-04" },
      ],
      [],
      [
        { id: "stokvel", name: "Stokvel", color: "#00A9A5", type: "expense" },
        { id: "loan-in", name: "Loan", color: "#888", type: "income" },
      ],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    // Income 10000, day-to-day 6000 (within income), set aside 5000 -> net -1000.
    expect(model.netCents).toBe(-100000);
    // The at-a-glance line should be neutral/info, not a red "spent more" alarm.
    const first = model.insights.highlights[0];
    expect(first.tone).toBe("info");
    expect(first.text).toMatch(/saving|reserves|set aside/i);
    // Loan-funded saving is surfaced as the leading risk.
    expect(model.insights.risks[0]).toMatch(/borrowed money|borrowing so you can save|keeps you in debt/i);
  });

  it("nets business income against business cost in the coach narrative", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "income", category: "business", amount: 4000, entry_date: "2026-06-02" },
        { type: "expense", category: "biz-exp", amount: 9000, description: "Stock", entry_date: "2026-06-05" },
      ],
      [],
      [{ id: "biz-exp", name: "Business", color: "#E6B84C", type: "expense" }],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    // Business income 4000, cost 9000 -> net 5000 drain, mentioned in the coach.
    expect(
      model.insights.coachParagraphs.some((p) => /side hustle/i.test(p) && /out of your pocket/i.test(p))
    ).toBe(true);
  });

  it("does not celebrate a category used under half its budget (misaligned)", () => {
    const model = report(
      [{ type: "expense", category: "business-exp", amount: 5000, description: "Stock", entry_date: "2026-06-05" }],
      [{ category: "business-exp", monthly_limit: 50000, month_year: "2026-06" }],
      "2026-06-01",
      "2026-06-30"
    );
    // 10% used of a huge budget is not a "win"; it should prompt recalibration.
    expect(model.insights.wins.some((w) => /business/i.test(w) && /under budget/i.test(w))).toBe(false);
    expect(model.insights.actions.some((a) => /recalibrate/i.test(a.title))).toBe(true);
  });

  it("classifies discretionary custom categories as Wants", () => {
    const model = buildReport(
      [
        { type: "expense", category: "subs", amount: 300, entry_date: "2026-06-05" },
        { type: "expense", category: "retail", amount: 500, entry_date: "2026-06-06" },
      ],
      [],
      [
        { id: "subs", name: "Subscriptions", color: "#7C4DFF", type: "expense" },
        { id: "retail", name: "Retail", color: "#F43F5E", type: "expense" },
      ],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    expect(model.groupTotals.wants).toBe(80000);
    expect(model.groupTotals.unclassified).toBe(0);
  });

  it("monthly rows reconcile: income - day-to-day - set aside = net", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "food", amount: 2000, entry_date: "2026-06-05" },
        { type: "expense", category: "savings", amount: 1500, entry_date: "2026-06-10" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    const m = model.monthlySpend[0];
    expect(m.setAsideCents).toBe(150000);
    expect(m.consumptionCents).toBe(200000);
    expect(m.incomeCents - m.consumptionCents - m.setAsideCents).toBe(m.netCents);
    expect(m.netCents).toBe(650000);
  });

  it("ignores a budget set against Other/unclassified (no 2494%-over noise)", () => {
    const model = report(
      [
        { type: "expense", category: "other", amount: 25000, entry_date: "2026-06-05" },
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-06-06" },
      ],
      [
        { category: "other", monthly_limit: 1000, month_year: "2026-06" },
        { category: "food", monthly_limit: 4000, month_year: "2026-06" },
      ],
      "2026-06-01",
      "2026-06-30"
    );
    const other = model.expenseCategories.find((r) => r.categoryId === "other");
    expect(other?.hasBudget).toBe(false); // budget on Other is ignored
    expect(other?.variancePct).toBeNull();
    expect(model.topOverBudget.some((r) => r.categoryId === "other")).toBe(false);
    // Only food's R4000 counts as the day-to-day budget.
    expect(model.dayToDayBudgetedCents).toBe(400000);
  });

  it("detects a monthly recurring payment in a single-month report via history", () => {
    const history: BudgetEntryInput[] = [];
    for (const m of ["2026-04", "2026-05", "2026-06"]) {
      history.push({
        type: "expense",
        category: "housing",
        amount: 3800,
        description: "Rent - Room Umlazi",
        entry_date: `${m}-07`,
      });
    }
    // The report window is just June, where Rent appears once.
    const model = buildReport(
      [{ type: "expense", category: "housing", amount: 3800, description: "Rent - Room Umlazi", entry_date: "2026-06-07" }],
      [],
      [],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT,
      { historyEntries: history }
    );
    assertReportModel(model);
    expect(model.recurringCommitments).toHaveLength(1);
    expect(model.recurringCommitments[0].description).toBe("Rent - Room Umlazi");
    expect(model.recurringCommitments[0].monthsSeen).toBe(3);
  });

  it("business custom category is its own group, not unclassified", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "business-exp", amount: 3000, entry_date: "2026-06-05" },
        { type: "expense", category: "other", amount: 1000, entry_date: "2026-06-06" },
      ],
      [],
      [{ id: "business-exp", name: "Business", color: "#3B7DD8", type: "expense" }],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    expect(model.groupTotals.business).toBe(300000);
    expect(model.groupTotals.unclassified).toBe(100000);
    expect(model.dataQuality.unclassifiedExpenseSharePct).toBe(25);
  });

  it("savings vehicles are excluded from like-for-like budget and overspend lists", () => {
    const model = buildReport(
      [
        { type: "income", category: "salary", amount: 20000, entry_date: "2026-06-01" },
        { type: "expense", category: "stokvel", amount: 6000, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 3500, entry_date: "2026-06-05" },
      ],
      [
        { category: "stokvel", monthly_limit: 5000, month_year: "2026-06" },
        { category: "food", monthly_limit: 4000, month_year: "2026-06" },
      ],
      [{ id: "stokvel", name: "Stokvel", color: "#00A9A5", type: "expense" }],
      "2026-06-01",
      "2026-06-30",
      "Test User",
      FIXED_AT
    );
    assertReportModel(model);
    // Stokvel over-contribution is NOT overspending.
    expect(model.topOverBudget).toHaveLength(0);
    expect(model.dayToDayBudgetedCents).toBe(400000);
    expect(model.setAsidePlannedCents).toBe(500000);
    expect(model.budgetedActualCents).toBe(350000);
    expect(model.budgetUsedPct).toBe(88); // food only, stokvel excluded
    expect(model.unbudgetedActualCents).toBe(0);
  });

  it("detects recurring commitments and collapses them out of largest transactions", () => {
    const entries: BudgetEntryInput[] = [];
    for (const m of ["2026-01", "2026-02", "2026-03", "2026-04"]) {
      entries.push({
        type: "expense",
        category: "housing",
        amount: 3800,
        description: "Rent - Room Umlazi",
        entry_date: `${m}-07`,
      });
    }
    entries.push({
      type: "expense",
      category: "food",
      amount: 2500,
      description: "Makro bulk shop",
      entry_date: "2026-02-10",
    });
    const model = report(entries, [], "2026-01-01", "2026-04-30");
    expect(model.recurringCommitments).toHaveLength(1);
    expect(model.recurringCommitments[0].description).toBe("Rent - Room Umlazi");
    expect(model.recurringCommitments[0].typicalCents).toBe(380000);
    expect(model.recurringCommitments[0].count).toBe(4);
    expect(model.recurringCommitments[0].monthsSeen).toBe(4);
    // Rent occurrences no longer flood the largest-transactions list.
    expect(model.largestTransactions.map((t) => t.description)).toEqual(["Makro Bulk Shop"]);
  });

  it("irregular amounts are not flagged as recurring", () => {
    const entries: BudgetEntryInput[] = [
      { type: "expense", category: "food", amount: 900, description: "Checkers", entry_date: "2026-01-05" },
      { type: "expense", category: "food", amount: 2400, description: "Checkers", entry_date: "2026-02-05" },
      { type: "expense", category: "food", amount: 1400, description: "Checkers", entry_date: "2026-03-05" },
    ];
    const model = report(entries, [], "2026-01-01", "2026-03-31");
    expect(model.recurringCommitments).toHaveLength(0);
    expect(model.largestTransactions).toHaveLength(3);
  });

  it("health score is capped when unclassified spend dominates", () => {
    const model = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "savings", amount: 2500, entry_date: "2026-06-02" },
        { type: "expense", category: "other", amount: 4000, entry_date: "2026-06-05" },
      ],
      [],
      "2026-06-01",
      "2026-06-30"
    );
    // 62% of spending unclassified: strong cash flow + savings must not read as healthy.
    expect(model.dataQuality.unclassifiedExpenseSharePct).toBeGreaterThanOrEqual(40);
    expect(model.insights.healthScore).toBeLessThanOrEqual(50);
    expect(model.insights.healthCapNote).not.toBeNull();
    expect(model.insights.healthScore).toBeLessThanOrEqual(model.insights.healthScoreRaw);
  });

  it("flags identical complete-month totals as a data anomaly risk", () => {
    const entries: BudgetEntryInput[] = [];
    for (const m of ["2026-01", "2026-02", "2026-03"]) {
      entries.push(
        { type: "income", category: "salary", amount: 10000, entry_date: `${m}-01` },
        { type: "expense", category: "food", amount: 5000, description: "Groceries", entry_date: `${m}-05` }
      );
    }
    const model = report(entries, [], "2026-01-01", "2026-03-31");
    expect(model.insights.risks.some((r) => /exactly the same spending total/.test(r))).toBe(true);
  });

  it("insights: health score is bounded and consistent", () => {
    const good = report(
      [
        { type: "income", category: "salary", amount: 10000, entry_date: "2026-06-01" },
        { type: "expense", category: "savings", amount: 2500, entry_date: "2026-06-02" },
        { type: "expense", category: "food", amount: 3000, entry_date: "2026-06-03" },
      ],
      [{ category: "food", monthly_limit: 4000, month_year: "2026-06" }],
      "2026-06-01",
      "2026-06-30"
    );
    expect(good.insights.healthScore).toBeGreaterThanOrEqual(0);
    expect(good.insights.healthScore).toBeLessThanOrEqual(100);
    expect(good.insights.healthScoreRaw).toBe(
      good.insights.healthComponents.reduce((s, c) => s + c.score, 0)
    );
    expect(good.insights.healthScore).toBeLessThanOrEqual(good.insights.healthScoreRaw);
    expect(good.insights.healthBand).toBe("Strong");
    expect(good.insights.actions.length).toBeGreaterThanOrEqual(1);
    expect(good.insights.actions.length).toBeLessThanOrEqual(5);
  });

  it("fixed fixture snapshot", () => {
    const entries: BudgetEntryInput[] = [
      { id: "1", type: "income", category: "salary", amount: 25000, description: "Pay", entry_date: "2026-06-01" },
      { id: "2", type: "expense", category: "food", amount: 3200, description: "Groceries", entry_date: "2026-06-05" },
      { id: "3", type: "expense", category: "transport", amount: 1800, description: "Uber", entry_date: "2026-06-08" },
      { id: "4", type: "expense", category: "savings", amount: 2500, description: "Transfer", entry_date: "2026-06-10" },
    ];
    const targets: BudgetTargetInput[] = [
      { category: "food", monthly_limit: 4000, month_year: "2026-06" },
      { category: "transport", monthly_limit: 1500, month_year: "2026-06" },
      { category: "savings", monthly_limit: 3000, month_year: "2026-06" },
    ];
    const model = buildReport(entries, targets, [], "2026-06-01", "2026-06-30", "Snapshot User", FIXED_AT);
    assertReportModel(model);
    expect(model).toMatchSnapshot({
      generatedAt: expect.any(String),
    });
  });
});

describe("resolvePeriod presets", () => {
  it("this month caps at today", () => {
    const { periodStart, periodEnd } = resolvePeriod("this_month", undefined, TODAY);
    expect(periodStart).toBe("2026-06-01");
    expect(periodEnd).toBe("2026-06-15");
  });

  it("last month is full past month", () => {
    const { periodStart, periodEnd } = resolvePeriod("last_month", undefined, TODAY);
    expect(periodStart).toBe("2026-05-01");
    expect(periodEnd).toBe("2026-05-31");
  });

  it("quarter caps at today", () => {
    const { periodStart, periodEnd } = resolvePeriod("quarter", undefined, TODAY);
    expect(periodStart).toBe("2026-04-01");
    expect(periodEnd).toBe("2026-06-15");
  });

  it("year caps at today", () => {
    const { periodStart, periodEnd } = resolvePeriod("year", undefined, TODAY);
    expect(periodStart).toBe("2026-01-01");
    expect(periodEnd).toBe("2026-06-15");
  });

  it("custom range respects cap-at-today", () => {
    const { periodStart, periodEnd } = resolvePeriod(
      "custom",
      { periodStart: "2026-06-01", periodEnd: "2026-12-31" },
      TODAY
    );
    expect(periodStart).toBe("2026-06-01");
    expect(periodEnd).toBe("2026-06-15");
  });

  it("month-aligned defaults", () => {
    const d = monthAlignedDefaults(TODAY);
    expect(d.periodStart).toBe("2026-06-01");
    expect(d.periodEnd).toBe("2026-06-15");
  });
});

describe("formatPeriodLabel", () => {
  it("formats same-month range", () => {
    expect(formatPeriodLabel("2026-06-01", "2026-06-15")).toBe("1–15 June 2026");
  });
});
