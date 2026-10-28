/**
 * Pure selectors over a list of recorded results.
 *
 * Split from ./store so they can be unit-tested without pulling in the
 * Supabase client — store.ts is I/O only, and anything that decides a number a
 * learner sees belongs where it can be tested.
 */

import type { LessonResult } from "@/lib/results/types";

/**
 * Best attempt per lesson, keyed `${courseId}:${lessonId}`.
 *
 * "Best", not "latest": the course map shows what a learner has proved they
 * can do. Ties break to the more recent attempt.
 */
export function bestByLesson(
  results: LessonResult[]
): Map<string, LessonResult> {
  const best = new Map<string, LessonResult>();
  for (const r of results) {
    const key = `${r.courseId}:${r.lessonId}`;
    const cur = best.get(key);
    if (
      !cur ||
      r.scorePct > cur.scorePct ||
      (r.scorePct === cur.scorePct && r.completedAt > cur.completedAt)
    ) {
      best.set(key, r);
    }
  }
  return best;
}

/** Every attempt at one lesson, oldest first — the history strip on a result. */
export function attemptsFor(
  results: LessonResult[],
  lessonId: string
): LessonResult[] {
  return results
    .filter((r) => r.lessonId === lessonId)
    .sort((a, b) => a.attemptNo - b.attemptNo);
}

export type CourseScore = {
  /** Questions answered right on first presentation, summed over best attempts. */
  firstTryCorrect: number;
  /** Distinct questions across those same best attempts. */
  totalQuestions: number;
  scorePct: number;
  /** How many lessons contributed. Always shown beside the score. */
  lessonsScored: number;
};

/**
 * One score for a whole course, weighted by questions.
 *
 * Sums first-try-correct and total questions across the BEST attempt at each
 * lesson, then divides once. A 16-question lesson therefore counts four times
 * as much as a 4-question one, which is the same way the RE5 itself is marked:
 * every question is worth one mark, wherever it sits.
 *
 * The alternative — averaging each lesson's percentage — lets a two-question
 * lesson swing the course total as hard as a twenty-question one, which would
 * make the headline number easy to move and hard to trust.
 *
 * Only lessons with a recorded result contribute. `lessonsScored` is returned
 * so the UI can say "9 of 14 lessons" rather than implying the number covers
 * the whole course. Returns null when nothing has been scored yet — there is
 * no honest number to show, and 0% would be a lie about an unattempted course.
 */
export function courseScore(
  results: LessonResult[],
  courseId: string
): CourseScore | null {
  const best = bestByLesson(results.filter((r) => r.courseId === courseId));

  let firstTryCorrect = 0;
  let totalQuestions = 0;
  let lessonsScored = 0;

  for (const result of best.values()) {
    // A result with no questions carries no information either way; counting it
    // as a scored lesson would understate the denominator of "N of M lessons".
    if (result.totalQuestions <= 0) continue;
    firstTryCorrect += result.firstTryCorrect;
    totalQuestions += result.totalQuestions;
    lessonsScored += 1;
  }

  if (totalQuestions === 0) return null;

  return {
    firstTryCorrect,
    totalQuestions,
    scorePct: Math.round((firstTryCorrect / totalQuestions) * 100),
    lessonsScored,
  };
}
