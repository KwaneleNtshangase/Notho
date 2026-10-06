import { CONTENT_DATA, type LessonStep } from "@/data/content";
import { CONCEPTS, type Concept, type ReviewCard } from "@/data/concepts";
import { sastToday } from "@/lib/dates";
import { hashSeed } from "@/lib/lessonShuffle";
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

function questionKey(card: Pick<ReviewCard, "question">): string {
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

const LAST_STEM_KEY = "notho-review-last-stem";

function readLastStem(conceptId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const map = JSON.parse(localStorage.getItem(LAST_STEM_KEY) ?? "{}") as Record<string, string>;
    return map[conceptId] ?? null;
  } catch {
    return null;
  }
}

/** Remember the stem just shown so the next review of this concept skips it. */
export function rememberReviewStem(conceptId: string, question: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = JSON.parse(localStorage.getItem(LAST_STEM_KEY) ?? "{}") as Record<string, string>;
    map[conceptId] = questionKey({ question });
    localStorage.setItem(LAST_STEM_KEY, JSON.stringify(map));
  } catch {
    /* best-effort */
  }
}

/**
 * Pick one stem for this review. The SM-2 schedule stays on the concept.
 * The wording does not: a miss resets repetitions to 0, so indexing by
 * repetitions always replayed the same sentence. Day + last stem pick a
 * different lesson variant whenever one exists.
 */
export function promptForReview(concept: Concept, record: MasteryRecord): ReviewCard {
  const pool = reviewPromptsFor(concept);
  if (pool.length <= 1) return pool[0]!;
  const day = sastToday();
  let idx = Math.abs(hashSeed(`${concept.id}:${day}:${record.concept_id}`)) % pool.length;
  const last = readLastStem(concept.id);
  if (last && questionKey(pool[idx]!) === last) {
    idx = (idx + 1) % pool.length;
  }
  return pool[idx]!;
}
