import { normalizeUsername, validateUsername } from "@/app/pageViews.types";

export type OnboardingIdentity = {
  username?: string | null;
  goal?: string | null;
};

export function isOnboardingComplete(identity: OnboardingIdentity): boolean {
  const username = normalizeUsername(identity.username ?? "");
  const goal = (identity.goal ?? "").trim();
  return validateUsername(username) === null && goal.length > 0;
}

export function readLocalOnboarding(): OnboardingIdentity {
  if (typeof window === "undefined") return {};
  return {
    username: window.localStorage.getItem("notho-username"),
    goal: window.localStorage.getItem("notho-user-goal"),
  };
}

export function persistLocalOnboarding(input: {
  username: string;
  goal: string;
  goals?: string[];
  goalDescription?: string;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("notho-onboarded", "true");
  window.localStorage.setItem("notho-username", normalizeUsername(input.username));
  window.localStorage.setItem("notho-user-goal", input.goal);
  if (input.goals && input.goals.length > 0) {
    window.localStorage.setItem("notho-user-goals", input.goals.join(","));
  }
  if (input.goalDescription) {
    window.localStorage.setItem("notho-goal-description", input.goalDescription);
  }
}
