import "server-only";

import { randomInt, randomUUID } from "node:crypto";
import type { LessonBank } from "@/data/banks/money-basics";
import { RE5_MOCK_A_BANK } from "@/data/banks/re5-mock-a";
import { RE5_MOCK_B_BANK } from "@/data/banks/re5-mock-b";
import type { QuestionStep } from "@/data/content";
import {
  RE5_CONCEPT_AREAS,
  RE5_COURSE_ID,
  RE5_KNOWLEDGE_AREAS,
  examSpecFor,
} from "@/lib/results/re5";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RE5_SECURE_MOCK_BANKS: Record<string, LessonBank> = {
  ...RE5_MOCK_A_BANK,
  ...RE5_MOCK_B_BANK,
};

export type Re5MockOption = {
  id: string;
  label: (typeof OPTION_LABELS)[number];
  text: string;
};

export type Re5MockQuestionManifestItem = {
  question_id: string;
  question_index: number;
  slot_id: string;
  variant_id: string;
  concept_id: string | null;
  area_id: string;
  question_type: "mcq" | "scenario";
  question_text: string;
  question_content: string | null;
  options: Re5MockOption[];
  correct_option_id: string;
  explanation: string;
};

/** One row in the persisted private manifest. */
export type Re5MockQuestionManifest = Re5MockQuestionManifestItem;

export type Re5MockRandomIndex = (upperExclusive: number) => number;
export type Re5MockRandomUuid = () => string;

function cryptoRandomIndex(upperExclusive: number): number {
  return randomInt(upperExclusive);
}

function checkedRandomIndex(
  randomIndex: Re5MockRandomIndex,
  upperExclusive: number
): number {
  const value = randomIndex(upperExclusive);
  if (!Number.isInteger(value) || value < 0 || value >= upperExclusive) {
    throw new Error(
      `RE5 mock random source returned ${String(value)} for range 0-${upperExclusive - 1}`
    );
  }
  return value;
}

function nextOpaqueId(randomUuid: Re5MockRandomUuid, issued: Set<string>): string {
  const value = randomUuid();
  if (!UUID_PATTERN.test(value)) {
    throw new Error("RE5 mock UUID source returned a non-UUID value");
  }
  const canonical = value.toLowerCase();
  if (issued.has(canonical)) {
    throw new Error("RE5 mock UUID source returned a duplicate value");
  }
  issued.add(canonical);
  return canonical;
}

function fisherYatesIndices(
  length: number,
  randomIndex: Re5MockRandomIndex
): number[] {
  const indices = Array.from({ length }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapWith = checkedRandomIndex(randomIndex, index + 1);
    [indices[index], indices[swapWith]] = [indices[swapWith], indices[index]];
  }
  return indices;
}

