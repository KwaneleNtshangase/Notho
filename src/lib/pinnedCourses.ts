/**
 * Pinned courses.
 *
 * The Learn page lists 17 courses in one column. Once a few are finished the
 * ones you actually care about drift below the fold, so this lets a user pin
 * courses to the top and pushes finished ones into a collapsed section at the
 * bottom.
 *
 * It DID become a complaint: a pin is an intentional choice about what you are
 * working on, not a display preference, and pinning on a phone left the laptop
 * unchanged. So the fix this file's own comment used to describe is now done —
 * `user_progress.pinned_courses` (jsonb) holds `{ids, updatedAt}` and this
 * store syncs to it the way useUserSettings syncs preferences.
 *
 * Storage model:
 *   * localStorage stays the immediate, synchronous read/write surface — a pin
 *     applies to the UI before anything touches the network, which is the
 *     whole point on a phone with bad signal;
 *   * every write also lands in the durable queue in `lib/sync/crossDeviceQueue`
 *     and is flushed opportunistically;
 *   * conflicts are resolved by `mergePinned` — last-write-wins on `updatedAt`,
 *     whole-list replace. See `lib/sync/mergeRules.ts` for why it is not a
 *     union, and the migration header for the same rule in SQL.
 *
 * The pure helpers below carry all the ordering rules so they can be unit
 * tested without a DOM.
 */

import { sanitisePinnedIds, type PinnedCourses } from "@/lib/sync/mergeRules";

export type { PinnedCourses };

export const PINNED_COURSES_KEY = "notho-pinned-courses";

/** When this device last changed the pin list (ISO-8601). Drives LWW. */
export const PINNED_COURSES_UPDATED_AT_KEY = "notho-pinned-courses-updated-at";

/**
 * Set once this device's localStorage-only pins have been unioned into the
 * account. Until then the first sync ADOPTS rather than races, so shipping
 * cross-device pins cannot wipe pins that exist nowhere else.
 * Same non-destructive stance as `lib/storageMigration.ts`.
 */
export const PINNED_COURSES_ADOPTED_KEY = "notho-pinned-courses-adopted";

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

function readUpdatedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PINNED_COURSES_UPDATED_AT_KEY);
  } catch {
    return null;
  }
}

/** Current pinned list, hydrating from localStorage on first access. */
export function readPinnedCourses(): string[] {
  if (typeof window === "undefined") return [];
  if (store === null) store = readFromStorage();
  return store;
}

/**
 * The full record, timestamp included — what gets merged against the server.
 * A device that has pins but has never stamped one (pre-sync build) reports
 * the epoch, so any real edit from another device out-ranks it.
 */
export function readPinnedRecord(): PinnedCourses {
  return {
    ids: [...readPinnedCourses()],
    updatedAt: readUpdatedAt() ?? new Date(0).toISOString(),
  };
}

function persist(ids: readonly string[], updatedAt: string): void {
  store = [...ids];
  try {
    window.localStorage.setItem(PINNED_COURSES_KEY, JSON.stringify(store));
    window.localStorage.setItem(PINNED_COURSES_UPDATED_AT_KEY, updatedAt);
  } catch {
    // Quota or private mode — the pin still applies for this session, it just
    // won't survive a reload. Not worth surfacing an error for.
  }
  window.dispatchEvent(new Event(PINNED_COURSES_EVENT));
}

/**
 * Local write. Stamps `updatedAt` so the server can arbitrate later; the
 * caller is responsible for queueing the returned record.
 */
export function writePinnedCourses(
  ids: readonly string[],
  updatedAt: string = new Date().toISOString()
): PinnedCourses {
  if (typeof window === "undefined") return { ids: [...ids], updatedAt };
  persist(ids, updatedAt);
  return { ids: [...store!], updatedAt };
}

/**
 * Adopt a value that came FROM the server. Deliberately separate from
 * writePinnedCourses: it must not re-stamp the timestamp (that would make an
 * adopted value look like a fresh local edit and win every future merge) and
 * it must not queue a write back.
 */
export function hydratePinnedCourses(value: PinnedCourses | null): void {
  if (typeof window === "undefined" || !value) return;
  persist(sanitisePinnedIds(value.ids), value.updatedAt);
}

/** Toggles and persists in one step. Returns the new record. */
export function toggleCoursePin(courseId: string): PinnedCourses {
  const next = togglePinned(readPinnedCourses(), courseId);
  return writePinnedCourses(next);
}

/** True while this device's pins still need the one-time rollout union. */
export function needsPinAdoption(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PINNED_COURSES_ADOPTED_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markPinsAdopted(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PINNED_COURSES_ADOPTED_KEY, "1"); } catch { /* ignore */ }
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

  // Same tab: the store was already updated, just notify.
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
