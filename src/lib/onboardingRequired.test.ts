import { describe, expect, it } from "vitest";
import { hasValidUsername, isOnboardingComplete } from "./onboardingRequired";

describe("onboarding required identity", () => {
  it("rejects a missing or invalid username", () => {
    expect(hasValidUsername({})).toBe(false);
    expect(hasValidUsername({ username: "ab" })).toBe(false);
    expect(hasValidUsername({ username: "ok_name" })).toBe(true);
  });

  it("requires a goal for first-time users", () => {
    expect(isOnboardingComplete({ username: "ok_name" })).toBe(false);
    expect(isOnboardingComplete({ username: "ok_name", goal: "emergency" })).toBe(true);
  });

  it("lets returning users skip the goal", () => {
    expect(
      isOnboardingComplete({ username: "ok_name" }, { requireGoal: false }),
    ).toBe(true);
    expect(
      isOnboardingComplete({ username: "ab" }, { requireGoal: false }),
    ).toBe(false);
  });
});
