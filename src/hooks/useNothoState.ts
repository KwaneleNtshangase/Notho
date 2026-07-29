"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { sastToday, sastSundayDate } from "@/lib/dates";
import {
  computeLessonXpAward,
  replayXpStorageKey,
} from "@/lib/lessonXp";
import { CONTENT_DATA } from "@/data/content";
import { LEVEL_3_COURSES } from "@/data/content-level3";
import { shuffleLessonSteps, lessonShuffleSeed } from "@/lib/lessonShuffle";
import { useProgress } from "@/hooks/useProgress";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  emptyWeeklyStats,
  readWeeklyStats,
  bumpWeeklyStats,
  syncWeeklyStats,
  type WeeklyStats,
} from "@/lib/weeklyStats";
import type { LessonStep } from "@/data/content";
import { assignQids, type WorkingStep } from "@/lib/lessonMastery";
import { resolveLessonSteps, nextAttemptNo } from "@/lib/lessonBank";
import {
  UserData,
  Route,
  WeeklyProgressJSON,
  progressNumberFromWeeklyState,
  getLessonTitle,
} from "@/app/pageViews.types";

export function useNothoState() {
  const progress = useProgress();
  // ── User settings (sound, dark mode, daily goal, calc saved) ─────────────
  // Synced to Supabase user_settings for cross-device persistence.
  const userSettings = useUserSettings(progress.userId);

  // Daily XP is server-backed (user_progress.daily_xp_today) and synced
  // across devices via the same delta queue as lifetime XP. The legacy
  // per-day localStorage keys are still WRITTEN (for on-device quest flags
  // and XP history charts) but are no longer the source of truth.
  const dailyXP = progress.dailyXp;
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    if (typeof window === "undefined") return 50;
    return parseInt(window.localStorage.getItem("notho-daily-goal") ?? "50", 10);
  });
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === "undefined") return { name: "learn" } as Route;
    const onboarded = localStorage.getItem("notho-onboarded");
    if (!onboarded) return { name: "onboarding" } as Route;
    const saved = localStorage.getItem("notho-last-route");
    const simpleRoutes = ["learn", "quests", "calculator", "profile", "leaderboard", "settings", "budget"];
    if (saved && simpleRoutes.includes(saved)) return { name: saved } as Route;
    return { name: "learn" } as Route;
  });
  // ── Hearts ────────────────────────────────────────────────────────────
  const MAX_HEARTS = 5;
  const HEART_REGEN_MS = 60 * 60 * 1000; // 1 hour
  const [hearts, setHearts] = useState<number>(() => {
    if (typeof window === "undefined") return MAX_HEARTS;
    const storedRaw = localStorage.getItem("notho-hearts");
    const lastLostRaw = localStorage.getItem("notho-last-heart-lost");
    if (storedRaw === null) return MAX_HEARTS;
    let current = parseInt(storedRaw, 10);
    if (Number.isNaN(current)) current = MAX_HEARTS;
    if (lastLostRaw) {
      const lastLost = parseInt(lastLostRaw, 10);
      if (!Number.isNaN(lastLost) && current < MAX_HEARTS) {
        const elapsed = Date.now() - lastLost;
        const regained = Math.floor(elapsed / HEART_REGEN_MS);
        if (regained > 0) {
          current = Math.min(MAX_HEARTS, current + regained);
          localStorage.setItem("notho-hearts", String(current));
          const newLast = lastLost + regained * HEART_REGEN_MS;
          if (current >= MAX_HEARTS) {
            localStorage.removeItem("notho-last-heart-lost");
          } else {
            localStorage.setItem("notho-last-heart-lost", String(newLast));
          }
        }
      }
    }
    return current;
  });
  const [lastHeartLostAt, setLastHeartLostAt] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem("notho-last-heart-lost");
    return v ? parseInt(v, 10) : null;
  });
  const [showNoHearts, setShowNoHearts] = useState(false);
  const syncHeartsToSupabase = React.useCallback(
    async (nextHearts: number) => {
      if (!progress.userId) return;
      await supabase
        .from("user_progress")
        .update({ hearts: Math.max(0, Math.min(MAX_HEARTS, nextHearts)) })
        .eq("user_id", progress.userId);
    },
    [progress.userId]
  );

  // Persist hearts to localStorage (local cache) + Supabase
  useEffect(() => {
    localStorage.setItem("notho-hearts", String(hearts));
  }, [hearts]);
  useEffect(() => {
    if (lastHeartLostAt !== null) {
      localStorage.setItem("notho-last-heart-lost", String(lastHeartLostAt));
      // Sync to Supabase so cross-device heart regen is accurate
      if (progress.userId) {
        void supabase
          .from("user_progress")
          .update({ last_heart_lost_at: lastHeartLostAt })
          .eq("user_id", progress.userId);
      }
    }
  }, [lastHeartLostAt, progress.userId]);

  useEffect(() => {
    if (!progress.userId) return;
    void (async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("hearts, last_heart_lost_at")
        .eq("user_id", progress.userId)
        .maybeSingle();
      const HEARTS_CAP = MAX_HEARTS;
      const heartsWithRegen = (count: number, lastLostMs: number | null): number => {
        const base = Math.max(0, Math.min(HEARTS_CAP, count));
        if (base >= HEARTS_CAP || !lastLostMs) return base;
        const regained = Math.floor((Date.now() - lastLostMs) / HEART_REGEN_MS);
        return Math.min(HEARTS_CAP, base + regained);
      };

      const localHeartsRaw = parseInt(localStorage.getItem("notho-hearts") ?? String(HEARTS_CAP), 10);
      const localHearts = Number.isNaN(localHeartsRaw) ? HEARTS_CAP : localHeartsRaw;
      const localLastLostRaw = localStorage.getItem("notho-last-heart-lost");
      const localLastLost = localLastLostRaw ? parseInt(localLastLostRaw, 10) : null;

      const remoteHeartsRaw = Number((data as any)?.hearts);
      const remoteHearts = Number.isFinite(remoteHeartsRaw) ? remoteHeartsRaw : HEARTS_CAP;
      const remoteLastLost = (data as any)?.last_heart_lost_at as number | null | undefined;

      const localEffective = heartsWithRegen(localHearts, localLastLost);
      const remoteEffective = heartsWithRegen(remoteHearts, remoteLastLost ?? null);
      const mergedHearts = Math.max(localEffective, remoteEffective);

      setHearts(mergedHearts);
      localStorage.setItem("notho-hearts", String(mergedHearts));

      let mergedLastLost: number | null = null;
      if (mergedHearts >= HEARTS_CAP) {
        localStorage.removeItem("notho-last-heart-lost");
        setLastHeartLostAt(null);
      } else {
        mergedLastLost =
          localLastLost && remoteLastLost
            ? Math.min(localLastLost, remoteLastLost)
            : localLastLost ?? remoteLastLost ?? null;
        if (mergedLastLost) {
          localStorage.setItem("notho-last-heart-lost", String(mergedLastLost));
          setLastHeartLostAt(mergedLastLost);
        }
      }

      const remoteLastLostNorm = remoteLastLost ?? null;
      if (mergedHearts !== remoteEffective || mergedLastLost !== remoteLastLostNorm) {
        await supabase
          .from("user_progress")
          .update({
            hearts: mergedHearts,
            last_heart_lost_at: mergedLastLost,
          })
          .eq("user_id", progress.userId);
      }
    })().catch(() => {});
  }, [progress.userId]);

  // Auto-regen: 1 heart per hour
  useEffect(() => {
    if (hearts >= MAX_HEARTS || !lastHeartLostAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastHeartLostAt;
      const toAdd = Math.floor(elapsed / HEART_REGEN_MS);
      if (toAdd > 0) {
        setHearts((h) => {
          const next = Math.min(h + toAdd, MAX_HEARTS);
          if (next !== h) {
            void syncHeartsToSupabase(next);
          }
          if (next >= MAX_HEARTS) {
            localStorage.removeItem("notho-last-heart-lost");
            setLastHeartLostAt(null);
          } else {
            setLastHeartLostAt(Date.now() - (elapsed % HEART_REGEN_MS));
          }
          return next;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hearts, lastHeartLostAt, syncHeartsToSupabase]);

  const loseHeart = () => {
    setHearts((h) => {
      if (h <= 0) return h;
      const next = h - 1;
      localStorage.setItem("notho-hearts", String(next));
      localStorage.setItem("notho-last-heart-lost", String(Date.now()));
      void syncHeartsToSupabase(next);
      if (next === 0) {
        queueMicrotask(() => setShowNoHearts(true));
      }
      return next;
    });
    setLastHeartLostAt(Date.now());
  };

  const gainHeart = () => {
    setHearts((h) => {
      const next = Math.min(h + 1, MAX_HEARTS);
      if (next !== h) {
        void syncHeartsToSupabase(next);
      }
      return next;
    });
  };

  const heartsRegenInfo = (): { nextHeartIn: string; minutesLeft: number } | null => {
    if (hearts >= MAX_HEARTS || !lastHeartLostAt) return null;
    const elapsed = Date.now() - lastHeartLostAt;
    const remaining = HEART_REGEN_MS - (elapsed % HEART_REGEN_MS);
    const minutes = Math.ceil(remaining / 60000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { nextHeartIn: h > 0 ? `${h}h ${m}m` : `${m}m`, minutesLeft: minutes };
  };
  // ── End Hearts ─────────────────────────────────────────────────────────────

  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<string[]>([]);

  // ── Weekly challenge ─────────────────────────────────────────────────────
  const WEEKLY_CHALLENGES = [
    { id: "wc-7lessons",         text: "Complete 7 lessons this week",                         target: 7,   unit: "lessons",          xp: 250 },
    { id: "wc-5streak",          text: "Maintain your streak for 5 days",                       target: 5,   unit: "streak_days",       xp: 200 },
    { id: "wc-perfect",          text: "Get a perfect score on 5 lessons",                      target: 5,   unit: "perfect",           xp: 350 },
    { id: "wc-200xp",            text: "Earn 200 XP in a single day",                           target: 200, unit: "daily_xp",          xp: 280 },
    { id: "wc-5lessons-perfect", text: "Complete 5 lessons with at least 80% score",            target: 5,   unit: "lessons",           xp: 300 },
    // Behavior-linked challenges - connect to real money actions, not just lesson counts
    { id: "wc-budget-3days",     text: "Open the Budget Planner 3 days this week",              target: 3,   unit: "budget_days",       xp: 200 },
    { id: "wc-calculator-2",     text: "Use the Investment Calculator twice this week",          target: 2,   unit: "calculator_days",   xp: 175 },
    { id: "wc-advanced-lesson",  text: "Complete a lesson in any Advanced course",              target: 1,   unit: "advanced_lesson",   xp: 300 },
  ];
  // Returns "YYYY-MM-DD" of the most recent Sunday (week anchor) in SAST
  const getSundayKey = () => sastSundayDate();
  const getWeeklyChallenge = () => {
    // Use the Sunday date string as a stable, deterministic seed - resets only on Sunday
    const weekKey = getSundayKey();
    let seed = 0;
    for (let i = 0; i < weekKey.length; i++) seed = ((seed << 5) - seed + weekKey.charCodeAt(i)) | 0;
    seed = Math.abs(seed);
    const idx = seed % WEEKLY_CHALLENGES.length;
    return { ...WEEKLY_CHALLENGES[idx], weekKey };
  };
  const weeklyChallenge = getWeeklyChallenge();

  // Weekly challenge progress is kept in a per-user stats object that is
  // merged (never clobbered) with user_progress.weekly_challenge_progress,
  // so progress made on any device counts on every device.
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>(() => emptyWeeklyStats());
  const [localClaimed, setLocalClaimed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!progress.userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeeklyStats(emptyWeeklyStats());
      setLocalClaimed(false);
      return;
    }
    setWeeklyStats(readWeeklyStats(progress.userId));
    setLocalClaimed(
      localStorage.getItem(`notho-wc-claimed-${weeklyChallenge.weekKey}-${weeklyChallenge.id}`) === "true"
    );
    // Push local stats up + pull other devices' progress down (merge on server).
    let cancelled = false;
    void syncWeeklyStats(progress.userId, readWeeklyStats(progress.userId)).then((merged) => {
      if (merged && !cancelled) setWeeklyStats(merged);
    });
    return () => { cancelled = true; };
  }, [progress.userId, progress.loaded, weeklyChallenge.weekKey, weeklyChallenge.id]);

  // Claimed on ANY device (server map), or claimed just now on this one.
  const challengeRewardClaimed =
    localClaimed ||
    progress.isWeeklyChallengeClaimed(weeklyChallenge.weekKey, weeklyChallenge.id);

  const weeklyProgress: WeeklyProgressJSON = {
    lessonsCompleted: weeklyStats.lessonsCompleted,
    xpEarned: weeklyStats.xpEarned,
    perfectLessons: weeklyStats.perfectLessons,
    dailyXp: dailyXP,
    completed: challengeRewardClaimed,
    streakDaysThisWeek: weeklyStats.days.length,
    lastLessonDay: weeklyStats.lastLessonDay,
    budgetDaysThisWeek: weeklyStats.budgetDays.length,
    calculatorDaysThisWeek: weeklyStats.calculatorDays.length,
    advancedLessonsThisWeek: weeklyStats.advancedLessons,
  };

  const challengeProgress = challengeRewardClaimed
    ? weeklyChallenge.target
    : Math.min(
        progressNumberFromWeeklyState(weeklyChallenge, weeklyProgress, progress.streak),
        weeklyChallenge.target
      );

  const challengeComplete =
    weeklyProgress.completed || challengeProgress >= weeklyChallenge.target;

  /** Bump weekly stats locally + fire the server merge (used by budget/calc views too). */
  const recordWeeklyStat = (bump: Parameters<typeof bumpWeeklyStats>[1]) => {
    setWeeklyStats(bumpWeeklyStats(progress.userId, bump));
  };
  // ── End weekly challenge ──────────────────────────────────────────────────

  // consumeStreakFreeze removed, handled via localStorage directly

  const [reviewAnswers, setReviewAnswers] = useState<{
    question: string; yourAnswer: string; correct: string; wasCorrect: boolean;
  }[] | null>(null);
  const [lessonSummary, setLessonSummary] = useState<{
    xpEarned: number;
    timeSeconds: number;
    accuracy: number;
    streak: number;
    isPerfect: boolean;
    choice: "next" | "course";
    nextLessonId: string | null;
    courseId: string;
    lessonId: string | null;
  } | null>(null);
  const [xpToast, setXpToast] = useState<{ amount: number; id: number } | null>(null);

  const [currentLessonState, setCurrentLessonState] = useState<{
    courseId: string | null;
    lessonId: string | null;
    stepIndex: number;
    steps: WorkingStep[];
    answers: Record<number, unknown>;
    correctCount: number;
    /** Total wrong submissions this run (drives "perfect" + accuracy). */
    mistakes: number;
    /** Question ids answered correctly at least once — the completion gate. */
    masteredQids: number[];
    /** Question ids missed at least once — for first-try accuracy. */
    mistakenQids: number[];
  }>({
    courseId: null,
    lessonId: null,
    stepIndex: 0,
    steps: [],
    answers: {},
    correctCount: 0,
    mistakes: 0,
    masteredQids: [],
    mistakenQids: [],
  });

  // ── Sync daily goal from Supabase when settings load ─────────────────────
  useEffect(() => {
    if (userSettings.loaded) {
      setDailyGoal(userSettings.settings.dailyGoal);
    }
  }, [userSettings.loaded, userSettings.settings.dailyGoal]);

  // Legacy per-day localStorage XP key: still written for on-device readers
  // (daily quest flags, XP history chart) but no longer read as the source
  // of truth — progress.dailyXp (server-synced) is.
  const echoDailyXpToLegacyKey = (amount: number) => {
    if (typeof window === "undefined") return;
    try {
      const key = `notho-daily-xp-${sastToday()}`;
      const prev = parseInt(localStorage.getItem(key) ?? "0", 10);
      localStorage.setItem(key, String((Number.isNaN(prev) ? 0 : prev) + amount));
    } catch { /* best-effort */ }
  };

  const addXP = (amount: number) => {
    progress.addXP(amount);
    echoDailyXpToLegacyKey(amount);
    setXpToast({ amount, id: Date.now() });
    setTimeout(() => setXpToast(null), 2000);
  };

  const ADVANCED_COURSE_IDS = React.useMemo(
    () => new Set(LEVEL_3_COURSES.map((c) => c.id)),
    []
  );

  const completeLesson = async (
    courseId: string,
    lessonId: string,
    xpEarned: number,
    isPerfect = false
  ): Promise<{ streak: number; xpAwarded: number }> => {
    const lessonKey = `${courseId}:${lessonId}`;
    const alreadyDone = progress.completedLessons.has(lessonKey);
    if (!alreadyDone) {
      progress.completeLesson(lessonKey);
    }

    const today = sastToday();
    const replayKey = replayXpStorageKey(progress.userId, lessonKey, today);
    const replayClaimedToday =
      typeof window !== "undefined" && Boolean(localStorage.getItem(replayKey));

    const xpAwarded = computeLessonXpAward(xpEarned, alreadyDone, replayClaimedToday);
    // A run "counts" (lessons-today, weekly counters) when it awarded XP:
    // first completion, or first replay of the day. Blocks replay farming.
    const counted = xpAwarded > 0;
    const perfectFirstTime = isPerfect && !alreadyDone;

    // Server-backed counters (cross-device): lifetime perfect + lessons today.
    progress.recordLessonStats({ counted, perfect: perfectFirstTime });

    // Weekly challenge counters (merged server-side, never clobbered).
    recordWeeklyStat({
      lessonsCompleted: counted ? 1 : 0,
      xpEarned: xpAwarded,
      perfectLessons: perfectFirstTime ? 1 : 0,
      advancedLessons: counted && ADVANCED_COURSE_IDS.has(courseId) ? 1 : 0,
      lessonDayToday: true,
    });

    // Legacy on-device daily-lessons key (still read by daily quest flags).
    if (counted && typeof window !== "undefined") {
      try {
        const k = `notho-daily-lessons-${today}`;
        const prev = parseInt(localStorage.getItem(k) ?? "0", 10);
        localStorage.setItem(k, String((Number.isNaN(prev) ? 0 : prev) + 1));
      } catch { /* best-effort */ }
    }

    const newStreak = await progress.applyStreakAfterLesson();

    if (xpAwarded > 0) {
      addXP(xpAwarded);
      if (alreadyDone && typeof window !== "undefined") {
        localStorage.setItem(replayKey, "1");
      }
    }

    if (!alreadyDone) {
      analytics.streakUpdated(newStreak);
    }

    if (progress.userId) {
      void supabase
        .from("user_progress")
        .update({ last_lesson_at: new Date().toISOString() })
        .eq("user_id", progress.userId);
    }

    return { streak: newStreak, xpAwarded };
  };

  const isLessonCompleted = (courseId: string, lessonId: string) =>
    progress.completedLessons.has(`${courseId}:${lessonId}`);

  const startLesson = (courseId: string, lessonId: string): boolean => {
    const course = CONTENT_DATA.courses.find((c) => c.id === courseId);
    if (!course) return false;
    let found: import("@/data/content").Lesson | undefined;
    for (const unit of course.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        found = lesson;
        break;
      }
    }
    if (!found) return false;
    // Resolve the lesson bank: bank-backed lessons pick one variant per slot
    // (fresh per attempt); legacy lessons return their static steps. Never let a
    // resolution error or empty result silently swallow the tap — fall back to
    // the lesson's static steps so the lesson always opens.
    const attemptNo = nextAttemptNo(progress.userId, lessonId);
    let resolved = found.steps ?? [];
    try {
      const r = resolveLessonSteps(found, { userId: progress.userId, attemptNo });
      if (r.length > 0) resolved = r;
    } catch {
      /* keep the static-steps fallback */
    }
    if (resolved.length === 0) return false;
    setCurrentLessonState({
      courseId,
      lessonId,
      stepIndex: 0,
      // assignQids: tag each question with a stable id so re-queued copies
      // (mastery loop) track completion per question, not per array index.
      // Seeded shuffle: breaks authored answer-position patterns (85% of
      // correct answers were option B) while staying stable across resume.
      steps: shuffleLessonSteps(
        assignQids(resolved),
        lessonShuffleSeed(progress.userId, courseId, lessonId)
      ) as WorkingStep[],
      answers: {},
      correctCount: 0,
      mistakes: 0,
      masteredQids: [],
      mistakenQids: [],
    });
    // NOTE: We intentionally do NOT call setRoute here. Navigation is handled
    // by the NothoContext wrapper which has access to router.push. Calling the
    // raw setRoute here was the original bug — it updated React state but never
    // triggered Next.js navigation.
    return true;
  };

  // ── Mid-lesson save (survives refresh / app kill / crash) ────────────────
  // Written on EVERY step so the learn page can offer "Resume lesson" and the
  // lesson page can restore position instead of dumping the user back to the
  // course. Cleared on finalize (lesson page) and on resume (learn page).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = currentLessonState;
    if (!progress.userId || !s.courseId || !s.lessonId || s.steps.length === 0) return;
    try {
      localStorage.setItem(
        "notho-lesson-progress",
        JSON.stringify({
          userId: progress.userId,
          courseId: s.courseId,
          lessonId: s.lessonId,
          lessonTitle: getLessonTitle(s.courseId, s.lessonId) ?? undefined,
          stepIndex: s.stepIndex,
          // Persist the resolved working steps so re-queued copies (mastery
          // loop) survive a refresh — the queue can't be re-derived from
          // static content once questions have been appended.
          steps: s.steps,
          answers: s.answers,
          correctCount: s.correctCount,
          mistakes: s.mistakes,
          masteredQids: s.masteredQids,
          mistakenQids: s.mistakenQids,
          savedAt: Date.now(),
        })
      );
    } catch { /* best-effort */ }
  }, [currentLessonState, progress.userId]);

  // ── One-time adoption of pre-sync perfect-lesson count ───────────────────
  // Older builds tracked perfect lessons only in localStorage. Adopt that
  // count into the server total once (after the first server load, and only
  // if the server total is still 0) so an app update never wipes badges.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!progress.loaded || !progress.userId) return;
    try {
      const raw = localStorage.getItem("notho-perfect-lessons");
      if (raw == null) return;
      localStorage.removeItem("notho-perfect-lessons");
      const legacy = parseInt(raw, 10);
      if (!Number.isNaN(legacy) && legacy > 0 && progress.perfectLessons === 0) {
        progress.adoptLegacyPerfectLessons(legacy);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.loaded, progress.userId]);

  // Persist route so refresh returns to same section
  useEffect(() => {
    const simpleRoutes = ["learn", "quests", "calculator", "profile", "leaderboard", "settings", "budget"];
    if (simpleRoutes.includes(route.name)) {
      localStorage.setItem("notho-last-route", route.name);
    }
  }, [route.name]);

  // ── Restore profile settings from Supabase when user logs in ─────────────
  // Prevents returning users from seeing onboarding again if localStorage was
  // cleared (new device, cleared cache, etc.)
  useEffect(() => {
    if (!progress.userId) return;
    if (route.name !== "onboarding") return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("goal, goal_description, age_range, username, full_name")
        .eq("user_id", progress.userId!)
        .maybeSingle();
      const hasIdentityName =
        Boolean(profile?.username && String(profile.username).trim()) ||
        Boolean(profile?.full_name && String(profile.full_name).trim());
      if (profile?.goal || hasIdentityName) {
        localStorage.setItem("notho-onboarded", "true");
        if (profile?.goal) localStorage.setItem("notho-user-goal", profile.goal);
        if (profile?.goal_description) localStorage.setItem("notho-goal-description", profile.goal_description);
        if (profile?.age_range) localStorage.setItem("notho-age-range", profile.age_range);
        // Sync username so the duplicate-username-prompt check skips the DB round-trip
        if (profile?.username) localStorage.setItem("notho-username", profile.username);
        setRoute({ name: "learn" });
      }
    })().catch(() => {});
  }, [progress.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    userId: progress.userId,
    progressReady: progress.ready,
    hearts,
    maxHearts: MAX_HEARTS,
    loseHeart,
    gainHeart,
    heartsRegenInfo,
    userData: {
      xp: progress.xp,
      level: Math.floor(progress.xp / 500) + 1,
      streak: progress.streak,
      longestStreak: progress.longestStreak,
      totalCompleted: progress.completedLessons.size,
      dailyXP,
      dailyGoal,
      badges: userBadges,
      // Server-backed (daily_lessons_today): consistent across devices.
      lessonsToday: progress.dailyLessons,
    } satisfies UserData,
    dailyXP,
    dailyGoal,
    setDailyGoal: (g: number) => {
      setDailyGoal(g);
      // Also persist to Supabase via userSettings
      void userSettings.setDailyGoal(g);
    },
    userSettings,
    resetProgress: progress.resetProgress,
    route,
    setRoute,
    isLessonCompleted,
    completedLessons: progress.completedLessons,
    completeLesson,
    currentLessonState,
    setCurrentLessonState,
    newlyEarnedBadges,
    setNewlyEarnedBadges,
    xpToast,
    lessonSummary,
    setLessonSummary,
    reviewAnswers,
    setReviewAnswers,
    weeklyChallenge,
    weeklyProgress,
    challengeProgress,
    challengeComplete,
    challengeRewardClaimed,
    claimChallengeReward: () => {
      if (!challengeComplete || challengeRewardClaimed) return;
      // Server-authoritative atomic claim: XP is granted by the RPC only if
      // this device wins the claim. A second device (or a re-tap racing the
      // network) gets already_claimed and NO XP — the old localStorage-only
      // guard allowed one claim per device.
      void (async () => {
        const res = await progress.claimWeeklyChallengeServer(
          weeklyChallenge.weekKey,
          weeklyChallenge.id,
          weeklyChallenge.xp
        );
        if (res.ok) {
          echoDailyXpToLegacyKey(weeklyChallenge.xp);
          setXpToast({ amount: weeklyChallenge.xp, id: Date.now() });
          setTimeout(() => setXpToast(null), 2000);
        }
        if (res.ok || res.alreadyClaimed) {
          setLocalClaimed(true);
          try {
            localStorage.setItem(
              `notho-wc-claimed-${weeklyChallenge.weekKey}-${weeklyChallenge.id}`,
              "true"
            );
          } catch { /* best-effort */ }
        }
      })();
    },
    tryDeductXp: progress.tryDeductXp,
    freezeCount: progress.freezeCount,
    buyStreakFreeze: progress.buyStreakFreeze,
    useFreeze: progress.useFreeze,
    weeklyXp: progress.weeklyXp,
    perfectLessons: progress.perfectLessons,
    refreshProgress: progress.refresh,
    recordWeeklyStat,
    addXP,
    showNoHearts,
    setShowNoHearts,
    startLesson,
    userBadges,
    setUserBadges,
  };

  return value;
}

export type NothoState = ReturnType<typeof useNothoState>;
