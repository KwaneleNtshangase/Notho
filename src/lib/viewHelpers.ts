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

// ─────────────────────────────────────────────────────────────────────────────
// Types shared across multiple components
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Audio
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding options (shared between OnboardingView and LearnView)
// ─────────────────────────────────────────────────────────────────────────────

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

/** Onboarding goal ids + labels - reuse for Learn screen banner. */
export const GOAL_OPTIONS = ONBOARDING_GOAL_OPTIONS;

export const GOAL_COURSE_MAP: Record<string, string[]> = {
  "debt-free": ["credit-debt", "money-basics", "money-psychology"],
  emergency: ["emergency-fund", "money-basics", "banking-debit"],
  invest: ["investing-basics", "sa-investing", "rand-economy"],
  home: ["property", "credit-debt", "banking-debit"],
  retire: ["retirement", "sa-investing", "investing-basics"],
  business: ["business-finance", "taxes", "money-basics"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Share helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Persist goal
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Lesson title lookup
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

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

export type CalcInputs = {
  principal: number;
  monthly: number;
  rate: number;
  years: number;
  escalation: number;
  frequency: "monthly" | "annually" | "once-off";
};

// ─────────────────────────────────────────────────────────────────────────────
// Calculator math
// ─────────────────────────────────────────────────────────────────────────────

export function calcGrowth(inputs: CalcInputs) {
  const { principal, monthly, rate, years, escalation, frequency } = inputs;
  const data: {
    year: number;
    value: number;
    contributions: number;
    interest: number;
  }[] = [];
  let balance = principal;
  let currentMonthly = monthly;
  let totalContributions = principal;

  for (let year = 0; year <= years; year++) {
    data.push({
      year,
      value: Math.round(balance),
      contributions: Math.round(totalContributions),
      interest: Math.round(balance - totalContributions),
    });
    if (year < years) {
      if (frequency === "monthly") {
        for (let m = 0; m < 12; m++) {
          balance = balance * (1 + rate / 100 / 12) + currentMonthly;
          totalContributions += currentMonthly;
        }
        currentMonthly = currentMonthly * (1 + escalation / 100);
      } else if (frequency === "annually") {
        balance = balance * Math.pow(1 + rate / 100, 1) + currentMonthly * 12;
        totalContributions += currentMonthly * 12;
        currentMonthly = currentMonthly * (1 + escalation / 100);
      } else {
        balance = balance * Math.pow(1 + rate / 100, 1);
      }
    }
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Number formatters
// ─────────────────────────────────────────────────────────────────────────────

/** Thousands use spaces (e.g. 1 000), not commas. */
export function formatWithSpaces(value: number) {
  if (!isFinite(value) || isNaN(value)) return "0";
  return Math.round(Math.abs(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

/** Rand amounts with space grouping (en-ZA). */
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

// ─────────────────────────────────────────────────────────────────────────────
// CosmoCharacter mascot
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// CourseIcon + COURSE_COLOURS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Saved lesson progress type
// ─────────────────────────────────────────────────────────────────────────────

export type SavedLessonProgress = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  stepIndex: number;
  savedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// ShareResultButton (canvas-based shareable card)
// ─────────────────────────────────────────────────────────────────────────────

export type ShareCardData =
  | { type: "lesson"; lessonTitle: string; xpEarned: number; isPerfect: boolean; courseName: string }
  | { type: "calculator"; headline: string; sub: string };

/** Cross-browser rounded rect - falls back to plain rect if roundRect unavailable */
function canvasRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    const safeR = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeR, y);
    ctx.lineTo(x + w - safeR, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + safeR);
    ctx.lineTo(x + w, y + h - safeR);
    ctx.quadraticCurveTo(x + w, y + h, x + w - safeR, y + h);
    ctx.lineTo(x + safeR, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - safeR);
    ctx.lineTo(x, y + safeR);
    ctx.quadraticCurveTo(x, y, x + safeR, y);
    ctx.closePath();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const w of words) {
    const test = line + (line ? " " : "") + w;
    if (ctx.measureText(test).width > maxWidth) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function generateShareCard(data: ShareCardData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#06201F");
      bg.addColorStop(0.6, "#082A29");
      bg.addColorStop(1, "#061009");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Radial glow centre
      const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 480);
      glow.addColorStop(0, "rgba(34,197,94,0.22)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      ctx.strokeStyle = "rgba(34,197,94,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Top brand strip
      ctx.fillStyle = "rgba(0,122,60,0.18)";
      canvasRoundRect(ctx, 60, 100, W - 120, 90, 18); ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NOTHO", W / 2, 156);

      if (data.type === "lesson") {
        // Big trophy icon area
        ctx.fillStyle = "rgba(239,179,67,0.12)";
        ctx.beginPath(); ctx.arc(W / 2, H * 0.35, 140, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#EFB343";
        ctx.font = "140px serif";
        ctx.textAlign = "center";
        ctx.fillText("🏆", W / 2, H * 0.35 + 52);

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        canvasRoundRect(ctx, 60, H * 0.52, W - 120, 260, 24); ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 58px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        const lines = wrapText(ctx, data.lessonTitle, W - 160);
        lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.54 + i * 70));

        ctx.fillStyle = "#22c55e";
        ctx.font = `bold 48px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(`+${data.xpEarned} XP earned`, W / 2, H * 0.54 + lines.length * 70 + 60);

        if (data.isPerfect) {
          ctx.fillStyle = "#EFB343";
          ctx.font = `bold 38px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillText("⭐ Perfect Score!", W / 2, H * 0.54 + lines.length * 70 + 120);
        }

        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = `500 34px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillText(`${data.courseName} course`, W / 2, H * 0.82);
      } else {
        // Calculator card
        ctx.fillStyle = "rgba(34,197,94,0.1)";
        canvasRoundRect(ctx, 60, H * 0.28, W - 120, 500, 28); ctx.fill();
        ctx.strokeStyle = "rgba(34,197,94,0.3)";
        ctx.lineWidth = 2;
        canvasRoundRect(ctx, 60, H * 0.28, W - 120, 500, 28); ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = `bold 42px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("I just discovered…", W / 2, H * 0.31);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 68px -apple-system, BlinkMacSystemFont, sans-serif`;
        const lines2 = wrapText(ctx, data.headline, W - 180);
        lines2.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.37 + i * 80));

        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = `500 38px -apple-system, BlinkMacSystemFont, sans-serif`;
        const subLines = wrapText(ctx, data.sub, W - 200);
        subLines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.37 + lines2.length * 80 + 60 + i * 52));
      }

      // Bottom CTA
      ctx.fillStyle = "#22c55e";
      canvasRoundRect(ctx, 120, H - 220, W - 240, 80, 40); ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = `bold 34px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Try it FREE → notho.co.za", W / 2, H - 170);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = `500 28px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Real money skills. Start free at notho.co.za", W / 2, H - 110);

      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(err);
    }
  });
}

export function ShareResultButton({ data, label = "Share" }: { data: ShareCardData; label?: string }) {
  const [sharing, setSharing] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "done" | "error">("idle");

  const handleShare = async () => {
    setSharing(true);
    setStatus("idle");
    try {
      const dataUrl = await generateShareCard(data);

      const text = data.type === "calculator"
        ? `${data.headline} - calculated on Notho 📊 Try it free at notho.co.za`
        : `I just completed "${(data as any).lessonTitle}" (+${(data as any).xpEarned} XP) on Notho 🎓 notho.co.za`;

      // Try native share with image file
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "notho-result.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Notho", text });
          analytics.shareTriggered(data.type === "lesson" ? "lesson" : "badge", "native");
          setStatus("done");
          setSharing(false);
          return;
        }
      } catch {
        // canShare or share failed - fall through to download
      }

      // Fallback: try navigator.share with just text (no image)
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({ title: "Notho", text });
          analytics.shareTriggered(data.type === "lesson" ? "lesson" : "badge", "native");
          setStatus("done");
          setSharing(false);
          return;
        } catch {
          // dismissed - fall through to download
        }
      }

      // Final fallback: download the image card
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "notho-result.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus("done");
    } catch {
      setStatus("error");
    }
    setSharing(false);
  };

  const btnLabel = sharing
    ? "Generating…"
    : status === "done"
      ? "Saved / Shared ✓"
      : status === "error"
        ? "Try again"
        : label;

  return React.createElement("button", {
    type: "button",
    onClick: handleShare,
    disabled: sharing,
    style: {
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
      padding: "12px 20px", borderRadius: 12, cursor: sharing ? "default" : "pointer",
      border: `1.5px solid ${status === "error" ? "rgba(220,38,38,0.4)" : "rgba(34,197,94,0.4)"}`,
      background: status === "error" ? "rgba(220,38,38,0.08)" : "rgba(34,197,94,0.08)",
      color: status === "error" ? "#dc2626" : "#22c55e",
      fontWeight: 700, fontSize: 14, width: "100%",
    },
  },
    React.createElement(Share2, { size: 16 }),
    btnLabel
  );
}
