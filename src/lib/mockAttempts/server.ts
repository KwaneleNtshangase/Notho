import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AreaScore } from "@/lib/results/types";
import type {
  MockAttemptMutation,
  MockAttemptOption,
  MockAttemptQuestion,
  MockAttemptReviewQuestion,
  MockAttemptSnapshot,
  MockAttemptStatus,
  MockSubmissionReason,
} from "@/lib/mockAttempts/types";
import { learnerWatermark } from "@/server/mockAttemptSecurity";
import type { Re5MockQuestionManifest } from "@/server/re5MockBank";

type AttemptRow = {
  id: string;
  course_id: string;
  lesson_id: string;
  status: MockAttemptStatus;
  started_at: string;
  expires_at: string;
  last_activity_at: string;
  submitted_at: string | null;
  submission_reason: MockSubmissionReason | null;
  state_version: number;
  current_question_index: number;
  total_questions: number;
  pass_mark_correct: number;
  correct_answers: number | null;
  score_pct: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
  area_breakdown: unknown;
};

export type StoredMockQuestion = {
  question_id: string;
  question_index: number;
  question_type: "mcq" | "scenario";
  question_text: string;
  question_content: string | null;
  options: unknown;
  correct_option_id?: string;
  answered_option_id: string | null;
  viewed: boolean;
  flagged: boolean;
  explanation?: string;
};

const ATTEMPT_COLUMNS =
  "id,course_id,lesson_id,status,started_at,expires_at,last_activity_at," +
  "submitted_at,submission_reason,state_version,current_question_index,total_questions," +
  "pass_mark_correct,correct_answers,score_pct,passed,duration_seconds,area_breakdown";

const ACTIVE_QUESTION_COLUMNS =
  "question_id,question_index,question_type,question_text,question_content,options," +
  "answered_option_id,viewed,flagged";
const REVIEW_QUESTION_COLUMNS = `${ACTIVE_QUESTION_COLUMNS},correct_option_id`;

function parseAreas(raw: unknown): AreaScore[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const correct = Number(value.correct);
    const total = Number(value.total);
    if (
      typeof value.areaId !== "string" ||
      typeof value.areaLabel !== "string" ||
      !Number.isFinite(correct) ||
      !Number.isFinite(total)
    ) return [];
    return [{ areaId: value.areaId, areaLabel: value.areaLabel, correct, total }];
  });
}

function parseOptions(raw: unknown): MockAttemptOption[] {
  if (!Array.isArray(raw) || raw.length !== 4) {
    throw new Error("Stored mock question has invalid options");
  }
  return raw.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Invalid mock option");
    const option = item as Record<string, unknown>;
    if (
      typeof option.id !== "string" ||
      typeof option.label !== "string" ||
      typeof option.text !== "string"
    ) throw new Error("Invalid mock option");
    return { id: option.id, label: option.label, text: option.text };
  });
}

export function redactMockQuestionForClient(row: StoredMockQuestion): MockAttemptQuestion {
  return {
    id: row.question_id,
    questionIndex: row.question_index,
    type: row.question_type,
    prompt: row.question_text,
    content: row.question_content,
    options: parseOptions(row.options),
    answeredOptionId: row.answered_option_id,
    viewed: row.viewed,
    flagged: row.flagged,
  };
}

function reviewMockQuestion(row: StoredMockQuestion): MockAttemptReviewQuestion {
  if (typeof row.correct_option_id !== "string") {
    throw new Error("Stored mock review is missing its answer key");
  }
  return {
    ...redactMockQuestionForClient(row),
    correctOptionId: row.correct_option_id,
    isCorrect:
      row.answered_option_id !== null &&
      row.answered_option_id === row.correct_option_id,
  };
}

async function readAttemptRow(admin: SupabaseClient, userId: string, attemptId: string) {
  const { data, error } = await admin
    .from("mock_attempts")
    .select(ATTEMPT_COLUMNS)
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AttemptRow | null) ?? null;
}

/**
 * Fetch an owned paper. Crossing the fixed deadline finalizes it through the
 * same transactional server marker used by manual submission, with blanks
 * receiving zero rather than silently discarding the sitting.
 */
