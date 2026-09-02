export type Frequency = "monthly" | "annually" | "once-off";
export type AccountWrapper = "none" | "tfsa" | "ra" | "living-annuity";

export type GrowthInputs = {
  principal: number;
  monthly: number;
  rate: number;
  years: number;
  escalation: number;
  frequency: Frequency;
  fee?: number;
  inflation?: number;
  withdrawal?: number;
  withdrawalPercent?: number;
  withdrawalMode?: "rand" | "percent";
  withdrawFromYear?: number;
  wrapper?: AccountWrapper;
  annualIncome?: number;
  tfsaUsedLifetime?: number;
};

export type CalcInputs = GrowthInputs;

export type GrowthPoint = {
  year: number;
  value: number;
  contributions: number;
  interest: number;
  withdrawals: number;
  realValue: number;
};

export type GrowthProjection = {
  points: GrowthPoint[];
  notes: string[];
  depletedYear: number | null;
  annualContributionCap: number | null;
};

export const MAX_GROWTH_YEARS = 100;
export const TFSA_ANNUAL_LIMIT = 46_000;
export const TFSA_LIFETIME_LIMIT = 500_000;
export const RA_ANNUAL_CAP = 430_000;
export const RA_INCOME_PCT = 0.275;
export const LIVING_ANNUITY_MIN = 0.025;
export const LIVING_ANNUITY_MAX = 0.175;

function finiteNumber(n: unknown, fallback = 0): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function normalizeCalcInputs(inputs: GrowthInputs): Required<GrowthInputs> {
  const frequency: Frequency =
    inputs.frequency === "annually" || inputs.frequency === "once-off" ? inputs.frequency : "monthly";
  const wrapper: AccountWrapper =
    inputs.wrapper === "tfsa" || inputs.wrapper === "ra" || inputs.wrapper === "living-annuity"
      ? inputs.wrapper
      : "none";
  const years = Math.min(MAX_GROWTH_YEARS, Math.max(0, Math.floor(finiteNumber(inputs.years))));
  const withdrawFromYear = Math.min(
    MAX_GROWTH_YEARS,
    Math.max(0, Math.floor(finiteNumber(inputs.withdrawFromYear, years)))
  );
  const living = wrapper === "living-annuity";
  return {
    principal: Math.max(0, finiteNumber(inputs.principal)),
    monthly: frequency === "once-off" || living ? 0 : Math.max(0, finiteNumber(inputs.monthly)),
    rate: finiteNumber(inputs.rate),
    years,
    escalation: Math.max(-99, finiteNumber(inputs.escalation)),
    frequency,
    fee: Math.max(0, finiteNumber(inputs.fee)),
    inflation: Math.max(0, finiteNumber(inputs.inflation)),
    withdrawal: Math.max(0, finiteNumber(inputs.withdrawal)),
    withdrawalPercent: Math.max(0, finiteNumber(inputs.withdrawalPercent)),
    withdrawalMode: inputs.withdrawalMode === "percent" ? "percent" : "rand",
    withdrawFromYear,
    wrapper,
    annualIncome: Math.max(0, finiteNumber(inputs.annualIncome)),
    tfsaUsedLifetime: Math.max(0, finiteNumber(inputs.tfsaUsedLifetime)),
  };
}

export function annualContributionCap(inputs: Pick<Required<GrowthInputs>, "wrapper" | "annualIncome">): number | null {
  if (inputs.wrapper === "tfsa") return TFSA_ANNUAL_LIMIT;
  if (inputs.wrapper === "ra") {
    if (inputs.annualIncome > 0) {
      return Math.min(RA_ANNUAL_CAP, RA_INCOME_PCT * inputs.annualIncome);
    }
    return RA_ANNUAL_CAP;
  }
  return null;
}

function snapshot(
  year: number,
  balance: number,
  totalContributions: number,
  totalWithdrawals: number,
  inflation: number
): GrowthPoint {
  const value = Math.round(balance);
  const contributions = Math.round(totalContributions);
  const withdrawals = Math.round(totalWithdrawals);
  const interest = value - contributions + withdrawals;
  const realValue = inflation > 0 ? Math.round(balance / Math.pow(1 + inflation / 100, year)) : value;
  return { year, value, contributions, interest, withdrawals, realValue };
}

