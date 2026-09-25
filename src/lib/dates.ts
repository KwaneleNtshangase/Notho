/**
 * Date helpers that always use South Africa Standard Time (UTC+2, no DST).
 *
 * Every calendar-day localStorage key and daily/weekly comparison MUST go
 * through these helpers. Using new Date().toISOString() gives a UTC date
 * which rolls over at 22:00 SA time - causing streaks, daily XP, and
 * daily challenges to reset two hours early every evening.
 */

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2, no daylight saving

/**
 * Strip a Postgres DATE / timestamptz / ISO string down to "YYYY-MM-DD".
 * PostgREST sometimes returns dates as "2026-09-24T00:00:00.000Z". Passing
 * that raw string into Date() makes the day-diff round to 0 against the
 * next SAST calendar day, which is the "streak stuck until I do a lesson
 * and then it only ticks by one" bug.
 */
export function normaliseSastDay(value: string | null | undefined): string | null {
  if (value == null) return null;
  const m = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/**
 * Add `days` to a YYYY-MM-DD calendar date in UTC-date space (SAST dates
 * are stored as civil dates, not instants). Safe to use from tests that
 * pass a fake "today".
 */
export function addSastDays(ymd: string, days: number): string {
  const day = normaliseSastDay(ymd);
  if (!day) return ymd;
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Returns today's date string in SAST as "YYYY-MM-DD".
 * Use wherever you would otherwise write `new Date().toISOString().slice(0, 10)`.
 */
export function sastToday(): string {
  return new Date(Date.now() + SAST_OFFSET_MS).toISOString().split("T")[0];
}

/**
 * Returns a date offset by `days` from today in SAST.
 * E.g. sastOffset(-1) = yesterday in SAST.
 */
export function sastOffset(days: number): string {
  return addSastDays(sastToday(), days);
}

/**
 * Returns "notho-week-YYYY-MM-DD" anchored to the most recent Sunday in SAST.
 * Used for weekly XP keys and leaderboard week boundaries.
 */
export function sastWeekKey(): string {
  const now = new Date(Date.now() + SAST_OFFSET_MS);
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday in the shifted time
  const sunday = new Date(now.getTime() - dayOfWeek * 86_400_000);
  const y = sunday.getUTCFullYear();
  const m = String(sunday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(sunday.getUTCDate()).padStart(2, "0");
  return `notho-week-${y}-${m}-${d}`;
}

/**
 * Returns "YYYY-MM-DD" of the most recent Sunday in SAST.
 * Used as the weekly challenge seed / storage key anchor.
 */
export function sastSundayDate(): string {
  const now = new Date(Date.now() + SAST_OFFSET_MS);
  const dayOfWeek = now.getUTCDay();
  const sunday = new Date(now.getTime() - dayOfWeek * 86_400_000);
  const y = sunday.getUTCFullYear();
  const m = String(sunday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(sunday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the number of days between two SAST date strings (YYYY-MM-DD).
 * e.g., if dateA is tomorrow and dateB is today, returns 1.
 * Accepts Postgres DATE / ISO datetime leftovers and compares civil dates only.
 */
export function sastDateDiffDays(dateA: string, dateB: string): number {
  const a = normaliseSastDay(dateA);
  const b = normaliseSastDay(dateB);
  if (!a || !b) return 0;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const tA = Date.UTC(ay, am - 1, ad);
  const tB = Date.UTC(by, bm - 1, bd);
  return Math.round((tA - tB) / 86_400_000);
}

export type StreakSnapshot = {
  streak: number;
  freezeCount: number;
  lastActivityDate: string | null;
};

/**
 * Reconciles the user's streak on app open — Duolingo freeze rules, no increment.
 *
 * Completing a lesson is what increments. Opening the app, using a freeze,
 * or midnight passing must never tick the number up.
 *
 * - last == today or yesterday: leave the number alone.
 * - missed days covered by freezes: consume one freeze per missed day, keep
 *   the number, stamp lastActivityDate to yesterday so today still needs a lesson.
 * - not enough freezes: streak drops to 0.
 */
export function evaluateStreak(
  streak: number,
  freezeCount: number,
  lastActivityDate: string | null,
  currentDate: string = sastToday()
): StreakSnapshot {
  const today = normaliseSastDay(currentDate) ?? sastToday();
  const last = normaliseSastDay(lastActivityDate);
  const streakN = Math.max(0, Math.floor(Number(streak) || 0));
  const freezes = Math.max(0, Math.floor(Number(freezeCount) || 0));

  if (!last) {
    return { streak: streakN, freezeCount: freezes, lastActivityDate: last };
  }

  const gap = sastDateDiffDays(today, last);

  // Played today or yesterday (or device clock is slightly behind) — live streak.
  if (gap <= 1) {
    return { streak: streakN, freezeCount: freezes, lastActivityDate: last };
  }

  const missedDays = gap - 1;

  if (freezes >= missedDays) {
    return {
      streak: streakN,
      freezeCount: freezes - missedDays,
      // Yesterday of *currentDate*, not wall-clock sastOffset(-1), so tests
      // and a delayed cron agree on the same civil day.
      lastActivityDate: addSastDays(today, -1),
    };
  }

  return {
    streak: 0,
    freezeCount: freezes,
    lastActivityDate: last,
  };
}

/**
 * Apply a qualifying lesson / review to the streak. Idempotent per SAST day.
 *
 * Duolingo rules:
 *   1. First activity of the day increments by exactly 1.
 *   2. A second activity the same day is a no-op.
 *   3. Freeze-covered missed days keep the number; they do not add days.
 *   4. A gap bigger than the freeze stock breaks the streak; this lesson
 *      starts a new streak at 1.
 */
export function applyLessonToStreak(
  streak: number,
  freezeCount: number,
  lastActivityDate: string | null,
  currentDate: string = sastToday()
): StreakSnapshot & { extended: boolean } {
  const today = normaliseSastDay(currentDate) ?? sastToday();
  const reconciled = evaluateStreak(streak, freezeCount, lastActivityDate, today);
  const last = reconciled.lastActivityDate;

  if (last === today) {
    return {
      ...reconciled,
      streak: Math.max(reconciled.streak, 1),
      lastActivityDate: today,
      extended: false,
    };
  }

  const nextStreak = !last || reconciled.streak === 0 ? 1 : reconciled.streak + 1;

  return {
    streak: nextStreak,
    freezeCount: reconciled.freezeCount,
    lastActivityDate: today,
    extended: true,
  };
}
