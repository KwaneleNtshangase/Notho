/**
 * Shared shapes for per-attempt lesson and exam results.
 *
 * Kept free of Supabase and React imports so the scoring logic in `score.ts`
 * can be unit-tested in the plain-node vitest environment.
 */

/** A slice of an exam, e.g. one RE5 knowledge area. */
export type AreaScore = {
  areaId: string;
  areaLabel: string;
  /** Questions in this area answered correctly on first presentation. */
  correct: number;
  /** Distinct questions in this area. */
  total: number;
};

export type ResultKind = "lesson" | "exam";

/** Where the row came from — see the migration's backfill notes. */
export type ResultSource = "live" | "backfill";

/**
 * One completed sitting. Mirrors a `public.lesson_results` row.
 *
 * `firstTryCorrect` / `totalQuestions` are the source of truth; `scorePct` is
 * a rounded convenience that must never be used to re-derive a count.
 */
export type LessonResult = {
  id: string;
  courseId: string;
  lessonId: string;
  attemptNo: number;
  kind: ResultKind;
  totalQuestions: number;
  firstTryCorrect: number;
  scorePct: number;
  /** Correct answers required to pass. Null when the lesson has no pass mark. */
  passMarkCorrect: number | null;
  /** Null exactly when `passMarkCorrect` is null. */
  passed: boolean | null;
  durationSeconds: number | null;
  areaBreakdown: AreaScore[];
  source: ResultSource;
  completedAt: string;
};

/** The payload `record_lesson_result()` accepts. */
export type LessonResultDraft = {
  courseId: string;
  lessonId: string;
  kind: ResultKind;
  totalQuestions: number;
  firstTryCorrect: number;
  passMarkCorrect: number | null;
  durationSeconds: number | null;
  areaBreakdown: AreaScore[];
};

/**
 * A displayable band for a score.
 *
 * `letter` is Notho's own band, not an FSCA grade — the FSCA reports RE5 as a
 * percentage against the published 65% pass mark and nothing else. For exams the pass/fail
 * verdict is the headline and the band is secondary.
 */
export type Grade = {
  letter: "A" | "B" | "C" | "D" | "E";
  label: string;
  /** Design token key, so components don't each invent a colour scale. */
  tone: "excellent" | "strong" | "pass" | "weak" | "poor";
};
