/**
 * Exact scroll memory for the app shell.
 *
 * Next.js App Router remounts each route, and CourseView used to force
 * scroll-to-top on every visit — so going Learn → Course → Lesson → Back
 * dumped the learner at the first lesson instead of where they were.
 *
 * Snapshots live in sessionStorage (this tab / this app session only) keyed
 * by pathname. The write is synchronous and best-effort; nothing about
 * learning progress depends on it.
 */

export const SCROLL_STORAGE_PREFIX = "notho-scroll:";

export type ScrollSnapshot = {
  windowY: number;
  mainY: number;
};

export function scrollStorageKey(pathname: string): string {
  const path = pathname.trim() || "/";
  return `${SCROLL_STORAGE_PREFIX}${path}`;
}

export function readScroll(pathname: string): ScrollSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(scrollStorageKey(pathname));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ScrollSnapshot>;
    const windowY = Number(parsed.windowY);
    const mainY = Number(parsed.mainY);
    if (!Number.isFinite(windowY) || !Number.isFinite(mainY)) return null;
    return { windowY: Math.max(0, windowY), mainY: Math.max(0, mainY) };
  } catch {
    return null;
  }
}

export function writeScroll(pathname: string, snapshot: ScrollSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      scrollStorageKey(pathname),
      JSON.stringify({
        windowY: Math.max(0, snapshot.windowY),
        mainY: Math.max(0, snapshot.mainY),
      })
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

export function captureScroll(main: Element | null = null): ScrollSnapshot {
  if (typeof window === "undefined") return { windowY: 0, mainY: 0 };
  const node =
    main ??
    document.querySelector(".main-content");
  return {
    windowY: window.scrollY || document.documentElement.scrollTop || 0,
    mainY: node instanceof HTMLElement ? node.scrollTop : 0,
  };
}

export function applyScroll(snapshot: ScrollSnapshot, main: Element | null = null): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: snapshot.windowY, left: 0, behavior: "instant" });
  const node =
    main ??
    document.querySelector(".main-content");
  if (node instanceof HTMLElement) {
    node.scrollTo({ top: snapshot.mainY, left: 0, behavior: "instant" });
  }
}

/** True when the snapshot is a real position, not "we were at the top". */
export function hasMeaningfulScroll(snapshot: ScrollSnapshot | null): boolean {
  if (!snapshot) return false;
  return snapshot.windowY > 8 || snapshot.mainY > 8;
}

/**
 * Learn → Course should show the last lesson done, even if a previous
 * visit left a snapshot. Lesson → Course should restore that snapshot.
 * The Learn page sets this flag; CourseView consumes it once.
 */
export const COURSE_FOCUS_KEY = "notho-course-focus";

export function markCourseFocus(courseId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COURSE_FOCUS_KEY, courseId);
  } catch {
    /* ignore */
  }
}

export function consumeCourseFocus(courseId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const marked = sessionStorage.getItem(COURSE_FOCUS_KEY);
    if (marked !== courseId) return false;
    sessionStorage.removeItem(COURSE_FOCUS_KEY);
    return true;
  } catch {
    return false;
  }
}
