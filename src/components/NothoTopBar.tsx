"use client";
// v2 - streak freeze, hearts, share
import { useState } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { NothoStreak, NothoXP, NothoFreeze, NothoHeart } from "@/components/icons/NothoIcons";
import { generateShareText } from "@/app/pageViews.types";
import { formatWithSpaces } from "@/lib/formatters";

export function NothoTopBar({
  streak,
  xp,
  hearts,
  maxHearts,
  heartsRegenInfo,
  freezeCount = 0,
  onBuyFreeze,
  onUseFreeze,
  freezeUsedToday = false,
  lessonsToday = 0,
}: {
  streak: number;
  xp: number;
  hearts: number;
  maxHearts: number;
  heartsRegenInfo?: () => { nextHeartIn: string; minutesLeft: number } | null;
  freezeCount?: number;
  onBuyFreeze?: () => void;
  onUseFreeze?: () => Promise<void>;
  freezeUsedToday?: boolean;
  lessonsToday?: number;
}) {
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const regen = heartsRegenInfo ? heartsRegenInfo() : null;

  const streakSafeToday = lessonsToday > 0;
  const flameOpacity = streakSafeToday || streak === 0 ? 1 : 0.55;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--color-bg)",
          borderBottom: "none",
        }}
      >
        {/* Streak - tap to open freeze modal */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowStreakModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Streak and freeze info"
          >
            <NothoStreak size={20} style={{ color: "#EFB343", opacity: flameOpacity }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "#EFB343", opacity: flameOpacity }}>{streak}</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              const text = generateShareText("streak", { streakDays: streak });
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
            className="text-orange-400 hover:text-orange-600 p-1"
            title="Share your streak"
            aria-label="Share your streak"
          >
            <Share2 size={18} aria-hidden />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NothoXP size={18} style={{ color: "var(--color-primary)" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-primary)" }}>{formatWithSpaces(xp)} XP</span>
        </div>

        <button
          onClick={() => hearts < maxHearts && setShowHeartsModal(true)}
          style={{
            display: "flex",
            gap: 3,
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: hearts < maxHearts ? "pointer" : "default",
            padding: 0,
          }}
          aria-label="Hearts status"
        >
          {Array.from({ length: maxHearts }).map((_, i) => (
            <NothoHeart
              key={i}
              size={18}
              filled={i < hearts}
              style={{ color: i < hearts ? "#E03C31" : "#ccc", transition: "color 0.2s" }}
            />
          ))}
        </button>
      </div>

      {/* Hearts modal */}
      {showHeartsModal && (
        <div
          onClick={() => setShowHeartsModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 300,
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
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
              {Array.from({ length: maxHearts }).map((_, i) => (
                <NothoHeart
                  key={i}
                  size={28}
                  filled={i < hearts}
                  style={{ color: i < hearts ? "#E03C31" : "#ccc" }}
                />
              ))}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              {hearts}/{maxHearts} Hearts
            </div>
            {regen ? (
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                Next heart in <strong>{regen.nextHeartIn}</strong>.
                <br />
                Hearts refill 1 per hour automatically.
              </p>
            ) : (
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>You have full hearts. Keep learning!</p>
            )}
            <button className="btn btn-primary" onClick={() => setShowHeartsModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Streak & Freeze modal */}
      {showStreakModal && (
        <div
          onClick={() => setShowStreakModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 300,
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
            {/* Streak count */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <NothoStreak size={52} style={{ color: "#FF9500" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#EFB343", marginBottom: 4 }}>
              {streak} day streak
            </div>

            {streakSafeToday ? (
              <p style={{ color: "#22C55E", fontWeight: 700, marginBottom: 20, fontSize: 14 }}>
                ✓ Lesson done today — streak is safe!
              </p>
            ) : freezeUsedToday ? (
              <p style={{ color: "#3B82F6", fontWeight: 700, marginBottom: 20, fontSize: 14 }}>
                Freeze used — streak protected today
              </p>
            ) : (
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 20, fontSize: 14 }}>
                Do a lesson today to keep your streak alive. The number only goes up after that lesson, same as Duolingo.
              </p>
            )}

            {/* Freeze count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "var(--color-bg)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
              }}
            >
              <NothoFreeze size={22} style={{ color: freezeCount > 0 ? "#3B82F6" : "#aaa" }} />
              <span style={{ fontWeight: 700, fontSize: 16, color: freezeCount > 0 ? "#3B82F6" : "var(--color-text-secondary)" }}>
                {freezeCount} {freezeCount === 1 ? "Streak Freeze" : "Streak Freezes"}
              </span>
            </div>

            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              A streak freeze protects your streak for one day you miss. Buy them with XP before you need them.
            </p>

            {/* Use freeze button - only show if freeze available, no lesson today, not already used */}
            {!streakSafeToday && !freezeUsedToday && freezeCount > 0 && onUseFreeze && (
              <button
                type="button"
                onClick={async () => {
                  setShowStreakModal(false);
                  await onUseFreeze();
                }}
                style={{
                  width: "100%",
                  background: "#3B82F6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                Use Freeze Now
              </button>
            )}

            {/* Buy freeze button */}
            {onBuyFreeze && (
              <button
                type="button"
                onClick={() => {
                  setShowStreakModal(false);
                  onBuyFreeze();
                }}
                style={{
                  width: "100%",
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                Buy Freeze - 200 XP
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => setShowStreakModal(false)}
              style={{ width: "100%" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
