/**
 * Shared types and non-React helpers used across multiple pageViews components.
 * Import from here to avoid circular dependencies.
 */

import { supabase } from "@/lib/supabaseClient";
import { CONTENT_DATA, type Lesson } from "@/data/content";

// ── Core app types ────────────────────────────────────────────────────────────

export type UserData = {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  dailyXP: number;
  dailyGoal: number;
  badges: string[];
  lessonsToday: number;
};

export type Route =
  | { name: "learn" }
  | { name: "quests" }
  | { name: "course"; courseId: string }
  | { name: "lesson"; courseId: string; lessonId: string }
  | { name: "profile" }
  | { name: "leaderboard" }
  | { name: "settings" }
  | { name: "calculator" }
  | { name: "budget" }
  | { name: "onboarding" };

// ── Weekly challenge state ────────────────────────────────────────────────────

export type WeeklyProgressJSON = {
  lessonsCompleted: number;
  xpEarned: number;
  perfectLessons: number;
  dailyXp: number;
  completed: boolean;
  /** Distinct calendar days this week with ≥1 lesson completed */
  streakDaysThisWeek: number;
  /** ISO date (YYYY-MM-DD) of the last day a lesson was recorded */
  lastLessonDay: string;
  /** Distinct days the Budget Planner was opened this week */
  budgetDaysThisWeek: number;
  /** Distinct days the Calculator was used this week */
  calculatorDaysThisWeek: number;
  /** Advanced-course lessons completed this week */
  advancedLessonsThisWeek: number;
};

export const EMPTY_WEEKLY_PROGRESS: WeeklyProgressJSON = {
  lessonsCompleted: 0,
  xpEarned: 0,
  perfectLessons: 0,
  dailyXp: 0,
  completed: false,
  streakDaysThisWeek: 0,
  lastLessonDay: "",
  budgetDaysThisWeek: 0,
  calculatorDaysThisWeek: 0,
  advancedLessonsThisWeek: 0,
};

export function parseWeeklyChallengeStorage(
  raw: string | null
): WeeklyProgressJSON | null {
  if (raw == null || raw === "") return null;
  try {
    const asNum = parseInt(raw, 10);
    if (!Number.isNaN(asNum) && String(asNum).trim() === raw.trim()) {
      return { ...EMPTY_WEEKLY_PROGRESS, lessonsCompleted: asNum };
    }
    const j = JSON.parse(raw) as Partial<WeeklyProgressJSON> & { dailyXp?: number };
    return {
      lessonsCompleted: j.lessonsCompleted ?? 0,
      xpEarned: j.xpEarned ?? 0,
      perfectLessons: j.perfectLessons ?? 0,
      dailyXp: j.dailyXp ?? 0,
      completed: Boolean(j.completed),
      streakDaysThisWeek: (j as any).streakDaysThisWeek ?? 0,
      lastLessonDay: (j as any).lastLessonDay ?? "",
      budgetDaysThisWeek: (j as any).budgetDaysThisWeek ?? 0,
      calculatorDaysThisWeek: (j as any).calculatorDaysThisWeek ?? 0,
      advancedLessonsThisWeek: (j as any).advancedLessonsThisWeek ?? 0,
    };
  } catch {
    return null;
  }
}

export function progressNumberFromWeeklyState(
  wc: { unit: string },
  st: WeeklyProgressJSON,
  _streakDays?: number
): number {
  if (wc.unit === "lessons") return st.lessonsCompleted;
  if (wc.unit === "perfect") return st.perfectLessons;
  if (wc.unit === "daily_xp") return st.dailyXp;
  if (wc.unit === "streak_days") return st.streakDaysThisWeek;
  if (wc.unit === "budget_days") return st.budgetDaysThisWeek ?? 0;
  if (wc.unit === "calculator_days") return st.calculatorDaysThisWeek ?? 0;
  if (wc.unit === "advanced_lesson") return st.advancedLessonsThisWeek ?? 0;
  return 0;
}

// ── Username helpers ──────────────────────────────────────────────────────────

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function validateUsername(value: string): string | null {
  if (!value) return "Username is required.";
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 20) return "Username must be 20 characters or less.";
  if (!/^[a-z0-9_]+$/.test(value))
    return "Use only lowercase letters, numbers, and underscores.";
  return null;
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;
  // SECURITY DEFINER RPC - avoids needing SELECT access to other users' profiles.
  const { data, error } = await supabase.rpc("username_taken", {
    p_username: normalized,
    p_exclude_user: excludeUserId ?? null,
  });
  if (error) return false;
  return data === false;
}

