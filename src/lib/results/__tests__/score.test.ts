import { describe, it, expect } from "vitest";
import type { LessonStep } from "@/data/content";
import {
  assignQids,
  requeuedCopy,
  firstTryAccuracy,
  type WorkingStep,
} from "@/lib/lessonMastery";
import {
  areaPct,
  didPass,
  formatDuration,
  gradeFor,
  requiredCorrect,
  scoreAttempt,
} from "@/lib/results/score";
import {
  RE5_KNOWLEDGE_AREAS,
  RE5_MOCK_EXAMS,
  mappedQuestionCount,
  questionNumberOf,
  re5AreaResolver,
} from "@/lib/results/re5";

// ── Fixtures ────────────────────────────────────────────────────────────────

/** An mcq step carrying the "Qn." prefix the RE5 mocks use. */
function q(n: number): LessonStep {
  return {
    type: "mcq",
    question: `Q${n}. A question about the FAIS Act`,
    options: ["a", "b", "c", "d"],
    correct: 1,
    feedback: { correct: "yes", incorrect: "no" },
  };
}

function info(): LessonStep {
  return { type: "info", title: "Read this", content: "<p>hi</p>" };
}

/**
 * A finished attempt: `count` questions, with `missedQids` answered wrong on
 * first presentation and therefore re-queued — exactly what the working step
 * list looks like at finalize time.
 */
function attempt(count: number, missedQids: number[]): WorkingStep[] {
  const steps = assignQids([info(), ...Array.from({ length: count }, (_, i) => q(i + 1))]);
  const requeues = steps.filter(
    (s) => s.__qid !== undefined && missedQids.includes(s.__qid)
  );
  return [...steps, ...requeues.map(requeuedCopy)];
}

// ── The pass-mark arithmetic ────────────────────────────────────────────────

describe("requiredCorrect", () => {
  it("returns 33 for the RE5 pass mark", () => {
    expect(requiredCorrect(50, 66)).toBe(33);
  });

  it("does not round a boundary up, where the naive form does", () => {
    // The hazard this function exists for. `Math.ceil(t * (p / 100))` is one
    // too high for 27 of the (total, pct) pairs with total <= 200. Each one is
    // a learner told they missed the mark they actually hit.
    //
    // RE5's own 33-of-50 is not among them — 66% of 50 is exact either way.
    // These cases are pinned so the safe form cannot be "simplified" back on
    // the grounds that the RE5 case happens to work.
    const naive = (t: number, p: number) => Math.ceil(t * (p / 100));

    expect(naive(100, 55)).toBe(56);
    expect(requiredCorrect(100, 55)).toBe(55);

    expect(naive(50, 28)).toBe(15);
    expect(requiredCorrect(50, 28)).toBe(14);

    expect(naive(25, 56)).toBe(15);
    expect(requiredCorrect(25, 56)).toBe(14);
  });

  it("matches exact integer arithmetic across the plausible range", () => {
    // ceil(t * p / 100) computed without leaving the integers.
    const exact = (t: number, p: number) => Math.floor((t * p + 99) / 100);
    for (let t = 1; t <= 200; t++) {
      for (let p = 1; p <= 100; p++) {
        expect(requiredCorrect(t, p), `${t} questions at ${p}%`).toBe(exact(t, p));
      }
    }
  });

  it("still rounds a genuine fraction up", () => {
    expect(requiredCorrect(50, 67)).toBe(34); // 33.5 → 34
    expect(requiredCorrect(3, 66)).toBe(2); // 1.98 → 2
    expect(requiredCorrect(10, 75)).toBe(8); // 7.5 → 8
  });

  it("is exact on clean boundaries", () => {
    expect(requiredCorrect(100, 66)).toBe(66);
    expect(requiredCorrect(50, 50)).toBe(25);
    expect(requiredCorrect(20, 80)).toBe(16);
  });

  it("handles empty and zero-mark cases without returning negative zero", () => {
    expect(requiredCorrect(0, 66)).toBe(0);
    // Math.ceil(-1e-9) is -0, which is not Object.is-equal to 0 and would
    // serialise as "-0" into a stored result.
    expect(Object.is(requiredCorrect(50, 0), 0)).toBe(true);
    expect(Object.is(requiredCorrect(0, 0), 0)).toBe(true);
  });
});