export function projectGrowth(inputs: GrowthInputs): GrowthProjection {
  const n = normalizeCalcInputs(inputs);
  const notes: string[] = [];
  const cap = annualContributionCap(n);
  let lifetimeLeft =
    n.wrapper === "tfsa" ? Math.max(0, TFSA_LIFETIME_LIMIT - n.tfsaUsedLifetime) : Number.POSITIVE_INFINITY;

  if (n.wrapper === "tfsa") {
    notes.push(
      `TFSA cap R${TFSA_ANNUAL_LIMIT.toLocaleString("en-ZA")} a year (2026/27), R${TFSA_LIFETIME_LIMIT.toLocaleString("en-ZA")} lifetime. Withdrawals do not restore room.`
    );
  }
  if (n.wrapper === "ra") {
    notes.push(
      n.annualIncome > 0
        ? `RA contributions capped at R${Math.round(cap ?? 0).toLocaleString("en-ZA")} (lesser of 27.5% of income and R${RA_ANNUAL_CAP.toLocaleString("en-ZA")} for 2026/27).`
        : `RA deduction cap is 27.5% of income or R${RA_ANNUAL_CAP.toLocaleString("en-ZA")} (2026/27), whichever is lower.`
    );
  }
  if (n.wrapper === "living-annuity") {
    notes.push("Living annuity drawdown is regulated at 2.5%–17.5% of the pot each year.");
  }

  const points: GrowthPoint[] = [];
  let balance = n.principal;
  let currentMonthly = n.monthly;
  let currentWithdrawal = n.withdrawal;
  let totalContributions = n.principal;
  let totalWithdrawals = 0;
  let depletedYear: number | null = null;
  const monthlyRate = n.rate / 100 / 12;
  const monthlyFee = n.fee / 100 / 12;

  for (let year = 0; year <= n.years; year++) {
    points.push(snapshot(year, balance, totalContributions, totalWithdrawals, n.inflation));
    if (year >= n.years) continue;
    if (depletedYear !== null) continue;

    const saving = year < n.withdrawFromYear && n.frequency !== "once-off" && n.wrapper !== "living-annuity";
    const percentMode = n.withdrawalMode === "percent";
    const drawing =
      year >= n.withdrawFromYear && (percentMode ? n.withdrawalPercent > 0 : currentWithdrawal > 0);

    let yearContribBudget = 0;
    if (saving) {
      yearContribBudget = currentMonthly * 12;
      if (cap != null) yearContribBudget = Math.min(yearContribBudget, cap);
      if (Number.isFinite(lifetimeLeft)) yearContribBudget = Math.min(yearContribBudget, lifetimeLeft);
      if (yearContribBudget + 0.5 < currentMonthly * 12) {
        notes.push("Contributions were capped to stay inside the account limit.");
      }
    }

    const yearStart = Math.max(balance, 0);
    let yearWithdrawalBudget = 0;
    if (drawing) {
      yearWithdrawalBudget = percentMode
        ? yearStart * (n.withdrawalPercent / 100)
        : currentWithdrawal * 12;
    }
    if (n.wrapper === "living-annuity" && yearStart > 0) {
      const minWd = LIVING_ANNUITY_MIN * yearStart;
      const maxWd = LIVING_ANNUITY_MAX * yearStart;
      if (yearWithdrawalBudget <= 0) yearWithdrawalBudget = minWd;
      const clamped = Math.min(maxWd, Math.max(minWd, yearWithdrawalBudget));
      if (Math.abs(clamped - yearWithdrawalBudget) > 1) {
        notes.push("Withdrawal was moved into the 2.5%–17.5% living-annuity band.");
      }
      yearWithdrawalBudget = clamped;
    }

    const monthlyContrib = n.frequency === "monthly" ? yearContribBudget / 12 : 0;
    const monthlyWd = yearWithdrawalBudget / 12;

    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) * (1 - monthlyFee);
      if (monthlyContrib > 0) {
        balance += monthlyContrib;
        totalContributions += monthlyContrib;
        if (Number.isFinite(lifetimeLeft)) lifetimeLeft = Math.max(0, lifetimeLeft - monthlyContrib);
      }
      if (monthlyWd > 0 && balance > 0) {
        const take = Math.min(monthlyWd, balance);
        balance -= take;
        totalWithdrawals += take;
      }
      if (balance <= 0.0001) {
        balance = 0;
        if (depletedYear === null) depletedYear = year + 1;
        break;
      }
    }

    if (n.frequency === "annually" && yearContribBudget > 0 && depletedYear === null) {
      balance += yearContribBudget;
      totalContributions += yearContribBudget;
      if (Number.isFinite(lifetimeLeft)) lifetimeLeft = Math.max(0, lifetimeLeft - yearContribBudget);
    }

    currentMonthly *= 1 + n.escalation / 100;
    if (n.inflation > 0 && n.withdrawalMode !== "percent") currentWithdrawal *= 1 + n.inflation / 100;
  }

  if (depletedYear !== null) notes.push(`The pot reaches R0 in year ${depletedYear}.`);
  return { points, notes: [...new Set(notes)], depletedYear, annualContributionCap: cap };
}

