import { describe, expect, it } from "vitest";
import {
  calculateCompoundInterest,
  calculateGrowth,
  calculateLoanMonthlyPayment,
  growthFinal,
  solveForInitial,
  solveForMonthly,
  solveForRate,
  solveForYears,
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
    const closed =
      50_000 * Math.pow(1 + r, n) + 1_000 * (Math.pow(1 + r, n) - 1) / r;
    const live = growthFinal({ ...DEFAULTS, escalation: 0 });
    expect(live.value).toBe(Math.round(closed));
    expect(live.contributions).toBe(170_000);
    expect(live.interest).toBe(live.value - live.contributions);
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
    expect(data[0]).toEqual({ year: 0, value: 0, contributions: 0, interest: 0 });
  });

  it("keeps value = contributions + interest after rounding", () => {
    for (const point of calculateGrowth(DEFAULTS)) {
      expect(point.value).toBe(point.contributions + point.interest);
    }
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
