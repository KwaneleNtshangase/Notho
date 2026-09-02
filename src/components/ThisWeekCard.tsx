"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatWithSpaces } from "@/lib/formatters";
import { syncLastWeekXp } from "@/lib/lastWeekXp";

export function ThisWeekCard({
  weeklyXp,
  userId,
}: {
  weeklyXp: number;
  userId: string | null;
}) {
  const router = useRouter();
  const [lastWeekXp, setLastWeekXp] = useState(0);

  useEffect(() => {
    setLastWeekXp(syncLastWeekXp(userId, weeklyXp));
  }, [userId, weeklyXp]);

  const delta = weeklyXp - lastWeekXp;
  const hasLastWeek = lastWeekXp > 0;
  const deltaLabel = !hasLastWeek
    ? "Your first scored week"
    : delta > 0
      ? `+${formatWithSpaces(delta)} vs last week`
      : delta < 0
        ? `${formatWithSpaces(delta)} vs last week`
        : "Level with last week";

  return (
    <section
      aria-label="This week's XP"
      style={{
        maxWidth: 760,
        margin: "0 auto 16px",
        width: "100%",
        background: "linear-gradient(135deg, rgba(0,122,133,0.1) 0%, rgba(239,179,67,0.06) 100%)",
        border: "2px solid var(--color-primary)",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 4 }}>
        You vs last week
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: "var(--color-text-primary)" }}>
            {formatWithSpaces(weeklyXp)} XP
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            {deltaLabel}
            {hasLastWeek ? ` · last week ${formatWithSpaces(lastWeekXp)} XP` : ""}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push("/leaderboard")}
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          This week&apos;s learners
        </button>
      </div>
    </section>
  );
}
