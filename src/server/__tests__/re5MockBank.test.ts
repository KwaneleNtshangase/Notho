import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildRe5MockQuestionManifest,
  neutraliseRe5MockOptionText,
  neutraliseRe5MockQuestionText,
} from "@/server/re5MockBank";

function deterministicUuids() {
  let value = 0;
  return () => {
    value += 1;
    return `00000000-0000-4000-8000-${value.toString(16).padStart(12, "0")}`;
  };
}

function chooseVariant(variantIndex: number) {
  let call = 0;
  return (upperExclusive: number) => {
    const positionInQuestion = call % 4;
    call += 1;
    return positionInQuestion === 0 ? variantIndex % upperExclusive : 0;
  };
}

describe("RE5 server-only mock bank", () => {
  for (const lessonId of ["re5-mock-a", "re5-mock-b"]) {
    it(`${lessonId} builds a complete private manifest`, () => {
      const manifest = buildRe5MockQuestionManifest(
        "re5-exam-prep",
        lessonId,
        () => 0,
        deterministicUuids()
      );

      expect(manifest).toHaveLength(50);
      expect(manifest.map((question) => question.question_index)).toEqual(
        Array.from({ length: 50 }, (_, index) => index)
      );

      const opaqueIds = new Set<string>();
      for (const question of manifest) {
        expect(Object.keys(question).sort()).toEqual(
          [
            "area_id",
            "concept_id",
            "correct_option_id",
            "explanation",
            "options",
            "question_content",
            "question_id",
            "question_index",
            "question_text",
            "question_type",
            "slot_id",
            "variant_id",
          ].sort()
        );
        expect(question.options.map((option) => option.label)).toEqual([
          "A",
          "B",
          "C",
          "D",
        ]);
        expect(question.options).toHaveLength(4);
        expect(question.options.some((option) => option.id === question.correct_option_id)).toBe(
          true
        );
        expect(question.area_id).toBeTruthy();
        expect(question.explanation).toBeTruthy();
        expect(question.question_text).not.toMatch(/^\s*(?:question\s*|q\s*)\d+[).:\-]/i);

        for (const id of [
          question.question_id,
          ...question.options.map((option) => option.id),
        ]) {
          expect(id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          );
          expect(opaqueIds.has(id)).toBe(false);
          opaqueIds.add(id);
        }
        for (const option of question.options) {
          expect(option.text).not.toMatch(/^\s*(?:option\s+)?[A-D]\s*[).:\-]/i);
          expect(option.text).not.toMatch(
            /(?:\(|\[)\s*(?:correct(?:\s+(?:answer|option))?|answer)\s*(?:\)|\])\s*$/i
          );
        }
      }
      expect(opaqueIds.size).toBe(250);
    });
  }

  it("uses the injected source for variant selection and Fisher-Yates order", () => {
    const manifest = buildRe5MockQuestionManifest(
      "re5-exam-prep",
      "re5-mock-a",
      chooseVariant(1),
      deterministicUuids()
    );

    expect(manifest[0].variant_id).toBe("r5a-q1-v2");
    expect(
      manifest[0].options.find(
        (option) => option.id === manifest[0].correct_option_id
      )?.label
    ).toBe("D");
  });

  it("can select the second authored variant throughout either paper", () => {
    for (const [lessonId, prefix] of [
      ["re5-mock-a", "r5a"],
      ["re5-mock-b", "r5b"],
    ] as const) {
      const manifest = buildRe5MockQuestionManifest(
        "re5-exam-prep",
        lessonId,
        chooseVariant(1),
        deterministicUuids()
      );
      expect(manifest.every((question) => question.variant_id.startsWith(prefix))).toBe(
        true
      );
      expect(manifest.every((question) => question.variant_id.endsWith("-v2"))).toBe(
        true
      );
    }
  });

  it("keeps both authored variants free of an extreme correct-answer length tell", () => {
    const offenders: string[] = [];
    for (const lessonId of ["re5-mock-a", "re5-mock-b"]) {
      for (const variantIndex of [0, 1]) {
        const manifest = buildRe5MockQuestionManifest(
          "re5-exam-prep",
          lessonId,
          chooseVariant(variantIndex),
          deterministicUuids()
        );
        for (const question of manifest) {
          const correct = question.options.find(
            (option) => option.id === question.correct_option_id
          )!;
          const distractorLengths = question.options
            .filter((option) => option.id !== question.correct_option_id)
            .map((option) => option.text.length)
            .sort((a, b) => b - a);
          const nextLongest = distractorLengths[0];
          if (
            correct.text.length > nextLongest &&
            correct.text.length - nextLongest >= nextLongest
          ) {
            offenders.push(question.variant_id);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("distributes an authored correct answer across neutral A-D positions", () => {
    let state = 0x6d2b79f5;
    const randomIndex = (upperExclusive: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return Math.floor((state / 0x100000000) * upperExclusive);
    };
    const counts = new Map<string, number>([
      ["A", 0],
      ["B", 0],
      ["C", 0],
      ["D", 0],
    ]);

    for (let attempt = 0; attempt < 1_000; attempt += 1) {
      const first = buildRe5MockQuestionManifest(
        "re5-exam-prep",
        "re5-mock-a",
        randomIndex,
        deterministicUuids()
      )[0];
      const label = first.options.find(
        (option) => option.id === first.correct_option_id
      )!.label;
      counts.set(label, counts.get(label)! + 1);
    }

    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(200);
      expect(count).toBeLessThan(300);
    }
  });

  it("neutralises authored question numbers, labels and answer markers", () => {
    expect(neutraliseRe5MockQuestionText(" Q17.  Which rule applies? ")).toBe(
      "Which rule applies?"
    );
    expect(
      neutraliseRe5MockOptionText(" A)  Keep proper records [correct answer] ")
    ).toBe("Keep proper records");
    expect(
      neutraliseRe5MockOptionText("Option D: Refer the complaint (answer)")
    ).toBe("Refer the complaint");
  });

  it("rejects unknown banks and invalid entropy sources", () => {
    expect(() =>
      buildRe5MockQuestionManifest(
        "another-course",
        "re5-mock-a",
        () => 0,
        deterministicUuids()
      )
    ).toThrow("Unknown RE5 mock course");
    expect(() =>
      buildRe5MockQuestionManifest(
        "re5-exam-prep",
        "lesson-1",
        () => 0,
        deterministicUuids()
      )
    ).toThrow("Unknown RE5 mock exam");
    expect(() =>
      buildRe5MockQuestionManifest(
        "re5-exam-prep",
        "re5-mock-a",
        (upperExclusive) => upperExclusive,
        deterministicUuids()
      )
    ).toThrow("random source returned");
    expect(() =>
      buildRe5MockQuestionManifest(
        "re5-exam-prep",
        "re5-mock-a",
        () => 0,
        () => "not-a-uuid"
      )
    ).toThrow("non-UUID");

    let uuidCall = 0;
    expect(() =>
      buildRe5MockQuestionManifest(
        "re5-exam-prep",
        "re5-mock-a",
        () => 0,
        () => {
          uuidCall += 1;
          return uuidCall === 1
            ? "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA"
            : "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
        }
      )
    ).toThrow("duplicate");
  });
});
