/**
 * RE5-specific exam facts and the knowledge-area map for the two mock exams.
 *
 * RE5 is the FSCA Regulatory Examination Level 1 for representatives under the
 * FAIS Act. The real paper is 50 questions in 2 hours and the pass mark is 33
 * correct — 66%. Every one of those numbers is stated here once, as a count
 * wherever possible, and read from here everywhere else.
 *
 * ⚠️ Verify against the current FSCA "RE Preparation Guide" before a sitting.
 * If the FSCA amends the format, this file is the only place to change it.
 */

import type { WorkingStep } from "@/lib/lessonMastery";
import type { AreaResolver } from "@/lib/results/score";

export const RE5_COURSE_ID = "re5-exam-prep";

export type ExamSpec = {
  lessonId: string;
  label: string;
  totalQuestions: number;
  /**
   * The pass mark as a COUNT of correct answers, not a percentage.
   * 33 of 50 is exactly 66%, but a count derived from a percentage is a
   * floating-point boundary and rounds up by one for some totals — see
   * requiredCorrect() in ./score. Written down, it cannot.
   */
  passMarkCorrect: number;
  /** Displayed alongside the count. Never used to compute the count. */
  passMarkPct: number;
  timeLimitMinutes: number;
};

export const RE5_MOCK_EXAMS: Record<string, ExamSpec> = {
  "re5-mock-a": {
    lessonId: "re5-mock-a",
    label: "Mock Exam A",
    totalQuestions: 50,
    passMarkCorrect: 33,
    passMarkPct: 66,
    timeLimitMinutes: 120,
  },
  "re5-mock-b": {
    lessonId: "re5-mock-b",
    label: "Mock Exam B",
    totalQuestions: 50,
    passMarkCorrect: 33,
    passMarkPct: 66,
    timeLimitMinutes: 120,
  },
};

export function examSpecFor(lessonId: string): ExamSpec | null {
  return RE5_MOCK_EXAMS[lessonId] ?? null;
}

export function isRe5MockExam(lessonId: string): boolean {
  return lessonId in RE5_MOCK_EXAMS;
}

// ── Knowledge areas ─────────────────────────────────────────────────────────
// These mirror the eight teaching units of the RE5 course one-for-one, so a
// weak area on a mock maps to a unit the learner can actually go and redo.

export type KnowledgeArea = {
  areaId: string;
  areaLabel: string;
  /** The unit in RE5_COURSE that teaches this area. */
  unitId: string;
};

export const RE5_KNOWLEDGE_AREAS: Record<string, KnowledgeArea> = {
  framework: {
    areaId: "framework",
    areaLabel: "FAIS Act & Regulatory Framework",
    unitId: "re5-unit-1",
  },
  licensing: {
    areaId: "licensing",
    areaLabel: "Licensing & the FSP",
    unitId: "re5-unit-2",
  },
  representatives: {
    areaId: "representatives",
    areaLabel: "Key Individuals & Representatives",
    unitId: "re5-unit-3",
  },
  fitproper: {
    areaId: "fitproper",
    areaLabel: "Fit & Proper Requirements",
    unitId: "re5-unit-4",
  },
  disclosure: {
    areaId: "disclosure",
    areaLabel: "General Code — Duties & Disclosure",
    unitId: "re5-unit-5",
  },
  suitability: {
    areaId: "suitability",
    areaLabel: "General Code — Suitability, Records & Conflicts",
    unitId: "re5-unit-6",
  },
  complaints: {
    areaId: "complaints",
    areaLabel: "Complaints, TCF & the FAIS Ombud",
    unitId: "re5-unit-7",
  },
  fica: {
    areaId: "fica",
    areaLabel: "FICA & Anti-Money-Laundering",
    unitId: "re5-unit-8",
  },
};

/**
 * Concept id → knowledge area.
 *
 * THIS is the primary attribution, and it is the one that works on the live
 * path. Every slot in the RE5 question banks carries a `conceptId`
 * (src/data/banks/re5-mock-a.ts et al), and lessonBank.ts:148 attaches it to
 * every resolved step. It is a small, stable vocabulary that names what the
 * question tests, so it survives slots being renumbered, reordered, or added.
 *
 * Do not attribute by the "Qn." prefix alone: the bank variants — which is
 * what learners actually sit — carry NO question numbers. Only the static
 * fallback steps in content-re5.ts do. An earlier revision of this file keyed
 * solely on that prefix and would have filed all 50 questions of every real
 * sitting under "Unclassified".
 */
export const RE5_CONCEPT_AREAS: Record<string, string> = {
  "fais-purpose": "framework",
  "fais-definitions": "framework",

  "fsp-categories": "licensing",
  "fsp-licence-action": "licensing",

  "fais-representatives": "representatives",
  "fais-debarment": "representatives",

  "fit-and-proper": "fitproper",
  "fais-competence-cpd": "fitproper",

  "code-general-duty": "disclosure",
  "code-disclosures": "disclosure",

  "code-suitability": "suitability",
  "code-records-coi": "suitability",

  "tcf-complaints": "complaints",
  "fais-ombud": "complaints",

  fica: "fica",
};

