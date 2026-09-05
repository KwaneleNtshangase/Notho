/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  Play,
  Search,
  Target,
} from "@/components/icons/NothoIcons";
import { NothoTrophy, NothoXP, NothoBrain } from "@/components/icons/NothoIcons";
import { DAILY_FACTS_365 } from "@/data/content-extra";
import { CONTENT_DATA } from "@/data/content";
import { getDueCards } from "@/lib/spaced-repetition";
import { ReviewSession } from "@/components/ReviewSession";
import { DailyChallenges } from "@/components/DailyChallenges";
import type { Course } from "@/data/content";
import {
  type WeeklyProgressJSON,
  type SavedLessonProgress,
  GOAL_OPTIONS,
  GOAL_COURSE_MAP,
  COURSE_COLOURS,
  CourseIcon,
  persistUserGoalToStorageAndSupabase,
} from "@/lib/viewHelpers";

// ─── Private helpers ──────────────────────────────────────────────────────────

function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_FACTS_365[dayOfYear % DAILY_FACTS_365.length];
}

const CourseCardSkeleton = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
  </div>
);

// ─── LearnView ────────────────────────────────────────────────────────────────

export function LearnView({
  courses,
  isLessonCompleted,
  goToCourse,
  weeklyChallenge,
  weeklyProgress,
  challengeProgress,
  challengeComplete,
  challengeRewardClaimed,
  claimChallengeReward,
  contentLoaded = true,
  savedProgress,
  onResumeLesson,
  streak = 0,
}: {
  courses: Course[];
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  goToCourse: (courseId: string) => void;
  weeklyChallenge?: { text: string; target: number; xp: number; id: string; unit: string };
  weeklyProgress?: WeeklyProgressJSON;
  challengeProgress?: number;
  challengeComplete?: boolean;
  challengeRewardClaimed?: boolean;
  claimChallengeReward?: () => void;
  contentLoaded?: boolean;
  savedProgress?: SavedLessonProgress | null;
  onResumeLesson?: (p: SavedLessonProgress) => void;
  streak?: number;
}) {
  const [search, setSearch] = useState("");
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [goalBannerDismissed, setGoalBannerDismissed] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [pickerGoalId, setPickerGoalId] = useState<string>("");
  const [pickerGoalDescription, setPickerGoalDescription] = useState<string>("");
  const [showReview, setShowReview] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  // Refresh due count on mount and when returning from a review
  useEffect(() => {
    void getDueCards().then((cards) => setDueCount(cards.length));
  }, [showReview]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUserGoal(localStorage.getItem("notho-user-goal"));
    setGoalDescription(localStorage.getItem("notho-goal-description") ?? "");
    setGoalBannerDismissed(localStorage.getItem("notho-goal-banner-dismissed") === "1");
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

  // Simple fuzzy match: returns true if query is a substring OR within 1 char edit distance
  const fuzzyMatch = (text: string, query: string): boolean => {
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (!q) return true;
    if (t.includes(q)) return true;
    // Check if any word in t starts with q (prefix match)
    if (t.split(/\s+/).some(w => w.startsWith(q))) return true;
    // Levenshtein distance <= 1 for short queries (<=5 chars)
    if (q.length <= 5) {
      const levenshtein = (a: string, b: string): number => {
        const dp = Array.from({ length: a.length + 1 }, (_, i) =>
          Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
        );
        for (let i = 1; i <= a.length; i++)
          for (let j = 1; j <= b.length; j++)
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
        return dp[a.length][b.length];
      };
      // Check each word in the text
      const words = t.split(/\s+/);
      if (words.some(w => levenshtein(w.slice(0, q.length + 1), q) <= 1)) return true;
    }
    return false;
  };
  const filteredCourses = search.trim()
    ? courses.filter(c =>
        fuzzyMatch(c.title, search) ||
        fuzzyMatch(c.description ?? "", search)
      )
    : courses;

  const todayFact = getDailyFact();

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
            <NothoBrain size={20} className="text-purple-600 dark:text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-purple-900 dark:text-purple-200 font-bold text-sm">
              {dueCount} concept{dueCount > 1 ? "s" : ""} to review
            </p>
            <p className="text-purple-600 dark:text-purple-400 text-xs">
              Cards that are due today
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

      {userGoal && !goalBannerDismissed && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Target size={18} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  {GOAL_OPTIONS.find((g) => g.id === userGoal)?.label ?? userGoal}
                </p>
                {goalDescription && (
                  <p className="mt-0.5 text-xs text-green-700 dark:text-green-400 opacity-90 break-words">
                    {goalDescription}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickerGoalId(userGoal);
                  setPickerGoalDescription(goalDescription);
                  setShowGoalPicker(true);
                }}
                className="text-xs font-semibold text-green-600 dark:text-green-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setGoalBannerDismissed(true);
                  localStorage.setItem("notho-goal-banner-dismissed", "1");
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                aria-label="Dismiss goal banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fact of the Day */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)", borderRadius: 12,
        padding: "14px 16px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>
          <Lightbulb size={14} aria-hidden />
          Today
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{todayFact}</div>
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Courses
      </h2>

      {!search.trim() && recommendedCourseIds.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">First up</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">From the goal you picked</span>
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
                  <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">Open course</p>
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
          placeholder="Search courses"
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
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Try searching for a topic like &quot;budget&quot;, &quot;TFSA&quot;, or &quot;debt&quot;
          </p>
        </div>
      )}

      {/* Weekly challenge card */}
      {weeklyChallenge && (
        <div style={{
          background: challengeComplete ? "rgba(0,122,133,0.08)" : "var(--color-surface)",
          border: `1.5px solid ${challengeComplete ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ flexShrink: 0, color: "var(--color-primary)", display: "flex" }}>
            {challengeComplete ? <NothoTrophy size={28} /> : <NothoXP size={28} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)", marginBottom: 2 }}>
              Weekly Challenge
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {weeklyChallenge?.text}
            </div>
            <div style={{ background: "var(--color-border)", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4, background: "var(--color-primary)",
                width: `${Math.min(((challengeProgress || 0) / weeklyChallenge.target) * 100, 100)}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
              {challengeProgress || 0}/{weeklyChallenge.target} · Reward: +{weeklyChallenge.xp} XP
            </div>
            {weeklyProgress && weeklyChallenge && (
              <div
                className="text-gray-500 dark:text-gray-400"
                style={{ fontSize: 10, marginTop: 6, lineHeight: 1.4 }}
              >
                {weeklyChallenge.unit === "lessons" &&
                  `${weeklyProgress.lessonsCompleted} lesson${weeklyProgress.lessonsCompleted === 1 ? "" : "s"} this week`}
                {weeklyChallenge.unit === "perfect" &&
                  `${weeklyProgress.perfectLessons} perfect lesson${weeklyProgress.perfectLessons === 1 ? "" : "s"}`}
                {weeklyChallenge.unit === "daily_xp" &&
                  `${weeklyProgress.dailyXp} XP earned today (goal ${weeklyChallenge.target})`}
                {weeklyChallenge.unit === "streak_days" &&
                  `Uses your learning streak (goal: ${weeklyChallenge.target} days)`}
              </div>
            )}
          </div>
          {challengeComplete && !challengeRewardClaimed && (
            <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }}
              onClick={claimChallengeReward}>
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

      {/* Daily Challenges */}
      <DailyChallenges />

      {!contentLoaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div className={`courses-grid ${!contentLoaded ? "hidden" : ""}`}>
        {filteredCourses.map((course, courseIndex) => {
          const originalIndex = courses.indexOf(course);
          const courseIndex2 = originalIndex;
          const colour = COURSE_COLOURS[(originalIndex ?? courseIndex2) % COURSE_COLOURS.length];
          const totalLessons = course.units.reduce(
            (sum, unit) => sum + unit.lessons.length, 0
          );
          const completedLessons = course.units.reduce((sum, unit) => {
            return sum + unit.lessons.filter((lesson) =>
              isLessonCompleted(course.id, lesson.id)
            ).length;
          }, 0);
          const percentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100) : 0;
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => goToCourse(course.id)}
              style={{ background: colour.bg, borderColor: colour.light, borderWidth: 1.5 }}
            >
              <div className="course-header">
                <div>
                  <div style={{ fontSize: 48, marginBottom: 12, color: colour.accent }}>
                    <CourseIcon name={course.icon} size={48} />
                  </div>
                  <div className="course-title" style={{ color: colour.accent }}>{course.title}</div>
                  <div className="course-description">{course.description}</div>
                </div>
                <div className="course-progress">
                  <div className="course-percentage" style={{ color: colour.accent }}>{percentage}%</div>
                  <div className="course-percentage-label">Complete</div>
                </div>
              </div>
              {/* Coloured progress bar */}
              <div style={{ height: 6, background: colour.light, borderRadius: 3, margin: "8px 0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percentage}%`, background: colour.accent, borderRadius: 3, transition: "width 0.4s" }} />
              </div>
              <div className="course-stats">
                <div className="course-stat">
                  <strong>{completedLessons}</strong> / {totalLessons} lessons
                </div>
                <div className="course-stat">
                  <strong>{course.units.length}</strong> units
                </div>
              </div>
            </div>
          );
        })}
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
                  setGoalBannerDismissed(false);
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

export default LearnView;
