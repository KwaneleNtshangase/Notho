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
