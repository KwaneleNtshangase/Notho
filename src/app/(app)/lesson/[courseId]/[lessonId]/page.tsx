"use client";

import { isScorableStep } from "@/lib/lessonScoring";
import React, { use } from "react";
import { LessonView } from "@/components/views/LessonView";
import { LessonSummaryView } from "@/components/views/LessonSummaryView";
import { useNotho } from "@/context/NothoContext";
import { getLessonTitle, getNextLesson } from "@/app/pageViews.types";
import { analytics } from "@/lib/analytics";
import { CONTENT_DATA } from "@/data/content";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import {
  assignQids,
  requeuedCopy,
  allQuestionsMastered,
  firstTryAccuracy,
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

/** Saved mid-lesson progress is honoured for this long after the last step. */
const SAVED_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Where this lesson URL is in its lifecycle.
 *
 * This replaces `isFinalizingRef`, which was a guard flag: it stopped a second
 * finalize from running but changed nothing on screen, so LessonView stayed
 * mounted with its "Done - Back to Course" button live through the whole
 * await — and again after the summary was dismissed, while router.push was
 * still in flight. Tapping it there re-entered finalize, cancelled the exit and
 * recomputed the elapsed time from a start that never reset. That is the
 * bounce, and the climbing clock.
 *
 * A phase fixes it because it is monotonic and it drives the render: once a
 * lesson leaves "playing" it never shows LessonView again, so there is no
 * button left to tap.
 *
 *   playing   → the learner is working through the steps
 *   finishing → finalize is awaiting the server; show progress, accept nothing
 *   summary   → LessonSummaryView is up
 *   leaving   → navigation is in flight; render nothing interactive
 */
type LessonPhase = "playing" | "finishing" | "summary" | "leaving";

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

/** Neutral screen for the phases where nothing may be interactive. */
function LessonInterstitial({ label }: { label: string }) {
  return (
    <div
      className="p-4"
      role="status"
      aria-live="polite"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-secondary)",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const {
    userId,
    userData,
    currentLessonState,
    setCurrentLessonState,
    setRoute,
    leaveLesson,
    hearts,
    loseHeart,
    completeLesson,
    isLessonCompleted,
    lessonSummary,
    setLessonSummary,
  } = useNotho();

  const lessonKey = `${courseId}:${lessonId}`;

  // ── Phase, keyed to the lesson in the URL ───────────────────────────────
  //
  // Keyed rather than reset in an effect, so a new lesson starts in "playing"
  // on its very first render. An effect would leave one frame where the
  // previous lesson's phase still applied — small, but that is precisely the
  // size of the window this whole fix is about. Adjusting state during render
  // when a prop changes is React's own sanctioned pattern for this.
  const [phaseState, setPhaseState] = React.useState<{ key: string; phase: LessonPhase }>({
    key: lessonKey,
    phase: "playing",
  });
  if (phaseState.key !== lessonKey) {
    setPhaseState({ key: lessonKey, phase: "playing" });
  }
  const phase: LessonPhase = phaseState.key === lessonKey ? phaseState.phase : "playing";

  // Synchronous mirror of the phase, for the one thing state cannot do: stop a
  // second tap that lands in the same frame, before React has re-rendered, from
  // starting a second finalize and awarding XP twice. Written only in event
  // handlers and effects — never during render.
  const phaseRef = React.useRef<LessonPhase>("playing");
  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const enterPhase = React.useCallback(
    (next: LessonPhase) => {
      phaseRef.current = next;
      setPhaseState({ key: lessonKey, phase: next });
    },
    [lessonKey]
  );

  // ── The lesson clock ────────────────────────────────────────────────────
  //
  // Started per lesson URL and STOPPED at the instant finalize begins. It was
  // previously read fresh on every finalize from a ref that never reset, so
  // each pass round the bounce showed a larger time — the "counter that keeps
  // climbing". Freezing it also makes the number honest: it measures the
  // lesson, not the lesson plus however long the summary sat on screen.
  //
  // Started in an effect, not in the useRef initialiser: Date.now() is impure,
  // and a render may run more than once. First paint is the right moment to
  // start timing a lesson anyway.
  //
  // LessonView receives lessonStartTimeRef as a prop. It does not read it today,
  // and it does not need to: the phase machine unmounts LessonView the moment
  // finalize begins, so any timer that ever lives in there stops by
  // construction rather than by remembering to stop it.
  const lessonStartTimeRef = React.useRef<number>(0);
  const frozenSecondsRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    lessonStartTimeRef.current = Date.now();
    frozenSecondsRef.current = null;
  }, [lessonKey]);

  const stopLessonClock = React.useCallback(() => {
    if (frozenSecondsRef.current === null) {
      const startedAt = lessonStartTimeRef.current || Date.now();
      frozenSecondsRef.current = Math.max(
        0,
        Math.round((Date.now() - startedAt) / 1000)
      );
    }
    return frozenSecondsRef.current;
  }, []);

  const lessonHeartLostRef = React.useRef(false); // did a heart go during this run

  // State is only usable when it belongs to THIS URL. NothoContext already
  // scopes it to the pathname, so this is now a cheap local restatement rather
  // than the only thing standing between the user and the previous lesson.
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
  //
  // The `phase !== "playing"` guard is the important addition. Without it this
  // effect re-armed a lesson the learner had just left: finalize clears the
  // saved progress, the context releases the lesson state, `hasLessonState`
  // goes false — and this effect promptly built a brand new run of the same
  // lesson underneath the summary, which is what the exit was then fighting.
  React.useEffect(() => {
    if (phase !== "playing") return;
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
        // Redirecting away from a route that cannot render is exactly what an
        // effect is for; the phase change is what stops this effect re-arming
        // the lesson while the navigation is in flight.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        enterPhase("leaving");
        leaveLesson(courseId);
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
    // Unknown lesson — same redirect-from-an-effect as above.
    enterPhase("leaving");
    leaveLesson(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, hasLessonState, userId, courseId, lessonId]);

  const finalizeCurrentLesson = async (choice: "next" | "course") => {
    // `phase` is correct for this render; the ref catches a second tap that
    // lands in the same frame, before React has re-rendered. One owner, two
    // reads, neither of which can be stale.
    if (phase !== "playing" || phaseRef.current !== "playing") return;
    if (!hasLessonState || !currentLessonState.courseId || !currentLessonState.lessonId) return;

    const lessonCourseId = currentLessonState.courseId;
    const lessonLessonId = currentLessonState.lessonId;

    // Stop the clock before anything can await. Everything below reports this
    // number, so the summary can never grow while it is on screen.
    const timeSeconds = stopLessonClock();
    enterPhase("finishing");

    const baseXP = 50;
    const totalXP = baseXP + currentLessonState.correctCount * 10;

    // Distinct questions in the lesson (re-queued copies share a qid, so this
    // is not inflated by the mastery loop).
    const totalQuestions = baseQids(currentLessonState.steps).length;
    // With the mastery loop every question ends correct, so "perfect" can no
    // longer mean "all correct" — it means the learner never missed on the
    // first try.
    const isPerfect = totalQuestions > 0 && currentLessonState.mistakes === 0;
    const alreadyCompleted = isLessonCompleted(lessonCourseId, lessonLessonId);
    const lessonTitleDone = getLessonTitle(lessonCourseId, lessonLessonId) ?? "";
    const nextLessonId = getNextLesson(lessonCourseId, lessonLessonId)?.id ?? null;

    // Accuracy differs by branch and always has. A replay has no first-try
    // record to speak of (the mistakenQids of THIS run only), so it reports
    // straight correctness; a first completion reports first-try accuracy,
    // which is the number the mastery loop makes meaningful.
    const accuracy = alreadyCompleted
      ? totalQuestions > 0
        ? Math.min(100, Math.round((currentLessonState.correctCount / totalQuestions) * 100))
        : 0
      : firstTryAccuracy(currentLessonState.steps, currentLessonState.mistakenQids);

    let xpAwarded = 0;
    let streakAfterLesson = userData?.streak ?? 0;

    try {
      const result = await completeLesson(
        lessonCourseId,
        lessonLessonId,
        totalXP,
        isPerfect
      );
      xpAwarded = result.xpAwarded;
      streakAfterLesson = result.streak;
    } catch (err) {
      // Never strand the learner inside a finished lesson. completeLesson does
      // its own network error handling, but if anything in it ever throws, the
      // old code left isFinalizingRef stuck true and every subsequent tap on
      // "Done - Back to Course" became a silent no-op — the reported "I am
      // trapped in the lesson". Show what we know and let them out.
      console.error("[lesson] finalize failed; showing local summary", err);
    }

    try {
      analytics.lessonCompleted(lessonCourseId, lessonLessonId, lessonTitleDone, {
        xpEarned: xpAwarded,
        isPerfect,
        timeSeconds,
        heartLost: lessonHeartLostRef.current,
      });
    } catch {
      /* analytics must never block the exit */
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("notho-lesson-progress");
      } catch {
        /* best-effort */
      }
    }

    // Perfect-lesson count is server-backed (perfect_lessons_total via
    // completeLesson → recordLessonStats) — no device-local counter to drift.
    setLessonSummary({
      xpEarned: xpAwarded,
      timeSeconds,
      accuracy,
      streak: streakAfterLesson,
      isPerfect,
      choice,
      nextLessonId,
      courseId: lessonCourseId,
      lessonId: lessonLessonId,
    });
    enterPhase("summary");
  };

  const handleLessonSummaryClose = () => {
    const summary = lessonSummary;
    // Enter "leaving" BEFORE clearing the summary. Clearing first is what used
    // to hand the screen back to LessonView — and its finish button — for the
    // whole duration of the pending navigation.
    enterPhase("leaving");
    setLessonSummary(null);
    if (summary?.choice === "next" && summary.nextLessonId) {
      setRoute({
        name: "lesson",
        courseId: summary.courseId,
        lessonId: summary.nextLessonId,
      });
      return;
    }
    leaveLesson(summary?.courseId ?? courseId);
  };

  // ── Render by phase. Order matters: the terminal phases win. ─────────────
  if (phase === "leaving") {
    return <LessonInterstitial label="Taking you back…" />;
  }

  if (phase === "summary") {
    // The summary is scoped to this URL by NothoContext. If it is gone, the URL
    // moved on and this page is on its way out — never fall back to LessonView.
    if (!lessonSummary) return <LessonInterstitial label="Taking you back…" />;
    return (
      <LessonSummaryView
        lessonSummary={lessonSummary}
        onClose={handleLessonSummaryClose}
        onBudgetBridge={() => {
          enterPhase("leaving");
          setLessonSummary(null);
          setRoute({ name: "budget" });
        }}
      />
    );
  }

  if (phase === "finishing") {
    return <LessonInterstitial label="Saving your progress…" />;
  }

  if (!hasLessonState || !currentLessonState) {
    return <div className="p-4">Loading lesson...</div>;
  }

  const nextTitle = (() => {
    const next = getNextLesson(courseId, lessonId);
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
      // Never write an answer into a lesson that is not the one on screen.
      if (prev.courseId !== courseId || prev.lessonId !== lessonId) return prev;
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
        setCurrentLessonState((prev) => {
          if (prev.courseId !== courseId || prev.lessonId !== lessonId) return prev;
          return { ...prev, stepIndex: prev.stepIndex + 1 };
        });
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
      // Exit is unconditional and takes its destination from the URL, so it
      // works when in-memory state is stale, empty or mid-restore. Entering
      // "leaving" first stops the mount effect above from re-arming the lesson
      // while the navigation is in flight.
      goBack={() => {
        enterPhase("leaving");
        leaveLesson(courseId);
      }}
      courseId={courseId}
      courseAccent="#007A85"
      nextLessonTitle={nextTitle}
      lessonTitle={getLessonTitle(courseId, lessonId) || `${courseId} ${lessonId}`}
      lessonStartTimeRef={lessonStartTimeRef}
      // Was counting non-existent types ("question", "action-check") — must
      // match the scoreable set used in finalize, or accuracy is misstated.
      totalQuestions={currentLessonState.steps.filter((s: WorkingStep) => s.type === "mcq" || s.type === "true-false" || s.type === "scenario" || s.type === "fill-blank").length}
    />
  );
}
