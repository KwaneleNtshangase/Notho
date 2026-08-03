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
  ONBOARDING_AGE_RANGES,
  GOAL_OPTIONS,
  GOAL_COURSE_MAP,
  BUDGET_LESSON_BRIDGE,
  playSound,
  persistUserGoalToStorageAndSupabase,
  COURSE_LEVEL_REQUIREMENTS, COURSE_COLOURS, type SavedLessonProgress,
} from "@/app/pageViews.types";
import { DailyChallenges } from "@/components/views/LearnView";
import { formatWithSpaces, formatRand, formatZAR } from "@/lib/formatters";
import { sastToday } from "@/lib/dates";
import {
  bumpCorrectAnswerStreakToday,
  markConceptReviewedToday,
  resetCorrectAnswerStreakToday,
} from "@/lib/dailyChallengeFlags";
import { useNothoState } from "@/hooks/useNothoState";
import { SettingsView } from "@/components/SettingsView";
import { GoalCard } from "@/components/GoalCard";

function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_FACTS_365[dayOfYear % DAILY_FACTS_365.length];
}


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
    <main >
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Goals</h2>
      {/* Editable money-goal card - the "Goals" tab now owns the goal, with an
          inline picker instead of bouncing to the Learn page. */}
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

