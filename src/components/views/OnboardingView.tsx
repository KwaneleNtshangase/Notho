/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { trackBehaviorEvent, BUDGET_RELATED_COURSE_IDS } from "@/lib/behaviorTracking";
import { CONTENT_DATA } from "@/data/content";
import { DAILY_FACTS_365 } from "@/data/content-extra";
import {
  COURSE_BADGES,
  getInvestorProfile,
  INVESTOR_PROFILE_STYLES,
  INVESTOR_QUIZ_QUESTIONS,
} from "@/data/gamificationExtras";
import { CONCEPTS, getConceptIdsForCourse } from "@/data/concepts";
import {
  applyReview,
  getDueCards,
  saveMastery,
  scheduleConceptsForCourse,
} from "@/lib/spaced-repetition";
import type { MasteryRecord } from "@/lib/spaced-repetition";
import { useProgress } from "@/hooks/useProgress";
import { useUserSettings } from "@/hooks/useUserSettings";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { NothoLearn, NothoCalculate, NothoBudget, NothoGoals, NothoProgress, NothoProfile, NothoLeaderboard } from "@/components/icons/NothoIcons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart2,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Car,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Flag,
  Flame,
  GraduationCap,
  Hash,
  Heart,
  HeartOff,
  HelpCircle,
  MessageSquare,
  Home as HomeIcon,
  Info,
  KeyRound,
  Landmark,
  Lightbulb,
  Link2,
  Lock,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  Moon,
  MoreHorizontal,
  PenLine,
  PiggyBank,
  Play,
  Plus,
  RefreshCcw,
  ShoppingCart,
  Smartphone,
  Trash2,
  TrendingDown,
  Search,
  Settings as SettingsIcon,
  Share2,
  Shield,
  Siren,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Trophy,
  Tv,
  Umbrella,
  User as UserIcon,
  Wallet,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

import type { Course, Unit, Lesson, LessonStep } from "@/data/content";
import { ProfileView, LegalPage, FeedbackModal } from "@/components/ProfileView";
import { BudgetView } from "@/components/BudgetPlanner";
import { CalculatorView, CalcInputs, calcGrowth } from "@/components/CalculatorView";
import { LeaderboardView, getLeaderboardWeekKey } from "@/components/LeaderboardView";
import { StatsPanel } from "@/components/StatsPanel";
import { AuthGate } from "@/components/AuthGate";
import { ShareButton, ShareResultButton } from "@/components/ShareCard";
import { CosmoCharacter } from "@/components/CosmoCharacter";
import { NothoTopBar } from "@/components/NothoTopBar";
import {
  OnboardingTooltips,
  hasSeenOnboardingTooltips,
  markOnboardingTooltipsSeen,
} from "@/components/OnboardingTooltips";
import {
  UserData,
  Route,
  WeeklyProgressJSON,
  EMPTY_WEEKLY_PROGRESS,
  parseWeeklyChallengeStorage,
  progressNumberFromWeeklyState,
  normalizeUsername,
  validateUsername,
  isUsernameAvailable,
  getLessonTitle,
  generateShareText,
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_AGE_RANGES,
  GOAL_OPTIONS,
  GOAL_COURSE_MAP,
  BUDGET_LESSON_BRIDGE,
  playSound,
  persistUserGoalToStorageAndSupabase,
  COURSE_LEVEL_REQUIREMENTS, COURSE_COLOURS, type SavedLessonProgress,
} from "@/app/pageViews.types";
import { formatWithSpaces, formatRand, formatZAR } from "@/lib/formatters";
import { sastToday } from "@/lib/dates";
import {
  bumpCorrectAnswerStreakToday,
  markConceptReviewedToday,
  resetCorrectAnswerStreakToday,
} from "@/lib/dailyChallengeFlags";
import { useNothoState } from "@/hooks/useNothoState";
import { SettingsView } from "@/components/SettingsView";

function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_FACTS_365[dayOfYear % DAILY_FACTS_365.length];
}


export function OnboardingView({
  onComplete,
}: {
  onComplete: (payload: { goal?: string; ageRange?: string; goalDescription?: string; username: string }) => void;
}) {
  const [screen, setScreen] = React.useState(0);
  const [selectedGoal, setSelectedGoal] = React.useState("");
  const [goalDescription, setGoalDescription] = React.useState("");
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState(false);

  React.useEffect(() => {
    if (screen !== 1) return;
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

  // 2-screen onboarding: primary goal → username → first lesson. Both are
  // required so no account can reach the app with a real name exposed as a
  // leaderboard fallback or without a learning goal.
  const screenCount = 2;
  const screensMeta = [
    {
      title: "What's your money goal?",
      body: "Pick the main goal you want Notho to help you with first.",
      cta: "Next",
      action: () => { if (ageConfirmed) setScreen(1); },
    },
    {
      title: "Choose your username",
      body: "Your public name on the leaderboard. It must be unique.",
      cta: "Start learning →",
      action: () =>
        onComplete({
          goal: selectedGoal || undefined,
          goalDescription: goalDescription.trim() || undefined,
          username: normalizeUsername(username),
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
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: "var(--color-text-primary)" }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
          {current.body}
        </p>

        {screen === 0 && (
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

        {/* Age confirmation + skip - screen 0 (goal screen) */}
        {screen === 0 && (
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20,
            textAlign: "left", cursor: "pointer",
            padding: "14px 16px", borderRadius: 12,
            background: ageConfirmed ? "rgba(0,122,133,0.06)" : "var(--color-surface)",
            border: `1.5px solid ${ageConfirmed ? "var(--color-primary)" : "var(--color-border)"}`,
          }}>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              style={{ marginTop: 2, accentColor: "var(--color-primary)", width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
              I confirm I am <strong>18 or older</strong>. Notho is a financial education platform for adults.
            </span>
          </label>
        )}

        {/* Username input - screen 1 */}
        {screen === 1 && (
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
                    ? "✓ Username is available."
                    : "3–20 chars: letters, numbers, underscores."}
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }}
          onClick={current.action}
          disabled={
            (screen === 0 && (!ageConfirmed || !selectedGoal)) ||
            (screen === 1 && (!usernameAvailable || usernameChecking))
          }
        >
          {current.cta}
        </button>

        {/* Inline hint so a blocked Next never fails silently */}
        {screen === 0 && (!ageConfirmed || !selectedGoal) && (
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 600,
            color: "var(--color-text-secondary)", textAlign: "center",
          }}>
            {!selectedGoal
              ? "Choose a money goal to continue."
              : "Tick the 18-or-older confirmation above to continue."}
          </div>
        )}

        {screen > 0 && (
          <button
            type="button"
            onClick={() => setScreen((s) => s - 1)}
            style={{
              marginTop: 12, background: "none", border: "none",
              color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 14,
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
