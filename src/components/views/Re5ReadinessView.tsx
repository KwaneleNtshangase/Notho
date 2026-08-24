"use client";

import React from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, CircleDashed, ShieldCheck } from "lucide-react";
import { GradeBadge, PassPill } from "@/components/results/GradeBadge";
import { AreaRow } from "@/components/views/ExamResultView";
import { formatDuration } from "@/lib/results/score";
import { RE5_COURSE_ID, RE5_MOCK_EXAMS } from "@/lib/results/re5";
import {
  computeRe5Readiness,
  RE5_AREA_FLOOR_PCT,
  type ReadinessVerdict,
} from "@/lib/results/readiness";
import { bestByLesson } from "@/lib/results/select";
import type { LessonResult } from "@/lib/results/types";
import { CONTENT_DATA } from "@/data/content";

const VERDICT_STYLE: Record<
  ReadinessVerdict,
  { bg: string; fg: string; border: string; icon: React.ReactNode }
> = {
  "not-started": {
    bg: "#F1F3F5", fg: "#3F4750", border: "#C7CDD3",
    icon: <CircleDashed size={30} />,
  },
  "not-ready": {
    bg: "#FDECEC", fg: "#9B1C1C", border: "#DC2626",
    icon: <CircleAlert size={30} />,
  },
  borderline: {
    bg: "#FFF8E7", fg: "#8A6100", border: "#EFB343",
    icon: <CircleAlert size={30} />,
  },
  ready: {
    bg: "#E6F5EE", fg: "#0B6B45", border: "#0B6B45",
    icon: <ShieldCheck size={30} />,
  },
};

/**
 * "Am I ready to book the RE5?"
 *
 * Built strictly on recorded results — no estimates, no encouragement that the
 * numbers do not support. A learner deciding whether to pay for an FSCA exam
 * sitting is the reader; telling them they are ready when the data says
 * borderline is the failure mode this screen exists to avoid.
 */
