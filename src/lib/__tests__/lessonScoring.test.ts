import { describe, it, expect } from "vitest";
import {
  isScorableStep,
  SCORABLE_STEP_TYPES,
  UNSCORED_STEP_TYPES,
} from "../lessonScoring";

describe("isScorableStep", () => {
  it.each(SCORABLE_STEP_TYPES)("grades %s", (type) => {
    expect(isScorableStep(type)).toBe(true);
  });

  it.each(UNSCORED_STEP_TYPES)("does not grade %s", (type) => {
    expect(isScorableStep(type)).toBe(false);
  });

  /**
   * The regression this file exists for.
   *
   * "Done - I did it!" on an action step called answerQuestion(1), which was
   * scored against an mcq/scenario-only check and so was always wrong. Every
   * completed action cost a heart and re-queued the step, so it could never be
   * cleared. Found by E2E on 4 Aug 2026 after the loop spent 120 iterations
   * walking the same action-check from stepIndex 11 to 120.
   */
  it("never grades an action step, however it is answered", () => {
    expect(isScorableStep("action")).toBe(false);
    expect(isScorableStep("action-check")).toBe(false);
  });

  it("fails closed on an unknown or missing type", () => {
    // Defaulting an unrecognised type to "graded" is precisely what made the
    // original bug silent. Un-scored is recoverable; permanently-wrong is not.
    expect(isScorableStep("some-future-step")).toBe(false);
    expect(isScorableStep(undefined)).toBe(false);
    expect(isScorableStep(null)).toBe(false);
    expect(isScorableStep("")).toBe(false);
  });

  it("keeps the two lists disjoint", () => {
    const overlap = (SCORABLE_STEP_TYPES as readonly string[]).filter((t) =>
      (UNSCORED_STEP_TYPES as readonly string[]).includes(t)
    );
    expect(overlap).toEqual([]);
  });
});
