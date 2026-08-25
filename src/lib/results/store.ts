/**
 * Supabase read/write for public.lesson_results.
 *
 * The scoring itself lives in ./score — this file only moves rows. Keep it
 * that way: anything that decides a number belongs where it can be tested.
 */

import { supabase } from "@/lib/supabaseClient";
import type {
  AreaScore,
  LessonResult,
  LessonResultDraft,
} from "@/lib/results/types";

type Row = {
  id: string;
  course_id: string;
  lesson_id: string;
  attempt_no: number;
  kind: string;
  total_questions: number;
  first_try_correct: number;
  score_pct: number;
  pass_mark_correct: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
  area_breakdown: unknown;
  source: string;
  completed_at: string;
};

function parseAreas(raw: unknown): AreaScore[] {
  if (!Array.isArray(raw)) return [];
  const out: AreaScore[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    if (typeof a.areaId !== "string" || typeof a.areaLabel !== "string") continue;
    const correct = Number(a.correct);
    const total = Number(a.total);
    if (!Number.isFinite(correct) || !Number.isFinite(total)) continue;
    out.push({ areaId: a.areaId, areaLabel: a.areaLabel, correct, total });
  }
  return out;
}

function toResult(row: Row): LessonResult {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id,
    attemptNo: row.attempt_no,
    kind: row.kind === "exam" ? "exam" : "lesson",
    totalQuestions: row.total_questions,
    firstTryCorrect: row.first_try_correct,
    scorePct: row.score_pct,
    passMarkCorrect: row.pass_mark_correct,
    passed: row.passed,
    durationSeconds: row.duration_seconds,
    areaBreakdown: parseAreas(row.area_breakdown),
    source: row.source === "backfill" ? "backfill" : "live",
    completedAt: row.completed_at,
  };
}

/**
 * Record one finished sitting.
 *
 * Goes through the record_lesson_result RPC rather than a plain insert for two
 * reasons: the attempt number is assigned server-side from the caller's own
 * rows (the client's localStorage counter restarts on every new device), and
 * user_id comes from auth.uid() inside the function, so a client cannot write
 * a result onto someone else's account no matter what it sends.
 *
 * Returns null on failure and never throws — a lost row must not cost the
 * learner their lesson completion or XP, both of which are already committed
 * by the time this runs. The caller shows the score it computed locally; the
 * same numbers simply do not make it into history.
 */
export async function recordLessonResult(
  draft: LessonResultDraft
): Promise<LessonResult | null> {
  try {
    const { data, error } = await supabase
      .rpc("record_lesson_result", {
        p_course_id: draft.courseId,
        p_lesson_id: draft.lessonId,
        p_kind: draft.kind,
        p_total_questions: draft.totalQuestions,
        p_first_try_correct: draft.firstTryCorrect,
        p_pass_mark_correct: draft.passMarkCorrect,
        p_duration_seconds: draft.durationSeconds,
        p_area_breakdown: draft.areaBreakdown,
      })
      .single();
    if (error || !data) return null;
    return toResult(data as Row);
  } catch {
    return null;
  }
}

/**
 * Every result for the signed-in user, newest first.
 *
 * No user_id filter is passed and none is needed: the RLS SELECT policy is
 * `auth.uid() = user_id`, so this query cannot return another learner's rows
 * even if it asked for them.
 */
export async function fetchLessonResults(
  courseId?: string
): Promise<LessonResult[]> {
  try {
    let q = supabase
      .from("lesson_results")
      .select("*")
      .order("completed_at", { ascending: false });
    if (courseId) q = q.eq("course_id", courseId);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as Row[]).map(toResult);
  } catch {
    return [];
  }
}
