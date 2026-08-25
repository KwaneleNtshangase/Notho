import { describe, it, expect } from "vitest";
import {
  computeRe5Readiness,
  mergeAreas,
  RE5_AREA_FLOOR_PCT,
  RE5_CONFIDENT_CORRECT,
} from "@/lib/results/readiness";
import { bestByLesson, attemptsFor } from "@/lib/results/select";
import { RE5_COURSE_ID } from "@/lib/results/re5";
import type { AreaScore, LessonResult } from "@/lib/results/types";

let seq = 0;
function result(over: Partial<LessonResult> = {}): LessonResult {
  const firstTryCorrect = over.firstTryCorrect ?? 40;
  const totalQuestions = over.totalQuestions ?? 50;
  const passMarkCorrect =
    over.passMarkCorrect !== undefined ? over.passMarkCorrect : 33;
  return {
    id: `r${seq++}`,
    courseId: RE5_COURSE_ID,
    lessonId: "re5-mock-a",
    attemptNo: 1,
    kind: "exam",
    totalQuestions,
    firstTryCorrect,
    scorePct: Math.round((firstTryCorrect / totalQuestions) * 100),
    passMarkCorrect,
    passed: passMarkCorrect === null ? null : firstTryCorrect >= passMarkCorrect,
    durationSeconds: 5400,
    areaBreakdown: [],
    source: "live",
    completedAt: "2026-08-01T10:00:00Z",
    ...over,
  };
}

const areas = (spec: Record<string, [number, number]>): AreaScore[] =>
  Object.entries(spec).map(([areaId, [correct, total]]) => ({
    areaId,
    areaLabel: areaId,
    correct,
    total,
  }));

describe("computeRe5Readiness", () => {
  it("says nothing has been sat when nothing has", () => {
    const r = computeRe5Readiness([]);
    expect(r.verdict).toBe("not-started");
    expect(r.mocks.length).toBe(2);
    expect(r.areas.length).toBe(0);
  });

  it("is not-ready when the latest sitting of a mock is a fail", () => {
    const r = computeRe5Readiness([
      result({ lessonId: "re5-mock-a", attemptNo: 1, firstTryCorrect: 45 }),
      result({ lessonId: "re5-mock-a", attemptNo: 2, firstTryCorrect: 30 }),
    ]);
    // A strong earlier attempt must not mask a failing current one.
    expect(r.verdict).toBe("not-ready");
    expect(r.detail).toContain("30 of 50");
  });

  it("is borderline on a single narrow pass", () => {
    const r = computeRe5Readiness([
      result({ lessonId: "re5-mock-a", firstTryCorrect: 34 }),
    ]);
    expect(r.verdict).toBe("borderline");
  });

  it("is borderline when only one of the two mocks has been sat", () => {
    const r = computeRe5Readiness([
      result({ lessonId: "re5-mock-a", firstTryCorrect: 46 }),
    ]);
    expect(r.verdict).toBe("borderline");
    expect(r.detail).toContain("only sat one");
  });

  it("is ready only when both mocks clear the confidence bar with no weak area", () => {
    const strong = areas({ framework: [9, 10], fica: [8, 10] });
    const r = computeRe5Readiness([
      result({
        lessonId: "re5-mock-a",
        firstTryCorrect: RE5_CONFIDENT_CORRECT,
        areaBreakdown: strong,
      }),
      result({
        lessonId: "re5-mock-b",
        firstTryCorrect: 44,
        areaBreakdown: strong,
      }),
    ]);
    expect(r.verdict).toBe("ready");
    expect(r.weakAreas.length).toBe(0);
  });

  it("holds back a two-mock pass that has a weak knowledge area", () => {
    const r = computeRe5Readiness([
      result({
        lessonId: "re5-mock-a",
        firstTryCorrect: 44,
        areaBreakdown: areas({ framework: [9, 10], fica: [2, 10] }),
      }),
      result({
        lessonId: "re5-mock-b",
        firstTryCorrect: 44,
        areaBreakdown: areas({ framework: [9, 10], fica: [3, 10] }),
      }),
    ]);
    expect(r.verdict).toBe("borderline");
    expect(r.weakAreas.map((a) => a.areaId)).toEqual(["fica"]);
  });

  it("treats one mark over the pass mark as passing but not ready", () => {
    const r = computeRe5Readiness([
      result({ lessonId: "re5-mock-a", firstTryCorrect: 33 }),
      result({ lessonId: "re5-mock-b", firstTryCorrect: 33 }),
    ]);
    expect(r.verdict).toBe("borderline");
  });
});

