"use client";

import { useState } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { NothoStreak, NothoHeart, NothoLevel, NothoXP, NothoFreeze } from "@/components/icons/NothoIcons";
import { formatWithSpaces } from "@/lib/formatters";
import { generateShareText, type UserData } from "@/app/pageViews.types";
import { StreakFreezeBody } from "@/components/StreakFreezeControl";
import type { FreezePurchase } from "@/lib/streakFreeze";

export function StatsPanel({
  userData,
  hearts = 5,
  maxHearts = 5,
  freezeCount = 0,
  onBuyFreeze,
  signedIn = true,
}: {
  userData: UserData;
  hearts?: number;
  maxHearts?: number;
  freezeCount?: number;
  onBuyFreeze?: () => Promise<FreezePurchase> | FreezePurchase;
  signedIn?: boolean;
}) {
  // If the user already did a lesson today their streak is already safe
  const [showFreeze, setShowFreeze] = useState(false);
  const goalProgress = Math.min(
    (userData.dailyXP / userData.dailyGoal) * 100,
    100
  );

  return (
    <aside className="stats-panel" id="statsPanel">
      <div className="stats-section">
        <h3>My Stats</h3>
        <div className="stat-item" style={{ position: "relative" }}>
          <div className="stat-icon" style={{ position: "relative" }}>
            <NothoStreak
              size={28}
              style={{
                color: userData.lessonsToday > 0 ? "#FF9500" : undefined,
                filter: userData.lessonsToday > 0 ? "none" : "grayscale(1) opacity(0.4)",
                transition: "filter 0.3s, color 0.3s",
              }}
            />
          </div>
          <div className="stat-content" style={{ flex: 1 }}>
            <div
              className="stat-label"
              style={{ color: userData.lessonsToday > 0 ? undefined : "var(--text-muted, #888)" }}
            >
              Day Streak
            </div>
            <div
              className="stat-value"
              id="streakValue"
              style={{ color: userData.lessonsToday > 0 ? undefined : "var(--text-muted, #888)" }}
            >
              {userData.streak}
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const text = generateShareText("streak", { streakDays: userData.streak });
              if (typeof navigator !== "undefined" && navigator.share) {
                try {
                  await navigator.share({ text });
                  return;
                } catch {
                  /* ignore */
                }
              }
              window.open(
                `https://wa.me/?text=${encodeURIComponent(text)}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="text-orange-400 hover:text-orange-600"
            title="Share your streak"
            aria-label="Share your streak"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}
          >
            <Share2 size={18} aria-hidden />
          </button>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <NothoXP size={28} className="text-current" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total XP</div>
            <div className="stat-value" id="xpValue">
              {formatWithSpaces(userData.xp)}
            </div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <NothoHeart size={28} className="text-current" style={{ color: "#E03C31" }} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Hearts</div>
            <div className="stat-value" id="heartsValue">
              {hearts}/{maxHearts}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="stat-item"
          onClick={() => setShowFreeze(true)}
          aria-label={`${freezeCount} of 2 streak freezes equipped`}
          style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left", color: "inherit" }}
        >
          <div className="stat-icon" style={{ color: freezeCount > 0 ? "#3B82F6" : "var(--color-text-secondary)" }}>
            <NothoFreeze size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Streak Freezes</div>
            <div className="stat-value" style={{ color: freezeCount > 0 ? "#3B82F6" : "var(--color-text-secondary)" }}>
              {freezeCount}/2
            </div>
          </div>
        </button>

        <div className="stat-item">
          <div className="stat-icon">
            <NothoLevel size={28} className="text-current" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Level</div>
            <div className="stat-value" id="levelValue">
              {userData.level}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
              {(() => {
                const levels = [
                  { min: 0, max: 499 },
                  { min: 500, max: 1499 },
                  { min: 1500, max: 2999 },
                  { min: 3000, max: 4999 },
                  { min: 5000, max: Infinity },
                ];
                const currentLevel = userData.level - 1;
                if (currentLevel < 0 || currentLevel >= levels.length) return null;
                const nextLevel = currentLevel + 1;
                if (nextLevel >= levels.length) return "Max level reached";
                const nextThreshold = levels[nextLevel].min;
                const xpNeeded = Math.max(0, nextThreshold - userData.xp);
                return `${formatWithSpaces(xpNeeded)} XP to Level ${nextLevel + 1}`;
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Daily Goal</h3>
        <div className="daily-goal-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              id="dailyGoalFill"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="progress-text" id="dailyGoalText">
            {userData.dailyXP >= userData.dailyGoal
              ? `Goal reached! ${userData.dailyXP} XP today (+${userData.dailyXP - userData.dailyGoal} extra)`
              : `${userData.dailyXP} / ${userData.dailyGoal} XP`}
          </div>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div style={{
        marginTop: "auto",
        paddingTop: 20,
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
        fontSize: 10,
        lineHeight: 1.5,
        opacity: 0.7,
        textAlign: "center",
      }}>
        Educational content only - not financial advice. Consult a licensed financial advisor before making any financial decisions.
      </div>
      {showFreeze && (
        <div
          onClick={() => setShowFreeze(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface)",
              borderRadius: 20,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 320,
              textAlign: "center",
            }}
          >
            <StreakFreezeBody
              freezeCount={freezeCount}
              xp={userData.xp}
              lessonsToday={userData.lessonsToday}
              streak={userData.streak}
              signedIn={signedIn}
              onBuy={onBuyFreeze}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowFreeze(false)}
              style={{ width: "100%", marginTop: 12 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

