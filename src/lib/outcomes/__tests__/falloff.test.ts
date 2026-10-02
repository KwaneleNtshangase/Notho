import { describe, expect, it } from "vitest";
import { retentionMove } from "../falloff";

describe("retentionMove", () => {
  it("treats a signup with no lesson as not activated", () => {
    expect(retentionMove({ lessonsDone: 0, daysSinceSeen: 2, lastCourse: null, lastLesson: null }).where).toMatch(/never finished/);
  });

  it("stops nudging after 30 quiet days", () => {
    expect(retentionMove({ lessonsDone: 4, daysSinceSeen: 40, lastCourse: "money-basics", lastLesson: "lesson-2" }).move).toMatch(/stop/i);
  });
});
