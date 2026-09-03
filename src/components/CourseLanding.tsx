"use client";

import { useEffect } from "react";
import { flattenCourseLessons, lastDoneLessonId, type CourseCursorInput } from "@/lib/courseCursor";
import { applyScroll, consumeCourseFocus, hasMeaningfulScroll, readScroll } from "@/lib/scrollMemory";

/**
 * CourseView historically forced scroll-to-top on every visit. This companion
 * runs after that effect and puts the learner on the last lesson they
 * finished (Learn → Course) or on the exact map scroll they left
 * (Lesson → Course).
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
        return;
      }
      const focusId = lastDoneLessonId(course, isLessonCompleted);
      if (!focusId) return;
      const lessons = flattenCourseLessons(course);
      const index = lessons.findIndex((lesson) => lesson.id === focusId);
      if (index < 0) return;
      const nodes = document.querySelectorAll(".course-map .lesson-node");
      const node = nodes[index];
      if (!(node instanceof HTMLElement)) return;
      node.scrollIntoView({ block: "center", behavior: "instant" });
    };
    run();
    const later = window.setTimeout(run, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(later);
    };
    // isLessonCompleted is represented by doneKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, doneKey, progressReady]);

  return null;
}
