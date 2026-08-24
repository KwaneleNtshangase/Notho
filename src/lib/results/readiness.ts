/**
 * RE5 readiness: what the recorded results say about whether someone should
 * book the real exam.
 *
 * Pure — takes results in, returns a verdict — so the thresholds are testable
 * and stated in one place. The bar is deliberately set ABOVE the pass mark.
 * A mock scraped at 33/50 is a coin flip on a different 50 questions, and the
 * RE5 costs money and a booking slot to fail. The course content already tells
 * learners to "aim to consistently score 40+ before booking the real exam";
 * this encodes that advice rather than inventing a second standard.
 */

import type { AreaScore, LessonResult } from "@/lib/results/types";
import { RE5_KNOWLEDGE_AREAS, RE5_MOCK_EXAMS, type ExamSpec } from "@/lib/results/re5";

/** Correct answers in a 50-question mock that signal "comfortably ready". */
export const RE5_CONFIDENT_CORRECT = 40;

/** An area below this is worth going back to a unit for. Matches the pass mark. */
export const RE5_AREA_FLOOR_PCT = 66;

export type ReadinessVerdict =
  | "not-started"
  | "not-ready"
  | "borderline"
  | "ready";

export type MockStanding = {
  spec: ExamSpec;
  latest: LessonResult | null;
  best: LessonResult | null;
  attempts: number;
};

export type AreaStanding = AreaScore & {
  pct: number;
  /** The teaching unit to revisit. Null if the area is unrecognised. */
  unitId: string | null;
};

export type Re5Readiness = {
  verdict: ReadinessVerdict;
  headline: string;
  detail: string;
  mocks: MockStanding[];
  /** Areas across the latest sitting of each mock, weakest first. */
  areas: AreaStanding[];
  weakAreas: AreaStanding[];
};

function latestOf(results: LessonResult[]): LessonResult | null {
  return results.reduce<LessonResult | null>(
    (acc, r) => (!acc || r.attemptNo > acc.attemptNo ? r : acc),
    null
  );
}

function bestOf(results: LessonResult[]): LessonResult | null {
  return results.reduce<LessonResult | null>(
    (acc, r) => (!acc || r.firstTryCorrect > acc.firstTryCorrect ? r : acc),
    null
  );
}

/**
 * Merge the area breakdowns of the LATEST sitting of each mock.
 *
 * Latest, not best: readiness is a claim about where the learner is now. Rolling
 * every historical attempt in would let a strong first sitting mask a knowledge
 * area that has since gone stale, and rolling in the best attempt per area would
 * be cherry-picking a score across papers the learner never actually sat.
 */
export function mergeAreas(sittings: LessonResult[]): AreaStanding[] {
  const acc = new Map<string, AreaStanding>();
  for (const sitting of sittings) {
    for (const area of sitting.areaBreakdown) {
      const cur = acc.get(area.areaId);
      if (cur) {
        cur.correct += area.correct;
        cur.total += area.total;
      } else {
        acc.set(area.areaId, {
          ...area,
          pct: 0,
          unitId: RE5_KNOWLEDGE_AREAS[area.areaId]?.unitId ?? null,
        });
      }
    }
  }
  const out = [...acc.values()].map((a) => ({
    ...a,
    pct: a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0,
  }));
  // Weakest first — this list exists to tell someone what to study next.
  out.sort((a, b) => a.pct - b.pct || b.total - a.total);
  return out;
}

export function computeRe5Readiness(results: LessonResult[]): Re5Readiness {
  const mocks: MockStanding[] = Object.values(RE5_MOCK_EXAMS).map((spec) => {
    const mine = results.filter((r) => r.lessonId === spec.lessonId);
    return {
      spec,
      latest: latestOf(mine),
      best: bestOf(mine),
      attempts: mine.length,
    };
  });

  const latestSittings = mocks
    .map((m) => m.latest)
    .filter((r): r is LessonResult => r !== null);

  const areas = mergeAreas(latestSittings);
  const weakAreas = areas.filter((a) => a.total > 0 && a.pct < RE5_AREA_FLOOR_PCT);

  if (latestSittings.length === 0) {
    return {
      verdict: "not-started",
      headline: "No mock exams sat yet",
      detail:
        "Sit Mock Exam A under real conditions — 50 questions, 2 hours, closed book. " +
        "Your score and a knowledge-area breakdown are recorded automatically.",
      mocks,
      areas,
      weakAreas,
    };
  }

  const failing = latestSittings.filter((r) => r.passed === false);
  if (failing.length > 0) {
    const worst = failing.reduce((a, b) =>
      a.firstTryCorrect <= b.firstTryCorrect ? a : b
    );
    return {
      verdict: "not-ready",
      headline: "Not ready yet",
      detail:
        `Your most recent ${labelFor(worst.lessonId)} sitting scored ` +
        `${worst.firstTryCorrect} of ${worst.totalQuestions} — below the 33 needed to pass. ` +
        (weakAreas.length > 0
          ? `Redo the units behind ${listAreas(weakAreas)}, then re-sit.`
          : "Redo the teaching units, then re-sit."),
      mocks,
      areas,
      weakAreas,
    };
  }

  const bothSat = latestSittings.length === Object.keys(RE5_MOCK_EXAMS).length;
  const allConfident = latestSittings.every(
    (r) => r.firstTryCorrect >= RE5_CONFIDENT_CORRECT
  );

  if (bothSat && allConfident && weakAreas.length === 0) {
    return {
      verdict: "ready",
      headline: "Ready to book",
      detail:
        `You cleared ${RE5_CONFIDENT_CORRECT}+ of 50 on your latest sitting of both mocks, ` +
        "with no knowledge area under 66%. Re-verify the current exam format on the " +
        "FSCA site before you book — this app tracks your scores, not the FSCA's rules.",
      mocks,
      areas,
      weakAreas,
    };
  }

  const reasons: string[] = [];
  if (!bothSat) reasons.push("you have only sat one of the two mocks");
  if (!allConfident) {
    reasons.push(
      `your latest sitting is under ${RE5_CONFIDENT_CORRECT} of 50, which is a pass but a narrow one`
    );
  }
  if (weakAreas.length > 0) reasons.push(`${listAreas(weakAreas)} is under 66%`);

  return {
    verdict: "borderline",
    headline: "Passing, but not comfortably",
    detail:
      `You are over the 33-mark, but ${joinClauses(reasons)}. ` +
      "A mock scraped at the pass mark is a coin flip on a different 50 questions.",
    mocks,
    areas,
    weakAreas,
  };
}

function labelFor(lessonId: string): string {
  return RE5_MOCK_EXAMS[lessonId]?.label ?? lessonId;
}

function listAreas(areas: AreaStanding[]): string {
  const names = areas.slice(0, 3).map((a) => a.areaLabel);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function joinClauses(parts: string[]): string {
  if (parts.length === 0) return "there is more to do";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
