import { describe, expect, it } from "vitest";
import { cardHasCaption, duoCardCopy } from "../../lib/duoShareCard";

describe("duo share card", () => {
  it("keeps the caption off the lesson card", () => {
    const copy = duoCardCopy({
      type: "lesson",
      lessonTitle: "What is Money?",
      xpEarned: 80,
      isPerfect: false,
    });
    expect(copy.eyebrow).toBe("LESSON COMPLETE");
    expect(copy.title).toBe("What is Money?");
    expect(copy.number).toBe("+80 XP");
    expect(copy.footnote).toBe("");
    expect(cardHasCaption(copy)).toBe(false);
  });

  it("marks a perfect lesson without a marketing line", () => {
    const copy = duoCardCopy({
      type: "lesson",
      lessonTitle: "What is Money?",
      xpEarned: 90,
      isPerfect: true,
    });
    expect(copy.eyebrow).toBe("PERFECT LESSON");
    expect(copy.footnote).toBe("no misses");
    expect(cardHasCaption(copy)).toBe(false);
  });

  it("uses one number for a streak card", () => {
    const copy = duoCardCopy({ type: "streak", streakDays: 7 });
    expect(copy.number).toBe("7");
    expect(copy.footnote).toBe("day streak");
    expect(cardHasCaption(copy)).toBe(false);
  });
});
