/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
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
      <h2 className="step-title">{step.title || "Fill in the blank"}</h2>
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
              ? (step.feedback?.correct || "Correct! Well done.")
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
                        Next Lesson: {nextLessonTitle} →
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
                      ✓ Done - Back to Course
                    </button>
                    {lessonTitle ? (
                      <ShareResultButton
                        data={{ type: "lesson", lessonTitle, xpEarned: 50 + correctCount * 10, isPerfect: false, courseName: "Notho" }}
                        label="Share your result"
                      />
                    ) : null}
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={onNext}>Continue</button>
                )}
              </div>
            ) : (
              <button className="btn btn-primary" onClick={onNext}>Continue</button>
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

  // ── Exit confirm modal ────────────────────────────────────────────────────
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
  // ── End exit modal ────────────────────────────────────────────────────────

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
                  Next Lesson: {nextLessonTitle} →
                </button>
              ) : null}
              <button
                className="btn btn-secondary"
                style={{ width: "100%", background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)" }}
                onClick={() => finalizeLesson("course")}
              >
                <span className="inline-flex items-center justify-center gap-2"><CheckCircle2 size={18} aria-hidden /> Done - Back to Course</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => goBack?.()}>Back to Course</button>
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
            You&apos;re out of hearts
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
            Save &amp; exit
          </button>
        </div>
      );
    }

    if (step.type === "info") {
      return (
        <>
          <h2 className="step-title">{step.title}</h2>
          <div
            className="step-content"
            dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(step.content) : step.content }}
          />
          <div className="lesson-actions">
            {showFinish ? (
              finalizeLesson ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  {nextLessonTitle ? (
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => finalizeLesson("next")}>Next Lesson: {nextLessonTitle} →</button>
                  ) : null}
                  <button className="btn btn-secondary" style={{ width: "100%", background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)" }} onClick={() => finalizeLesson("course")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={18} /> Done - Back to Course</span>
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={nextStep}>Finish</button>
              )
            ) : (
              <button className="btn btn-primary" onClick={nextStep}>Continue</button>
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
              <p className="text-lg font-bold leading-tight text-white">{step.title}</p>
            </div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100">{step.instruction}</p>
          </div>
          {step.tip ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-300">
                <Lightbulb size={16} className="mt-0.5 shrink-0" aria-hidden />
                <span><span className="font-semibold">Tip:</span> {step.tip}</span>
              </p>
            </div>
          ) : null}
          <div className="lesson-actions">
            {showFinish ? (
              finalizeLesson ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  {nextLessonTitle ? (
                    <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => finalizeLesson("next")}>Next Lesson: {nextLessonTitle} →</button>
                  ) : null}
                  <button type="button" className="btn btn-secondary" style={{ width: "100%", background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)" }} onClick={() => finalizeLesson("course")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={18} /> Done - Back to Course</span>
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-primary" onClick={nextStep}>Finish</button>
              )
            ) : (
              <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
            )}
          </div>
        </div>
      );
    }

    // ── Action Check step (behaviour change) ──────────────────────────────
    if ((step as any).type === "action-check") {
      const s = step as any;
      const didAction = lessonState.answers[lessonState.stepIndex] as number | undefined;
      console.log("LessonView action-check render:", { didAction, stepIndex: lessonState.stepIndex, answers: lessonState.answers });
      return (
        <div className="flex flex-col gap-4">
          <div style={{
            background: "linear-gradient(135deg, #007A85 0%, #00A0AA 100%)",
            borderRadius: 16, padding: "20px 20px 16px", color: "white",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Target size={24} className="shrink-0" />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.9 }}>
                Take Action
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, marginBottom: 0 }}>{s.title}</h3>
          </div>
          <div style={{
            background: "var(--color-surface)", border: "2px solid var(--color-primary)",
            borderRadius: 14, padding: "18px 16px",
          }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-primary)", fontWeight: 500 }}>{s.challenge}</p>
          </div>
          {!didAction ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, padding: "14px 16px", fontSize: 15, fontWeight: 800 }}
                onClick={() => {
                  console.log("CLICKED DONE BUTTON! CALLING answerQuestion(1)");
                  // Track action completed
                  try {
                    const key = "notho-actions-completed";
                    const count = parseInt(localStorage.getItem(key) ?? "0", 10);
                    localStorage.setItem(key, String(count + 1));
                  } catch (err) {
                    console.error("LOCALSTORAGE ERROR:", err);
                  }
                  // Store answer as "done"
                  answerQuestion(1);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={18} aria-hidden />
                  Done - I did it!
                </span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: "14px 12px", fontSize: 13, fontWeight: 600 }}
                onClick={() => {
                  answerQuestion(0);
                }}
              >
                Skip for now
              </button>
            </div>
          ) : (
            <div style={{
              borderRadius: 14, padding: "16px",
              background: didAction === 1 ? "rgba(0,122,133,0.08)" : "rgba(239,179,67,0.08)",
              border: `1.5px solid ${didAction === 1 ? "var(--color-primary)" : "#EFB343"}`,
            }}>
              <p style={{
                fontSize: 14, lineHeight: 1.6, fontWeight: 600,
                color: didAction === 1 ? "var(--color-primary)" : "#8B6914",
              }}>
                {didAction === 1 ? s.successMessage : s.skipMessage}
              </p>
            </div>
          )}
          {didAction && (
            <div className="lesson-actions">
              {showFinish ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <Trophy size={48} style={{ color: "#EFB343", margin: "0 auto 8px" }} />
                  <CosmoCharacter expression="celebrating" size={100} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Lesson Complete!</div>
                  {finalizeLesson ? (
                    <div className="flex flex-col gap-3 mt-2" style={{ width: "100%" }}>
                      {nextLessonTitle ? (
                        <button type="button" className="btn btn-primary"
                          style={{ width: "100%", padding: "14px 16px", fontSize: 17, fontWeight: 800 }}
                          onClick={() => finalizeLesson("next")}
                        >Next Lesson: {nextLessonTitle} →</button>
                      ) : (
                        <div className="flex items-center justify-center gap-2" style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                          <Sparkles size={22} className="text-[#EFB343]" aria-hidden /> Course Complete!
                        </div>
                      )}
                      <button type="button" className="btn btn-secondary"
                        style={{
                          width: "100%", padding: "12px 16px", fontSize: 15, fontWeight: 700,
                          background: "var(--color-bg)", color: "var(--color-text-primary)", border: "1.5px solid var(--color-border)"
                        }}
                        onClick={() => finalizeLesson("course")}>
                        <span className="inline-flex items-center justify-center gap-2">
                          <CheckCircle2 size={18} aria-hidden /> Done - Back to Course
                        </span>
                      </button>
                      {lessonTitle && (
                        <ShareResultButton
                          data={{ type: "lesson", lessonTitle, xpEarned: 50 + correctCount * 10, isPerfect: false, courseName: "Notho" }}
                          label="Share your result"
                        />
                      )}
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={nextStep}>Continue</button>
                  )}
                </div>
              ) : (
                <button className="btn btn-primary" onClick={nextStep}>Continue</button>
              )}
            </div>
          )}
        </div>
      );
    }

    // ── Calculator Embed step ─────────────────────────────────────────────
    if ((step as any).type === "calculator-embed") {
      return <CalculatorEmbedStep step={step} onNext={nextStep} />;
    }

    if (step.type === "mcq" || step.type === "scenario") {
      const selectedAnswer = lessonState.answers[lessonState.stepIndex] as
        | number
        | undefined;
      const isCorrect = selectedAnswer === step.correct;
      return (
        <>
          <h2 className="step-title">{step.question}</h2>
          {step.content ? (
            <div
              className="step-content"
              dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(step.content) : step.content }}
            />
          ) : null}
          <div className="flex flex-col gap-3 my-4">
            {step.options.map((option, index) => {
              return (
                <button
                  key={option}
                  className={`option-button w-full text-left p-5 mb-3 rounded-2xl border-2 transition-all ${answered
                    ? index === step.correct
                      ? "correct font-bold"
                      : index === selectedAnswer
                        ? "incorrect font-bold"
                        : "not-chosen"
                    : "font-medium"
                    }`}
                  onClick={() => answerQuestion(index)}
                  disabled={answered}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {answered && (
            <>
              <div
                className={`feedback ${isCorrect ? "correct" : "incorrect"}`}
              >
                {isCorrect ? step.feedback.correct : step.feedback.incorrect}
              </div>
              <div className="lesson-actions">
                {showFinish ? (
                  <div
                    style={{
                      textAlign: "center",
                      animation: "fade-in 0.4s ease-out",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 8,
                      }}
                    >
                      <Trophy
                        size={48}
                        style={{ color: "#EFB343", margin: "0 auto" }}
                      />
                    </div>
                    <CosmoCharacter expression="celebrating" size={100} style={{ margin: "0 auto 8px" }} />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      Lesson Complete!
                    </div>
                    {finalizeLesson ? (
                      <div className="flex flex-col gap-3 mt-2" style={{ width: "100%" }}>
                        {nextLessonTitle ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "14px 16px", fontSize: 17, fontWeight: 800 }}
                            onClick={() => finalizeLesson("next")}
                          >
                            Next Lesson: {nextLessonTitle} →
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
                          <span className="inline-flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} aria-hidden />
                            Done - Back to Course
                          </span>
                        </button>
                        {lessonTitle ? (
                          <ShareButton
                            text={generateShareText("lesson", { lessonTitle })}
                            label="Share your progress"
                            shareType="lesson"
                          />
                        ) : null}
                      </div>
                    ) : (
                      <>
                        {nextLessonTitle && (
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 14, opacity: 0.8 }}>
                            Up next: <strong>{nextLessonTitle}</strong>
                          </div>
                        )}
                        <button className="btn btn-primary" onClick={nextStep}>
                          {nextLessonTitle ? "Next Lesson →" : "Back to Course"}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={nextStep}>
                    Continue
                  </button>
                )}
              </div>
            </>
          )}
        </>
      );
    }

    if (step.type === "true-false") {
      const selectedAnswer = lessonState.answers[lessonState.stepIndex] as
        | boolean
        | undefined;
      const isCorrect = selectedAnswer === step.correct;
      return (
        <>
          <h2 className="step-title">True or False?</h2>
          <div className="step-content">
            <p>{step.statement}</p>
          </div>
          <div className="flex flex-col gap-3 my-4">
            {[true, false].map((value) => {
              return (
                <button
                  key={String(value)}
                  className={`option-button w-full text-left p-5 mb-3 rounded-2xl border-2 transition-all ${answered
                    ? value === step.correct
                      ? "correct font-bold"
                      : value === selectedAnswer
                        ? "incorrect font-bold"
                        : "not-chosen"
                    : "font-medium"
                    }`}
                  onClick={() => answerTrueFalse(value)}
                  disabled={answered}
                >
                  {value ? "True" : "False"}
                </button>
              );
            })}
          </div>
          {answered && (
            <>
              <div
                className={`feedback ${isCorrect ? "correct" : "incorrect"}`}
              >
                {isCorrect ? step.feedback.correct : step.feedback.incorrect}
              </div>
              <div className="lesson-actions">
                {showFinish ? (
                  <div
                    style={{
                      textAlign: "center",
                      animation: "fade-in 0.4s ease-out",
                      width: "100%",
                    }}
                  >
                    <CosmoCharacter expression="celebrating" size={100} style={{ margin: "0 auto 8px" }} />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      Lesson Complete!
                    </div>
                    {finalizeLesson ? (
                      <div className="flex flex-col gap-3 mt-2" style={{ width: "100%" }}>
                        {nextLessonTitle ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "14px 16px", fontSize: 17, fontWeight: 800 }}
                            onClick={() => finalizeLesson("next")}
                          >
                            Next Lesson: {nextLessonTitle} →
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
                          <span className="inline-flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} aria-hidden />
                            Done - Back to Course
                          </span>
                        </button>
                        {lessonTitle ? (
                          <ShareButton
                            text={generateShareText("lesson", { lessonTitle })}
                            label="Share your progress"
                            shareType="lesson"
                          />
                        ) : null}
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={nextStep}>
                        Continue
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={nextStep}>
                    Continue
                  </button>
                )}
              </div>
            </>
          )}
        </>
      );
    }
    // ── Fill in the blank ────────────────────────────────────────────────────
    if ((step as any).type === "fill-blank") {
      const s = step as any;
      const submittedAnswer = lessonState.answers[lessonState.stepIndex];
      const isAnswered = submittedAnswer !== undefined;
      const isCorrect = isAnswered && Math.abs(Number(submittedAnswer) - s.correct) <= (s.correct * 0.1);

      return (
        <FillBlankStep
          step={s}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          submittedAnswer={submittedAnswer as string | undefined}
          onSubmit={(val) => {
            if (isAnswered) return;
            const correct = Math.abs(Number(val) - s.correct) <= (s.correct * 0.1);
            // Previously wired to window.__fillBlankSubmit, which was never
            // defined anywhere — fill-blank answers were silently dropped
            // (never recorded, never scored).
            answerFillBlank?.(val, correct);
          }}
          onNext={nextStep}
          isLast={showFinish}
          correctCount={correctCount}
          finalizeLesson={finalizeLesson}
          nextLessonTitle={nextLessonTitle}
          lessonTitle={lessonTitle}
        />
      );
    }

    return null;
  };

  return (
    <>
      <ExitConfirmModal />
      <main >
        <div className="lesson-player">
          {/* Back button + progress bar + exit (hearts only in NothoTopBar) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "sticky", top: 0, zIndex: 50, background: "var(--color-bg)", paddingTop: 8, paddingBottom: 8, marginTop: -8 }}>
            {goBack && (
              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 2px",
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Back to course"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="lesson-progress-bar" style={{ flex: 1, margin: 0 }}>
              <div
                className="lesson-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: courseAccent ? `linear-gradient(90deg, ${courseAccent}99 0%, ${courseAccent} 100%)` : undefined,
                }}
              />
            </div>
            <button
              onClick={() => setShowExitConfirm(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
                color: "var(--color-text-secondary)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Exit lesson"
              title="Exit lesson"
            >
              <X size={22} />
            </button>
            {/* Hearts belong where you can lose them - inline in the lesson header */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, fontWeight: 800, fontSize: 14, color: "#E03C31" }}
              aria-label={`${hearts} of ${maxHearts} hearts remaining`}
              title={`${hearts}/${maxHearts} hearts`}
            >
              {hearts > 0 ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
              {hearts}
            </div>
          </div>
          <div className="lesson-step">{renderStep()}</div>
          {/* Financial education disclaimer */}
          <div style={{
            textAlign: "center",
            padding: "8px 16px 12px",
            color: "var(--color-text-secondary)",
            fontSize: 11,
            opacity: 0.75,
            borderTop: "1px solid var(--color-border)",
            marginTop: 4,
          }}>
            Education only. Not financial advice.
          </div>
        </div>
      </main>
    </>
  );
}

