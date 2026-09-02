"use client";

import { isScorableStep } from "@/lib/lessonScoring";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import { LessonView } from "@/components/views/LessonView";
import { LessonSummaryView } from "@/components/views/LessonSummaryView";
import { MockAttemptExperience } from "@/components/views/MockAttemptExperience";
import { useNotho } from "@/context/NothoContext";
import { getLessonTitle, getNextLesson } from "@/app/pageViews.types";
import { analytics } from "@/lib/analytics";
import { CONTENT_DATA } from "@/data/content";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import {
  assignQids,
  requeuedCopy,
  allQuestionsMastered,
  baseQids,
  type WorkingStep,
} from "@/lib/lessonMastery";
import { recordConceptResult } from "@/lib/spaced-repetition";
import {
  resolveLessonSteps,
  nextAttemptNo,
  peekAttemptNo,
  recordMissedVariant,
  clearMissedVariant,
} from "@/lib/lessonBank";
import { logQuestionAttempt } from "@/lib/questionAttempts";
import { ExamResultView, type ExamAttemptSummary } from "@/components/views/ExamResultView";
import { scoreAttempt } from "@/lib/results/score";
import {
  RE5_COURSE_ID,
  examSpecFor,
  isRe5MockExam,
  re5AreaResolver,
} from "@/lib/results/re5";
import { fetchLessonResults, recordLessonResult } from "@/lib/results/store";
import type { LessonResult } from "@/lib/results/types";

/** Saved mid-lesson progress is honoured for this long after the last step. */
const SAVED_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type SavedMidLesson = {
  userId?: string;
  courseId?: string;
  lessonId?: string;
  stepIndex?: number;
  steps?: WorkingStep[];
  answers?: Record<number, unknown>;
  correctCount?: number;
  mistakes?: number;
  masteredQids?: number[];
  mistakenQids?: number[];
  savedAt?: number;
};

function readSavedMidLesson(
  userId: string | null,
  courseId: string,
  lessonId: string
): SavedMidLesson | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem("notho-lesson-progress");
    if (!raw) return null;
    const p = JSON.parse(raw) as SavedMidLesson;
    if (p.userId !== userId || p.courseId !== courseId || p.lessonId !== lessonId) return null;
    if (!p.savedAt || Date.now() - p.savedAt > SAVED_PROGRESS_MAX_AGE_MS) return null;
    return p;
  } catch {
    return null;
  }
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);

  // RE5 mocks have a separate server-owned lifecycle. Keep them out of the
  // generic lesson engine, whose browser-local answers, correctness feedback,
  // mastery requeue and heart deductions are intentionally inappropriate for
  // an examination sitting.
  if (courseId === RE5_COURSE_ID && isRe5MockExam(lessonId)) {
    return <MockAttemptExperience courseId={courseId} lessonId={lessonId} />;
  }

  return <StandardLessonPage courseId={courseId} lessonId={lessonId} />;
}

