import type {
  Lesson,
  LessonStep,
  QuestionSlot,
  QuestionVariant,
} from "@/data/content";
import { hashSeed, mulberry32 } from "@/lib/lessonShuffle";
import type { WorkingStep } from "@/lib/lessonMastery";
import { prettyExponents } from "@/lib/prettyExponents";

function prettyStep<T extends LessonStep>(step: T): T {
  const s = { ...(step as unknown as Record<string, unknown>) };
  for (const k of ["question", "prompt", "content", "title", "statement", "explanation"]) {
    if (typeof s[k] === "string") s[k] = prettyExponents(s[k] as string);
  }
  if (Array.isArray(s.options)) s.options = (s.options as string[]).map(prettyExponents);
  const f = s.feedback as Record<string, string> | undefined;
  if (f && typeof f === "object") {
    s.feedback = {
      ...f,
      ...(typeof f.correct === "string" ? { correct: prettyExponents(f.correct) } : {}),
      ...(typeof f.incorrect === "string" ? { incorrect: prettyExponents(f.incorrect) } : {}),
    };
  }
  return s as T;
}

/**
 * Lesson bank resolution.
 *
 * A bank-backed lesson (one with `layout` + `slots`) is turned into a concrete
 * `LessonStep[]` here: each slot contributes exactly one of its variants, so
 * two learners — or one learner on a repeat — rarely get the same phrasing.
 *
 * Selection is:
 *  1. Deterministic per (user, lesson, attempt) — a refresh mid-lesson resolves
 *     to the same questions, so index-based saved answers stay valid.
 *  2. Anti-repeat — variants seen in recent attempts are skipped until the pool
 *     is exhausted, which is what defeats screenshot-sharing and rote recall.
 *
 * Legacy lessons (with `steps` only) show a seeded, anti-repeat subset of
 * question steps on replay (see resolveLegacyLessonSteps).
 */

export type ResolveCtx = {
  userId: string | null;
  /** 1 on the first play of this lesson, incremented on each replay. */
  attemptNo: number;
};

const SEEN_KEY = "notho-seen-variants";
const MISSED_KEY = "notho-missed-variants";

/** Legacy lessons: questions shown per attempt when the pool is large enough. */
const LEGACY_SHOW = 4;
/** Legacy lessons above this count stay whole (mock exams / comprehensive). */
const LEGACY_MAX = 10;
const LEGACY_QT = new Set(["mcq", "scenario", "true-false", "fill-blank"]);

/** How often a slot with a previously-missed variant re-serves that exact
 *  variant (spaced-repetition weighting) instead of a fresh one. */
const RESURFACE_P = 0.5;

type StrMap = Record<string, string[]>;

function readMap(key: string): StrMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as StrMap;
  } catch {
    return {};
  }
}

function writeMap(key: string, map: StrMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* best-effort */
  }
}

function slotKey(userId: string | null, slotId: string): string {
  return `${userId ?? "anon"}:${slotId}`;
}

/** Remember that a specific variant was answered wrong, so it resurfaces. */
export function recordMissedVariant(
  userId: string | null,
  slotId: string | undefined,
  variantId: string | undefined
): void {
  if (!slotId || !variantId) return;
  const map = readMap(MISSED_KEY);
  const key = slotKey(userId, slotId);
  const cur = map[key] ?? [];
  if (!cur.includes(variantId)) {
    map[key] = [...cur, variantId];
    writeMap(MISSED_KEY, map);
  }
}

/** Clear a variant from the missed list once the learner gets it right. */
export function clearMissedVariant(
  userId: string | null,
  slotId: string | undefined,
  variantId: string | undefined
): void {
  if (!slotId || !variantId) return;
  const map = readMap(MISSED_KEY);
  const key = slotKey(userId, slotId);
  const cur = map[key];
  if (cur && cur.includes(variantId)) {
    map[key] = cur.filter((id) => id !== variantId);
    writeMap(MISSED_KEY, map);
  }
}

/**
 * Pick one variant for a slot. Skips recently-seen variants (per user) so the
 * learner keeps getting fresh phrasings; once every variant has been seen the
 * memory rolls over and the pool opens up again. The choice within the fresh
 * pool is driven by the per-lesson seeded RNG so it is resume-stable.
 */
function pickVariant(
  slot: QuestionSlot,
  userId: string | null,
  rng: () => number,
  seen: StrMap,
  missed: StrMap
): QuestionVariant {
  if (slot.variants.length === 0) {
    throw new Error(`Slot ${slot.slotId} has no variants`);
  }
  const key = slotKey(userId, slot.slotId);

  const missedIds = (missed[key] ?? []).filter((id) =>
    slot.variants.some((v) => v.variantId === id)
  );
  if (missedIds.length > 0 && rng() < RESURFACE_P) {
    const id = missedIds[Math.floor(rng() * missedIds.length)];
    return slot.variants.find((v) => v.variantId === id)!;
  }

  const recent = seen[key] ?? [];
  let pool = slot.variants.filter((v) => !recent.includes(v.variantId));
  if (pool.length === 0) pool = slot.variants;

  const chosen = pool[Math.floor(rng() * pool.length)];

  const cap = Math.max(1, slot.variants.length - 1);
  seen[key] = [...recent.filter((id) => id !== chosen.variantId), chosen.variantId].slice(-cap);
  return chosen;
}