export async function fetchOwnedMockAttempt(
  admin: SupabaseClient,
  user: Pick<User, "id" | "email">,
  attemptId: string
): Promise<MockAttemptSnapshot | null> {
  let row = await readAttemptRow(admin, user.id, attemptId);
  if (!row) return null;

  if (row.status === "in_progress" && Date.parse(row.expires_at) <= Date.now()) {
    const { error } = await admin.rpc("submit_mock_attempt", {
      p_user_id: user.id,
      p_attempt_id: attemptId,
    });
    if (error) throw error;
    row = await readAttemptRow(admin, user.id, attemptId);
    if (!row) return null;
  }

  const submitted = row.status === "submitted";
  const { data, error } = await admin
    .from("mock_attempt_questions")
    // Do not even load an answer key into the active delivery path. Submitted
    // review is the only projection that selects it.
    .select(submitted ? REVIEW_QUESTION_COLUMNS : ACTIVE_QUESTION_COLUMNS)
    .eq("attempt_id", attemptId)
    .order("question_index", { ascending: true });
  if (error) throw error;
  const stored = (data ?? []) as unknown as StoredMockQuestion[];
  const questions = stored.map(redactMockQuestionForClient);
  const viewedCount = questions.filter((question) => question.viewed).length;
  const unansweredCount = questions.filter(
    (question) => question.answeredOptionId === null
  ).length;
  const serverNowMs = Date.now();
  const hasResult =
    submitted &&
    row.correct_answers !== null &&
    row.score_pct !== null &&
    row.passed !== null &&
    row.duration_seconds !== null &&
    row.submission_reason !== null;

  return {
    id: row.id,
    watermark: learnerWatermark(user, row.id),
    courseId: row.course_id,
    lessonId: row.lesson_id,
    status: row.status,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    lastActivityAt: row.last_activity_at,
    submittedAt: row.submitted_at,
    stateVersion: Number(row.state_version),
    currentQuestionIndex: row.current_question_index,
    totalQuestions: row.total_questions,
    passMarkCorrect: row.pass_mark_correct,
    serverNow: new Date(serverNowMs).toISOString(),
    remainingSeconds:
      row.status === "in_progress"
        ? Math.max(0, Math.ceil((Date.parse(row.expires_at) - serverNowMs) / 1000))
        : 0,
    allViewed: questions.length === row.total_questions && viewedCount === row.total_questions,
    viewedCount,
    unansweredCount,
    questions,
    result: hasResult
      ? {
          correctAnswers: row.correct_answers!,
          totalQuestions: row.total_questions,
          scorePct: row.score_pct!,
          passMarkCorrect: row.pass_mark_correct,
          passed: row.passed!,
          durationSeconds: row.duration_seconds!,
          unansweredCount,
          submissionReason: row.submission_reason!,
          areaBreakdown: parseAreas(row.area_breakdown),
        }
      : null,
    review: submitted ? stored.map(reviewMockQuestion) : null,
  };
}

export async function startOrResumeMockAttempt(
  admin: SupabaseClient,
  input: {
    userId: string;
    courseId: string;
    lessonId: string;
    newAttempt: boolean;
    questions: Re5MockQuestionManifest[];
  }
): Promise<string> {
  const { data, error } = await admin.rpc("start_or_resume_mock_attempt", {
    p_user_id: input.userId,
    p_course_id: input.courseId,
    p_lesson_id: input.lessonId,
    p_new_attempt: input.newAttempt,
    p_questions: input.questions,
  });
  if (error) throw error;
  if (typeof data !== "string") throw new Error("Attempt was not created");
  return data;
}

export async function mutateMockAttempt(
  admin: SupabaseClient,
  userId: string,
  attemptId: string,
  mutation: MockAttemptMutation
): Promise<boolean> {
  const { data, error } = await admin.rpc("mutate_mock_attempt", {
    p_user_id: userId,
    p_attempt_id: attemptId,
    p_mutation_id: mutation.mutationId,
    p_action: mutation.action,
    p_question_index: mutation.questionIndex,
    p_answered_option_id:
      mutation.action === "answer" ? mutation.answeredOptionId : null,
    p_flagged: mutation.action === "flag" ? mutation.flagged : null,
  });
  if (error) throw error;
  return data === true;
}

export async function submitMockAttempt(
  admin: SupabaseClient,
  userId: string,
  attemptId: string
): Promise<void> {
  const { error } = await admin.rpc("submit_mock_attempt", {
    p_user_id: userId,
    p_attempt_id: attemptId,
  });
  if (error) throw error;
}

export async function fetchOwnedMockExplanation(
  admin: SupabaseClient,
  userId: string,
  attemptId: string,
  questionId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from("mock_attempt_questions")
    .select("explanation,mock_attempts!inner(user_id,status)")
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId)
    .eq("mock_attempts.user_id", userId)
    .eq("mock_attempts.status", "submitted")
    .maybeSingle();
  if (error) throw error;
  const explanation = (data as { explanation?: unknown } | null)?.explanation;
  return typeof explanation === "string" ? explanation : null;
}

export function statusForMockAttemptError(error: unknown): number {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);
  if (message.includes("MOCK_ATTEMPT_NOT_FOUND")) return 404;
  if (message.includes("MOCK_ATTEMPT_FORBIDDEN")) return 403;
  if (message.includes("MOCK_ATTEMPT_NOT_ALL_VIEWED")) return 409;
  if (message.includes("MOCK_ATTEMPT_NOT_ACTIVE")) return 409;
  if (message.includes("MOCK_ATTEMPT_INVALID")) return 400;
  return 500;
}
