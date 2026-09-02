"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import {
  MockAttemptReport,
  MockAttemptView,
} from "@/components/mock-exam/MockAttemptView";
import {
  getMockAttempt,
  getMockExplanation,
  MockAttemptApiError,
  newMutationId,
  saveMockAttemptMutation,
  startMockAttempt,
  submitMockAttempt,
} from "@/lib/mockAttempts/client";
import {
  remainingFromServerSample,
  type ServerTimeSample,
} from "@/lib/mockAttempts/time";
import type {
  MockAttemptMutation,
  MockAttemptSnapshot,
} from "@/lib/mockAttempts/types";

type InProgressAttempt = MockAttemptSnapshot & { status: "in_progress" };
type SubmittedAttempt = MockAttemptSnapshot & {
  status: "submitted";
  result: NonNullable<MockAttemptSnapshot["result"]>;
  review: NonNullable<MockAttemptSnapshot["review"]>;
};

type QueuedMutation = {
  attemptId: string;
  mutation: MockAttemptMutation;
};

export function shouldAcceptMockSnapshot(
  current: MockAttemptSnapshot | null,
  next: MockAttemptSnapshot
): boolean {
  if (!current) return true;
  if (current.id !== next.id) return false;
  if (current.status === "submitted" && next.status !== "submitted") return false;
  return next.status === "submitted" || next.stateVersion >= current.stateVersion;
}

