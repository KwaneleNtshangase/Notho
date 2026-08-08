/**
 * Shared health scoring - THE single source of truth for the report score.
 *
 * Extracted from insights.ts so that the report, the score-history endpoint
 * and the what-if simulator can never disagree on what a score means. Pure
 * functions only: no AI, no network, nothing leaves the session.
 *
 * `ScoreInput` is a structural subset of the report model - the full model
 * satisfies it as-is, and the simulator can build an adjusted copy cheaply.
 */

import { formatZarCurrency } from "@/lib/currency";
import type { HealthComponent, MonthlySpend } from "./types";

/** Guidelines quoted in the report (common budgeting rules of thumb). */
export const GUIDELINES = {
  savingsRatePct: 20, // "20% to savings & debt payoff" (50/30/20)
  debtShareOfIncomePct: 35,
  needsSharePct: 50,
  wantsSharePct: 30,
  unclassifiedWarnPct: 20,
} as const;

/** The category fields scoring actually reads - ExpenseCategoryRow satisfies this. */
export type ScoreCategoryRow = {
  group: string;
  isSavingsVehicle: boolean;
  hasBudget: boolean;
  actualCents: number;
  budgetedCents: number;
  variancePct: number | null;
};

/** The model fields scoring actually reads - ReportModel satisfies this. */
export type ScoreInput = {
  totalIncomeCents: number;
  netCents: number;
  savingsRatePct: number;
  consumptionCents: number;
  dayToDayBudgetedCents: number;
  budgetedActualCents: number;
  budgetUsedPct: number | null;
  expenseCategories: ScoreCategoryRow[];
  dataQuality: { unclassifiedExpenseSharePct: number };
};

export type HealthBand = "Strong" | "Steady" | "Fragile" | "Needs attention";

export type HealthResult = {
  /** 0-100 composite score for the period (after any cap). */
  healthScore: number;
  /** Component sum before caps; equals healthScore when uncapped. */
  healthScoreRaw: number;
  /** Set when a cap lowered the score - shown next to the score. */
  healthCapNote: string | null;
  healthBand: HealthBand;
  healthComponents: HealthComponent[];
};

function rand(cents: number): string {
  return formatZarCurrency(Math.round(cents / 100), { decimals: 0 });
}

function pctOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** Debt repayments = "goals" group rows that are NOT savings vehicles. */
export function debtCents(input: Pick<ScoreInput, "expenseCategories">): number {
  return input.expenseCategories
    .filter((r) => r.group === "goals" && !r.isSavingsVehicle)
    .reduce((s, r) => s + r.actualCents, 0);
}

/**
 * Categories the user can't realistically cut by choice this month - bank fees,
 * insurance, rent, tithe, tax. Recommending "trim these by 10%" is useless.
 */
const NON_TRIMMABLE = /\b(bank\s*charge|fee|insurance|funeral|rent|bond|housing|tithe|tax|levy|levies|medical\s+aid)\b/i;

/**
 * A category where a cut is actually possible: needs/wants that aren't fixed
 * obligations. Debt repayments and savings vehicles are commitments too.
 * Used by the trim suggestion in insights AND the what-if sliders.
 */
export function isFlexibleCategory(row: {
  group: string;
  actualCents: number;
  categoryId: string;
  categoryName: string;
}): boolean {
  return (
    (row.group === "needs" || row.group === "wants") &&
    row.actualCents > 0 &&
    !NON_TRIMMABLE.test(`${row.categoryId} ${row.categoryName}`)
  );
}

/** Approximate months in the period, for "per month" phrasing. */
export function monthsSpanned(monthlySpend: Pick<MonthlySpend, "isPartial">[]): number {
  const complete = monthlySpend.filter((m) => !m.isPartial).length;
  if (complete > 0) return complete;
  return Math.max(1, monthlySpend.length);
}

// ─── Component scorers ────────────────────────────────────────────────────────

function scoreCashFlow(input: ScoreInput): HealthComponent {
  const max = 25;
  if (input.totalIncomeCents <= 0) {
    return { label: "Money in vs out", score: 0, max, tone: "bad", note: "No income was recorded this period" };
  }
  const ratio = input.netCents / input.totalIncomeCents;
  if (ratio >= 0.1)
    return { label: "Money in vs out", score: 25, max, tone: "good", note: `You finished ${rand(input.netCents)} ahead` };
  if (ratio >= 0)
    return { label: "Money in vs out", score: 16, max, tone: "good", note: `You finished slightly ahead (${rand(input.netCents)})` };

  // A negative net does NOT always mean overspending. If day-to-day living
  // stayed inside income and the gap only appears after set-aside, the user
  // chose to move more into savings than the surplus covered - a deliberate
  // allocation, not a hole. Calling that "spent more than earned" contradicted
  // the rest of the report, which explains it correctly two pages later, and
  // told someone saving 32% of income that they had overspent.
  const afterLivingCents = input.totalIncomeCents - input.consumptionCents;
  const isAllocationGap = afterLivingCents >= 0;
  const note = isAllocationGap
    ? `Your living costs stayed inside your income. The ${rand(-input.netCents)} gap is there because you put away more than you had left over`
    : `You spent ${rand(-input.netCents)} more than you earned`;

  if (ratio >= -0.1)
    return { label: "Money in vs out", score: 6, max, tone: isAllocationGap ? "info" : "warn", note };
  return { label: "Money in vs out", score: 0, max, tone: isAllocationGap ? "warn" : "bad", note };
}

