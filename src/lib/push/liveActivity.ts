/**
 * Streak Live Activity / Dynamic Island (iOS 16.1+, Dynamic Island on 14 Pro+).
 *
 * Starts a Duolingo-style persistent Lock Screen + island card that counts
 * down to midnight SAST when the streak is at risk. Requires the next
 * App Store / TestFlight binary that includes @capgo/capacitor-live-activities
 * and NSSupportsLiveActivities. Safe no-op on web, Android without the
 * plugin, and older iOS.
 */

const STREAK_ACTIVITY_ID = "notho-streak-save";

export type StreakLiveInput = {
  streak: number;
  name?: string | null;
  /** ISO instant when the streak expires (midnight SAST). */
  endsAt: string;
};

function isNativeIos(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  return !!cap?.isNativePlatform?.() && cap.getPlatform?.() === "ios";
}

/** Midnight tonight in SAST, as an ISO string. */
export function midnightSastIso(now = new Date()): string {
  const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const y = sast.getUTCFullYear();
  const m = sast.getUTCMonth();
  const d = sast.getUTCDate();
  const midnightUtc = Date.UTC(y, m, d + 1) - 2 * 60 * 60 * 1000;
  return new Date(midnightUtc).toISOString();
}

export async function startStreakLiveActivity(input: StreakLiveInput): Promise<boolean> {
  if (!isNativeIos()) return false;
  if (input.streak < 1) return false;
  try {
    const { CapgoLiveActivities } = await import("@capgo/capacitor-live-activities");
    const title = input.name ? `Save your streak, ${input.name}!` : "Save your streak!";
    const { activityId } = await CapgoLiveActivities.startActivity({
      layout: {
        type: "container",
        direction: "horizontal",
        spacing: 12,
        properties: {
          padding: 16,
          backgroundColor: "#6B4CFF",
          cornerRadius: 16,
        },
        children: [
          {
            type: "text",
            content: String(input.streak),
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
          },
          {
            type: "container",
            direction: "vertical",
            spacing: 4,
            children: [
              {
                type: "text",
                content: title,
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFFFFF",
              },
              {
                type: "text",
                content: "Midnight is the line",
                fontSize: 13,
                color: "#EDE7FF",
              },
            ],
          },
        ],
      },
      dynamicIslandLayout: {
        expanded: {
          leading: { type: "text", content: String(input.streak), fontSize: 20, color: "#FFFFFF" },
          trailing: { type: "text", content: "streak", fontSize: 12, color: "#EDE7FF" },
          center: { type: "text", content: title, fontSize: 14, color: "#FFFFFF" },
          bottom: { type: "text", content: "Tap to keep it", fontSize: 12, color: "#EDE7FF" },
        },
        compactLeading: { type: "text", content: String(input.streak) },
        compactTrailing: { type: "text", content: "fire" },
        minimal: { type: "text", content: String(input.streak) },
      },
      data: {
        streak: input.streak,
        title,
        endsAt: input.endsAt,
        localId: STREAK_ACTIVITY_ID,
      },
    });
    if (typeof window !== "undefined" && activityId) {
      try { sessionStorage.setItem(STREAK_ACTIVITY_ID, activityId); } catch { /* ignore */ }
    }
    return true;
  } catch {
    return false;
  }
}

export async function endStreakLiveActivity(): Promise<void> {
  if (!isNativeIos()) return;
  try {
    const { CapgoLiveActivities } = await import("@capgo/capacitor-live-activities");
    let activityId = STREAK_ACTIVITY_ID;
    if (typeof window !== "undefined") {
      try { activityId = sessionStorage.getItem(STREAK_ACTIVITY_ID) || activityId; } catch { /* ignore */ }
    }
    await CapgoLiveActivities.endActivity({ activityId });
    if (typeof window !== "undefined") {
      try { sessionStorage.removeItem(STREAK_ACTIVITY_ID); } catch { /* ignore */ }
    }
  } catch {
    /* no activity or plugin missing */
  }
}
