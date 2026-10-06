import { describe, expect, it } from "vitest";
import { CONCEPTS } from "@/data/concepts";
import { reviewPromptsFor } from "@/lib/reviewCards";

describe("reviewPromptsFor", () => {
  it("has more than one stem for concepts that already have lesson variants", () => {
    const needs = CONCEPTS.find((c) => c.id === "needs-vs-wants");
    const tracking = CONCEPTS.find((c) => c.id === "tracking-spending");
    expect(needs).toBeTruthy();
    expect(tracking).toBeTruthy();
    expect(reviewPromptsFor(needs!).length).toBeGreaterThan(1);
    expect(reviewPromptsFor(tracking!).length).toBeGreaterThan(1);
  });

  it("does not repeat the same question text inside one concept pool", () => {
    const concept = CONCEPTS.find((c) => c.id === "money-functions");
    expect(concept).toBeTruthy();
    const prompts = reviewPromptsFor(concept!);
    const keys = prompts.map((p) => p.question.trim().toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });
});
