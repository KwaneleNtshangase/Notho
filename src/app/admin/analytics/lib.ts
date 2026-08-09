/**
 * Shared types, fetching and formatting for the admin analytics dashboard.
 * Kept out of page.tsx so the page file stays about layout, not plumbing.
 */

import { supabase } from "@/lib/supabaseClient";

// ── Brand palette (from brand/BRAND.md) ──────────────────────────────────────
export const C = {
  navy: "#083088",
  teal: "#049DA7",
  tealDeep: "#007A85",
  gold: "#EAAC3E",
  blue: "#0A3A71",
  red: "#E03C31",
  green: "#0E9F6E",
  purple: "#7C4DFF",
  ink: "#111827",
  body: "#374151",
  muted: "#6B7280",
  line: "#E5E7EB",
  bg: "#F7FAFC",
  card: "#FFFFFF",
} as const;

/** Ordered so charts stay visually distinct without hand-picking per series. */
export const SERIES = [C.teal, C.gold, C.navy, C.purple, C.green, C.red, C.blue];

// ── Row shapes returned by the RPCs ──────────────────────────────────────────

export type Overview = {
  totalUsers: number;
  newUsers: number;
  newUsersPrev: number;
  activeUsers: number;
  activeUsersPrev: number;
  dau: number;
  wau: number;
  mau: number;
  lessonsCompleted: number;
  totalXp: number;
  totalMinutes: number;
  sessions: number;
  avgSessionMinutes: number;
  usersWithStreak: number;
  answerAccuracy: number;
  pwaShare: number;
  windowDays: number;
  generatedAt: string;
};

export type DailyRow = {
  day: string;
  active_users: number;
  sessions: number;
  minutes: number;
  lessons: number;
  new_users: number;
};

export type FeatureRow = {
  feature: string;
  users: number;
  events: number;
  events_per_user: number;
  active_days: number;
  adoption_pct: number;
  last_used: string;
};

export type FeatureTimeRow = {
  feature: string;
  minutes: number;
  sessions: number;
  share_pct: number;
};

export type RetentionRow = {
  cohort_week: string;
  cohort_size: number;
  d1_pct: number | null;
  d7_pct: number | null;
  d30_pct: number | null;
};

export type UserRow = {
  user_id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  signed_up: string;
  last_seen: string;
  lessons_done: number;
  xp: number;
  streak: number;
  longest_streak: number;
  total_minutes: number;
  sessions: number;
  features_used: number;
  accuracy_pct: number | null;
  goal: string | null;
  age_range: string | null;
  days_since_seen: number | null;
};

export type ContentRow = {
  course_id: string;
  lesson_id: string;
  attempts: number;
  learners: number;
  first_try_pct: number | null;
  overall_pct: number;
  avg_attempts: number;
  verdict: string;
};

export type CourseRow = {
  course_id: string;
  learners: number;
  lessons_taken: number;
  attempts: number;
  first_try_pct: number | null;
  last_activity: string;
};

export type DropoffRow = {
  lesson_id: string;
  course_id: string | null;
  starts: number;
  completions: number;
  completion_pct: number | null;
  avg_quit_pct: number | null;
};

export type UserDetail = {
  profile: {
    userId: string;
    email: string;
    username: string | null;
    fullName: string | null;
    signedUp: string;
    lastSignIn: string | null;
    goal: string | null;
    ageRange: string | null;
    isAdmin: boolean;
  } | null;
  progress: {
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lessonsDone: number;
    perfectTotal: number;
    hearts: number;
    lastActivity: string | null;
    completedLessons: string[];
  } | null;
  usage: {
    totalMinutes: number;
    sessions: number;
    firstSeen: string | null;
    lastSeen: string | null;
    avgMinutes: number;
    devices: string[];
    usesPwa: boolean;
  } | null;
  features: { feature: string; events: number; lastUsed: string }[];
  accuracy: { answered: number; correct: number; pct: number | null } | null;
  dailyMinutes: { day: string; minutes: number }[];
  recentEvents: {
    event: string;
    feature: string;
    props: Record<string, unknown>;
    at: string;
  }[];
};

// ── Fetching ─────────────────────────────────────────────────────────────────

/**
 * Calls the admin analytics endpoint with the caller's access token. Throws a
 * message the UI can show verbatim - the panel components surface these
 * directly rather than showing a generic failure.
 */
export async function fetchView<T>(
  view: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("You are signed out. Sign in again to continue.");

  const qs = new URLSearchParams({ view });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }

  const res = await fetch(`/api/admin/analytics?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (res.status === 403) {
    throw new Error("This dashboard is admin-only and your account is not an admin.");
  }
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed (${res.status}).`);
  }
  return body.data as T;
}

// ── Formatting ───────────────────────────────────────────────────────────────

export const nf = new Intl.NumberFormat("en-ZA");

export function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return nf.format(Math.round(n));
}

/** Turns raw minutes into something a human reads at a glance. */
export function fmtMinutes(mins: number | null | undefined): string {
  if (mins == null || Number.isNaN(mins)) return "—";
  if (mins < 1) return "<1 min";
  if (mins < 60) return `${Math.round(mins)} min`;
  const hours = mins / 60;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${Math.round(hours)} hrs`;
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

/** "3 days ago" style, because absolute timestamps are harder to scan. */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t) || t <= 0) return "Never";
  const secs = Math.floor((Date.now() - t) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hrs ago`;
  const days = Math.floor(secs / 86400);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

/** Percentage change vs the previous equal-length window. */
export function delta(current: number, previous: number): {
  pct: number | null;
  dir: "up" | "down" | "flat";
} {
  if (!previous) return { pct: null, dir: current > 0 ? "up" : "flat" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

/** Human labels for the feature keys written by usageTracking.ts. */
export const FEATURE_LABELS: Record<string, string> = {
  learn: "Lessons",
  budget: "Budget planner",
  calculator: "Calculator",
  coach: "Cosmo AI coach",
  gamification: "Streaks & badges",
  quiz: "Investor quiz",
  sharing: "Sharing",
  advisor: "Advisor CTA",
  onboarding: "Sign-up flow",
  monetisation: "Paywall & checkout",
  pwa: "Install to home screen",
  retention: "Return visits",
  feedback: "Ratings & surveys",
  navigation: "Browsing",
  quests: "Goals & quests",
  leaderboard: "Leaderboard",
  profile: "Profile",
  settings: "Settings",
  other: "Other",
};

export function featureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

// ── CSV export ───────────────────────────────────────────────────────────────

/**
 * Downloads rows as CSV. Built client-side from data already on screen, so
 * there's no second endpoint to secure. Used for funding and competition packs.
 */
export function downloadCsv(
  filename: string,
  rows: Record<string, unknown>[],
  headerMap?: Record<string, string>
): void {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.map((k) => headerMap?.[k] ?? k);

  const escape = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v);
    // Guard against CSV formula injection when the file is opened in Excel.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };

  const csv = [
    header.join(","),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(",")),
  ].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notho-${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