/**
 * Question number → knowledge area, per mock exam. The FALLBACK.
 *
 * Used when a step has no recognised `conceptId`: keyed on the slot number in
 * `__slotId` ("re5-exam-prep/mock-a/q17"), and failing that on the "Qn."
 * prefix in the static content-re5.ts steps. Never on position in the array —
 * the step list is shuffled per learner (lessonShuffle.ts) and grows re-queued
 * copies mid-attempt, so an index-based map would mis-attribute everything.
 *
 * The mapping is editorial, read off each question against the unit that
 * teaches it. Where a question spans two areas it is filed under the rule it
 * actually tests: Mock A Q41 ("advise on a structure you aren't licensed for")
 * is Licensing, not Suitability, because the answer turns on authorised
 * categories.
 */
const MOCK_A_AREAS: Record<number, string> = {
  1: "framework", 2: "framework", 3: "framework",
  4: "representatives",
  5: "licensing", 6: "licensing", 7: "licensing", 8: "licensing",
  9: "representatives", 10: "representatives", 11: "representatives",
  12: "representatives",
  13: "fitproper", 14: "fitproper", 15: "fitproper",
  16: "disclosure", 17: "disclosure", 18: "disclosure", 19: "disclosure",
  20: "disclosure",
  21: "suitability", 22: "suitability", 23: "suitability", 24: "suitability",
  25: "suitability", 26: "suitability", 27: "suitability",
  28: "complaints", 29: "complaints", 30: "complaints", 31: "complaints",
  32: "complaints", 33: "complaints", 34: "complaints", 35: "complaints",
  36: "fica", 37: "fica", 38: "fica", 39: "fica", 40: "fica",
  41: "licensing",
  42: "suitability",
  43: "disclosure",
  44: "fica",
  45: "licensing", 46: "licensing",
  47: "fitproper",
  48: "licensing",
  49: "complaints",
  50: "disclosure",
};

const MOCK_B_AREAS: Record<number, string> = {
  1: "framework", 2: "framework", 3: "framework",
  4: "licensing", 5: "licensing",
  6: "fitproper", 7: "fitproper", 8: "fitproper", 9: "fitproper",
  10: "representatives", 11: "representatives", 12: "representatives",
  13: "representatives",
  14: "disclosure", 15: "disclosure", 16: "disclosure",
  17: "suitability", 18: "suitability", 19: "suitability", 20: "suitability",
  21: "suitability", 22: "suitability",
  23: "complaints",
  24: "suitability", 25: "suitability",
  26: "complaints", 27: "complaints", 28: "complaints", 29: "complaints",
  30: "complaints",
  31: "fica", 32: "fica", 33: "fica", 34: "fica",
  35: "fitproper", 36: "fitproper",
  37: "suitability",
  38: "complaints",
  39: "fitproper",
  40: "disclosure",
  41: "suitability",
  42: "fitproper",
  43: "complaints",
  44: "framework",
  45: "suitability",
  46: "complaints", 47: "complaints",
  48: "fitproper",
  49: "disclosure",
  50: "framework",
};

const AREA_MAPS: Record<string, Record<number, string>> = {
  "re5-mock-a": MOCK_A_AREAS,
  "re5-mock-b": MOCK_B_AREAS,
};

/** The `conceptId` a resolved bank step carries, if any. */
export function conceptIdOf(step: WorkingStep): string | null {
  if (!("conceptId" in step)) return null;
  const id = (step as { conceptId?: unknown }).conceptId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * The question's number in the paper, from whichever source has it.
 *
 * `__slotId` first — bank slots are named "re5-exam-prep/mock-a/q17" and that
 * is what a real sitting produces. The "Q17." text prefix second, which only
 * the static content-re5.ts steps carry.
 */
export function questionNumberOf(step: WorkingStep): number | null {
  const slotId = step.__slotId;
  if (typeof slotId === "string") {
    const m = /\/q(\d+)$/.exec(slotId);
    if (m) {
      const n = Number(m[1]);
      if (Number.isInteger(n) && n > 0) return n;
    }
  }
  const text =
    "question" in step && typeof step.question === "string"
      ? step.question
      : null;
  if (!text) return null;
  const m = /^\s*Q(\d+)\s*[.):]/.exec(text);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Area resolver for an RE5 lesson.
 *
 * Tries `conceptId` first (works on every bank-backed lesson, mock or
 * teaching), then the question number from `__slotId` or the "Qn." prefix
 * against this exam's map. Returns null for anything it cannot place, which
 * `breakdownByArea` files under "Unclassified" — a visible gap in the
 * breakdown, rather than a question quietly padding whichever area came first.
 */
export function re5AreaResolver(lessonId: string): AreaResolver {
  const numberMap = AREA_MAPS[lessonId];
  return (step) => {
    const byConcept = RE5_CONCEPT_AREAS[conceptIdOf(step) ?? ""];
    if (byConcept) return labelFor(byConcept);

    if (!numberMap) return null;
    const n = questionNumberOf(step);
    if (n === null) return null;
    return labelFor(numberMap[n]);
  };
}

function labelFor(areaId: string | undefined) {
  const area = areaId ? RE5_KNOWLEDGE_AREAS[areaId] : undefined;
  return area ? { areaId: area.areaId, areaLabel: area.areaLabel } : null;
}

/** Total questions the area map accounts for — asserted in the unit tests. */
export function mappedQuestionCount(lessonId: string): number {
  return Object.keys(AREA_MAPS[lessonId] ?? {}).length;
}