function StandardLessonPage({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const {
    userId,
    currentLessonState,
    setCurrentLessonState,
    setRoute,
    hearts,
    loseHeart,
    completeLesson,
    lessonSummary,
    setLessonSummary,
  } = useNotho();

  const router = useRouter();
  const lessonStartTimeRef = React.useRef(Date.now());
  const isFinalizingRef = React.useRef(false);
  const lessonHeartLostRef = React.useRef(false); // To track if a heart was lost during this lesson

  // Marked result for an RE5 mock exam. Rendered instead of LessonSummaryView,
  // which has no room for a pass mark, a knowledge-area breakdown or a time.
  const [examResult, setExamResult] = React.useState<{
    attempt: ExamAttemptSummary;
    previousAttempts: LessonResult[];
  } | null>(null);

  // State is only usable when it belongs to THIS URL. A stale state from the
  // previous lesson (e.g. after "Continue to next lesson") must be re-inited,
  // or the old lesson's steps render under the new URL.
  const hasLessonState = Boolean(
    currentLessonState &&
      currentLessonState.steps &&
      currentLessonState.steps.length > 0 &&
      currentLessonState.courseId === courseId &&
      currentLessonState.lessonId === lessonId
  );

  // Arrived without matching in-memory state (page refresh, PWA relaunch,
  // deep link, or next-lesson navigation). Restore the saved mid-lesson
  // position if one exists for this exact lesson, otherwise start it fresh
  // from content; only bail to the course page when the lesson is unknown.
  // Runs in an effect — the previous version called setRoute during render,
  // which is unsafe and dumped users back to the course on every refresh.
  React.useEffect(() => {
    if (hasLessonState) return;
    const course = CONTENT_DATA.courses.find((c) => c.id === courseId);
    const lesson = course?.units
      .flatMap((u) => u.lessons)
      .find((l) => l.id === lessonId);
    const hasContent = Boolean(
      lesson && ((lesson.steps?.length ?? 0) > 0 || (lesson.slots?.length ?? 0) > 0)
    );
    if (lesson && hasContent) {
      const saved = readSavedMidLesson(userId, courseId, lessonId);
      let workingSteps: WorkingStep[];
      if (saved?.steps && saved.steps.length > 0) {
        // Prefer the persisted working steps — they include any re-queued
        // copies from the mastery loop, which can't be re-derived from content.
        workingSteps = saved.steps;
      } else {
        // Fresh (deep link / relaunch, no save): resolve the bank for this
        // attempt, then shuffle with the same seed so answer indexes are stable.
        // Fall back to static steps if bank resolution ever throws/empties, so
        // the lesson still opens instead of hanging on "Loading lesson...".
        const attemptNo = nextAttemptNo(userId, lessonId);
        let resolved = lesson.steps ?? [];
        try {
          const r = resolveLessonSteps(lesson, { userId, attemptNo });
          if (r.length > 0) resolved = r;
        } catch {
          /* keep the static-steps fallback */
        }
        workingSteps = shuffleLessonSteps(
          assignQids(resolved),
          lessonShuffleSeed(userId, courseId, lessonId)
        ) as WorkingStep[];
      }
      if (workingSteps.length === 0) {
        setRoute({ name: "course", courseId });
        return;
      }
      const stepIdx = saved
        ? Math.min(Math.max(0, saved.stepIndex ?? 0), workingSteps.length - 1)
        : 0;
      setCurrentLessonState({
        courseId,
        lessonId,
        stepIndex: stepIdx,
        steps: workingSteps,
        answers: saved?.answers ?? {},
        correctCount: saved?.correctCount ?? 0,
        mistakes: saved?.mistakes ?? 0,
        masteredQids: saved?.masteredQids ?? [],
        mistakenQids: saved?.mistakenQids ?? [],
      });
      return;
    }
    setRoute({ name: "course", courseId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLessonState, userId, courseId, lessonId]);

  if (!hasLessonState || !currentLessonState) {
    return <div className="p-4">Loading lesson...</div>;
  }

  const finalizeCurrentLesson = async (choice: "next" | "course") => {
    // Prevent double-tap on Done from awarding XP multiple times
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    const baseXP = 50;
    const totalXP = baseXP + currentLessonState.correctCount * 10;
    if (!currentLessonState.courseId || !currentLessonState.lessonId) {
      isFinalizingRef.current = false;
      return;
    }

    // Distinct questions in the lesson (re-queued copies share a qid, so this
    // is not inflated by the mastery loop).
    const totalQuestions = baseQids(currentLessonState.steps).length;
    // With the mastery loop every question ends correct, so "perfect" can no
    // longer mean "all correct" — it means the learner never missed on the
    // first try.
    const isPerfect = totalQuestions > 0 && currentLessonState.mistakes === 0;

    const lessonTitleDone =
      getLessonTitle(currentLessonState.courseId, currentLessonState.lessonId) ?? "";
    const { streak: streakAfterLesson, xpAwarded } = await completeLesson(
      currentLessonState.courseId,
      currentLessonState.lessonId,
      totalXP,
      isPerfect
    );

    analytics.lessonCompleted(
      currentLessonState.courseId,
      currentLessonState.lessonId,
      lessonTitleDone,
      {
        xpEarned: xpAwarded,
        isPerfect,
        timeSeconds: Math.round((Date.now() - lessonStartTimeRef.current) / 1000),
        heartLost: lessonHeartLostRef.current,
      }
    );

    if (typeof window !== "undefined") {
      localStorage.removeItem("notho-lesson-progress");
    }

    // ── Record the result ─────────────────────────────────────────────────
    // Runs on EVERY finish, replays included. A re-sit of a mock exam is a
    // replay by definition, and the old early-return for already-completed
    // lessons meant a second attempt produced no score at all — and reported
    // accuracy as correctCount/totalQuestions, which the mastery loop pins at
    // 100% because every question ends correct. Score once, honestly, here.
    const spec = examSpecFor(currentLessonState.lessonId);
    const scored = scoreAttempt(
      currentLessonState.steps,
      currentLessonState.mistakenQids,
      spec ? re5AreaResolver(currentLessonState.lessonId) : undefined
    );
    const elapsedSeconds = Math.round((Date.now() - lessonStartTimeRef.current) / 1000);

    // Read history BEFORE writing this attempt, so "previous best" on the exam
    // result means previous.
    const priorResults = spec
      ? await fetchLessonResults(currentLessonState.courseId)
      : [];

    const savedResult = await recordLessonResult({
      courseId: currentLessonState.courseId,
      lessonId: currentLessonState.lessonId,
      kind: spec ? "exam" : "lesson",
      totalQuestions: scored.totalQuestions,
      firstTryCorrect: scored.firstTryCorrect,
      passMarkCorrect: spec?.passMarkCorrect ?? null,
      durationSeconds: elapsedSeconds,
      areaBreakdown: scored.areaBreakdown,
    });

    if (spec) {
      setExamResult({
        attempt: {
          spec,
          firstTryCorrect: scored.firstTryCorrect,
          totalQuestions: scored.totalQuestions,
          scorePct: scored.scorePct,
          // Integer comparison against the pass mark as a COUNT, never a
          // percentage one: 33 is written down in RE5_MOCK_EXAMS rather than
          // re-derived from the published 65% threshold. See requiredCorrect()
          // in src/lib/results/score.ts.
          passed: scored.firstTryCorrect >= spec.passMarkCorrect,
          durationSeconds: elapsedSeconds,
          areaBreakdown: scored.areaBreakdown,
          saved: savedResult !== null,
        },
        previousAttempts: priorResults,
      });
      isFinalizingRef.current = false;
      return;
    }

    setLessonSummary({
      xpEarned: xpAwarded,
      timeSeconds: elapsedSeconds,
      accuracy: scored.scorePct,
      streak: streakAfterLesson,
      isPerfect,
      choice,
      nextLessonId: getNextLesson(currentLessonState.courseId, currentLessonState.lessonId)?.id ?? null,
      courseId: currentLessonState.courseId,
      lessonId: currentLessonState.lessonId,
    });

    isFinalizingRef.current = false;
  };

  const handleLessonSummaryClose = () => {
    if (!lessonSummary) return;
    const { choice, nextLessonId, courseId } = lessonSummary;
    setLessonSummary(null);
    if (choice === "next" && nextLessonId) {
      setRoute({ name: "lesson", courseId, lessonId: nextLessonId });
    } else {
      setRoute({ name: "course", courseId });
    }
  };

  if (examResult) {
    return (
      <ExamResultView
        attempt={examResult.attempt}
        previousAttempts={examResult.previousAttempts}
        onBackToCourse={() => {
          setExamResult(null);
          setRoute({ name: "course", courseId });
        }}
        onViewReadiness={() => {
          setExamResult(null);
          router.push("/re5-readiness");
        }}
        onRetake={() => {
          setExamResult(null);
          // Clear the finished attempt so the effect above re-resolves the
          // exam from content instead of restoring the completed step list.
          setCurrentLessonState((prev) => ({ ...prev, courseId: null, lessonId: null, steps: [] }));
          setRoute({ name: "lesson", courseId, lessonId });
        }}
      />
    );
  }

  if (lessonSummary) {
    return (
      <LessonSummaryView
        lessonSummary={lessonSummary}
        onClose={handleLessonSummaryClose}
        onBudgetBridge={() => {
          setLessonSummary(null);
          setRoute({ name: "budget" });
        }}
      />
    );
  }

  const nextTitle = (() => {
    if (!currentLessonState.courseId || !currentLessonState.lessonId) return undefined;
    const next = getNextLesson(currentLessonState.courseId, currentLessonState.lessonId);
    return next?.title ?? undefined;
  })();

  // Single source of truth for answering any question type. On a wrong answer
  // it (1) re-queues a fresh copy of the question to the end of the session so
  // the learner must return to it, and (2) pulls the linked concept's next
  // review sooner via SM-2 so it resurfaces in future sessions.
  const recordAnswer = (isCorrect: boolean, answerValue: unknown) => {
    const answeredStep = currentLessonState.steps[currentLessonState.stepIndex] as
      | (WorkingStep & { conceptId?: string })
      | undefined;
    setCurrentLessonState((prev) => {
      const step = prev.steps[prev.stepIndex] as WorkingStep;
      const qid = step?.__qid;
      const answers = { ...prev.answers, [prev.stepIndex]: answerValue };

      // Ungraded steps record the interaction and stop there. An action step is
      // self-reported completion, not a question with a right answer, so it must
      // not touch correctCount, mistakes, hearts or the re-queue. Before this,
      // "Done - I did it!" fell through to the wrong-answer branch below and the
      // step re-queued itself forever — see src/lib/lessonScoring.ts.
      if (!isScorableStep(step?.type)) {
        return { ...prev, answers };
      }

      if (isCorrect) {
        const masteredQids =
          qid !== undefined && !prev.masteredQids.includes(qid)
            ? [...prev.masteredQids, qid]
            : prev.masteredQids;
        return { ...prev, answers, correctCount: prev.correctCount + 1, masteredQids };
      }
      const mistakenQids =
        qid !== undefined && !prev.mistakenQids.includes(qid)
          ? [...prev.mistakenQids, qid]
          : prev.mistakenQids;
      return {
        ...prev,
        answers,
        mistakes: prev.mistakes + 1,
        mistakenQids,
        steps: [...prev.steps, requeuedCopy(step)],
      };
    });
    const slotId = answeredStep?.__slotId;
    const variantId = answeredStep?.__variantId;
    if (userId && slotId && variantId) {
      logQuestionAttempt({
        userId,
        courseId,
        lessonId,
        slotId,
        variantId,
        conceptId: answeredStep?.conceptId,
        attemptNo: peekAttemptNo(userId, lessonId),
        isCorrect,
      });
    }
    if (isCorrect) {
      // Learner finally got this exact item right — stop resurfacing it.
      clearMissedVariant(userId, slotId, variantId);
    } else {
      // Gamification: a wrong answer costs a heart (loseHeart shows the
      // out-of-hearts state when it hits zero).
      loseHeart();
      lessonHeartLostRef.current = true;
      // Resurface this exact variant in future plays, and shorten the concept's
      // SM-2 interval so the idea returns in reviews too.
      recordMissedVariant(userId, slotId, variantId);
      if (answeredStep?.conceptId) void recordConceptResult(answeredStep.conceptId, false);
    }
  };

  const canFinalize = allQuestionsMastered(
    currentLessonState.steps,
    currentLessonState.masteredQids
  );

  return (
    <LessonView
      lessonState={{
        steps: currentLessonState.steps,
        stepIndex: currentLessonState.stepIndex,
        answers: currentLessonState.answers,
      }}
      completeLessonFlow={() => {}}
      nextStep={() => {
        setCurrentLessonState((prev) => ({
          ...prev,
          stepIndex: prev.stepIndex + 1,
        }));
      }}
      finalizeLesson={finalizeCurrentLesson}
      canFinalize={canFinalize}
      answerQuestion={(index: number) => {
        const step = currentLessonState.steps[currentLessonState.stepIndex];
        // Scenario steps render through the same option UI but were never
        // counted (type check was mcq-only) — perfect scores were impossible
        // on lessons containing scenarios.
        const isCorrect =
          (step.type === "mcq" || step.type === "scenario") && index === step.correct;
        recordAnswer(isCorrect, index);
      }}
      answerTrueFalse={(value: boolean) => {
        const step = currentLessonState.steps[currentLessonState.stepIndex];
        const isCorrect = step.type === "true-false" && value === step.correct;
        recordAnswer(isCorrect, value);
      }}
      answerFillBlank={(value: string, isCorrect: boolean) => {
        recordAnswer(isCorrect, value);
      }}
      correctCount={currentLessonState.correctCount}
      hearts={hearts}
      maxHearts={5}
      goBack={() => setRoute({ name: "course", courseId })}
      courseId={courseId}
      courseAccent="#007A85"
      nextLessonTitle={nextTitle}
      lessonTitle={getLessonTitle(courseId, lessonId) || `${courseId} ${lessonId}`}
      lessonStartTimeRef={lessonStartTimeRef}
      // Was counting non-existent types ("question", "action-check") — must
      // match the scoreable set used in finalize, or accuracy is misstated.
      totalQuestions={currentLessonState.steps.filter((s: any) => s.type === "mcq" || s.type === "true-false" || s.type === "scenario" || s.type === "fill-blank").length}
    />
  );
}
