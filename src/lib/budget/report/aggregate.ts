import {
  daysInCalendarMonth,
  enumerateMonths,
  firstDayOfMonthYear,
  inclusiveDayCount,
  lastDayOfMonthYear,
  maxDate,
  minDate,
} from "./period";
import { resolveCategoryMeta } from "./categories";
import { cleanMerchantName, merchantKey } from "./merchants";
import { computeBehaviour } from "./behaviour";
import { computeReportInsights } from "./insights";
import { resolveMonthlyBudget } from "../budgetResolve";
import type {
  BudgetEntryInput,
  BudgetTargetInput,
  CategoryGroup,
  CategoryMeta,
  DataQuality,
  ExpenseCategoryRow,
  IncomeCategoryRow,
  LargestTxn,
  MerchantInsight,
  MonthlySpend,
  PeriodComparison,
  ReportBuildOptions,
  ReportModel,
  SpendProjection,
} from "./types";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

function inPeriod(entryDate: string, periodStart: string, periodEnd: string): boolean {
  return entryDate >= periodStart && entryDate <= periodEnd;
}

function monthOverlapSlice(
  monthYear: string,
  periodStart: string,
  periodEnd: string
): { overlapStart: string; overlapEnd: string } | null {
  const monthStart = firstDayOfMonthYear(monthYear);
  const monthEnd = lastDayOfMonthYear(monthYear);
  const overlapStart = maxDate(periodStart, monthStart);
  const overlapEnd = minDate(periodEnd, monthEnd);
  if (overlapEnd < overlapStart) return null;
  return { overlapStart, overlapEnd };
}

/** Sum income / expense / set-aside cents over a set of entries. */
function sumTotals(
  entries: BudgetEntryInput[],
  isVehicle: (categoryId: string) => boolean
): { incomeCents: number; expenseCents: number; setAsideCents: number } {
  let incomeCents = 0;
  let expenseCents = 0;
  let setAsideCents = 0;
  for (const e of entries) {
    const cents = amountToCents(e.amount);
    if (e.type === "income") incomeCents += cents;
    else {
      expenseCents += cents;
      if (isVehicle(e.category)) setAsideCents += cents;
    }
  }
  return { incomeCents, expenseCents, setAsideCents };
}

