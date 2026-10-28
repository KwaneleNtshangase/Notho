import { describe, expect, it } from "vitest";
import {
  callPair,
  sinceJoining,
  spendBucket,
  summariseCheck,
  windowSpend,
  type BudgetSpendRow,
  type LessonDone,
} from "../spendHabits";

function row(
  partial: Partial<BudgetSpendRow> & Pick<BudgetSpendRow, "entryDate" | "amount" | "category">
): BudgetSpendRow {
  return {
    userId: "u1",
    type: "expense",
    isTransfer: false,
    ...partial,
  };
}

describe("spend habits", () => {
  it("keeps transfers and custom categories out of wants", () => {
    expect(spendBucket({ type: "expense", category: "entertainment", isTransfer: false })).toBe("want");
    expect(spendBucket({ type: "expense", category: "food", isTransfer: false })).toBe("need");
    expect(spendBucket({ type: "expense", category: "transfers", isTransfer: false })).toBe("transfer");
    expect(spendBucket({ type: "expense", category: "food", isTransfer: true })).toBe("transfer");
    expect(spendBucket({ type: "expense", category: "custom-uuid", isTransfer: false })).toBe("uncategorised");
  });

  it("calls wants improved only when both windows are comparable", () => {
    const rows: BudgetSpendRow[] = [
      row({ entryDate: "2026-01-02", amount: 400, category: "food" }),
      row({ entryDate: "2026-01-03", amount: 400, category: "entertainment" }),
      row({ entryDate: "2026-01-04", amount: 100, category: "shopping" }),
      row({ entryDate: "2026-01-05", amount: 100, category: "transport" }),
      row({ entryDate: "2026-01-20", amount: 800, category: "food" }),
      row({ entryDate: "2026-01-21", amount: 50, category: "entertainment" }),
      row({ entryDate: "2026-01-22", amount: 50, category: "transport" }),
      row({ entryDate: "2026-01-23", amount: 50, category: "housing" }),
    ];
    const before = windowSpend(rows, "2026-01-01", "2026-01-16");
    const after = windowSpend(rows, "2026-01-16", "2026-01-31");
    const call = callPair(before, after);
    expect(call.verdict).toBe("improved");
    expect(call.wantShareDeltaPp).toBeLessThan(0);
  });

  it("refuses a verdict when the after window is a single shop", () => {
    const rows = [row({ entryDate: "2026-02-02", amount: 500, category: "shopping" })];
    const call = callPair(windowSpend(rows, "2026-01-01", "2026-02-01"), windowSpend(rows, "2026-02-01", "2026-03-01"));
    expect(call.verdict).toBe("insufficient");
  });

  it("ties Needs vs Wants to the first completion, not a later replay", () => {
    const done: LessonDone[] = [
      { userId: "u1", courseId: "money-basics", lessonId: "lesson-2", completedAt: "2026-03-01T08:00:00Z" },
      { userId: "u1", courseId: "money-basics", lessonId: "lesson-2", completedAt: "2026-04-01T08:00:00Z" },
    ];
    const rows: BudgetSpendRow[] = [];
    for (let i = 0; i < 5; i++) {
      rows.push(row({ entryDate: `2026-02-${10 + i}`, amount: 200, category: "entertainment" }));
      rows.push(row({ entryDate: `2026-03-${10 + i}`, amount: 200, category: "food" }));
    }
    const summary = summariseCheck(
      { id: "needs-vs-wants", label: "Needs vs Wants", courseId: "money-basics", lessonId: "lesson-2" },
      done,
      new Map([["u1", rows]]),
      new Map([["u1", "kwanele"]]),
      "2026-04-15"
    );
    expect(summary.finished).toBe(1);
    expect(summary.pairs[0].completedAt).toContain("2026-03-01");
    expect(summary.improved).toBe(1);
  });

  it("does not compare overlapping join windows", () => {
    const call = sinceJoining("u1", "2026-09-20", [], "2026-10-02", null);
    expect(call.call.verdict).toBe("insufficient");
  });
});
