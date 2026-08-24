"use client";

/**
 * Daily-challenge flags — the local half.
 *
 * The daily challenge list (LearnView's `DailyChallenges`) decides whether each
 * task is achieved by reading a handful of date-suffixed localStorage keys:
 * `notho-concept-reviewed-<day>`, `notho-perfect-today-<day>`, and friends.
 * Device-local, so opening the Budget Planner on your phone left the "Open the
 * Budget Planner" task unachieved on your laptop.
 *
 * Rather than rewrite that reader, this module keeps those exact keys as the
 * read surface and syncs their VALUES through `user_progress.daily_flags`.
 * After a sync the local keys hold the merged, cross-device values, so the
 * existing code is correct without being touched.
 */

import { emptyDailyFlags, type DailyFlags } from "@/lib/sync/mergeRules";

const BOOL_KEYS = {
  conceptReviewed: (d: string) => `notho-concept-reviewed-${d}`,
  shared: (d: string) => `notho-shared-today-${d}`,
  calcVisited: (d: string) => `notho-calc-visited-${d}`,
  budgetVisited: (d: string) => `notho-budget-visited-${d}`,
  reviewCounted: (d: string) => `notho-review-counted-${d}`,
} as const;

const COUNT_KEYS = {
  perfectToday: (d: string) => `notho-perfect-today-${d}`,
  expenseToday: (d: string) => `notho-expense-today-${d}`,
  correctStreakToday: (d: string) => `notho-correct-streak-today-${d}`,
} as const;

function readInt(key: string): number {
  const raw = localStorage.getItem(key);
  const n = parseInt(raw ?? "0", 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

export function readLocalDailyFlags(day: string): DailyFlags {
  if (typeof window === "undefined") return emptyDailyFlags(day);
  const out = emptyDailyFlags(day);
  try {
    for (const [field, key] of Object.entries(BOOL_KEYS)) {
      out[field as keyof typeof BOOL_KEYS] = localStorage.getItem(key(day)) === "1";
    }
    for (const [field, key] of Object.entries(COUNT_KEYS)) {
      out[field as keyof typeof COUNT_KEYS] = readInt(key(day));
    }
  } catch {
    /* private mode — treat as nothing done today */
  }
  return out;
}

/**
 * Write the merged flags back onto the legacy keys so LearnView's reader picks
 * up what happened on the other device. Only ever raises a value — the merge
 * has already applied OR / GREATEST, so this can never un-tick a task.
 */
export function writeLocalDailyFlags(flags: DailyFlags): void {
  if (typeof window === "undefined") return;
  try {
    for (const [field, key] of Object.entries(BOOL_KEYS)) {
      if (flags[field as keyof typeof BOOL_KEYS]) localStorage.setItem(key(flags.day), "1");
    }
    for (const [field, key] of Object.entries(COUNT_KEYS)) {
      const value = flags[field as keyof typeof COUNT_KEYS];
      if (value > 0) localStorage.setItem(key(flags.day), String(value));
    }
  } catch {
    /* best-effort */
  }
}

export { emptyDailyFlags };
export type { DailyFlags };
