import { describe, it, expect } from "vitest";
import {
  yesterdayOf,
  streakAtRiskPush,
  coachAlertPush,
  leaderboardDefencePush,
  routinePush,
  pickPush,
} from "../triggers";

const next = { lessonTitle: "Needs vs Wants", courseTitle: "Money Basics", url: "/lesson/money-basics/lesson-2" };

describe("yesterdayOf", () => {
  it("handles normal days and month boundaries", () => {
    expect(yesterdayOf("2026-07-12")).toBe("2026-07-11");
    expect(yesterdayOf("2026-07-01")).toBe("2026-06-30");
    expect(yesterdayOf("2026-01-01")).toBe("2025-12-31");
  });
});

describe("streakAtRiskPush", () => {
  it("fires for a 2+ streak last active yesterday", () => {
    const p = streakAtRiskPush(7, "2026-07-11", "2026-07-12", next);
    expect(p).not.toBeNull();
    expect(p!.key).toBe("streak:2026-07-12");
    expect(p!.url).toBe(next.url);
    expect(p!.body).toContain("Needs vs Wants");
  });

  it("skips a one-day streak", () => {
    expect(streakAtRiskPush(1, "2026-07-11", "2026-07-12", next)).toBeNull();
  });

  it("skips users already active today", () => {
    expect(streakAtRiskPush(7, "2026-07-12", "2026-07-12", next)).toBeNull();
  });

  it("skips already-broken streaks", () => {
    expect(streakAtRiskPush(7, "2026-07-09", "2026-07-12", next)).toBeNull();
    expect(streakAtRiskPush(7, null, "2026-07-12", next)).toBeNull();
  });
});

describe("routinePush", () => {
  it("fires when they have not learned today", () => {
    const p = routinePush("2026-07-11", "2026-07-12", next);
    expect(p).not.toBeNull();
    expect(p!.key).toBe("routine:2026-07-12");
    expect(p!.url).toBe(next.url);
  });

  it("stays quiet after today's lesson", () => {
    expect(routinePush("2026-07-12", "2026-07-12", next)).toBeNull();
  });

  it("stops after a quiet week", () => {
    expect(routinePush("2026-07-01", "2026-07-12", next)).toBeNull();
  });
});

describe("coachAlertPush", () => {
  it("fires only for alert severity and reuses the insight id as key", () => {
    const p = coachAlertPush({ id: "over-budget:food:2026-07", severity: "alert", title: "Food & Groceries is over budget" });
    expect(p).not.toBeNull();
    expect(p!.key).toBe("over-budget:food:2026-07");
    expect(coachAlertPush({ id: "x", severity: "warn", title: "t" })).toBeNull();
    expect(coachAlertPush(undefined)).toBeNull();
  });
});

describe("leaderboardDefencePush", () => {
  it("still returns a parked payload so old tests have a shape", () => {
    const p = leaderboardDefencePush(2, 90, "2026-W28", true);
    expect(p).not.toBeNull();
    expect(p!.url).toBe("/learn");
  });

  it("skips non-Saturdays, low ranks and zero-XP users", () => {
    expect(leaderboardDefencePush(2, 90, "2026-W28", false)).toBeNull();
    expect(leaderboardDefencePush(11, 90, "2026-W28", true)).toBeNull();
    expect(leaderboardDefencePush(3, 0, "2026-W28", true)).toBeNull();
  });
});

describe("pickPush", () => {
  it("returns the first non-null candidate (priority order)", () => {
    const streak = streakAtRiskPush(5, "2026-07-11", "2026-07-12", next);
    const routine = routinePush("2026-07-11", "2026-07-12", next);
    expect(pickPush([streak, routine])!.key).toBe("streak:2026-07-12");
    expect(pickPush([null, routine])!.key).toBe("routine:2026-07-12");
    expect(pickPush([null, null, null])).toBeNull();
  });
});
