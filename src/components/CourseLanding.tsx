"use client";

import { useEffect } from "react";
import { lastDoneLessonId, type CourseCursorInput } from "@/lib/courseCursor";
import { applyScroll, consumeCourseFocus, hasMeaningfulScroll, readScroll } from "@/lib/scrollMemory";

/**
 * Learn → Course: last completed lesson centered.
 * Lesson → Course: exact map scroll from when the lesson was opened.
 */
export function CourseLanding({
  course,
  isLessonCompleted,
  progressReady,
}: {
  course: CourseCursorInput;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  progressReady: boolean;
}) {
  const doneKey = course.units
    .flatMap((unit) => unit.lessons)
    .filter((lesson) => isLessonCompleted(course.id, lesson.id))
    .map((lesson) => lesson.id)
    .join(",");

  useEffect(() => {
    if (!progressReady) return;
    const fromLearn = consumeCourseFocus(course.id);
    const saved = readScroll(`/course/${course.id}`);

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (!fromLearn && hasMeaningfulScroll(saved) && saved) {
        applyScroll(saved);
        return true;
      }
      const focusId = lastDoneLessonId(course, isLessonCompleted);
      if (!focusId) return true;
      const node = document.querySelector(
        `.course-map .lesson-node[data-lesson-id="${CSS.escape(focusId)}"]`
      );
      if (!(node instanceof HTMLElement)) return false;
      node.scrollIntoView({ block: "center", behavior: "instant" });
      return true;
    };

    run();
    const delays = [50, 150, 350, 700];
    const timers = delays.map((ms) => window.setTimeout(run, ms));
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, doneKey, progressReady]);

  return null;
}
