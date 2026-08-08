/**
 * Which lesson step types are graded.
 *
 * Extracted from the lesson reducer so it can be unit-tested without a browser.
 * The bug it exists to prevent, found by the E2E suite on 4 Aug 2026:
 *
 * The "Done - I did it!" button on an action step called `answerQuestion(1)`,
 * and the handler computed correctness as
 *
 *   (step.type === "mcq" || step.type === "scenario") && index === step.correct
 *
 * An `action-check` step is neither, so `isCorrect` was false unconditionally.
 * Every completed real-world action was therefore recorded as a WRONG answer:
 * the learner lost a heart, the step was re-queued to the end of the lesson,
 * and it came back — forever. The action step could never be cleared, and doing
 * the exercise was punished. That is 10 `action-check` and 33 `action` steps in
 * the content, and they are the ones that ask the learner to open their banking
 * app and actually look.
 *
 * The fix is not "mark it correct" — an action step is not a question and has no
 * right answer. It is not scored at all: no correct count, no mistake, no heart,
 * no re-queue, and no effect on accuracy in either direction.
 */

/** Step types that represent a question with a right answer. */
export const SCORABLE_STEP_TYPES = [
  "mcq",
  "scenario",
  "true-false",
  "fill-blank",
] as const;

/**
 * Step types the learner interacts with but which are not graded.
 * `action` / `action-check` are self-reported completion; `info` and
 * `calculator-embed` are read-only.
 */
export const UNSCORED_STEP_TYPES = [
  "action",
  "action-check",
  "info",
  "calculator-embed",
] as const;

/**
 * Should answering this step feed the correct/mistake tally?
 *
 * Anything unrecognised returns false. Defaulting an unknown step type to
 * "graded" is what caused the original bug: a new step type silently became a
 * permanent wrong answer. Failing closed means a new type is merely un-scored
 * until someone adds it, which is recoverable and visible.
 */
export function isScorableStep(type: string | undefined | null): boolean {
  if (!type) return false;
  return (SCORABLE_STEP_TYPES as readonly string[]).includes(type);
}
