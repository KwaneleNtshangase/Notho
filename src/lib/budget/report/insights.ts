/**
 * Report insights engine - deterministic rules that turn the report model
 * into a verdict, a narrative and an action plan.
 *
 * Same design constraints as src/lib/coach/insights.ts (POPIA + FAIS):
 *   - Pure functions: every number is computed here in code. No AI, no
 *     network calls, no data leaves the user's session.
 *   - Educational only: insights teach principles and point to lessons.
 *     They NEVER name financial products or providers, and never say
 *     "you should buy/invest/switch" (FAIS "advice" boundary).
 */

import { formatZarCurrency } from "@/lib/currency";
import { formatPeriodLabel } from "./period";
import { GUIDELINES, debtCents, isFlexibleCategory, monthsSpanned, scoreHealth } from "./score";
import type {
  ExpenseCategoryRow,
  InsightTone,
  ReportAction,
  ReportBenchmark,
  ReportHighlight,
  ReportInsights,
  ReportModel,
} from "./types";

type ReportCore = Omit<ReportModel, "insights">;

// Scoring lives in ./score (single source of truth for report, history and
// what-if simulation). Re-exported here for existing import sites.
export { GUIDELINES } from "./score";

// Lesson links mirror the catalogue in src/lib/coach/insights.ts.
const LESSONS = {
  buildingBudget: { courseId: "money-basics", lessonId: "lesson-3", title: "Building a Budget" },
  trackingSpend: { courseId: "money-basics", lessonId: "lesson-4", title: "Tracking Your Spending" },
  needsVsWants: { courseId: "money-basics", lessonId: "lesson-2", title: "Needs vs Wants" },
  debtSnowball: { courseId: "credit-debt", lessonId: "lesson-5", title: "The Debt Snowball Method" },
  emergencyFund: { courseId: "emergency-fund", lessonId: "lesson-1", title: "How Much Do You Need?" },
} as const;

function rand(cents: number): string {
  return formatZarCurrency(Math.round(cents / 100), { decimals: 0 });
}

function pctOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Biggest category where a cut is actually possible: needs/wants that aren't
 * fixed obligations. Debt repayments and savings vehicles are commitments too.
 */
