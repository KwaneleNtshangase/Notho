"use client";

import React from "react";
import {
  BarChart2,
  Briefcase,
  CreditCard,
  Flag,
  GraduationCap,
  Home as HomeIcon,
  PenLine,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "@/components/icons/NothoIcons";

const ONBOARDING_GOAL_OPTIONS = [
  { id: "debt-free", label: "Get debt-free", Icon: CreditCard },
  { id: "emergency", label: "Build emergency fund", Icon: Shield },
  { id: "invest", label: "Start investing", Icon: TrendingUp },
  { id: "home", label: "Save for a home", Icon: HomeIcon },
  { id: "retire", label: "Plan for retirement", Icon: Flag },
  { id: "business", label: "Grow my business", Icon: Briefcase },
  { id: "other", label: "Something else", Icon: PenLine },
] as const;

const ONBOARDING_AGE_RANGES = [
  { id: "18-25", label: "18–25", Icon: GraduationCap },
  { id: "26-35", label: "26–35", Icon: Briefcase },
  { id: "36-45", label: "36–45", Icon: HomeIcon },
  { id: "46-55", label: "46–55", Icon: BarChart2 },
  { id: "56+", label: "56+", Icon: Flag },
] as const;

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: (payload: { goal?: string; ageRange?: string; goalDescription?: string }) => void;
}) {
  const [screen, setScreen] = React.useState(0);
  const [selectedGoal, setSelectedGoal] = React.useState("");
  const [selectedAgeRange, setSelectedAgeRange] = React.useState("");
  const [goalDescription, setGoalDescription] = React.useState("");
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [consentPrivacy, setConsentPrivacy] = React.useState(false);
  const [consentTerms, setConsentTerms] = React.useState(false);

  const screenCount = 4;
  const screensMeta = [
    {
      title: "Notho is for how money works in South Africa",
      body: "Lessons are short. Topics match what you actually deal with: payslips, bank fees, debit orders, tax.",
      cta: "Continue",
      action: () => {
        if (ageConfirmed && consentPrivacy && consentTerms) {
          setScreen(1);
        }
      },
    },
    {
      title: "What are you working on?",
      body: "This only changes which courses we put first. You can skip it.",
      cta: "Next",
      action: () => {
        if (selectedGoal) setScreen(2);
      },
    },
    {
      title: "Age range",
      body: "Used so examples match your stage. Skip if you would rather not say.",
      cta: "Next",
      action: () => {
        setScreen(3);
      },
    },
    {
      title: "Lessons take a few minutes",
      body: "Finish a lesson, earn XP. Come back tomorrow and the streak counter moves. That is the whole loop.",
      cta: "Open the first course",
      action: () =>
        onComplete({
          goal: selectedGoal || undefined,
          ageRange: selectedAgeRange || undefined,
          goalDescription: goalDescription.trim() || undefined,
        }),
    },
  ];

  const current = screensMeta[screen];

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "32px 24px",
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
        {Array.from({ length: screenCount }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === screen ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === screen ? "var(--color-primary)" : "var(--color-border)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        {screen === 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Flag size={64} strokeWidth={1.5} style={{ color: "var(--color-primary)" }} aria-hidden />
          </div>
        )}
        {null}

        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: "var(--color-text-primary)" }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          {current.body}
        </p>

        {screen === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <label
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                textAlign: "left", cursor: "pointer",
                padding: "14px 16px", borderRadius: 12,
                background: ageConfirmed ? "rgba(0,122,133,0.06)" : "var(--color-surface)",
                border: `1.5px solid ${ageConfirmed ? "var(--color-primary)" : "var(--color-border)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                aria-label="Confirm I am 18 years or older"
                style={{ marginTop: 2, accentColor: "var(--color-primary)", width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                I confirm that I am <strong>18 years of age or older</strong>. Notho is a financial education platform intended for adults.
              </span>
            </label>

            <label
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                textAlign: "left", cursor: "pointer",
                padding: "14px 16px", borderRadius: 12,
                background: consentPrivacy ? "rgba(0,122,133,0.06)" : "var(--color-surface)",
                border: `1.5px solid ${consentPrivacy ? "var(--color-primary)" : "var(--color-border)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={(e) => setConsentPrivacy(e.target.checked)}
                aria-label="I have read and agree to the Privacy Policy"
                style={{ marginTop: 2, accentColor: "var(--color-primary)", width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                I have read and agree to the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                >
                  Privacy Policy
                </a>
                . I understand Notho processes my personal information under POPIA to provide my learning experience.
              </span>
            </label>

            <label
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                textAlign: "left", cursor: "pointer",
                padding: "14px 16px", borderRadius: 12,
                background: consentTerms ? "rgba(0,122,133,0.06)" : "var(--color-surface)",
                border: `1.5px solid ${consentTerms ? "var(--color-primary)" : "var(--color-border)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                aria-label="I agree to the Terms of Service"
                style={{ marginTop: 2, accentColor: "var(--color-primary)", width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                I agree to the Notho{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                >
                  Terms of Service
                </a>
                . I understand that lessons here are <strong>educational only</strong> and not personal financial advice.
              </span>
            </label>
          </div>
        )}

        {screen === 1 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, textAlign: "left" }}>
              {ONBOARDING_GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(g.id);
                    if (g.id !== "other") setGoalDescription("");
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `2px solid ${selectedGoal === g.id ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: selectedGoal === g.id ? "rgba(0,122,133,0.08)" : "var(--color-surface)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                    transition: "all 0.15s",
                  }}
                >
                  <g.Icon size={18} className="shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                  {g.label}
                </button>
              ))}
            </div>
            {selectedGoal === "other" && (
              <textarea
                placeholder="Describe your goal - e.g. save for my child's education"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "2px solid var(--color-primary)",
                  fontSize: 13,
                  resize: "vertical",
                  marginBottom: 12,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                }}
              />
            )}
            {selectedGoal && selectedGoal !== "other" && (
              <textarea
                placeholder="Anything more to say about this goal? (optional)"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  fontSize: 13,
                  resize: "vertical",
                  marginBottom: 12,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                }}
              />
            )}
          </>
        )}

        {screen === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, textAlign: "left" }}>
            {ONBOARDING_AGE_RANGES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAgeRange(a.id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: `2px solid ${selectedAgeRange === a.id ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: selectedAgeRange === a.id ? "rgba(0,122,133,0.08)" : "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                  transition: "all 0.15s",
                }}
              >
                <a.Icon size={18} className="shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                {a.label}
              </button>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }}
          onClick={current.action}
          disabled={
            (screen === 0 && (!ageConfirmed || !consentPrivacy || !consentTerms)) ||
            (screen === 1 && (!selectedGoal || (selectedGoal === "other" && !goalDescription.trim())))
          }
        >
          {current.cta}
        </button>

        {screen === 1 && (
          <button
            type="button"
            onClick={() => setScreen(2)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: 14,
              width: "100%",
            }}
          >
            Skip
          </button>
        )}

        {screen === 2 && (
          <button
            type="button"
            onClick={() => setScreen(3)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: 14,
              width: "100%",
            }}
          >
            Skip
          </button>
        )}

        {screen > 0 && (
          <button
            type="button"
            onClick={() => setScreen((s) => s - 1)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
