"use client";
import { LocalizedText as I18nText } from "@/i18n/LocalizedText";

import { useState } from "react";
import { NothoStreak, NothoXP } from "@/components/icons/NothoIcons";

const SLIDES = [
  {
    emoji: null,
    icon: (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <NothoXP size={36} style={{ color: "var(--color-primary)" }} />
      </div>
    ),
    title: "What is XP?",
    body: "Every question you answer earns you XP (experience points). The more you earn, the higher your level. Higher levels unlock advanced courses on tax, investing, and running a business.",
    tip: "Level 1 → 5 each unlock a new advanced course.",
  },
  {
    emoji: null,
    icon: (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(239,179,67,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <NothoStreak size={36} style={{ color: "#EFB343" }} />
      </div>
    ),
    title: "What's a streak?",
    body: "Your streak counts how many days in a row you've completed at least one lesson. Daily practice, even short sessions, beats cramming every time. Miss a day and it resets to zero.",
    tip: "Miss a day and the streak resets. Even 5 minutes counts.",
  },
  {
    emoji: null,
    icon: (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(224,60,49,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="#E03C31"
          stroke="#E03C31"
          strokeWidth="1.5"
          width="36"
          height="36"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    ),
    title: "What are hearts for?",
    body: "You start with 5 hearts. A wrong answer costs one. If you run out, take a break: hearts refill on their own, one per hour. Think of them as a nudge to slow down before you tap.",
    tip: "All 5 hearts refill within 5 hours. No purchase needed.",
  },
];

const TOOLTIP_KEY = "notho-tooltips-v1-seen";

export function hasSeenOnboardingTooltips(): boolean {
  if (typeof window === "undefined") return true;
  return !!localStorage.getItem(TOOLTIP_KEY);
}

export function markOnboardingTooltipsSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOOLTIP_KEY, "1");
}

export function OnboardingTooltips({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  const handleNext = () => {
    if (isLast) {
      markOnboardingTooltipsSeen();
      onDone();
    } else {
      setSlide((s) => s + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingTooltipsSeen();
    onDone();
  };

  return (
    /* Full-screen backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.55)",
        padding: "0 0 env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Bottom sheet */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--color-surface)",
          borderRadius: "24px 24px 0 0",
          padding: "32px 28px 36px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "var(--color-border)",
            margin: "0 auto 28px",
          }}
        />

        {/* Icon */}
        <I18nText>{current.icon}</I18nText>

        {/* Title */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            textAlign: "center",
            color: "var(--color-text-primary)",
            marginBottom: 12,
          }}
        >
          <I18nText>{current.title}</I18nText>
        </h2>

        {/* Body */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: 16,
          }}
        >
          <I18nText>{current.body}</I18nText>
        </p>

        {/* Tip chip */}
        <div
          style={{
            background: "var(--color-bg)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            color: "var(--color-text-secondary)",
            textAlign: "center",
            marginBottom: 28,
            fontStyle: "italic",
          }}
        >
          <I18nText>{current.tip}</I18nText>
        </div>

        {/* Dot pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  i === slide
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          type="button"
          onClick={handleNext}
          className="btn btn-primary"
          style={{ width: "100%", fontSize: 16, padding: "14px 0", borderRadius: 12 }}
        >
          <I18nText>{isLast ? "Got it, let's go" : "Next"}</I18nText>
        </button>

        {/* Skip link */}
        {!isLast && (
          <button
            type="button"
            onClick={handleSkip}
            style={{
              display: "block",
              width: "100%",
              marginTop: 14,
              fontSize: 14,
              color: "var(--color-text-secondary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "center",
            }}
          ><I18nText source={"Skip intro"} /></button>
        )}
      </div>
    </div>
  );
}