describe("the 33/50 pass boundary", () => {
  const mark = RE5_MOCK_EXAMS["re5-mock-a"].passMarkCorrect;

  it("passes at exactly 33 of 50", () => {
    expect(mark).toBe(33);
    expect(didPass(33, mark)).toBe(true);
  });

  it("fails at 32 of 50", () => {
    expect(didPass(32, mark)).toBe(false);
  });

  it("passes above the mark and fails at zero", () => {
    expect(didPass(34, mark)).toBe(true);
    expect(didPass(50, mark)).toBe(true);
    expect(didPass(0, mark)).toBe(false);
  });

  it("returns null when there is no pass mark", () => {
    expect(didPass(10, null)).toBeNull();
    expect(didPass(10, undefined)).toBeNull();
  });

  it("agrees with the percentage-derived mark", () => {
    const spec = RE5_MOCK_EXAMS["re5-mock-a"];
    expect(requiredCorrect(spec.totalQuestions, spec.passMarkPct)).toBe(
      spec.passMarkCorrect
    );
  });

  it("scores an exact-boundary attempt as a pass end to end", () => {
    // 50 questions, 17 missed on first try → 33 right first time.
    const missed = Array.from({ length: 17 }, (_, i) => i);
    const scored = scoreAttempt(attempt(50, missed), missed);
    expect(scored.totalQuestions).toBe(50);
    expect(scored.firstTryCorrect).toBe(33);
    expect(scored.scorePct).toBe(66);
    expect(didPass(scored.firstTryCorrect, 33)).toBe(true);
  });

  it("scores one mark below the boundary as a fail", () => {
    const missed = Array.from({ length: 18 }, (_, i) => i);
    const scored = scoreAttempt(attempt(50, missed), missed);
    expect(scored.firstTryCorrect).toBe(32);
    expect(didPass(scored.firstTryCorrect, 33)).toBe(false);
  });
});

// ── First-try accuracy under the mastery loop ───────────────────────────────

describe("scoreAttempt with re-queued questions", () => {
  it("does not let re-queues inflate the score to 100%", () => {
    const missed = [0, 3, 7];
    const steps = attempt(10, missed);

    // What a naive scorer would see: every question ends correct, because the
    // mastery loop keeps re-queueing until it does. 10 initial answers, 3 of
    // them wrong, then 3 correct re-answers = 10 correct of 13 given, and the
    // learner never leaves until all 10 are mastered.
    const eventuallyAllCorrect = 10;
    expect(Math.round((eventuallyAllCorrect / 10) * 100)).toBe(100);

    const scored = scoreAttempt(steps, missed);
    expect(scored.totalQuestions).toBe(10);
    expect(scored.firstTryCorrect).toBe(7);
    expect(scored.scorePct).toBe(70);
  });

  it("counts a question missed several times only once", () => {
    const steps = attempt(10, [2]);
    // Missed three times over: two extra re-queued copies beyond the first.
    const extra = steps.filter((s) => s.__qid === 2 && s.__requeued);
    const withMoreRequeues = [...steps, ...extra, ...extra];

    const scored = scoreAttempt(withMoreRequeues, [2, 2, 2]);
    expect(scored.totalQuestions).toBe(10);
    expect(scored.firstTryCorrect).toBe(9);
    expect(scored.scorePct).toBe(90);
  });

  it("agrees with firstTryAccuracy, the shared definition", () => {
    const missed = [1, 4];
    const steps = attempt(12, missed);
    expect(scoreAttempt(steps, missed).scorePct).toBe(
      firstTryAccuracy(steps, missed)
    );
  });

  it("ignores mistaken qids that are not in this attempt", () => {
    // A resumed mid-lesson save whose step list was re-resolved can carry a
    // qid the current attempt does not contain. Subtracting it would understate
    // the score — on a mock exam, that is failing someone who passed.
    const steps = attempt(50, [0]);
    const scored = scoreAttempt(steps, [0, 998, 999]);
    expect(scored.firstTryCorrect).toBe(49);
    expect(scored.scorePct).toBe(98);
  });

  it("gives a perfect attempt 100% and an all-missed attempt 0%", () => {
    expect(scoreAttempt(attempt(50, []), []).scorePct).toBe(100);
    const all = Array.from({ length: 50 }, (_, i) => i);
    const none = scoreAttempt(attempt(50, all), all);
    expect(none.firstTryCorrect).toBe(0);
    expect(none.scorePct).toBe(0);
  });

  it("treats a lesson with no questions as 100% of nothing", () => {
    const scored = scoreAttempt(assignQids([info(), info()]), []);
    expect(scored.totalQuestions).toBe(0);
    expect(scored.firstTryCorrect).toBe(0);
    expect(scored.scorePct).toBe(100);
  });

  it("never counts info steps as questions", () => {
    const steps = assignQids([info(), q(1), info(), q(2), info()]);
    expect(scoreAttempt(steps, []).totalQuestions).toBe(2);
  });
});

