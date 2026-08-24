/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { trackBehaviorEvent, BUDGET_RELATED_COURSE_IDS } from "@/lib/behaviorTracking";
import { buildSearchIndex, fuzzySearch, getSuggestion } from "@/lib/fuzzySearch";
import { CONTENT_DATA } from "@/data/content";
import { DAILY_FACTS_365 } from "@/data/content-extra";
import {
  COURSE_BADGES,
  getInvestorProfile,
  INVESTOR_PROFILE_STYLES,
  INVESTOR_QUIZ_QUESTIONS,
} from "@/data/gamificationExtras";
import { CONCEPTS, getConceptIdsForCourse } from "@/data/concepts";
import { hashSeed, seededPermutation } from "@/lib/lessonShuffle";
import {
  applyReview,
  getDueCards,
  saveMastery,
  scheduleConceptsForCourse,
} from "@/lib/spaced-repetition";
import type { MasteryRecord } from "@/lib/spaced-repetition";
import { useProgress } from "@/hooks/useProgress";
import { useUserSettings } from "@/hooks/useUserSettings";
import { usePinnedCourses } from "@/hooks/usePinnedCourses";
import { groupCourses } from "@/lib/pinnedCourses";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon,
  MoreHorizontal,
  PenLine,
  PiggyBank,
  Pin,
  PinOff,
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
  resetCorrectAnswerStreakToday,
} from "@/lib/dailyChallengeFlags";
import { useNothoState } from "@/hooks/useNothoState";
import { useReviewCompletion, NOT_COUNTED, type ReviewOutcome } from "@/hooks/useReviewCompletion";
import { SettingsView } from "@/components/SettingsView";

function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_FACTS_365[dayOfYear % DAILY_FACTS_365.length];
}



export function CourseIcon({ name, size = 48 }: { name: string; size?: number }) {
  const props = { size, className: "text-current" };
  switch (name) {
    case "wallet":
      return <Wallet {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "building-2":
      return <Building2 {...props} />;
    case "credit-card":
      return <CreditCard {...props} />;
    case "shield":
      return <Shield {...props} />;
    case "umbrella":
      return <Umbrella {...props} />;
    case "trending-up":
      return <TrendingUp {...props} />;
    case "flag":
      return <Flag {...props} />;
    case "home":
      return <HomeIcon {...props} />;
    case "file-text":
      return <FileText {...props} />;
    case "siren":
      return <Siren {...props} />;
    case "brain":
      return <Brain {...props} />;
    case "book-open":
      return <BookOpen {...props} />;
    default:
      return <Wallet {...props} />;
  }
}


const SECTION_HEADER_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-text-secondary)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

/**
 * Header row inside the course grid: "Pinned", "All courses", "Advanced
 * courses", "Completed". Pass `onToggle` to make it a collapse control;
 * without it the header is static. `note` only shows while collapsed, so an
 * explanation doesn't take up space once the section is open.
 */
