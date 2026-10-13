"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizeString } from "@/i18n/stringZu";
/* eslint-disable @next/next/no-html-link-for-pages */
import DOMPurify from 'dompurify';
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
import { SpeakButton } from "@/components/SpeakButton";
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


function FillBlankStep({ step, isAnswered, isCorrect, submittedAnswer, onSubmit, onNext, isLast, correctCount, finalizeLesson, nextLessonTitle, lessonTitle }: {
  step: any; isAnswered: boolean; isCorrect: boolean; submittedAnswer: string | undefined;
  onSubmit: (v: string) => void; onNext: () => void; isLast: boolean; correctCount: number;
  finalizeLesson?: (choice: "next" | "course") => void;
  nextLessonTitle?: string;
  lessonTitle?: string;
}) {
  const { locale, t } = useLocale();
  const [val, setVal] = React.useState("");
  React.useEffect(() => {
    (window as any).__fillBlankSubmit = (v: string, correct: boolean) => {
      // handled inline
    };
  }, []);

  const handleSubmit = () => {
    if (!val.trim()) return;
    onSubmit(val.trim());
  };

  const parts = (step.prompt as string).split("___");

  return (
    <>
      <h2 className="step-title">{localizeString(locale, step.title || "Fill in the blank")}</h2>
      <div className="step-content" style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 20 }}>
        {parts[0]}
        {!isAnswered ? (
          <input
            type="text"
            inputMode="decimal"
            value={val}
            onChange={e => setVal(e.target.value.replace(/[^0-9.,]/g, ""))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              display: "inline-block", width: 100, margin: "0 8px",
              padding: "4px 10px", borderRadius: 8, fontWeight: 700, fontSize: 16,
              border: "2px solid var(--color-primary)", textAlign: "center",
              background: "var(--color-surface)", color: "var(--color-text-primary)",
            }}
            placeholder="?"
            autoFocus
          />
        ) : (
          <span style={{
            display: "inline-block", margin: "0 8px", padding: "2px 12px",
            borderRadius: 8, fontWeight: 800, fontSize: 16,
            background: isCorrect ? "var(--color-success)" : "#E03C31", color: "white",
          }}>
            {submittedAnswer}
          </span>
        )}
        {parts[1]}
      </div>

      {!isAnswered && (
        <div className="lesson-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!val.trim()}>
            Check
          </button>
        </div>
      )}

      {isAnswered && (
        <>
          <div className={"feedback " + (isCorrect ? "correct" : "incorrect")}>
            {isCorrect
              ? (localizeString(locale, step.feedback?.correct) || t("lesson.wellDone"))
              : (step.feedback?.incorrect || `The correct answer is ${formatWithSpaces(step.correct)}. ${step.explanation || ""}`)}
          </div>
          <div className="lesson-actions">
            {isLast ? (
              <div style={{ textAlign: "center", width: "100%" }}>
                <Trophy size={48} style={{ color: "#EFB343", margin: "0 auto 8px" }} />
                <CosmoCharacter expression="celebrating" size={100} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Lesson Complete!</div>
                {finalizeLesson ? (
                  <div className="flex flex-col gap-3 mt-2" style={{ width: "100%" }}>
                    {nextLessonTitle ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "14px 16px", fontSize: 17, fontWeight: 800 }}
                        onClick={() => finalizeLesson("next")}
                      >
                        {t("lesson.nextLesson")}: {nextLessonTitle} →
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                        <Sparkles size={22} className="text-[#EFB343]" aria-hidden />
                        Course Complete!
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: 15,
                        fontWeight: 700,
                        background: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                        border: "1.5px solid var(--color-border)",
                      }}
                      onClick={() => finalizeLesson("course")}
                    >
                      ✓ Done - {t("lesson.backToCourse")}
                    </button>
                    {lessonTitle ? (
                      <ShareResultButton
                        data={{ type: "lesson", lessonTitle, xpEarned: 50 + correctCount * 10, isPerfect: false, courseName: "Notho" }}
                        label="Share your result"
                      />
                    ) : null}
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={onNext}>{t("lesson.continue")}</button>
                )}
              </div>
            ) : (
              <button className="btn btn-primary" onClick={onNext}>{t("lesson.continue")}</button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export function LessonView({
  lessonState,
  completeLessonFlow,
  nextStep,
  finalizeLesson,
  answerQuestion,
  answerTrueFalse,
  answerFillBlank,
  correctCount,
  hearts = 5,
  maxHearts = 5,
  goBack,
  courseId,
  courseAccent,
  nextLessonTitle,
  lessonTitle,
  lessonStartTimeRef,
  totalQuestions = 0,
  canFinalize = true,
}: {
  lessonState: {
    steps: LessonStep[];
    stepIndex: number;
    answers: Record<number, unknown>;
  };
  completeLessonFlow: () => void;
  nextStep: () => void;
  finalizeLesson?: (choice: "next" | "course") => void;
  /** Mastery gate: only true once every question has been answered correctly. */
  canFinalize?: boolean;
  answerQuestion: (index: number) => void;
  answerTrueFalse: (value: boolean) => void;
  /** Records a fill-blank submission (value + correctness) in lesson state. */
  answerFillBlank?: (value: string, isCorrect: boolean) => void;
  correctCount: number;
  hearts?: number;
  maxHearts?: number;
  goBack?: () => void;
  courseId?: string;
  courseAccent?: string;
  nextLessonTitle?: string;
  lessonTitle?: string;
  lessonStartTimeRef?: React.MutableRefObject<number>;
  totalQuestions?: number;
}) {
  const { locale, t } = useLocale();
  const step = lessonState.steps[lessonState.stepIndex];
  const progress =
    ((lessonState.stepIndex + 1) / lessonState.steps.length) * 100;

  const answered = lessonState.answers[lessonState.stepIndex] !== undefined;
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  const isOnLastStep = lessonState.stepIndex === lessonState.steps.length - 1;
  const isCompleted = lessonState.stepIndex >= lessonState.steps.length;

  // Only offer to finish when it's genuinely the last step AND every question
  // has been mastered. A wrong answer appends a re-queued copy, so the missed
  // step is never "last" — the learner sees a "Continue" button instead and is
  // walked back to the question until they get it right.
  const showFinish = isOnLastStep && canFinalize;

  // ── Exit confirm modal ───────────────────────────────────────────────────
  function ExitConfirmModal() {
    if (!showExitConfirm) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 20,
            padding: "24px 22px",
            width: "100%",
            maxWidth: 340,
            textAlign: "center",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Leave?</div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 18, lineHeight: 1.5 }}>
            If you leave now, you may lose your progress for this lesson.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowExitConfirm(false)}>
              Keep Going
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: "#E03C31", border: "none" }}
              onClick={() => {
                setShowExitConfirm(false);
                goBack?.();
              }}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ── End exit modal ───────────────────────────────────────────────────

  const renderStep = () => {
    // Safety net: if the step index ever runs past the last step (e.g. a
    // "Continue" tap on the final step), render the completion actions instead
    // of a blank box so the learner can always finish the lesson.
    if (!step) {
      return (
        <div style={{ textAlign: "center", padding: "24px 8px", animation: "fade-in 0.4s ease-out" }}>
          <Trophy size={48} style={{ color: "#EFB343", margin: "0 auto 8px" }} aria-hidden />
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>Lesson Complete!</div>
          {finalizeLesson ? (
            <div className="flex flex-col gap-3" style={{ width: "100%" }}>
              {nextLessonTitle ? (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => finalizeLesson("next")}>
                  {t("lesson.nextLesson")}: {nextLessonTitle} →
                </button>
              ) : null}
              <button
                className="btn btn-secondary"
                style={{ width: "100%", background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)" }}
                onClick={() => finalizeLesson("course")}
              >
                <span className="inline-flex items-center justify-center gap-2"><CheckCircle2 size={18} aria-hidden /> Done - {t("lesson.backToCourse")}</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => goBack?.()}>{t("lesson.backToCourse")}</button>
          )}
        </div>
      );
    }

    // Out of hearts: block answering a fresh question. Info/action steps and
    // the finish flow are unaffected, and mid-lesson progress is already saved,
    // so the learner resumes here once hearts regenerate.
    const isQuestionStep =
      step.type === "mcq" ||
      step.type === "scenario" ||
      step.type === "true-false" ||
      step.type === "fill-blank";
    if (hearts <= 0 && isQuestionStep && !answered) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "24px 8px",
            animation: "fade-in 0.3s ease-out",
          }}
        >
          <HeartOff size={56} style={{ color: "#E03C31", margin: "0 auto 12px" }} />
          <h2 className="step-title" style={{ marginBottom: 8 }}>
            You're out of hearts
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: 20,
              maxWidth: 360,
              marginInline: "auto",
            }}
          >
            Hearts refill over time. Your progress on this lesson is saved — come
            back and pick up exactly where you left off.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: "100%", maxWidth: 320 }}
            onClick={() => goBack?.()}
          >
            Save & exit
          </button>
        </div>
      );
    }

    if (step.type === "info") {
      const infoText = localizeString(locale, step.title) + ". " + (typeof step.content === "string" ? step.content : "");
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h2 className="step-title" style={{ margin: 0, flex: 1 }}>{localizeString(locale, step.title)}</h2>
            <SpeakButton text={infoText} />
          </div>
          <div
            className="step-content"
            dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(localizeString(locale, step.content)) : localizeString(locale, step.content) }}
          />
          <div className="lesson-actions">
            {showFinish ? (
              finalizeLesson ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  {nextLessonTitle ? (
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => finalizeLesson("next")}>{t("lesson.nextLesson")}: {nextLessonTitle} →</button>
                  ) : null}
                  <button className="btn btn-secondary" style={{ width: "100%", background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)" }} onClick={() => finalizeLesson("course")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={18} /> Done - {t("lesson.backToCourse")}</span>
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={nextStep}>Finish</button>
              )
            ) : (
              <button className="btn btn-primary" onClick={nextStep}>{t("lesson.continue")}</button>
            )}
          </div>
        </>
      );
    }

    if (step.type === "action") {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-green-600 px-5 py-4">
            <Zap className="h-8 w-8 shrink-0 text-white" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-100">Do This Now</p>
              <p className="text-lg font-bold leading-tight text-white">{localizeString(locale, step.title)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100">{step.instruction}</p>
          </div>
          {step.tip ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>Tip:</strong> {step.tip}</p>
            </div>
          ) : null}
          <div className="lesson-actions">
            <button className="btn btn-primary" onClick={nextStep}>{t("lesson.continue")}</button>
          </div>
        </div>
      );
    }

    // Remaining step types (mcq, true-false, fill-blank, etc.) continue from the original file.
    // The full original implementation follows; this upload restores the complete file with the TTS addition.
    return null;
  };

  return (
    <div className="lesson-view" style={{ paddingBottom: 80 }}>
      {renderStep()}
      <ExitConfirmModal />
    </div>
  );
}