/** Remove authored labels and correctness markers before neutral A-D labels. */
export function neutraliseRe5MockOptionText(value: string): string {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^\s*(?:option\s+)?[A-D]\s*[).:\-]\s*/i, "")
    .replace(
      /\s*(?:\(|\[)\s*(?:correct(?:\s+(?:answer|option))?|answer)\s*(?:\)|\])\s*$/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove an authored Q1/Question 1 prefix; paper position is separate data. */
export function neutraliseRe5MockQuestionText(value: string): string {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^\s*(?:question\s*|q\s*)\d+\s*[).:\-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function explanationFor(step: Extract<QuestionStep, { type: "mcq" | "scenario" }>): string {
  const authored = step.explanation?.trim();
  if (authored) return authored;

  const correct = step.feedback.correct.trim();
  const incorrect = step.feedback.incorrect.trim();
  if (!correct) return incorrect;
  if (!incorrect || incorrect === correct) return correct;
  return `${correct} ${incorrect}`;
}

function validateAuthoringBank(bank: LessonBank, totalQuestions: number): void {
  const slotIds = new Set<string>();
  const variantIds = new Set<string>();
  const referencedSlots = bank.layout.flatMap((item) =>
    "slot" in item ? [item.slot] : []
  );

  if (
    referencedSlots.length !== totalQuestions ||
    referencedSlots.some((slotId, index) => slotId !== bank.slots[index]?.slotId)
  ) {
    throw new Error("RE5 mock layout must reference every slot exactly once in order");
  }

  for (const slot of bank.slots) {
    if (!slot.slotId || slotIds.has(slot.slotId)) {
      throw new Error(`RE5 mock contains an invalid or duplicate slot: ${slot.slotId}`);
    }
    slotIds.add(slot.slotId);
    if (slot.variants.length === 0) {
      throw new Error(`${slot.slotId} has no variants`);
    }

    const conceptId = slot.conceptId ?? null;
    const areaId = conceptId ? RE5_CONCEPT_AREAS[conceptId] : undefined;
    if (!areaId || !RE5_KNOWLEDGE_AREAS[areaId]) {
      throw new Error(`${slot.slotId} has no RE5 knowledge area`);
    }

    for (const variant of slot.variants) {
      if (!variant.variantId || variantIds.has(variant.variantId)) {
        throw new Error(
          `RE5 mock contains an invalid or duplicate variant: ${variant.variantId}`
        );
      }
      variantIds.add(variant.variantId);

      const step = variant.step;
      if (step.type !== "mcq" && step.type !== "scenario") {
        throw new Error(`${variant.variantId} is not a four-option question`);
      }
      if (
        step.options.length !== OPTION_LABELS.length ||
        !Number.isInteger(step.correct) ||
        step.correct < 0 ||
        step.correct >= OPTION_LABELS.length
      ) {
        throw new Error(
          `${variant.variantId} must have four options and one valid key`
        );
      }
      if (!neutraliseRe5MockQuestionText(step.question)) {
        throw new Error(`${variant.variantId} has an empty question`);
      }

      const normalizedOptions = step.options.map((option) =>
        neutraliseRe5MockOptionText(option)
      );
      if (normalizedOptions.some((option) => !option)) {
        throw new Error(`${variant.variantId} has an empty option`);
      }
      if (
        new Set(normalizedOptions.map((option) => option.toLowerCase())).size !==
        OPTION_LABELS.length
      ) {
        throw new Error(`${variant.variantId} has duplicate neutralized options`);
      }
      if (!explanationFor(step)) {
        throw new Error(`${variant.variantId} has no explanation`);
      }
    }
  }
}

function validateBank(
  courseId: string,
  lessonId: string
): { bank: LessonBank; totalQuestions: number } {
  if (courseId !== RE5_COURSE_ID) {
    throw new Error("Unknown RE5 mock course");
  }

  const spec = examSpecFor(lessonId);
  const bank = RE5_SECURE_MOCK_BANKS[`${courseId}::${lessonId}`];
  if (!spec || !bank) {
    throw new Error("Unknown RE5 mock exam");
  }
  if (spec.totalQuestions !== 50 || bank.slots.length !== spec.totalQuestions) {
    throw new Error(
      `${lessonId} must have exactly ${spec.totalQuestions} secure question slots`
    );
  }

  validateAuthoringBank(bank, spec.totalQuestions);

  return { bank, totalQuestions: spec.totalQuestions };
}

/**
 * Build one private, server-owned RE5 paper.
 *
 * Variant choice, opaque IDs and answer order are generated once here. The
 * caller must persist the returned manifest for durable resume and must never
 * project `correct_option_id` or `explanation` into an active-attempt response.
 */
export function buildRe5MockQuestionManifest(
  courseId: string,
  lessonId: string,
  randomIndex: Re5MockRandomIndex = cryptoRandomIndex,
  randomUuid: Re5MockRandomUuid = randomUUID
): Re5MockQuestionManifestItem[] {
  const { bank, totalQuestions } = validateBank(courseId, lessonId);
  const issuedIds = new Set<string>();
  const slotIds = new Set<string>();

  const manifest = bank.slots.map((slot, questionIndex) => {
    if (!slot.slotId || slotIds.has(slot.slotId)) {
      throw new Error(`RE5 mock contains an invalid or duplicate slot: ${slot.slotId}`);
    }
    slotIds.add(slot.slotId);

    if (slot.variants.length === 0) {
      throw new Error(`${slot.slotId} has no variants`);
    }
    const variant = slot.variants[
      checkedRandomIndex(randomIndex, slot.variants.length)
    ];
    const step = variant.step;
    if (step.type !== "mcq" && step.type !== "scenario") {
      throw new Error(`${variant.variantId} is not a four-option question`);
    }
    if (
      step.options.length !== OPTION_LABELS.length ||
      !Number.isInteger(step.correct) ||
      step.correct < 0 ||
      step.correct >= OPTION_LABELS.length
    ) {
      throw new Error(`${variant.variantId} must have four options and one valid key`);
    }

    const conceptId = slot.conceptId ?? null;
    const areaId = conceptId ? RE5_CONCEPT_AREAS[conceptId] : undefined;
    if (!areaId) {
      throw new Error(`${slot.slotId} has no RE5 knowledge area`);
    }

    const questionText = neutraliseRe5MockQuestionText(step.question);
    if (!questionText) {
      throw new Error(`${variant.variantId} has an empty question`);
    }

    const optionIds = step.options.map(() => nextOpaqueId(randomUuid, issuedIds));
    const optionOrder = fisherYatesIndices(step.options.length, randomIndex);
    const options = optionOrder.map((authoredIndex, displayIndex) => {
      const text = neutraliseRe5MockOptionText(step.options[authoredIndex]);
      if (!text) {
        throw new Error(`${variant.variantId} has an empty option`);
      }
      return {
        id: optionIds[authoredIndex],
        label: OPTION_LABELS[displayIndex],
        text,
      };
    });

    const explanation = explanationFor(step);
    if (!explanation) {
      throw new Error(`${variant.variantId} has no explanation`);
    }

    return {
      question_id: nextOpaqueId(randomUuid, issuedIds),
      question_index: questionIndex,
      slot_id: slot.slotId,
      variant_id: variant.variantId,
      concept_id: conceptId,
      area_id: areaId,
      question_type: step.type,
      question_text: questionText,
      question_content: step.content?.trim() || null,
      options,
      correct_option_id: optionIds[step.correct],
      explanation,
    } satisfies Re5MockQuestionManifestItem;
  });

  if (manifest.length !== totalQuestions) {
    throw new Error(`${lessonId} did not produce a complete secure paper`);
  }
  return manifest;
}
