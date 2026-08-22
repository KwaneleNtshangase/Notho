"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sastOffset, sastToday, sastWeekKey } from "@/lib/dates";
import { clearWeeklyStats } from "@/lib/weeklyStats";
import {
  isTombstone,
  mergeDailyFlags,
  mergeResume,
  REVIEW_MIN_CARDS,
  reviewQualifiesForStreak,
  reviewXp,
  type DailyFlags,
  type LessonResume,
  type LessonResumeValue,
} from "@/lib/sync/mergeRules";
import {
  enqueueCrossDeviceWrite,
  flushCrossDeviceQueue,
} from "@/lib/sync/crossDeviceQueue";
import {
  clearLocalResume,
  makeResumeTombstone,
  readLocalResume,
  resolveOfferableResume,
  withLocalSteps,
  writeLocalResume,
} from "@/lib/sync/lessonResume";
import { readLocalDailyFlags, writeLocalDailyFlags } from "@/lib/sync/dailyFlags";

type WeeklyCompletionEntry = {
  completedAt: string;
  bonusXP: number;
};

export type WeeklyCompletionsMap = Record<string, WeeklyCompletionEntry>;
export type { WeeklyCompletionEntry };

type ProgressState = {
  xp: number;
  /**
   * Lifetime XP spent (streak freezes, etc.). `xp` above is the spendable
   * balance; lifetime earned = xp + xpSpent. Tracked so cross-device merges
   * keep a purchase authoritative without "highest xp wins" refunding it.
   */
  xpSpent: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  completedLessons: string[];
  freezeCount: number;
  weeklyXp: number;
  weekKey: string;
  /** Lifetime perfect-lesson count — server column perfect_lessons_total. */
  perfectLessons: number;
  /** XP earned today (SAST) — server columns daily_xp_today/daily_xp_date. */
  dailyXp: number;
  /** Lessons finished today (SAST) — server daily_lessons_today/_date. */
  dailyLessons: number;
  dayKey: string;
  /** Server-authoritative weekly challenge claims (weekly_completions). */
  weeklyCompletions: WeeklyCompletionsMap;
};

const DEFAULT_STATE: ProgressState = {
  xp: 0,
  xpSpent: 0,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  completedLessons: [],
  freezeCount: 0,
  weeklyXp: 0,
  weekKey: "",
  perfectLessons: 0,
  dailyXp: 0,
  dailyLessons: 0,
  dayKey: "",
  weeklyCompletions: {},
};

// ── Offline-first cache ────────────────────────────────────────────────────────
// Write-through localStorage cache so the app loads instantly even on
// poor / no connectivity (SA users on prepaid data and during load-shedding).
// Supabase remains the source of truth - cache is overwritten on every
// successful Supabase read; it only fills the gap while waiting for network.
// The key is per-user AND versioned; new fields parse with defaults so an
// app update never invalidates (or corrupts) an older cache.
const PROGRESS_CACHE_KEY = "notho-progress-v1";

function progressCacheKey(userId: string): string {
  return `${PROGRESS_CACHE_KEY}-${userId}`;
}

function readProgressCache(userId: string | null): ProgressState | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(progressCacheKey(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<ProgressState>;
    return {
      xp: Number(p.xp ?? 0),
      xpSpent: Number(p.xpSpent ?? 0),
      streak: Number(p.streak ?? 0),
      longestStreak: Number(p.longestStreak ?? 0),
      lastActivityDate: p.lastActivityDate ?? null,
      completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
      freezeCount: Number(p.freezeCount ?? 0),
      weeklyXp: Number(p.weeklyXp ?? 0),
      weekKey: p.weekKey ?? "",
      perfectLessons: Number(p.perfectLessons ?? 0),
      dailyXp: Number(p.dailyXp ?? 0),
      dailyLessons: Number(p.dailyLessons ?? 0),
      dayKey: p.dayKey ?? "",
      weeklyCompletions:
        p.weeklyCompletions && typeof p.weeklyCompletions === "object"
          ? (p.weeklyCompletions as WeeklyCompletionsMap)
          : {},
    };
  } catch {
    return null;
  }
}

function writeProgressCache(s: ProgressState, userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(progressCacheKey(userId), JSON.stringify(s));
  } catch { /* ignore quota errors - cache is best-effort */ }
}

function clearProgressCache(userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try { localStorage.removeItem(progressCacheKey(userId)); } catch { /* ignore */ }
}

function getCurrentWeekKey(): string {
  return sastWeekKey();
}

// ── Account-switch hygiene ─────────────────────────────────────────────────────
// Several legacy keys are NOT user-scoped. If a different account signs in on
// the same device, wiping them stops user A's hearts / daily counters /
// challenge claims from leaking into (or being overwritten by) user B.
// Per-user keys (progress cache, pending queue, weekly stats) are left alone.
const EPHEMERAL_KEY_PREFIXES = [
  "notho-hearts",
  "notho-last-heart-lost",
  "notho-perfect-lessons",
  "notho-longest-streak",
  "notho-daily-xp-",
  "notho-daily-lessons-",
  "notho-wc-",
  "notho-lesson-progress",
  "notho-perfect-today-",
  "notho-shared-today-",
  "notho-correct-streak-today-",
  "notho-concept-reviewed-",
  "notho-expense-today-",
  "notho-budget-visited-",
  "notho-calc-visited-",
  "notho-pending-streak-sync",
  "notho-review-counted-",
  "notho-pinned-courses",
  "notho-onboarded",
  "notho-user-goal",
  "notho-goal-description",
  "notho-age-range",
  "notho-username",
  "notho-daily-goal",
];

