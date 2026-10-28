import { describe, expect, it } from "vitest";
import {
  calculateCompoundInterest,
  calculateGrowth,
  calculateLoanMonthlyPayment,
  formatDuration,
  growthFinal,
  projectGrowth,
  solveForInitial,
  solveForMonthly,
  solveForMonths,
  solveForRate,
  solveForWithdrawal,
  solveForYears,
  TFSA_ANNUAL_LIMIT,
} from "../calculators";

const DEFAULTS = {
  principal: 50_000,
  monthly: 1_000,
  rate: 10,
  years: 10,
  escalation: 5,
  frequency: "monthly" as const,
};

describe("calculateGrowth", () => {
  it("matches the ordinary-annuity closed form when escalation is 0", () => {
    const r = 0.1 / 12;
    const n = 120;
    const closed = 50_000 * Math.pow(1 + r, n) + (1_000 * (Math.pow(1 + r, n) - 1)) / r;
    const live = growthFinal({ ...DEFAULTS, escalation: 0 });
    expect(live.value).toBe(Math.round(closed));
    expect(live.contributions).toBe(170_000);
    expect(live.interest).toBe(live.value - live.contributions);
    expect(live.withdrawals).toBe(0);
    expect(live.realValue).toBe(live.value);
  });

  it("uses monthly compounding for once-off lumps", () => {
    const closed = 50_000 * Math.pow(1 + 0.1 / 12, 120);
    const live = growthFinal({ ...DEFAULTS, frequency: "once-off" });
    expect(live.value).toBe(Math.round(closed));
    expect(live.contributions).toBe(50_000);
  });

  it("ignores typed monthly contributions in once-off mode", () => {
    const a = growthFinal({ ...DEFAULTS, frequency: "once-off", monthly: 9999 });
    const b = growthFinal({ ...DEFAULTS, frequency: "once-off", monthly: 0 });
    expect(a.value).toBe(b.value);
  });

  it("floors fractional years and does not over-compound", () => {
    const ten = growthFinal({ ...DEFAULTS, years: 10 });
    const almost = growthFinal({ ...DEFAULTS, years: 10.9 });
    expect(almost.value).toBe(ten.value);
    expect(calculateGrowth({ ...DEFAULTS, years: 10.9 })).toHaveLength(11);
  });

  it("clamps negative principal, monthly, and years", () => {
    const data = calculateGrowth({
      ...DEFAULTS,
      principal: -100,
      monthly: -50,
      years: -3,
    });
    expect(data).toHaveLength(1);
    expect(data[0].value).toBe(0);
    expect(data[0].contributions).toBe(0);
    expect(data[0].interest).toBe(0);
  });

  it("keeps value = contributions + interest - withdrawals after rounding", () => {
    for (const point of calculateGrowth(DEFAULTS)) {
      expect(point.value).toBe(point.contributions + point.interest - point.withdrawals);
    }
  });

  it("does not change the path when fee and inflation are zero", () => {
    const plain = growthFinal(DEFAULTS);
    const extra = growthFinal({ ...DEFAULTS, fee: 0, inflation: 0, withdrawal: 0 });
    expect(extra.value).toBe(plain.value);
  });

  it("applies fee as a drag so the pot is smaller", () => {
    const gross = growthFinal({ ...DEFAULTS, escalation: 0, fee: 0 });
    const net = growthFinal({ ...DEFAULTS, escalation: 0, fee: 1 });
    expect(net.value).toBeLessThan(gross.value);
  });

  it("shows real value below nominal when inflation is set", () => {
    const p = growthFinal({ ...DEFAULTS, inflation: 5 });
    expect(p.realValue).toBeLessThan(p.value);
    expect(p.realValue).toBe(Math.round(p.value / Math.pow(1.05, 10)));
  });

  it("caps TFSA contributions at the annual limit", () => {
    const p = projectGrowth({
      ...DEFAULTS,
      wrapper: "tfsa",
      monthly: 10_000,
      escalation: 0,
      years: 1,
    });
    expect(p.points[1].contributions - p.points[0].contributions).toBe(TFSA_ANNUAL_LIMIT);
    expect(p.notes.some((n) => n.includes("capped") || n.includes("TFSA"))).toBe(true);
  });

  it("stops new TFSA contributions at the lifetime limit", () => {
    const p = projectGrowth({
      ...DEFAULTS,
      wrapper: "tfsa",
      monthly: 10_000,
      escalation: 0,
      years: 2,
      tfsaUsedLifetime: 490_000,
    });
    expect(p.points[2].contributions - p.points[0].contributions).toBe(10_000);
  });

  it("depletes the pot when withdrawals exceed growth", () => {
    const p = projectGrowth({
      principal: 12_000,
      monthly: 0,
      rate: 0,
      years: 5,
      escalation: 0,
      frequency: "once-off",
      withdrawal: 1_000,
      withdrawFromYear: 0,
    });
    expect(p.depletedYear).toBe(1);
    expect(p.points[p.points.length - 1].value).toBe(0);
    expect(p.points[p.points.length - 1].withdrawals).toBe(12_000);
  });

  it("clamps living-annuity withdrawals into the 2.5–17.5% band", () => {
    const p = projectGrowth({
      principal: 100_000,
      monthly: 0,
      rate: 0,
      years: 1,
      escalation: 0,
      frequency: "once-off",
      wrapper: "living-annuity",
      withdrawal: 100,
      withdrawFromYear: 0,
    });
    expect(p.points[1].withdrawals).toBe(2_500);
  });
});

