import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));

import { getNextLesson } from "@/app/pageViews.types";
import { LESSON_BANKS } from "@/data/banks";
import { CONTENT_DATA } from "@/data/content";

describe("RE5 secure mock client-content boundary", () => {
  it("exposes only public metadata for both mock lessons", () => {
    const course = CONTENT_DATA.courses.find(
      (candidate) => candidate.id === "re5-exam-prep"
    );
    expect(course).toBeDefined();

    const mocks = course!.units
      .flatMap((unit) => unit.lessons)
      .filter(
        (lesson) => lesson.id === "re5-mock-a" || lesson.id === "re5-mock-b"
      );

    expect(mocks).toHaveLength(2);
    for (const lesson of mocks) {
      expect(lesson.secureQuestionCount).toBe(50);
      expect(lesson.steps).toBeUndefined();
      expect(lesson.layout).toBeUndefined();
      expect(lesson.slots).toBeUndefined();
      expect(LESSON_BANKS[`${course!.id}::${lesson.id}`]).toBeUndefined();
    }
  });

  it("keeps secure mock authoring identifiers out of client registries", () => {
    const clientContent = JSON.stringify({ CONTENT_DATA, LESSON_BANKS });
    expect(clientContent).not.toContain("r5a-q1-v1");
    expect(clientContent).not.toContain("r5b-q1-v1");
    expect(clientContent).not.toContain("re5-exam-prep/mock-a/q1");
    expect(clientContent).not.toContain("re5-exam-prep/mock-b/q1");
  });

  it("keeps metadata-only mocks in sequential lesson navigation", () => {
    expect(getNextLesson("re5-exam-prep", "re5-quiz-ombud-fica")?.id).toBe(
      "re5-mock-a"
    );
    expect(getNextLesson("re5-exam-prep", "re5-mock-a")?.id).toBe(
      "re5-mock-b"
    );
  });
});
