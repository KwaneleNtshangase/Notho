"use client";

import React, { useState } from "react";
import { LearnView } from "@/components/views/LearnView";
import { ThisWeekCard } from "@/components/ThisWeekCard";
import { CONTENT_DATA, Lesson } from "@/data/content";
import { useNotho } from "@/context/NothoContext";
import { analytics } from "@/lib/analytics";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import { assignQids, type WorkingStep } from "@/lib/lessonMastery";
import type { SavedLessonProgress } from "@/app/pageViews.types";
import { markCourseFocus } from "@/lib/scrollMemory";

export default function LearnPage() {
  const {
    userId,
    weeklyXp,
    isLessonCompleted,
    setRoute,
    progressReady,
    userData,
    hearts,
    setShowNoHearts,
    setCurrentLessonState,
    lessonResume,
  } = useNotho();

  const [dismissed, setDismissed] = useState(false);
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
        answers: progress.answers ?? {},
        correctCount: progress.correctCount ?? 0,
        mistakes: progress.mistakes ?? 0,
        masteredQids: progress.masteredQids ?? [],
        mistakenQids: progress.mistakenQids ?? [],
      });
      setRoute({ name: "lesson", courseId: progress.courseId, lessonId: progress.lessonId });
      setDismissed(true);
    },
    [hearts, userId, setCurrentLessonState, setRoute, setShowNoHearts]
  );

  return (
    <>
      <ThisWeekCard weeklyXp={weeklyXp ?? 0} userId={userId ?? null} />
      <LearnView
        courses={CONTENT_DATA.courses}
        isLessonCompleted={isLessonCompleted}
        goToCourse={(courseId) => {
          const c = CONTENT_DATA.courses.find((x) => x.id === courseId);
          if (c) analytics.courseOpened(courseId, c.title);
          markCourseFocus(courseId);
          setRoute({ name: "course", courseId });
        }}
        contentLoaded={progressReady}
        savedProgress={savedProgress}
        onResumeLesson={resumeLesson}
        userLevel={userData?.level ?? 1}
        userXP={userData?.xp ?? 0}
      />
    </>
  );
}
