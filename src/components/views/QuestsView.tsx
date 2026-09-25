"use client";

import React from "react";
import { CheckCircle2, Target, Trophy, Zap } from "lucide-react";
import type { WeeklyProgressJSON } from "@/app/pageViews.types";
import { DailyChallenges } from "@/components/DailyQuestList";
import { GoalCard } from "@/components/GoalCard";

export function QuestsView({
  dailyXP,
  dailyGoal,
  weeklyChallenge,
  weeklyProgress,
  challengeProgress,
  challengeComplete,
  challengeRewardClaimed,
  claimChallengeReward,
  streak,
  addXP,
}: {
  dailyXP: number;
  dailyGoal: number;
  weeklyChallenge?: { text: string; target: number; xp: number; id: string; unit: string };
  weeklyProgress?: WeeklyProgressJSON;
  challengeProgress?: number;
  challengeComplete?: boolean;
  challengeRewardClaimed?: boolean;
  claimChallengeReward?: () => void;
  streak: number;
  addXP?: (amount: number) => void;
}) {
  const goalPct = Math.min(100, Math.round((dailyXP / Math.max(1, dailyGoal)) * 100));

  return (
    <main>
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Goals</h2>
      <GoalCard />
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Target size={16} className="text-[var(--color-primary)]" aria-hidden />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Daily Goal</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
          {dailyXP} / {dailyGoal} XP today
        </p>
        <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${goalPct}%`, height: "100%", background: "var(--color-primary)", transition: "width 0.4s ease" }} />
        </div>
      </div>
      {weeklyChallenge && (
        <div style={{
          background: challengeComplete ? "rgba(0,122,133,0.08)" : "var(--color-surface)",
          border: `1.5px solid ${challengeComplete ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ flexShrink: 0, color: "var(--color-primary)", display: "flex" }}>
            {challengeComplete ? <Trophy size={28} /> : <Zap size={28} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)", marginBottom: 2 }}>
              Weekly Challenge
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{weeklyChallenge.text}</div>
            <div style={{ background: "var(--color-border)", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: "var(--color-primary)", width: `${Math.min(((challengeProgress || 0) / weeklyChallenge.target) * 100, 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
              {challengeProgress || 0}/{weeklyChallenge.target} · Reward: +{weeklyChallenge.xp} XP
            </div>
            {weeklyProgress && (
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: 10, marginTop: 6, lineHeight: 1.4 }}>
                {weeklyChallenge.unit === "lessons" && `${weeklyProgress.lessonsCompleted} lesson${weeklyProgress.lessonsCompleted === 1 ? "" : "s"} this week`}
                {weeklyChallenge.unit === "perfect" && `${weeklyProgress.perfectLessons} perfect lesson${weeklyProgress.perfectLessons === 1 ? "" : "s"}`}
                {weeklyChallenge.unit === "daily_xp" && `${weeklyProgress.dailyXp} XP earned today (goal ${weeklyChallenge.target})`}
                {weeklyChallenge.unit === "streak_days" && `${weeklyProgress.streakDaysThisWeek} day${weeklyProgress.streakDaysThisWeek === 1 ? "" : "s"} with lessons this week (goal: ${weeklyChallenge.target})`}
              </div>
            )}
          </div>
          {challengeComplete && !challengeRewardClaimed && (
            <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }} onClick={claimChallengeReward}>
              Claim
            </button>
          )}
          {challengeRewardClaimed && (
            <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={14} /> Claimed
            </div>
          )}
        </div>
      )}
      <DailyChallenges streak={streak} onXpClaimed={addXP} />
      </div>
    </main>
  );
}
