import { describe, it, expect } from "vitest";
import {
  yesterdayOf,
  streakAtRiskPush,
  coachAlertPush,
  leaderboardDefencePush,
  routinePush,
  pickPush,
  isQuietHoursSAST,
  is23hAfterLastLesson,
} from "../triggers";

const next = { lessonTitle: "Needs vs Wants", courseTitle: "Money Basics", url: "/lesson/money-basics/lesson-2" };

describe("yesterdayOf", () => {
  it("handles normal days and month boundaries", () => {
    expect(yesterdayOf("2026-07-12")).toBe("2026-07-11");
    expect(yesterdayOf("2026-07-01")).toBe("2026-06-30");
    expect(yesterdayOf("2026-01-01")).toBe("2025-12-31");
  });
});

describe("isQuietHoursSAST", () => {
  it("is quiet overnight and early morning", () => {
    expect(isQuietHoursSAST(new Date("2026-07-12T19:30:00Z"))).toBe(true); // 21:30 SAST
    expect(isQuietHoursSAST(new Date("2026-07-12T05:00:00Z"))).toBe(true); // 07:00 SAST
  });
  it("is open during the day", () => {
    expect(isQuietHoursSAST(new Date("2026-07-12T11:00:00Z"))).toBe(false); // 13:00 SAST
    expect(isQuietHoursSAST(new Date("2026-07-12T16:00:00Z"))).toBe(false); // 18:00 SAST
  });
});

describe("is23hAfterLastLesson", () => {
  const now = new Date("2026-07-12T14:00:00Z"); // 16:00 SAST
  const twentyThreeAgo = new Date(now.getTime() - 23 * 3_600_000).toISOString();
  const tenAgo = new Date(now.getTime() - 10 * 3_600_000).toISOString();
  const thirtyAgo = new Date(now.getTime() - 30 * 3_600_000).toISOString();

  it("is true once 23 hours have passed", () => {
    expect(is23hAfterLastLesson(twentyThreeAgo, "2026-07-11", "2026-07-12", now)).toBe(true);
    expect(is23hAfterLastLesson(thirtyAgo, "2026-07-11", "2026-07-12", now)).toBe(true);
  });
  it("is false too early or already done today", () => {
    expect(is23hAfterLastLesson(tenAgo, "2026-07-11", "2026-07-12", now)).toBe(false);
    expect(is23hAfterLastLesson(twentyThreeAgo, "2026-07-12", "2026-07-12", now)).toBe(false);
  });
  it("falls back to yesterday when only a civil date exists", () => {
    expect(is23hAfterLastLesson(null, "2026-07-11", "2026-07-12", now)).toBe(true);
    expect(is23hAfterLastLesson(null, "2026-07-12", "2026-07-12", now)).toBe(false);
  });
});

describe("streakAtRiskPush", () => {
  const now = new Date("2026-07-12T14:00:00Z");
  const lastAt = new Date(now.getTime() - 23 * 3_600_000).toISOString();

  it("fires for a 2+ streak ~23h after yesterday's lesson", () => {
    const p = streakAtRiskPush(7, "2026-07-11", "2026-07-12", next, null, lastAt, now);
    expect(p).not.toBeNull();
    expect(p!.key).toBe("streak:2026-07-12");
    expect(p!.url).toBe(next.url);
    expect(p!.body).toContain("Needs vs Wants");
  });

  it("personalizes the title when a name is given", () => {
    const p = streakAtRiskPush(7, "2026-07-11", "2026-07-12", next, "Kwanele", lastAt, now);
    expect(p).not.toBeNull();
    expect(p!.title).toBe("Save your streak, Kwanele!");
  });

  it("skips a one-day streak", () => {
    expect(streakAtRiskPush(1, "2026-07-11", "2026-07-12", next, null, lastAt, now)).toBeNull();
  });

  it("skips users already active today", () => {
    expect(streakAtRiskPush(7, "2026-07-12", "2026-07-12", next, null, lastAt, now)).toBeNull();
  });

  it("skips already-broken streaks", () => {
    expect(streakAtRiskPush(7, "2026-07-09", "2026-07-12", next, null, lastAt, now)).toBeNull();
    expect(streakAtRiskPush(7, null, "2026-07-12", next, null, null, now)).toBeNull();
  });
});

describe("routinePush", () => {
  const now = new Date("2026-07-12T14:00:00Z");
  const lastAt = new Date(now.getTime() - 23 * 3_600_000).toISOString();

  it("fires when ~23h after yesterday and no lesson today", () => {
    const p = routinePush("2026-07-11", "2026-07-12", next, lastAt, now);
    expect(p).not.toBeNull();
    expect(p!.key).toBe("routine:2026-07-12");
    expect(p!.url).toBe(next.url);
  });

  it("stays quiet after today's lesson", () => {
    expect(routinePush("2026-07-12", "2026-07-12", next, lastAt, now)).toBeNull();
  });

  it("stops after a quiet week", () => {
    expect(routinePush("2026-07-01", "2026-07-12", next, lastAt, now)).toBeNull();
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
    const now = new Date("2026-07-12T14:00:00Z");
    const lastAt = new Date(now.getTime() - 23 * 3_600_000).toISOString();
    const streak = streakAtRiskPush(5, "2026-07-11", "2026-07-12", next, null, lastAt, now);
    const routine = routinePush("2026-07-11", "2026-07-12", next, lastAt, now);
    expect(pickPush([streak, routine])!.key).toBe("streak:2026-07-12");
    expect(pickPush([null, routine])!.key).toBe("routine:2026-07-12");
    expect(pickPush([null, null, null])).toBeNull();
  });
});