export function calculateGrowth(inputs: GrowthInputs): GrowthPoint[] {
  return projectGrowth(inputs).points;
}

export const calcGrowth = calculateGrowth;

export function growthFinal(inputs: GrowthInputs): GrowthPoint {
  const data = calculateGrowth(inputs);
  return data[data.length - 1] ?? { year: 0, value: 0, contributions: 0, interest: 0, withdrawals: 0, realValue: 0 };
}

export function bisectSolver(fn: (v: number) => number, lo: number, hi: number, iters = 64): number {
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function accumulationBase(base: GrowthInputs): GrowthInputs {
  return { ...base, withdrawal: 0, withdrawalPercent: 0, withdrawFromYear: MAX_GROWTH_YEARS };
}

export function solveForYears(base: GrowthInputs, goal: number): number {
  const clean = accumulationBase(base);
  if (growthFinal({ ...clean, years: 0 }).value >= goal) return 0;
  if (growthFinal({ ...clean, years: MAX_GROWTH_YEARS }).value < goal) return Infinity;
  let lo = 0;
  let hi = MAX_GROWTH_YEARS;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (growthFinal({ ...clean, years: mid }).value >= goal) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function solveForMonths(base: GrowthInputs, goal: number): number {
  const years = solveForYears(base, goal);
  if (!Number.isFinite(years)) return Infinity;
  if (years <= 0) return 0;
  const clean = accumulationBase(base);
  if (growthFinal({ ...clean, years: years - 1 }).value >= goal) return Math.max(0, (years - 1) * 12);
  const n = normalizeCalcInputs(clean);
  let balance = n.principal;
  let currentMonthly = n.monthly;
  const monthlyRate = n.rate / 100 / 12;
  const monthlyFee = n.fee / 100 / 12;
  const cap = annualContributionCap(n);
  let lifetimeLeft =
    n.wrapper === "tfsa" ? Math.max(0, TFSA_LIFETIME_LIMIT - n.tfsaUsedLifetime) : Number.POSITIVE_INFINITY;
  const limitMonths = years * 12;
  for (let month = 1; month <= limitMonths; month++) {
    const saving = n.frequency !== "once-off" && n.wrapper !== "living-annuity";
    let yearBudget = saving ? currentMonthly * 12 : 0;
    if (cap != null) yearBudget = Math.min(yearBudget, cap);
    if (Number.isFinite(lifetimeLeft)) yearBudget = Math.min(yearBudget, lifetimeLeft);
    const monthlyContrib = n.frequency === "monthly" ? yearBudget / 12 : 0;
    balance = balance * (1 + monthlyRate) * (1 - monthlyFee);
    if (n.frequency === "monthly" && monthlyContrib > 0) {
      balance += monthlyContrib;
      if (Number.isFinite(lifetimeLeft)) lifetimeLeft = Math.max(0, lifetimeLeft - monthlyContrib);
    }
    if (n.frequency === "annually" && month % 12 === 0 && yearBudget > 0) {
      balance += yearBudget;
      if (Number.isFinite(lifetimeLeft)) lifetimeLeft = Math.max(0, lifetimeLeft - yearBudget);
    }
    if (Math.round(balance) >= goal) return month;
    if (month % 12 === 0) currentMonthly *= 1 + n.escalation / 100;
  }
  return years * 12;
}

export function formatDuration(months: number): string {
  if (!Number.isFinite(months)) return "Not achievable";
  if (months <= 0) return "Already there";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return m === 1 ? "1 month" : `${m} months`;
  if (m === 0) return y === 1 ? "1 year" : `${y} years`;
  return `${y} year${y === 1 ? "" : "s"} ${m} month${m === 1 ? "" : "s"}`;
}

export function solveForMonthly(base: GrowthInputs, goal: number): number {
  const clean = accumulationBase(base);
  if (growthFinal({ ...clean, monthly: 0 }).value >= goal) return 0;
  const years = Math.max(normalizeCalcInputs(clean).years, 1);
  let cap = Math.max(goal / years / 12, 50_000);
  if (growthFinal({ ...clean, monthly: cap }).value < goal) cap = Math.max(cap * 50, goal);
  if (growthFinal({ ...clean, monthly: cap }).value < goal) return Infinity;
  return bisectSolver((m) => growthFinal({ ...clean, monthly: m }).value - goal, 0, cap);
}

export function solveForRate(base: GrowthInputs, goal: number): number {
  const clean = accumulationBase(base);
  if (growthFinal({ ...clean, rate: 0 }).value >= goal) return 0;
  if (growthFinal({ ...clean, rate: 100 }).value < goal) return Infinity;
  return bisectSolver((r) => growthFinal({ ...clean, rate: r }).value - goal, 0, 100);
}

export function solveForInitial(base: GrowthInputs, goal: number): number {
  const clean = accumulationBase(base);
  if (growthFinal({ ...clean, principal: 0 }).value >= goal) return 0;
  const hi = Math.max(goal * 2, 10_000_000);
  if (growthFinal({ ...clean, principal: hi }).value < goal) return Infinity;
  return bisectSolver((p) => growthFinal({ ...clean, principal: p }).value - goal, 0, hi);
}

export function solveForWithdrawal(base: GrowthInputs, surviveYears?: number): number {
  const n = normalizeCalcInputs(base);
  const years = Math.max(surviveYears ?? n.years, 1);
  const startYear = Math.min(n.withdrawFromYear, years);
  if (growthFinal({ ...base, years, withdrawal: 0, withdrawFromYear: years }).value <= 0) return 0;
  const hi = Math.max(n.principal, 50_000);
  const survives = (w: number) => {
    const p = projectGrowth({ ...base, years, withdrawal: w, withdrawalMode: "rand", withdrawFromYear: startYear });
    return p.depletedYear === null && (p.points[p.points.length - 1]?.value ?? 0) > 0;
  };
  if (!survives(1)) return 0;
  let cap = hi;
  for (let i = 0; i < 8 && survives(cap); i++) cap *= 2;
  if (survives(cap)) return cap;
  return bisectSolver((w) => (survives(w) ? -1 : 1), 0, cap);
}

export function assumptionLine(inputs: GrowthInputs): string {
  const n = normalizeCalcInputs(inputs);
  const bits = ["End-of-month deposits", `${n.rate}% p.a. nominal, compounded monthly`];
  bits.push(n.fee > 0 ? `${n.fee}% annual fee` : "no fees");
  bits.push(n.inflation > 0 ? `${n.inflation}% inflation` : "no inflation");
  if (n.withdrawFromYear < n.years && (n.withdrawal > 0 || (n.withdrawalMode === "percent" && n.withdrawalPercent > 0))) {
    if (n.withdrawalMode === "percent") bits.push(`${n.withdrawalPercent}% of pot each year from year ${n.withdrawFromYear}`);
    else bits.push(`R${Math.round(n.withdrawal).toLocaleString("en-ZA")}/mo from year ${n.withdrawFromYear}`);
  }
  if (n.wrapper !== "none") bits.push(n.wrapper === "living-annuity" ? "living annuity" : n.wrapper.toUpperCase());
  return bits.join(" · ");
}

export function calculateCompoundInterest(principal: number, annualRatePercent: number, years: number, compoundsPerYear: number) {
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
