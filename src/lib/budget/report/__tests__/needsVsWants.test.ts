import { describe, expect, it } from "vitest";
import { needsVsWantsSplit } from "../categories";

describe("needsVsWantsSplit", () => {
  it("excludes stokvel, business and transfers from the split", () => {
    const split = needsVsWantsSplit([
      { category: "stokvel", name: "Stokvel", amount: 22000 },
      { category: "business", name: "Business", amount: 20000 },
      { category: "transfers", name: "Transfers", amount: 2505 },
      { category: "food", name: "Food & Groceries", amount: 400 },
      { category: "entertainment", name: "Entertainment", amount: 100 },
    ]);
    expect(split.dayToDay).toBe(500);
    expect(split.needsPct).toBe(80);
    expect(split.wantsPct).toBe(20);
  });

  it("counts shopping and travel as wants, not only entertainment", () => {
    const split = needsVsWantsSplit([
      { category: "housing", amount: 5000 },
      { category: "shopping", amount: 2000 },
      { category: "travel", amount: 1000 },
    ]);
    expect(split.needs).toBe(5000);
    expect(split.wants).toBe(3000);
    expect(split.needsPct).toBe(63);
    expect(split.wantsPct).toBe(37);
  });

  it("treats a custom stokvel name as savings, not a need", () => {
    const split = needsVsWantsSplit([
      { category: "custom-1", name: "Stokvel", amount: 22000 },
      { category: "airtime", amount: 150 },
    ]);
    expect(split.needs).toBe(150);
    expect(split.wants).toBe(0);
    expect(split.needsPct).toBe(100);
    expect(split.wantsPct).toBe(0);
  });

  it("returns zeros when nothing is day-to-day", () => {
    expect(needsVsWantsSplit([{ category: "transfers", amount: 2505 }])).toEqual({
      needs: 0,
      wants: 0,
      dayToDay: 0,
      needsPct: 0,
      wantsPct: 0,
    });
  });
});
