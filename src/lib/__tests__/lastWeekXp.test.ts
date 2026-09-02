import { describe, expect, it } from "vitest";
import { rollLastWeekSlot } from "../lastWeekXp";

describe("rollLastWeekSlot", () => {
  it("starts a first week with no previous XP", () => {
    const slot = rollLastWeekSlot(null, "notho-week-2026-08-30", 546);
    expect(slot).toEqual({
      currentWeekKey: "notho-week-2026-08-30",
      currentXp: 546,
      prevWeekKey: "",
      prevXp: 0,
    });
  });

  it("updates current XP inside the same week without touching last week", () => {
    const prev = rollLastWeekSlot(null, "notho-week-2026-08-30", 100);
    const next = rollLastWeekSlot(prev, "notho-week-2026-08-30", 546);
    expect(next.prevXp).toBe(0);
    expect(next.currentXp).toBe(546);
  });

  it("rolls current into last week when the SAST key changes", () => {
    const week1 = rollLastWeekSlot(null, "notho-week-2026-08-23", 400);
    const week2 = rollLastWeekSlot(week1, "notho-week-2026-08-30", 50);
    expect(week2.prevWeekKey).toBe("notho-week-2026-08-23");
    expect(week2.prevXp).toBe(400);
    expect(week2.currentXp).toBe(50);
  });
});