describe("solvers", () => {
  it("returns the first whole year that reaches the goal", () => {
    const goal = 500_000;
    const years = solveForYears(DEFAULTS, goal);
    expect(years).toBe(12);
    expect(growthFinal({ ...DEFAULTS, years: 11 }).value).toBeLessThan(goal);
    expect(growthFinal({ ...DEFAULTS, years }).value).toBeGreaterThanOrEqual(goal);
  });

  it("returns a month count inside the year that first clears the goal", () => {
    const months = solveForMonths(DEFAULTS, 500_000);
    expect(months).toBeGreaterThan(11 * 12);
    expect(months).toBeLessThanOrEqual(12 * 12);
    expect(formatDuration(12)).toBe("1 year");
    expect(formatDuration(13)).toBe("1 year 1 month");
  });

  it("solves monthly so the projection meets the goal", () => {
    const goal = 500_000;
    const monthly = solveForMonthly(DEFAULTS, goal);
    expect(monthly).toBeGreaterThan(1000);
    expect(growthFinal({ ...DEFAULTS, monthly }).value).toBeGreaterThanOrEqual(goal - 1);
  });

  it("expands the monthly cap when a negative rate needs a large PMT", () => {
    const monthly = solveForMonthly({ ...DEFAULTS, rate: -5, years: 2 }, 2_000_000);
    expect(Number.isFinite(monthly)).toBe(true);
    expect(growthFinal({ ...DEFAULTS, rate: -5, years: 2, monthly }).value).toBeGreaterThanOrEqual(1_999_000);
  });

  it("solves rate and initial within 1 rand of the goal", () => {
    const goal = 500_000;
    const rate = solveForRate(DEFAULTS, goal);
    const initial = solveForInitial(DEFAULTS, goal);
    expect(growthFinal({ ...DEFAULTS, rate }).value).toBeGreaterThanOrEqual(goal - 1);
    expect(growthFinal({ ...DEFAULTS, principal: initial }).value).toBeGreaterThanOrEqual(goal - 1);
  });

  it("ignores withdrawals when solving for an accumulation goal", () => {
    expect(solveForYears({ ...DEFAULTS, withdrawal: 50_000, withdrawFromYear: 0 }, 500_000)).toBe(12);
  });

  it("finds a withdrawal that does not empty the pot", () => {
    const w = solveForWithdrawal({
      principal: 500_000,
      monthly: 0,
      rate: 10,
      years: 10,
      escalation: 0,
      frequency: "once-off",
      withdrawFromYear: 0,
    });
    expect(w).toBeGreaterThan(0);
    const p = projectGrowth({
      principal: 500_000,
      monthly: 0,
      rate: 10,
      years: 10,
      escalation: 0,
      frequency: "once-off",
      withdrawal: w,
      withdrawFromYear: 0,
    });
    expect(p.depletedYear).toBeNull();
    expect(p.points[p.points.length - 1].value).toBeGreaterThan(0);
  });
});

describe("unused helpers still stay correct", () => {
  it("compounds interest", () => {
    expect(calculateCompoundInterest(1000, 12, 1, 12)).toBeCloseTo(1126.83, 2);
    expect(calculateCompoundInterest(5000, 8, 10, 4)).toBeCloseTo(11040.2, 1);
  });

  it("prices a loan", () => {
    expect(calculateLoanMonthlyPayment(100000, 12, 12)).toBeCloseTo(8884.88, 2);
    expect(calculateLoanMonthlyPayment(250000, 10.5, 60)).toBeCloseTo(5373.48, 2);
    expect(calculateLoanMonthlyPayment(120000, 0, 24)).toBe(5000);
    expect(calculateLoanMonthlyPayment(1000, 10, 0)).toBe(0);
  });
});
