/**
 * Cross-device merge rules — the client-side mirror of the SQL in
 * `supabase/migrations/20260821090000_cross_device_pins_resume_and_review_streak.sql`.
 *
 * Every rule lives here as a pure function for three reasons:
 *   1. The client has to apply the SAME rule while offline, when there is no
 *      server to arbitrate — a second tab, a queued write being folded into a
 *      newer one, or a cached row being reconciled with local state.
 *   2. It is the only way to unit-test the contract without a database.
 *   3. It keeps the rule written down in exactly two places (here and the
 *      migration header) rather than smeared across hooks.
 *
 * If you change a rule here, change it in the migration too. The tests in
 * `src/lib/sync/__tests__/mergeRules.test.ts` assert the behaviour both sides
 * are supposed to implement.
 */

// ── Pinned courses ───────────────────────────────────────────────────────────
//
// RULE: last-write-wins on `updatedAt`, whole-list replace.
//
// Not a union, deliberately. A pin list is ORDERED (first pinned sits top) and
// an unpin is a REMOVAL — a set union cannot express "I unpinned this", so
// unpinning would never propagate. A pin is a cheap, one-tap, re-doable choice,
// so discarding the older of two offline edits is an acceptable trade in a way
// that discarding XP or a completed lesson never is.
//
// Ties keep the server's copy: a device whose clock matches to the millisecond
// should not be able to flip the result by retrying.

export type PinnedCourses = {
  ids: string[];
  /** ISO-8601, stamped by whichever device made the edit. */
  updatedAt: string;
};

export const MAX_PINNED = 200;

/** Drop blanks/dupes/over-long ids, preserve order, cap the length. */
export function sanitisePinnedIds(ids: readonly unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    if (typeof raw !== "string") continue;
    const id = raw.trim();
    if (!id || id.length > 64 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_PINNED) break;
  }
  return out;
}

function pinnedTime(value: PinnedCourses | null | undefined): number {
  if (!value?.updatedAt) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(value.updatedAt);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

/**
 * @param adopt one-time rollout merge. A device whose pins have only ever
 *   existed in localStorage unions them into the server list instead of racing
 *   it, so nobody's pins are wiped by shipping this. See storageMigration.ts
 *   for the same non-destructive stance on the rebrand key rename.
 */
export function mergePinned(
  server: PinnedCourses | null,
  incoming: PinnedCourses,
  opts: { adopt?: boolean } = {}
): PinnedCourses {
  const incomingIds = sanitisePinnedIds(incoming.ids);

  // Never synced before: the incoming list simply becomes the truth.
  if (!server || !Array.isArray(server.ids)) {
    return { ids: incomingIds, updatedAt: incoming.updatedAt };
  }

  const serverIds = sanitisePinnedIds(server.ids);

  if (opts.adopt) {
    return {
      ids: sanitisePinnedIds([...serverIds, ...incomingIds]),
      updatedAt: incoming.updatedAt,
    };
  }

  // Strictly newer wins; a tie keeps the server.
  return pinnedTime(incoming) > pinnedTime(server)
    ? { ids: incomingIds, updatedAt: incoming.updatedAt }
    : { ids: serverIds, updatedAt: server.updatedAt };
}

// ── Mid-lesson resume ────────────────────────────────────────────────────────
//
// RULE: last-write-wins on `savedAt` (epoch ms) decides WHICH LESSON you are
// resuming — but never how far into it you are.
//
// When both sides are part-way through the SAME lesson, the position fields
// take GREATEST and the question-id arrays take the union, in BOTH directions:
// it does not matter which device saved last. That asymmetry matters. A laptop
// that reached step 9 offline and a phone that reached step 2 and synced first
// would, under plain LWW, silently rewind the learner to step 2 the moment the
// laptop reconnected — the laptop's write is the older one. GREATEST is the
// same never-go-backwards discipline already used for `longest_streak` and
// `completed_lessons`: reconnecting can only ever move you forward.
//
// savedAt still decides everything else — a different lesson, or a tombstone.
//
// Clearing is a TOMBSTONE (`cleared: true`) with a fresh savedAt rather than a
// delete, so "I finished this lesson on my phone" can out-rank a stale resume
// point still sitting on the laptop.

export type LessonResume = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  stepIndex: number;
  answers: Record<string, unknown>;
  correctCount: number;
  mistakes: number;
  masteredQids: number[];
  mistakenQids: number[];
  /** epoch ms, stamped by the writing device. */
  savedAt: number;
  cleared?: boolean;
  /**
   * Resolved working steps. LOCAL ONLY — never sent to the server (it can be
   * hundreds of KB). The receiving device rebuilds them deterministically:
   * shuffleLessonSteps is seeded on userId+courseId+lessonId, so every device
   * produces the same order for the same person.
   */
  steps?: unknown[];
};

