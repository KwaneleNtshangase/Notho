import { describe, expect, it } from "vitest";
import {
  STREAK_FREEZE_COST,
  STREAK_FREEZE_MAX,
  freezeBuyBlock,
  freezeBuyLabel,
  freezeStatusLine,
} from "../streakFreeze";

describe("streak freeze shop", () => {
  it("blocks a buy at the equipped cap", () => {
    expect(freezeBuyBlock(STREAK_FREEZE_MAX, 500, true)).toBe("full");
    expect(freezeBuyLabel("full")).toBe("2 equipped");
  });

  it("blocks a buy without enough XP", () => {
    expect(freezeBuyBlock(0, STREAK_FREEZE_COST - 1, true)).toBe("xp");
    expect(freezeBuyLabel("xp")).toContain(String(STREAK_FREEZE_COST));
  });

  it("allows a buy when signed in, under the cap, and able to pay", () => {
    expect(freezeBuyBlock(1, STREAK_FREEZE_COST, true)).toBe("ok");
  });
});

describe("streak freeze status", () => {
  it("does not claim a freeze was used just because a lesson was done", () => {
    expect(freezeStatusLine({ freezeCount: 2, lessonsToday: 1, streak: 4 })).toMatch(/No freeze used/);
  });

  it("says an equipped freeze applies on its own", () => {
    expect(freezeStatusLine({ freezeCount: 1, lessonsToday: 0, streak: 4 })).toMatch(/automatically/);
  });

  it("keeps freezes in pocket when there is no live streak", () => {
    expect(freezeStatusLine({ freezeCount: 1, lessonsToday: 0, streak: 0 })).toMatch(/pocket/);
  });
});
