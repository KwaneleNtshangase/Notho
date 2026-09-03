/**
 * Where a learner should land when they open a course map.
 *
 * The map used to always paint from lesson 1 at the top of the page, so a
 * learner ten lessons in had to scroll to find themselves. The rule here is
 * the last lesson they have actually finished — and if they have not finished
 * any, the first lesson that has content.
 */

export type CourseCursorLesson = {
  id: string;
  steps?: unknown[];
  secureQuestionCount?: number;
};

export type CourseCursorUnit = {
  id: string;
  lessons: CourseCursorLesson[];
};

export type CourseCursorInput = {
  id: string;
  units: CourseCursorUnit[];
};

export function lessonHasContent(lesson: CourseCursorLesson): boolean {
  return (
    (Array.isArray(lesson.steps) && lesson.steps.length > 0) ||
    (lesson.secureQuestionCount ?? 0) > 0
  );
}

export function flattenCourseLessons(course: CourseCursorInput): CourseCursorLesson[] {
  return course.units.flatMap((unit) => unit.lessons);
}

/**
 * The lesson the course map should scroll to.
 *
 * - No completions yet → first lesson that has content (or first lesson).
 * - Some completions    → the last completed lesson in course order.
 * - Everything done     → the last completed lesson (end of the path).
 *
 * Completions for a different course are ignored.
 */
export function lastDoneLessonId(
  course: CourseCursorInput,
  isLessonCompleted: (courseId: string, lessonId: string) => boolean
): string | null {
  const lessons = flattenCourseLessons(course);
  if (lessons.length === 0) return null;

  let lastDone: string | null = null;
  for (const lesson of lessons) {
    if (isLessonCompleted(course.id, lesson.id)) lastDone = lesson.id;
  }
  if (lastDone) return lastDone;

  const firstContent = lessons.find(lessonHasContent);
  return firstContent?.id ?? lessons[0]?.id ?? null;
}
