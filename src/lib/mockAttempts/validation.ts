import { RE5_COURSE_ID, examSpecFor } from "@/lib/results/re5";
import type { MockAttemptMutation } from "@/lib/mockAttempts/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validateStartBody(
  body: unknown
): ValidationResult<{ courseId: string; lessonId: string; newAttempt: boolean }> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body as Record<string, unknown>;
  if (input.courseId !== RE5_COURSE_ID || typeof input.lessonId !== "string") {
    return { ok: false, error: "Unknown mock exam" };
  }
  const spec = examSpecFor(input.lessonId);
  if (!spec) return { ok: false, error: "Unknown mock exam" };
  if (input.newAttempt !== undefined && typeof input.newAttempt !== "boolean") {
    return { ok: false, error: "newAttempt must be a boolean" };
  }
  return {
    ok: true,
    value: {
      courseId: RE5_COURSE_ID,
      lessonId: spec.lessonId,
      newAttempt: input.newAttempt === true,
    },
  };
}

export function validateMutationBody(
  body: unknown,
  totalQuestions = 50
): ValidationResult<MockAttemptMutation> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body as Record<string, unknown>;
  if (typeof input.mutationId !== "string" || !UUID_RE.test(input.mutationId)) {
    return { ok: false, error: "mutationId must be a UUID" };
  }
  if (
    !Number.isInteger(input.questionIndex) ||
    (input.questionIndex as number) < 0 ||
    (input.questionIndex as number) >= totalQuestions
  ) {
    return { ok: false, error: "Invalid questionIndex" };
  }
  const base = {
    mutationId: input.mutationId,
    questionIndex: input.questionIndex as number,
  };
  if (input.action === "view") {
    return { ok: true, value: { action: "view", ...base } };
  }
  if (input.action === "flag") {
    if (typeof input.flagged !== "boolean") {
      return { ok: false, error: "flagged must be a boolean" };
    }
    return { ok: true, value: { action: "flag", ...base, flagged: input.flagged } };
  }
  if (input.action === "answer") {
    const answer = input.answeredOptionId;
    if (answer !== null && (typeof answer !== "string" || !UUID_RE.test(answer))) {
      return { ok: false, error: "answeredOptionId must be null or a UUID" };
    }
    return {
      ok: true,
      value: { action: "answer", ...base, answeredOptionId: answer as string | null },
    };
  }
  return { ok: false, error: "Unknown mutation action" };
}

export function validateUuid(value: string): boolean {
  return UUID_RE.test(value);
}
