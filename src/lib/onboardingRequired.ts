import { normalizeUsername, validateUsername } from "@/app/pageViews.types";

export type OnboardingIdentity = {
  username?: string | null;
  goal?: string | null;
};

export function hasValidUsername(identity: OnboardingIdentity): boolean {
  const username = normalizeUsername(identity.username ?? "");
  return validateUsername(username) === null;
}

/** Username is the only gate. Goals are optional and live on the Goals tab. */
export function isOnboardingComplete(identity: OnboardingIdentity): boolean {
  return hasValidUsername(identity);
}

export function readLocalOnboarding(): OnboardingIdentity & { onboarded: boolean } {
  if (typeof window === "undefined") return { onboarded: false };
  return {
    username: window.localStorage.getItem("notho-username"),
    goal: window.localStorage.getItem("notho-user-goal"),
    onboarded: window.localStorage.getItem("notho-onboarded") === "true",
  };
}

export function persistLocalOnboarding(input: {
  username: string;
  goal?: string;
  goals?: string[];
  goalDescription?: string;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("notho-onboarded", "true");
  window.localStorage.setItem("notho-username", normalizeUsername(input.username));
  if (input.goal) {
    window.localStorage.setItem("notho-user-goal", input.goal);
  }
  if (input.goals && input.goals.length > 0) {
    window.localStorage.setItem("notho-user-goals", input.goals.join(","));
  }
  if (input.goalDescription) {
    window.localStorage.setItem("notho-goal-description", input.goalDescription);
  }
}
