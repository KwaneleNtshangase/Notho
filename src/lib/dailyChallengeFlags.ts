import { sastToday } from "@/lib/dates";

/** Same-tab signal so Goals ticks the moment a flag is written. */
export const DAILY_CHALLENGE_FLAG_EVENT = "notho-daily-challenge-flag";

export function emitDailyChallengeFlag(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DAILY_CHALLENGE_FLAG_EVENT));
}

function setTodayFlag(prefix: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${prefix}-${sastToday()}`, "1");
  emitDailyChallengeFlag();
}

export function markSharedToday(): void {
  setTodayFlag("notho-shared-today");
}

export function markConceptReviewedToday(): void {
  setTodayFlag("notho-concept-reviewed");
}

export function markCalcVisitedToday(): void {
  setTodayFlag("notho-calc-visited");
}

export function markBudgetVisitedToday(): void {
  setTodayFlag("notho-budget-visited");
}

export function bumpCorrectAnswerStreakToday(): void {
  if (typeof window === "undefined") return;
  const key = `notho-correct-streak-today-${sastToday()}`;
  const n = parseInt(localStorage.getItem(key) ?? "0", 10);
  localStorage.setItem(key, String(n + 1));
  emitDailyChallengeFlag();
}

export function resetCorrectAnswerStreakToday(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`notho-correct-streak-today-${sastToday()}`, "0");
  emitDailyChallengeFlag();
}

export function bumpExpenseToday(): number {
  if (typeof window === "undefined") return 0;
  const key = `notho-expense-today-${sastToday()}`;
  const n = parseInt(localStorage.getItem(key) ?? "0", 10) + 1;
  localStorage.setItem(key, String(n));
  emitDailyChallengeFlag();
  return n;
}
