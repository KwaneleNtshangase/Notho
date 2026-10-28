/**
 * Pick the lesson a tap on a reminder should open.
 *
 * Order:
 *   1. Mid-lesson resume, if it is still unfinished.
 *   2. Next unfinished lesson in the course they were last in.
 *   3. First unfinished lesson in a pinned course (pin order).
 *   4. First lesson of Money Basics.
 */

export type CatalogLesson = { id: string; title: string; comingSoon?: boolean };
export type CatalogCourse = { id: string; title: string; units: { lessons: CatalogLesson[] }[] };

export type NextLesson = {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  url: string;
};

export function lessonKey(courseId: string, lessonId: string): string {
  return `${courseId}:${lessonId}`;
}

export function isLessonDone(
  completed: readonly string[],
  courseId: string,
  lessonId: string
): boolean {
  const keys = new Set(completed);
  return (
    keys.has(lessonKey(courseId, lessonId)) ||
    keys.has(`${courseId}/${lessonId}`) ||
    keys.has(lessonId)
  );
}

export function flattenCourse(course: CatalogCourse): CatalogLesson[] {
  return course.units.flatMap((u) => u.lessons).filter((l) => !l.comingSoon);
}

function firstUnfinished(course: CatalogCourse, completed: readonly string[]): CatalogLesson | null {
  return flattenCourse(course).find((l) => !isLessonDone(completed, course.id, l.id)) ?? null;
}

export function resolveNextLesson(input: {
  courses: CatalogCourse[];
  completedLessons?: readonly string[] | null;
  pinnedCourseIds?: readonly string[] | null;
  resume?: { courseId?: string; lessonId?: string; cleared?: boolean } | null;
}): NextLesson {
  const courses = input.courses;
  const completed = input.completedLessons ?? [];
  const byId = new Map(courses.map((c) => [c.id, c]));

  const resume = input.resume && !input.resume.cleared ? input.resume : null;
  if (resume?.courseId && resume.lessonId) {
    const course = byId.get(resume.courseId);
    const lesson = course && flattenCourse(course).find((l) => l.id === resume.lessonId);
    if (course && lesson && !isLessonDone(completed, course.id, lesson.id)) {
      return pack(course, lesson);
    }
  }

  const lastPair = lastCompletedPair(completed, courses);
  if (lastPair) {
    const course = byId.get(lastPair.courseId);
    if (course) {
      const lessons = flattenCourse(course);
      const idx = lessons.findIndex((l) => l.id === lastPair.lessonId);
      const next = (idx >= 0 ? lessons.slice(idx + 1) : lessons).find(
        (l) => !isLessonDone(completed, course.id, l.id)
      );
      if (next) return pack(course, next);
    }
  }

  for (const id of input.pinnedCourseIds ?? []) {
    const course = byId.get(id);
    if (!course) continue;
    const next = firstUnfinished(course, completed);
    if (next) return pack(course, next);
  }

  const fallback = courses[0] ?? { id: "money-basics", title: "Money Basics", units: [{ lessons: [{ id: "lesson-1", title: "What is Money?" }] }] };
  const next = firstUnfinished(fallback, completed) ?? flattenCourse(fallback)[0] ?? {
    id: "lesson-1",
    title: "What is Money?",
  };
  return pack(fallback, next);
}

function lastCompletedPair(
  completed: readonly string[],
  courses: CatalogCourse[]
): { courseId: string; lessonId: string } | null {
  for (let i = completed.length - 1; i >= 0; i--) {
    const raw = completed[i] ?? "";
    const colon = raw.indexOf(":");
    const slash = raw.indexOf("/");
    const cut = colon >= 0 ? colon : slash;
    if (cut > 0) {
      return { courseId: raw.slice(0, cut), lessonId: raw.slice(cut + 1) };
    }
    for (const c of courses) {
      if (flattenCourse(c).some((l) => l.id === raw)) {
        return { courseId: c.id, lessonId: raw };
      }
    }
  }
  return null;
}

function pack(course: CatalogCourse, lesson: CatalogLesson): NextLesson {
  return {
    courseId: course.id,
    courseTitle: course.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    url: `/lesson/${course.id}/${lesson.id}`,
  };
}
