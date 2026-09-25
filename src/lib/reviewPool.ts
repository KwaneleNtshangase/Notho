import { CONCEPTS, type Concept } from "@/data/concepts";

/**
 * Courses whose items belong to exam prep, not the everyday Learn review
 * queue. Exclusion is authored here so we never ask the learner whether they
 * have finished RE5.
 */
export const REVIEW_EXCLUDED_COURSE_IDS = new Set([
  "re5-exam-prep",
  "re5-mock-a",
  "re5-mock-b",
]);

/** True when every course that unlocks this concept is exam-only. */
export function isExamOnlyConcept(concept: Concept): boolean {
  if (concept.courses.length === 0) return false;
  return concept.courses.every((id) => REVIEW_EXCLUDED_COURSE_IDS.has(id));
}

export function isReviewPoolConcept(concept: Concept): boolean {
  return !isExamOnlyConcept(concept);
}

export function isReviewPoolConceptId(conceptId: string): boolean {
  const concept = CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) return false;
  return isReviewPoolConcept(concept);
}

export function isReviewExcludedCourse(courseId: string): boolean {
  return REVIEW_EXCLUDED_COURSE_IDS.has(courseId);
}

/** Concept IDs that completing this course may add to the Learn review queue. */
export function reviewConceptIdsForCourse(courseId: string): string[] {
  if (isReviewExcludedCourse(courseId)) return [];
  return CONCEPTS.filter(
    (c) => c.courses.includes(courseId) && isReviewPoolConcept(c)
  ).map((c) => c.id);
}