function scoreSavingsHabit(input: ScoreInput): HealthComponent {
  const max = 25;
  const r = input.savingsRatePct;
  const note = `You put away ${r}% of your income (a good target is ${GUIDELINES.savingsRatePct}%)`;
  // You can't genuinely be credited for saving while you're spending more than
  // you earn - that money is coming from reserves or debt, not surplus. Cap the
  // score at half and flag it, rather than rewarding a possibly-borrowed habit.
  if (input.netCents < 0 && r > 0) {
    const capped = Math.min(r >= 15 ? 12 : r >= 5 ? 8 : 4, 12);
    // The cap is right either way - money set aside beyond the surplus did come
    // from reserves. Only the wording splits: calling an allocation choice a
    // "deficit" contradicted the same report telling the user, correctly, that
    // they had not overspent.
    const livedWithinIncome = input.totalIncomeCents - input.consumptionCents >= 0;
    return {
      label: "Saving habit",
      score: capped,
      max,
      tone: "warn",
      note: livedWithinIncome
        ? `You put away ${r}%, but ${rand(-input.netCents)} of it came from savings you already had, not from new money this period`
        : `You put away ${r}%, but you were ${rand(-input.netCents)} short overall - saving with borrowed money or old savings doesn't fully count`,
    };
  }
  if (r >= 20) return { label: "Saving habit", score: 25, max, tone: "good", note };
  if (r >= 15) return { label: "Saving habit", score: 19, max, tone: "good", note };
  if (r >= 10) return { label: "Saving habit", score: 14, max, tone: "warn", note };
  if (r >= 5) return { label: "Saving habit", score: 8, max, tone: "warn", note };
  if (r > 0) return { label: "Saving habit", score: 4, max, tone: "bad", note };
  return { label: "Saving habit", score: 0, max, tone: "bad", note: "You didn't put anything away this period" };
}

function scoreDebtLoad(input: ScoreInput): HealthComponent {
  const max = 20;
  const debt = debtCents(input);
  const dirty = input.dataQuality.unclassifiedExpenseSharePct >= GUIDELINES.unclassifiedWarnPct;
  if (debt <= 0) {
    // Be honest: with lots of unclassified spend, "no debt" may just mean
    // "no debt we can see".
    return {
      label: "Debt payments",
      score: dirty ? 14 : 20,
      max,
      tone: dirty ? "warn" : "good",
      note: dirty
        ? `We can't see any debt payments - but ${input.dataQuality.unclassifiedExpenseSharePct}% of your spending hasn't been sorted yet`
        : "No debt payments recorded",
    };
  }
  if (input.totalIncomeCents <= 0)
    return { label: "Debt payments", score: 0, max, tone: "bad", note: "You paid off debt but no income was recorded" };
  const share = debt / input.totalIncomeCents;
  const note = `${Math.round(share * 100)}% of your income goes to debt (try to keep this under ${GUIDELINES.debtShareOfIncomePct}%)`;
  if (share <= 0.15) {
    // A clean-looking debt share can't earn near-full marks while a big slice of
    // spending is unclassified - undetected debt could be hiding in "Other". Cap
    // it at half and mark it unverified so the score matches the inline caveat.
    if (dirty) {
      return {
        label: "Debt payments",
        score: 10,
        max,
        tone: "warn",
        note: `We can't be sure - ${input.dataQuality.unclassifiedExpenseSharePct}% of your spending hasn't been sorted, so there may be debt we can't see`,
      };
    }
    return { label: "Debt payments", score: 20, max, tone: "good", note };
  }
  if (share <= 0.35) return { label: "Debt payments", score: 12, max, tone: "warn", note };
  if (share <= 0.5) return { label: "Debt payments", score: 5, max, tone: "bad", note };
  return { label: "Debt payments", score: 0, max, tone: "bad", note };
}

