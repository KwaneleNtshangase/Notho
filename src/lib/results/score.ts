/**
 * Scoring for lesson and exam attempts.
 *
 * Pure functions only — no Supabase, no React, no browser globals — so the
 * numbers a learner is shown for a regulatory exam can be pinned down in unit
 * tests rather than inferred from a rendered screen.
 *
 * THE ONE THING TO UNDERSTAND HERE
 * ================================
 * src/lib/lessonMastery.ts runs a Duolingo-style mastery loop: a missed
 * question is re-queued to the end of the session and comes back until it is
 * answered correctly. A lesson therefore CANNOT end with a wrong answer
 * outstanding, and a naive "correct answers / answers given" would read 100%
 * for everyone, every time. The score is first-try accuracy: of the distinct
 * questions in the attempt, how many were right the first time they appeared.
 * That is what firstTryAccuracy() computes, and this module is built on it.
 */

import {
  baseQids,
  firstTryAccuracy,
  type WorkingStep,
} from "@/lib/lessonMastery";
import type { AreaScore, Grade } from "@/lib/results/types";

/** Resolves the knowledge area a question step belongs to, if any. */
export type AreaResolver = (
  step: WorkingStep
) => { areaId: string; areaLabel: string } | null;

export type ScoredAttempt = {
  totalQuestions: number;
  firstTryCorrect: number;
  scorePct: number;
  areaBreakdown: AreaScore[];
};

/**
 * How many correct answers a pass mark expressed as a percentage requires.
 *
 * A pass mark is a boundary, and computing a boundary through binary floating
 * point rounds the wrong way often enough to matter. `Math.ceil(t * (p / 100))`
 * overshoots by one for 27 of the 20 000 (total, pct) pairs with total ≤ 200 —
 * 100 questions at 55% comes out as 56, and 50 questions at 28% as 15 instead
 * of 14. Each of those is a learner told they failed on the mark they needed.
 *
 * RE5's published 65% threshold is one of those whole-answer boundaries: on a
 * 50-question paper it requires 33 correct. The whole point of this module is
 * that the boundary is right because of how it is computed, not because
 * someone checked one case once.
 *
 * Two defences. Multiply before dividing, so integer inputs stay exact
 * (50 * 65 = 3250 exactly, /100 = 32.5). Then subtract an epsilon before
 * the ceiling, which absorbs the residue a non-integer pass mark leaves without
 * ever pulling an exact boundary down to the integer below it.
 *
 * Better still: state the pass mark as a COUNT wherever it is known — see
 * RE5_MOCK_EXAMS in ./re5, where 33 is written down rather than derived — and
 * treat this as the fallback for marks that only exist as a percentage.
 */
export function requiredCorrect(totalQuestions: number, passPct: number): number {
  if (totalQuestions <= 0) return 0;
  // max(0, …) also normalises the negative zero Math.ceil returns for a 0% mark.
  return Math.max(0, Math.ceil((totalQuestions * passPct) / 100 - 1e-9));
}

/** Did this attempt clear the bar? Integer comparison, never a percentage one. */
export function didPass(
  firstTryCorrect: number,
  passMarkCorrect: number | null | undefined
): boolean | null {
  if (passMarkCorrect === null || passMarkCorrect === undefined) return null;
  return firstTryCorrect >= passMarkCorrect;
}

/**
 * Score one finished attempt.
 *
 * `mistakenQids` is intersected with the attempt's own question ids first.
 * A stale id — a resumed mid-lesson save whose step list was re-resolved, say —
 * would otherwise subtract from the total and understate the score, and on a
 * mock exam that is a learner being told they failed when they passed.
 */
export function scoreAttempt(
  steps: WorkingStep[],
  mistakenQids: number[],
  areaOf?: AreaResolver
): ScoredAttempt {
  const qids = baseQids(steps);
  const known = new Set(qids);
  const missed = new Set(mistakenQids.filter((id) => known.has(id)));

  const totalQuestions = qids.length;
  const firstTryCorrect = totalQuestions - missed.size;

  return {
    totalQuestions,
    firstTryCorrect,
    // Deliberately the shared helper rather than a second implementation of
    // the same division: one definition of "first-try accuracy" in the app.
    scorePct: firstTryAccuracy(steps, [...missed]),
    areaBreakdown: areaOf ? breakdownByArea(steps, missed, areaOf) : [],
  };
}

/**
 * Per-knowledge-area counts, in first-appearance order.
 *
 * Walks the step list rather than the qid list so a question is attributed by
 * its own content. Re-queued copies carry the same `__qid` and are skipped, so
 * a question missed three times still counts once, in one area.
 */
function breakdownByArea(
  steps: WorkingStep[],
  missed: Set<number>,
  areaOf: AreaResolver
): AreaScore[] {
  const order: string[] = [];
  const acc = new Map<string, AreaScore>();
  const seen = new Set<number>();

  for (const step of steps) {
    const qid = step.__qid;
    if (qid === undefined || seen.has(qid)) continue;
    seen.add(qid);

    const area = areaOf(step);
    const areaId = area?.areaId ?? "unclassified";
    const areaLabel = area?.areaLabel ?? "Unclassified";

    let entry = acc.get(areaId);
    if (!entry) {
      entry = { areaId, areaLabel, correct: 0, total: 0 };
      acc.set(areaId, entry);
      order.push(areaId);
    }
    entry.total += 1;
    if (!missed.has(qid)) entry.correct += 1;
  }

  return order.map((id) => acc.get(id)!);
}

/** Percentage for an area row, for display. */
export function areaPct(area: AreaScore): number {
  if (area.total <= 0) return 0;
  return Math.round((area.correct / area.total) * 100);
}

/**
 * Notho's own score band.
 *
 * The 66 boundary is Notho's own conservative study band. It is not the
 * regulator's published pass mark and must not be presented as one. The FSCA
 * does not award these letters; exam components lead with the server-marked
 * pass/fail verdict instead.
 */
export function gradeFor(scorePct: number): Grade {
  const pct = Math.max(0, Math.min(100, Math.round(scorePct)));
  if (pct >= 90) return { letter: "A", label: "Excellent", tone: "excellent" };
  if (pct >= 80) return { letter: "B", label: "Strong", tone: "strong" };
  if (pct >= 66) return { letter: "C", label: "Pass standard", tone: "pass" };
  if (pct >= 50) return { letter: "D", label: "Below pass", tone: "weak" };
  return { letter: "E", label: "Needs work", tone: "poor" };
}

/** "1h 04m" / "12m 30s" / "45s" — exam time taken, read at a glance. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "—";
  }
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(rem).padStart(2, "0")}s`;
  return `${rem}s`;
}
