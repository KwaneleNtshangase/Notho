"use client";

import { useEffect } from "react";
import { useNotho } from "@/context/NothoContext";
import { sastToday, streakExtendedToday } from "@/lib/dates";
import { startStreakLiveActivity, midnightSastIso, endStreakLiveActivity } from "@/lib/push/liveActivity";

/**
 * Starts a Duolingo-style Live Activity on iOS when the streak is at risk
 * (not extended today, streak >= 2, and it's after 18:00 SAST). Ends it
 * once the user has done a lesson today. No-op on web and Android.
 */
export function StreakLiveActivity() {
  const { userData } = useNotho();

  useEffect(() => {
    const streak = Number(userData?.streak ?? 0);
    const last = userData?.lastActivityDate ?? null;
    const today = sastToday();
    const extended = streakExtendedToday(last, today);
    const sastHour = new Date(Date.now() + 2 * 60 * 60 * 1000).getUTCHours();

    if (extended || streak < 2 || sastHour < 18) {
      void endStreakLiveActivity();
      return;
    }

    const name = (() => {
      try {
        return localStorage.getItem("notho-username");
      } catch {
        return null;
      }
    })();
    void startStreakLiveActivity({
      streak,
      name,
      endsAt: midnightSastIso(),
    });
  }, [userData?.streak, userData?.lastActivityDate]);

  return null;
}