function snapshotQuestionIndex(
  attempt: MockAttemptSnapshot,
  preferred: number
): number {
  if (attempt.questions.some((question) => question.questionIndex === preferred)) {
    return preferred;
  }
  if (
    attempt.questions.some(
      (question) => question.questionIndex === attempt.currentQuestionIndex
    )
  ) {
    return attempt.currentQuestionIndex;
  }
  return attempt.questions[0]?.questionIndex ?? 0;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Coordinates the browser with the server-owned attempt.
 *
 * The browser keeps only presentation state (the open question and dialogs).
 * Answers, flags, visited state, deadline, grading and review all arrive in an
 * allow-listed server snapshot. Mutations are serial and an exact failed
 * mutation, including its idempotency id, must succeed before later writes run.
 */
export function MockAttemptExperience({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = React.useState<MockAttemptSnapshot | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [pendingSaves, setPendingSaves] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  const mountedRef = React.useRef(false);
  const initialLoadForRef = React.useRef<string | null>(null);
  const latestSnapshotRef = React.useRef<MockAttemptSnapshot | null>(null);
  const timeSampleRef = React.useRef<ServerTimeSample | null>(null);
  const queuedMutationsRef = React.useRef<QueuedMutation[]>([]);
  const processingMutationRef = React.useRef(false);
  const failedMutationRef = React.useRef<QueuedMutation | null>(null);
  const drainWaitersRef = React.useRef<Array<(saved: boolean) => void>>([]);
  const lastViewKeyRef = React.useRef<string | null>(null);
  const refreshInFlightRef = React.useRef(false);
  const submittingRef = React.useRef(false);
  const timeoutSubmitForRef = React.useRef<string | null>(null);

  const resolveDrainWaiters = React.useCallback((saved: boolean) => {
    for (const resolve of drainWaitersRef.current.splice(0)) resolve(saved);
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      resolveDrainWaiters(false);
    };
  }, [resolveDrainWaiters]);

  const updatePendingCount = React.useCallback(() => {
    if (!mountedRef.current) return;
    setPendingSaves(
      queuedMutationsRef.current.length +
        (processingMutationRef.current ? 1 : 0)
    );
  }, []);

  const acceptSnapshot = React.useCallback(
    (next: MockAttemptSnapshot, replaceAttempt = false): boolean => {
      const current = latestSnapshotRef.current;
      if (!replaceAttempt && !shouldAcceptMockSnapshot(current, next)) return false;

      latestSnapshotRef.current = next;
      const receivedAtMonotonicMs = performance.now();
      timeSampleRef.current = {
        remainingSeconds: next.remainingSeconds,
        receivedAtMonotonicMs,
      };
      if (mountedRef.current) {
        setAttempt(next);
        setRemainingSeconds(next.remainingSeconds);
        setCurrentIndex((index) => snapshotQuestionIndex(next, index));
      }
      return true;
    },
    []
  );

  const processMutationQueue = React.useCallback(async () => {
    if (processingMutationRef.current || failedMutationRef.current) return;
    processingMutationRef.current = true;
    updatePendingCount();

    while (
      mountedRef.current &&
      queuedMutationsRef.current.length > 0 &&
      !failedMutationRef.current
    ) {
      const queued = queuedMutationsRef.current.shift()!;
      updatePendingCount();
      try {
        const next = await saveMockAttemptMutation(
          queued.attemptId,
          queued.mutation
        );
        acceptSnapshot(next);
        if (next.status === "submitted") {
          queuedMutationsRef.current = [];
          failedMutationRef.current = null;
          if (mountedRef.current) setSaveError(null);
          break;
        }
      } catch (error) {
        const authoritative =
          error instanceof MockAttemptApiError ? error.attempt : null;
        if (authoritative) acceptSnapshot(authoritative);

        // A mutation that crossed the deadline is deliberately rejected, but
        // the response includes the now-submitted authoritative report. There
        // is no unsaved active-paper state to retry in that case.
        if (authoritative?.status === "submitted") {
          queuedMutationsRef.current = [];
          failedMutationRef.current = null;
          if (mountedRef.current) setSaveError(null);
          break;
        }

        failedMutationRef.current = queued;
        if (mountedRef.current) {
          setSaveError(
            errorMessage(
              error,
              "This change was not saved. Retry it before continuing."
            )
          );
        }
        resolveDrainWaiters(false);
      }
    }

    processingMutationRef.current = false;
    updatePendingCount();
    if (!failedMutationRef.current && queuedMutationsRef.current.length === 0) {
      resolveDrainWaiters(true);
    }
  }, [acceptSnapshot, resolveDrainWaiters, updatePendingCount]);

  const queueMutation = React.useCallback(
    (next: QueuedMutation) => {
      if (failedMutationRef.current) return;
      const active = latestSnapshotRef.current;
      if (!active || active.id !== next.attemptId || active.status !== "in_progress") {
        return;
      }
      queuedMutationsRef.current.push(next);
      updatePendingCount();
      void processMutationQueue();
    },
    [processMutationQueue, updatePendingCount]
  );

  const waitForSavedMutations = React.useCallback((): Promise<boolean> => {
    if (failedMutationRef.current) return Promise.resolve(false);
    if (
      !processingMutationRef.current &&
      queuedMutationsRef.current.length === 0
    ) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => drainWaitersRef.current.push(resolve));
  }, []);

  const retryFailedMutation = React.useCallback(() => {
    const failed = failedMutationRef.current;
    if (!failed) return;
    const active = latestSnapshotRef.current;
    if (!active || active.id !== failed.attemptId || active.status !== "in_progress") {
      failedMutationRef.current = null;
      if (mountedRef.current) setSaveError(null);
      return;
    }
    failedMutationRef.current = null;
    queuedMutationsRef.current.unshift(failed);
    if (mountedRef.current) setSaveError(null);
    updatePendingCount();
    void processMutationQueue();
  }, [processMutationQueue, updatePendingCount]);

  const loadAttempt = React.useCallback(
    async (newAttempt: boolean) => {
      setLoading(true);
      setLoadError(null);
      if (newAttempt) {
        latestSnapshotRef.current = null;
        timeSampleRef.current = null;
        lastViewKeyRef.current = null;
        timeoutSubmitForRef.current = null;
        setAttempt(null);
        setSaveError(null);
      }
      try {
        const next = await startMockAttempt(courseId, lessonId, newAttempt);
        acceptSnapshot(next, newAttempt || latestSnapshotRef.current === null);
        setCurrentIndex(snapshotQuestionIndex(next, next.currentQuestionIndex));
      } catch (error) {
        setLoadError(
          errorMessage(error, "The mock examination could not be loaded.")
        );
      } finally {
        setLoading(false);
      }
    },
    [acceptSnapshot, courseId, lessonId]
  );

  React.useEffect(() => {
    const key = `${courseId}:${lessonId}`;
    if (initialLoadForRef.current === key) return;
    initialLoadForRef.current = key;
    void loadAttempt(false);
  }, [courseId, lessonId, loadAttempt]);

  const attemptId = attempt?.id ?? null;
  const attemptStatus = attempt?.status ?? null;

  // Persist every navigation, including revisits, so the server's resume
  // position is the last question the learner actually opened.
  React.useEffect(() => {
    if (!attemptId || attemptStatus !== "in_progress") return;
    const key = `${attemptId}:${currentIndex}`;
    if (lastViewKeyRef.current === key) return;
    lastViewKeyRef.current = key;
    queueMutation({
      attemptId,
      mutation: {
        action: "view",
        mutationId: newMutationId(),
        questionIndex: currentIndex,
      },
    });
  }, [attemptId, attemptStatus, currentIndex, queueMutation]);

  React.useEffect(() => {
    const tick = () => {
      const sample = timeSampleRef.current;
      if (!sample) return;
      setRemainingSeconds(
        remainingFromServerSample(sample, performance.now())
      );
    };
    const interval = window.setInterval(tick, 500);
    tick();
    return () => window.clearInterval(interval);
  }, []);

  const refreshAttempt = React.useCallback(async () => {
    const active = latestSnapshotRef.current;
    if (!active || refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    try {
      const next = await getMockAttempt(active.id);
      acceptSnapshot(next);
      if (next.status === "submitted") {
        failedMutationRef.current = null;
        queuedMutationsRef.current = [];
        if (mountedRef.current) setSaveError(null);
        resolveDrainWaiters(true);
      }
    } catch {
      // A failed timer poll leaves the last server sample intact. Mutation and
      // submit failures have separate, actionable messages.
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [acceptSnapshot, resolveDrainWaiters]);

  React.useEffect(() => {
    if (!attemptId || attemptStatus !== "in_progress") return;
    const interval = window.setInterval(() => void refreshAttempt(), 30_000);
    const resyncWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshAttempt();
    };
    document.addEventListener("visibilitychange", resyncWhenVisible);
    window.addEventListener("online", refreshAttempt);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", resyncWhenVisible);
      window.removeEventListener("online", refreshAttempt);
    };
  }, [attemptId, attemptStatus, refreshAttempt]);

  React.useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (pendingSaves === 0 && !saveError) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [pendingSaves, saveError]);

  const submitCurrentAttempt = React.useCallback(
    async (reason: "learner" | "time_expired") => {
      const current = latestSnapshotRef.current;
      if (
        !current ||
        current.status !== "in_progress" ||
        submittingRef.current ||
        (reason === "learner" && !current.allViewed)
      ) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      setShowSubmitConfirm(false);
      const saved = await waitForSavedMutations();
      if (!saved) {
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }

      const afterSaves = latestSnapshotRef.current;
      if (!afterSaves || afterSaves.status === "submitted") {
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }

      try {
        const next = await submitMockAttempt(afterSaves.id);
        acceptSnapshot(next);
        setSaveError(null);
      } catch (error) {
        const authoritative =
          error instanceof MockAttemptApiError ? error.attempt : null;
        if (authoritative) acceptSnapshot(authoritative);
        if (authoritative?.status !== "submitted") {
          setSaveError(
            errorMessage(error, "The attempt could not be submitted.")
          );
          if (reason === "time_expired") {
            window.setTimeout(() => {
              if (timeoutSubmitForRef.current === afterSaves.id) {
                timeoutSubmitForRef.current = null;
                void refreshAttempt();
              }
            }, 3_000);
          }
        }
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [acceptSnapshot, refreshAttempt, waitForSavedMutations]
  );

  React.useEffect(() => {
    if (
      !attemptId ||
      attemptStatus !== "in_progress" ||
      remainingSeconds > 0 ||
      timeoutSubmitForRef.current === attemptId
    ) {
      return;
    }
    timeoutSubmitForRef.current = attemptId;
    void submitCurrentAttempt("time_expired");
  }, [attemptId, attemptStatus, remainingSeconds, submitCurrentAttempt]);

  const answerQuestion = React.useCallback(
    (questionIndex: number, answeredOptionId: string | null) => {
      const active = latestSnapshotRef.current;
      if (!active || active.status !== "in_progress" || failedMutationRef.current) {
        return;
      }
      queueMutation({
        attemptId: active.id,
        mutation: {
          action: "answer",
          mutationId: newMutationId(),
          questionIndex,
          answeredOptionId,
        },
      });
    },
    [queueMutation]
  );

  const flagQuestion = React.useCallback(
    (questionIndex: number, flagged: boolean) => {
      const active = latestSnapshotRef.current;
      if (!active || active.status !== "in_progress" || failedMutationRef.current) {
        return;
      }
      queueMutation({
        attemptId: active.id,
        mutation: {
          action: "flag",
          mutationId: newMutationId(),
          questionIndex,
          flagged,
        },
      });
    },
    [queueMutation]
  );

  const navigateQuestion = React.useCallback((questionIndex: number) => {
    const active = latestSnapshotRef.current;
    if (!active || active.status !== "in_progress" || failedMutationRef.current) {
      return;
    }
    if (
      active.questions.some(
        (question) => question.questionIndex === questionIndex
      )
    ) {
      setCurrentIndex(questionIndex);
    }
  }, []);

  if (loading && !attempt) {
    return (
      <main className="mock-exam-shell mock-state-screen" aria-live="polite">
        <LoaderCircle className="mock-spinner" size={36} aria-hidden />
        <h1>Preparing your protected paper…</h1>
        <p>The server is restoring your fixed deadline and saved answers.</p>
      </main>
    );
  }

  if (loadError && !attempt) {
    return (
      <MockStateScreen
        title="The mock could not be loaded"
        message={loadError}
        onRetry={() => void loadAttempt(false)}
        onExit={() => router.push(`/course/${courseId}`)}
      />
    );
  }

  if (!attempt) return null;

  if (attempt.status === "submitted") {
    if (!attempt.result || !attempt.review) {
      return (
        <MockStateScreen
          title="The result report is incomplete"
          message="Refresh the authoritative attempt before reviewing this paper."
          onRetry={() => void refreshAttempt()}
          onExit={() => router.push(`/course/${courseId}`)}
        />
      );
    }
    const submitted = attempt as SubmittedAttempt;
    return (
      <MockAttemptReport
        attempt={submitted}
        onExplain={(questionId) =>
          getMockExplanation(submitted.id, questionId)
        }
        onExit={() => router.push(`/course/${courseId}`)}
        onViewReadiness={() => router.push("/re5-readiness")}
        onRetake={() => void loadAttempt(true)}
      />
    );
  }

  const active = attempt as InProgressAttempt;

  const requestSubmit = () => {
    const current = latestSnapshotRef.current;
    if (!current || current.status !== "in_progress" || !current.allViewed) return;
    if (current.unansweredCount > 0) {
      setShowSubmitConfirm(true);
      return;
    }
    void submitCurrentAttempt("learner");
  };

  return (
    <>
      <MockAttemptView
        attempt={active}
        currentIndex={currentIndex}
        remainingSeconds={remainingSeconds}
        pendingSaves={pendingSaves}
        saveError={saveError}
        submitting={submitting}
        onNavigate={navigateQuestion}
        onAnswer={answerQuestion}
        onFlag={flagQuestion}
        onRequestSubmit={requestSubmit}
        onExit={() => setShowExitConfirm(true)}
        onRetrySave={() => {
          if (failedMutationRef.current) retryFailedMutation();
          else void refreshAttempt();
        }}
      />

      {showSubmitConfirm && (
        <MockDialog
          title={`Submit with ${active.unansweredCount} unanswered?`}
          onDismiss={() => setShowSubmitConfirm(false)}
          icon={<AlertTriangle size={38} aria-hidden />}
        >
          <p>
            Blank answers receive no mark. You can keep working, or submit this
            server-graded attempt now.
          </p>
          <div className="mock-dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Keep working
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={submitting || Boolean(saveError)}
              onClick={() => void submitCurrentAttempt("learner")}
            >
              <ShieldCheck size={17} aria-hidden /> Submit mock
            </button>
          </div>
        </MockDialog>
      )}

      {showExitConfirm && (
        <MockDialog
          title="Leave the mock?"
          onDismiss={() => setShowExitConfirm(false)}
          icon={<AlertCircle size={38} aria-hidden />}
        >
          <p>
            Server-acknowledged answers, flags and your place will be here when
            you return. The fixed timer continues while you are away.
          </p>
          {saveError && (
            <p className="mock-dialog-error">
              Retry the unsaved change before leaving this screen.
            </p>
          )}
          <div className="mock-dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowExitConfirm(false)}
            >
              Stay
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pendingSaves > 0 || Boolean(saveError)}
              onClick={() => router.push(`/course/${courseId}`)}
            >
              {pendingSaves > 0 ? "Saving…" : "Leave mock"}
            </button>
          </div>
        </MockDialog>
      )}
    </>
  );
}

function MockStateScreen({
  title,
  message,
  onRetry,
  onExit,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <main className="mock-exam-shell">
      <section className="mock-state-screen" role="alert">
        <AlertCircle size={38} aria-hidden />
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="mock-state-actions">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
          <button type="button" className="btn btn-secondary" onClick={onExit}>
            Back to course
          </button>
        </div>
      </section>
    </main>
  );
}

function MockDialog({
  title,
  icon,
  onDismiss,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const titleId = React.useId();
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onDismiss]);

  return (
    <div
      className="mock-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div
        ref={dialogRef}
        className="mock-submit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {icon}
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
