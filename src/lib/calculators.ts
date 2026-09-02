export type GrowthInputs = {
  principal: number;
  monthly: number;
  rate: number;
  years: number;
  escalation: number;
  frequency: "monthly" | "annually" | "once-off";
};

export type CalcInputs = GrowthInputs;

export type GrowthPoint = {
  year: number;
  value: number;
  contributions: number;
  interest: number;
};

export const MAX_GROWTH_YEARS = 100;

function finiteNumber(n: unknown, fallback = 0): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function normalizeCalcInputs(inputs: GrowthInputs): GrowthInputs {
  const frequency =
    inputs.frequency === "annually" || inputs.frequency === "once-off" ? inputs.frequency : "monthly";
  return {
    principal: Math.max(0, finiteNumber(inputs.principal)),
    monthly: frequency === "once-off" ? 0 : Math.max(0, finiteNumber(inputs.monthly)),
    rate: finiteNumber(inputs.rate),
    years: Math.min(MAX_GROWTH_YEARS, Math.max(0, Math.floor(finiteNumber(inputs.years)))),
    escalation: Math.max(-99, finiteNumber(inputs.escalation)),
    frequency,
  };
}

/**
 * Year-by-year projection.
 * Nominal annual rate is compounded monthly in every frequency
 * (ordinary annuity: contribution after that period's interest).
 * Annual mode adds 12 × monthly as a year-end lump after 12 months of compounding.
 * Escalation steps the contribution up once per year-end.
 */
export function calculateGrowth(inputs: GrowthInputs): GrowthPoint[] {
  const { principal, monthly, rate, years, escalation, frequency } = normalizeCalcInputs(inputs);
  const data: GrowthPoint[] = [];
  let balance = principal;
  let currentMonthly = monthly;
  let totalContributions = principal;
  const monthlyRate = rate / 100 / 12;

  for (let year = 0; year <= years; year++) {
    const value = Math.round(balance);
    const contributions = Math.round(totalContributions);
    data.push({
      year,
      value,
      contributions,
      interest: value - contributions,
    });
    if (year >= years) continue;

    if (frequency === "monthly") {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + currentMonthly;
        totalContributions += currentMonthly;
      }
      currentMonthly *= 1 + escalation / 100;
      continue;
    }

    if (frequency === "annually") {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate);
      }
      const annualContribution = currentMonthly * 12;
      balance += annualContribution;
      totalContributions += annualContribution;
      currentMonthly *= 1 + escalation / 100;
      continue;
    }

    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate);
    }
  }

  return data;
}

/** Alias used by the calculator UI and profile pin. */
export const calcGrowth = calculateGrowth;

export function growthFinal(inputs: GrowthInputs): GrowthPoint {
  const data = calculateGrowth(inputs);
  return data[data.length - 1] ?? { year: 0, value: 0, contributions: 0, interest: 0 };
}

/** Bisection solver — fn must be monotone increasing. */
export function bisectSolver(fn: (v: number) => number, lo: number, hi: number, iters = 64): number {
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Smallest whole year in 0…MAX where the projection meets the goal. */
export function solveForYears(base: GrowthInputs, goal: number): number {
  if (growthFinal({ ...base, years: 0 }).value >= goal) return 0;
  if (growthFinal({ ...base, years: MAX_GROWTH_YEARS }).value < goal) return Infinity;
  let lo = 0;
  let hi = MAX_GROWTH_YEARS;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (growthFinal({ ...base, years: mid }).value >= goal) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function solveForMonthly(base: GrowthInputs, goal: number): number {
  if (growthFinal({ ...base, monthly: 0 }).value >= goal) return 0;
  const years = Math.max(normalizeCalcInputs(base).years, 1);
  let cap = Math.max(goal / years / 12, 50_000);
  if (growthFinal({ ...base, monthly: cap }).value < goal) {
    cap = Math.max(cap * 50, goal);
  }
  if (growthFinal({ ...base, monthly: cap }).value < goal) return Infinity;
  return bisectSolver((m) => growthFinal({ ...base, monthly: m }).value - goal, 0, cap);
}

export function solveForRate(base: GrowthInputs, goal: number): number {
  if (growthFinal({ ...base, rate: 0 }).value >= goal) return 0;
  if (growthFinal({ ...base, rate: 100 }).value < goal) return Infinity;
  return bisectSolver((r) => growthFinal({ ...base, rate: r }).value - goal, 0, 100);
}

export function solveForInitial(base: GrowthInputs, goal: number): number {
  if (growthFinal({ ...base, principal: 0 }).value >= goal) return 0;
  const hi = Math.max(goal * 2, 10_000_000);
  if (growthFinal({ ...base, principal: hi }).value < goal) return Infinity;
  return bisectSolver((p) => growthFinal({ ...base, principal: p }).value - goal, 0, hi);
}

export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundsPerYear: number
) {
  const r = annualRatePercent / 100;
  const n = compoundsPerYear;
  return principal * Math.pow(1 + r / n, n * years);
}

export function calculateLoanMonthlyPayment(principal: number, annualRatePercent: number, months: number) {
  if (months <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}
