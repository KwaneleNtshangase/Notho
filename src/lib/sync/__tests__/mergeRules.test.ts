import { describe, expect, it } from "vitest";
import {
  emptyDailyFlags,
  mergeDailyFlags,
  mergePinned,
  mergeResume,
  REVIEW_MIN_CARDS,
  reviewQualifiesForStreak,
  reviewXp,
  sanitisePinnedIds,
  type DailyFlags,
  type LessonResume,
  type LessonResumeValue,
  type PinnedCourses,
} from "../mergeRules";

const iso = (ms: number) => new Date(ms).toISOString();

// ── Pinned courses ───────────────────────────────────────────────────────────

describe("mergePinned", () => {
  it("adopts the incoming list when the account has never synced pins", () => {
    // The rollout case: server column is still NULL. Nothing to lose, so the
    // device's list simply becomes the truth.
    expect(mergePinned(null, { ids: ["taxes"], updatedAt: iso(1000) })).toEqual({
      ids: ["taxes"],
      updatedAt: iso(1000),
    });
  });

  it("BOTH DEVICES CHANGED, both offline: the later edit wins the whole list", () => {
    // Phone unpins 'taxes' at t=2000; laptop pins 'crypto-basics' at t=1000.
    // Both were offline. Documented rule: last-write-wins on updatedAt, whole
    // list. The phone's edit is later, so the phone's list is the outcome —
    // including the unpin, which a union could never have expressed.
    const laptop: PinnedCourses = { ids: ["taxes", "crypto-basics"], updatedAt: iso(1000) };
    const phone: PinnedCourses = { ids: [], updatedAt: iso(2000) };

    expect(mergePinned(laptop, phone)).toEqual({ ids: [], updatedAt: iso(2000) });
    // ...and the order of arrival does not change the winner.
    expect(mergePinned(phone, laptop)).toEqual({ ids: [], updatedAt: iso(2000) });
  });

  it("keeps the server's copy on a tie, so a retry can't flip the result", () => {
    const server: PinnedCourses = { ids: ["a"], updatedAt: iso(5000) };
    const incoming: PinnedCourses = { ids: ["b"], updatedAt: iso(5000) };
    expect(mergePinned(server, incoming).ids).toEqual(["a"]);
  });

  it("does not let a fresh device with no pins wipe the account", () => {
    // A new install stamps the epoch (readPinnedRecord's default), so it can
    // never out-rank a real edit.
    const server: PinnedCourses = { ids: ["taxes"], updatedAt: iso(9_000) };
    const freshDevice: PinnedCourses = { ids: [], updatedAt: new Date(0).toISOString() };
    expect(mergePinned(server, freshDevice).ids).toEqual(["taxes"]);
  });

  it("MIGRATION: adopt unions localStorage-only pins instead of racing them", () => {
    // The user pinned things on this laptop before cross-device sync shipped.
    // Meanwhile the phone (already updated) pinned something else. Adoption
    // must not drop either set.
    const server: PinnedCourses = { ids: ["crypto-basics"], updatedAt: iso(2000) };
    const localOnly: PinnedCourses = { ids: ["taxes", "crypto-basics"], updatedAt: iso(1000) };
    const merged = mergePinned(server, localOnly, { adopt: true });
    expect(merged.ids).toEqual(["crypto-basics", "taxes"]);
  });

  it("preserves pin order and drops blanks, dupes and non-strings", () => {
    expect(sanitisePinnedIds(["b", "a", "b", "", "  ", 7, null])).toEqual(["b", "a"]);
  });
});

// ── Mid-lesson resume ────────────────────────────────────────────────────────

const resume = (over: Partial<LessonResume> = {}): LessonResume => ({
  courseId: "money-basics",
  lessonId: "l1",
  stepIndex: 3,
  answers: { "0": "a" },
  correctCount: 2,
  mistakes: 1,
  masteredQids: [1, 2],
  mistakenQids: [3],
  savedAt: 1_000,
  ...over,
});

