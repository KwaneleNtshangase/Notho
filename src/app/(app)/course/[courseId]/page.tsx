"use client";

import React, { use } from "react";
import { CourseView } from "@/components/views/CourseView";
import { CourseLanding } from "@/components/CourseLanding";
import { useNotho } from "@/context/NothoContext";
import { CONTENT_DATA } from "@/data/content";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { setRoute, isLessonCompleted, startLesson, progressReady } = useNotho();
  const course = CONTENT_DATA.courses.find(c => c.id === courseId);

  if (!course) {
    return <div className="p-4">Course not found.</div>;
  }

  return (
    <>
      <CourseView
        course={course}
        isLessonCompleted={isLessonCompleted}
        goBack={() => setRoute({ name: "learn" })}
        goToLesson={(lessonId) => {
          startLesson(courseId, lessonId);
        }}
      />
      <CourseLanding
        course={course}
        isLessonCompleted={isLessonCompleted}
        progressReady={progressReady}
      />
    </>
  );
}
