"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Leaderboard is parked. Send leftover links to Learn. */
export default function LeaderboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/learn");
  }, [router]);

  return null;
}
