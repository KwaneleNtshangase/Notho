import { describe, expect, it } from "vitest";
import {
  RESUME_MAX_AGE_MS,
  makeResumeTombstone,
  resolveOfferableResume,
  withLocalSteps,
} from "../lessonResume";
import type { LessonResume, LessonResumeValue } from "../mergeRules";

const resume = (over: Partial<LessonResume> = {}): LessonResume => ({
  courseId: "money-basics",
  lessonId: "l1",
  stepIndex: 3,
  answers: {},
  correctCount: 1,
  mistakes: 0,
  masteredQids: [],
  mistakenQids: [],
  savedAt: 10_000,
  ...over,
});

describe("resolveOfferableResume", () => {
  const now = 100_000;

  it("offers the server's record when this device has none — the whole point", () => {
    // Lesson started on the phone; the laptop has never seen it.
    const fromPhone = resume({ savedAt: now - 1000 });
    expect(resolveOfferableResume(null, fromPhone, now)).toBe(fromPhone);
  });

  it("offers the merged record when both devices have one", () => {
    const local = resume({ stepIndex: 9, savedAt: now - 5000 });
    const server = resume({ stepIndex: 2, savedAt: now - 1000 });
    const offered = resolveOfferableResume(local, server, now)!;
    // Never backwards: step 9 survives even though the server saved later.
    expect(offered.stepIndex).toBe(9);
    expect(offered.savedAt).toBe(now - 1000);
  });

  it("offers nothing once the lesson has been finished (tombstone)", () => {
    const tombstone = makeResumeTombstone("money-basics", "l1", now - 100);
    expect(resolveOfferableResume(null, tombstone, now)).toBeNull();
  });

  it("offers nothing for a record older than the staleness cut-off", () => {
    const ancient = resume({ savedAt: now - RESUME_MAX_AGE_MS - 1 });
    expect(resolveOfferableResume(ancient, null, now)).toBeNull();
  });

  it("offers nothing when there is nothing anywhere", () => {
    expect(resolveOfferableResume(null, null, now)).toBeNull();
  });
});

describe("withLocalSteps", () => {
  it("re-attaches this device's resolved steps for the same lesson", () => {
    // The server copy carries no steps by design; the local ones include any
    // questions the mastery loop re-queued, which cannot be rebuilt from
    // static content.
    const local = resume({ steps: [{ q: 1 }, { q: 1 }] });
    const merged = resume({ stepIndex: 6 });
    const out = withLocalSteps(merged, local) as LessonResume;
    expect(out.steps).toHaveLength(2);
    expect(out.stepIndex).toBe(6);
  });

  it("does not attach steps from a DIFFERENT lesson", () => {
    const local = resume({ lessonId: "l1", steps: [{ q: 1 }] });
    const merged = resume({ lessonId: "l2" });
    expect((withLocalSteps(merged, local) as LessonResume).steps).toBeUndefined();
  });

  it("leaves a tombstone alone", () => {
    const tombstone: LessonResumeValue = { cleared: true, savedAt: 1 };
    expect(withLocalSteps(tombstone, resume({ steps: [{}] }))).toBe(tombstone);
  });
});
