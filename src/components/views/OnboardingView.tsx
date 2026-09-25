/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React from "react";
import {
  normalizeUsername,
  validateUsername,
  isUsernameAvailable,
  ONBOARDING_GOAL_OPTIONS,
} from "@/app/pageViews.types";

export function OnboardingView({
  onComplete,
}: {
  onComplete: (payload: {
    goal?: string;
    goals?: string[];
    ageRange?: string;
    goalDescription?: string;
    username: string;
  }) => void;
}) {
  const [screen, setScreen] = React.useState(0);
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const [goalDescription, setGoalDescription] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState(false);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      if (!next.includes("other")) setGoalDescription("");
      return next;
    });
  };

  React.useEffect(() => {
    if (screen !== 0) return;
    const normalized = normalizeUsername(username);
    if (!normalized) {
      setUsernameError("Username is required.");
      setUsernameAvailable(false);
      return;
    }
    const formatError = validateUsername(normalized);
    if (formatError) {
      setUsernameError(formatError);
      setUsernameAvailable(false);
      return;
    }
    let active = true;
    setUsernameChecking(true);
    const timer = setTimeout(() => {
      isUsernameAvailable(normalized)
        .then((available) => {
          if (!active) return;
          setUsernameAvailable(available);
          setUsernameError(available ? null : "That username is already taken.");
        })
        .finally(() => {
          if (!active) return;
          setUsernameChecking(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [screen, username]);

  const otherNeedsText = selectedGoals.includes("other") && !goalDescription.trim();

  const finish = () => {
    if (!usernameAvailable || usernameChecking) return;
    if (otherNeedsText) return;
    onComplete({
      goal: selectedGoals[0],
      goals: selectedGoals,
      goalDescription: goalDescription.trim() || undefined,
      username: normalizeUsername(username),
    });
  };

  const screensMeta = [
    {
      title: "Choose your username",
      body: "Required. This is your public name — you cannot skip it.",
      cta: "Next",
      action: () => {
        if (usernameAvailable && !usernameChecking) setScreen(1);
      },
    },
    {
      title: "What are you working toward?",
      body: "Optional. Pick one or more money goals, or skip and set this later on the Goals tab.",
      cta: selectedGoals.length > 0 ? "Start learning \u2192" : "Skip for now",
      action: finish,
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
        {Array.from({ length: 2 }).map((_, i) => (
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
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: "var(--color-text-primary)" }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          {current.body}
        </p>

        {screen === 0 && (
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="e.g. notho_learner"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `2px solid ${usernameError ? "var(--color-danger)" : usernameAvailable ? "var(--color-primary)" : "var(--color-border)"}`,
                fontSize: 14,
                boxSizing: "border-box",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            />
            <div style={{ minHeight: 20, marginTop: 6, fontSize: 12, color: usernameError ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
              {usernameChecking
                ? "Checking availability..."
                : usernameError
                  ? usernameError
                  : usernameAvailable
                    ? "Username is available."
                    : "3–20 chars: letters, numbers, underscores."}
            </div>
          </div>
        )}

        {screen === 1 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, textAlign: "left" }}>
              {ONBOARDING_GOAL_OPTIONS.map((g) => {
                const selected = selectedGoals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: selected ? "rgba(0,122,133,0.08)" : "var(--color-surface)",
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
                );
              })}
            </div>
            {selectedGoals.includes("other") && (
              <textarea
                placeholder="Write your goal — e.g. save for my child's education"
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
          </>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }}
          onClick={current.action}
          disabled={
            (screen === 0 && (!usernameAvailable || usernameChecking)) ||
            (screen === 1 && otherNeedsText)
          }
        >
          {current.cta}
        </button>

        {screen === 1 && selectedGoals.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedGoals([]);
              setGoalDescription("");
              onComplete({
                username: normalizeUsername(username),
              });
            }}
            style={{
              marginTop: 12, background: "none", border: "none",
              color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 14, width: "100%",
            }}
          >
            Skip for now
          </button>
        )}

        {screen === 1 && otherNeedsText && (
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 600,
            color: "var(--color-text-secondary)", textAlign: "center",
          }}>
            Write down that goal, or skip for now.
          </div>
        )}

        {screen > 0 && (
          <button
            type="button"
            onClick={() => setScreen(0)}
            style={{
              marginTop: 12, background: "none", border: "none",
              color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 14,
            }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
