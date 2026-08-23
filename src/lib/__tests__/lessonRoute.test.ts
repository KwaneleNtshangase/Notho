import { describe, it, expect } from "vitest";
import {
  lessonLocationFromPath,
  courseIdFromPath,
  isLessonPath,
  belongsToLocation,
  courseHref,
  lessonHref,
  exitHrefForLesson,
} from "@/lib/lessonRoute";

describe("lessonLocationFromPath", () => {
  it("reads the lesson out of a lesson URL", () => {
    expect(lessonLocationFromPath("/lesson/money-basics/lesson-2")).toEqual({
      courseId: "money-basics",
      lessonId: "lesson-2",
    });
  });

  it("tolerates a trailing slash and a query string", () => {
    expect(lessonLocationFromPath("/lesson/money-basics/lesson-2/")).toEqual({
      courseId: "money-basics",
      lessonId: "lesson-2",
    });
    expect(lessonLocationFromPath("/lesson/money-basics/lesson-2?from=learn")).toEqual({
      courseId: "money-basics",
      lessonId: "lesson-2",
    });
  });

  it("decodes percent-encoded segments", () => {
    expect(lessonLocationFromPath("/lesson/re5%2Dexam/lesson%2D1")).toEqual({
      courseId: "re5-exam",
      lessonId: "lesson-1",
    });
  });

  it("is null for every non-lesson path", () => {
    for (const p of [
      "/",
      "/learn",
      "/course/money-basics",
      "/lesson",
      "/lesson/money-basics",
      "/budget",
      null,
      undefined,
      "",
    ]) {
      expect(lessonLocationFromPath(p)).toBeNull();
    }
  });

  it("does not treat a deeper path as the lesson itself", () => {
    // A future /lesson/a/b/summary is a DIFFERENT screen. Reading it as the
    // lesson is how two screens end up live at once.
    expect(lessonLocationFromPath("/lesson/money-basics/lesson-2/summary")).toBeNull();
  });
});

describe("courseIdFromPath", () => {
  it("reads the course out of a course URL", () => {
    expect(courseIdFromPath("/course/money-basics")).toBe("money-basics");
  });

  it("is null elsewhere", () => {
    expect(courseIdFromPath("/lesson/money-basics/lesson-1")).toBeNull();
    expect(courseIdFromPath("/course")).toBeNull();
    expect(courseIdFromPath("/learn")).toBeNull();
  });
});

describe("isLessonPath", () => {
  it("is true only on a lesson URL", () => {
    expect(isLessonPath("/lesson/a/b")).toBe(true);
    expect(isLessonPath("/course/a")).toBe(false);
    expect(isLessonPath("/learn")).toBe(false);
  });
});

describe("belongsToLocation", () => {
  const here = { courseId: "money-basics", lessonId: "lesson-2" };

  it("accepts a record for exactly this lesson", () => {
    expect(belongsToLocation({ courseId: "money-basics", lessonId: "lesson-2" }, here)).toBe(true);
  });

  it("rejects the previous lesson of the SAME course", () => {
    // This is the "Continue to next lesson" case: same course, new lesson. The
    // stale state used to survive it and render the finished lesson again.
    expect(belongsToLocation({ courseId: "money-basics", lessonId: "lesson-1" }, here)).toBe(false);
  });

  it("rejects the same lesson id in a different course", () => {
    expect(belongsToLocation({ courseId: "salary-payslip", lessonId: "lesson-2" }, here)).toBe(false);
  });

  it("rejects empty, null and half-populated records", () => {
    expect(belongsToLocation(null, here)).toBe(false);
    expect(belongsToLocation(undefined, here)).toBe(false);
    expect(belongsToLocation({ courseId: null, lessonId: null }, here)).toBe(false);
    expect(belongsToLocation({ courseId: "money-basics", lessonId: null }, here)).toBe(false);
  });

  it("rejects everything when the URL is not on a lesson", () => {
    // On /course/... or /learn nothing is 'the current lesson', so no lesson
    // state and no summary may render.
    expect(belongsToLocation({ courseId: "money-basics", lessonId: "lesson-2" }, null)).toBe(false);
  });
});

describe("hrefs", () => {
  it("builds course and lesson hrefs", () => {
    expect(courseHref("money-basics")).toBe("/course/money-basics");
    expect(lessonHref("money-basics", "lesson-2")).toBe("/lesson/money-basics/lesson-2");
  });

  it("round-trips through the parsers", () => {
    expect(courseIdFromPath(courseHref("money-basics"))).toBe("money-basics");
    expect(lessonLocationFromPath(lessonHref("money-basics", "lesson-2"))).toEqual({
      courseId: "money-basics",
      lessonId: "lesson-2",
    });
  });
});

describe("exitHrefForLesson", () => {
  it("prefers the course in the URL over anything held in memory", () => {
    // The whole point: Leave must work when in-memory state is stale. Here the
    // URL says money-basics while memory still says the previous course.
    expect(exitHrefForLesson("/lesson/money-basics/lesson-2", "salary-payslip")).toBe(
      "/course/money-basics"
    );
  });

  it("falls back to the supplied course when the URL has none", () => {
    expect(exitHrefForLesson("/learn", "money-basics")).toBe("/course/money-basics");
  });

  it("never returns nowhere", () => {
    expect(exitHrefForLesson(null, null)).toBe("/learn");
    expect(exitHrefForLesson("/learn", undefined)).toBe("/learn");
  });
});
