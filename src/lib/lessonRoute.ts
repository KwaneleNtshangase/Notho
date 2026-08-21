/**
 * Who owns "where am I".
 *
 * Before this module there were three answers to that question and they were
 * allowed to disagree:
 *
 *   1. `usePathname()`      — what Next.js is actually rendering.
 *   2. `route` in useNothoState — a parallel React copy written by setRoute at
 *      the same time as router.push, and read by nothing outside that hook.
 *   3. `currentLessonState` / `lessonSummary` — global, un-scoped to any URL,
 *      yet used by the lesson page to pick which screen to show.
 *
 * router.push is asynchronous; a setState is not. So every navigation opened a
 * window in which (3) still described the lesson you had just left while (1)
 * was still on its way to the next page — and the lesson page, reading (3),
 * happily re-rendered the finished lesson's "Lesson Complete!" screen, finish
 * button and all. Tapping it re-entered finalize, which cancelled the exit and
 * restarted the clock. That is the deadlock.
 *
 * The rule this module encodes: **the URL is the owner.** A lesson state or a
 * lesson summary is only real while the URL still points at the lesson it
 * belongs to. Everything else is a cache of the URL, never a rival to it.
 *
 * Pure and DOM-free on purpose, so the rule is unit-testable without a browser
 * or a React renderer.
 */

/** The lesson the URL is currently pointing at. */
export type LessonLocation = { courseId: string; lessonId: string };

/** Anything that claims to belong to one lesson — lesson state, or a summary. */
export type LessonScoped = {
  courseId?: string | null;
  lessonId?: string | null;
} | null | undefined;

/** Split a pathname into decoded, non-empty segments. Query/hash never reach
 *  usePathname(), but strip them anyway so the helper is safe on raw hrefs. */
function segments(pathname: string | null | undefined): string[] {
  if (!pathname) return [];
  const path = pathname.split(/[?#]/)[0];
  return path
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
}

/**
 * `/lesson/<courseId>/<lessonId>` → the lesson it names, else null.
 *
 * Exactly three segments. A deeper path (a future `/lesson/a/b/summary`) is
 * deliberately NOT a lesson location — it would be a different screen, and
 * silently treating it as the lesson is how you get two screens live at once.
 */
export function lessonLocationFromPath(
  pathname: string | null | undefined
): LessonLocation | null {
  const parts = segments(pathname);
  if (parts.length !== 3) return null;
  if (parts[0] !== "lesson") return null;
  const [, courseId, lessonId] = parts;
  if (!courseId || !lessonId) return null;
  return { courseId, lessonId };
}

/** `/course/<courseId>` → the course it names, else null. */
export function courseIdFromPath(
  pathname: string | null | undefined
): string | null {
  const parts = segments(pathname);
  if (parts.length !== 2) return null;
  if (parts[0] !== "course") return null;
  return parts[1] || null;
}

/** True while the URL is showing any lesson. */
export function isLessonPath(pathname: string | null | undefined): boolean {
  return lessonLocationFromPath(pathname) !== null;
}

/**
 * Does this lesson-scoped record belong to the lesson the URL is showing?
 *
 * Both halves must match. Matching on courseId alone was never enough: the
 * "Continue to next lesson" path keeps the course and changes the lesson, which
 * is exactly the case where a stale state used to survive.
 */
export function belongsToLocation(
  record: LessonScoped,
  location: LessonLocation | null
): boolean {
  if (!record || !location) return false;
  return (
    record.courseId === location.courseId && record.lessonId === location.lessonId
  );
}

/** The canonical href for a course page. The one place this string is built. */
export function courseHref(courseId: string): string {
  return `/course/${encodeURIComponent(courseId)}`;
}

/** The canonical href for a lesson page. */
export function lessonHref(courseId: string, lessonId: string): string {
  return `/lesson/${encodeURIComponent(courseId)}/${encodeURIComponent(lessonId)}`;
}

/**
 * Where a lesson exit must land.
 *
 * Deliberately takes the courseId from the URL rather than from in-memory
 * lesson state: "Leave" has to work when that state is stale, empty, or
 * mid-restore, which is precisely when the user is most stuck. Falls back to
 * the lesson state's course only if the URL cannot supply one, and to /learn
 * if neither can — never to nowhere.
 */
export function exitHrefForLesson(
  pathname: string | null | undefined,
  fallbackCourseId?: string | null
): string {
  const fromUrl = lessonLocationFromPath(pathname)?.courseId;
  const courseId = fromUrl || fallbackCourseId || null;
  return courseId ? courseHref(courseId) : "/learn";
}
