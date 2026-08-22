"use client";

/**
 * Mid-lesson resume point — the local half.
 *
 * The record has always lived in localStorage under `notho-lesson-progress`,
 * written on every step by useNothoState and read by the learn page ("Continue
 * where you left off") and the lesson page. That stays exactly as it was: the
 * local write is synchronous and immediate, so nothing about starting, pausing
 * or resuming a lesson depends on the network.
 *
 * What is new is that the same record is mirrored to
 * `user_progress.lesson_resume`, so the OTHER device can offer the same
 * "continue". Conflicts are resolved by `mergeResume` (see mergeRules.ts).
 */

import {
  isTombstone,
  mergeResume,
  type LessonResume,
  type LessonResumeValue,
} from "@/lib/sync/mergeRules";

export const LESSON_RESUME_KEY = "notho-lesson-progress";

/** How long a resume point stays offerable. Matches the learn page's check. */
export const RESUME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredResume = LessonResumeValue & { userId?: string };

export function readLocalResume(userId: string | null): LessonResumeValue | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(LESSON_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredResume;
    if (!parsed || typeof parsed !== "object") return null;
    // The key is not user-scoped (it predates account switching), so a record
    // belonging to whoever was signed in before must never be adopted.
    if (parsed.userId && parsed.userId !== userId) return null;
    if (typeof parsed.savedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalResume(userId: string | null, record: LessonResumeValue): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(LESSON_RESUME_KEY, JSON.stringify({ ...record, userId }));
  } catch {
    /* best-effort — the in-memory lesson state is unaffected */
  }
}

/**
 * Remove the LOCAL record. Deliberately a delete rather than a local
 * tombstone: the lesson page reads this key straight back when a lesson is
 * replayed, and a tombstone carrying the same courseId/lessonId would look to
 * it like a resume point with no steps. The tombstone that has to travel lives
 * in the durable queue (and then on the server), not here.
 */
export function clearLocalResume(userId: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try { localStorage.removeItem(LESSON_RESUME_KEY); } catch { /* ignore */ }
}

/**
 * Clearing writes a TOMBSTONE rather than removing the key, so "I finished
 * this lesson" can out-rank a stale resume point sitting on another device.
 * A plain delete would simply be re-seeded by the other device on next sync.
 */
export function makeResumeTombstone(
  courseId?: string,
  lessonId?: string,
  now: number = Date.now()
): LessonResumeValue {
  return { cleared: true, savedAt: now, courseId, lessonId };
}

/**
 * Re-attach the local-only `steps` array after a merge.
 *
 * The server copy deliberately has no steps. If the merge winner points at the
 * same lesson this device already had open, its resolved steps (including any
 * copies the mastery loop re-queued) are still the best available and must not
 * be thrown away — the other device would otherwise force a rebuild from
 * static content and lose the re-queued questions.
 */
export function withLocalSteps(
  merged: LessonResumeValue | null,
  local: LessonResumeValue | null
): LessonResumeValue | null {
  if (!merged || isTombstone(merged) || !local || isTombstone(local)) return merged;
  const m = merged as LessonResume;
  const l = local as LessonResume;
  if (m.courseId !== l.courseId || m.lessonId !== l.lessonId) return merged;
  if (!Array.isArray(l.steps) || l.steps.length === 0) return merged;
  return { ...m, steps: l.steps };
}

/**
 * Pick what the learn page should offer as "Continue": the freshest of the
 * local and server records, unless it is a tombstone or too old.
 */
export function resolveOfferableResume(
  local: LessonResumeValue | null,
  server: LessonResumeValue | null,
  now: number = Date.now()
): LessonResume | null {
  const winner = local && server ? mergeResume(server, local) : local ?? server;
  if (!winner || isTombstone(winner)) return null;
  const record = winner as LessonResume;
  if (!record.courseId || !record.lessonId) return null;
  if (now - Number(record.savedAt ?? 0) > RESUME_MAX_AGE_MS) return null;
  return record;
}