function wipeEphemeralLocalState(): void {
  if (typeof window === "undefined") return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && EPHEMERAL_KEY_PREFIXES.some((p) => key.startsWith(p))) doomed.push(key);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch { /* best-effort */ }
}

const LAST_UID_KEY = "notho-last-uid";

function handleAccountSwitch(newUid: string | null): void {
  if (typeof window === "undefined" || !newUid) return;
  try {
    const prev = localStorage.getItem(LAST_UID_KEY);
    if (prev && prev !== newUid) wipeEphemeralLocalState();
    localStorage.setItem(LAST_UID_KEY, newUid);
  } catch { /* ignore */ }
}

// ── Pending delta queue ─────────────────────────────────────────────────────
// XP (and now perfect/daily counters) are additive server-side ledgers
// (column = column + delta) so every gain across every device counts.
// Deltas are NOT idempotent, so an earn whose network write fails must not
// be silently lost OR blindly retried in a way that double-counts. We
// durably queue unsynced deltas in localStorage and flush the accumulated
// total exactly once per successful round-trip.
type PendingDeltas = {
  delta: number;
  weeklyDelta: number;
  weekKey: string;
  perfectDelta: number;
  dailyXpDelta: number;
  dailyLessonsDelta: number;
  dayKey: string;
};

function pendingXpKey(userId: string): string {
  return `notho-pending-xp-${userId}`;
}

function readPendingDeltas(userId: string | null): PendingDeltas | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(pendingXpKey(userId));
    if (!raw) return null;
    // Older app versions stored {delta, weeklyDelta, weekKey} only — the
    // extra fields default to 0 so an app update never drops a queued earn.
    const p = JSON.parse(raw) as Partial<PendingDeltas>;
    const out: PendingDeltas = {
      delta: Number(p.delta ?? 0) || 0,
      weeklyDelta: Number(p.weeklyDelta ?? 0) || 0,
      weekKey: p.weekKey ?? getCurrentWeekKey(),
      perfectDelta: Number(p.perfectDelta ?? 0) || 0,
      dailyXpDelta: Number(p.dailyXpDelta ?? 0) || 0,
      dailyLessonsDelta: Number(p.dailyLessonsDelta ?? 0) || 0,
      dayKey: p.dayKey ?? sastToday(),
    };
    const hasAny =
      out.delta || out.weeklyDelta || out.perfectDelta || out.dailyXpDelta || out.dailyLessonsDelta;
    return hasAny ? out : null;
  } catch {
    return null;
  }
}

type DeltaBump = {
  xp?: number;
  weekly?: number;
  perfect?: number;
  dailyXp?: number;
  dailyLessons?: number;
};

function enqueuePendingDeltas(userId: string | null, bump: DeltaBump): void {
  if (typeof window === "undefined" || !userId) return;
  const xp = bump.xp ?? 0;
  const weekly = bump.weekly ?? 0;
  const perfect = bump.perfect ?? 0;
  const dailyXp = bump.dailyXp ?? 0;
  const dailyLessons = bump.dailyLessons ?? 0;
  if (!xp && !weekly && !perfect && !dailyXp && !dailyLessons) return;
  const weekKey = getCurrentWeekKey();
  const dayKey = sastToday();
  try {
    const cur = readPendingDeltas(userId);
    const sameWeek = cur?.weekKey === weekKey;
    const sameDay = cur?.dayKey === dayKey;
    const next: PendingDeltas = {
      // Lifetime counters always accumulate, regardless of week/day rollover.
      delta: (cur?.delta ?? 0) + xp,
      perfectDelta: (cur?.perfectDelta ?? 0) + perfect,
      // Weekly/daily portions reset when the queue crosses a week/day
      // boundary — stale period counters are worthless, lifetime is not.
      weeklyDelta: (sameWeek ? cur?.weeklyDelta ?? 0 : 0) + weekly,
      weekKey,
      dailyXpDelta: (sameDay ? cur?.dailyXpDelta ?? 0 : 0) + dailyXp,
      dailyLessonsDelta: (sameDay ? cur?.dailyLessonsDelta ?? 0 : 0) + dailyLessons,
      dayKey,
    };
    localStorage.setItem(pendingXpKey(userId), JSON.stringify(next));
  } catch { /* best-effort */ }
}

function clearPendingDeltas(userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try { localStorage.removeItem(pendingXpKey(userId)); } catch { /* ignore */ }
}

type ProgressRow = {
  xp?: number; xp_spent?: number; completed_lessons?: string[];
  weekly_xp?: number; week_key?: string; longest_streak?: number; streak?: number;
  last_activity_date?: string | null; streak_freeze_count?: number;
  perfect_lessons_total?: number;
  daily_xp_today?: number; daily_xp_date?: string;
  daily_lessons_today?: number; daily_lessons_date?: string;
  weekly_completions?: WeeklyCompletionsMap | null;
  /** Cross-device mid-lesson resume point (steps are never stored server-side). */
  lesson_resume?: LessonResumeValue | null;
  /** Cross-device daily-challenge condition flags for one SAST day. */
  daily_flags?: DailyFlags | null;
};

