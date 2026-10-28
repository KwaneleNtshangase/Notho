/**
 * Streak freeze rules. One equipped freeze covers one missed SAST day.
 * It does not add a day to the streak. Inventory is bought with XP (max 2),
 * not refilled for free on Sunday. Apply is automatic: opening the app,
 * syncing a lesson, and the nightly job all use the same gap math in
 * evaluateStreak. A freeze is never spent on a day that already has a lesson,
 * and a gap bigger than the stock breaks the streak without burning the stock.
 */

export const STREAK_FREEZE_COST = 200;
export const STREAK_FREEZE_MAX = 2;

export type FreezeBuyReason = "ok" | "full" | "xp" | "signed_out" | "save_failed" | "busy";

export type FreezePurchase = {
  ok: boolean;
  reason?: Exclude<FreezeBuyReason, "ok">;
  freezeCount?: number;
};

export function freezeBuyBlock(
  freezeCount: number,
  xp: number,
  signedIn: boolean
): FreezeBuyReason {
  if (!signedIn) return "signed_out";
  if (freezeCount >= STREAK_FREEZE_MAX) return "full";
  if (xp < STREAK_FREEZE_COST) return "xp";
  return "ok";
}

export function freezeBuyLabel(block: FreezeBuyReason): string {
  if (block === "full") return `${STREAK_FREEZE_MAX} equipped`;
  if (block === "xp") return `Need ${STREAK_FREEZE_COST} XP`;
  if (block === "signed_out") return "Sign in to equip";
  if (block === "busy") return "Equipping…";
  if (block === "save_failed") return "Could not save. Try again";
  return `Equip freeze · ${STREAK_FREEZE_COST} XP`;
}

export function freezeStatusLine(opts: {
  freezeCount: number;
  lessonsToday: number;
  streak: number;
}): string {
  if (opts.lessonsToday > 0) return "Lesson done today. Streak is safe. No freeze used.";
  if (opts.streak <= 0) {
    return opts.freezeCount > 0
      ? "No live streak. Equipped freezes stay in your pocket until you start again."
      : "Finish a lesson to start a streak, then equip a freeze before you need it.";
  }
  if (opts.freezeCount > 0) {
    return opts.freezeCount === 1
      ? "1 freeze equipped. It applies automatically if you miss a day."
      : `${opts.freezeCount} freezes equipped. Each one covers one missed day, automatically.`;
  }
  return "No freeze equipped. A missed day breaks the streak.";
}
