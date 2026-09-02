import { describe, expect, it } from "vitest";
import {
  buildWeeklyRoster,
  isTestAccount,
  scorerCount,
} from "../leaderboardRoster";

const week = "notho-week-2026-08-30";

function row(
  id: string,
  username: string | null,
  weekly: number,
  total = weekly,
  weekKey = week
) {
  return {
    user_id: id,
    username,
    xp: total,
    weekly_xp: weekly,
    week_key: weekKey,
  };
}

describe("isTestAccount", () => {
  it("strips qa and bot handles", () => {
    expect(isTestAccount("e2e_bot")).toBe(true);
    expect(isTestAccount("qa-user")).toBe(true);
    expect(isTestAccount("Thabo")).toBe(false);
  });
});

describe("buildWeeklyRoster", () => {
  it("hides zero-XP peers and stale weeks", () => {
    const roster = buildWeeklyRoster(
      [
        row("me", "YouHandle", 546, 8091),
        row("erin", "Erin", 0, 120),
        row("old", "Sipho", 400, 400, "notho-week-2026-08-23"),
        row("thabo", "Thabo", 80, 200),
      ],
      { myId: "me", currentWeekKey: week, localWeeklyXp: 546 }
    );
    expect(roster.map((r) => r.name)).toEqual(["You", "Thabo"]);
    expect(roster[0].rank).toBe(1);
    expect(roster[1].rank).toBe(2);
  });

  it("keeps the signed-in user even at 0 XP", () => {
    const roster = buildWeeklyRoster(
      [row("me", "Kwanele", 0, 10), row("erin", "Erin", 0, 0)],
      { myId: "me", currentWeekKey: week, localWeeklyXp: 0 }
    );
    expect(roster).toHaveLength(1);
    expect(roster[0].isYou).toBe(true);
    expect(scorerCount(roster)).toBe(0);
  });

  it("never hides the signed-in test handle from themselves", () => {
    const roster = buildWeeklyRoster(
      [row("me", "e2e_bot", 20, 20), row("peer", "Thabo", 10, 10)],
      { myId: "me", currentWeekKey: week }
    );
    expect(roster.some((r) => r.isYou)).toBe(true);
  });

  it("caps the public list and still includes you", () => {
    const rows = [
      row("me", "YouHandle", 1, 1),
      ...Array.from({ length: 20 }, (_, i) => row(`u${i}`, `User${i}`, 10 + i, 10 + i)),
    ];
    const roster = buildWeeklyRoster(rows, {
      myId: "me",
      currentWeekKey: week,
      cap: 5,
    });
    expect(roster).toHaveLength(5);
    expect(roster.some((r) => r.isYou)).toBe(true);
  });
});