function variantToStep(variant: QuestionVariant, slot: QuestionSlot): WorkingStep {
  return {
    ...variant.step,
    conceptId: variant.step.conceptId ?? slot.conceptId,
    __slotId: slot.slotId,
    __variantId: variant.variantId,
  } as WorkingStep;
}

function legacySeenKey(userId: string | null, lessonId: string): string {
  return `${userId ?? "anon"}:legacy:${lessonId}`;
}

function pickLegacyQuestionIndices(
  questionIndices: number[],
  userId: string | null,
  lessonId: string,
  attemptNo: number,
  seen: StrMap,
  count: number
): number[] {
  const key = legacySeenKey(userId, lessonId);
  const recent = seen[key] ?? [];
  const rng = mulberry32(hashSeed(`${userId ?? "anon"}:${lessonId}:${attemptNo}`));
  const chosen: number[] = [];
  let remaining = [...questionIndices];

  for (let n = 0; n < count; n++) {
    const fresh = remaining.filter((idx) => !recent.includes(String(idx)));
    const pool = fresh.length > 0 ? fresh : remaining;
    const picked = pool[Math.floor(rng() * pool.length)]!;
    chosen.push(picked);
    remaining = remaining.filter((idx) => idx !== picked);
  }

  const Q = questionIndices.length;
  const cap = Math.max(1, Q - 1);
  seen[key] = [...recent, ...chosen.map(String)].slice(-cap);
  return chosen;
}

function resolveLegacyLessonSteps(lesson: Lesson, ctx: ResolveCtx): LessonStep[] {
  const steps = lesson.steps ?? [];
  if (typeof window === "undefined") return steps.map((st) => prettyStep(st));

  const questionIndices: number[] = [];
  for (let i = 0; i < steps.length; i++) {
    if (LEGACY_QT.has(steps[i]!.type)) questionIndices.push(i);
  }
  const Q = questionIndices.length;
  if (Q <= LEGACY_SHOW || Q > LEGACY_MAX) return steps.map((st) => prettyStep(st));

  const seen = readMap(SEEN_KEY);
  const chosen = new Set(
    pickLegacyQuestionIndices(
      questionIndices,
      ctx.userId,
      lesson.id,
      ctx.attemptNo,
      seen,
      LEGACY_SHOW
    )
  );

  const out: LessonStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (LEGACY_QT.has(step.type)) {
      if (chosen.has(i)) out.push(prettyStep(step));
    } else {
      out.push(prettyStep(step));
    }
  }

  writeMap(SEEN_KEY, seen);
  return out;
}

export function resolveLessonSteps(lesson: Lesson, ctx: ResolveCtx): LessonStep[] {
  if (!lesson.layout || !lesson.slots || lesson.slots.length === 0) {
    return resolveLegacyLessonSteps(lesson, ctx);
  }

  const slotsById = new Map(lesson.slots.map((s) => [s.slotId, s]));
  const rng = mulberry32(
    hashSeed(`${ctx.userId ?? "anon"}:${lesson.id}:${ctx.attemptNo}`)
  );
  const seen = readMap(SEEN_KEY);
  const missed = readMap(MISSED_KEY);
  const out: LessonStep[] = [];

  for (const item of lesson.layout) {
    if ("slot" in item) {
      const slot = slotsById.get(item.slot);
      if (!slot || slot.variants.length === 0) continue;
      out.push(prettyStep(variantToStep(pickVariant(slot, ctx.userId, rng, seen, missed), slot)));
    } else {
      out.push(prettyStep(item));
    }
  }

  writeMap(SEEN_KEY, seen);
  return out;
}

const ATTEMPTS_KEY = "notho-lesson-attempts";

export function peekAttemptNo(userId: string | null, lessonId: string): number {
  if (typeof window === "undefined") return 1;
  try {
    const map = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? "{}") as Record<string, number>;
    const key = `${userId ?? "anon"}:${lessonId}`;
    return map[key] ?? 1;
  } catch {
    return 1;
  }
}

export function nextAttemptNo(userId: string | null, lessonId: string): number {
  if (typeof window === "undefined") return 1;
  try {
    const map = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? "{}") as Record<string, number>;
    const key = `${userId ?? "anon"}:${lessonId}`;
    const next = (map[key] ?? 0) + 1;
    map[key] = next;
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(map));
    return next;
  } catch {
    return 1;
  }
}
