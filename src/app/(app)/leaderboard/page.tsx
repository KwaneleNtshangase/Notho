"use client";

import { LeaderboardView } from "@/components/LeaderboardView";
import { useNotho } from "@/context/NothoContext";

export default function LeaderboardPage() {
  const { userData, weeklyXp, userId } = useNotho();

  return (
    <LeaderboardView
      xp={userData?.xp ?? 0}
      weeklyXp={weeklyXp}
      currentUserId={userId ?? undefined}
    />
  );
}
