/**
 * Notho - SM-2 Spaced Repetition Engine
 *
 * Based on the SuperMemo SM-2 algorithm (Anki-style) plus the spacing and
 * testing effects: first exposure schedules a delayed review; only the review
 * session graduates the card; a failed retrieval resets the interval to 1 day.
 */

export type MasteryRecord = {
  concept_id: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review_date: string; // "YYYY-MM-DD"
  last_reviewed_at: string; // ISO timestamp
};

/** Quality score from 0–5 (like SM-2):
 *  5 = perfect recall, fast
 *  4 = correct, small hesitation
 *  3 = correct after difficulty
 *  2 = wrong, but correct answer felt obvious
 *  1 = wrong, remembered correct answer when shown
 *  0 = completely forgot
 *
 * In Notho we map: correct answer → 4, wrong answer → 1
 */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
import { supabase } from "@/lib/supabaseClient";
import { sastToday } from "@/lib/dates";
import { isReviewPoolConceptId } from "@/lib/reviewPool";

const MIN_EASE = 1.3;

/** Cap a single Learn review sitting so due piles do not become a cram session. */
export const REVIEW_SESSION_CAP = 20;

/**
 * Apply the SM-2 algorithm to an existing mastery record.
 * Returns a NEW record (immutable update).
 */
export function applyReview(
  record: MasteryRecord,
  quality: ReviewQuality
): MasteryRecord {
  const { ease_factor, repetitions, interval_days } = record;

  const newEase = Math.max(
    MIN_EASE,
    ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval_days * newEase);
    }
  }

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    ...record,
    interval_days: newInterval,
    ease_factor: newEase,
    repetitions: newRepetitions,
    next_review_date: toDateString(nextReview),
    last_reviewed_at: now.toISOString(),
  };
}

/**
 * Create a brand-new mastery record for a concept (first exposure).
 * Scheduled for review tomorrow — the first successful retrieval is delayed.
 */
export function createMasteryRecord(conceptId: string): MasteryRecord {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    concept_id: conceptId,
    interval_days: 1,
    ease_factor: 2.5,
    repetitions: 0,
    next_review_date: toDateString(tomorrow),
    last_reviewed_at: new Date().toISOString(),
  };
}

export function isDue(record: MasteryRecord): boolean {
  return record.next_review_date <= sastToday();
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function loadMastery(): Promise<Record<string, MasteryRecord>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase
    .from("concept_mastery")
    .select("concept_id,interval_days,ease_factor,repetitions,next_review_date,last_reviewed_at")
    .eq("user_id", user.id);
  const out: Record<string, MasteryRecord> = {};
  for (const row of (data ?? []) as any[]) {
    out[row.concept_id] = {
      concept_id: row.concept_id,
      interval_days: row.interval_days,
      ease_factor: row.ease_factor,
      repetitions: row.repetitions,
      next_review_date: row.next_review_date,
      last_reviewed_at: row.last_reviewed_at,
    };
  }
  return out;
}

export async function saveMastery(record: MasteryRecord): Promise<void> {
  await syncMasteryToSupabase(record);
}

async function syncMasteryToSupabase(record: MasteryRecord): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("concept_mastery").upsert(
      {
        user_id: user.id,
        concept_id: record.concept_id,
        interval_days: record.interval_days,
        ease_factor: record.ease_factor,
        repetitions: record.repetitions,
        next_review_date: record.next_review_date,
        last_reviewed_at: record.last_reviewed_at,
      },
      { onConflict: "user_id,concept_id" }
    );
  } catch {
    // Silent fail
  }
}

/**
 * Introduce concepts after a lesson (or course) without resetting mastery.
 * New cards are due tomorrow. Existing cards keep their SM-2 schedule.
 */
export async function scheduleConceptsForCourse(conceptIds: string[]): Promise<void> {
  const reviewable = conceptIds.filter(isReviewPoolConceptId);
  if (reviewable.length === 0) return;
  const all = await loadMastery();
  const newRecords: MasteryRecord[] = [];
  for (const id of reviewable) {
    if (!all[id]) {
      all[id] = createMasteryRecord(id);
      newRecords.push(all[id]);
    }
  }
  if (newRecords.length > 0) {
    await Promise.all(newRecords.map((r) => syncMasteryToSupabase(r)));
  }
}

export async function getDueCards(): Promise<MasteryRecord[]> {
  const all = await loadMastery();
  const today = toDateString(new Date());
  return Object.values(all)
    .filter((r) => isReviewPoolConceptId(r.concept_id))
    .filter((r) => r.next_review_date <= today)
    .sort((a, b) => {
      const dueDateCmp = a.next_review_date.localeCompare(b.next_review_date);
      if (dueDateCmp !== 0) return dueDateCmp;
      const lastReviewedCmp = a.last_reviewed_at.localeCompare(b.last_reviewed_at);
      if (lastReviewedCmp !== 0) return lastReviewedCmp;
      return a.concept_id.localeCompare(b.concept_id);
    });
}

/** Due cards for one sitting. Banner count still uses the full due list. */
export async function getReviewSessionQueue(): Promise<MasteryRecord[]> {
  const due = await getDueCards();
  return due.slice(0, REVIEW_SESSION_CAP);
}

export async function getDueCount(): Promise<number> {
  const due = await getDueCards();
  return due.length;
}

/**
 * Lesson encounter of a concept.
 *
 * Study is not review. A first exposure only inserts a card due tomorrow.
 * A later miss in a lesson pulls the card back to a 1-day interval so the
 * idea is retrieved again soon. A later hit in a lesson does not graduate
 * the card — that would collapse the spacing effect.
 */
export async function recordConceptResult(
  conceptId: string,
  isCorrect: boolean
): Promise<void> {
  try {
    if (!isReviewPoolConceptId(conceptId)) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("concept_mastery")
      .select(
        "concept_id,interval_days,ease_factor,repetitions,next_review_date,last_reviewed_at"
      )
      .eq("user_id", user.id)
      .eq("concept_id", conceptId)
      .maybeSingle();

    if (!data) {
      await syncMasteryToSupabase(createMasteryRecord(conceptId));
      return;
    }

    if (isCorrect) return;

    const current: MasteryRecord = {
      concept_id: (data as any).concept_id,
      interval_days: (data as any).interval_days,
      ease_factor: (data as any).ease_factor,
      repetitions: (data as any).repetitions,
      next_review_date: (data as any).next_review_date,
      last_reviewed_at: (data as any).last_reviewed_at,
    };
    await syncMasteryToSupabase(applyReview(current, 1));
  } catch {
    // Silent fail — a review-schedule write must never break a lesson.
  }
}
