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
      highlights.push({ tone: "good", text: `You ended this period ${rand(core.netCents)} ahead.` });
    } else if (allocationDeficit) {
      highlights.push({
        tone: "info",
        text: `Your day-to-day spending stayed inside your income. You're ${rand(-core.netCents)} short only because you put ${rand(core.setAsideCents)} away, which is more than the ${rand(afterLivingCents)} you had left over - so that money came from savings you already had, not from overspending.`,
      });
    } else {
      highlights.push({ tone: "bad", text: `You spent ${rand(-core.netCents)} more than you earned on day-to-day living.` });
    }
  }
  if (income > 0) {
    highlights.push(
      core.savingsRatePct >= GUIDELINES.savingsRatePct
        ? { tone: "good", text: `You put away ${core.savingsRatePct}% of your income - that's at or above the ${GUIDELINES.savingsRatePct}% most people aim for.` }
        : { tone: "warn", text: `You put away ${core.savingsRatePct}% of your income (${rand(core.setAsideCents)}). Most people aim for ${GUIDELINES.savingsRatePct}%.` }
    );
  }
  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    highlights.push({
      tone: "warn",
      text: `${unclassifiedPct}% of your spending (${rand(core.groupTotals.unclassified)}) hasn't been sorted into a category, so the picture below is blurry until you sort it.`,
    });
  }
  if (debtSharePct >= 30) {
    highlights.push({ tone: "bad", text: `Debt payments took ${debtSharePct}% of your income (${rand(debt)}).` });
  }
  if (core.totalBudgetedExpenseCents > 0 && core.budgetVarianceCents > 0 && highlights.length < 4) {
    highlights.push({
      tone: "warn",
      text: `You spent ${rand(core.budgetVarianceCents)} more than you planned in the categories that have a budget.`,
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
      text: `You spent ${rand(-w.varianceCents)} less than you planned on ${w.categoryName} - nicely controlled.`,
    });
  }

  // ── Wins & risks ────────────────────────────────────────────────────────
  const wins: string[] = [];
  const risks: string[] = [];

  for (const r of realUnderBudget.slice(0, 2)) {
    wins.push(`${r.categoryName}: ${rand(-r.varianceCents)} under budget - you used ${r.variancePct}% of it.`);
  }
  // Only celebrate the savings rate when it's real surplus, not deficit-funded.
  if (core.savingsRatePct >= GUIDELINES.savingsRatePct && core.netCents >= 0) {
    wins.push(`You put away ${rand(core.setAsideCents)} - that's ${core.savingsRatePct}% of your income, all of it from money you had left over.`);
  }
  if (core.comparison?.setAsideDeltaPct != null && core.comparison.setAsideDeltaPct > 0 && core.netCents >= 0) {
    wins.push(`You put away ${core.comparison.setAsideDeltaPct}% more than you did last period.`);
  }
  // hasData, not just !isPartial: a complete month with no entries nets to
  // exactly zero, which counts as ">= 0" and was being celebrated as a month
  // ended in the green. A user two months into the year got told every month
  // was positive, including the months they had not lived yet.
  const positiveMonths = core.monthlySpend.filter((m) => !m.isPartial && m.hasData && m.netCents >= 0).length;
  const fullMonths = core.monthlySpend.filter((m) => !m.isPartial && m.hasData).length;
  if (fullMonths >= 2 && positiveMonths === fullMonths) {
    wins.push(`Every full month in this period ended with money left over (${fullMonths} out of ${fullMonths}).`);
  }
  if (core.incomeCategories.length >= 2 && core.incomeCategories[0].sharePct < 60) {
    wins.push(`Your income comes from ${core.incomeCategories.length} different sources, so you're not relying on just one.`);
  }
  const goalsSharePct = pctOf(core.groupTotals.goals, core.totalExpenseCents);
  if (goalsSharePct >= 40 && core.netCents >= 0) {
    wins.push(
      `${rand(core.groupTotals.goals)} of your money this period (${goalsSharePct}%) went towards your future - savings, stokvel and paying off debt.`
    );
  }

  // Deficit-while-saving: the most important nuance in a shortfall report.
  if (core.netCents < 0 && core.setAsideCents > 0) {
    if (core.setAsideCents >= -core.netCents) {
      // Consumption alone was within income - the shortfall is a deliberate
      // allocation choice, not overspending. Reframe it as such.
      wins.push(
        `Your day-to-day spending stayed inside your income. The ${rand(-core.netCents)} you came up short is only because you chose to put ${rand(core.setAsideCents)} away. That's you deciding where your money goes, not overspending.`
      );
    } else {
      risks.push(
        `You put away ${rand(core.setAsideCents)} while coming up ${rand(-core.netCents)} short overall. Check that you're not paying for your savings with debt or with money you'd already saved.`
      );
    }
  }
  if (misalignedBudget) {
    const timesBigger = Math.round(misalignedBudget.budgetedCents / Math.max(misalignedBudget.actualCents, 1));
    risks.push(
      `Your ${misalignedBudget.categoryName} budget (${rand(misalignedBudget.budgetedCents)}) is about ${timesBigger} times what you actually spend, so it can never warn you about anything.`
    );
  }
  // Debt-funded saving: taking loans while contributing to savings/stokvel is a
  // cycle where you borrow to look like you're saving. This is the single most
  // important flag when it happens - lead the risks with it.
  if (loanIncomeCents > 0 && core.setAsideCents > 0) {
    risks.unshift(
      `${rand(loanIncomeCents)} of what came in this period was borrowed money, and you put ${rand(core.setAsideCents)} into savings. Borrowing so you can save keeps you in debt - that money isn't really yours until the loan is paid back.`
    );
  }

  for (const r of core.topOverBudget.slice(0, 2)) {
    risks.push(`${r.categoryName}: ${rand(r.varianceCents)} over budget - you used ${r.variancePct}% of it.`);
  }
  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    risks.push(`${unclassifiedPct}% of your spending hasn't been sorted into a category, so you can't see where it went.`);
  }
  if (debtSharePct >= 30) {
    risks.push(`Debt payments take ${debtSharePct}% of your income, which leaves little room for your goals.`);
  }
  if (income > 0 && core.incomeCategories.length > 0 && core.incomeCategories[0].sharePct >= 80) {
    risks.push(`${core.incomeCategories[0].sharePct}% of your income comes from one place (${core.incomeCategories[0].categoryName}). If that stops, so does most of your money.`);
  }
  const negativeMonths = core.monthlySpend.filter((m) => !m.isPartial && m.netCents < 0);
  if (negativeMonths.length > 0) {
    risks.push(
      `${negativeMonths.length} month${negativeMonths.length === 1 ? "" : "s"} ended with you spending more than you earned (${negativeMonths.map((m) => m.label).join(", ")}).`
    );
  }
  if (income > 0 && core.savingsRatePct < 5) {
    risks.push(`You're putting away ${core.savingsRatePct}% of your income, which isn't enough to build up an emergency fund.`);
  }
  const recurringDebt = core.recurringCommitments.filter(
    (r) => r.group === "goals" && /\b(loan|debt|repay)/i.test(`${r.description} ${r.categoryName}`)
  );
  if (recurringDebt.length > 0) {
    const d = recurringDebt[0];
    risks.push(
      `You've paid about ${rand(d.typicalCents)} a month towards ${d.description} for ${d.monthsSeen} months in a row. That looks like a loan you're still paying off.`
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
        `Big change compared to last period: ${swings.join(", ")}. If you weren't expecting that (a bonus, a one-off, a seasonal thing), it's worth finding out why before you read too much into the trend.`
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
      `${identicalMonths} months have exactly the same spending total, down to the cent. That usually means the same transactions were imported twice - worth a check.`
    );
  }

  // ── Actions (3-5, prioritised, each with estimated impact) ──────────────
  const actions: ReportAction[] = [];

  if (misalignedBudget) {
    actions.push({
      id: "recalibrate-budget",
      title: `Recalibrate your ${misalignedBudget.categoryName} budget`,
      detail: `You budgeted ${rand(misalignedBudget.budgetedCents)} but spent ${rand(misalignedBudget.actualCents)} - only ${misalignedBudget.variancePct}% of it. A budget you never come close to isn't really a plan. Set it near what you actually spend, and going over will start to mean something.`,
      impact: "Your budget starts telling you something real",
      lesson: LESSONS.buildingBudget,
    });
  }

  if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) {
    actions.push({
      id: "recategorise",
      title: "Recategorise your 'Other' transactions",
      detail: `${rand(core.groupTotals.unclassified)} of your spending isn't in a proper category yet. Sorting it takes a few minutes and does more for the accuracy of this report than anything else.`,
      impact: `Your next report can explain ${unclassifiedPct}% more of your money`,
      lesson: LESSONS.trackingSpend,
    });
  }

  if (core.totalBudgetedExpenseCents <= 0) {
    actions.push({
      id: "first-budgets",
      title: "Set your first category budgets",
      detail: "You're tracking what you spend, but you haven't set any limits. Putting a budget on each category turns tracking into a plan.",
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
        detail: `${rand(core.unbudgetedActualCents)} of your spending (${pctOf(core.unbudgetedActualCents, core.totalExpenseCents)}%) is in categories with no budget, so nothing there ever gets flagged.`,
        impact: "You'll get warned when your biggest categories run high",
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
          ? ` You already have ${rand(core.netCents)} left over each period, so the money is there - it just needs somewhere to go.`
          : "";
      actions.push({
        id: "payday-setaside",
        title: "Set aside a fixed amount on payday",
        detail: `Move money into savings the day you get paid, before you spend any of it. Doing it in that order is what makes it stick.${surplusHint}`,
        impact: `About ${rand(extraPerMonth)} a month takes you from ${core.savingsRatePct}% to ${targetRate}% - roughly ${rand(extraPerMonth * 12)} more saved over a year`,
        lesson: LESSONS.emergencyFund,
      });
    }
  }

  if (debtSharePct >= 30) {
    actions.push({
      id: "map-debts",
      title: "List your debts and decide which to pay off first",
      detail: `You paid ${rand(debt)} towards debt this period. Paying them off in a set order costs you less in interest overall, and it's easier to stay on top of.`,
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
        detail: `${trimRow.categoryName} is the biggest thing you can actually cut back on - ${rand(trimRow.actualCents)}, or ${trimRow.sharePct}% of your spending. One change here does more than ten small ones elsewhere.`,
        impact: `Frees up about ${rand(monthlyCut)} a month - enough to put away ${newRate}% of your income`,
        lesson: LESSONS.needsVsWants,
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      id: "keep-streak",
      title: "Keep the streak going",
      detail: "You're earning more than you spend, your budgets are holding and your records are clean. Now it's just about keeping it up.",
    });
  }
  // Actions are already in priority order; the first is THE one to do.
  actions[0].isTopPriority = true;

  // ── Coach narrative ─────────────────────────────────────────────────────
  const coachParagraphs: string[] = [];
  if (income > 0 || core.totalExpenseCents > 0) {
    const flow =
      core.netCents >= 0
        ? `which left you ${rand(core.netCents)} ahead`
        : allocationDeficit
          ? `which left you ${rand(afterLivingCents)} over. You then put away ${rand(core.setAsideCents)} - ${rand(-core.netCents)} more than you had left - so that gap came out of savings you already had, not from overspending`
          : `which left you ${rand(-core.netCents)} short - your day-to-day spending was more than you earned`;
    coachParagraphs.push(
      `Over ${periodLabel} you earned ${rand(income)}, spent ${rand(core.consumptionCents)} on day-to-day living, and put ${rand(core.setAsideCents)} away into savings - a stokvel, a savings account or similar. That's ${core.savingsRatePct}% of your income, ${flow}.`
    );
  }
  // Net the business out so a big side-hustle doesn't just look like spending.
  if (core.groupTotals.business > 0 && businessIncomeCents > 0) {
    coachParagraphs.push(
      `Your side hustle brought in ${rand(businessIncomeCents)} and cost you ${rand(core.groupTotals.business)} this period, so overall it ${businessNetCents >= 0 ? `put ${rand(businessNetCents)} into` : `took ${rand(-businessNetCents)} out of`} your pocket. ${businessNetCents >= 0 ? "It's paying its way." : "Worth asking whether that money is buying something that'll pay off later, or just leaking away."}`
    );
  }
  const topSpendRow =
    core.expenseCategories.find((r) => !r.isSavingsVehicle && r.actualCents > 0) ?? null;
  if (topSpendRow) {
    const caveat =
      unclassifiedPct >= GUIDELINES.unclassifiedWarnPct
        ? ` Bear in mind ${unclassifiedPct}% of your spending still isn't sorted into a category, so this could change once you sort it.`
        : "";
    coachParagraphs.push(
      `Your biggest day-to-day category was ${topSpendRow.categoryName} at ${rand(topSpendRow.actualCents)} (${topSpendRow.sharePct}% of all spending).${caveat}`
    );
  }
  if (core.projection.annualisedExpenseCents != null && core.projection.monthsUsed >= 2) {
    const wealthLine =
      income > 0 && core.savingsRatePct > 0 && core.savingsRatePct < GUIDELINES.savingsRatePct
        ? ` If you keep putting away ${core.savingsRatePct}%, that's about ${rand(avgMonthlyIncome * (core.savingsRatePct / 100) * 12)} saved over the next year. At ${GUIDELINES.savingsRatePct}% it would be about ${rand(avgMonthlyIncome * (GUIDELINES.savingsRatePct / 100) * 12)}.`
        : "";
    // Pair spend with income so the projection isn't a lone (ominous-looking)
    // number - a rising spend against rising income is very different from one
    // against flat income.
    const annualIncome = Math.round(avgMonthlyIncome * 12);
    coachParagraphs.push(
      `If you carry on at this pace, you're on track to earn about ${rand(annualIncome)} and spend about ${rand(core.projection.annualisedExpenseCents)} this year. (Based on your ${core.projection.monthsUsed} complete months.)${wealthLine}`
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
      label: "How much of your income you save",
      value: `${core.savingsRatePct}%`,
      target: `${GUIDELINES.savingsRatePct}%+ of income`,
      tone: toneFor(core.savingsRatePct >= 20, core.savingsRatePct >= 10),
    },
    {
      label: "How much goes to debt",
      value: income > 0 ? `${debtSharePct}% of income` : "-",
      target: `below ${GUIDELINES.debtShareOfIncomePct}%`,
      tone: toneFor(debtSharePct < 20, debtSharePct <= GUIDELINES.debtShareOfIncomePct),
    },
    {
      label: "Needs - things you must pay",
      value: `${needsPct}${shareLabel}`,
      target: `about ${GUIDELINES.needsSharePct}%`,
      tone: needsPct <= 65 ? "good" : "warn",
    },
    {
      label: "Wants - things you choose",
      value: `${wantsPct}${shareLabel}`,
      target: `about ${GUIDELINES.wantsSharePct}%`,
      tone: wantsPct <= GUIDELINES.wantsSharePct ? "good" : "warn",
    },
  ];
  if (core.budgetUsedPct != null) {
    benchmarks.push({
      label: "How much of your budget you used",
      value: `${core.budgetUsedPct}%`,
      target: "100% or less",
      tone: toneFor(core.budgetUsedPct <= 100, core.budgetUsedPct <= 115),
    });
  }

  const dataQualityAlert =
    unclassifiedPct >= GUIDELINES.unclassifiedWarnPct
      ? `${unclassifiedPct}% of your spending (${rand(core.groupTotals.unclassified)}) is sitting in "Other" or has no category at all. Until you sort it, every chart in this report is missing part of the story.`
      : null;

  // ── Verdict: the one sentence that answers "how did I do?" ───────────────
  // Leads with the dominant story, not a generic band label.
  const verdict = (() => {
    if (income <= 0 && core.totalExpenseCents <= 0) return "Nothing recorded for this period yet.";
    if (unclassifiedPct >= 30) {
      return `${unclassifiedPct}% of your spending still has no category, which is too much to judge this period fairly. Sorting it is your first move.`;
    }
    if (loanIncomeCents > 0 && core.setAsideCents > 0) {
      return `Careful: you put money away while also taking out a loan. If you're borrowing in order to save, your debt is quietly growing.`;
    }
    if (allocationDeficit) {
      return `A disciplined period. Your day-to-day spending stayed inside your income, and you came up short only because you chose to save a hefty ${core.savingsRatePct}%.`;
    }
    if (core.netCents < 0) {
      return `A tough period. You spent ${rand(-core.netCents)} more than you earned on day-to-day living, and pulling that back is your first priority.`;
    }
    if (healthBand === "Strong" || healthScore >= 80) {
      return `A strong period. You finished ${rand(core.netCents)} ahead and put away ${core.savingsRatePct}% of your income.`;
    }
    if (core.savingsRatePct >= GUIDELINES.savingsRatePct) {
      return `A solid period. You're ahead and saving more than the ${GUIDELINES.savingsRatePct}% most people aim for - a couple of small changes would make it excellent.`;
    }
    return `A steady period. You finished ahead, and there's room to push your saving from ${core.savingsRatePct}% up towards the ${GUIDELINES.savingsRatePct}% most people aim for.`;
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
