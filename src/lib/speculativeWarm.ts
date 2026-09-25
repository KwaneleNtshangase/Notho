/**
 * Speculative loading for the routes that still leave the persistent tab shell:
 * course maps, lessons, settings, RE5 readiness.
 *
 * Prefetch is best-effort. Never throw into a click handler.
 */

const seen = new Set<string>();
let prefetchRoute: ((href: string) => void) | null = null;

export function registerRoutePrefetch(fn: (href: string) => void) {
  prefetchRoute = fn;
}

export function prefetchHref(href: string) {
  if (!href || seen.has(href)) return;
  seen.add(href);
  try {
    prefetchRoute?.(href);
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined") return;
  try {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  } catch {
    /* ignore */
  }
}

export function warmCourse(courseId: string) {
  if (!courseId) return;
  prefetchHref(`/course/${courseId}`);
  void import("@/components/views/CourseView");
  void import("@/components/CourseLanding");
}

export function warmLesson(courseId: string, lessonId: string) {
  if (!courseId || !lessonId) return;
  prefetchHref(`/lesson/${courseId}/${lessonId}`);
  prefetchHref(`/course/${courseId}`);
  void import("@/components/views/LessonView");
  void import("@/components/views/LessonSummaryView");
}

export function warmSettings() {
  prefetchHref("/settings");
  void import("@/components/SettingsView");
}

export function warmHeavyShell() {
  void import("@/components/views/CourseView");
  void import("@/components/CourseLanding");
  void import("@/components/views/LessonView");
  void import("@/components/views/LessonSummaryView");
  void import("@/components/SettingsView");
  void import("@/components/ReviewSession");
  prefetchHref("/settings");
  prefetchHref("/re5-readiness");
}

export function whenIdle(fn: () => void, timeoutMs = 1400): () => void {
  if (typeof window === "undefined") return () => {};
  const ric = window.requestIdleCallback?.bind(window);
  if (typeof ric === "function") {
    const id = ric(() => fn(), { timeout: timeoutMs });
    return () => window.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(fn, Math.min(800, timeoutMs));
  return () => window.clearTimeout(t);
}