function CourseSectionHeader({
  icon,
  label,
  count,
  note,
  open,
  onToggle,
}: {
  icon?: ReactNode;
  label: string;
  count?: number;
  note?: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  const inner = (
    <>
      {icon}
      <span>
        {label}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
      {onToggle && (
        <ChevronDown
          size={15}
          aria-hidden
          style={{
            marginLeft: "auto",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      )}
    </>
  );

  return (
    <div className="courses-grid-heading">
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          style={{
            ...SECTION_HEADER_STYLE,
            width: "100%",
            background: "transparent",
            border: "none",
            padding: "4px 0",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {inner}
        </button>
      ) : (
        <div style={SECTION_HEADER_STYLE}>{inner}</div>
      )}
      {note && !open && (
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
          {note}
        </div>
      )}
    </div>
  );
}

const CourseCardSkeleton = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
  </div>
);


// ─── Daily Challenges ────────────────────────────────────────────────────────

const DAILY_CHALLENGE_POOL = [
  { id: "complete-lesson",    text: "Complete a lesson",                     icon: <BookOpen size={16} />,    xp: 15 },
  { id: "log-expense",        text: "Log an expense",                        icon: <CreditCard size={16} />,  xp: 10 },
  { id: "check-budget",       text: "Open the Budget Planner",               icon: <Wallet size={16} />,      xp: 10 },
  { id: "earn-50xp",          text: "Earn 50 XP today",                      icon: <Zap size={16} />,         xp: 20 },
  { id: "perfect-quiz",       text: "Get a perfect quiz score",              icon: <Trophy size={16} />,      xp: 25 },
  { id: "complete-2-lessons", text: "Finish 2 lessons today",                icon: <BookOpen size={16} />,    xp: 20 },
  { id: "use-calculator",     text: "Run a scenario in the Calculator",      icon: <Calculator size={16} />,  xp: 15 },
  { id: "visit-budget",       text: "Review your spending categories",       icon: <Target size={16} />,      xp: 10 },
  { id: "earn-100xp",         text: "Earn 100 XP in a single session",       icon: <Sparkles size={16} />,   xp: 30 },
  { id: "no-wrong-answers",   text: "Answer 5 questions without a mistake",  icon: <Flame size={16} />,       xp: 25 },
  { id: "complete-3-lessons", text: "Complete 3 lessons today",              icon: <TrendingUp size={16} />,  xp: 30 },
  { id: "log-2-expenses",     text: "Log 2 expenses today",                  icon: <PiggyBank size={16} />,   xp: 15 },
  { id: "concept-review",     text: "Review a flashcard concept",            icon: <Brain size={16} />,       xp: 10 },
  { id: "share-milestone",    text: "Share your progress with someone",      icon: <Share2 size={16} />,      xp: 15 },
  { id: "earn-75xp",          text: "Earn 75 XP today",                      icon: <Zap size={16} />,         xp: 25 },
];

export function getDailyChallenges(): typeof DAILY_CHALLENGE_POOL {
  // Deterministic daily selection - different every day, same for all users on same day
  const today = sastToday();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
  seed = Math.abs(seed);

  // Fisher-Yates shuffle driven by a Linear Congruential Generator seeded on the date
  const shuffled = [...DAILY_CHALLENGE_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export function DailyChallenges({ streak = 0, onXpClaimed }: { streak?: number; onXpClaimed?: (amount: number) => void }) {
  const today = sastToday();
  const storageKey = `notho-daily-challenges-${today}`;
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [conditions, setConditions] = useState<Record<string, boolean>>({});
  const challenges = React.useMemo(() => getDailyChallenges(), []);

  // Reload conditions every 5 seconds so UI updates as user completes actions
  const refreshConditions = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const dailyLessons = parseInt(localStorage.getItem(`notho-daily-lessons-${today}`) ?? "0");
    const dailyXp      = parseInt(localStorage.getItem(`notho-daily-xp-${today}`) ?? "0");
    const dailyExpense = parseInt(localStorage.getItem(`notho-expense-today-${today}`) ?? "0");
    setConditions({
      "complete-lesson":    dailyLessons >= 1,
      "log-expense":        dailyExpense >= 1,
      "check-budget":       localStorage.getItem(`notho-budget-visited-${today}`) === "1",
      "earn-50xp":          dailyXp >= 50,
      "earn-75xp":          dailyXp >= 75,
      "earn-100xp":         dailyXp >= 100,
      "perfect-quiz":       parseInt(localStorage.getItem(`notho-perfect-today-${today}`) ?? "0") >= 1,
      "complete-2-lessons": dailyLessons >= 2,
      "complete-3-lessons": dailyLessons >= 3,
      "use-calculator":     localStorage.getItem(`notho-calc-visited-${today}`) === "1",
      "visit-budget":       localStorage.getItem(`notho-budget-visited-${today}`) === "1",
      "log-2-expenses":     dailyExpense >= 2,
      "concept-review":     localStorage.getItem(`notho-concept-reviewed-${today}`) === "1",
      "share-milestone":    localStorage.getItem(`notho-shared-today-${today}`) === "1",
      "no-wrong-answers":   parseInt(localStorage.getItem(`notho-correct-streak-today-${today}`) ?? "0") >= 5,
    });
  }, [today, streak]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      setClaimed(saved);
    } catch { /* ignore */ }
    refreshConditions();

    // Also load from Supabase to sync across devices
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("user_progress").select("daily_challenges_date, daily_challenges_claimed").eq("user_id", user.id).single();
          if (data && data.daily_challenges_date === today && data.daily_challenges_claimed) {
            try {
              const claimedFromDb = JSON.parse(typeof data.daily_challenges_claimed === 'string' ? data.daily_challenges_claimed : JSON.stringify(data.daily_challenges_claimed));
              setClaimed(c => ({ ...c, ...claimedFromDb }));
              localStorage.setItem(storageKey, JSON.stringify({ ...JSON.parse(localStorage.getItem(storageKey) ?? "{}"), ...claimedFromDb }));
            } catch { /* ignore parse error */ }
          }
        }
      } catch { /* ignore Supabase error */ }
    })();
  }, [storageKey, refreshConditions]);

  useEffect(() => {
    const timer = setInterval(refreshConditions, 5000);
    return () => clearInterval(timer);
  }, [refreshConditions]);

  const claimChallenge = async (challengeId: string, xp: number) => {
    if (!conditions[challengeId]) return; // Guard: only claim if actually achieved
    const next = { ...claimed, [challengeId]: true };
    setClaimed(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    analytics.dailyChallengeClaimed(challengeId, xp);

    // Update local weekly XP state so leaderboard reflects this immediately
    onXpClaimed?.(xp);

    // Persist claim state only - onXpClaimed → addXP already updates xp + weekly_xp in DB.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_progress").update({
        daily_challenges_date: today,
        daily_challenges_claimed: JSON.stringify(next),
      }).eq("user_id", user.id);
    }
  };

  const allClaimed = challenges.every((c) => claimed[c.id]);

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Sparkles size={18} style={{ color: "#EFB343" }} />
        <div style={{ fontWeight: 800, fontSize: 14 }}>Daily Challenges</div>
        {allClaimed && <span style={{ fontSize: 11, fontWeight: 700, color: "#007A85", marginLeft: "auto" }}>All done!</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {challenges.map((ch) => {
          const done = !!claimed[ch.id];
          const achieved = !!conditions[ch.id];
          return (
            <div key={ch.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 10,
              background: done ? "rgba(0,122,133,0.06)" : achieved ? "rgba(239,179,67,0.04)" : "var(--color-bg)",
              border: `1px solid ${done ? "rgba(0,122,133,0.2)" : achieved ? "rgba(239,179,67,0.3)" : "var(--color-border)"}`,
              opacity: done ? 1 : achieved ? 1 : 0.65,
            }}>
              <div style={{ color: done ? "#007A85" : achieved ? "#EFB343" : "var(--color-text-secondary)", display: "flex", flexShrink: 0 }}>
                {done ? <CheckCircle2 size={16} /> : ch.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: done ? "#007A85" : "var(--color-text-primary)", textDecoration: done ? "line-through" : "none" }}>
                  {ch.text}
                </div>
                {!done && !achieved && (
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>
                    Complete the task first
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: done ? "#007A85" : achieved ? "#EFB343" : "var(--color-text-secondary)", flexShrink: 0 }}>
                {done ? "Done" : `+${ch.xp} XP`}
              </div>
              {!done && achieved && (
                <button type="button" onClick={() => claimChallenge(ch.id, ch.xp)}
                  style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  Claim
                </button>
              )}
              {!done && !achieved && (
                <Lock size={13} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 10, textAlign: "center" }}>
        Resets at midnight · Complete each task to unlock its reward
      </div>
    </div>
  );
}

// ── Spaced Repetition Review Session ─────────────────────────────────────────

export function ReviewSession({ onClose }: { onClose: () => void }) {
  const [queue, setQueue] = useState<MasteryRecord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [outcome, setOutcome] = useState<ReviewOutcome>(NOT_COUNTED);
  const completedRef = useRef(false);
  const completeReview = useReviewCompletion();
  const REVIEW_SESSION_KEY = "notho-review-session";

  useEffect(() => {
    void (async () => {
      setLoading(true);
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(REVIEW_SESSION_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              queue: MasteryRecord[];
              currentIdx: number;
              selected: number | null;
              showExplanation: boolean;
              correctCount: number;
            };
            if (parsed.queue?.length > 0 && parsed.currentIdx < parsed.queue.length) {
              setQueue(parsed.queue);
              setCurrentIdx(parsed.currentIdx);
              setSelected(parsed.selected);
              setShowExplanation(parsed.showExplanation);
              setCorrectCount(parsed.correctCount);
              setHasLoaded(true);
              setLoading(false);
              return;
            }
          } catch {
            // Ignore corrupted local state and continue with fresh due cards.
          }
        }
      }
      const dueCards = await getDueCards();
      setQueue(dueCards);
      setHasLoaded(true);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasLoaded || queue.length === 0 || currentIdx >= queue.length) return;
    localStorage.setItem(
      REVIEW_SESSION_KEY,
      JSON.stringify({ queue, currentIdx, selected, showExplanation, correctCount })
    );
  }, [queue, currentIdx, selected, showExplanation, correctCount, hasLoaded]);

  const current = queue[currentIdx];
  const concept = current ? CONCEPTS.find((c) => c.id === current.concept_id) : null;

  // Shuffle the four review-card options per concept (seeded, so it's stable
  // across a resumed session) and remap the correct index — review cards don't
  // go through the lesson option-shuffle, so without this the correct answer
  // would always sit in its authored position.
  const shuffled = useMemo(() => {
    if (!concept) return null;
    const perm = seededPermutation(
      concept.reviewCard.options.length,
      hashSeed(`review:${concept.id}`)
    );
    return {
      options: perm.map((oldIdx) => concept.reviewCard.options[oldIdx]),
      correct: perm.indexOf(concept.reviewCard.correct),
    };
  }, [concept]);
  const correctIdx = shuffled ? shuffled.correct : -1;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const isCorrect = idx === correctIdx;
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      playSound("correct");
    } else {
      playSound("incorrect");
    }
  };

  const handleNext = () => {
    if (!current || !concept) return;
    const isCorrect = selected === correctIdx;
    const updated = applyReview(current, isCorrect ? 4 : 1);
    saveMastery(updated);
    if (currentIdx + 1 >= queue.length) {
      // ── Review-complete handler ────────────────────────────────────────
      // Reviews used to end here having awarded nothing. A finished session
      // now takes the same path a lesson does — /api/progress/sync-streak for
      // the streak, plus lessonsToday and the daily-challenge counters — when
      // it is long enough to count. Ref-guarded so credit applies once.
      if (!completedRef.current) {
        completedRef.current = true;
        setOutcome(completeReview({ cards: queue.length, correct: correctCount }));
      }
      // All done - go to summary by setting currentIdx beyond queue
      setCurrentIdx(queue.length);
    } else {
      setSelected(null);
      setShowExplanation(false);
      setCurrentIdx((i) => i + 1);
    }
  };

  const isDone = !loading && hasLoaded && queue.length > 0 && currentIdx >= queue.length;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-2xl">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Loading review...</p>
        </div>
      </div>
    );
  }

  if (hasLoaded && queue.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Nothing due for review. Come back tomorrow to keep your streak strong.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  if (isDone) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REVIEW_SESSION_KEY);
      // markConceptReviewedToday() now happens in the review-complete
      // handler above, alongside the rest of the credit.
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-2xl">
          <Brain size={52} className="mx-auto mb-3" style={{ color: "#3B7DD8" }} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Review complete!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {correctCount} of {queue.length} correct
          </p>
          {outcome.counted && outcome.xpAwarded > 0 && (
            <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-4">
              +{outcome.xpAwarded} XP · Streak kept
            </p>
          )}
          {outcome.counted && outcome.alreadyCountedToday && (
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              Streak kept · today&apos;s review was already counted
            </p>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((correctCount / queue.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            {outcome.counted
              ? "Cards are rescheduled. Keep it up daily to master your finances!"
              : `Cards are rescheduled. ${outcome.cardsRequired} cards in one session keep your streak going — this one was ${queue.length}.`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!concept) {
    onClose();
    return null;
  }

  const card = concept.reviewCard;
  const displayOptions = shuffled ? shuffled.options : card.options;
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top pb-3 pt-4 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close review"
        >
          <X size={20} />
        </button>
        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-purple-500 transition-all"
              style={{ width: `${Math.round(((currentIdx) / queue.length) * 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
          {currentIdx + 1} / {queue.length}
        </span>
      </div>

      {/* Card content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-1 flex items-center gap-1.5">
          <Brain size={13} className="text-purple-500" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">
            {concept.category}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-snug">
          {card.question}
        </h2>

        <div className="space-y-3">
          {displayOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === correctIdx;
            let bg = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white";
            if (selected !== null) {
              if (isCorrect) bg = "bg-green-50 dark:bg-green-900/30 border-green-400 text-green-900 dark:text-green-200";
              else if (isSelected) bg = "bg-red-50 dark:bg-red-900/30 border-red-400 text-red-900 dark:text-red-200";
              else bg = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={selected !== null}
                onClick={() => handleAnswer(i)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${bg}`}
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500">
                  {optionLetters[i]}
                </span>
                <span className="text-sm font-medium">{opt}</span>
                {selected !== null && isCorrect && (
                  <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" aria-hidden />
                )}
                {isSelected && !isCorrect && (
                  <X size={16} className="ml-auto text-red-500 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`mt-5 rounded-xl p-4 ${selected === correctIdx ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"}`}>
            <p className={`text-xs font-bold mb-1 ${selected === correctIdx ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}>
              {selected === correctIdx ? "✓ Correct!" : "Not quite"}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {card.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {selected !== null && (
        <div className="px-4 pb-safe-bottom pb-6 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-xl bg-purple-600 py-3.5 text-sm font-bold text-white"
          >
            {currentIdx + 1 >= queue.length ? "See Results" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

export function LearnView({
  courses,
  isLessonCompleted,
  goToCourse,
  contentLoaded = true,
  savedProgress,
  onResumeLesson,
  userLevel = 1,
  userXP = 0,
}: {
  courses: Course[];
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  goToCourse: (courseId: string) => void;
  contentLoaded?: boolean;
  savedProgress?: SavedLessonProgress | null;
  onResumeLesson?: (p: SavedLessonProgress) => void;
  /** Current user level (Math.floor(xp/500)+1). Used to show course lock gates. */
  userLevel?: number;
  /** Current total XP. Used to show how much XP is still needed to unlock gated courses. */
  userXP?: number;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [pickerGoalId, setPickerGoalId] = useState<string>("");
  const [pickerGoalDescription, setPickerGoalDescription] = useState<string>("");
  const [showReview, setShowReview] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const { pinned, isPinned, togglePin } = usePinnedCourses();
  // Finished courses live in a collapsed section at the bottom — they're the
  // least likely thing you came here to tap.
  const [showCompleted, setShowCompleted] = useState(false);
  // null = follow the default (collapsed while every advanced course is still
  // XP-locked, open once you've unlocked one). A tap pins it either way.
  const [advancedOpen, setAdvancedOpen] = useState<boolean | null>(null);

  // Debounce search input for performance (150ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  // Build the search index once from courses + concept tags
  const searchIndex = useMemo(
    () => buildSearchIndex(courses, CONCEPTS),
    [courses]
  );

  // Refresh due count on mount and when returning from a review
  useEffect(() => {
    void getDueCards().then((cards) => setDueCount(cards.length));
  }, [showReview]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUserGoal(localStorage.getItem("notho-user-goal"));
    setGoalDescription(localStorage.getItem("notho-goal-description") ?? "");
    // Listen for cross-device goal sync updates (dispatched by syncFromSupabase)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "notho-user-goal" && e.newValue) setUserGoal(e.newValue);
      if (e.key === "notho-goal-description") setGoalDescription(e.newValue ?? "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recommendedCourseIds =
    userGoal && GOAL_COURSE_MAP[userGoal] ? GOAL_COURSE_MAP[userGoal] : [];

  // Fuzzy search: weighted, ranked results across title, concept tags, and description
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return null;
    return fuzzySearch(debouncedSearch, searchIndex);
  }, [debouncedSearch, searchIndex]);

  // "Did you mean?" suggestion when results are empty
  const suggestion = useMemo(() => {
    if (!searchResults || searchResults.length > 0) return null;
    return getSuggestion(debouncedSearch, searchIndex);
  }, [searchResults, debouncedSearch, searchIndex]);

  const filteredCourses = searchResults
    ? searchResults
        .map(r => courses.find(c => c.id === r.courseId)!)
        .filter(Boolean)
    : courses;

  // Lesson counts drive both the card's progress bar and the completed/active
  // split, so they're computed in one place.
  const courseCompletion = React.useCallback(
    (course: Course) => {
      const total = course.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
      const completed = course.units.reduce(
        (sum, unit) =>
          sum + unit.lessons.filter((l) => isLessonCompleted(course.id, l.id)).length,
        0
      );
      return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        // A course with unwritten ("coming soon") lessons can never reach 100%,
        // so it correctly stays in the active list.
        isComplete: total > 0 && completed >= total,
      };
    },
    [isLessonCompleted]
  );

  return (
    <main id="mainContent">
      {savedProgress && onResumeLesson && (
        <button
          type="button"
          onClick={() => onResumeLesson(savedProgress)}
          className="w-full flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-4 text-left"
        >
          <Play size={28} className="shrink-0 text-blue-600 dark:text-blue-400" fill="currentColor" aria-hidden />
          <div>
            <p className="text-blue-800 dark:text-blue-300 font-bold text-sm">
              Continue where you left off
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">
              {savedProgress.lessonTitle || "Resume lesson"}
            </p>
          </div>
          <span className="ml-auto text-blue-400" aria-hidden>
            →
          </span>
        </button>
      )}

      {/* Spaced Repetition Review Banner */}
      {dueCount > 0 && (
        <button
          type="button"
          onClick={() => setShowReview(true)}
          className="w-full flex items-center gap-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 mb-4 text-left"
        >
          <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
            <Brain size={20} className="text-purple-600 dark:text-purple-300" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-purple-900 dark:text-purple-200 font-bold text-sm">
              {dueCount} concept{dueCount > 1 ? "s" : ""} to review
            </p>
            <p className="text-purple-600 dark:text-purple-400 text-xs">
              Quick quiz to keep your memory sharp
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-white bg-purple-600 rounded-full px-2.5 py-1">
            Start
          </span>
        </button>
      )}

      {showReview && (
        <ReviewSession
          onClose={() => {
            setShowReview(false);
            void getDueCards().then((cards) => setDueCount(cards.length));
          }}
        />
      )}

      {userGoal && (
        <div className="mb-4 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <Target size={18} className="text-green-600 dark:text-green-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Your goal</p>
                <p className="text-sm font-bold text-green-900 dark:text-green-200 leading-tight">
                  {GOAL_OPTIONS.find((g) => g.id === userGoal)?.label ?? userGoal}
                </p>
                {goalDescription && (
                  <p className="mt-0.5 text-xs text-green-700 dark:text-green-400 opacity-80 break-words">
                    {goalDescription}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPickerGoalId(userGoal);
                setPickerGoalDescription(goalDescription);
                setShowGoalPicker(true);
              }}
              className="shrink-0 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-900/40"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Your Learning Path
      </h2>

      {!search.trim() && recommendedCourseIds.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recommended for You</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Based on your goal</span>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {recommendedCourseIds.map((courseId) => {
              const course = CONTENT_DATA.courses.find((c) => c.id === courseId);
              if (!course) return null;
              return (
                <button
                  key={courseId}
                  type="button"
                  onClick={() => goToCourse(course.id)}
                  className="w-44 flex-shrink-0 rounded-2xl border-2 border-green-200 bg-white p-4 text-left shadow-sm transition-all hover:border-green-400 hover:shadow-md dark:border-green-800 dark:bg-gray-800"
                >
                  <div className="mb-2 flex justify-center text-[var(--color-primary)]" aria-hidden>
                    <CourseIcon name={course.icon} size={40} />
                  </div>
                  <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">{course.title}</p>
                  <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">Start here →</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 40px 12px 16px", borderRadius: 12,
            border: "1.5px solid var(--color-border)", fontSize: 14,
            background: "var(--color-surface)", color: "var(--color-text-primary)",
            boxSizing: "border-box" as const,
          }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>
          <Search size={18} aria-hidden />
        </span>
      </div>

      {search.trim() && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-3 flex justify-center text-gray-400 dark:text-gray-500" aria-hidden>
            <Search size={40} strokeWidth={1.5} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">
            No results for &quot;{search.trim()}&quot;
          </p>
          {suggestion ? (
            <button
              type="button"
              onClick={() => setSearch(suggestion)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400 transition-colors hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <HelpCircle size={14} aria-hidden />
              Did you mean &quot;{suggestion}&quot;?
            </button>
          ) : (
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Try searching for a topic like &quot;budget&quot;, &quot;TFSA&quot;, or &quot;debt&quot;
            </p>
          )}
        </div>
      )}



      {!contentLoaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div className={`courses-grid ${!contentLoaded ? "hidden" : ""}`}>
        {(() => {
          // Group the long list: pinned first, then core courses, then XP-gated
          // advanced courses, then finished ones tucked into a collapsed
          // section at the bottom. Search results stay a flat relevance-ranked
          // list — reordering them by pin would fight the ranking.
          const isSearching = Boolean(search.trim());
          const gatedIds = new Set(Object.keys(COURSE_LEVEL_REQUIREMENTS));
          const groups = groupCourses(filteredCourses, {
            getId: (c) => c.id,
            isCompleted: (c) => courseCompletion(c).isComplete,
            isAdvanced: (c) => gatedIds.has(c.id),
            pinned,
          });
          const pinnedCourses = isSearching ? [] : groups.pinned;
          const coreCourses = isSearching ? filteredCourses : groups.core;
          const advancedCourses = isSearching ? [] : groups.advanced;
          const completedCourses = isSearching ? [] : groups.completed;

          const anyAdvancedLocked = advancedCourses.some(
            (c) => userLevel < (COURSE_LEVEL_REQUIREMENTS[c.id]?.level ?? 0)
          );
          const allAdvancedLocked =
            advancedCourses.length > 0 &&
            advancedCourses.every(
              (c) => userLevel < (COURSE_LEVEL_REQUIREMENTS[c.id]?.level ?? 0)
            );
          // Collapsed while it's all still locked — no reason to scroll past
          // courses you can't open. Opens itself once you've earned into one.
          const advancedShown = advancedOpen ?? !allAdvancedLocked;

        const renderCourseCard = (course: Course) => {
          const originalIndex = courses.indexOf(course);
          const courseIndex2 = originalIndex;
          const colour = COURSE_COLOURS[(originalIndex ?? courseIndex2) % COURSE_COLOURS.length];
          const { total: totalLessons, completed: completedLessons, percentage } =
            courseCompletion(course);
          const levelReq = COURSE_LEVEL_REQUIREMENTS[course.id];
          const isLocked = levelReq ? userLevel < levelReq.level : false;
          const pinnedNow = isPinned(course.id);
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => !isLocked && goToCourse(course.id)}
              style={{
                background: isLocked ? "var(--color-surface)" : colour.bg,
                borderColor: isLocked ? "var(--color-border)" : colour.light,
                borderWidth: 1.5,
                opacity: isLocked ? 0.85 : 1,
                cursor: isLocked ? "default" : "pointer",
                position: "relative",
              }}
            >
              <div className="course-header">
                <div
                  className="course-card-icon"
                  style={{ color: isLocked ? "var(--color-text-secondary)" : colour.accent }}
                >
                  {isLocked ? <Lock size={26} /> : <CourseIcon name={course.icon} size={26} />}
                </div>

                <div className="course-card-body">
                  <div className="course-title" style={{ color: isLocked ? "var(--color-text-primary)" : colour.accent }}>
                    {course.title}
                  </div>
                  {/* One secondary line at most — the course description lives
                      on the course page, so it's dropped here. */}
                  {isLocked ? (
                    <div className="course-card-note">
                      {Math.max(0, (levelReq.level - 1) * 500 - userXP).toLocaleString("en-ZA")} XP to go
                    </div>
                  ) : recommendedCourseIds.includes(course.id) ? (
                    <div className="course-card-note" style={{ color: "#007A85" }}>
                      <Target size={10} aria-hidden /> Recommended for your goal
                    </div>
                  ) : null}
                </div>

                {isLocked ? (
                  <div className="course-lock-chip">
                    <Lock size={10} aria-hidden /> {levelReq.label}
                  </div>
                ) : (
                  <>
                    <div className="course-percentage" style={{ color: colour.accent }}>{percentage}%</div>
                    {/* Pin toggle. Sits in the title row rather than absolutely
                        positioned so it can't collide with the percentage.
                        Hidden on locked courses — pinning one you can't open
                        yet just moves a dead card to the top. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        // The whole card is clickable, so the pin must not also
                        // navigate into the course.
                        e.stopPropagation();
                        togglePin(course.id);
                      }}
                      aria-pressed={pinnedNow}
                      aria-label={pinnedNow ? `Unpin ${course.title}` : `Pin ${course.title} to the top`}
                      title={pinnedNow ? "Unpin" : "Pin to top"}
                      style={{
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        border: `1px solid ${pinnedNow ? colour.accent : "var(--color-border)"}`,
                        background: pinnedNow ? colour.accent : "var(--color-surface)",
                        color: pinnedNow ? "#fff" : "var(--color-text-secondary)",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 0,
                        flexShrink: 0,
                      }}
                    >
                      {pinnedNow ? <PinOff size={14} aria-hidden /> : <Pin size={14} aria-hidden />}
                    </button>
                  </>
                )}
              </div>

              {!isLocked && (
                <>
                  <div className="course-bar">
                    <div style={{ width: `${percentage}%`, background: colour.accent }} />
                  </div>
                  <div className="course-stats">
                    <span className="course-stat">
                      <strong>{completedLessons}</strong> / {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                    </span>
                    <span className="course-stat" aria-hidden>·</span>
                    <span className="course-stat">
                      <strong>{course.units.length}</strong> {course.units.length === 1 ? "unit" : "units"}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        };

          return (
            <>
              {pinnedCourses.length > 0 && (
                <CourseSectionHeader icon={<Pin size={12} aria-hidden />} label="Pinned" />
              )}
              {pinnedCourses.map(renderCourseCard)}

              {pinnedCourses.length > 0 && coreCourses.length > 0 && (
                <CourseSectionHeader label="All courses" />
              )}
              {coreCourses.map(renderCourseCard)}

              {advancedCourses.length > 0 && (
                <CourseSectionHeader
                  icon={anyAdvancedLocked ? <Lock size={12} aria-hidden /> : undefined}
                  label="Advanced courses"
                  count={advancedCourses.length}
                  open={advancedShown}
                  onToggle={() => setAdvancedOpen(!advancedShown)}
                  note={
                    anyAdvancedLocked
                      ? "Earn XP from any lesson to level up and open these."
                      : undefined
                  }
                />
              )}
              {advancedShown && advancedCourses.map(renderCourseCard)}

              {completedCourses.length > 0 && (
                <CourseSectionHeader
                  icon={<CheckCircle2 size={12} aria-hidden style={{ color: "#007A85" }} />}
                  label="Completed"
                  count={completedCourses.length}
                  open={showCompleted}
                  onToggle={() => setShowCompleted((v) => !v)}
                  note="Finished courses — tap to show and replay them."
                />
              )}
              {showCompleted && completedCourses.map(renderCourseCard)}
            </>
          );
        })()}
      </div>

      {showGoalPicker && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-picker-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 dark:bg-gray-800">
            <h2 id="goal-picker-title" className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              Your money goal
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              We&apos;ll prioritise courses that match what you want to achieve.
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setPickerGoalId(g.id);
                    if (g.id !== "other") setPickerGoalDescription("");
                  }}
                  className={`rounded-xl border-2 p-3 text-left text-sm font-semibold transition-colors ${
                    pickerGoalId === g.id
                      ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/40"
                  }`}
                >
                  <g.Icon size={16} className="mr-1 inline align-text-bottom text-green-600 dark:text-green-400" aria-hidden />
                  {g.label}
                </button>
              ))}
            </div>
            {pickerGoalId === "other" && (
              <textarea
                placeholder="Describe your goal - e.g. save for my child's education"
                value={pickerGoalDescription}
                onChange={(e) => setPickerGoalDescription(e.target.value)}
                rows={3}
                className="mb-3 w-full resize-y rounded-xl border-2 border-green-600 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none dark:bg-gray-900/40 dark:text-white"
              />
            )}
            {pickerGoalId && pickerGoalId !== "other" && (
              <textarea
                placeholder="Anything more to say about this goal? (optional)"
                value={pickerGoalDescription}
                onChange={(e) => setPickerGoalDescription(e.target.value)}
                rows={2}
                className="mb-3 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-900/40 dark:text-white"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
                onClick={() => setShowGoalPicker(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
                disabled={!pickerGoalId || (pickerGoalId === "other" && !pickerGoalDescription.trim())}
                onClick={async () => {
                  if (!pickerGoalId) return;
                  const desc = pickerGoalDescription.trim() || undefined;
                  await persistUserGoalToStorageAndSupabase(pickerGoalId, desc);
                  setUserGoal(pickerGoalId);
                  setGoalDescription(desc ?? "");
                  setShowGoalPicker(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

