import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  redactMockQuestionForClient,
  type StoredMockQuestion,
} from "@/lib/mockAttempts/server";

const STORED: StoredMockQuestion = {
  question_id: "00000000-0000-4000-8000-000000000001",
  question_index: 0,
  question_type: "mcq",
  question_text: "Which requirement applies?",
  question_content: null,
  options: [
    { id: "00000000-0000-4000-8000-000000000011", label: "A", text: "One" },
    { id: "00000000-0000-4000-8000-000000000012", label: "B", text: "Two" },
    { id: "00000000-0000-4000-8000-000000000013", label: "C", text: "Three" },
    { id: "00000000-0000-4000-8000-000000000014", label: "D", text: "Four" },
  ],
  correct_option_id: "00000000-0000-4000-8000-000000000013",
  answered_option_id: null,
  viewed: false,
  flagged: false,
  explanation: "Private marking rationale",
};

describe("active mock-attempt projection", () => {
  it("allow-lists learner state without keys, explanations or authoring IDs", () => {
    const projected = redactMockQuestionForClient(STORED);
    const serialized = JSON.stringify(projected);

    expect(projected).toEqual({
      id: STORED.question_id,
      questionIndex: 0,
      type: "mcq",
      prompt: "Which requirement applies?",
      content: null,
      options: STORED.options,
      answeredOptionId: null,
      viewed: false,
      flagged: false,
    });
    expect(serialized).not.toContain("correct_option_id");
    expect(serialized).not.toContain("correctOptionId");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("slot_id");
    expect(serialized).not.toContain("variant_id");
    expect(serialized).not.toContain("concept_id");
  });

  it("rejects malformed persisted option payloads instead of leaking raw data", () => {
    expect(() =>
      redactMockQuestionForClient({ ...STORED, options: [{ id: "one" }] })
    ).toThrow("invalid options");
  });
});
