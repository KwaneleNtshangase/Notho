import type { WorkingStep } from "@/lib/lessonMastery";
import { isReviewPoolConceptId } from "@/lib/reviewPool";

/** Unique literacy concept ids touched in a finished lesson. */
export function conceptIdsFromLessonSteps(steps: WorkingStep[]): string[] {
  const ids = new Set<string>();
  for (const step of steps) {
    const id = (step as WorkingStep & { conceptId?: string }).conceptId;
    if (id && isReviewPoolConceptId(id)) ids.add(id);
  }
  return [...ids];
}