function deltaPct(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function buildReport(
  entries: BudgetEntryInput[],
  targets: BudgetTargetInput[],
  categories: CategoryMeta[],
  periodStart: string,
  periodEnd: string,
  displayName: string,
  generatedAt: string = new Date().toISOString(),
  options: ReportBuildOptions = {}
): ReportModel {
  const metaCache = new Map<string, ReturnType<typeof resolveCategoryMeta>>();
  const metaOf = (categoryId: string) => {
    let m = metaCache.get(categoryId);
    if (!m) {
      m = resolveCategoryMeta(categoryId, categories);
      metaCache.set(categoryId, m);
    }
    return m;
  };
  const savingsOverride = options.savingsCategoryIds
    ? new Set(options.savingsCategoryIds)
    : null;
  const isVehicle = (categoryId: string) =>
    savingsOverride ? savingsOverride.has(categoryId) : metaOf(categoryId).isSavingsVehicle;

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  const periodEntries = entries.filter(
    (e) => inPeriod(e.entry_date, periodStart, periodEnd) && !e.is_transfer
  );

  for (const entry of periodEntries) {
    const cents = amountToCents(entry.amount);
    if (entry.type === "income") {
      incomeByCategory[entry.category] = (incomeByCategory[entry.category] ?? 0) + cents;
    } else {
      expenseByCategory[entry.category] = (expenseByCategory[entry.category] ?? 0) + cents;
    }
  }

  const totals = sumTotals(periodEntries, isVehicle);
  const totalIncomeCents = totals.incomeCents;
  const totalExpenseCents = totals.expenseCents;
  const setAsideCents = totals.setAsideCents;
  const consumptionCents = totalExpenseCents - setAsideCents;
  const netCents = totalIncomeCents - totalExpenseCents;

  // Savings rate = money deliberately set aside (Savings, Stokvel, Investments)
  // as a share of income. NOT the leftover (that's the surplus / net figure).
  const savingsRatePct =
    totalIncomeCents > 0 ? Math.round((setAsideCents / totalIncomeCents) * 100) : 0;

  const monthsInPeriod = enumerateMonths(periodStart, periodEnd);
  const expenseCategoryIds = new Set<string>([
    ...Object.keys(expenseByCategory),
    ...targets.map((t) => t.category),
  ]);

  let budgetIsEstimate = false;
  const budgetedByCategory: Record<string, number> = {};

  for (const categoryId of expenseCategoryIds) {
    // "Other"/unclassified is a categorisation gap, not a spending envelope -
    // budgeting it produces meaningless "2494% over" alerts. Ignore any budget
    // set against it so it never enters the like-for-like comparison.
    if (metaOf(categoryId).group === "unclassified") continue;
    let categoryBudgetCents = 0;
    for (const monthYear of monthsInPeriod) {
      // Month override wins; otherwise the default version in force that month
      // (effective-dated, so changing the default never rewrites past months).
      const monthlyLimit = resolveMonthlyBudget(targets, categoryId, monthYear);
      if (monthlyLimit <= 0) continue;

      const slice = monthOverlapSlice(monthYear, periodStart, periodEnd);
      if (!slice) continue;

      const [y, m] = monthYear.split("-").map(Number);
      const daysInMonth = daysInCalendarMonth(y, m);
      const daysInOverlap = inclusiveDayCount(slice.overlapStart, slice.overlapEnd);
      const monthBudgetCents = Math.round(monthlyLimit * 100);

      if (daysInOverlap === daysInMonth) {
        categoryBudgetCents += monthBudgetCents;
      } else {
        categoryBudgetCents += Math.round((monthBudgetCents * daysInOverlap) / daysInMonth);
        budgetIsEstimate = true;
      }
    }
    if (categoryBudgetCents > 0) {
      budgetedByCategory[categoryId] = categoryBudgetCents;
    }
  }

  const totalBudgetedExpenseCents = Object.values(budgetedByCategory).reduce((s, v) => s + v, 0);

  // Like-for-like budget comparison, DAY-TO-DAY only. Two rules:
  //   1. Only spend in categories that actually have a budget is compared
  //      (comparing all spend against a partial budget gave "181% used").
  //   2. Savings vehicles are excluded - putting MORE than planned into a
  //      stokvel is not "overspending", so it must never appear here. Vehicle
  //      budgets are reported separately as the set-aside plan.
  let budgetedActualCents = 0;
  let dayToDayBudgetedCents = 0;
  let setAsidePlannedCents = 0;
  for (const [categoryId, budgeted] of Object.entries(budgetedByCategory)) {
    if (isVehicle(categoryId)) setAsidePlannedCents += budgeted;
    else dayToDayBudgetedCents += budgeted;
  }
  for (const [categoryId, actual] of Object.entries(expenseByCategory)) {
    if ((budgetedByCategory[categoryId] ?? 0) > 0 && !isVehicle(categoryId)) {
      budgetedActualCents += actual;
    }
  }
  const unbudgetedActualCents = consumptionCents - budgetedActualCents;
  const budgetVarianceCents =
    dayToDayBudgetedCents > 0 ? budgetedActualCents - dayToDayBudgetedCents : 0;
  const budgetUsedPct =
    dayToDayBudgetedCents > 0
      ? Math.round((budgetedActualCents / dayToDayBudgetedCents) * 100)
      : null;

  const expenseCategories: ExpenseCategoryRow[] = [];
  const allExpenseIds = new Set([
    ...Object.keys(expenseByCategory),
    ...Object.keys(budgetedByCategory),
  ]);

  const groupTotals: Record<CategoryGroup, number> = {
    needs: 0,
    wants: 0,
    goals: 0,
    business: 0,
    unclassified: 0,
  };

  for (const categoryId of allExpenseIds) {
    const actualCents = expenseByCategory[categoryId] ?? 0;
    const budgetedCents = budgetedByCategory[categoryId] ?? 0;
    if (actualCents === 0 && budgetedCents === 0) continue;

    const meta = metaOf(categoryId);
    const vehicle = isVehicle(categoryId);
    const group: CategoryGroup = vehicle ? "goals" : meta.group;
    groupTotals[group] += actualCents;

    const hasBudget = budgetedCents > 0;
    const varianceCents = hasBudget ? actualCents - budgetedCents : 0;
    const variancePct = hasBudget ? Math.round((actualCents / budgetedCents) * 100) : null;
    const sharePct =
      totalExpenseCents > 0 ? Math.round((actualCents / totalExpenseCents) * 1000) / 10 : 0;

    expenseCategories.push({
      categoryId,
      categoryName: meta.name,
      color: meta.color,
      group,
      isSavingsVehicle: vehicle,
      hasBudget,
      budgetedCents,
      actualCents,
      varianceCents,
      variancePct,
      sharePct,
      overBudget: hasBudget && actualCents > budgetedCents,
    });
  }
  expenseCategories.sort((a, b) => b.actualCents - a.actualCents);

  const incomeCategories: IncomeCategoryRow[] = Object.entries(incomeByCategory)
    .map(([categoryId, actualCents]) => {
      const meta = metaOf(categoryId);
      const sharePct =
        totalIncomeCents > 0 ? Math.round((actualCents / totalIncomeCents) * 1000) / 10 : 0;
      return { categoryId, categoryName: meta.name, actualCents, sharePct };
    })
    .sort((a, b) => b.actualCents - a.actualCents);

  const monthlySpend: MonthlySpend[] = monthsInPeriod.map((monthYear) => {
    const slice = monthOverlapSlice(monthYear, periodStart, periodEnd)!;
    let expenseCents = 0;
    let setAsideMonthCents = 0;
    let incomeCents = 0;
    for (const entry of periodEntries) {
      if (entry.entry_date < slice.overlapStart || entry.entry_date > slice.overlapEnd) continue;
      if (entry.type === "expense") {
        const cents = amountToCents(entry.amount);
        expenseCents += cents;
        if (isVehicle(entry.category)) setAsideMonthCents += cents;
      } else {
        incomeCents += amountToCents(entry.amount);
      }
    }
    const [y, m] = monthYear.split("-").map(Number);
    const daysInMonth = daysInCalendarMonth(y, m);
    const daysCovered = inclusiveDayCount(slice.overlapStart, slice.overlapEnd);
    return {
      monthYear,
      label: MONTH_SHORT[m - 1],
      expenseCents,
      setAsideCents: setAsideMonthCents,
      consumptionCents: expenseCents - setAsideMonthCents,
      incomeCents,
      netCents: incomeCents - expenseCents,
      isPartial: daysCovered < daysInMonth,
      daysCovered,
      daysInMonth,
    };
  });

  // Merchants: group by CLEANED description so "FNB App Payment To Mama Coka"
  // and "mama coka-500.00 Fee: Payshap" merge into one counterparty.
  type MerchantGroup = {
    totalCents: number;
    count: number;
    sample: string;
    amounts: number[];
    months: Set<string>;
    categoryCounts: Map<string, number>;
  };
  const merchantMap = new Map<string, MerchantGroup>();
  for (const entry of periodEntries) {
    if (entry.type !== "expense") continue;
    const key = merchantKey(entry.description);
    const cents = amountToCents(entry.amount);
    let g = merchantMap.get(key);
    if (!g) {
      g = {
        totalCents: 0,
        count: 0,
        sample: entry.description ?? "",
        amounts: [],
        months: new Set(),
        categoryCounts: new Map(),
      };
      merchantMap.set(key, g);
    }
    g.totalCents += cents;
    g.count += 1;
    g.amounts.push(cents);
    g.months.add(entry.entry_date.slice(0, 7));
    g.categoryCounts.set(entry.category, (g.categoryCounts.get(entry.category) ?? 0) + 1);
  }
  const topMerchants: MerchantInsight[] = [...merchantMap.values()]
    .map((m) => {
      // Only claim a category when EVERY transaction for this merchant carries
      // it. A merchant that spans categories gets an empty string, and the PDF
      // redactor falls back to "Uncategorised" rather than picking the modal
      // one. Picking the most common would let a counterparty the user split
      // between Housing and Groceries be labelled "Groceries" - relabelling
      // their own categorisation, which we must never do.
      const cats = [...m.categoryCounts.keys()];
      const unanimous = cats.length === 1 ? cats[0] : null;
      return {
        description: cleanMerchantName(m.sample),
        totalCents: m.totalCents,
        count: m.count,
        categoryName: unanimous ? metaOf(unanimous).name : "",
      };
    })
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, 5);

  // Recurring commitments: same counterparty, 3+ distinct months, amounts
  // within a tight band. Detection runs over the WIDER history (falling back to
  // the period) so a monthly payment still qualifies in a single-month report -
  // a 31-day window can only ever contain one occurrence. Only merchants that
  // also appear in the current period are surfaced, so the list stays relevant.
  const historyForRecurring =
    options.historyEntries && options.historyEntries.length > 0
      ? options.historyEntries.filter((e) => !e.is_transfer)
      : periodEntries;
  const historyMap = new Map<string, MerchantGroup>();
  for (const entry of historyForRecurring) {
    if (entry.type !== "expense") continue;
    const key = merchantKey(entry.description);
    const cents = amountToCents(entry.amount);
    let g = historyMap.get(key);
    if (!g) {
      g = { totalCents: 0, count: 0, sample: entry.description ?? "", amounts: [], months: new Set(), categoryCounts: new Map() };
      historyMap.set(key, g);
    }
    g.totalCents += cents;
    g.count += 1;
    g.amounts.push(cents);
    g.months.add(entry.entry_date.slice(0, 7));
    g.categoryCounts.set(entry.category, (g.categoryCounts.get(entry.category) ?? 0) + 1);
  }
  const recurringKeys = new Set<string>();
  const recurringCommitments = [...historyMap.entries()]
    .filter(([key, g]) => {
      if (key === "unlabelled" || g.count < 3 || g.months.size < 3) return false;
      // Must also appear in the period being reported on.
      if (!merchantMap.has(key)) return false;
      const min = Math.min(...g.amounts);
      const max = Math.max(...g.amounts);
      return min > 0 && max / min <= 1.25;
    })
    .map(([key, g]) => {
      recurringKeys.add(key);
      const sorted = [...g.amounts].sort((a, b) => a - b);
      const typicalCents = sorted[Math.floor(sorted.length / 2)];
      const topCategory = [...g.categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const meta = metaOf(topCategory);
      return {
        description: cleanMerchantName(g.sample),
        categoryName: meta.name,
        group: isVehicle(topCategory) ? ("goals" as const) : meta.group,
        typicalCents,
        count: g.count,
        totalCents: g.totalCents,
        monthsSeen: g.months.size,
      };
    })
    .sort((a, b) => b.typicalCents - a.typicalCents)
    .slice(0, 8);

  const largestTransactions: LargestTxn[] = periodEntries
    .filter((e) => e.type === "expense" && !recurringKeys.has(merchantKey(e.description)))
    .map((e) => {
      const meta = metaOf(e.category);
      return {
        id: e.id,
        description: cleanMerchantName(e.description, 44),
        category: e.category,
        categoryName: meta.name,
        cents: amountToCents(e.amount),
        date: e.entry_date,
      };
    })
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 5);

  // Over/under budget lists are day-to-day only: a stokvel contribution above
  // plan belongs in "Money set aside", never in an overspend list.
  const withBudget = expenseCategories.filter((r) => r.hasBudget && !r.isSavingsVehicle);
  const topOverBudget = [...withBudget]
    .sort((a, b) => b.varianceCents - a.varianceCents)
    .filter((r) => r.varianceCents > 0)
    .slice(0, 3);
  const topUnderBudget = [...withBudget]
    .sort((a, b) => a.varianceCents - b.varianceCents)
    .filter((r) => r.varianceCents < 0)
    .slice(0, 3);

  // Prior-period comparison (equal-length preceding window, supplied by caller).
  let comparison: PeriodComparison | null = null;
  if (options.prevEntries && options.prevStart && options.prevEnd) {
    const prevPeriodEntries = options.prevEntries.filter(
      (e) => inPeriod(e.entry_date, options.prevStart!, options.prevEnd!) && !e.is_transfer
    );
    if (prevPeriodEntries.length > 0) {
      const prev = sumTotals(prevPeriodEntries, isVehicle);
      comparison = {
        prevStart: options.prevStart,
        prevEnd: options.prevEnd,
        prevIncomeCents: prev.incomeCents,
        prevExpenseCents: prev.expenseCents,
        prevSetAsideCents: prev.setAsideCents,
        incomeDeltaPct: deltaPct(totalIncomeCents, prev.incomeCents),
        expenseDeltaPct: deltaPct(totalExpenseCents, prev.expenseCents),
        setAsideDeltaPct: deltaPct(setAsideCents, prev.setAsideCents),
      };
    }
  }

  const unclassifiedExpenseSharePct =
    totalExpenseCents > 0
      ? Math.round((groupTotals.unclassified / totalExpenseCents) * 100)
      : 0;
  const otherIncomeCents = incomeCategories
    .filter((r) => r.categoryId === "other-income" || /\bother\b/i.test(r.categoryName))
    .reduce((s, r) => s + r.actualCents, 0);
  const otherIncomeSharePct =
    totalIncomeCents > 0 ? Math.round((otherIncomeCents / totalIncomeCents) * 100) : 0;
  const unlabelledCount = periodEntries.filter(
    (e) => e.type === "expense" && cleanMerchantName(e.description) === "Unlabelled"
  ).length;
  const dataQuality: DataQuality = {
    unclassifiedExpenseSharePct,
    otherIncomeSharePct,
    unlabelledCount,
  };

  // Projection from COMPLETE months only - a partial month would otherwise
  // drag the average down and fake a "spending collapsed" trend.
  // Complete months WITH activity - a zero-data month (bank not yet synced)
  // would drag the average pace and understate the annual projection.
  const completeMonths = monthlySpend.filter(
    (m) => !m.isPartial && (m.expenseCents > 0 || m.incomeCents > 0)
  );
  const avgMonthlyExpenseCents =
    completeMonths.length > 0
      ? Math.round(completeMonths.reduce((s, m) => s + m.expenseCents, 0) / completeMonths.length)
      : null;
  const projection: SpendProjection = {
    avgMonthlyExpenseCents,
    annualisedExpenseCents: avgMonthlyExpenseCents != null ? avgMonthlyExpenseCents * 12 : null,
    monthsUsed: completeMonths.length,
  };

  // Behavioural patterns run over the WIDER history when provided (falling
  // back to the period), because patterns are cross-month by nature.
  const hasHistory = !!options.historyEntries && options.historyEntries.length > 0;
  const behaviour = computeBehaviour(
    hasHistory ? options.historyEntries! : entries,
    categories,
    periodEnd,
    // Without an explicit window start, history months must be derived from
    // the data itself - using periodStart would mark them all as truncated.
    { windowStart: hasHistory ? options.historyStart : periodStart }
  );

  const core = {
    periodStart,
    periodEnd,
    displayName,
    generatedAt,
    totalIncomeCents,
    totalExpenseCents,
    setAsideCents,
    consumptionCents,
    netCents,
    savingsRatePct,
    totalBudgetedExpenseCents,
    dayToDayBudgetedCents,
    budgetedActualCents,
    unbudgetedActualCents,
    budgetVarianceCents,
    budgetUsedPct,
    setAsidePlannedCents,
    budgetIsEstimate,
    groupTotals,
    expenseCategories,
    incomeCategories,
    monthlySpend,
    topMerchants,
    recurringCommitments,
    largestTransactions,
    topOverBudget,
    topUnderBudget,
    comparison,
    dataQuality,
    projection,
    behaviour,
  };

  return { ...core, insights: computeReportInsights(core) };
}