// Flush the queued deltas to the server. The queue is CLAIMED (read + cleared
// synchronously) before the network call, so two rapid earns can't both send
// the same accumulated total and double-count. If the write fails, the claimed
// deltas are re-queued (merged with anything queued meanwhile) for the next
// attempt. JS is single-threaded, so read-then-clear is atomic with respect to
// other earns in THIS tab; the Web Locks API (where available) additionally
// stops a second tab/PWA window from flushing the same queue concurrently.
async function flushPendingDeltas(userId: string): Promise<ProgressRow | null> {
  const doFlush = async (): Promise<ProgressRow | null> => {
    const claimed = readPendingDeltas(userId);
    if (!claimed) return null;
    clearPendingDeltas(userId);
    const { data, error } = await supabase.rpc("apply_progress_delta", {
      p_user_id: userId,
      p_xp_delta: claimed.delta,
      p_weekly_delta: claimed.weeklyDelta,
      p_week_key: claimed.weekKey,
      p_completed_lessons: null,
      p_longest_streak: null,
      p_perfect_delta: claimed.perfectDelta,
      p_daily_xp_delta: claimed.dailyXpDelta,
      p_daily_lessons_delta: claimed.dailyLessonsDelta,
      p_day_key: claimed.dayKey,
    });
    if (error) {
      // Merge the claimed deltas back with anything queued meanwhile.
      enqueuePendingDeltas(userId, {
        xp: claimed.delta,
        weekly: claimed.weeklyDelta,
        perfect: claimed.perfectDelta,
        dailyXp: claimed.dailyXpDelta,
        dailyLessons: claimed.dailyLessonsDelta,
      });
      return null;
    }
    return (data as ProgressRow) ?? null;
  };

  if (typeof navigator !== "undefined" && "locks" in navigator && navigator.locks?.request) {
    try {
      return await navigator.locks.request(`notho-flush-${userId}`, doFlush);
    } catch {
      return doFlush();
    }
  }
  return doFlush();
}

async function streakSyncAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const PROGRESS_SELECT =
  "xp,xp_spent,streak,longest_streak,last_activity_date,completed_lessons," +
  "streak_freeze_count,weekly_xp,week_key,perfect_lessons_total," +
  "daily_xp_today,daily_xp_date,daily_lessons_today,daily_lessons_date," +
  "weekly_completions,lesson_resume,daily_flags";

/** Minimum gap between automatic refreshes (focus/visibility/online). */
const AUTO_REFRESH_MIN_MS = 15_000;

/**
 * Normalise period counters before applying an increment: when the SAST day
 * or week has rolled over since the last write, zero ALL counters of that
 * period together. Without this, bumping one field (e.g. dailyXp) stamped
 * today's dayKey while the sibling field (dailyLessons) kept yesterday's
 * value.
 */
