import { describe, expect, it } from "vitest";

import {
  validateMutationBody,
  validateStartBody,
  validateUuid,
} from "@/lib/mockAttempts/validation";

const MUTATION_ID = "00000000-0000-4000-8000-000000000001";
const OPTION_ID = "00000000-0000-4000-8000-000000000002";

describe("mock-attempt input validation", () => {
  it("accepts only the two secure RE5 papers", () => {
    expect(
      validateStartBody({
        courseId: "re5-exam-prep",
        lessonId: "re5-mock-a",
      })
    ).toEqual({
      ok: true,
      value: {
        courseId: "re5-exam-prep",
        lessonId: "re5-mock-a",
        newAttempt: false,
      },
    });
    expect(
      validateStartBody({
        courseId: "re5-exam-prep",
        lessonId: "re5-mock-b",
        newAttempt: true,
      })
    ).toMatchObject({ ok: true, value: { newAttempt: true } });
    expect(
      validateStartBody({ courseId: "money-basics", lessonId: "re5-mock-a" })
    ).toMatchObject({ ok: false });
    expect(
      validateStartBody({ courseId: "re5-exam-prep", lessonId: "lesson-1" })
    ).toMatchObject({ ok: false });
  });

  it("accepts opaque answer IDs, explicit clearing, views and flags", () => {
    expect(
      validateMutationBody({
        action: "answer",
        mutationId: MUTATION_ID,
        questionIndex: 49,
        answeredOptionId: OPTION_ID,
      })
    ).toMatchObject({ ok: true, value: { answeredOptionId: OPTION_ID } });
    expect(
      validateMutationBody({
        action: "answer",
        mutationId: MUTATION_ID,
        questionIndex: 0,
        answeredOptionId: null,
      })
    ).toMatchObject({ ok: true, value: { answeredOptionId: null } });
    expect(
      validateMutationBody({
        action: "view",
        mutationId: MUTATION_ID,
        questionIndex: 0,
      })
    ).toMatchObject({ ok: true, value: { action: "view" } });
    expect(
      validateMutationBody({
        action: "flag",
        mutationId: MUTATION_ID,
        questionIndex: 0,
        flagged: true,
      })
    ).toMatchObject({ ok: true, value: { flagged: true } });
  });

  it("rejects authored indexes, malformed IDs and out-of-range positions", () => {
    expect(
      validateMutationBody({
        action: "answer",
        mutationId: MUTATION_ID,
        questionIndex: 0,
        answeredOptionId: 2,
      })
    ).toMatchObject({ ok: false });
    expect(
      validateMutationBody({
        action: "answer",
        mutationId: "not-a-uuid",
        questionIndex: 0,
        answeredOptionId: OPTION_ID,
      })
    ).toMatchObject({ ok: false });
    expect(
      validateMutationBody({
        action: "view",
        mutationId: MUTATION_ID,
        questionIndex: 50,
      })
    ).toMatchObject({ ok: false });
    expect(validateUuid(OPTION_ID)).toBe(true);
    expect(validateUuid("../../answers")).toBe(false);
  });
});