describe("mergeAreas", () => {
  it("sums the latest sitting of each mock and sorts weakest first", () => {
    const merged = mergeAreas([
      result({
        lessonId: "re5-mock-a",
        areaBreakdown: areas({ fica: [2, 5], framework: [5, 5] }),
      }),
      result({
        lessonId: "re5-mock-b",
        areaBreakdown: areas({ fica: [3, 5], framework: [4, 5] }),
      }),
    ]);
    expect(merged[0].areaId).toBe("fica");
    expect(merged[0].correct).toBe(5);
    expect(merged[0].total).toBe(10);
    expect(merged[0].pct).toBe(50);
    expect(merged[0].pct).toBeGreaterThan(-1);
    expect(merged[1].areaId).toBe("framework");
    expect(merged[1].pct).toBe(90);
  });

  it("does not mutate the results it was given", () => {
    const source = result({
      areaBreakdown: areas({ fica: [2, 5] }),
    });
    mergeAreas([source, source]);
    expect(source.areaBreakdown[0].correct).toBe(2);
    expect(source.areaBreakdown[0].total).toBe(5);
  });

  it("flags an area under the floor and leaves one on it alone", () => {
    const onFloor = mergeAreas([
      result({ areaBreakdown: areas({ x: [66, 100] }) }),
    ]);
    expect(onFloor[0].pct).toBe(RE5_AREA_FLOOR_PCT);
    expect(onFloor[0].pct < RE5_AREA_FLOOR_PCT).toBe(false);
  });
});

describe("bestByLesson", () => {
  it("keeps the highest score, not the most recent", () => {
    const best = bestByLesson([
      result({ lessonId: "re5-mock-a", attemptNo: 2, firstTryCorrect: 30, completedAt: "2026-08-02T10:00:00Z" }),
      result({ lessonId: "re5-mock-a", attemptNo: 1, firstTryCorrect: 45, completedAt: "2026-08-01T10:00:00Z" }),
    ]);
    expect(best.get(`${RE5_COURSE_ID}:re5-mock-a`)?.firstTryCorrect).toBe(45);
  });

  it("breaks a tie towards the more recent attempt", () => {
    const best = bestByLesson([
      result({ lessonId: "l1", attemptNo: 1, firstTryCorrect: 40, completedAt: "2026-08-01T10:00:00Z" }),
      result({ lessonId: "l1", attemptNo: 2, firstTryCorrect: 40, completedAt: "2026-08-05T10:00:00Z" }),
    ]);
    expect(best.get(`${RE5_COURSE_ID}:l1`)?.attemptNo).toBe(2);
  });

  it("keys by course as well as lesson", () => {
    const best = bestByLesson([
      result({ courseId: "a", lessonId: "shared", firstTryCorrect: 10 }),
      result({ courseId: "b", lessonId: "shared", firstTryCorrect: 20 }),
    ]);
    expect(best.get("a:shared")?.firstTryCorrect).toBe(10);
    expect(best.get("b:shared")?.firstTryCorrect).toBe(20);
  });
});

describe("attemptsFor", () => {
  it("returns one lesson's attempts oldest first", () => {
    const rows = attemptsFor(
      [
        result({ lessonId: "re5-mock-a", attemptNo: 3 }),
        result({ lessonId: "re5-mock-b", attemptNo: 1 }),
        result({ lessonId: "re5-mock-a", attemptNo: 1 }),
      ],
      "re5-mock-a"
    );
    expect(rows.map((r) => r.attemptNo)).toEqual([1, 3]);
  });
});
