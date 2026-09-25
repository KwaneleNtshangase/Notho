import { describe, expect, it } from "vitest";
import {
  addSastDays,
  applyLessonToStreak,
  evaluateStreak,
  normaliseSastDay,
  sastDateDiffDays,
} from "../dates";

describe("normaliseSastDay", () => {
  it("keeps a civil date", () => {
    expect(normaliseSastDay("2026-09-24")).toBe("2026-09-24");
  });

  it("strips a Postgres / ISO timestamp so day-diff cannot round to 0", () => {
    expect(normaliseSastDay("2026-09-24T00:00:00.000Z")).toBe("2026-09-24");
    expect(normaliseSastDay("2026-09-24T22:00:00.000Z")).toBe("2026-09-24");
    expect(normaliseSastDay("2026-09-24 00:00:00+00")).toBe("2026-09-24");
  });
});

describe("sastDateDiffDays", () => {
  it("counts civil days, not instants", () => {
    expect(sastDateDiffDays("2026-09-25", "2026-09-24")).toBe(1);
    expect(sastDateDiffDays("2026-09-25", "2026-09-24T22:00:00.000Z")).toBe(1);
    expect(sastDateDiffDays("2026-09-25", "2026-09-22")).toBe(3);
  });
});

describe("evaluateStreak (open-app reconcile, no increment)", () => {
  it("leaves a live streak alone when last activity was yesterday", () => {
    expect(evaluateStreak(5, 2, "2026-09-24", "2026-09-25")).toEqual({
      streak: 5,
      freezeCount: 2,
      lastActivityDate: "2026-09-24",
    });
  });

  it("consumes one freeze per missed day and stamps yesterday of currentDate", () => {
    expect(evaluateStreak(5, 2, "2026-09-22", "2026-09-25")).toEqual({
      streak: 5,
      freezeCount: 0,
      lastActivityDate: "2026-09-24",
    });
  });

  it("breaks the streak when freezes cannot cover the gap", () => {
    expect(evaluateStreak(5, 1, "2026-09-22", "2026-09-25")).toEqual({
      streak: 0,
      freezeCount: 1,
      lastActivityDate: "2026-09-22",
    });
  });
});

describe("applyLessonToStreak (Duolingo increment rules)", () => {
  it("starts a new learner at 1", () => {
    const next = applyLessonToStreak(0, 0, null, "2026-09-25");
    expect(next).toMatchObject({ streak: 1, lastActivityDate: "2026-09-25", extended: true });
  });

  it("is idempotent on a second lesson the same SAST day", () => {
    const first = applyLessonToStreak(5, 2, "2026-09-24", "2026-09-25");
    expect(first.streak).toBe(6);
    const second = applyLessonToStreak(first.streak, first.freezeCount, first.lastActivityDate, "2026-09-25");
    expect(second).toMatchObject({ streak: 6, lastActivityDate: "2026-09-25", extended: false });
  });

  it("increments by exactly one after freeze-covered missed days", () => {
    const next = applyLessonToStreak(5, 2, "2026-09-22", "2026-09-25");
    expect(next).toMatchObject({
      streak: 6,
      freezeCount: 0,
      lastActivityDate: "2026-09-25",
      extended: true,
    });
  });

  it("starts at 1 when the gap is bigger than the freeze stock", () => {
    const next = applyLessonToStreak(5, 0, "2026-09-22", "2026-09-25");
    expect(next).toMatchObject({ streak: 1, freezeCount: 0, lastActivityDate: "2026-09-25" });
  });

  it("still increments when last_activity arrives as an ISO timestamp", () => {
    const next = applyLessonToStreak(5, 0, "2026-09-24T22:00:00.000Z", "2026-09-25");
    expect(next.streak).toBe(6);
    expect(next.extended).toBe(true);
  });

  it("walks consecutive days the way Duo does", () => {
    let snap = { streak: 1, freezeCount: 0, lastActivityDate: "2026-09-20" as string | null };
    for (let i = 1; i <= 4; i++) {
      const day = addSastDays("2026-09-20", i);
      snap = applyLessonToStreak(snap.streak, snap.freezeCount, snap.lastActivityDate, day);
    }
    expect(snap.streak).toBe(5);
    expect(snap.lastActivityDate).toBe("2026-09-24");
  });
});