export function Re5ReadinessView({
  results,
  loading,
  onBack,
  onGoToLesson,
}: {
  results: LessonResult[];
  loading: boolean;
  onBack: () => void;
  onGoToLesson: (lessonId: string) => void;
}) {
  const re5Results = React.useMemo(
    () => results.filter((r) => r.courseId === RE5_COURSE_ID),
    [results]
  );
  const readiness = React.useMemo(
    () => computeRe5Readiness(re5Results),
    [re5Results]
  );
  const best = React.useMemo(() => bestByLesson(re5Results), [re5Results]);
  const style = VERDICT_STYLE[readiness.verdict];

  const teachingLessons = React.useMemo(() => {
    const course = CONTENT_DATA.courses.find((c) => c.id === RE5_COURSE_ID);
    if (!course) return [] as { id: string; title: string; unitTitle: string }[];
    return course.units
      .flatMap((u) =>
        u.lessons.map((l) => ({ id: l.id, title: l.title, unitTitle: u.title }))
      )
      .filter((l) => !(l.id in RE5_MOCK_EXAMS));
  }, []);

  const gradedLessons = teachingLessons
    .map((l) => ({ ...l, result: best.get(`${RE5_COURSE_ID}:${l.id}`) ?? null }))
    .filter((l) => l.result !== null) as {
      id: string;
      title: string;
      unitTitle: string;
      result: LessonResult;
    }[];

  const weakestLessons = [...gradedLessons]
    .sort((a, b) => a.result.scorePct - b.result.scorePct)
    .filter((l) => l.result.scorePct < RE5_AREA_FLOOR_PCT)
    .slice(0, 5);

  return (
    <main style={{ padding: "16px 16px 96px", maxWidth: 640, margin: "0 auto" }}>
      <button className="back-button" onClick={onBack}>
        <span className="inline-flex items-center gap-2">
          <ArrowLeft size={20} className="text-current" />
          Back to course
        </span>
      </button>

      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "12px 0 4px" }}>
        RE5 readiness
      </h2>
      <p
        style={{
          fontSize: 13.5,
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
          margin: "0 0 18px",
        }}
      >
        The FSCA RE5 is 50 questions in 2 hours, and you need 33 correct to
        pass. Everything below is from your own recorded attempts.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Loading your results…</p>
      ) : (
        <>
          {/* ── Verdict ─────────────────────────────────────────────────── */}
          <div
            style={{
              background: style.bg,
              border: `2px solid ${style.border}`,
              borderRadius: 20,
              padding: "20px 18px",
              marginBottom: 18,
              color: style.fg,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              {style.icon}
              <span style={{ fontSize: 20, fontWeight: 900 }}>
                {readiness.headline}
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
              {readiness.detail}
            </p>
          </div>

          {/* ── Mock exams ──────────────────────────────────────────────── */}
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px" }}>
            Mock exams
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
            {readiness.mocks.map((mock) => (
              <div
                key={mock.spec.lessonId}
                style={{
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: mock.latest ? 8 : 10,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800 }}>
                    {mock.spec.label}
                  </span>
                  {mock.latest && mock.latest.passed !== null && (
                    <PassPill
                      passed={mock.latest.passed}
                      passMarkCorrect={mock.spec.passMarkCorrect}
                      totalQuestions={mock.spec.totalQuestions}
                      size="sm"
                    />
                  )}
                </div>

                {mock.latest ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <span style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)" }}>
                        {mock.latest.firstTryCorrect}/{mock.latest.totalQuestions}
                      </span>
                      <GradeBadge scorePct={mock.latest.scorePct} size="sm" />
                      <span>{formatDuration(mock.latest.durationSeconds)}</span>
                      <span>
                        {mock.attempts} attempt{mock.attempts === 1 ? "" : "s"}
                        {mock.best && mock.best.firstTryCorrect !== mock.latest.firstTryCorrect
                          ? ` · best ${mock.best.firstTryCorrect}`
                          : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        width: "100%",
                        marginTop: 12,
                        background: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                        border: "1.5px solid var(--color-border)",
                      }}
                      onClick={() => onGoToLesson(mock.spec.lessonId)}
                    >
                      Re-sit {mock.spec.label}
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                        margin: "0 0 10px",
                        lineHeight: 1.6,
                      }}
                    >
                      Not sat yet. {mock.spec.totalQuestions} questions ·{" "}
                      {mock.spec.timeLimitMinutes} minutes · pass at{" "}
                      {mock.spec.passMarkCorrect}.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                      onClick={() => onGoToLesson(mock.spec.lessonId)}
                    >
                      Sit {mock.spec.label}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Knowledge areas ─────────────────────────────────────────── */}
          {readiness.areas.length > 0 && (
            <>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>
                Knowledge areas
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  margin: "0 0 12px",
                  lineHeight: 1.6,
                }}
              >
                Combined across your most recent sitting of each mock — where you
                stand now, not your best-ever paper.
              </p>
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 22,
                }}
              >
                {readiness.areas.map((area) => (
                  <AreaRow
                    key={area.areaId}
                    area={area}
                    floor={RE5_AREA_FLOOR_PCT}
                    unitHint={false}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Weakest lessons ─────────────────────────────────────────── */}
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>
            Lessons to revisit
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              margin: "0 0 12px",
              lineHeight: 1.6,
            }}
          >
            Your best first-try score on each teaching lesson, weakest first.
          </p>
          {gradedLessons.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              No lesson scores recorded yet. Finish a lesson and its grade shows
              up here and on the course map.
            </p>
          ) : weakestLessons.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                color: "#0B6B45",
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              Every graded lesson is at or above {RE5_AREA_FLOOR_PCT}%.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weakestLessons.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onGoToLesson(l.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
                      {l.title}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        color: "var(--color-text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {l.unitTitle}
                    </span>
                  </span>
                  <GradeBadge scorePct={l.result.scorePct} size="sm" />
                </button>
              ))}
            </div>
          )}

          <p
            style={{
              fontSize: 11.5,
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              marginTop: 24,
            }}
          >
            Scores are first-try accuracy: each question counts once, as you
            answered it the first time it appeared. Notho is not the FSCA —
            confirm the current RE5 format and pass mark on the FSCA site before
            booking.
          </p>
        </>
      )}
    </main>
  );
}