export type LessonResumeTombstone = {
  cleared: true;
  savedAt: number;
  courseId?: string;
  lessonId?: string;
};

export type LessonResumeValue = LessonResume | LessonResumeTombstone;

export function isTombstone(v: LessonResumeValue | null | undefined): boolean {
  return Boolean(v && (v as LessonResumeTombstone).cleared);
}

function uniqNumbers(...lists: (readonly number[] | undefined)[]): number[] {
  const seen = new Set<number>();
  for (const list of lists) {
    for (const n of list ?? []) if (typeof n === "number") seen.add(n);
  }
  return Array.from(seen).sort((a, b) => a - b);
}

function samePosition(a: LessonResume, b: LessonResume): boolean {
  return (
    a.stepIndex === b.stepIndex &&
    a.correctCount === b.correctCount &&
    a.mistakes === b.mistakes &&
    a.savedAt === b.savedAt &&
    JSON.stringify(a.masteredQids ?? []) === JSON.stringify(b.masteredQids ?? []) &&
    JSON.stringify(a.mistakenQids ?? []) === JSON.stringify(b.mistakenQids ?? []) &&
    JSON.stringify(a.answers ?? {}) === JSON.stringify(b.answers ?? {})
  );
}

export function mergeResume(
  server: LessonResumeValue | null,
  incoming: LessonResumeValue
): LessonResumeValue {
  if (!server) return incoming;

  const inAt = Number(incoming.savedAt ?? 0);
  const srvAt = Number(server.savedAt ?? 0);

  const sameLesson =
    !isTombstone(incoming) &&
    !isTombstone(server) &&
    (incoming as LessonResume).courseId === (server as LessonResume).courseId &&
    (incoming as LessonResume).lessonId === (server as LessonResume).lessonId;

  if (!sameLesson) {
    // Different lesson, or a tombstone: pure last-write-wins. A tie keeps the
    // server, so a retry can't flip the result.
    return inAt > srvAt ? incoming : server;
  }

  const a = server as LessonResume;
  const b = incoming as LessonResume;
  // The later save supplies the non-positional fields (title, and whatever a
  // future field might be); the position itself is the high-water mark of both.
  const newer = inAt >= srvAt ? b : a;
  const older = newer === b ? a : b;

  const merged: LessonResume = {
    ...newer,
    stepIndex: Math.max(a.stepIndex ?? 0, b.stepIndex ?? 0),
    correctCount: Math.max(a.correctCount ?? 0, b.correctCount ?? 0),
    mistakes: Math.max(a.mistakes ?? 0, b.mistakes ?? 0),
    masteredQids: uniqNumbers(a.masteredQids, b.masteredQids),
    mistakenQids: uniqNumbers(a.mistakenQids, b.mistakenQids),
    answers: { ...(older.answers ?? {}), ...(newer.answers ?? {}) },
    savedAt: Math.max(inAt, srvAt),
  };

  // Hand back the original object when nothing actually changed, so callers
  // can use identity to decide whether they have anything to push.
  if (samePosition(merged, a)) return server;
  if (samePosition(merged, b)) return incoming;
  return merged;
}

