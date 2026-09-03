/**
 * Pure rules for the native-feeling gestures:
 *   - pull-down at the top of a list refreshes
 *   - swipe from the left edge goes back
 *
 * Kept free of the DOM so the thresholds and "is this a tab root?" test can
 * be unit-tested without jsdom gymnastics.
 */

export const EDGE_START_PX = 28;
export const SWIPE_COMMIT_PX = 72;
export const PULL_COMMIT_PX = 68;
/** Movement must be this dominant on one axis before we lock the gesture. */
export const AXIS_LOCK_PX = 12;

export type GestureKind = "none" | "swipe-back" | "pull-refresh";

const TAB_ROOTS = new Set(["/", "/learn", "/budget", "/calculator", "/quests", "/profile"]);

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const trimmed = pathname.trim();
  if (trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "") || "/";
}

/** Bottom-nav destinations. Swipe-back on these would hop tabs, which no app does. */
export function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.has(normalizePathname(pathname));
}

export function canSwipeBack(pathname: string): boolean {
  return !isTabRoot(pathname);
}

export function startedFromLeftEdge(clientX: number, edgePx: number = EDGE_START_PX): boolean {
  return clientX <= edgePx;
}

export function classifyGesture(input: {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  atScrollTop: boolean;
  fromLeftEdge: boolean;
}): GestureKind {
  const dx = input.currentX - input.startX;
  const dy = input.currentY - input.startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < AXIS_LOCK_PX && absY < AXIS_LOCK_PX) return "none";

  // Horizontal wins only when it started on the left edge and is clearly
  // more horizontal than vertical — otherwise a list fling from the left
  // third of the screen would steal the scroll.
  if (input.fromLeftEdge && absX >= absY && dx > 0) return "swipe-back";

  // Pull-to-refresh is downward, only when the list is already at the top.
  if (input.atScrollTop && absY > absX && dy > 0) return "pull-refresh";

  return "none";
}

export function swipeProgress(dx: number, commitPx: number = SWIPE_COMMIT_PX): number {
  if (dx <= 0) return 0;
  return Math.min(1, dx / commitPx);
}

export function pullProgress(dy: number, commitPx: number = PULL_COMMIT_PX): number {
  if (dy <= 0) return 0;
  return Math.min(1, dy / commitPx);
}

/** Course id in /course/:id or /lesson/:id/:lessonId, else null. */
export function courseIdFromPath(pathname: string): string | null {
  const path = normalizePathname(pathname);
  const course = path.match(/^\/course\/([^/]+)$/);
  if (course) return decodeURIComponent(course[1]);
  const lesson = path.match(/^\/lesson\/([^/]+)\//);
  if (lesson) return decodeURIComponent(lesson[1]);
  return null;
}
