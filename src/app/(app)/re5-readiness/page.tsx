"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Re5ReadinessView } from "@/components/views/Re5ReadinessView";
import { useLessonResults } from "@/hooks/useLessonResults";
import { useNotho } from "@/context/NothoContext";
import { RE5_COURSE_ID } from "@/lib/results/re5";

/**
 * Standalone route rather than a member of the Route union in pageViews.types:
 * this is an RE5-only screen reached from the RE5 course map and from an exam
 * result, and it does not need a slot in the app's global navigation state.
 */
export default function Re5ReadinessPage() {
  const router = useRouter();
  const { startLesson } = useNotho();
  const { results, loading } = useLessonResults(RE5_COURSE_ID);

  return (
    <Re5ReadinessView
      results={results}
      loading={loading}
      onBack={() => router.push(`/course/${RE5_COURSE_ID}`)}
      onGoToLesson={(lessonId) => {
        // Same entry point every other lesson launch uses — it resolves the
        // question bank and tags qids for the mastery loop before navigating.
        startLesson(RE5_COURSE_ID, lessonId);
      }}
    />
  );
}