// ── Daily-challenge flags ────────────────────────────────────────────────────
//
// RULE: same SAST day -> booleans OR, counters GREATEST. Strictly newer day ->
// replace wholesale. Older day -> ignore (a device that has been asleep must
// not resurrect yesterday's counters). Identical in shape to the existing
// merge_weekly_stats rule.

export type DailyFlags = {
  day: string;
  conceptReviewed: boolean;
  shared: boolean;
  calcVisited: boolean;
  budgetVisited: boolean;
  /** The first qualifying review session of the day has been claimed. */
  reviewCounted: boolean;
  perfectToday: number;
  expenseToday: number;
  correctStreakToday: number;
};

export function emptyDailyFlags(day: string): DailyFlags {
  return {
    day,
    conceptReviewed: false,
    shared: false,
    calcVisited: false,
    budgetVisited: false,
    reviewCounted: false,
    perfectToday: 0,
    expenseToday: 0,
    correctStreakToday: 0,
  };
}

export function mergeDailyFlags(
  server: DailyFlags | null,
  incoming: DailyFlags
): DailyFlags {
  if (!server?.day) return incoming;
  if (incoming.day > server.day) return incoming;
  if (incoming.day < server.day) return server;
  return {
    day: incoming.day,
    conceptReviewed: server.conceptReviewed || incoming.conceptReviewed,
    shared: server.shared || incoming.shared,
    calcVisited: server.calcVisited || incoming.calcVisited,
    budgetVisited: server.budgetVisited || incoming.budgetVisited,
    reviewCounted: server.reviewCounted || incoming.reviewCounted,
    perfectToday: Math.max(server.perfectToday, incoming.perfectToday),
    expenseToday: Math.max(server.expenseToday, incoming.expenseToday),
    correctStreakToday: Math.max(server.correctStreakToday, incoming.correctStreakToday),
  };
}

// ── Review sessions and the streak ───────────────────────────────────────────
//
// RULE: a spaced-repetition review session keeps the streak alive when the
// learner ANSWERS AT LEAST `REVIEW_MIN_CARDS` cards in one completed session.
//
// Why a floor at all: one card is a three-second tap, and SM-2 reschedules a
// card answered WRONG to tomorrow (interval resets to 1 day). So without a
// floor, a user could keep a streak alive forever by getting the same single
// card wrong once a day — a streak that represents no work. Five cards is
// roughly a minute of recall and is what the review banner already surfaces as
// a session.
//
// Why it cannot be farmed for more than that:
//   * the streak is written only by /api/progress/sync-streak, which is
//     idempotent per SAST day — it can never add more than one day per day;
//   * the XP and the lessons-today bump come from claim_review_session, an
//     atomic once-per-SAST-day claim (row lock + a server-side flag), so a
//     second session, a second device, or an offline claim replayed after the
//     fact all get `already_claimed` and nothing;
//   * the floor is enforced in the RPC as well as here, so a tampered client
//     cannot mint streak days by reporting a one-card session as five;
//   * SM-2 itself caps supply — cards answered correctly move out to 1, 6,
//     then interval*ease days, so there is no bottomless well of due cards.

export const REVIEW_MIN_CARDS = 5;

export function reviewQualifiesForStreak(cardsAnswered: number): boolean {
  return Number.isFinite(cardsAnswered) && cardsAnswered >= REVIEW_MIN_CARDS;
}

/** The XP a qualifying session is worth. Mirrors claim_review_session. */
export function reviewXp(correct: number, cardsAnswered: number): number {
  if (!reviewQualifiesForStreak(cardsAnswered)) return 0;
  const capped = Math.max(0, Math.min(correct, cardsAnswered));
  return Math.min(20 + capped * 5, 200);
}
