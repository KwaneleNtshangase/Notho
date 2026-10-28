import { describe, expect, it } from "vitest";
import { CONCEPTS } from "@/data/concepts";
import {
  isExamOnlyConcept,
  isReviewExcludedCourse,
  isReviewPoolConceptId,
  reviewConceptIdsForCourse,
} from "@/lib/reviewPool";

describe("reviewPool",
  () => {
    it("treats RE5 prep and mocks as excluded courses",
      () => {
        expect(isReviewExcludedCourse("re5-exam-prep")).toBe(true);
        expect(isReviewExcludedCourse("re5-mock-a")).toBe(true);
        expect(isReviewExcludedCourse("re5-mock-b")).toBe(true);
        expect(isReviewExcludedCourse("money-basics")).toBe(false);
      });

    it("does not schedule any review cards when an RE5 course completes",
      () => {
        expect(reviewConceptIdsForCourse("re5-exam-prep")).toEqual([]);
        expect(reviewConceptIdsForCourse("re5-mock-a")).toEqual([]);
      });

    it("keeps literacy concepts in the pool",
      () => {
        expect(isReviewPoolConceptId("needs-vs-wants")).toBe(true);
        expect(reviewConceptIdsForCourse("money-basics").length).toBeGreaterThan(0);
        expect(reviewConceptIdsForCourse("money-basics")).toContain("needs-vs-wants");
      });

    it("marks every concept that only lists RE5 as exam-only",
      () => {
        const examOnly = CONCEPTS.filter(isExamOnlyConcept);
        expect(examOnly.length).toBeGreaterThan(0);
        for (const concept of examOnly) {
          expect(concept.courses.every((id) => id.startsWith("re5"))).toBe(true);
          expect(isReviewPoolConceptId(concept.id)).toBe(false);
        }
      });

    it("does not drop a literacy concept just because it also appears on another literacy course",
      () => {
        const shared = CONCEPTS.find((c) => c.courses.length > 1 && !c.courses.some((id) => id.startsWith("re5")));
        expect(shared).toBeTruthy();
        if (!shared) return;
        expect(isReviewPoolConceptId(shared.id)).toBe(true);
      });
  });
