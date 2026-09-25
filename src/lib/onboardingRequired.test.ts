import { describe, expect, it } from "vitest";
import { hasValidUsername, isOnboardingComplete } from "./onboardingRequired";

describe("onboarding required identity", () => {
  it("rejects a missing or invalid username", () => {
    expect(hasValidUsername({})).toBe(false);
    expect(hasValidUsername({ username: "ab" })).toBe(false);
    expect(hasValidUsername({ username: "ok_name" })).toBe(true);
  });

  it("is complete with a valid username even if there is no goal", () => {
    expect(isOnboardingComplete({ username: "ok_name" })).toBe(true);
    expect(isOnboardingComplete({ username: "ok_name", goal: "emergency" })).toBe(true);
    expect(isOnboardingComplete({ username: "ab", goal: "emergency" })).toBe(false);
  });
});