function topTrimmableRow(core: ReportCore): ExpenseCategoryRow | null {
  return core.expenseCategories.find(isFlexibleCategory) ?? null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function computeReportInsights(core: ReportCore): ReportInsights {
  const income = core.totalIncomeCents;
  const debt = debtCents(core);
  const debtSharePct = pctOf(debt, income);
  const months = monthsSpanned(core.monthlySpend);
  const avgMonthlyIncome = income / months;
  const unclassifiedPct = core.dataQuality.unclassifiedExpenseSharePct;
  const periodLabel = formatPeriodLabel(core.periodStart, core.periodEnd);

  // Income by type: loan proceeds aren't real income (they're borrowed and must
  // be repaid), and business income should be netted against business costs.
  const loanIncomeCents = core.incomeCategories
    .filter((c) => /\b(loan|advance|credit\s+facility|overdraft)\b/i.test(c.categoryName))
    .reduce((s, c) => s + c.actualCents, 0);
  const businessIncomeCents = core.incomeCategories
    .filter((c) => /\bbusiness|side.?hustle|trading|resale\b/i.test(c.categoryName))
    .reduce((s, c) => s + c.actualCents, 0);
  const businessNetCents = businessIncomeCents - core.groupTotals.business;

  // Single source of truth - the same function scores the report, the history
  // endpoint and the what-if simulator (see ./score and ./simulate).
  const health = scoreHealth(core);
  const { healthScore, healthBand } = health;

  // Cash flow AFTER day-to-day living (before deliberate saving). When this is
  // positive but the net is negative, the shortfall is a savings-allocation
  // choice, not overspending - and must not be framed as alarm.
  const afterLivingCents = income - core.consumptionCents;
  const allocationDeficit = core.netCents < 0 && afterLivingCents >= 0;

  // ── Highlights (cover page, max 4) ──────────────────────────────────────
  const highlights: ReportHighlight[] = [];
  if (income > 0 || core.totalExpenseCents > 0) {
    if (core.netCents >= 0) {
      highlights.push({ tone: "good", text: `You ended the period ${rand(core.netCents)} ahead.` });
    } else if (allocationDeficit) {
      highlights.push({
        tone: "info",
        text: `Your day-to-day spending stayed within income. The ${rand(-core.netCents)} gap is because you set aside ${rand(core.setAsideCents)} - more than your ${rand(afterLivingCents)} surplus - so it came from savings/reserves, not overspending.`,
      });
    } else {
      highlights.push({ tone: "bad", text: `You spent ${rand(-core.netCents)} more than you earned on day-to-day living.` });
    }
  }
  if (income > 0) {
    highlights.push(
      core.savingsRatePct >= GUIDELINES.savingsRatePct
        ? { tone: "good", text: `You set aside ${core.savingsRatePct}% of income - at or above the ${GUIDELINES.savingsRatePct}% guideline.` }
        : { tone: "warn", text: `You set aside ${core.savingsRatePct}% of income (${rand(core.setAsideCents)}); the common guideline is ${GUIDELINES.savingsRatePct}%.` }
    );
  }
  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    highlights.push({
      tone: "warn",
      text: `${unclassifiedPct}% of spending (${rand(core.groupTotals.unclassified)}) is unclassified - the picture below is blurry until it's categorised.`,
    });
  }
  if (debtSharePct >= 30) {
    highlights.push({ tone: "bad", text: `Debt repayments took ${debtSharePct}% of your income (${rand(debt)}).` });
  }
  if (core.totalBudgetedExpenseCents > 0 && core.budgetVarianceCents > 0 && highlights.length < 4) {
    highlights.push({
      tone: "warn",
      text: `Budgeted categories ran ${rand(core.budgetVarianceCents)} over plan.`,
    });
  }
  // A genuine "under budget" win means you came in under a REALISTIC budget -
  // spending 25% of a budget 4x too big isn't discipline, it's a misconfigured
  // limit. Only categories used between 50% and 100% count as controlled.
  const realUnderBudget = core.topUnderBudget.filter((r) => r.variancePct != null && r.variancePct >= 50);
  const misalignedBudget = core.expenseCategories
    .filter((r) => r.hasBudget && !r.isSavingsVehicle && r.variancePct != null && r.variancePct < 40 && r.budgetedCents >= 500000)
    .sort((a, b) => b.budgetedCents - a.budgetedCents)[0];

  if (realUnderBudget.length > 0 && highlights.length < 4) {
    const w = realUnderBudget[0];
    highlights.push({
      tone: "good",
      text: `${w.categoryName} came in ${rand(-w.varianceCents)} under budget - well controlled.`,
    });
  }

  // ── Wins & risks ────────────────────────────────────────────────────────
  const wins: string[] = [];
  const risks: string[] = [];

  for (const r of realUnderBudget.slice(0, 2)) {
    wins.push(`${r.categoryName}: ${rand(-r.varianceCents)} under budget (${r.variancePct}% used).`);
  }
  // Only celebrate the savings rate when it's real surplus, not deficit-funded.
  if (core.savingsRatePct >= GUIDELINES.savingsRatePct && core.netCents >= 0) {
    wins.push(`Set aside ${rand(core.setAsideCents)} - a ${core.savingsRatePct}% savings rate, all from surplus.`);
  }
  if (core.comparison?.setAsideDeltaPct != null && core.comparison.setAsideDeltaPct > 0 && core.netCents >= 0) {
    wins.push(`Money set aside is up ${core.comparison.setAsideDeltaPct}% vs the previous period.`);
  }
  // hasData, not just !isPartial: a complete month with no entries nets to
  // exactly zero, which counts as ">= 0" and was being celebrated as a month
  // ended in the green. A user two months into the year got told every month
  // was positive, including the months they had not lived yet.
  const positiveMonths = core.monthlySpend.filter((m) => !m.isPartial && m.hasData && m.netCents >= 0).length;
  const fullMonths = core.monthlySpend.filter((m) => !m.isPartial && m.hasData).length;
  if (fullMonths >= 2 && positiveMonths === fullMonths) {
    wins.push(`Every complete month in this period ended in the green (${fullMonths}/${fullMonths}).`);
  }
  if (core.incomeCategories.length >= 2 && core.incomeCategories[0].sharePct < 60) {
    wins.push(`Income is spread across ${core.incomeCategories.length} sources - no single point of failure.`);
  }
  const goalsSharePct = pctOf(core.groupTotals.goals, core.totalExpenseCents);
  if (goalsSharePct >= 40 && core.netCents >= 0) {
    wins.push(
      `${rand(core.groupTotals.goals)} (${goalsSharePct}%) of this period's money went toward building future wealth - savings, stokvel and debt payoff.`
    );
  }

  // Deficit-while-saving: the most important nuance in a shortfall report.
  if (core.netCents < 0 && core.setAsideCents > 0) {
    if (core.setAsideCents >= -core.netCents) {
      // Consumption alone was within income - the shortfall is a deliberate
      // allocation choice, not overspending. Reframe it as such.
      wins.push(
        `Your day-to-day spending stayed within income - the ${rand(-core.netCents)} shortfall came entirely from choosing to set aside ${rand(core.setAsideCents)}. That's an allocation decision, not overspending.`
      );
    } else {
      risks.push(
        `You set aside ${rand(core.setAsideCents)} while running a ${rand(-core.netCents)} deficit - check you're not funding savings with debt or dwindling reserves.`
      );
    }
  }
  if (misalignedBudget) {
    const timesBigger = Math.round(misalignedBudget.budgetedCents / Math.max(misalignedBudget.actualCents, 1));
    risks.push(
      `Your ${misalignedBudget.categoryName} budget (${rand(misalignedBudget.budgetedCents)}) is about ${timesBigger}x your actual spend - it's too loose to catch anything.`
    );
  }
  // Debt-funded saving: taking loans while contributing to savings/stokvel is a
  // cycle where you borrow to look like you're saving. This is the single most
  // important flag when it happens - lead the risks with it.
  if (loanIncomeCents > 0 && core.setAsideCents > 0) {
    risks.unshift(
      `${rand(loanIncomeCents)} of your income this period is loan money, while you set aside ${rand(core.setAsideCents)}. Borrowing to save is a debt cycle - the savings aren't truly yours until the loan is repaid.`
    );
  }

  for (const r of core.topOverBudget.slice(0, 2)) {
    risks.push(`${r.categoryName}: ${rand(r.varianceCents)} over budget (${r.variancePct}% used).`);
  }
  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    risks.push(`${unclassifiedPct}% of spending is unclassified, hiding where money actually goes.`);
  }
  if (debtSharePct >= 30) {
    risks.push(`Debt repayments at ${debtSharePct}% of income leave little room for goals.`);
  }
  if (income > 0 && core.incomeCategories.length > 0 && core.incomeCategories[0].sharePct >= 80) {
    risks.push(`${core.incomeCategories[0].sharePct}% of income comes from one source (${core.incomeCategories[0].categoryName}).`);
  }
  const negativeMonths = core.monthlySpend.filter((m) => !m.isPartial && m.netCents < 0);
  if (negativeMonths.length > 0) {
    risks.push(
      `${negativeMonths.length} month${negativeMonths.length === 1 ? "" : "s"} ended in the red (${negativeMonths.map((m) => m.label).join(", ")}).`
    );
  }
  if (income > 0 && core.savingsRatePct < 5) {
    risks.push(`At a ${core.savingsRatePct}% set-aside rate, an emergency cushion isn't building.`);
  }
  const recurringDebt = core.recurringCommitments.filter(
    (r) => r.group === "goals" && /\b(loan|debt|repay)/i.test(`${r.description} ${r.categoryName}`)
  );
  if (recurringDebt.length > 0) {
    const d = recurringDebt[0];
    risks.push(
      `Recurring loan repayment detected: ${d.description} at ~${rand(d.typicalCents)}/month for ${d.monthsSeen} months running.`
    );
  }
  // Volatility: big swings vs the previous period are the most important
  // thing happening in a report and must never pass silently.
  if (core.comparison) {
    const swings: string[] = [];
    const inc = core.comparison.incomeDeltaPct;
    const exp = core.comparison.expenseDeltaPct;
    if (inc != null && Math.abs(inc) >= 40) swings.push(`income ${inc > 0 ? "up" : "down"} ${Math.abs(inc)}%`);
    if (exp != null && Math.abs(exp) >= 40) swings.push(`spending ${exp > 0 ? "up" : "down"} ${Math.abs(exp)}%`);
    if (swings.length > 0) {
      risks.push(
        `Big swing vs the previous period: ${swings.join(", ")}. If that isn't expected (bonus, once-off, seasonal), it's worth understanding before trusting the trend.`
      );
    }
  }
  // Data sanity: several complete months with IDENTICAL totals usually means
  // duplicated imports or templated entries, not real bank data.
  const totalsSeen = new Map<number, number>();
  for (const m of core.monthlySpend) {
    if (m.isPartial || m.expenseCents <= 0) continue;
    totalsSeen.set(m.expenseCents, (totalsSeen.get(m.expenseCents) ?? 0) + 1);
  }
  const identicalMonths = Math.max(0, ...totalsSeen.values());
  if (identicalMonths >= 3) {
    risks.push(
      `${identicalMonths} months show identical spending totals to the cent - worth checking for duplicate or templated imports.`
    );
  }

  // ── Actions (3-5, prioritised, each with estimated impact) ──────────────
  const actions: ReportAction[] = [];

  if (misalignedBudget) {
    actions.push({
      id: "recalibrate-budget",
      title: `Recalibrate your ${misalignedBudget.categoryName} budget`,
      detail: `You budgeted ${rand(misalignedBudget.budgetedCents)} but spent ${rand(misalignedBudget.actualCents)} (${misalignedBudget.variancePct}% used). A budget you can't get near isn't a plan - set it closer to what you actually spend so variances mean something.`,
      impact: "Your budget-vs-actual becomes a real signal, not noise",
      lesson: LESSONS.buildingBudget,
    });
  }

  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    actions.push({
      id: "recategorise",
      title: "Recategorise your 'Other' transactions",
      detail: `${rand(core.groupTotals.unclassified)} of spending has no real category. Sorting it takes minutes and is the single biggest accuracy win.`,
      impact: `Your next report explains ${unclassifiedPct}% more of your money`,
      lesson: LESSONS.trackingSpend,
    });
  }

  if (core.totalBudgetedExpenseCents <= 0) {
    actions.push({
      id: "first-budgets",
      title: "Set your first category budgets",
      detail: "You're tracking spending but have no limits. A budget per category turns tracking into a plan.",
      lesson: LESSONS.buildingBudget,
    });
  } else if (pctOf(core.unbudgetedActualCents, core.totalExpenseCents) >= 30) {
    // "Other" is excluded: the fix for unclassified spend is recategorising,
    // not budgeting a junk-drawer category.
    const unbudgeted = core.expenseCategories
      .filter(
        (r) => !r.hasBudget && !r.isSavingsVehicle && r.group !== "unclassified" && r.actualCents > 0
      )
      .slice(0, 2)
      .map((r) => r.categoryName);
    if (unbudgeted.length > 0) {
      actions.push({
        id: "cover-unbudgeted",
        title: `Set budgets for ${unbudgeted.join(" and ")}`,
        detail: `${rand(core.unbudgetedActualCents)} (${pctOf(core.unbudgetedActualCents, core.totalExpenseCents)}% of spending) sits in categories with no budget, so it never gets flagged.`,
        impact: "Overspend alerts start working for your biggest categories",
        lesson: LESSONS.buildingBudget,
      });
    }
  }

  if (income > 0 && core.savingsRatePct < GUIDELINES.savingsRatePct) {
    const targetRate = Math.min(core.savingsRatePct + 5, GUIDELINES.savingsRatePct);
    const extraPerMonth = Math.round((avgMonthlyIncome * (targetRate - core.savingsRatePct)) / 100);
    if (extraPerMonth > 0) {
      const surplusHint =
        core.netCents > extraPerMonth
          ? ` Your ${rand(core.netCents)} surplus already covers it - it just needs a job.`
          : "";
      actions.push({
        id: "payday-setaside",
        title: "Set aside a fixed amount on payday",
        detail: `Moving money to savings first - before spending - is the habit that makes the rate stick.${surplusHint}`,
        impact: `~ ${rand(extraPerMonth)}/month lifts your rate from ${core.savingsRatePct}% to ~${targetRate}% - about ${rand(extraPerMonth * 12)} extra set aside over 12 months`,
        lesson: LESSONS.emergencyFund,
      });
    }
  }

  if (debtSharePct >= 30) {
    actions.push({
      id: "map-debts",
      title: "Map out your debts and pick a payoff order",
      detail: `${rand(debt)} went to debt repayments this period. A structured method shrinks the total interest paid and the stress.`,
      lesson: LESSONS.debtSnowball,
    });
  }

  const trimRow = topTrimmableRow(core);
  if (actions.length < 5 && trimRow && income > 0) {
    const monthlyCut = Math.round((trimRow.actualCents / months) * 0.1);
    if (monthlyCut >= 10000) {
      const newRate = Math.round(((core.setAsideCents + monthlyCut * months) / income) * 100);
      actions.push({
        id: `trim-${trimRow.categoryId}`,
        title: `Trim ${trimRow.categoryName} by 10%`,
        detail: `${trimRow.categoryName} is your biggest flexible spending category at ${rand(trimRow.actualCents)} (${trimRow.sharePct}% of spending). One change here beats ten small ones elsewhere.`,
        impact: `~ ${rand(monthlyCut)}/month freed - enough to reach a ~${newRate}% set-aside rate`,
        lesson: LESSONS.needsVsWants,
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      id: "keep-streak",
      title: "Keep the streak going",
      detail: "Cash flow is positive, budgets are holding and your data is clean. Consistency is the whole game now.",
    });
  }
  // Actions are already in priority order; the first is THE one to do.
  actions[0].isTopPriority = true;

  // ── Coach narrative ─────────────────────────────────────────────────────
  const coachParagraphs: string[] = [];
  if (income > 0 || core.totalExpenseCents > 0) {
    const flow =
      core.netCents >= 0
        ? `leaving you ${rand(core.netCents)} ahead`
        : allocationDeficit
          ? `leaving ${rand(afterLivingCents)} of surplus - you then set aside ${rand(core.setAsideCents)}, ${rand(-core.netCents)} more than that surplus, so the gap came from savings/reserves rather than overspending`
          : `leaving a ${rand(-core.netCents)} shortfall - day-to-day spending was above income`;
    coachParagraphs.push(
      `Over ${periodLabel} you earned ${rand(income)}, spent ${rand(core.consumptionCents)} on day-to-day living and set aside ${rand(core.setAsideCents)} (${core.savingsRatePct}% of income) into savings vehicles like a stokvel or savings account - ${flow}.`
    );
  }
  // Net the business out so a big side-hustle doesn't just look like spending.
  if (core.groupTotals.business > 0 && businessIncomeCents > 0) {
    coachParagraphs.push(
      `Your side-hustle brought in ${rand(businessIncomeCents)} and cost ${rand(core.groupTotals.business)} this period - a net ${businessNetCents >= 0 ? `${rand(businessNetCents)} contribution to` : `${rand(-businessNetCents)} drain on`} your money. ${businessNetCents >= 0 ? "It's paying its way." : "Worth checking whether the spend is investment that'll pay off, or a leak."}`
    );
  }
  const topSpendRow =
    core.expenseCategories.find((r) => !r.isSavingsVehicle && r.actualCents > 0) ?? null;
  if (topSpendRow) {
    const caveat =
      unclassifiedPct >= GUIDELINES.unclassifiedWarnPct
        ? ` Note: ${unclassifiedPct}% of spending is still unclassified, so the true picture may shift once it's categorised.`
        : "";
    coachParagraphs.push(
      `Your biggest day-to-day category was ${topSpendRow.categoryName} at ${rand(topSpendRow.actualCents)} (${topSpendRow.sharePct}% of all spending).${caveat}`
    );
  }
  if (core.projection.annualisedExpenseCents != null && core.projection.monthsUsed >= 2) {
    const wealthLine =
      income > 0 && core.savingsRatePct > 0 && core.savingsRatePct < GUIDELINES.savingsRatePct
        ? ` Kept at today's ${core.savingsRatePct}% rate, you'd set aside ~${rand(avgMonthlyIncome * (core.savingsRatePct / 100) * 12)} over the next 12 months; at ${GUIDELINES.savingsRatePct}% it would be ~${rand(avgMonthlyIncome * (GUIDELINES.savingsRatePct / 100) * 12)}.`
        : "";
    // Pair spend with income so the projection isn't a lone (ominous-looking)
    // number - a rising spend against rising income is very different from one
    // against flat income.
    const annualIncome = Math.round(avgMonthlyIncome * 12);
    coachParagraphs.push(
      `At your average pace you're on track to earn about ${rand(annualIncome)} and spend about ${rand(core.projection.annualisedExpenseCents)} this year (over ${core.projection.monthsUsed} complete months).${wealthLine}`
    );
  }

  // ── Benchmarks ──────────────────────────────────────────────────────────
  // 50/30/20 is about PERSONAL spending, so business and unclassified are
  // excluded from the denominator - otherwise a big side-hustle month makes
  // "Needs 6%" look alarming when personal life is actually fine.
  const personalBase =
    core.groupTotals.needs + core.groupTotals.wants + core.groupTotals.goals;
  const needsPct = pctOf(core.groupTotals.needs, personalBase);
  const wantsPct = pctOf(core.groupTotals.wants, personalBase);
  const hasBusiness = core.groupTotals.business > 0;
  const shareLabel = hasBusiness ? "% of personal spending" : "% of spending";
  const toneFor = (ok: boolean, mid: boolean): InsightTone => (ok ? "good" : mid ? "warn" : "bad");
  const benchmarks: ReportBenchmark[] = [
    {
      label: "Set-aside (savings) rate",
      value: `${core.savingsRatePct}%`,
      target: `${GUIDELINES.savingsRatePct}%+ of income`,
      tone: toneFor(core.savingsRatePct >= 20, core.savingsRatePct >= 10),
    },
    {
      label: "Debt repayments",
      value: income > 0 ? `${debtSharePct}% of income` : "-",
      target: `below ${GUIDELINES.debtShareOfIncomePct}%`,
      tone: toneFor(debtSharePct < 20, debtSharePct <= GUIDELINES.debtShareOfIncomePct),
    },
    {
      label: "Needs (essentials)",
      value: `${needsPct}${shareLabel}`,
      target: `~${GUIDELINES.needsSharePct}% guideline`,
      tone: needsPct <= 65 ? "good" : "warn",
    },
    {
      label: "Wants (lifestyle)",
      value: `${wantsPct}${shareLabel}`,
      target: `~${GUIDELINES.wantsSharePct}% guideline`,
      tone: wantsPct <= GUIDELINES.wantsSharePct ? "good" : "warn",
    },
  ];
  if (core.budgetUsedPct != null) {
    benchmarks.push({
      label: "Budget used (like-for-like)",
      value: `${core.budgetUsedPct}%`,
      target: "100% or less",
      tone: toneFor(core.budgetUsedPct <= 100, core.budgetUsedPct <= 115),
    });
  }

  const dataQualityAlert =
    unclassifiedPct >= GUIDELINES.unclassifiedWarnPct
      ? `${unclassifiedPct}% of spending (${rand(core.groupTotals.unclassified)}) is sitting in "Other" or unknown categories. Until it's recategorised, every chart in this report understates where your money really goes.`
      : null;

  // ── Verdict: the one sentence that answers "how did I do?" ───────────────
  // Leads with the dominant story, not a generic band label.
  const verdict = (() => {
    if (income <= 0 && core.totalExpenseCents <= 0) return "No activity recorded for this period yet.";
    if (unclassifiedPct >= 30) {
      return `Too much (${unclassifiedPct}%) of your spending is still uncategorised to judge this period fairly - sorting it is the first move.`;
    }
    if (loanIncomeCents > 0 && core.setAsideCents > 0) {
      return `Careful: you set money aside while taking on loan income - you may be borrowing to save, which quietly builds debt.`;
    }
    if (allocationDeficit) {
      return `A disciplined period - your day-to-day spending stayed within income, and the shortfall was a deliberate choice to save ${core.savingsRatePct}% hard.`;
    }
    if (core.netCents < 0) {
      return `A tough period - you spent ${rand(-core.netCents)} more than you earned on day-to-day living. Reining that in is the priority.`;
    }
    if (healthBand === "Strong" || healthScore >= 80) {
      return `A strong period - you finished ${rand(core.netCents)} ahead and set aside ${core.savingsRatePct}% of income.`;
    }
    if (core.savingsRatePct >= GUIDELINES.savingsRatePct) {
      return `A solid period - you're ahead and saving above the ${GUIDELINES.savingsRatePct}% guideline; a couple of tweaks would make it excellent.`;
    }
    return `A steady period - you finished ahead, with room to lift your ${core.savingsRatePct}% savings rate toward the ${GUIDELINES.savingsRatePct}% guideline.`;
  })();

  return {
    verdict,
    ...health,
    highlights: highlights.slice(0, 4),
    coachParagraphs,
    wins: wins.slice(0, 4),
    risks: risks.slice(0, 4),
    actions: actions.slice(0, 5),
    benchmarks,
    dataQualityAlert,
  };
}
