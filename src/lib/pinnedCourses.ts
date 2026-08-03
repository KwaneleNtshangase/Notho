/**
 * Pinned courses.
 *
 * The Learn page lists 17 courses in one column. Once a few are finished the
 * ones you actually care about drift below the fold, so this lets a user pin
 * courses to the top and pushes finished ones into a collapsed section at the
 * bottom.
 *
 * Storage is localStorage-only (`notho-pinned-courses`) — it's a display
 * preference, not progress, so it doesn't warrant a Supabase column or the
 * write path that comes with one. Trade-off: pins don't follow the user across
 * devices. If that becomes a complaint, add a `pinned_courses jsonb` column on
 * `user_progress` and sync it the way useUserSettings does.
 *
 * The pure helpers below carry all the ordering rules so they can be unit
 * tested without a DOM.
 */

export const PINNED_COURSES_KEY = "notho-pinned-courses";

/**
 * Fired on `window` after a write so every mounted view updates immediately.
 * The native `storage` event only fires in *other* tabs, so same-tab listeners
 * need this.
 */
export const PINNED_COURSES_EVENT = "notho:pinned-courses";

// ── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Defensive parse: anything that isn't an array of non-empty strings is
 * treated as "nothing pinned" rather than throwing. Duplicates are dropped,
 * order is preserved.
 */
export function parsePinned(raw: string | null | undefined): string[] {
  if (!raw) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Pin appends to the end, so the first thing you pinned stays at the top of
 * the pinned section. Unpin removes. Never mutates the input.
 */
export function togglePinned(pinned: readonly string[], courseId: string): string[] {
  if (!courseId) return [...pinned];
  return pinned.includes(courseId)
    ? pinned.filter((id) => id !== courseId)
    : [...pinned, courseId];
}

/** Drops pins for courses that no longer exist (renamed or removed content). */
export function prunePinned(pinned: readonly string[], validIds: Iterable<string>): string[] {
  const valid = new Set(validIds);
  return pinned.filter((id) => valid.has(id));
}

export type CourseGroups<T> = {
  /** Pinned courses, in the order they were pinned. Wins over every other group. */
  pinned: T[];
  /** Everything else that's neither advanced nor finished. */
  core: T[];
  /** XP-gated courses. */
  advanced: T[];
  /** 100% complete, and not pinned. */
  completed: T[];
};

/**
 * Splits the course list into the four display buckets.
 *
 * Precedence is deliberate: pinned beats completed beats advanced. Pinning a
 * course you've already finished should keep it at the top — that's the point
 * of pinning it.
 */
export function groupCourses<T>(
  courses: readonly T[],
  opts: {
    getId: (course: T) => string;
    isCompleted: (course: T) => boolean;
    isAdvanced: (course: T) => boolean;
    pinned: readonly string[];
  }
): CourseGroups<T> {
  const { getId, isCompleted, isAdvanced, pinned } = opts;
  const pinnedSet = new Set(pinned);
  const byId = new Map<string, T>();
  for (const course of courses) byId.set(getId(course), course);

  // Follow the pinned array's order, not the course list's, and skip pins that
  // point at courses which aren't in this list (e.g. filtered out by search).
  const pinnedCourses = pinned
    .map((id) => byId.get(id))
    .filter((c): c is T => c !== undefined);

  const core: T[] = [];
  const advanced: T[] = [];
  const completed: T[] = [];

  for (const course of courses) {
    if (pinnedSet.has(getId(course))) continue;
    if (isCompleted(course)) completed.push(course);
    else if (isAdvanced(course)) advanced.push(course);
    else core.push(course);
  }

  return { pinned: pinnedCourses, core, advanced, completed };
}

// ── Store ────────────────────────────────────────────────────────────────────
//
// A tiny external store rather than per-component state, so it can be consumed
// with useSyncExternalStore. That gives every mounted view the same value with
// no effect-driven setState and no hydration mismatch.
//
// The in-memory copy — not localStorage — is the snapshot source. Reading
// storage on every render would allocate a new array each time and spin
// useSyncExternalStore into an infinite loop, and it keeps the UI responsive
// even when a write fails (private mode, quota).

const EMPTY: readonly string[] = Object.freeze([]);

/** null = not yet hydrated from localStorage. */
let store: string[] | null = null;

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parsePinned(window.localStorage.getItem(PINNED_COURSES_KEY));
  } catch {
    // Private-mode Safari and friends can throw on read.
    return [];
  }
}

/** Current pinned list, hydrating from localStorage on first access. */
export function readPinnedCourses(): string[] {
  if (typeof window === "undefined") return [];
  if (store === null) store = readFromStorage();
  return store;
}

export function writePinnedCourses(ids: readonly string[]): void {
  if (typeof window === "undefined") return;
  store = [...ids];
  try {
    window.localStorage.setItem(PINNED_COURSES_KEY, JSON.stringify(store));
  } catch {
    // Quota or private mode — the pin still applies for this session, it just
    // won't survive a reload. Not worth surfacing an error for.
  }
  window.dispatchEvent(new Event(PINNED_COURSES_EVENT));
}

/** Toggles and persists in one step. Returns the new list. */
export function toggleCoursePin(courseId: string): string[] {
  const next = togglePinned(readPinnedCourses(), courseId);
  writePinnedCourses(next);
  return next;
}

/** Stable reference between changes — required by useSyncExternalStore. */
export function getPinnedSnapshot(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  return readPinnedCourses();
}

/** Server render has no localStorage, so nothing is pinned until hydration. */
export function getPinnedServerSnapshot(): readonly string[] {
  return EMPTY;
}

export function subscribePinnedCourses(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Same tab: writePinnedCourses already updated `store`, just notify.
  const onCustom = () => onChange();

  // Other tabs: adopt their value. `key === null` means localStorage.clear(),
  // so re-read rather than trusting newValue.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null) store = readFromStorage();
    else if (e.key === PINNED_COURSES_KEY) store = parsePinned(e.newValue);
    else return;
    onChange();
  };

  window.addEventListener(PINNED_COURSES_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PINNED_COURSES_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
