import { CONTENT_DATA, type LessonStep } from "@/data/content";
import { CONCEPTS, type Concept, type ReviewCard } from "@/data/concepts";
import { isReviewExcludedCourse } from "@/lib/reviewPool";
import type { MasteryRecord } from "@/lib/spaced-repetition";

function asReviewCard(step: LessonStep): ReviewCard | null {
  if (step.type !== "mcq" && step.type !== "scenario") return null;
  if (!Array.isArray(step.options) || step.options.length !== 4) return null;
  if (step.correct < 0 || step.correct > 3) return null;
  const explanation =
    step.explanation ??
    step.feedback?.correct ??
    step.feedback?.incorrect ??
    "";
  return {
    question: step.question,
    options: step.options as [string, string, string, string],
    correct: step.correct as 0 | 1 | 2 | 3,
    explanation,
  };
}

function questionKey(card: ReviewCard): string {
  return card.question.trim().toLowerCase().replace(/\s+/g, " ");
}

let cached: Map<string, ReviewCard[]> | null = null;

function collectBankCards(): Map<string, ReviewCard[]> {
  if (cached) return cached;
  const byConcept = new Map<string, ReviewCard[]>();
  const seen = new Map<string, Set<string>>();

  const add = (conceptId: string | undefined, card: ReviewCard | null) => {
    if (!conceptId || !card) return;
    if (!CONCEPTS.some((c) => c.id === conceptId)) return;
    const key = questionKey(card);
    const used = seen.get(conceptId) ?? new Set();
    if (used.has(key)) return;
    used.add(key);
    seen.set(conceptId, used);
    const list = byConcept.get(conceptId) ?? [];
    list.push(card);
    byConcept.set(conceptId, list);
  };

  for (const course of CONTENT_DATA.courses) {
    if (isReviewExcludedCourse(course.id)) continue;
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const step of lesson.steps ?? []) {
          if ("conceptId" in step) add(step.conceptId, asReviewCard(step));
        }
        for (const slot of lesson.slots ?? []) {
          for (const variant of slot.variants) {
            const id = variant.step.conceptId ?? slot.conceptId;
            add(id, asReviewCard(variant.step));
          }
        }
      }
    }
  }

  cached = byConcept;
  return byConcept;
}

/** All distinct MCQ stems for a concept: authored review card first, then lesson variants. */
export function reviewPromptsFor(concept: Concept): ReviewCard[] {
  const extras = collectBankCards().get(concept.id) ?? [];
  const out: ReviewCard[] = [concept.reviewCard];
  const used = new Set([questionKey(concept.reviewCard)]);
  for (const card of extras) {
    const key = questionKey(card);
    if (used.has(key)) continue;
    used.add(key);
    out.push(card);
  }
  return out;
}

/**
 * Pick one stem for this review. Same concept keeps one SM-2 schedule;
 * the stem rotates with successful repetitions so retrieval is of the idea,
 * not the screenshot of yesterday's four options.
 */
export function promptForReview(concept: Concept, record: MasteryRecord): ReviewCard {
  const pool = reviewPromptsFor(concept);
  const idx = Math.abs(record.repetitions) % pool.length;
  return pool[idx]!;
}