describe("mergeResume", () => {
  it("takes the incoming record when the account has none", () => {
    const r = resume();
    expect(mergeResume(null, r)).toBe(r);
  });

  it("ignores a stale write that is also behind, rather than rewinding", () => {
    const server = resume({ stepIndex: 8, savedAt: 5_000 });
    const stale = resume({ stepIndex: 1, savedAt: 4_000 });
    expect(mergeResume(server, stale)).toBe(server);
  });

  it("a stale write that is AHEAD still moves the account forward", () => {
    // The reverse of the case below, and the one plain LWW gets wrong: the
    // laptop reached step 9 offline, the phone reached step 2 and synced
    // first. The laptop's write is older, but its position is further on —
    // rewinding the learner to step 2 would be losing progress.
    const server = resume({ stepIndex: 2, correctCount: 1, savedAt: 5_000 });
    const staleButAhead = resume({ stepIndex: 9, correctCount: 6, savedAt: 4_000 });
    const merged = mergeResume(server, staleButAhead) as LessonResume;
    expect(merged.stepIndex).toBe(9);
    expect(merged.correctCount).toBe(6);
    expect(merged.savedAt).toBe(5_000);
  });

  it("keeps the server copy on an exact savedAt tie for a different lesson", () => {
    const server = resume({ lessonId: "l1", savedAt: 5_000 });
    const tie = resume({ lessonId: "l2", savedAt: 5_000 });
    expect(mergeResume(server, tie)).toBe(server);
  });

  it("PROGRESS NEVER GOES BACKWARDS inside the same lesson", () => {
    // Laptop got to step 9 (offline). Phone got to step 4 but saved later.
    // Plain LWW would rewind the learner to step 4. The GREATEST clause — the
    // same discipline used for longest_streak and completed_lessons — keeps
    // the furthest position and unions the question-id sets, in either
    // direction (see the stale-but-ahead case above).
    const laptop = resume({
      stepIndex: 9,
      correctCount: 7,
      mistakes: 2,
      masteredQids: [1, 2, 3],
      mistakenQids: [4],
      answers: { "0": "a", "1": "b" },
      savedAt: 1_000,
    });
    const phone = resume({
      stepIndex: 4,
      correctCount: 3,
      mistakes: 1,
      masteredQids: [1, 9],
      mistakenQids: [5],
      answers: { "2": "c" },
      savedAt: 9_000,
    });

    const merged = mergeResume(laptop, phone) as LessonResume;
    expect(merged.stepIndex).toBe(9);
    expect(merged.correctCount).toBe(7);
    expect(merged.mistakes).toBe(2);
    expect(merged.masteredQids).toEqual([1, 2, 3, 9]);
    expect(merged.mistakenQids).toEqual([4, 5]);
    expect(merged.answers).toEqual({ "0": "a", "1": "b", "2": "c" });
    expect(merged.savedAt).toBe(9_000);
  });

  it("replaces wholesale when the two devices are in DIFFERENT lessons", () => {
    const server = resume({ stepIndex: 9, savedAt: 1_000 });
    const other = resume({ lessonId: "l2", stepIndex: 1, savedAt: 2_000 });
    expect(mergeResume(server, other)).toBe(other);
  });

  it("a tombstone with a newer savedAt clears a resume point everywhere", () => {
    // "I finished this on my phone" must beat the laptop's stale position,
    // which is why clearing is a tombstone and not a delete.
    const server = resume({ stepIndex: 9, savedAt: 1_000 });
    const tombstone: LessonResumeValue = {
      cleared: true,
      savedAt: 2_000,
      courseId: "money-basics",
      lessonId: "l1",
    };
    expect(mergeResume(server, tombstone)).toBe(tombstone);
  });

  it("a stale tombstone cannot clear a newer resume point", () => {
    const server = resume({ stepIndex: 2, savedAt: 9_000 });
    const tombstone: LessonResumeValue = { cleared: true, savedAt: 3_000 };
    expect(mergeResume(server, tombstone)).toBe(server);
  });

  it("a fresh start after a tombstone is not merged into the tombstone", () => {
    const tombstone: LessonResumeValue = { cleared: true, savedAt: 1_000 };
    const restart = resume({ stepIndex: 0, savedAt: 2_000 });
    expect(mergeResume(tombstone, restart)).toBe(restart);
  });
});

// ── Daily-challenge flags ────────────────────────────────────────────────────

const flags = (day: string, over: Partial<DailyFlags> = {}): DailyFlags => ({
  ...emptyDailyFlags(day),
  ...over,
});

describe("mergeDailyFlags", () => {
  it("ORs booleans and takes GREATEST of counters on the same day", () => {
    const phone = flags("2026-08-21", { budgetVisited: true, perfectToday: 1 });
    const laptop = flags("2026-08-21", { calcVisited: true, perfectToday: 3 });
    expect(mergeDailyFlags(phone, laptop)).toEqual(
      flags("2026-08-21", { budgetVisited: true, calcVisited: true, perfectToday: 3 })
    );
  });

  it("a strictly newer day replaces yesterday wholesale", () => {
    const yesterday = flags("2026-08-20", { budgetVisited: true, perfectToday: 5 });
    const today = flags("2026-08-21");
    expect(mergeDailyFlags(yesterday, today)).toEqual(today);
  });

  it("a device that has been asleep cannot resurrect yesterday's counters", () => {
    const today = flags("2026-08-21", { perfectToday: 2 });
    const stale = flags("2026-08-20", { perfectToday: 9, shared: true });
    expect(mergeDailyFlags(today, stale)).toEqual(today);
  });

  it("never un-ticks a task that another device already achieved", () => {
    const server = flags("2026-08-21", { conceptReviewed: true, reviewCounted: true });
    const device = flags("2026-08-21");
    const merged = mergeDailyFlags(server, device);
    expect(merged.conceptReviewed).toBe(true);
    expect(merged.reviewCounted).toBe(true);
  });
});

// ── Review sessions and the streak ───────────────────────────────────────────

describe("review session streak rule", () => {
  it("one card is not a day's work", () => {
    expect(REVIEW_MIN_CARDS).toBe(5);
    expect(reviewQualifiesForStreak(1)).toBe(false);
    expect(reviewQualifiesForStreak(4)).toBe(false);
  });

  it("a full session of at least the minimum counts", () => {
    expect(reviewQualifiesForStreak(5)).toBe(true);
    expect(reviewQualifiesForStreak(12)).toBe(true);
  });

  it("awards nothing for a session that does not qualify", () => {
    // The card is still rescheduled by SM-2 — it just buys no streak day, so
    // a single wrong card answered daily can't hold a streak open forever.
    expect(reviewXp(1, 1)).toBe(0);
    expect(reviewXp(4, 4)).toBe(0);
  });

  it("pays 20 + 5 per correct card, capped", () => {
    expect(reviewXp(0, 5)).toBe(20);
    expect(reviewXp(5, 5)).toBe(45);
    // A tampered client reporting more correct than answered is clamped.
    expect(reviewXp(999, 5)).toBe(45);
    expect(reviewXp(100, 100)).toBe(200);
  });
});