export function assertReportModel(model: ReportModel): void {
  const sumExpenseCats = model.expenseCategories.reduce((s, r) => s + r.actualCents, 0);
  const sumIncomeCats = model.incomeCategories.reduce((s, r) => s + r.actualCents, 0);
  const sumBudgeted = model.expenseCategories.reduce((s, r) => s + r.budgetedCents, 0);

  if (sumExpenseCats !== model.totalExpenseCents) {
    throw new Error(
      `Expense category sum mismatch: ${sumExpenseCats} !== ${model.totalExpenseCents}`
    );
  }
  if (sumIncomeCats !== model.totalIncomeCents) {
    throw new Error(`Income category sum mismatch: ${sumIncomeCats} !== ${model.totalIncomeCents}`);
  }
  if (sumBudgeted !== model.totalBudgetedExpenseCents) {
    throw new Error(
      `Budgeted category sum mismatch: ${sumBudgeted} !== ${model.totalBudgetedExpenseCents}`
    );
  }
  if (model.setAsideCents + model.consumptionCents !== model.totalExpenseCents) {
    throw new Error(
      `Set-aside split mismatch: ${model.setAsideCents} + ${model.consumptionCents} !== ${model.totalExpenseCents}`
    );
  }
  const groupSum = Object.values(model.groupTotals).reduce((s, v) => s + v, 0);
  if (groupSum !== model.totalExpenseCents) {
    throw new Error(`Group totals mismatch: ${groupSum} !== ${model.totalExpenseCents}`);
  }
  if (model.budgetedActualCents + model.unbudgetedActualCents !== model.consumptionCents) {
    throw new Error(
      `Budgeted/unbudgeted split mismatch: ${model.budgetedActualCents} + ${model.unbudgetedActualCents} !== ${model.consumptionCents}`
    );
  }
  if (model.dayToDayBudgetedCents + model.setAsidePlannedCents !== model.totalBudgetedExpenseCents) {
    throw new Error(
      `Budget split mismatch: ${model.dayToDayBudgetedCents} + ${model.setAsidePlannedCents} !== ${model.totalBudgetedExpenseCents}`
    );
  }
}

export function sumDbEntriesCents(
  entries: BudgetEntryInput[],
  periodStart: string,
  periodEnd: string
): { incomeCents: number; expenseCents: number } {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const e of entries) {
    if (!inPeriod(e.entry_date, periodStart, periodEnd) || e.is_transfer) continue;
    const cents = amountToCents(e.amount);
    if (e.type === "income") incomeCents += cents;
    else expenseCents += cents;
  }
  return { incomeCents, expenseCents };
}
