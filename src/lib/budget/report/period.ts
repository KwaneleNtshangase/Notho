import { sastToday } from "@/lib/dates";

export type PeriodPreset = "this_month" | "last_month" | "quarter" | "year" | "custom";

export type PeriodRange = {
  periodStart: string;
  periodEnd: string;
};

function parseYmd(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

export function minDate(a: string, b: string): string {
  return a <= b ? a : b;
}

export function maxDate(a: string, b: string): string {
  return a >= b ? a : b;
}

export function firstDayOfMonthYear(monthYear: string): string {
  return `${monthYear}-01`;
}

export function lastDayOfMonthYear(monthYear: string): string {
  const [y, m] = monthYear.split("-").map(Number);
  return lastDayOfMonth(y, m);
}

export function lastDayOfMonth(year: number, month: number): string {
  const days = daysInCalendarMonth(year, month);
  return `${year}-${String(month).padStart(2, "0")}-${String(days).padStart(2, "0")}`;
}

export function daysInCalendarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function inclusiveDayCount(start: string, end: string): number {
  if (end < start) return 0;
  const s = parseYmd(start);
  const e = parseYmd(end);
  const startMs = Date.UTC(s.y, s.m - 1, s.d);
  const endMs = Date.UTC(e.y, e.m - 1, e.d);
  return Math.floor((endMs - startMs) / 86_400_000) + 1;
}

export function addDays(ymd: string, days: number): string {
  const { y, m, d } = parseYmd(ymd);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** The equal-length period immediately before [periodStart, periodEnd]. */
export function precedingPeriod(periodStart: string, periodEnd: string): PeriodRange {
  const len = inclusiveDayCount(periodStart, periodEnd);
  const prevEnd = addDays(periodStart, -1);
  const prevStart = addDays(prevEnd, -(len - 1));
  return { periodStart: prevStart, periodEnd: prevEnd };
}

/**
 * The full calendar month immediately before periodStart's month.
 *
 * This is what "last report" means to a person ("June's report"), and it is
 * the period shape snapshots reliably exist for - `precedingPeriod` is
 * equal-length day math (this-month on the 18th → "Jun 13-30"), a window no
 * snapshot is ever written under, so mission follow-through must anchor to
 * calendar months instead.
 */
export function previousCalendarMonthPeriod(periodStart: string): PeriodRange {
  const prevMonthEnd = addDays(firstDayOfMonthYear(periodStart.slice(0, 7)), -1);
  return {
    periodStart: firstDayOfMonthYear(prevMonthEnd.slice(0, 7)),
    periodEnd: prevMonthEnd,
  };
}

export function enumerateMonths(start: string, end: string): string[] {
  const months: string[] = [];
  let { y, m } = parseYmd(start);
  const endParts = parseYmd(end);
  while (y < endParts.y || (y === endParts.y && m <= endParts.m)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

function thisMonthRange(today: string): PeriodRange {
  const { y, m } = parseYmd(today);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const calendarEnd = lastDayOfMonth(y, m);
  return { periodStart: start, periodEnd: minDate(calendarEnd, today) };
}

function lastMonthRange(today: string): PeriodRange {
  const { y, m } = parseYmd(today);
  let prevM = m - 1;
  let prevY = y;
  if (prevM < 1) {
    prevM = 12;
    prevY--;
  }
  return {
    periodStart: `${prevY}-${String(prevM).padStart(2, "0")}-01`,
    periodEnd: lastDayOfMonth(prevY, prevM),
  };
}

function quarterRange(today: string): PeriodRange {
  const { y, m } = parseYmd(today);
  const qStartMonth = Math.floor((m - 1) / 3) * 3 + 1;
  const qEndMonth = qStartMonth + 2;
  const start = `${y}-${String(qStartMonth).padStart(2, "0")}-01`;
  const calendarEnd = lastDayOfMonth(y, qEndMonth);
  return { periodStart: start, periodEnd: minDate(calendarEnd, today) };
}

function yearRange(today: string): PeriodRange {
  const y = parseYmd(today).y;
  return {
    periodStart: `${y}-01-01`,
    periodEnd: minDate(`${y}-12-31`, today),
  };
}

export function resolvePeriod(
  preset: PeriodPreset,
  custom?: { periodStart?: string; periodEnd?: string },
  today: string = sastToday()
): PeriodRange {
  switch (preset) {
    case "this_month":
      return thisMonthRange(today);
    case "last_month":
      return lastMonthRange(today);
    case "quarter":
      return quarterRange(today);
    case "year":
      return yearRange(today);
    case "custom": {
      const fallback = thisMonthRange(today);
      const periodStart = custom?.periodStart ?? fallback.periodStart;
      const periodEnd = minDate(custom?.periodEnd ?? fallback.periodEnd, today);
      return { periodStart, periodEnd: maxDate(periodStart, periodEnd) };
    }
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatPeriodLabel(periodStart: string, periodEnd: string, translate: (source: string) => string = source => source): string {
  const s = parseYmd(periodStart);
  const e = parseYmd(periodEnd);
  const startMonth = translate(MONTH_NAMES[s.m - 1]);
  const endMonth = translate(MONTH_NAMES[e.m - 1]);
  if (periodStart === periodEnd) {
    return `${s.d} ${startMonth} ${s.y}`;
  }
  if (s.y === e.y && s.m === e.m) {
    return `${s.d}–${e.d} ${startMonth} ${s.y}`;
  }
  if (s.y === e.y) {
    return `${s.d} ${startMonth} – ${e.d} ${endMonth} ${s.y}`;
  }
  return `${s.d} ${startMonth} ${s.y} – ${e.d} ${endMonth} ${e.y}`;
}

export function monthAlignedDefaults(today: string = sastToday()): PeriodRange {
  return thisMonthRange(today);
}
