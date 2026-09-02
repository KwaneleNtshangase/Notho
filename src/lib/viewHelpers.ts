/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { CONTENT_DATA } from "@/data/content";
import {
  Share2,
  CreditCard,
  Shield,
  TrendingUp,
  Home as HomeIcon,
  Flag,
  Briefcase,
  PenLine,
  GraduationCap,
  BarChart2,
  TrendingDown,
} from "@/components/icons/NothoIcons";
import {
  NothoLearn,
  NothoBudget,
  NothoProgress,
  NothoShield,
  NothoCredit,
  NothoBuilding,
  NothoBriefcase,
  NothoUmbrella,
  NothoFlag,
  NothoHome,
  NothoDoc,
  NothoAlert,
  NothoBrain,
} from "@/components/icons/NothoIcons";

export type WeeklyProgressJSON = {
  lessonsCompleted: number;
  xpEarned: number;
  perfectLessons: number;
  dailyXp: number;
  completed: boolean;
};

export const EMPTY_WEEKLY_PROGRESS: WeeklyProgressJSON = {
  lessonsCompleted: 0,
  xpEarned: 0,
  perfectLessons: 0,
  dailyXp: 0,
  completed: false,
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
    const j = JSON.parse(raw) as Partial<WeeklyProgressJSON> & {
      dailyXp?: number;
    };
    return {
      lessonsCompleted: j.lessonsCompleted ?? 0,
      xpEarned: j.xpEarned ?? 0,
      perfectLessons: j.perfectLessons ?? 0,
      dailyXp: j.dailyXp ?? 0,
      completed: Boolean(j.completed),
    };
  } catch {
    return null;
  }
}

export function progressNumberFromWeeklyState(
  wc: { unit: string },
  st: WeeklyProgressJSON,
  streakDays: number
): number {
  if (wc.unit === "lessons") return st.lessonsCompleted;
  if (wc.unit === "perfect") return st.perfectLessons;
  if (wc.unit === "daily_xp") return st.dailyXp;
  if (wc.unit === "streak_days") return streakDays;
  return 0;
}

export function playSound(type: "correct" | "incorrect" | "complete") {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("notho-sound-enabled") === "false") return;
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
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
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "incorrect") {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "complete") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch {
    // ignore audio errors
  }
}

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

export const GOAL_OPTIONS = ONBOARDING_GOAL_OPTIONS;

export const GOAL_COURSE_MAP: Record<string, string[]> = {
  "debt-free": ["credit-debt", "money-basics", "money-psychology"],
  emergency: ["emergency-fund", "money-basics", "banking-debit"],
  invest: ["investing-basics", "sa-investing", "rand-economy"],
  home: ["property", "credit-debt", "banking-debit"],
  retire: ["retirement", "sa-investing", "investing-basics"],
  business: ["business-finance", "taxes", "money-basics"],
};

export function generateShareText(
  type: "lesson" | "badge" | "streak",
  data: {
    lessonTitle?: string;
    badgeName?: string;
    streakDays?: number;
    xp?: number;
  }
): string {
  if (type === "lesson") {
    const t = data.lessonTitle ?? "a lesson";
    const xpPart = data.xp ? ` (+${data.xp} XP)` : "";
    return `I just completed "${t}"${xpPart} on Notho 🎓\n\nShort, South Africa–focused money lessons that actually make sense. Join me 👇\nnotho.co.za`;
  }
  if (type === "badge") {
    const n = data.badgeName ?? "a";
    return `I just earned the "${n}" badge on Notho 🏅\n\nBuilding real financial knowledge, one lesson at a time.\nnotho.co.za`;
  }
  if (type === "streak") {
    const d = data.streakDays ?? 0;
    return `${d}-day learning streak on Notho 🔥\n\nShowing up for my money goals every single day.\nnotho.co.za`;
  }
  return "";
}

export function ShareButton({
  text,
  label = "Share",
  shareType,
}: {
  text: string;
  label?: string;
  shareType?: "lesson" | "badge" | "streak";
}) {
  const handleShare = async () => {
    const method =
      typeof navigator !== "undefined" && typeof navigator.share === "function"
        ? "native"
        : "whatsapp";
    if (shareType) analytics.shareTriggered(shareType, method);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* dismissed or unavailable */
      }
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    React.createElement("button", {
      type: "button",
      onClick: handleShare,
      className: "flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40",
    },
      React.createElement(Share2, { size: 16, className: "shrink-0", "aria-hidden": true }),
      React.createElement("span", null, label)
    )
  );
}

