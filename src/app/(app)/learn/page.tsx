"use client";

import React, { useState } from "react";
import { LearnView } from "@/components/views/LearnView";
import { CONTENT_DATA, Lesson } from "@/data/content";
import { useNotho } from "@/context/NothoContext";
import { analytics } from "@/lib/analytics";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import { assignQids, type WorkingStep } from "@/lib/lessonMastery";
import type { SavedLessonProgress } from "@/app/pageViews.types";

export default function LearnPage() {
  const {
    userId,
    isLessonCompleted,
    setRoute,
    progressReady,
    userData,
    hearts,
    setShowNoHearts,
    setCurrentLessonState,
    lessonResume,
  } = useNotho();

  // The resume point now comes from the cross-device store rather than
  // straight out of localStorage: it is the merge of this device's record and
  // the account's (LWW on savedAt, GREATEST within the same lesson), already
  // filtered for tombstones and for the 7-day staleness cut-off. So a lesson
  // started on the phone shows up as "Continue" here.
  const [dismissed, setDismissed] = useState(false);
  // LearnView types the resume card's payload as SavedLessonProgress — it only
  // reads the title and a timestamp — but hands the same object straight back
  // to onResumeLesson, which needs the full position. Same object, wider
  // runtime shape, exactly as when this came out of localStorage as `any`.
  const savedProgress =
    dismissed || !lessonResume
      ? null
      : ({
          ...lessonResume,
          completedAt: lessonResume.savedAt,
        } as unknown as SavedLessonProgress);

  const resumeLesson = React.useCallback(
    (progress: any) => {
      const course = CONTENT_DATA.courses.find((c) => c.id === progress.courseId);
      if (!course) return;
      let found: Lesson | undefined;
      for (const unit of course.units) {
        const lesson = unit.lessons.find((l) => l.id === progress.lessonId);
        if (lesson) {
          found = lesson;
          break;
        }
      }
      const savedHasSteps = Array.isArray(progress.steps) && progress.steps.length > 0;
      if (!found || (!found.steps?.length && !savedHasSteps)) return;
      if (hearts <= 0) {
        setShowNoHearts(true);
        return;
      }
      // Prefer the persisted working steps (they carry any re-queued copies
      // from the mastery loop). Otherwise rebuild from content, tagging question
      // ids so the mastery loop tracks completion.
      const savedSteps: WorkingStep[] = savedHasSteps
        ? (progress.steps as WorkingStep[])
        : (shuffleLessonSteps(
            assignQids(found!.steps ?? []),
            lessonShuffleSeed(userId, progress.courseId, progress.lessonId)
          ) as WorkingStep[]);
      const stepIdx = Math.min(
        Math.max(0, progress.stepIndex ?? 0),
        savedSteps.length - 1
      );
      setCurrentLessonState({
        courseId: progress.courseId,
        lessonId: progress.lessonId,
        stepIndex: stepIdx,
        steps: savedSteps,
        // Restore the user's actual answers so accuracy/XP aren't understated
        // after a resume (previously reset to zero).
        answers: progress.answers ?? {},
        correctCount: progress.correctCount ?? 0,
        mistakes: progress.mistakes ?? 0,
        masteredQids: progress.masteredQids ?? [],
        mistakenQids: progress.mistakenQids ?? [],
      });
      setRoute({ name: "lesson", courseId: progress.courseId, lessonId: progress.lessonId });
      // Hide the card for this render; the lesson state effect immediately
      // writes a fresh resume record (and syncs it) as the learner steps.
      setDismissed(true);
    },
    [hearts, userId, setCurrentLessonState, setRoute, setShowNoHearts]
  );

  return (
    <LearnView
      courses={CONTENT_DATA.courses}
      isLessonCompleted={isLessonCompleted}
      goToCourse={(courseId) => {
        const c = CONTENT_DATA.courses.find((x) => x.id === courseId);
        if (c) analytics.courseOpened(courseId, c.title);
        setRoute({ name: "course", courseId });
      }}
      contentLoaded={progressReady}
      savedProgress={savedProgress}
      onResumeLesson={resumeLesson}
      userLevel={userData?.level ?? 1}
      userXP={userData?.xp ?? 0}
    />
  );
}
