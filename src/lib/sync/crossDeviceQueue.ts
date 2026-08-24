"use client";

/**
 * Durable cross-device write queue.
 *
 * Same shape and the same guarantees as the pending-delta queue in
 * `useProgress` — this is deliberately a second *slot set* on that one
 * mechanism, not a second mechanism:
 *
 *   * every write lands in localStorage BEFORE the network is touched, so an
 *     app kill (Capacitor on a phone that runs out of battery mid-lesson)
 *     cannot lose it;
 *   * the queue is CLAIMED (read + cleared synchronously) before the RPC, so
 *     two rapid writes can't both send the same payload;
 *   * a failed flush re-queues the claimed payload, merged with anything
 *     queued meanwhile using the same rules the server applies;
 *   * the Web Locks API (where available) stops a second tab or PWA window
 *     flushing concurrently;
 *   * nothing here is ever awaited by the UI.
 *
 * The difference from the XP queue is what "merge two queued writes" means.
 * XP is an additive ledger, so its queue ACCUMULATES. Everything here is
 * last-write-wins or GREATEST, so its queue COLLAPSES: folding a new write
 * into a pending one runs the same pure rule from `mergeRules.ts` that the
 * server would have run.
 */

import { supabase } from "@/lib/supabaseClient";
import {
  mergeDailyFlags,
  mergePinned,
  mergeResume,
  type DailyFlags,
  type LessonResumeValue,
  type PinnedCourses,
} from "@/lib/sync/mergeRules";

export type ReviewClaim = {
  day: string;
  cards: number;
  correct: number;
  weekKey: string;
};

export type CrossDeviceQueue = {
  pins?: PinnedCourses & { adopt?: boolean };
  resume?: LessonResumeValue;
  dailyFlags?: DailyFlags;
  reviewClaim?: ReviewClaim;
};

export type FlushResult = {
  pins?: PinnedCourses | null;
  resume?: LessonResumeValue | null;
  dailyFlags?: DailyFlags | null;
  reviewClaimed?: { ok: boolean; alreadyClaimed: boolean; xpGranted: number };
};

function queueKey(userId: string): string {
  return `notho-pending-sync-${userId}`;
}

export function readQueue(userId: string | null): CrossDeviceQueue | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(queueKey(userId));
    if (!raw) return null;
    const q = JSON.parse(raw) as CrossDeviceQueue;
    return q && typeof q === "object" ? q : null;
  } catch {
    return null;
  }
}

function writeQueue(userId: string, q: CrossDeviceQueue): void {
  try {
    const empty =
      !q.pins && !q.resume && !q.dailyFlags && !q.reviewClaim;
    if (empty) localStorage.removeItem(queueKey(userId));
    else localStorage.setItem(queueKey(userId), JSON.stringify(q));
  } catch {
    /* quota / private mode — best-effort, the local write already applied */
  }
}

export function clearQueue(userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try { localStorage.removeItem(queueKey(userId)); } catch { /* ignore */ }
}

/**
 * Fold a write into the pending queue. Collapsing (not accumulating) — see the
 * header. Safe to call from a React updater: it touches only localStorage.
 */
export function enqueueCrossDeviceWrite(
  userId: string | null,
  patch: CrossDeviceQueue
): void {
  if (typeof window === "undefined" || !userId) return;
  const cur = readQueue(userId) ?? {};
  const next: CrossDeviceQueue = { ...cur };

  if (patch.pins) {
    next.pins = cur.pins
      ? {
          ...mergePinned(cur.pins, patch.pins),
          // Once ANY queued write is an adoption, the flush must adopt —
          // otherwise the rollout merge is lost when two writes collapse.
          adopt: Boolean(cur.pins.adopt || patch.pins.adopt),
        }
      : patch.pins;
  }

  if (patch.resume) {
    next.resume = cur.resume ? mergeResume(cur.resume, patch.resume) : patch.resume;
  }

  if (patch.dailyFlags) {
    next.dailyFlags = cur.dailyFlags
      ? mergeDailyFlags(cur.dailyFlags, patch.dailyFlags)
      : patch.dailyFlags;
  }

  if (patch.reviewClaim) {
    const prev = cur.reviewClaim;
    // Same day: keep the bigger session (it is the one that qualifies).
    // A newer day always replaces — yesterday's unsent claim is worthless.
    next.reviewClaim =
      prev && prev.day === patch.reviewClaim.day
        ? {
            day: prev.day,
            cards: Math.max(prev.cards, patch.reviewClaim.cards),
            correct: Math.max(prev.correct, patch.reviewClaim.correct),
            weekKey: patch.reviewClaim.weekKey,
          }
        : patch.reviewClaim;
  }

  writeQueue(userId, next);
}