function CalculatorEmbedStep({ step, onNext }: { step: any; onNext: () => void }) {
  const [embedCalcDone, setEmbedCalcDone] = React.useState(false);
  const preset = step.preset ?? {};
  const embedInputs: CalcInputs = {
    principal: preset.principal ?? 0,
    monthly: preset.monthly ?? 500,
    rate: preset.rate ?? 10,
    years: preset.years ?? 10,
    escalation: preset.escalation ?? 5,
    frequency: preset.frequency ?? "monthly",
  };
  const embedData = React.useMemo(() => calcGrowth(embedInputs), [embedInputs]);
  const embedFinal = embedData.length > 0 ? embedData[embedData.length - 1] : { value: 0, contributions: 0, interest: 0 };
  const embedChart = embedData.map((d: any) => ({
    year: d.year,
    "Portfolio Value": d.value,
    "Total Contributions": d.contributions,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div style={{
        background: "linear-gradient(135deg, #3B7DD8 0%, #2563EB 100%)",
        borderRadius: 16, padding: "20px", color: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Calculator size={22} className="shrink-0" />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.9 }}>
            Interactive Calculator
          </span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>{step.title}</h3>
        <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>{step.description}</p>
      </div>

      {!embedCalcDone ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() => setEmbedCalcDone(true)}
        >
          <BarChart2 size={20} aria-hidden /> Calculate
        </button>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{
              flex: 1, minWidth: 120, background: "var(--color-primary)", borderRadius: 12,
              padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5 }}>Final Value</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{formatRand(embedFinal.value)}</div>
            </div>
            <div style={{
              flex: 1, minWidth: 120, background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 12, padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>You Put In</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)" }}>{formatRand(embedFinal.contributions)}</div>
            </div>
            <div style={{
              flex: 1, minWidth: 120, background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 12, padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Interest Earned</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#007A85" }}>{formatRand(embedFinal.interest)}</div>
            </div>
          </div>

          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={embedChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} />
                <YAxis tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} width={45} />
                <Tooltip
                  formatter={(v: any) => formatRand(typeof v === "number" ? v : Number(v ?? 0))}
                  labelFormatter={(l) => `Year ${l}`}
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="Portfolio Value" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Total Contributions" stroke="#EFB343" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: "rgba(0,122,133,0.06)", border: "1.5px solid rgba(0,122,133,0.2)",
            borderRadius: 12, padding: "14px 16px", borderLeft: "4px solid var(--color-primary)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Lightbulb size={14} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)" }}>Key Insight</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)" }}>{step.insight}</p>
          </div>
        </>
      )}

      <div className="lesson-actions">
        <button className="btn btn-primary" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}
