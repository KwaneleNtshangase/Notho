"use client";
// v2 - streak freeze, hearts, share
import { useState } from "react";
import { Share2 } from "@/components/icons/NothoIcons";
import { NothoStreak, NothoXP, NothoHeart } from "@/components/icons/NothoIcons";
import { generateShareText } from "@/app/pageViews.types";
import { streakExtendedToday } from "@/lib/dates";
import { formatWithSpaces } from "@/lib/formatters";
import { StreakFreezeBody, StreakFreezeChip } from "@/components/StreakFreezeControl";
import type { FreezePurchase } from "@/lib/streakFreeze";

export function NothoTopBar({
  streak,
  xp,
  hearts,
  maxHearts,
  heartsRegenInfo,
  freezeCount = 0,
  onBuyFreeze,
  lessonsToday = 0,
  lastActivityDate = null,
  signedIn = true,
}: {
  streak: number;
  xp: number;
  hearts: number;
  maxHearts: number;
  heartsRegenInfo?: () => { nextHeartIn: string; minutesLeft: number } | null;
  freezeCount?: number;
  onBuyFreeze?: () => Promise<FreezePurchase> | FreezePurchase;
  lessonsToday?: number;
  lastActivityDate?: string | null;
  signedIn?: boolean;
}) {
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const regen = heartsRegenInfo ? heartsRegenInfo() : null;

  const streakSafeToday = lessonsToday > 0 || streakExtendedToday(lastActivityDate);
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
          <StreakFreezeChip count={freezeCount} onClick={() => setShowStreakModal(true)} />
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
            zIndex: 400,
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
            {/* Streak count */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <NothoStreak size={52} style={{ color: "#FF9500" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#EFB343", marginBottom: 12 }}>
              {streak} day streak
            </div>
            <StreakFreezeBody
              freezeCount={freezeCount}
              xp={xp}
              lessonsToday={lessonsToday}
              streak={streak}
              signedIn={signedIn}
              onBuy={onBuyFreeze}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setShowStreakModal(false)}
              style={{ width: "100%", marginTop: 12 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
