/**
 * Smart push re-engagement triggers (pure logic, no I/O).
 *
 * Cron feeds each subscribed user through these and sends at most ONE push
 * per user per day, in priority: save (streak at risk) > routine > coach alert.
 */

export type PushMessage = {
  key: string;
  title: string;
  body: string;
  url: string;
};

export function yesterdayOf(sastDay: string): string {
  const d = new Date(`${sastDay}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const SAVE_COPY: { title: (n: number) => string; body: (n: number, lesson: string) => string }[] = [
  {
    title: (n) => `${n} days. Midnight is the line.`,
    body: (_n, lesson) => `${lesson} keeps it. Tap and you're in.`,
  },
  {
    title: (n) => `Don't drop ${n} over nothing`,
    body: (_n, lesson) => `One sitting. ${lesson}.`,
  },
  {
    title: (n) => `${n}-day streak is still alive`,
    body: (_n, lesson) => `Barely. Open ${lesson} before it isn't.`,
  },
];

const ROUTINE_COPY: { title: string; body: (lesson: string, course: string) => string }[] = [
  { title: "Same time as yesterday?", body: (l, c) => `${l} in ${c}. That's the one.` },
  { title: "You left a lesson hanging", body: (l) => `${l} is still there. Two minutes if you rush.` },
  { title: "Quick one", body: (l, c) => `${c} — ${l}. Then you can close the phone.` },
  { title: "Still with me?", body: (l) => `Next up: ${l}.` },
];

const WINBACK_COPY: { title: string; body: (lesson: string) => string }[] = [
  { title: "We kept your place", body: (l) => `${l} is where you stopped.` },
  { title: "It's been a couple of days", body: (l) => `No lecture. Just ${l}.` },
];

function pick<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length]!;
}

export function streakAtRiskPush(
  streak: number,
  lastActivityDate: string | null,
  sastToday: string,
  next?: { lessonTitle: string; url: string } | null
): PushMessage | null {
  if (streak < 2) return null;
  if (lastActivityDate !== yesterdayOf(sastToday)) return null;
  const lesson = next?.lessonTitle ?? "today's lesson";
  const line = pick(SAVE_COPY, `${sastToday}:${streak}`);
  return {
    key: `streak:${sastToday}`,
    title: line.title(streak),
    body: line.body(streak, lesson),
    url: next?.url ?? "/learn",
  };
}

export function routinePush(
  lastActivityDate: string | null,
  sastToday: string,
  next?: { lessonTitle: string; courseTitle: string; url: string } | null
): PushMessage | null {
  if (lastActivityDate === sastToday) return null;
  const yesterday = yesterdayOf(sastToday);
  const daysOff =
    lastActivityDate && lastActivityDate < yesterday
      ? Math.max(1, Math.floor((Date.parse(`${sastToday}T12:00:00Z`) - Date.parse(`${lastActivityDate}T12:00:00Z`)) / 86400000))
      : 0;
  if (daysOff > 7) return null;

  const lesson = next?.lessonTitle ?? "the next lesson";
  const course = next?.courseTitle ?? "Learn";
  if (daysOff >= 2) {
    const line = pick(WINBACK_COPY, `${sastToday}:wb`);
    return {
      key: `routine:${sastToday}`,
      title: line.title,
      body: line.body(lesson),
      url: next?.url ?? "/learn",
    };
  }
  const line = pick(ROUTINE_COPY, `${sastToday}:r`);
  return {
    key: `routine:${sastToday}`,
    title: line.title,
    body: line.body(lesson, course),
    url: next?.url ?? "/learn",
  };
}

export function coachAlertPush(
  insight: { id: string; severity: string; title: string } | undefined
): PushMessage | null {
  if (!insight || insight.severity !== "alert") return null;
  return {
    key: insight.id,
    title: "Budget's talking",
    body: `${insight.title}. Open Budget if you want the picture.`,
    url: "/budget",
  };
}

export function leaderboardDefencePush(
  rank: number | null,
  weeklyXp: number,
  weekKey: string,
  isSaturday: boolean
): PushMessage | null {
  if (!isSaturday || rank === null || rank > 10 || weeklyXp <= 0) return null;
  return {
    key: `rank:${weekKey}`,
    title: rank === 1 ? "You're first this week" : `You're #${rank} this week`,
    body: "Board is parked. This line stays for tests only.",
    url: "/learn",
  };
}

export function pickPush(candidates: (PushMessage | null)[]): PushMessage | null {
  for (const c of candidates) if (c) return c;
  return null;
}