/** Budgets several times bigger than actual spend aren't real constraints. */
export function misalignedBudgetCount(input: Pick<ScoreInput, "expenseCategories">): number {
  return input.expenseCategories.filter(
    (r) => r.hasBudget && !r.isSavingsVehicle && r.variancePct != null && r.variancePct < 40 && r.budgetedCents >= 500000
  ).length;
}

function hasMisalignedBudget(input: ScoreInput): boolean {
  return misalignedBudgetCount(input) > 0;
}

function scoreBudgetDiscipline(input: ScoreInput): HealthComponent {
  const max = 15;
  if (input.dayToDayBudgetedCents <= 0) {
    return { label: "Useful budget", score: 4, max, tone: "warn", note: "You haven't set any everyday budgets yet" };
  }
  const used = input.budgetUsedPct ?? 0;
  // Coverage matters as much as adherence: staying under budget on two small
  // categories while most spending runs unmanaged is not discipline.
  const covered = pctOf(input.budgetedActualCents, input.consumptionCents);
  const note = `You used ${used}% of your budget, but your budgets only cover ${covered}% of what you spend day to day`;
  const goodNote = `You used ${used}% of your budget, and your budgets cover ${covered}% of your day-to-day spending`;
  if (hasMisalignedBudget(input))
    return { label: "Useful budget", score: 9, max, tone: "warn", note: "One of your budgets is set far higher than you actually spend, so it can never warn you" };
  if (used <= 100 && covered >= 60)
    return { label: "Useful budget", score: 15, max, tone: "good", note: goodNote };
  if (used <= 100 && covered >= 30)
    return { label: "Useful budget", score: 9, max, tone: "warn", note };
  if (used <= 115) return { label: "Useful budget", score: 7, max, tone: "warn", note };
  return { label: "Useful budget", score: 3, max, tone: "bad", note };
}

function scoreDataQuality(input: ScoreInput): HealthComponent {
  const max = 15;
  const share = input.dataQuality.unclassifiedExpenseSharePct;
  const note = `${share}% of your spending hasn't been sorted into a category`;
  if (share <= 10) return { label: "Complete records", score: 15, max, tone: "good", note };
  if (share <= 25) return { label: "Complete records", score: 9, max, tone: "warn", note };
  if (share <= 40) return { label: "Complete records", score: 5, max, tone: "bad", note };
  return { label: "Complete records", score: 0, max, tone: "bad", note };
}

// ─── Composite ────────────────────────────────────────────────────────────────

export function healthBandFor(score: number): HealthBand {
  return score >= 80 ? "Strong" : score >= 60 ? "Steady" : score >= 40 ? "Fragile" : "Needs attention";
}

export function scoreHealth(input: ScoreInput): HealthResult {
  const unclassifiedPct = input.dataQuality.unclassifiedExpenseSharePct;

  const healthComponents = [
    scoreCashFlow(input),
    scoreSavingsHabit(input),
    scoreDebtLoad(input),
    scoreBudgetDiscipline(input),
    scoreDataQuality(input),
  ];
  const healthScoreRaw = healthComponents.reduce((s, c) => s + c.score, 0);

  // Two bottleneck caps - the headline can't read "Strong" when the fundamentals
  // say otherwise:
  //   1. Data quality: unclassified spend means the other scores rest on data we
  //      can't see.
  //   2. Solvency: spending more than you earn is the single most important
  //      signal - you can't be "Strong" while going backwards for the period.
  let healthCap = 100;
  let capReason: string | null = null;
  if (unclassifiedPct >= 40) { healthCap = 50; capReason = `${unclassifiedPct}% of spending is unclassified`; }
  else if (unclassifiedPct >= 30) { healthCap = 60; capReason = `${unclassifiedPct}% of spending is unclassified`; }
  else if (unclassifiedPct >= GUIDELINES.unclassifiedWarnPct) { healthCap = 75; capReason = `${unclassifiedPct}% of spending is unclassified`; }
  if (input.totalIncomeCents > 0 && input.netCents < 0) {
    const deficitRatio = -input.netCents / input.totalIncomeCents;
    const solvencyCap = deficitRatio >= 0.1 ? 60 : 72; // can't be "Strong" in deficit
    if (solvencyCap < healthCap) {
      healthCap = solvencyCap;
      capReason = `you spent ${rand(-input.netCents)} more than you earned this period`;
    }
  }
  const healthScore = Math.min(healthScoreRaw, healthCap);
  const healthCapNote =
    healthScore < healthScoreRaw
      ? `Capped at ${healthCap} (components summed to ${healthScoreRaw}): ${capReason}.`
      : null;

  return {
    healthScore,
    healthScoreRaw,
    healthCapNote,
    healthBand: healthBandFor(healthScore),
    healthComponents,
  };
}
