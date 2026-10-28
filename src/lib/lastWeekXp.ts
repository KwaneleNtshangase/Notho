import { sastWeekKey } from "@/lib/dates";

type Slot = {
  currentWeekKey: string;
  currentXp: number;
  prevWeekKey: string;
  prevXp: number;
};

function storageKey(userId: string): string {
  return `notho-last-week-xp-${userId}`;
}

function empty(weekKey: string): Slot {
  return { currentWeekKey: weekKey, currentXp: 0, prevWeekKey: "", prevXp: 0 };
}

function readSlot(userId: string): Slot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Slot>;
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

function writeSlot(userId: string, slot: Slot): void {
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
  const prev = readSlot(userId) ?? empty(weekKey);
  let next: Slot;
  if (prev.currentWeekKey !== weekKey) {
    next = {
      currentWeekKey: weekKey,
      currentXp: weeklyXp,
      prevWeekKey: prev.currentWeekKey,
      prevXp: prev.currentXp,
    };
  } else {
    next = { ...prev, currentXp: weeklyXp };
  }
  writeSlot(userId, next);
  return next.prevXp;
}
