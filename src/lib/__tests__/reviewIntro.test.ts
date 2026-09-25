import { describe, expect, it } from "vitest";
import { conceptIdsFromLessonSteps } from "@/lib/reviewIntro";
import type { WorkingStep } from "@/lib/lessonMastery";

function mcq(conceptId?: string): WorkingStep {
  return {
    type: "mcq",
    question: "q",
    options: ["a", "b", "c", "d"],
    correct: 0,
    feedback: { correct: "y", incorrect: "n" },
    conceptId,
  } as WorkingStep;
}

describe("conceptIdsFromLessonSteps", () => {
  it("keeps unique literacy concept ids and drops RE5 / missing",
    () => {
      const steps = [
        mcq("needs-vs-wants"),
        mcq("needs-vs-wants"),
        mcq("fais-fit-and-proper"),
        mcq(),
      ];
      const ids = conceptIdsFromLessonSteps(steps);
      expect(ids).toContain("needs-vs-wants");
      expect(ids.filter((id) => id === "needs-vs-wants")).toHaveLength(1);
      expect(ids.some((id) => id.startsWith("fais") || id.includes("re5"))).toBe(false);
    });
});
