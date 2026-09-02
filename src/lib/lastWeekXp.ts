import { sastWeekKey } from "@/lib/dates";

export type LastWeekSlot = {
  currentWeekKey: string;
  currentXp: number;
  prevWeekKey: string;
  prevXp: number;
};

function storageKey(userId: string): string {
  return `notho-last-week-xp-${userId}`;
}

function empty(weekKey: string): LastWeekSlot {
  return { currentWeekKey: weekKey, currentXp: 0, prevWeekKey: "", prevXp: 0 };
}

/** Pure week roll. When the SAST week key changes, current becomes last week. */
export function rollLastWeekSlot(
  prev: LastWeekSlot | null,
  weekKey: string,
  weeklyXp: number
): LastWeekSlot {
  const safeXp = Math.max(0, Number(weeklyXp) || 0);
  if (!prev || prev.currentWeekKey !== weekKey) {
    return {
      currentWeekKey: weekKey,
      currentXp: safeXp,
      prevWeekKey: prev?.currentWeekKey ?? "",
      prevXp: prev?.currentXp ?? 0,
    };
  }
  return { ...prev, currentXp: safeXp };
}

function readSlot(userId: string): LastWeekSlot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<LastWeekSlot>;
    return {
      currentWeekKey: String(p.currentWeekKey ?? ""),
      currentXp: Math.max(0, Number(p.currentXp ?? 0) || 0),
      prevWeekKey: String(p.prevWeekKey ?? ""),
      prevXp: Math.max(0, Number(p.prevXp ?? 0) || 0),
    };
  } catch {
    return null;
  }
}

function writeSlot(userId: string, slot: LastWeekSlot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(slot));
  } catch {
    /* quota / private mode */
  }
}

export function syncLastWeekXp(userId: string | null, weeklyXp: number): number {
  const weekKey = sastWeekKey();
  if (!userId || typeof window === "undefined") return 0;
  const next = rollLastWeekSlot(readSlot(userId) ?? empty(weekKey), weekKey, weeklyXp);
  writeSlot(userId, next);
  return next.prevXp;
}