export async function persistUserGoalToStorageAndSupabase(goalId: string, goalDescription?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("notho-user-goal", goalId);
  if (goalDescription !== undefined) {
    localStorage.setItem("notho-goal-description", goalDescription);
  }
  localStorage.removeItem("notho-goal-banner-dismissed");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const update: Record<string, unknown> = { user_id: user.id, goal: goalId };
    if (goalDescription !== undefined) update.goal_description = goalDescription;
    await supabase.from("profiles").upsert(update, { onConflict: "user_id" });
  }
}

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

export type UserData = {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  dailyXP: number;
  dailyGoal: number;
  badges: string[];
};

export type Route =
  | { name: "learn" }
  | { name: "course"; courseId: string }
  | { name: "lesson"; courseId: string; lessonId: string }
  | { name: "profile" }
  | { name: "leaderboard" }
  | { name: "settings" }
  | { name: "calculator" }
  | { name: "budget" }
  | { name: "onboarding" };

export type { CalcInputs } from "@/lib/calculators";
export { calcGrowth } from "@/lib/calculators";

export function formatWithSpaces(value: number) {
  if (!isFinite(value) || isNaN(value)) return "0";
  return Math.round(Math.abs(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

export function formatRand(v: number): string {
  if (!isFinite(v) || isNaN(v)) return "R0";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  return `${sign}R${formatted}`;
}

export function formatZAR(value: number) {
  return formatRand(value);
}

export type CosmoExpression = "default" | "thinking" | "sad" | "celebrating";

export function CosmoCharacter({
  expression = "default",
  size = 100,
  style: extraStyle = {},
}: {
  expression?: CosmoExpression;
  size?: number;
  style?: React.CSSProperties;
}) {
  return React.createElement("img", {
    src: `/characters/cosmo-${expression}.png`,
    alt: `Cosmo ${expression}`,
    width: size,
    height: size,
    style: { objectFit: "contain", display: "block", ...extraStyle },
  });
}

export function CourseIcon({ name, size = 48 }: { name: string; size?: number }) {
  const props = { size, className: "text-current" };
  switch (name) {
    case "wallet":
      return React.createElement(NothoBudget, props);
    case "briefcase":
      return React.createElement(NothoBriefcase, props);
    case "building-2":
      return React.createElement(NothoBuilding, props);
    case "credit-card":
      return React.createElement(NothoCredit, props);
    case "shield":
      return React.createElement(NothoShield, props);
    case "umbrella":
      return React.createElement(NothoUmbrella, props);
    case "trending-up":
      return React.createElement(NothoProgress, props);
    case "flag":
      return React.createElement(NothoFlag, props);
    case "home":
      return React.createElement(NothoHome, props);
    case "file-text":
      return React.createElement(NothoDoc, props);
    case "siren":
      return React.createElement(NothoAlert, props);
    case "brain":
      return React.createElement(NothoBrain, props);
    case "book-open":
      return React.createElement(NothoLearn, props);
    default:
      return React.createElement(NothoBudget, props);
  }
}

export const COURSE_COLOURS = [
  { bg: "#E8F5EE", accent: "#007A85", light: "#CBE9EB" },
  { bg: "#FFF8E7", accent: "#EFB343", light: "#FFE9A0" },
  { bg: "#FFF0EF", accent: "#E03C31", light: "#FCCFCC" },
  { bg: "#EEF4FF", accent: "#3B7DD8", light: "#C5D9F7" },
  { bg: "#F3EEFF", accent: "#7C4DFF", light: "#D9C8FF" },
  { bg: "#E8FAF0", accent: "#00BFA5", light: "#B2EDEF" },
  { bg: "#FFF3E0", accent: "#F57C00", light: "#FFD9A8" },
  { bg: "#FCE4EC", accent: "#C2185B", light: "#F5B8CE" },
];

export type SavedLessonProgress = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  stepIndex: number;
  savedAt: number;
};

export type ShareCardData =
  | { type: "lesson"; lessonTitle: string; xpEarned: number; isPerfect: boolean; courseName: string }
  | { type: "calculator"; headline: string; sub: string };
