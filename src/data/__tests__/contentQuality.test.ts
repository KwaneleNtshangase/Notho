import { describe, it, expect } from "vitest";
import { CONTENT_DATA } from "@/data/content";
import type { LessonStep } from "@/data/content";
import { LESSON_BANKS } from "@/data/banks";
import { CONCEPTS } from "@/data/concepts";

/**
 * Content quality guards — keep answer patterns out of the question bank.
 *
 * Background (July 2026 audit): 85% of correct answers sat at index 1 and 82%
 * of correct answers were the uniquely longest option (chance: 25%), with the
 * worst offenders 3-5x longer than every distractor. Rendering now shuffles
 * option POSITIONS per user (see src/lib/lessonShuffle.ts), so index bias in
 * the authored data no longer reaches users and is not tested here. LENGTH
 * bias cannot be fixed at render time — these tests stop it regressing.
 *
 * The thresholds are RATCHETS set just above the current measured state.
 * When you fix more content, lower them. Never raise them.
 */

type OptionQ = {
  course: string;
  lesson: string;
  options: string[];
  correct: number;
};

function collect() {
  const optionQs: OptionQ[] = [];
  let tfTrue = 0;
  let tfTotal = 0;
  const lessonIds: string[] = [];
  for (const course of CONTENT_DATA.courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        lessonIds.push(`${course.id}:${lesson.id}`);
        for (const s of (lesson.steps ?? []) as LessonStep[]) {
          if (
            (s.type === "mcq" || s.type === "scenario") &&
            Array.isArray((s as { options?: string[] }).options) &&
            typeof (s as { correct?: number }).correct === "number"
          ) {
            const q = s as unknown as { options: string[]; correct: number };
            optionQs.push({ course: course.id, lesson: lesson.id, options: q.options, correct: q.correct });
          }
          if (s.type === "true-false") {
            tfTotal++;
            if (s.correct === true) tfTrue++;
          }
        }
      }
    }
  }
  return { optionQs, tfTrue, tfTotal, lessonIds };
}

function lengthStats(q: OptionQ) {
  const lens = q.options.map((o) => (o ?? "").length);
  const max = Math.max(...lens);
  const uniquelyLongest = lens[q.correct] === max && lens.filter((l) => l === max).length === 1;
  const sorted = [...lens].sort((a, b) => b - a);
  const marginPct = sorted[1] ? Math.round((100 * (sorted[0] - sorted[1])) / sorted[1]) : 0;
  return { uniquelyLongest, marginPct };
}

const Q_TYPES = new Set(["mcq", "scenario", "true-false", "fill-blank"]);

/**
 * Questions a learner actually sees in a lesson. Bank lessons (layout + slots)
 * show one question per slot reference; legacy lessons count their steps.
 */
function lessonQuestionCount(lesson: {
  layout?: unknown[];
  slots?: unknown[];
  steps?: LessonStep[];
  secureQuestionCount?: number;
}): number {
  if (typeof lesson.secureQuestionCount === "number") return lesson.secureQuestionCount;
  if (Array.isArray(lesson.layout) && Array.isArray(lesson.slots) && lesson.slots.length > 0) {
    let n = 0;
    for (const item of lesson.layout as Array<Record<string, unknown>>) {
      if (item && typeof item === "object" && "slot" in item) n++;
      else if (item && Q_TYPES.has(item.type as string)) n++;
    }
    return n;
  }
  return (lesson.steps ?? []).filter((s) => Q_TYPES.has(s.type)).length;
}

