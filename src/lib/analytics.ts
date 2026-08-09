import posthog from "posthog-js";
import { recordFeatureEvent } from "@/lib/usageTracking";

/**
 * Every analytics event goes to two places:
 *
 *   1. PostHog  - unchanged, for funnels, session replay and ad-hoc exploration.
 *   2. Supabase - mirrored into feature_events so the admin dashboard can join
 *                 feature usage against a specific user and their progress.
 *                 PostHog can't do that per-user join cheaply, and its data
 *                 lives outside our own database.
 *
 * The mirror is wired here rather than at each of the ~50 call sites, so any
 * event added to this file is captured by both sinks automatically. Each sink
 * is isolated in its own try/catch - one failing must not stop the other, and
 * neither must ever surface to a learner mid-lesson.
 */
const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, props);
  } catch {
    /* ignore */
  }
  try {
    recordFeatureEvent(event, props);
  } catch {
    /* ignore */
  }
};

export const analytics = {
  lessonStarted: (courseId: string, lessonId: string, lessonTitle: string) =>
    track("lesson_started", { courseId, lessonId, lessonTitle }),

  lessonCompleted: (
    courseId: string,
    lessonId: string,
    lessonTitle: string,
    props: {
      xpEarned: number;
      isPerfect: boolean;
      timeSeconds: number;
      heartLost: boolean;
    }
  ) => track("lesson_completed", { courseId, lessonId, lessonTitle, ...props }),

  lessonAbandoned: (
    courseId: string,
    lessonId: string,
    stepIndex: number,
    totalSteps: number
  ) =>
    track("lesson_abandoned", {
      courseId,
      lessonId,
      stepIndex,
      totalSteps,
      completionPercent: Math.round((stepIndex / totalSteps) * 100),
    }),

  wrongAnswer: (
    courseId: string,
    lessonId: string,
    stepIndex: number,
    stepType: string
  ) => track("wrong_answer", { courseId, lessonId, stepIndex, stepType }),

  courseOpened: (courseId: string, courseTitle: string) =>
    track("course_opened", { courseId, courseTitle }),

  courseCompleted: (courseId: string, courseTitle: string, badgeName: string) =>
    track("course_completed", { courseId, courseTitle, badgeName }),

  badgeEarned: (badgeId: string, badgeName: string) =>
    track("badge_earned", { badgeId, badgeName }),

  streakUpdated: (streakDays: number) =>
    track("streak_updated", { streakDays }),

  challengeCompleted: (challengeDescription: string, bonusXP: number) =>
    track("weekly_challenge_completed", { challengeDescription, bonusXP }),

  investorQuizCompleted: (profile: string, score: number) =>
    track("investor_quiz_completed", { profile, score }),

  advisorCtaShown: (trigger: string) =>
    track("advisor_cta_shown", { trigger }),

  advisorCtaClicked: (trigger: string) =>
    track("advisor_cta_clicked", { trigger }),

  shareTriggered: (
    type: "lesson" | "badge" | "streak",
    method: "native" | "whatsapp"
  ) => track("share_triggered", { type, method }),

  pageViewed: (page: string) => track("page_viewed", { page }),

  // ── Lesson abandonment: per-step tracking ────────────────────────────────
  lessonStepViewed: (
    courseId: string,
    lessonId: string,
    stepIndex: number,
    stepType: string,
    totalSteps: number
  ) =>
    track("lesson_step_viewed", {
      courseId,
      lessonId,
      stepIndex,
      stepType,
      totalSteps,
      progressPct: Math.round(((stepIndex + 1) / totalSteps) * 100),
    }),

  // ── Calculator: solve-mode usage ─────────────────────────────────────────
  calculatorSolveModeUsed: (
    solveMode: string,
    inputs: { monthly: number; rate: number; years: number; principal: number }
  ) => track("calculator_solve_mode_used", { solveMode, ...inputs }),

  calculatorResultShared: (solveMode: string) =>
    track("calculator_result_shared", { solveMode }),

  // ── Budget: category distribution (anonymized) ────────────────────────────
  budgetEntryAdded: (category: string, entryType: "income" | "expense") =>
    track("budget_entry_added", { category, entryType }),

  // ── Time-to-first-lesson (hours from signup) ──────────────────────────────
  firstLessonCompleted: (hoursSinceSignup: number, courseId: string) =>
    track("first_lesson_completed", { hoursSinceSignup, courseId }),

  // ── Day 1 / 7 / 30 retention ping ─────────────────────────────────────────
  retentionPing: (daysSinceSignup: number, cohort: "day1" | "day7" | "day30") =>
    track("retention_ping", { daysSinceSignup, cohort }),

  // ── Daily challenge claimed ────────────────────────────────────────────────
  dailyChallengeClaimed: (challengeId: string, xp: number) =>
    track("daily_challenge_claimed", { challengeId, xp }),

  // ── Share card generated ──────────────────────────────────────────────────
  shareCardGenerated: (cardType: "lesson" | "calculator") =>
    track("share_card_generated", { cardType }),

  // ── Behavioral outcome events (real financial actions) ────────────────────
  /** User opened the budget planner immediately after completing a budget-related lesson */
  budgetOpenedPostLesson: (courseId: string, lessonId: string) =>
    track("budget_opened_post_lesson", { courseId, lessonId }),

  /** User set or updated a savings category target in the budget planner */
  savingsGoalSet: (savingsAmount: number) =>
    track("savings_goal_set", { savingsAmount }),

  /** User logged an expense entry in the budget planner */
  expenseLogged: (category: string, amount: number) =>
    track("expense_logged", { category, amount }),

  // ── Onboarding funnel ─────────────────────────────────────────────────────
  /** User landed on the app for the first time (no account yet) */
  onboardingStarted: () =>
    track("onboarding_started"),

  /** User completed the goal selection step */
  onboardingGoalSelected: (goal: string) =>
    track("onboarding_goal_selected", { goal }),

  /** User completed the age range / profile step */
  onboardingProfileCompleted: (ageRange: string) =>
    track("onboarding_profile_completed", { ageRange }),

  /** User submitted the signup form successfully */
  signupCompleted: (method: "email" | "google") =>
    track("signup_completed", { method }),

  // ── Paywall + subscription funnel ─────────────────────────────────────────
  /** User encountered a locked lesson (freemium gate) */
  paywallShown: (lessonId: string, courseId: string, trigger: "lesson_lock" | "feature_lock") =>
    track("paywall_shown", { lessonId, courseId, trigger }),

  /** User clicked the upgrade CTA on the paywall screen */
  paywallCtaClicked: (plan: string) =>
    track("paywall_cta_clicked", { plan }),

  /** User entered the checkout / payment flow */
  checkoutStarted: (plan: string, priceZar: number) =>
    track("checkout_started", { plan, priceZar }),

  /** User completed a subscription purchase */
  subscriptionConverted: (plan: string, priceZar: number, method: "stripe" | "payfast") =>
    track("subscription_converted", { plan, priceZar, method }),

  /** User cancelled their subscription */
  subscriptionCancelled: (plan: string, daysActive: number, reason?: string) =>
    track("subscription_cancelled", { plan, daysActive, reason }),

  // ── Streak freeze ─────────────────────────────────────────────────────────
  /** User tapped "Use Freeze" to protect their streak */
  streakFreezeUsed: (freezesRemaining: number, streakDays: number) =>
    track("streak_freeze_used", { freezesRemaining, streakDays }),

  /** User ran out of streak freeze tokens */
  streakFreezeExhausted: (streakDays: number) =>
    track("streak_freeze_exhausted", { streakDays }),

  /** User lost their streak (no freeze available, missed day) */
  streakBroken: (previousStreak: number) =>
    track("streak_broken", { previousStreak }),

  // ── PWA install ───────────────────────────────────────────────────────────
  /** Browser install prompt was shown to the user */
  pwaInstallPromptShown: (trigger: string) =>
    track("pwa_install_prompt_shown", { trigger }),

  /** User accepted the PWA install prompt */
  pwaInstalled: () =>
    track("pwa_installed"),

  /** User dismissed the PWA install prompt */
  pwaInstallDismissed: () =>
    track("pwa_install_dismissed"),

  // ── Content quality surveys ───────────────────────────────────────────────
  /** 30-day in-app survey: how much has the app changed real financial decisions? */
  contentImpactSurvey: (rating: 1 | 2 | 3 | 4 | 5, daysSinceSignup: number) =>
    track("content_impact_survey", { rating, daysSinceSignup }),

  /** User rated a specific lesson (thumbs up / down maps to 5 / 1) */
  lessonRated: (lessonId: string, courseId: string, rating: 1 | 2 | 3 | 4 | 5) =>
    track("lesson_rated", { lessonId, courseId, rating }),
};