function rollPeriods(prev: ProgressState, wk: string, today: string): ProgressState {
  let next = prev;
  if (prev.weekKey !== wk) {
    next = { ...next, weeklyXp: 0, weekKey: wk };
  }
  if (prev.dayKey !== today) {
    next = { ...next, dailyXp: 0, dailyLessons: 0, dayKey: today };
  }
  return next;
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  /**
   * The mid-lesson resume point to offer as "Continue", already reconciled
   * across devices. null = nothing to continue.
   */
  const [lessonResume, setLessonResume] = useState<LessonResume | null>(null);
  const [ready, setReady] = useState(false);
  /** True after the first successful server reconciliation for this user. */
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const completedLessons = useMemo(() => new Set(state.completedLessons), [state.completedLessons]);

  // Refs guarding the load/refresh cycle against races and stale users.
  const userIdRef = useRef<string | null>(null);
  const loadInFlightRef = useRef(false);
  const lastLoadAtRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const uid = data.session?.user?.id ?? null;
      handleAccountSwitch(uid);
      userIdRef.current = uid;
      setUserId(uid);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      handleAccountSwitch(uid);
      userIdRef.current = uid;
      setUserId(uid);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Load (or re-load) the authoritative progress row. Steps:
   *  1. Flush queued deltas so the row we read already includes them.
   *  2. Union cache-only lessons into the DB (heals failed writes; the RPC
   *     only ever ADDS, so this can never shrink server data).
   *  3. Read the reconciled row; defensively union lessons locally too.
   * Safe to call repeatedly — used on mount AND on focus/visibility/online so
   * a device that stays open picks up progress made on other devices.
   */
  const loadFromServer = useCallback(async (uid: string): Promise<void> => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    try {
      await flushPendingDeltas(uid).catch(() => null);
      // Same cycle, same guarantees: anything queued while offline goes up
      // before we read, so the row we read already reflects it.
      await flushCrossDeviceQueue(uid).catch(() => null);

      const cachePre = readProgressCache(uid);
      let rpcData: ProgressRow | null = null;
      if (cachePre && cachePre.completedLessons.length > 0) {
        const { data, error } = await supabase.rpc("apply_progress_delta", {
          p_user_id: uid,
          p_xp_delta: 0,
          p_weekly_delta: 0,
          p_week_key: null,
          p_completed_lessons: cachePre.completedLessons,
          p_longest_streak: cachePre.longestStreak,
        });
        if (!error && data) rpcData = data as ProgressRow;
      }

      let data: ProgressRow | null = rpcData;
      if (!data) {
        const { data: selectData } = await supabase
          .from("user_progress")
          .select(PROGRESS_SELECT)
          .eq("user_id", uid)
          .maybeSingle();
        data = (selectData as ProgressRow | null) ?? null;
      }

      // User switched (or signed out) while we were fetching — drop the result.
      if (userIdRef.current !== uid) return;

      const wk = getCurrentWeekKey();
      const today = sastToday();

      // Defensive merge: never let completedLessons shrink locally to prevent
      // UI regression from read-replica lag or dropped network requests.
      const dbLessons = (data?.completed_lessons ?? []) as string[];
      const localLessons = cachePre?.completedLessons ?? [];
      const mergedLessons = Array.from(new Set([...localLessons, ...dbLessons]));

      // If a delta flush failed (still queued), reflect it in the visible
      // numbers so the user never watches their earn "disappear".
      const stillPending = readPendingDeltas(uid);

      const fresh: ProgressState = {
        xp: Math.max(0, Number(data?.xp ?? 0)) + (stillPending?.delta ?? 0),
        xpSpent: Math.max(0, Number(data?.xp_spent ?? 0)),
        streak: data?.streak ?? 0,
        longestStreak: Math.max(Number(data?.longest_streak ?? 0), Number(data?.streak ?? 0)),
        lastActivityDate: data?.last_activity_date ? String(data.last_activity_date) : null,
        completedLessons: mergedLessons,
        freezeCount: Math.max(0, Number(data?.streak_freeze_count ?? 0)),
        weeklyXp:
          (data?.week_key === wk ? Math.max(0, Number(data?.weekly_xp ?? 0)) : 0) +
          (stillPending?.weekKey === wk ? stillPending.weeklyDelta : 0),
        weekKey: wk,
        perfectLessons:
          Math.max(0, Number(data?.perfect_lessons_total ?? 0)) + (stillPending?.perfectDelta ?? 0),
        dailyXp:
          (data?.daily_xp_date === today ? Math.max(0, Number(data?.daily_xp_today ?? 0)) : 0) +
          (stillPending?.dayKey === today ? stillPending.dailyXpDelta : 0),
        dailyLessons:
          (data?.daily_lessons_date === today
            ? Math.max(0, Number(data?.daily_lessons_today ?? 0))
            : 0) + (stillPending?.dayKey === today ? stillPending.dailyLessonsDelta : 0),
        dayKey: today,
        weeklyCompletions:
          data?.weekly_completions && typeof data.weekly_completions === "object"
            ? data.weekly_completions
            : {},
      };

      // Strict date-diff evaluate on load. If the user missed >1 days and had
      // freezes, consume them now; otherwise reset locally so UI is immediate.
      const { evaluateStreak } = await import("@/lib/dates");
      const effective = evaluateStreak(fresh.streak, fresh.freezeCount, fresh.lastActivityDate);

      const finalState: ProgressState = {
        ...fresh,
        streak: effective.streak,
        freezeCount: effective.freezeCount,
        lastActivityDate: effective.lastActivityDate,
      };

      setState(finalState);
      writeProgressCache(finalState, uid);
      setLoaded(true);

      // ── Cross-device: mid-lesson resume ──────────────────────────────────
      // Rides the same load cycle as everything else rather than introducing
      // its own polling. Conflict rule: LWW on savedAt, GREATEST within the
      // same lesson (mergeResume). Local `steps` are re-attached afterwards
      // because the server copy deliberately doesn't carry them.
      {
        const serverResume = (data?.lesson_resume ?? null) as LessonResumeValue | null;
        const localResume = readLocalResume(uid);
        const mergedResume =
          localResume && serverResume
            ? mergeResume(serverResume, localResume)
            : localResume ?? serverResume;

        if (mergedResume) {
          const forLocal = withLocalSteps(mergedResume, localResume);
          // A tombstone means "there is nothing to continue" — express that
          // locally as an ABSENT record, not as a stored tombstone, because
          // the lesson page reads this key back verbatim on a replay.
          if (!forLocal || isTombstone(forLocal)) clearLocalResume(uid);
          else writeLocalResume(uid, forLocal);
          // Local was ahead (offline edit, or a device that predates this
          // column): push it up rather than dropping it.
          if (localResume && mergedResume !== serverResume) {
            enqueueCrossDeviceWrite(uid, { resume: mergedResume });
          }
        }
        setLessonResume(resolveOfferableResume(mergedResume ?? null, null));
      }

      // ── Cross-device: daily-challenge flags ──────────────────────────────
      // Merge (OR / GREATEST on the same day) and write the result back onto
      // the legacy per-day keys, so LearnView's existing reader sees what was
      // done on the other device without LearnView changing at all.
      {
        const serverFlags = (data?.daily_flags ?? null) as DailyFlags | null;
        const localFlags = readLocalDailyFlags(today);
        const mergedFlags = mergeDailyFlags(
          serverFlags && serverFlags.day ? serverFlags : null,
          localFlags
        );
        writeLocalDailyFlags(mergedFlags);
        if (JSON.stringify(serverFlags ?? null) !== JSON.stringify(mergedFlags)) {
          enqueueCrossDeviceWrite(uid, { dailyFlags: mergedFlags });
        }
      }

      // Anything the two blocks above queued goes up now. Not awaited by any
      // render path; a failure just leaves it queued for the next cycle.
      void flushCrossDeviceQueue(uid).catch(() => null);

      if (effective.streak !== fresh.streak || effective.freezeCount !== fresh.freezeCount) {
        void supabase.from("user_progress").update({
          streak: effective.streak,
          streak_freeze_count: effective.freezeCount,
          last_activity_date: effective.lastActivityDate,
        }).eq("user_id", uid);
      }

      // Retry streak sync after a lesson completed while offline / network failed
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("notho-pending-streak-sync") === "1"
      ) {
        localStorage.removeItem("notho-pending-streak-sync");
        try {
          const r = await fetch("/api/progress/sync-streak", {
            method: "POST",
            headers: await streakSyncAuthHeaders(),
            body: JSON.stringify({ userId: uid }),
          });
          const json = await r.json();
          if (json?.ok && userIdRef.current === uid) {
            setState((prev) => {
              const next = {
                ...prev,
                streak: json.streak,
                longestStreak: Math.max(json.longestStreak ?? json.streak, prev.longestStreak),
                lastActivityDate: json.lastActivityDate,
                freezeCount: json.freezeCount ?? prev.freezeCount,
              };
              writeProgressCache(next, uid);
              return next;
            });
          } else if (!json?.ok) {
            localStorage.setItem("notho-pending-streak-sync", "1");
          }
        } catch {
          localStorage.setItem("notho-pending-streak-sync", "1");
        }
      }
      lastLoadAtRef.current = Date.now();
    } finally {
      loadInFlightRef.current = false;
    }
  }, []);

  // Initial load per user: hydrate from cache instantly, then reconcile with
  // the server. Hydration and load live in ONE effect so cached state can
  // never overwrite a fresher server response.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(false);
    if (!userId) {
      setState(DEFAULT_STATE);
      return;
    }
    const cached = readProgressCache(userId);
    if (cached) setState(cached);
    loadFromServer(userId).catch((e) => console.warn("load progress failed", e));
  }, [userId, loadFromServer]);

  // Cross-device freshness: when the app regains focus/visibility/network,
  // re-pull the authoritative row (throttled). Without this, a device that
  // stays open never sees lessons completed on another device.
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const maybeRefresh = () => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastLoadAtRef.current < AUTO_REFRESH_MIN_MS) return;
      loadFromServer(userId).catch(() => undefined);
    };
    const onVisibility = () => maybeRefresh();
    window.addEventListener("focus", maybeRefresh);
    window.addEventListener("online", maybeRefresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", maybeRefresh);
      window.removeEventListener("online", maybeRefresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId, loadFromServer]);

  /** Manual refresh (also used by consumers after their own server writes). */
  const refresh = useCallback(async () => {
    const uid = userIdRef.current;
    if (uid) await loadFromServer(uid).catch(() => undefined);
  }, [loadFromServer]);

  const addXP = (amount: number) => {
    if (!amount) return;
    const wk = getCurrentWeekKey();
    const today = sastToday();
    // Optimistic local update - pure updater, no side effects (safe if React
    // double-invokes it under StrictMode). The network write is fired ONCE
    // below, outside the updater, so a delta is never double-counted.
    setState((prev) => {
      const base = rollPeriods(prev, wk, today);
      const next = {
        ...base,
        xp: Math.max(0, base.xp + amount),
        weeklyXp: base.weeklyXp + amount,
        dailyXp: base.dailyXp + amount,
      };
      writeProgressCache(next, userId);
      return next;
    });
    if (!userId) return;
    // Additive ledger on the server (xp = xp + delta): every gain across every
    // device accumulates. The durable queue means a gain whose write fails is
    // retried, not lost. Other devices' gains arrive via refresh/load.
    enqueuePendingDeltas(userId, { xp: amount, weekly: amount, dailyXp: amount });
    void flushPendingDeltas(userId);
  };

  /**
   * Record per-lesson completion stats (server-backed, cross-device):
   *  - counted: the lesson run awarded XP (first completion or first replay
   *    of the day) and should count toward "lessons today".
   *  - perfect: first-time perfect score → lifetime perfect counter.
   */
  const recordLessonStats = ({ counted, perfect }: { counted: boolean; perfect: boolean }) => {
    if (!counted && !perfect) return;
    const today = sastToday();
    setState((prev) => {
      const base = rollPeriods(prev, prev.weekKey || getCurrentWeekKey(), today);
      const next = {
        ...base,
        perfectLessons: base.perfectLessons + (perfect ? 1 : 0),
        dailyLessons: base.dailyLessons + (counted ? 1 : 0),
      };
      writeProgressCache(next, userId);
      return next;
    });
    if (!userId) return;
    enqueuePendingDeltas(userId, {
      perfect: perfect ? 1 : 0,
      dailyLessons: counted ? 1 : 0,
    });
    void flushPendingDeltas(userId);
  };

  /**
   * One-time adoption of the pre-sync, device-local perfect-lesson count so
   * an app update never LOSES badge progress. Only called when the server
   * value is still 0 (checked by the caller after `loaded`), so a second
   * device that updates later can't inflate the total.
   */
  const adoptLegacyPerfectLessons = (count: number) => {
    if (count <= 0 || !userId) return;
    setState((prev) => {
      const next = { ...prev, perfectLessons: prev.perfectLessons + count };
      writeProgressCache(next, userId);
      return next;
    });
    enqueuePendingDeltas(userId, { perfect: count });
    void flushPendingDeltas(userId);
  };

  /**
   * Atomic server-side weekly-challenge claim. XP is granted BY THE SERVER
   * only if this device wins the claim — a second device (or a second tap)
   * gets `alreadyClaimed` and no XP. Never grant claim XP via addXP().
   */
  const claimWeeklyChallengeServer = async (
    sundayKey: string,
    challengeId: string,
    xp: number
  ): Promise<{ ok: boolean; alreadyClaimed: boolean }> => {
    if (!userId) return { ok: false, alreadyClaimed: false };
    const { data, error } = await supabase.rpc("claim_weekly_challenge", {
      p_user_id: userId,
      p_week_key: sundayKey,
      p_challenge_id: challengeId,
      p_xp: xp,
      p_xp_week_key: getCurrentWeekKey(),
    });
    if (error) return { ok: false, alreadyClaimed: false };
    const res = data as { ok?: boolean; reason?: string; xp_granted?: number } | null;
    if (res?.ok) {
      const granted = Number(res.xp_granted ?? xp) || 0;
      const wk = getCurrentWeekKey();
      const today = sastToday();
      const claimKey = `${sundayKey}:${challengeId}`;
      setState((prev) => {
        const base = rollPeriods(prev, wk, today);
        const next = {
          ...base,
          xp: base.xp + granted,
          weeklyXp: base.weeklyXp + granted,
          dailyXp: base.dailyXp + granted,
          weeklyCompletions: {
            ...base.weeklyCompletions,
            [claimKey]: { completedAt: new Date().toISOString(), bonusXP: granted },
          },
        };
        writeProgressCache(next, userId);
        return next;
      });
      // Daily counter on the server (xp itself was already granted by the RPC).
      enqueuePendingDeltas(userId, { dailyXp: granted });
      void flushPendingDeltas(userId);
      return { ok: true, alreadyClaimed: false };
    }
    return { ok: false, alreadyClaimed: res?.reason === "already_claimed" };
  };

  /** True if this week's challenge was already claimed on ANY device. */
  const isWeeklyChallengeClaimed = (sundayKey: string, challengeId: string): boolean => {
    const map = state.weeklyCompletions;
    if (map[`${sundayKey}:${challengeId}`]) return true;
    // Legacy entries were keyed by challenge id only.
    const legacy = map[challengeId];
    if (legacy?.completedAt) {
      try {
        return new Date(legacy.completedAt) >= new Date(`${sundayKey}T00:00:00+02:00`);
      } catch {
        return false;
      }
    }
    return false;
  };

  const tryDeductXp = (amount: number): boolean => {
    if (state.xp < amount) return false;
    const nextXp = Math.max(0, state.xp - amount);
    // Optimistic local update so the UI is instant. Also bump xpSpent so
    // earned (= xp + xpSpent) stays constant - this is what stops a later
    // cross-device merge from refunding the spend.
    setState((prev) => {
      const next = { ...prev, xp: nextXp, xpSpent: prev.xpSpent + amount };
      writeProgressCache(next, userId);
      return next;
    });
    // Authoritative atomic spend on the server. Reconcile from the result;
    // roll back the optimistic change if the server rejects it (e.g. another
    // device already spent the balance, or the row doesn't exist yet).
    if (userId) {
      void (async () => {
        const { data, error } = await supabase.rpc("spend_xp", {
          p_user_id: userId,
          p_amount: amount,
        });
        const res = data as { ok?: boolean; balance?: number; spent?: number } | null;
        if (error || !res?.ok) {
          setState((prev) => {
            const next = {
              ...prev,
              xp: prev.xp + amount,
              xpSpent: Math.max(0, prev.xpSpent - amount),
            };
            writeProgressCache(next, userId);
            return next;
          });
          return;
        }
        setState((prev) => {
          const next = {
            ...prev,
            xp: typeof res.balance === "number" ? res.balance : prev.xp,
            xpSpent: typeof res.spent === "number" ? res.spent : prev.xpSpent,
          };
          writeProgressCache(next, userId);
          return next;
        });
      })();
    }
    return true;
  };

  const completeLesson = (id: string) => {
    setState((prev) => {
      const nextLessons = prev.completedLessons.includes(id) ? prev.completedLessons : [...prev.completedLessons, id];
      const next = { ...prev, completedLessons: nextLessons };
      writeProgressCache(next, userId);
      // Server-side UNION via apply_progress_delta. This is the core cross-device
      // fix: instead of overwriting completed_lessons with this device's array
      // (which dropped lessons completed on another device), the DB unions them
      // so the set only ever grows. xp_delta 0 leaves XP untouched. Union is
      // idempotent, so this is safe even if the updater is re-invoked. Creates
      // the row if it doesn't exist yet.
      if (userId) {
        void supabase.rpc("apply_progress_delta", {
          p_user_id: userId,
          p_xp_delta: 0,
          p_weekly_delta: 0,
          p_week_key: null,
          p_completed_lessons: nextLessons,
          p_longest_streak: null,
        });
      }
      return next;
    });
  };

  const applyStreakAfterLesson = async (): Promise<number> => {
    if (!userId) return state.streak;
    try {
      const r = await fetch("/api/progress/sync-streak", {
        method: "POST",
        headers: await streakSyncAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      const json = await r.json();
      if (!json?.ok) {
        console.warn("[applyStreakAfterLesson] sync-streak failed:", json?.error);
        if (typeof window !== "undefined") {
          localStorage.setItem("notho-pending-streak-sync", "1");
        }
        return state.streak;
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("notho-pending-streak-sync");
      }
      setState((prev) => {
        const next = {
          ...prev,
          streak: json.streak,
          longestStreak: Math.max(json.longestStreak ?? json.streak, prev.longestStreak),
          lastActivityDate: json.lastActivityDate,
        };
        writeProgressCache(next, userId);
        return next;
      });
      return json.streak as number;
    } catch (e) {
      console.warn("[applyStreakAfterLesson] fetch failed:", e);
      if (typeof window !== "undefined") {
        localStorage.setItem("notho-pending-streak-sync", "1");
      }
      return state.streak;
    }
  };

  // ── Mid-lesson resume (cross-device) ───────────────────────────────────
  //
  // Offline-first, in this order, every time:
  //   1. localStorage, synchronously — the lesson page and the learn page read
  //      it on the next render whether or not there is any network;
  //   2. the durable queue, still before any network call;
  //   3. an opportunistic flush that nobody awaits.
  //
  // Called on every step, so it is deliberately cheap and never async.
  const saveLessonResume = (record: LessonResume) => {
    if (!userId) return;
    writeLocalResume(userId, record);
    setLessonResume(resolveOfferableResume(record, null));
    enqueueCrossDeviceWrite(userId, { resume: record });
    void flushCrossDeviceQueue(userId);
  };

  /**
   * Clearing writes a TOMBSTONE, not a delete. A delete only says "this device
   * has nothing"; the other device would re-offer its stale resume point on
   * the next sync. A tombstone with a fresh savedAt says "this is finished"
   * and wins the merge everywhere.
   */
  const clearLessonResume = (courseId?: string, lessonId?: string) => {
    if (!userId) return;
    const tombstone = makeResumeTombstone(courseId, lessonId);
    clearLocalResume(userId);
    setLessonResume(null);
    enqueueCrossDeviceWrite(userId, { resume: tombstone });
    void flushCrossDeviceQueue(userId);
  };

  // ── Review sessions count toward the streak ────────────────────────────
  //
  // A finished spaced-repetition session keeps the streak alive on exactly the
  // same terms as a lesson: it goes through /api/progress/sync-streak (the
  // only writer of `streak` / `last_activity_date`, and idempotent per SAST
  // day), and it feeds lessonsToday and the daily-challenge counters.
  //
  // "Enough for a day" is REVIEW_MIN_CARDS cards answered — see the rationale
  // on that constant in lib/sync/mergeRules.ts. Anything short of it is a real
  // review (the cards still get rescheduled by SM-2) but earns no streak day
  // and no XP, and the review screen says so rather than claiming otherwise.
  //
  // The XP and the lessons-today bump are an ATOMIC once-per-day claim on the
  // server (claim_review_session), so a second session, a second device, or an
  // offline claim replayed later cannot pay twice.
  const recordReviewSession = ({
    cards,
    correct,
  }: {
    cards: number;
    correct: number;
  }): {
    counted: boolean;
    alreadyCountedToday: boolean;
    xpAwarded: number;
    cardsRequired: number;
  } => {
    const today = sastToday();
    const wk = getCurrentWeekKey();

    if (!reviewQualifiesForStreak(cards)) {
      return {
        counted: false,
        alreadyCountedToday: false,
        xpAwarded: 0,
        cardsRequired: REVIEW_MIN_CARDS,
      };
    }

    const flagsBefore = readLocalDailyFlags(today);
    const alreadyCountedToday = flagsBefore.reviewCounted;
    const xpAwarded = alreadyCountedToday ? 0 : reviewXp(correct, cards);

    if (!alreadyCountedToday) {
      // 1. Local and immediate.
      setState((prev) => {
        const base = rollPeriods(prev, wk, today);
        const next = {
          ...base,
          xp: Math.max(0, base.xp + xpAwarded),
          weeklyXp: base.weeklyXp + xpAwarded,
          dailyXp: base.dailyXp + xpAwarded,
          dailyLessons: base.dailyLessons + 1,
        };
        writeProgressCache(next, userId);
        return next;
      });

      const flags: DailyFlags = {
        ...flagsBefore,
        reviewCounted: true,
        conceptReviewed: true,
      };
      writeLocalDailyFlags(flags);

      // The legacy per-day keys the daily-challenge list reads on-device.
      // Same echo completeLesson does, for the same reason.
      if (typeof window !== "undefined") {
        try {
          const lessonsKey = `notho-daily-lessons-${today}`;
          const prevLessons = parseInt(localStorage.getItem(lessonsKey) ?? "0", 10);
          localStorage.setItem(
            lessonsKey,
            String((Number.isNaN(prevLessons) ? 0 : prevLessons) + 1)
          );
          if (xpAwarded > 0) {
            const xpKey = `notho-daily-xp-${today}`;
            const prevXp = parseInt(localStorage.getItem(xpKey) ?? "0", 10);
            localStorage.setItem(
              xpKey,
              String((Number.isNaN(prevXp) ? 0 : prevXp) + xpAwarded)
            );
          }
        } catch { /* best-effort */ }
      }

      if (userId) {
        // 2. Durable queue, before the network.
        enqueueCrossDeviceWrite(userId, {
          reviewClaim: { day: today, cards, correct, weekKey: wk },
          dailyFlags: flags,
        });
        // 3. Opportunistic flush. If the server says another device already
        //    claimed today, re-read rather than leaving the optimistic bump.
        void flushCrossDeviceQueue(userId).then((res) => {
          if (res?.reviewClaimed?.alreadyClaimed) void loadFromServer(userId).catch(() => undefined);
        });
      }
    }

    // 4. The streak itself — same endpoint as a lesson, not awaited so the
    //    summary screen never waits on a phone with no signal. The call
    //    already queues itself via notho-pending-streak-sync on failure.
    void applyStreakAfterLesson();

    return {
      counted: true,
      alreadyCountedToday,
      xpAwarded,
      cardsRequired: REVIEW_MIN_CARDS,
    };
  };

  const MAX_FREEZE_COUNT = 2;

  const buyStreakFreeze = (cost = 200): boolean => {
    if (state.freezeCount >= MAX_FREEZE_COUNT) return false;
    if (!tryDeductXp(cost)) return false;
    let nextFreeze = 0;
    setState((prev) => {
      if (prev.freezeCount >= MAX_FREEZE_COUNT) return prev;
      nextFreeze = prev.freezeCount + 1;
      const next = { ...prev, freezeCount: nextFreeze };
      writeProgressCache(next, userId);
      return next;
    });
    if (nextFreeze === 0) return false;
    if (userId) {
      void supabase
        .from("user_progress")
        .update({ streak_freeze_count: nextFreeze, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }
    return true;
  };

  // Consume one of the weekly streak_freeze_count tokens via DB RPC.
  // Returns { ok, streak, freezesLeft } or { ok: false, reason }.
  const useFreeze = async (): Promise<{ ok: boolean; streak?: number; freezesLeft?: number; reason?: string }> => {
    if (!userId) return { ok: false, reason: "not_logged_in" };
    if (state.freezeCount <= 0) return { ok: false, reason: "no_freezes_left" };
    const { data, error } = await supabase.rpc("use_streak_freeze", { p_user_id: userId });
    if (error) {
      console.warn("[useFreeze] RPC error", error.message);
      return { ok: false, reason: error.message };
    }
    const result = data as { ok: boolean; streak?: number; freezes_left?: number; reason?: string };
    if (result.ok) {
      const yDate = sastOffset(-1);
      setState((prev) => {
        const next = {
          ...prev,
          freezeCount: result.freezes_left ?? Math.max(0, prev.freezeCount - 1),
          lastActivityDate: yDate,
        };
        writeProgressCache(next, userId);
        return next;
      });
    }
    return { ok: result.ok, streak: result.streak, freezesLeft: result.freezes_left, reason: result.reason };
  };

  const resetProgress = async () => {
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined" && userId) {
      // Clear EVERYTHING that could resurrect the old progress. Before this,
      // the stale cache re-unioned old lessons into the DB on the next load
      // and queued deltas re-applied — reset appeared not to stick.
      clearProgressCache(userId);
      clearPendingDeltas(userId);
      clearWeeklyStats(userId);
      try { localStorage.removeItem("notho-pending-streak-sync"); } catch { /* ignore */ }
      wipeEphemeralLocalState();
      writeProgressCache(DEFAULT_STATE, userId);
    }
    if (!userId) return;
    await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        xp: 0,
        xp_spent: 0,
        streak: 0,
        last_activity_date: null,
        completed_lessons: [],
        weekly_completions: {},
        weekly_xp: 0,
        week_key: getCurrentWeekKey(),
        streak_freeze_count: 0,
        perfect_lessons_total: 0,
        daily_xp_today: 0,
        daily_xp_date: "",
        daily_lessons_today: 0,
        daily_lessons_date: "",
        weekly_challenge_progress: {},
      },
      { onConflict: "user_id" }
    );
  };

  return {
    ready,
    loaded,
    userId,
    xp: state.xp,
    streak: state.streak,
    longestStreak: state.longestStreak,
    lastActivityDate: state.lastActivityDate,
    completedLessons,
    freezeCount: state.freezeCount,
    weeklyXp: state.weeklyXp,
    weekKey: state.weekKey,
    perfectLessons: state.perfectLessons,
    dailyXp: state.dailyXp,
    dailyLessons: state.dailyLessons,
    weeklyCompletions: state.weeklyCompletions,
    refresh,
    addXP,
    recordLessonStats,
    adoptLegacyPerfectLessons,
    claimWeeklyChallengeServer,
    isWeeklyChallengeClaimed,
    tryDeductXp,
    completeLesson,
    applyStreakAfterLesson,
    lessonResume,
    saveLessonResume,
    clearLessonResume,
    recordReviewSession,
    buyStreakFreeze,
    useFreeze,
    resetProgress,
  };
}