// ── Content helpers ───────────────────────────────────────────────────────────

export function getLessonTitle(
  courseId: string | null | undefined,
  lessonId: string | null | undefined
): string | undefined {
  if (!courseId || !lessonId) return undefined;
  const course = CONTENT_DATA.courses.find((c) => c.id === courseId);
  if (!course) return undefined;
  for (const u of course.units) {
    const le = u.lessons.find((l) => l.id === lessonId);
    if (le) return le.title;
  }
  return undefined;
}

// ── Sharing ───────────────────────────────────────────────────────────────────

export function generateShareText(
  type: "lesson" | "badge" | "streak" | "level",
  data: {
    lessonTitle?: string;
    badgeName?: string;
    streakDays?: number;
    xp?: number;
    level?: number;
    investorProfile?: string;
  }
): string {
  if (type === "lesson") {
    const t = data.lessonTitle ?? "a lesson";
    const xpPart = data.xp ? ` (+${data.xp} XP)` : "";
    // Curiosity hook: "what would YOU score?"
    return `I just completed "${t}"${xpPart} on Notho 🇿🇦\n\nFree South African money lessons, no jargon, 5 min a day. How would you score on this topic?\n👇 notho.co.za`;
  }
  if (type === "badge") {
    const n = data.badgeName ?? "a";
    return `I just unlocked the "${n}" badge on Notho 🏅\n\nBuilding real SA financial knowledge. Quiz: do you know the difference between CGT and income tax?\n👇 notho.co.za`;
  }
  if (type === "streak") {
    const d = data.streakDays ?? 0;
    return `${d} days straight learning about money 🔥\n\nNotho, free SA financial lessons. Most people can't answer 3 basic money questions. Can you?\n👇 notho.co.za`;
  }
  if (type === "level") {
    const l = data.level ?? 1;
    const profile = data.investorProfile ? ` My investor profile: ${data.investorProfile}.` : "";
    return `I just hit Level ${l} on Notho 🚀${profile}\n\nDo you know YOUR investor profile? Takes 2 min, most South Africans get it wrong.\n👇 notho.co.za`;
  }
  return "";
}

// ── Course level requirements ─────────────────────────────────────────────────
// Advanced courses are gated behind XP levels. Level = Math.floor(xp / 500) + 1.
// This gives XP real utility: it unlocks content worth knowing.
export const COURSE_LEVEL_REQUIREMENTS: Record<string, { level: number; label: string }> = {
  "advanced-investing":       { level: 5,  label: "Level 5, Intermediate Investor" },
  "advanced-tax":             { level: 7,  label: "Level 7, Serious Learner" },
  "business-finance-advanced":{ level: 7,  label: "Level 7, Serious Learner" },
  "estate-planning":          { level: 10, label: "Level 10, Advanced" },
};

// ── Goal / course mapping ─────────────────────────────────────────────────────

import {
  CreditCard,
  Shield,
  TrendingUp,
  Home as HomeIcon,
  Flag,
  Briefcase,
  PenLine,
  GraduationCap,
  BarChart2,
} from "@/components/icons/NothoIcons";

export const ONBOARDING_GOAL_OPTIONS = [
  { id: "debt-free", label: "Get debt-free", Icon: CreditCard },
  { id: "emergency", label: "Build emergency fund", Icon: Shield },
  { id: "invest", label: "Start investing", Icon: TrendingUp },
  { id: "home", label: "Save for a home", Icon: HomeIcon },
  { id: "retire", label: "Plan for retirement", Icon: Flag },
  { id: "business", label: "Grow my business", Icon: Briefcase },
  { id: "other", label: "Something else", Icon: PenLine },
] as const;

export const ONBOARDING_AGE_RANGES = [
  { id: "18-25", label: "18–25", Icon: GraduationCap },
  { id: "26-35", label: "26–35", Icon: Briefcase },
  { id: "36-45", label: "36–45", Icon: HomeIcon },
  { id: "46-55", label: "46–55", Icon: BarChart2 },
  { id: "56+", label: "56+", Icon: Flag },
] as const;

