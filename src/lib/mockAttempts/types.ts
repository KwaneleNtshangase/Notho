import type { AreaScore } from "@/lib/results/types";

export type MockAttemptStatus = "in_progress" | "submitted";
export type MockSubmissionReason = "learner" | "time_expired";

export type MockAttemptOption = {
  id: string;
  label: string;
  text: string;
};

/** The allow-listed question shape delivered while a paper is active. */
export type MockAttemptQuestion = {
  id: string;
  questionIndex: number;
  type: "mcq" | "scenario";
  prompt: string;
  content: string | null;
  options: MockAttemptOption[];
  answeredOptionId: string | null;
  viewed: boolean;
  flagged: boolean;
};

export type MockAttemptReviewQuestion = MockAttemptQuestion & {
  correctOptionId: string;
  isCorrect: boolean;
};

export type MockAttemptResult = {
  correctAnswers: number;
  totalQuestions: number;
  scorePct: number;
  passMarkCorrect: number;
  passed: boolean;
  durationSeconds: number;
  unansweredCount: number;
  submissionReason: MockSubmissionReason;
  areaBreakdown: AreaScore[];
};

/**
 * The browser never receives authoring identifiers, an answer key, or an
 * explanation while status is in_progress. Review is populated only after
 * the same owned attempt has been transactionally submitted by the server.
 */
export type MockAttemptSnapshot = {
  id: string;
  watermark: string;
  courseId: string;
  lessonId: string;
  status: MockAttemptStatus;
  startedAt: string;
  expiresAt: string;
  lastActivityAt: string;
  submittedAt: string | null;
  stateVersion: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  passMarkCorrect: number;
  serverNow: string;
  remainingSeconds: number;
  allViewed: boolean;
  viewedCount: number;
  unansweredCount: number;
  questions: MockAttemptQuestion[];
  result: MockAttemptResult | null;
  review: MockAttemptReviewQuestion[] | null;
};

export type MockAttemptMutation =
  | { action: "view"; mutationId: string; questionIndex: number }
  | {
      action: "answer";
      mutationId: string;
      questionIndex: number;
      /** null explicitly clears the saved answer. */
      answeredOptionId: string | null;
    }
  | {
      action: "flag";
      mutationId: string;
      questionIndex: number;
      flagged: boolean;
    };
