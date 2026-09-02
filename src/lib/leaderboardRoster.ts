/** Weekly learner roster rules for the public board. */

export const LEADERBOARD_VISIBLE_CAP = 12;

export type RosterInput = {
  user_id: string;
  username: string | null;
  xp: number | null;
  weekly_xp: number | null;
  week_key: string | null;
};

export type LeaderRow = {
  id: string;
  name: string;
  xp: number;
  totalXp: number;
  isYou: boolean;
  rank: number;
};

export function isTestAccount(username: string | null): boolean {
  const n = (username ?? "").trim().toLowerCase();
  return /(^|[^a-z])(e2e|test|tester|qa)([^a-z]|$)|_bot$|^bot_|^tester$/.test(n);
}

export function buildWeeklyRoster(
  rows: RosterInput[],
  opts: {
    myId: string | null;
    currentWeekKey: string;
    localWeeklyXp?: number;
    cap?: number;
  }
): LeaderRow[] {
  const cap = opts.cap ?? LEADERBOARD_VISIBLE_CAP;
  const built: LeaderRow[] = [];

  for (const r of rows) {
    const uid = String(r.user_id);
    const isYou = Boolean(opts.myId) && uid === opts.myId;
    if (!isYou && isTestAccount(r.username)) continue;

    const isCurrentWeek = (r.week_key ?? "") === opts.currentWeekKey;
    const remoteWeekly = isCurrentWeek ? (r.weekly_xp ?? 0) : 0;
    const displayWeeklyXp = isYou
      ? Math.max(remoteWeekly, opts.localWeeklyXp ?? 0)
      : remoteWeekly;

    if (!isYou && displayWeeklyXp <= 0) continue;

    const rawName = (r.username ?? "").trim();
    const name = isYou
      ? "You"
      : rawName || "Learner " + uid.slice(0, 4).toUpperCase();

    built.push({
      id: uid,
      name,
      xp: displayWeeklyXp,
      totalXp: r.xp ?? 0,
      isYou,
      rank: 0,
    });
  }

  built.sort((a, b) => b.xp - a.xp || b.totalXp - a.totalXp);

  const you = built.find((row) => row.isYou);
  const others = built.filter((row) => !row.isYou).slice(0, Math.max(0, cap - (you ? 1 : 0)));
  const visible = you ? [...others, you] : others;
  visible.sort((a, b) => b.xp - a.xp || b.totalXp - a.totalXp);
  visible.forEach((row, i) => {
    row.rank = i + 1;
  });
  return visible;
}

export function scorerCount(rows: LeaderRow[]): number {
  return rows.filter((row) => row.xp > 0).length;
}