describe("content quality — answer patterns", () => {
  const { optionQs, tfTrue, tfTotal, lessonIds } = collect();

  it("has a valid correct index on every option question", () => {
    for (const q of optionQs) {
      expect(q.correct, `${q.course}/${q.lesson}`).toBeGreaterThanOrEqual(0);
      expect(q.correct, `${q.course}/${q.lesson}`).toBeLessThan(q.options.length);
    }
  });

  it("no question's correct answer dwarfs its distractors (flagrant length bias)", () => {
    // RATCHET: after rewrite pass 3 no question exceeds a 100% margin
    // (worst is 96%). New/edited questions must stay under this.
    const MAX_MARGIN_PCT = 100;
    const offenders = optionQs
      .map((q) => ({ q, s: lengthStats(q) }))
      .filter(({ s }) => s.uniquelyLongest && s.marginPct >= MAX_MARGIN_PCT);
    expect(
      offenders.map(({ q, s }) => `${q.course}/${q.lesson} (+${s.marginPct}%)`),
      "Correct answer is flagrantly longer than every distractor. Tighten it or strengthen the distractors."
    ).toEqual([]);
  });

  it("keeps the correct-is-longest count from regressing", () => {
    // Secure mocks moved out of this client-content sample, so its denominator
    // changed. Preserve the pre-move numerator as an absolute ratchet instead
    // of loosening a percentage until it passes.
    const MAX_LONGEST_COUNT = 440;
    const longest = optionQs.filter((q) => lengthStats(q).uniquelyLongest).length;
    expect(longest).toBeLessThanOrEqual(MAX_LONGEST_COUNT);
  });

  it("keeps the flagrant (>=40% margin) count from regressing", () => {
    // The previous 147 included client fallback mocks that no longer ship.
    // 138 is the unchanged non-mock numerator at the server boundary move.
    const MAX_FLAGRANT = 138;
    const flagrant = optionQs.filter((q) => {
      const s = lengthStats(q);
      return s.uniquelyLongest && s.marginPct >= 40;
    }).length;
    expect(flagrant).toBeLessThanOrEqual(MAX_FLAGRANT);
  });

  it("keeps true/false answers roughly balanced", () => {
    // Was 70% "true" before the July 2026 rebalance; now ~58%. Keep it in a
    // band a pattern-spotter cannot exploit.
    const share = tfTrue / tfTotal;
    expect(share).toBeGreaterThanOrEqual(0.4);
    expect(share).toBeLessThanOrEqual(0.62);
  });

  it("lesson ids are unique (completed_lessons keys depend on them)", () => {
    const dupes = lessonIds.filter((id, i) => lessonIds.indexOf(id) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });

  it("every lesson has more than 3 questions", () => {
    const short: string[] = [];
    for (const course of CONTENT_DATA.courses) {
      for (const unit of course.units) {
        for (const lesson of unit.lessons) {
          const n = lessonQuestionCount(lesson);
          if (n <= 3) short.push(`${course.id}/${lesson.id}=${n}`);
        }
      }
    }
    expect(
      short,
      "These lessons have 3 or fewer questions. Every lesson must have more than 3."
    ).toEqual([]);
  });
});

describe("lesson bank guards", () => {
  const conceptIds = new Set(CONCEPTS.map((c) => c.id));

  it("has no duplicate slotId or variantId across LESSON_BANKS", () => {
    const slotIds = new Set<string>();
    const variantIds = new Set<string>();
    const dupSlots: string[] = [];
    const dupVariants: string[] = [];

    for (const bank of Object.values(LESSON_BANKS)) {
      for (const slot of bank.slots) {
        if (slotIds.has(slot.slotId)) dupSlots.push(slot.slotId);
        else slotIds.add(slot.slotId);

        for (const variant of slot.variants) {
          if (variantIds.has(variant.variantId)) dupVariants.push(variant.variantId);
          else variantIds.add(variant.variantId);
        }
      }
    }

    expect(dupSlots, "Duplicate slotId values found").toEqual([]);
    expect(dupVariants, "Duplicate variantId values found").toEqual([]);
  });

  it("every slot conceptId exists in CONCEPTS", () => {
    const missing: string[] = [];
    for (const bank of Object.values(LESSON_BANKS)) {
      for (const slot of bank.slots) {
        if (!slot.conceptId) {
          missing.push(`${slot.slotId} (missing conceptId)`);
        } else if (!conceptIds.has(slot.conceptId)) {
          missing.push(`${slot.slotId} → ${slot.conceptId}`);
        }
      }
    }
    expect(missing, "Unknown or missing conceptId on bank slots").toEqual([]);
  });

  it("every slot has at least 2 variants", () => {
    const short: string[] = [];
    for (const bank of Object.values(LESSON_BANKS)) {
      for (const slot of bank.slots) {
        if (slot.variants.length < 2) short.push(`${slot.slotId}=${slot.variants.length}`);
      }
    }
    expect(short, "Slots need ≥2 variants for anti-repeat variety").toEqual([]);
  });
});
