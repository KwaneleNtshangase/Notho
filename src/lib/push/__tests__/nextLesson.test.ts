import { describe, it, expect } from "vitest";
import { isLessonDone, resolveNextLesson, type CatalogCourse } from "../nextLesson";

const courses: CatalogCourse[] = [
  {
    id: "money-basics",
    title: "Money Basics",
    units: [{ lessons: [{ id: "lesson-1", title: "What is Money?" }, { id: "lesson-2", title: "Needs vs Wants" }] }],
  },
  {
    id: "investing-basics",
    title: "Investing",
    units: [{ lessons: [{ id: "lesson-1", title: "Why invest" }, { id: "lesson-2", title: "ETFs" }] }],
  },
];

describe("resolveNextLesson", () => {
  it("opens a live resume", () => {
    const n = resolveNextLesson({
      courses,
      resume: { courseId: "investing-basics", lessonId: "lesson-2" },
    });
    expect(n.url).toBe("/lesson/investing-basics/lesson-2");
    expect(n.lessonTitle).toBe("ETFs");
  });

  it("skips a finished resume and takes the next in that course", () => {
    const n = resolveNextLesson({
      courses,
      completedLessons: ["investing-basics:lesson-1"],
      resume: { courseId: "investing-basics", lessonId: "lesson-1" },
    });
    expect(n.lessonId).toBe("lesson-2");
    expect(n.courseId).toBe("investing-basics");
  });

  it("uses pinned courses when there is no resume", () => {
    const n = resolveNextLesson({
      courses,
      pinnedCourseIds: ["investing-basics"],
      completedLessons: [],
    });
    expect(n.courseId).toBe("investing-basics");
    expect(n.lessonId).toBe("lesson-1");
  });

  it("falls back to the first catalog course", () => {
    const n = resolveNextLesson({ courses, completedLessons: [] });
    expect(n.courseId).toBe("money-basics");
    expect(n.lessonId).toBe("lesson-1");
  });
});

describe("isLessonDone", () => {
  it("accepts course:lesson and bare ids", () => {
    expect(isLessonDone(["money-basics:lesson-1"], "money-basics", "lesson-1")).toBe(true);
    expect(isLessonDone(["lesson-1"], "money-basics", "lesson-1")).toBe(true);
    expect(isLessonDone(["other:lesson-1"], "money-basics", "lesson-1")).toBe(false);
  });
});
