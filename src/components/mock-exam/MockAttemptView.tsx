"use client";

import React from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Flag,
  ListChecks,
  LoaderCircle,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import type { MockAttemptSnapshot } from "@/lib/mockAttempts/types";

type SnapshotQuestion = MockAttemptSnapshot["questions"][number];

type ActiveMockAttempt = MockAttemptSnapshot & {
  status: "in_progress";
};

type MockAttemptResult = {
  correctAnswers: number;
  totalQuestions: number;
  scorePct: number;
  passMarkCorrect: number;
  passed: boolean;
  durationSeconds: number;
  unansweredCount: number;
  submissionReason: "learner" | "time_expired";
  areaBreakdown: Array<{
    areaId: string;
    areaLabel: string;
    correct: number;
    total: number;
  }>;
};

type ReviewQuestion = SnapshotQuestion & {
  correctOptionId: string;
  isCorrect: boolean;
};

type SubmittedMockAttempt = MockAttemptSnapshot & {
  status: "submitted";
  result: MockAttemptResult;
  review: ReviewQuestion[];
};

export type MockQuestionStatus = "unseen" | "unanswered" | "answered";

export function mockQuestionStatus(
  question: Pick<SnapshotQuestion, "viewed" | "answeredOptionId">
): MockQuestionStatus {
  if (!question.viewed) return "unseen";
  return question.answeredOptionId === null ? "unanswered" : "answered";
}

export function formatMockTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function isProtectedMockShortcut(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">
): boolean {
  if (!event.ctrlKey && !event.metaKey) return false;
  return ["a", "c", "p", "s", "u", "x"].includes(event.key.toLowerCase());
}

export type MockAttemptViewProps = {
  attempt: ActiveMockAttempt;
  currentIndex: number;
  remainingSeconds: number;
  pendingSaves: number;
  saveError: string | null;
  submitting: boolean;
  onNavigate: (questionIndex: number) => void;
  onAnswer: (questionIndex: number, optionId: string | null) => void;
  onFlag: (questionIndex: number, flagged: boolean) => void;
  onRequestSubmit: () => void;
  onExit: () => void;
  onRetrySave: () => void;
};

/**
 * Controlled rendering for an in-progress, server-owned mock attempt.
 *
 * The component deliberately owns no durable exam state: questions, answers,
 * views, flags, timing and submission eligibility all come from the server
 * snapshot. Its only local state is presentational (the mobile navigator).
 */