// ── Knowledge-area breakdown ────────────────────────────────────────────────

describe("knowledge-area breakdown", () => {
  it("attributes every mock-A question and counts re-queues once", () => {
    const missed = [0, 1]; // Q1 and Q2, both "framework"
    const steps = attempt(50, missed);
    const scored = scoreAttempt(steps, missed, re5AreaResolver("re5-mock-a"));

    const total = scored.areaBreakdown.reduce((n, a) => n + a.total, 0);
    const correct = scored.areaBreakdown.reduce((n, a) => n + a.correct, 0);
    expect(total).toBe(50);
    expect(correct).toBe(48);
    expect(scored.areaBreakdown.some((a) => a.areaId === "unclassified")).toBe(false);

    const framework = scored.areaBreakdown.find((a) => a.areaId === "framework")!;
    expect(framework.total).toBe(3); // Q1, Q2, Q3
    expect(framework.correct).toBe(1); // Q3 only
    expect(areaPct(framework)).toBe(33);
  });

  it("files questions it cannot place under Unclassified rather than silently", () => {
    const steps = assignQids([
      { ...(q(1) as object) } as LessonStep,
      {
        type: "mcq",
        question: "No question number here",
        options: ["a", "b"],
        correct: 0,
        feedback: { correct: "y", incorrect: "n" },
      },
    ]);
    const scored = scoreAttempt(steps, [], re5AreaResolver("re5-mock-a"));
    const unclassified = scored.areaBreakdown.find((a) => a.areaId === "unclassified");
    expect(unclassified?.total).toBe(1);
  });

  it("reads the question number from the text, not the array position", () => {
    // The step list is shuffled per learner, so position means nothing.
    expect(questionNumberOf(q(41) as WorkingStep)).toBe(41);
    expect(questionNumberOf(info() as WorkingStep)).toBeNull();
  });
});

describe("the RE5 area maps", () => {
  for (const lessonId of Object.keys(RE5_MOCK_EXAMS)) {
    it(`${lessonId} maps all 50 questions to known areas`, () => {
      const spec = RE5_MOCK_EXAMS[lessonId];
      expect(mappedQuestionCount(lessonId)).toBe(spec.totalQuestions);

      const resolve = re5AreaResolver(lessonId);
      for (let n = 1; n <= spec.totalQuestions; n++) {
        const area = resolve(q(n) as WorkingStep);
        expect(area, `Q${n} of ${lessonId} is unmapped`).not.toBeNull();
        expect(RE5_KNOWLEDGE_AREAS[area!.areaId]).toBeDefined();
      }
    });
  }

  it("states the exam format once, as counts", () => {
    for (const spec of Object.values(RE5_MOCK_EXAMS)) {
      expect(spec.totalQuestions).toBe(50);
      expect(spec.passMarkCorrect).toBe(33);
      expect(spec.passMarkPct).toBe(66);
      expect(spec.timeLimitMinutes).toBe(120);
    }
  });
});

// ── Presentation helpers ────────────────────────────────────────────────────

describe("gradeFor", () => {
  it("puts the C boundary exactly on the RE5 pass mark", () => {
    expect(gradeFor(66).letter).toBe("C");
    expect(gradeFor(65).letter).toBe("D");
  });

  it("bands the rest of the scale", () => {
    expect(gradeFor(100).letter).toBe("A");
    expect(gradeFor(90).letter).toBe("A");
    expect(gradeFor(89).letter).toBe("B");
    expect(gradeFor(80).letter).toBe("B");
    expect(gradeFor(50).letter).toBe("D");
    expect(gradeFor(49).letter).toBe("E");
    expect(gradeFor(0).letter).toBe("E");
  });

  it("clamps nonsense instead of inventing a sixth band", () => {
    expect(gradeFor(140).letter).toBe("A");
    expect(gradeFor(-20).letter).toBe("E");
  });
});

describe("formatDuration", () => {
  it("formats exam-length times", () => {
    expect(formatDuration(3900)).toBe("1h 05m");
    expect(formatDuration(750)).toBe("12m 30s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(0)).toBe("0s");
  });

  it("shows a dash rather than a wrong number when there is no time", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(NaN)).toBe("—");
  });
});
