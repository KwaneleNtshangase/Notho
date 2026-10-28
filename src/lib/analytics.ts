import posthog from "posthog-js";
import { recordFeatureEvent, sanitiseProps } from "@/lib/usageTracking";
import { isPosthogLoaded, posthogKey } from "@/lib/posthogClient";

const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  const safe = sanitiseProps(props);
  try {
    if (posthogKey() && isPosthogLoaded(posthog)) posthog.capture(event, safe);
  } catch {
    /* ignore */
  }
  try {
    recordFeatureEvent(event, safe);
  } catch {
    /* ignore */
  }
};

export const analytics = {
  lessonStarted: (courseId: string, lessonId: string, lessonTitle: string) => track("lesson_started", { courseId, lessonId, lessonTitle }),
  lessonCompleted: (courseId: string, lessonId: string, lessonTitle: string, props: { xpEarned: number; isPerfect: boolean; timeSeconds: number; heartLost: boolean }) => track("lesson_completed", { courseId, lessonId, lessonTitle, ...props }),
  lessonAbandoned: (courseId: string, lessonId: string, stepIndex: number, totalSteps: number) => track("lesson_abandoned", { courseId, lessonId, stepIndex, totalSteps, completionPercent: Math.round((stepIndex / totalSteps) * 100) }),
  wrongAnswer: (courseId: string, lessonId: string, stepIndex: number, stepType: string) => track("wrong_answer", { courseId, lessonId, stepIndex, stepType }),
  courseOpened: (courseId: string, courseTitle: string) => track("course_opened", { courseId, courseTitle }),
  courseCompleted: (courseId: string, courseTitle: string, badgeName: string) => track("course_completed", { courseId, courseTitle, badgeName }),
  badgeEarned: (badgeId: string, badgeName: string) => track("badge_earned", { badgeId, badgeName }),
  streakUpdated: (streakDays: number) => track("streak_updated", { streakDays }),
  challengeCompleted: (challengeDescription: string, bonusXP: number) => track("weekly_challenge_completed", { challengeDescription, bonusXP }),
  investorQuizCompleted: (profile: string, score: number) => track("investor_quiz_completed", { profile, score }),
  advisorCtaShown: (trigger: string) => track("advisor_cta_shown", { trigger }),
  advisorCtaClicked: (trigger: string) => track("advisor_cta_clicked", { trigger }),
  shareTriggered: (type: "lesson" | "badge" | "streak", method: "native" | "whatsapp") => track("share_triggered", { type, method }),
  pageViewed: (page: string) => track("page_viewed", { page }),
  lessonStepViewed: (courseId: string, lessonId: string, stepIndex: number, stepType: string, totalSteps: number) => track("lesson_step_viewed", { courseId, lessonId, stepIndex, stepType, totalSteps, progressPct: Math.round(((stepIndex + 1) / totalSteps) * 100) }),
  calculatorSolveModeUsed: (solveMode: string, inputs: { monthly: number; rate: number; years: number; principal: number }) => track("calculator_solve_mode_used", { solveMode, ...inputs }),
  calculatorResultShared: (solveMode: string) => track("calculator_result_shared", { solveMode }),
  budgetEntryAdded: (category: string, entryType: "income" | "expense") => track("budget_entry_added", { category, entryType }),
  firstLessonCompleted: (hoursSinceSignup: number, courseId: string) => track("first_lesson_completed", { hoursSinceSignup, courseId }),
  retentionPing: (daysSinceSignup: number, cohort: "day1" | "day7" | "day30") => track("retention_ping", { daysSinceSignup, cohort }),
  dailyChallengeClaimed: (challengeId: string, xp: number) => track("daily_challenge_claimed", { challengeId, xp }),
  shareCardGenerated: (cardType: "lesson" | "calculator") => track("share_card_generated", { cardType }),
  budgetOpenedPostLesson: (courseId: string, lessonId: string) => track("budget_opened_post_lesson", { courseId, lessonId }),
  savingsGoalSet: (savingsAmount: number) => track("savings_goal_set", { savingsAmount }),
  expenseLogged: (category: string, amount: number) => track("expense_logged", { category, amount }),
  onboardingStarted: () => track("onboarding_started"),
  onboardingGoalSelected: (goal: string) => track("onboarding_goal_selected", { goal }),
  onboardingProfileCompleted: (ageRange: string) => track("onboarding_profile_completed", { ageRange }),
  signupCompleted: (method: "email" | "google") => track("signup_completed", { method }),
  paywallShown: (lessonId: string, courseId: string, trigger: "lesson_lock" | "feature_lock") => track("paywall_shown", { lessonId, courseId, trigger }),
  paywallCtaClicked: (plan: string) => track("paywall_cta_clicked", { plan }),
  checkoutStarted: (plan: string, priceZar: number) => track("checkout_started", { plan, priceZar }),
  subscriptionConverted: (plan: string, priceZar: number, method: "stripe" | "payfast") => track("subscription_converted", { plan, priceZar, method }),
  subscriptionCancelled: (plan: string, daysActive: number, reason?: string) => track("subscription_cancelled", { plan, daysActive, reason }),
  streakFreezeUsed: (freezesRemaining: number, streakDays: number) => track("streak_freeze_used", { freezesRemaining, streakDays }),
  streakFreezeExhausted: (streakDays: number) => track("streak_freeze_exhausted", { streakDays }),
  streakBroken: (previousStreak: number) => track("streak_broken", { previousStreak }),
  pwaInstallPromptShown: (trigger: string) => track("pwa_install_prompt_shown", { trigger }),
  pwaInstalled: () => track("pwa_installed"),
  pwaInstallDismissed: () => track("pwa_install_dismissed"),
  contentImpactSurvey: (rating: 1 | 2 | 3 | 4 | 5, daysSinceSignup: number) => track("content_impact_survey", { rating, daysSinceSignup }),
  lessonRated: (lessonId: string, courseId: string, rating: 1 | 2 | 3 | 4 | 5) => track("lesson_rated", { lessonId, courseId, rating }),
  pushPromptShown: () => track("push_prompt_shown"),
  pushOptIn: () => track("push_opt_in"),
  pushOptOut: () => track("push_opt_out"),
};