/** Strip the local-only `steps` array before anything leaves the device. */
function forWire(resume: LessonResumeValue): LessonResumeValue {
  const { steps: _steps, ...rest } = resume as LessonResumeValue & { steps?: unknown[] };
  return rest as LessonResumeValue;
}

async function doFlush(userId: string): Promise<FlushResult | null> {
  const claimed = readQueue(userId);
  if (!claimed) return null;
  clearQueue(userId);

  const result: FlushResult = {};
  const failed: CrossDeviceQueue = {};

  if (claimed.pins) {
    const { data, error } = await supabase.rpc("merge_pinned_courses", {
      p_user_id: userId,
      p_ids: claimed.pins.ids,
      p_updated_at: claimed.pins.updatedAt,
      p_adopt: Boolean(claimed.pins.adopt),
    });
    if (error) failed.pins = claimed.pins;
    else result.pins = (data as PinnedCourses | null) ?? null;
  }

  if (claimed.resume) {
    const { data, error } = await supabase.rpc("merge_lesson_resume", {
      p_user_id: userId,
      p_resume: forWire(claimed.resume),
    });
    if (error) failed.resume = claimed.resume;
    else {
      const res = data as { ok?: boolean; resume?: LessonResumeValue } | null;
      result.resume = res?.resume ?? null;
    }
  }

  if (claimed.dailyFlags) {
    const { data, error } = await supabase.rpc("merge_daily_flags", {
      p_user_id: userId,
      p_day: claimed.dailyFlags.day,
      p_flags: claimed.dailyFlags,
    });
    if (error) failed.dailyFlags = claimed.dailyFlags;
    else {
      const res = data as { ok?: boolean; flags?: DailyFlags } | null;
      result.dailyFlags = res?.flags ?? null;
    }
  }

  if (claimed.reviewClaim) {
    const c = claimed.reviewClaim;
    const { data, error } = await supabase.rpc("claim_review_session", {
      p_user_id: userId,
      p_day: c.day,
      p_cards: c.cards,
      p_correct: c.correct,
      p_week_key: c.weekKey,
    });
    if (error) {
      failed.reviewClaim = c;
    } else {
      const res = data as { ok?: boolean; reason?: string; xp_granted?: number } | null;
      result.reviewClaimed = {
        ok: Boolean(res?.ok),
        alreadyClaimed: res?.reason === "already_claimed",
        xpGranted: Number(res?.xp_granted ?? 0) || 0,
      };
    }
  }

  // Anything that failed goes back on the queue, merged with whatever was
  // written while the network call was in flight.
  if (failed.pins || failed.resume || failed.dailyFlags || failed.reviewClaim) {
    enqueueCrossDeviceWrite(userId, failed);
  }

  return result;
}

/**
 * Flush the queue. Never throws, never blocks the caller's render path.
 * Returns the server's authoritative values so the caller can adopt them.
 */
export async function flushCrossDeviceQueue(
  userId: string | null
): Promise<FlushResult | null> {
  if (typeof window === "undefined" || !userId) return null;
  const run = () => doFlush(userId).catch(() => null);
  if (typeof navigator !== "undefined" && "locks" in navigator && navigator.locks?.request) {
    try {
      return await navigator.locks.request(`notho-sync-${userId}`, run);
    } catch {
      return run();
    }
  }
  return run();
}
