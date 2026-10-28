import { describe, expect, it } from "vitest";
import {
  lastDoneLessonId,
  lessonHasContent,
  type CourseCursorInput,
} from "../courseCursor";

const course = (over: Partial<CourseCursorInput> = {}): CourseCursorInput => ({
  id: "money-basics",
  units: [
    {
      id: "u1",
      lessons: [
        { id: "l1", steps: [{ t: 1 }] },
        { id: "l2", steps: [{ t: 1 }] },
        { id: "l3", steps: [] },
        { id: "l4", steps: [{ t: 1 }] },
      ],
    },
    {
      id: "u2",
      lessons: [
        { id: "l5", steps: [{ t: 1 }] },
        { id: "l6", secureQuestionCount: 10 },
      ],
    },
  ],
  ...over,
});

const done = (...ids: string[]) => {
  const set = new Set(ids.map((id) => `money-basics:${id}`));
  return (courseId: string, lessonId: string) => set.has(`${courseId}:${lessonId}`);
};

describe("lessonHasContent", () => {
  it("treats authored steps and secure mocks as content, empty steps as not", () => {
    expect(lessonHasContent({ id: "a", steps: [{ t: 1 }] })).toBe(true);
    expect(lessonHasContent({ id: "b", secureQuestionCount: 5 })).toBe(true);
    expect(lessonHasContent({ id: "c", steps: [] })).toBe(false);
    expect(lessonHasContent({ id: "d" })).toBe(false);
  });
});

describe("lastDoneLessonId", () => {
  it("lands on the first content lesson when nothing is completed", () => {
    expect(lastDoneLessonId(course(), done())).toBe("l1");
  });

  it("lands on the last completed lesson, not the first lesson of the course", () => {
    expect(lastDoneLessonId(course(), done("l1", "l2"))).toBe("l2");
  });

  it("walks past a coming-soon hole and still reports the last finished one", () => {
    expect(lastDoneLessonId(course(), done("l1", "l2", "l4"))).toBe("l4");
  });

  it("can land in a later unit", () => {
    expect(lastDoneLessonId(course(), done("l1", "l2", "l4", "l5"))).toBe("l5");
  });

  it("lands on the last lesson when the course is finished", () => {
    expect(lastDoneLessonId(course(), done("l1", "l2", "l4", "l5", "l6"))).toBe("l6");
  });

  it("ignores completions that belong to a different course", () => {
    const isDone = (courseId: string, lessonId: string) =>
      courseId === "other" && lessonId === "l5";
    expect(lastDoneLessonId(course(), isDone)).toBe("l1");
  });

  it("returns null for an empty course", () => {
    expect(lastDoneLessonId({ id: "empty", units: [] }, done())).toBeNull();
  });
});
