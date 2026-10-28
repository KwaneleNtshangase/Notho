import { describe, expect, it } from "vitest";
import { defaultSpendRole, needsVsWantsSplit } from "../categories";

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
    expect(split.excluded).toBe(44505);
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

  it("lets a user move a built-in category", () => {
    const split = needsVsWantsSplit(
      [
        { category: "shopping", name: "Shopping", amount: 2000 },
        { category: "business", name: "Business", amount: 8000 },
      ],
      { shopping: "need", business: "want" },
    );
    expect(split.needs).toBe(2000);
    expect(split.wants).toBe(8000);
    expect(split.excluded).toBe(0);
    expect(split.needsPct).toBe(20);
    expect(split.wantsPct).toBe(80);
  });

  it("suggests out for a stokvel name and need for rent", () => {
    expect(defaultSpendRole("custom-1", "Stokvel")).toBe("out");
    expect(defaultSpendRole("custom-2", "Rent")).toBe("need");
    expect(defaultSpendRole("custom-3", "Netflix")).toBe("want");
  });
});