/** Alias used across LearnView and elsewhere */
export const GOAL_OPTIONS = ONBOARDING_GOAL_OPTIONS;

export const GOAL_COURSE_MAP: Record<string, string[]> = {
  "debt-free": ["credit-debt", "money-basics", "money-psychology"],
  emergency: ["emergency-fund", "money-basics", "banking-debit"],
  invest: ["investing-basics", "sa-investing", "rand-economy"],
  home: ["property", "credit-debt", "banking-debit"],
  retire: ["retirement", "sa-investing", "investing-basics"],
  business: ["business-finance", "taxes", "money-basics"],
};

/** Maps "courseId:lessonId" → Budget Planner bridge prompt */
export const BUDGET_LESSON_BRIDGE: Record<string, { prompt: string; detail: string }> = {
  "money-basics:lesson-2": {
    prompt: "Apply the 50/30/20 Rule in your budget →",
    detail: "Split your income into Needs (50%), Wants (30%) and Savings (20%) right now.",
  },
  "money-basics:lesson-3": {
    prompt: "Build your budget now →",
    detail: "Open the Budget Planner and give every rand a job before month-end.",
  },
  "money-basics:lesson-4": {
    prompt: "Log today's spending →",
    detail: "Track every rand in the Budget Planner to see exactly where your money goes.",
  },
  "money-basics:lesson-zero-based-budget": {
    prompt: "Try zero-based budgeting in your planner →",
    detail: "Allocate every rand until income minus expenses equals R0.",
  },
  "money-basics:lesson-cash-flow": {
    prompt: "Calculate your monthly cash flow →",
    detail: "Enter your income and expenses in the Budget Planner to find your real surplus.",
  },
};

// ── Audio ─────────────────────────────────────────────────────────────────────

export function playSound(type: "correct" | "incorrect" | "complete"): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("notho-sound-enabled") === "false") return;
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "correct") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === "incorrect") {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === "complete") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  } catch {
    // ignore audio errors
  }
}

// ── Supabase goal persistence ─────────────────────────────────────────────────

export async function persistUserGoalToStorageAndSupabase(
  goalId: string,
  goalDescription?: string
): Promise<void> {
  if (typeof window === "undefined") return;
  localStorage.setItem("notho-user-goal", goalId);
  if (goalDescription !== undefined) {
    localStorage.setItem("notho-goal-description", goalDescription);
  }
  localStorage.removeItem("notho-goal-banner-dismissed");
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const update: Record<string, unknown> = { user_id: user.id, goal: goalId };
    if (goalDescription !== undefined) update.goal_description = goalDescription;
    await supabase.from("profiles").upsert(update, { onConflict: "user_id" });
  }
}

// Course accent colours, cycles through SA-themed palette
export const COURSE_COLOURS = [
  { bg: "#E8F5EE", accent: "#007A85", light: "#CBE9EB" }, // green
  { bg: "#FFF8E7", accent: "#EFB343", light: "#FFE9A0" }, // gold
  { bg: "#FFF0EF", accent: "#E03C31", light: "#FCCFCC" }, // red
  { bg: "#EEF4FF", accent: "#3B7DD8", light: "#C5D9F7" }, // blue
  { bg: "#F3EEFF", accent: "#7C4DFF", light: "#D9C8FF" }, // purple
  { bg: "#E8FAF0", accent: "#00BFA5", light: "#B2EDEF" }, // teal
  { bg: "#FFF3E0", accent: "#F57C00", light: "#FFD9A8" }, // orange
  { bg: "#FCE4EC", accent: "#C2185B", light: "#F5B8CE" }, // pink
];

export type SavedLessonProgress = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  completedAt: number; // timestamp
};

export const getNextLesson = (courseId: string, lessonId: string): Lesson | null => {
  const course = CONTENT_DATA.courses.find((c) => c.id === courseId);
  if (!course) return null;
  const allLessons: Lesson[] = course.units.flatMap((u) =>
    u.lessons.filter((l) => !l.comingSoon)
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) return null;
  for (let i = currentIndex + 1; i < allLessons.length; i++) {
    const candidate = allLessons[i];
    if (
      (candidate.steps && candidate.steps.length > 0) ||
      (candidate.secureQuestionCount ?? 0) > 0
    ) return candidate;
  }
  return null;
};
