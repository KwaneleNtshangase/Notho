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
import { recordConceptResult, scheduleConceptsForCourse } from "@/lib/spaced-repetition";
import { conceptIdsFromLessonSteps } from "@/lib/reviewIntro";
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

function warmRoute(router: { prefetch: (href: string) => void }, href: string) {
  try {
    router.prefetch(href);
  } catch {
    /* prefetch is best-effort */
  }
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);

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
    userData,
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
  const lessonHeartLostRef = React.useRef(false);

  const [examResult, setExamResult] = React.useState<{
    attempt: ExamAttemptSummary;
    previousAttempts: LessonResult[];
  } | null>(null);

  const hasLessonState = Boolean(
    currentLessonState &&
      currentLessonState.steps &&
      currentLessonState.steps.length > 0 &&
      currentLessonState.courseId === courseId &&
      currentLessonState.lessonId === lessonId
  );

  React.useEffect(() => {
    warmRoute(router, `/course/${courseId}`);
    warmRoute(router, "/learn");
    const next = getNextLesson(courseId, lessonId);
    if (next?.id) warmRoute(router, `/lesson/${courseId}/${next.id}`);
  }, [router, courseId, lessonId]);

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
        workingSteps = saved.steps;
      } else {
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

  const finalizeCurrentLesson = (choice: "next" | "course") => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    if (!currentLessonState.courseId || !currentLessonState.lessonId) {
      isFinalizingRef.current = false;
      return;
    }

    const doneCourseId = currentLessonState.courseId;
    const doneLessonId = currentLessonState.lessonId;
    const nextLesson = getNextLesson(doneCourseId, doneLessonId);

    warmRoute(router, `/course/${doneCourseId}`);
    if (choice === "next" && nextLesson?.id) {
      warmRoute(router, `/lesson/${doneCourseId}/${nextLesson.id}`);
    }

    const baseXP = 50;
    const totalXP = baseXP + currentLessonState.correctCount * 10;
    const totalQuestions = baseQids(currentLessonState.steps).length;
    const isPerfect = totalQuestions > 0 && currentLessonState.mistakes === 0;
    const elapsedSeconds = Math.round((Date.now() - lessonStartTimeRef.current) / 1000);
    const lessonTitleDone = getLessonTitle(doneCourseId, doneLessonId) ?? "";
    const spec = examSpecFor(doneLessonId);
    const scored = scoreAttempt(
      currentLessonState.steps,
      currentLessonState.mistakenQids,
      spec ? re5AreaResolver(doneLessonId) : undefined
    );

    if (typeof window !== "undefined") {
      localStorage.removeItem("notho-lesson-progress");
    }

    if (!spec) {
      setLessonSummary({
        xpEarned: totalXP,
        timeSeconds: elapsedSeconds,
        accuracy: scored.scorePct,
        streak: userData?.streak ?? 0,
        isPerfect,
        choice,
        nextLessonId: nextLesson?.id ?? null,
        courseId: doneCourseId,
        lessonId: doneLessonId,
      });
    }

    void (async () => {
      try {
        const { streak: streakAfterLesson, xpAwarded } = await completeLesson(
          doneCourseId,
          doneLessonId,
          totalXP,
          isPerfect
        );

        analytics.lessonCompleted(doneCourseId, doneLessonId, lessonTitleDone, {
          xpEarned: xpAwarded,
          isPerfect,
          timeSeconds: elapsedSeconds,
          heartLost: lessonHeartLostRef.current,
        });

        void scheduleConceptsForCourse(
          conceptIdsFromLessonSteps(currentLessonState.steps)
        );

        const priorResults = spec ? await fetchLessonResults(doneCourseId) : [];

        const savedResult = await recordLessonResult({
          courseId: doneCourseId,
          lessonId: doneLessonId,
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
              passed: scored.firstTryCorrect >= spec.passMarkCorrect,
              durationSeconds: elapsedSeconds,
              areaBreakdown: scored.areaBreakdown,
              saved: savedResult !== null,
            },
            previousAttempts: priorResults,
          });
        } else {
          setLessonSummary((prev) =>
            prev && prev.courseId === doneCourseId && prev.lessonId === doneLessonId
              ? { ...prev, xpEarned: xpAwarded, streak: streakAfterLesson }
              : prev
          );
        }
      } catch {
        /* persistence failed; the local completion screen already showed */
      } finally {
        isFinalizingRef.current = false;
      }
    })();
  };

  const handleLessonSummaryClose = () => {
    if (!lessonSummary) return;
    const { choice, nextLessonId, courseId: summaryCourseId } = lessonSummary;
    if (choice === "next" && nextLessonId) {
      warmRoute(router, `/lesson/${summaryCourseId}/${nextLessonId}`);
    } else {
      warmRoute(router, `/course/${summaryCourseId}`);
    }
    setLessonSummary(null);
    if (choice === "next" && nextLessonId) {
      setRoute({ name: "lesson", courseId: summaryCourseId, lessonId: nextLessonId });
    } else {
      setRoute({ name: "course", courseId: summaryCourseId });
    }
  };

  if (examResult) {
    return (
      <ExamResultView
        attempt={examResult.attempt}
        previousAttempts={examResult.previousAttempts}
        onBackToCourse={() => {
          setExamResult(null);
          warmRoute(router, `/course/${courseId}`);
          setRoute({ name: "course", courseId });
        }}
        onViewReadiness={() => {
          setExamResult(null);
          router.push("/re5-readiness");
        }}
        onRetake={() => {
          setExamResult(null);
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

  const recordAnswer = (isCorrect: boolean, answerValue: unknown) => {
    const answeredStep = currentLessonState.steps[currentLessonState.stepIndex] as
      | (WorkingStep & { conceptId?: string })
      | undefined;
    setCurrentLessonState((prev) => {
      const step = prev.steps[prev.stepIndex] as WorkingStep;
      const qid = step?.__qid;
      const answers = { ...prev.answers, [prev.stepIndex]: answerValue };

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
    if (answeredStep?.conceptId) {
      void recordConceptResult(answeredStep.conceptId, isCorrect);
    }
    if (isCorrect) {
      clearMissedVariant(userId, slotId, variantId);
    } else {
      loseHeart();
      lessonHeartLostRef.current = true;
      recordMissedVariant(userId, slotId, variantId);
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
      totalQuestions={currentLessonState.steps.filter((s: any) => s.type === "mcq" || s.type === "true-false" || s.type === "scenario" || s.type === "fill-blank").length}
    />
  );
}
