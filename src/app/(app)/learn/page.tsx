"use client";

import React, { useState, useEffect } from "react";
import { LearnView } from "@/components/views/LearnView";
import { CONTENT_DATA, Lesson } from "@/data/content";
import { useNotho } from "@/context/NothoContext";
import { analytics } from "@/lib/analytics";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import { assignQids, type WorkingStep } from "@/lib/lessonMastery";
import type { SavedLessonProgress } from "@/app/pageViews.types";
import { markCourseFocus } from "@/lib/scrollMemory";
import { warmCourse, warmLesson, whenIdle } from "@/lib/speculativeWarm";

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

  useEffect(() => {
    return whenIdle(() => {
      if (lessonResume?.courseId && lessonResume?.lessonId) {
        warmLesson(lessonResume.courseId, lessonResume.lessonId);
      }
      for (const course of CONTENT_DATA.courses.slice(0, 4)) {
        warmCourse(course.id);
      }
    }, 1600);
  }, [lessonResume]);

  return (
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
  );
}