export function MockAttemptView({
  attempt,
  currentIndex,
  remainingSeconds,
  pendingSaves,
  saveError,
  submitting,
  onNavigate,
  onAnswer,
  onFlag,
  onRequestSubmit,
  onExit,
  onRetrySave,
}: MockAttemptViewProps) {
  const [navigatorOpen, setNavigatorOpen] = React.useState(false);
  const questionHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const navigatorButtonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const currentPosition = React.useMemo(() => {
    const exact = attempt.questions.findIndex(
      (question) => question.questionIndex === currentIndex
    );
    return exact >= 0 ? exact : 0;
  }, [attempt.questions, currentIndex]);
  const current = attempt.questions[currentPosition];
  const answeredCount = Math.max(
    0,
    attempt.totalQuestions - attempt.unansweredCount
  );
  const flaggedCount = attempt.questions.filter((question) => question.flagged).length;
  const interactionsBlocked = submitting || Boolean(saveError);

  function goToPosition(position: number, focusHeading = true) {
    const question = attempt.questions[position];
    if (!question) return;
    onNavigate(question.questionIndex);
    setNavigatorOpen(false);
    if (focusHeading) {
      window.requestAnimationFrame(() => questionHeadingRef.current?.focus());
    }
  }

  function handleNavigatorKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    position: number
  ) {
    let nextPosition: number | null = null;
    const columns = 5;
    if (event.key === "ArrowRight") {
      nextPosition = Math.min(attempt.questions.length - 1, position + 1);
    }
    if (event.key === "ArrowLeft") nextPosition = Math.max(0, position - 1);
    if (event.key === "ArrowDown") {
      nextPosition = Math.min(attempt.questions.length - 1, position + columns);
    }
    if (event.key === "ArrowUp") nextPosition = Math.max(0, position - columns);
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = attempt.questions.length - 1;
    if (nextPosition === null) return;
    event.preventDefault();
    navigatorButtonRefs.current[nextPosition]?.focus();
  }

  if (!current) {
    return (
      <ProtectedMockSurface
        watermark={attempt.watermark}
        className="mock-active-screen"
      >
        <section className="mock-state-screen" role="alert">
          <AlertCircle size={36} aria-hidden />
          <h1>This mock has no available questions</h1>
          <p>Refresh the authoritative attempt before continuing.</p>
          <div className="mock-state-actions">
            <button type="button" className="btn btn-primary" onClick={onRetrySave}>
              Retry
            </button>
            <button type="button" className="btn btn-secondary" onClick={onExit}>
              Back to course
            </button>
          </div>
        </section>
      </ProtectedMockSurface>
    );
  }

  return (
    <ProtectedMockSurface
      watermark={attempt.watermark}
      className="mock-active-screen"
    >
      <header className="mock-exam-header">
        <div className="mock-exam-heading">
          <button type="button" className="mock-exit-button" onClick={onExit}>
            <ArrowLeft size={18} aria-hidden /> Exit mock
          </button>
          <div>
            <span className="mock-eyebrow">RE5 practice</span>
            <h1>Mock examination</h1>
          </div>
        </div>
        <div
          className={`mock-timer ${remainingSeconds <= 600 ? "mock-timer-warning" : ""}`}
          role="timer"
          aria-label={`${formatMockTimer(remainingSeconds)} remaining`}
        >
          <Clock3 size={19} aria-hidden />
          <span>{formatMockTimer(remainingSeconds)}</span>
        </div>
      </header>

      {saveError && (
        <div className="mock-submit-error" role="alert">
          <AlertCircle size={18} aria-hidden />
          <span>{saveError}</span>
          <button type="button" onClick={onRetrySave}>
            Retry save
          </button>
        </div>
      )}

      <div className="mock-mobile-progress" aria-label="Mock progress">
        <span>
          {attempt.viewedCount} of {attempt.totalQuestions} visited
        </span>
        <span>{answeredCount} answered</span>
        <span>{flaggedCount} flagged</span>
      </div>

      <button
        type="button"
        className="mock-navigator-toggle"
        aria-expanded={navigatorOpen}
        aria-controls="mock-question-navigator"
        onClick={() => setNavigatorOpen((open) => !open)}
      >
        <ListChecks size={18} aria-hidden />
        Questions {currentPosition + 1}/{attempt.totalQuestions}
        <ChevronDown size={18} aria-hidden />
      </button>

      <div className="mock-exam-layout">
        <section className="mock-question-card" aria-labelledby="mock-question-title">
          <div className="mock-question-meta">
            <span>
              Question {current.questionIndex + 1} of {attempt.totalQuestions}
            </span>
            <button
              type="button"
              className={`mock-flag-button ${current.flagged ? "is-flagged" : ""}`}
              aria-pressed={current.flagged}
              disabled={interactionsBlocked}
              onClick={() => onFlag(current.questionIndex, !current.flagged)}
            >
              <Flag
                size={17}
                fill={current.flagged ? "currentColor" : "none"}
                aria-hidden
              />
              {current.flagged ? "Flagged" : "Flag question"}
            </button>
          </div>

          {current.content && <p className="mock-question-context">{current.content}</p>}
          <h2 id="mock-question-title" ref={questionHeadingRef} tabIndex={-1}>
            {current.prompt}
          </h2>

          <fieldset className="mock-options" disabled={interactionsBlocked}>
            <legend className="sr-only">Choose one answer</legend>
            {current.options.map((option) => {
              const selected = current.answeredOptionId === option.id;
              return (
                <label
                  key={option.id}
                  className={`mock-option ${selected ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`answer-${attempt.id}-${current.id}`}
                    value={option.id}
                    checked={selected}
                    onChange={() => onAnswer(current.questionIndex, option.id)}
                  />
                  <span className="mock-option-label" aria-hidden>
                    {option.label}
                  </span>
                  <span>{option.text}</span>
                </label>
              );
            })}
          </fieldset>

          <div className="mock-question-utility-row">
            <button
              type="button"
              className="mock-clear-answer"
              disabled={current.answeredOptionId === null || interactionsBlocked}
              onClick={() => onAnswer(current.questionIndex, null)}
            >
              <X size={16} aria-hidden /> Clear selected answer
            </button>
            <span className="mock-save-state" aria-live="polite">
              {pendingSaves > 0 ? (
                <>
                  <LoaderCircle className="mock-spinner" size={14} aria-hidden /> Saving…
                </>
              ) : saveError ? (
                "Save needs attention"
              ) : (
                "Saved"
              )}
            </span>
          </div>

          <div className="mock-question-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPosition === 0 || interactionsBlocked}
              onClick={() => goToPosition(currentPosition - 1)}
            >
              <ArrowLeft size={18} aria-hidden /> Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                currentPosition === attempt.questions.length - 1 ||
                interactionsBlocked
              }
              onClick={() => goToPosition(currentPosition + 1)}
            >
              Next <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </section>

        <aside
          id="mock-question-navigator"
          className="mock-navigator-panel"
          data-open={navigatorOpen ? "true" : "false"}
        >
          <div className="mock-navigator-heading">
            <div>
              <h2>Questions</h2>
              <p>Jump to any question</p>
            </div>
            <span>
              {answeredCount}/{attempt.totalQuestions}
            </span>
          </div>

          <nav aria-label="Question navigator">
            <ol className="mock-question-grid">
              {attempt.questions.map((question, position) => {
                const status = mockQuestionStatus(question);
                const isCurrent = position === currentPosition;
                return (
                  <li key={question.id}>
                    <button
                      ref={(node) => {
                        navigatorButtonRefs.current[position] = node;
                      }}
                      type="button"
                      className={`mock-question-jump status-${status} ${
                        question.flagged ? "is-flagged" : ""
                      }`}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Question ${question.questionIndex + 1}, ${status}${
                        question.flagged ? ", flagged" : ""
                      }${isCurrent ? ", current question" : ""}`}
                      title={`Question ${question.questionIndex + 1}: ${status}${
                        question.flagged ? ", flagged" : ""
                      }`}
                      disabled={interactionsBlocked}
                      onKeyDown={(event) => handleNavigatorKeyDown(event, position)}
                      onClick={() => goToPosition(position)}
                    >
                      <span>{question.questionIndex + 1}</span>
                      {status === "answered" && <Check size={12} aria-hidden />}
                      {status === "unanswered" && <Circle size={9} aria-hidden />}
                      {question.flagged && (
                        <Flag
                          className="jump-flag"
                          size={10}
                          fill="currentColor"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mock-status-legend" aria-label="Question status key">
            <span>
              <i className="legend-unseen" /> Unseen
            </span>
            <span>
              <i className="legend-unanswered" /> Unanswered
            </span>
            <span>
              <i className="legend-answered" /> Answered
            </span>
            <span>
              <Flag size={11} fill="currentColor" aria-hidden /> Flagged
            </span>
          </div>
        </aside>
      </div>

      <div className="mock-content-deterrent" role="note">
        <ShieldCheck size={16} aria-hidden />
        This protected practice paper is watermarked. Copy and print controls are
        deterrents; screenshots and camera capture cannot be prevented.
      </div>

      <div className="mock-submit-dock">
        <div className="mock-submit-dock-inner">
          {attempt.allViewed ? (
            <>
              <div>
                <strong>All questions visited</strong>
                <span>
                  {attempt.unansweredCount} unanswered · {flaggedCount} flagged
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={interactionsBlocked}
                onClick={onRequestSubmit}
              >
                {submitting ? (
                  <LoaderCircle className="mock-spinner" size={18} aria-hidden />
                ) : (
                  <ShieldCheck size={18} aria-hidden />
                )}
                {submitting ? "Submitting…" : "Submit mock"}
              </button>
            </>
          ) : (
            <div className="mock-submit-locked" role="status">
              <ListChecks size={19} aria-hidden />
              <span>
                Visit {attempt.totalQuestions - attempt.viewedCount} more question
                {attempt.totalQuestions - attempt.viewedCount === 1 ? "" : "s"} to
                unlock Submit
              </span>
            </div>
          )}
        </div>
      </div>
    </ProtectedMockSurface>
  );
}

type ExplanationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; text: string; expanded: boolean }
  | { status: "error"; message: string };

export type MockAttemptReportProps = {
  attempt: SubmittedMockAttempt;
  onExplain: (questionId: string) => Promise<string>;
  onExit: () => void;
  onViewReadiness: () => void;
  onRetake: () => void;
};

/** Secure, server-graded report. Explanations are fetched only on demand. */
export function MockAttemptReport({
  attempt,
  onExplain,
  onExit,
  onViewReadiness,
  onRetake,
}: MockAttemptReportProps) {
  const [explanations, setExplanations] = React.useState<
    Record<string, ExplanationState>
  >({});

  async function toggleExplanation(questionId: string) {
    const state = explanations[questionId] ?? { status: "idle" as const };
    if (state.status === "loaded") {
      setExplanations((previous) => ({
        ...previous,
        [questionId]: { ...state, expanded: !state.expanded },
      }));
      return;
    }
    if (state.status === "loading") return;

    setExplanations((previous) => ({
      ...previous,
      [questionId]: { status: "loading" },
    }));
    try {
      const text = await onExplain(questionId);
      setExplanations((previous) => ({
        ...previous,
        [questionId]: { status: "loaded", text, expanded: true },
      }));
    } catch (error) {
      setExplanations((previous) => ({
        ...previous,
        [questionId]: {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The explanation is unavailable right now.",
        },
      }));
    }
  }

  const result = attempt.result;

  return (
    <ProtectedMockSurface
      watermark={attempt.watermark}
      className="mock-result-screen"
    >
      <header className="mock-result-header">
        <div>
          <span className="mock-eyebrow">RE5 mock · Authoritative result</span>
          <h1>{result.passed ? "Practice pass" : "Not yet at the threshold"}</h1>
          <p>
            {result.passed
              ? `You met this practice paper’s configured threshold of ${result.passMarkCorrect}/${result.totalQuestions}.`
              : `You needed ${Math.max(
                  0,
                  result.passMarkCorrect - result.correctAnswers
                )} more correct answer${
                  result.passMarkCorrect - result.correctAnswers === 1 ? "" : "s"
                }.`}
          </p>
        </div>
        <div className={`mock-result-score ${result.passed ? "is-pass" : "is-fail"}`}>
          <strong>
            {result.correctAnswers}
            <span>/{result.totalQuestions}</span>
          </strong>
          <span>{result.scorePct}%</span>
        </div>
      </header>

      <section className="mock-result-summary" aria-label="Result summary">
        <div>
          <span>Outcome</span>
          <strong>{result.passed ? "Pass" : "Fail"}</strong>
        </div>
        <div>
          <span>Pass mark</span>
          <strong>
            {result.passMarkCorrect}/{result.totalQuestions}
          </strong>
        </div>
        <div>
          <span>Time used</span>
          <strong>{formatMockTimer(result.durationSeconds)}</strong>
        </div>
        <div>
          <span>Unanswered</span>
          <strong>{result.unansweredCount}</strong>
        </div>
      </section>

      {result.submissionReason === "time_expired" && (
        <div className="mock-result-warning" role="status">
          <Clock3 size={18} aria-hidden />
          The fixed deadline elapsed, so the server submitted this attempt with
          unanswered questions marked blank.
        </div>
      )}

      {result.areaBreakdown.length > 0 && (
        <section className="mock-area-breakdown" aria-labelledby="mock-area-title">
          <div>
            <h2 id="mock-area-title">Knowledge-area breakdown</h2>
            <p>Use these server-graded results to choose what to revise next.</p>
          </div>
          <ul>
            {result.areaBreakdown.map((area) => {
              const percentage =
                area.total > 0 ? Math.round((area.correct / area.total) * 100) : 0;
              return (
                <li key={area.areaId}>
                  <span>{area.areaLabel}</span>
                  <strong>
                    {area.correct}/{area.total}
                  </strong>
                  <div aria-label={`${percentage}% correct`}>
                    <i style={{ width: `${percentage}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mock-review-section" aria-labelledby="mock-review-title">
        <div className="mock-review-heading">
          <div>
            <h2 id="mock-review-title">Answer review</h2>
            <p>Explanations are requested securely and stay closed until you ask.</p>
          </div>
          <span>Completed paper</span>
        </div>

        <ol className="mock-review-list">
          {attempt.review.map((question) => {
            const explanation = explanations[question.id] ?? {
              status: "idle" as const,
            };
            const expanded =
              explanation.status === "loaded" && explanation.expanded;
            const selectedOption = question.options.find(
              (option) => option.id === question.answeredOptionId
            );
            const correctOption = question.options.find(
              (option) => option.id === question.correctOptionId
            );
            const explanationId = `mock-explanation-${question.questionIndex}`;

            return (
              <li key={question.id}>
                <div className="mock-review-question-title">
                  {question.isCorrect ? (
                    <CheckCircle2 className="is-correct" size={21} aria-label="Correct" />
                  ) : (
                    <XCircle className="is-incorrect" size={21} aria-label="Incorrect" />
                  )}
                  <span>{question.questionIndex + 1}</span>
                  <h3>{question.prompt}</h3>
                </div>

                {question.content && (
                  <p className="mock-review-context">{question.content}</p>
                )}

                <div className="mock-reviewed-options" aria-label="Reviewed answers">
                  {question.options.map((option) => {
                    const selected = option.id === question.answeredOptionId;
                    const correct = option.id === question.correctOptionId;
                    return (
                      <div
                        key={option.id}
                        className={`mock-reviewed-option ${correct ? "is-correct" : ""} ${
                          selected && !correct ? "is-incorrect" : ""
                        }`}
                      >
                        <strong>{option.label}.</strong> {option.text}
                        {correct ? (
                          <span>Correct answer</span>
                        ) : selected ? (
                          <span>Your answer</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {!selectedOption && (
                  <p className="mock-unanswered-review">No answer selected.</p>
                )}
                {!correctOption && (
                  <p className="mock-explanation-error" role="alert">
                    The marked answer is unavailable in this report.
                  </p>
                )}

                <button
                  type="button"
                  className="mock-explain-button"
                  aria-expanded={expanded}
                  aria-controls={explanationId}
                  disabled={explanation.status === "loading"}
                  onClick={() => void toggleExplanation(question.id)}
                >
                  {explanation.status === "loading" ? (
                    <>
                      <LoaderCircle className="mock-spinner" size={16} aria-hidden />
                      Loading explanation…
                    </>
                  ) : expanded ? (
                    "Hide explanation"
                  ) : explanation.status === "error" ? (
                    "Try explanation again"
                  ) : (
                    "Explain this answer"
                  )}
                </button>

                {explanation.status === "error" && (
                  <p
                    id={explanationId}
                    className="mock-explanation-error"
                    role="alert"
                  >
                    {explanation.message}
                  </p>
                )}
                {explanation.status === "loaded" && explanation.expanded && (
                  <div id={explanationId} className="mock-explanation-panel">
                    <strong>Why</strong>
                    <p>{explanation.text}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mock-content-deterrent" role="note">
        <ShieldCheck size={16} aria-hidden />
        This completed paper remains watermarked and protected from casual copying.
      </div>

      <div className="mock-result-actions">
        <button type="button" className="btn btn-primary" onClick={onViewReadiness}>
          View RE5 readiness
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRetake}>
          Retake mock
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExit}>
          Back to course
        </button>
      </div>
    </ProtectedMockSurface>
  );
}

function ProtectedMockSurface({
  watermark,
  className,
  children,
}: {
  watermark: string;
  className: string;
  children: React.ReactNode;
}) {
  const blockTransfer = (event: React.SyntheticEvent) => event.preventDefault();

  React.useEffect(() => {
    const blockProtectedShortcut = (event: KeyboardEvent) => {
      if (!isProtectedMockShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener("keydown", blockProtectedShortcut, true);
    return () =>
      document.removeEventListener("keydown", blockProtectedShortcut, true);
  }, []);

  return (
    <main
      className={`mock-exam-shell mock-protected-surface ${className}`}
      onCopy={blockTransfer}
      onCut={blockTransfer}
      onContextMenu={blockTransfer}
      onDragStart={blockTransfer}
    >
      <div className="mock-watermark-layer" aria-hidden>
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index}>{watermark}</span>
        ))}
      </div>
      <div className="mock-print-message">
        Printing protected mock-exam content is disabled.
      </div>
      <div className="mock-protected-content">{children}</div>
    </main>
  );
}
