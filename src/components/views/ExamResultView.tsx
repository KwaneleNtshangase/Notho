"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React from "react";
import { Clock, GraduationCap, Target, TrendingUp } from "lucide-react";
import { GradeBadge, PassPill } from "@/components/results/GradeBadge";
import { areaPct, formatDuration } from "@/lib/results/score";
import type { ExamSpec } from "@/lib/results/re5";
import { RE5_KNOWLEDGE_AREAS } from "@/lib/results/re5";
import type { AreaScore, LessonResult } from "@/lib/results/types";

export type ExamAttemptSummary = {
  spec: ExamSpec;
  firstTryCorrect: number;
  totalQuestions: number;
  scorePct: number;
  passed: boolean;
  durationSeconds: number | null;
  areaBreakdown: AreaScore[];
  /** False when the result could not be written to the server. */
  saved: boolean;
};

/**
 * The marked result of an RE5 mock exam.
 *
 * This replaces the "Score Yourself — count your correct answers" info step
 * the two mocks used to end on. RE5 is a real FSCA regulatory exam and the
 * number shown here is one a learner will use to decide whether to book and
 * pay for a sitting, so the screen states the arithmetic openly: the raw
 * count, the pass mark as a count, and how the count was arrived at.
 */
export function ExamResultView({
  attempt,
  previousAttempts,
  onBackToCourse,
  onViewReadiness,
  onRetake,
}: {
  attempt: ExamAttemptSummary;
  previousAttempts: LessonResult[];
  onBackToCourse: () => void;
  onViewReadiness: () => void;
  onRetake?: () => void;
}) {
  const { spec } = attempt;
  const overTime =
    attempt.durationSeconds !== null &&
    attempt.durationSeconds > spec.timeLimitMinutes * 60;

  const earlier = previousAttempts.filter((r) => r.lessonId === spec.lessonId);
  const previousBest = earlier.reduce<number | null>(
    (acc, r) => (acc === null || r.firstTryCorrect > acc ? r.firstTryCorrect : acc),
    null
  );

  return (
    <main style={{ padding: "20px 16px 96px", maxWidth: 640, margin: "0 auto" }}>
      {/* ── Verdict ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: 20,
          padding: "24px 20px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--color-text-secondary)",
            marginBottom: 10,
          }}
        ><I18nText source={"{value0} · Result"} values={[spec.label]} /></div>

        <div style={{ marginBottom: 14 }}>
          <PassPill
            passed={attempt.passed}
            passMarkCorrect={spec.passMarkCorrect}
            totalQuestions={spec.totalQuestions}
          />
        </div>

        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
          <I18nText>{attempt.firstTryCorrect}</I18nText>
          <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.5 }}>
            <I18nText>{" / "}</I18nText>
            <I18nText>{attempt.totalQuestions}</I18nText>
          </span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <GradeBadge scorePct={attempt.scorePct} />
        </div>

        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          <I18nText source={"Pass mark: "} /><strong><I18nText source={"{value0} of {value1}"} values={[spec.passMarkCorrect, spec.totalQuestions]} /></strong><I18nText>{" "}</I18nText>
          (<I18nText>{spec.passMarkPct}</I18nText>%).<I18nText>{" "}</I18nText>
          <I18nText>{attempt.passed
            ? `You cleared it by ${attempt.firstTryCorrect - spec.passMarkCorrect}.`
            : `You were ${spec.passMarkCorrect - attempt.firstTryCorrect} short.`}</I18nText>
        </p>
      </div>

      {/* ── Time & trend ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          icon={<Clock size={18} />}
          label="Time taken"
          value={formatDuration(attempt.durationSeconds)}
          note={
            overTime
              ? `Over the ${spec.timeLimitMinutes}-minute limit`
              : `Limit ${spec.timeLimitMinutes} min`
          }
          noteTone={overTime ? "warn" : "muted"}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Previous best"
          value={
            previousBest === null
              ? "—"
              : `${previousBest} / ${spec.totalQuestions}`
          }
          note={
            previousBest === null
              ? "First sitting"
              : attempt.firstTryCorrect > previousBest
                ? `Up ${attempt.firstTryCorrect - previousBest}`
                : attempt.firstTryCorrect === previousBest
                  ? "Matched"
                  : `Down ${previousBest - attempt.firstTryCorrect}`
          }
          noteTone="muted"
        />
      </div>

      {/* ── Knowledge areas ─────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: 20,
          padding: "18px 16px",
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            fontWeight: 800,
            margin: "0 0 4px",
          }}
        >
          <Target size={18} />
          <I18nText source={"By knowledge area"} /></h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            margin: "0 0 14px",
            lineHeight: 1.6,
          }}
        ><I18nText source={"Where the marks went. Anything under {value0}% is worth redoing before you re-sit."} values={[spec.passMarkPct]} /></p>

        {attempt.areaBreakdown.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}><I18nText source={"No breakdown available for this attempt."} /></p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...attempt.areaBreakdown]
              .sort((a, b) => areaPct(a) - areaPct(b))
              .map((area) => (
                <AreaRow key={area.areaId} area={area} floor={spec.passMarkPct} />
              ))}
          </div>
        )}
      </section>

      {/* ── How this was marked ─────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--color-bg)",
          border: "1.5px solid var(--color-border)",
          borderRadius: 16,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}><I18nText source={"How this was marked"} /></div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--color-text-secondary)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          <I18nText source={"Your score counts each question "} /><strong><I18nText source={"once"} /></strong><I18nText source={", as you answered it the "} /><strong><I18nText source={"first"} /></strong> <I18nText source={" time it appeared. Questions you missed came back until you got them right — that is how the lessons are built — but the repeats do not raise your mark, because the real RE5 gives you one attempt per question."} />{!attempt.saved && (
            <>
              <I18nText>{" "}</I18nText>
              <span style={{ fontWeight: 700 }}><I18nText source={"This result could not be saved to your history — check your connection and re-sit to record it."} /></span>
            </>
          )}
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={onViewReadiness}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <GraduationCap size={18} />
            <I18nText source={"See my RE5 readiness"} /></span>
        </button>
        {onRetake && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              width: "100%",
              background: "var(--color-bg)",
              color: "var(--color-text-primary)",
              border: "1.5px solid var(--color-border)",
            }}
            onClick={onRetake}
          ><I18nText source={"Re-sit {value0}"} values={[spec.label]} /></button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{
            width: "100%",
            background: "var(--color-bg)",
            color: "var(--color-text-primary)",
            border: "1.5px solid var(--color-border)",
          }}
          onClick={onBackToCourse}
        ><I18nText source={"Back to course"} /></button>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  noteTone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  noteTone: "muted" | "warn";
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        borderRadius: 16,
        padding: "14px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          marginBottom: 6,
        }}
      >
        <I18nText>{icon}</I18nText>
        <I18nText>{label}</I18nText>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}><I18nText>{value}</I18nText></div>
      <div
        style={{
          fontSize: 11.5,
          marginTop: 4,
          fontWeight: 600,
          color: noteTone === "warn" ? "#9A4B10" : "var(--color-text-secondary)",
        }}
      >
        <I18nText>{note}</I18nText>
      </div>
    </div>
  );
}

export function AreaRow({
  area,
  floor,
  unitHint = true,
}: {
  area: AreaScore;
  floor: number;
  unitHint?: boolean;
}) {
  const pct = areaPct(area);
  const weak = pct < floor;
  const unit = RE5_KNOWLEDGE_AREAS[area.areaId];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 700 }}><I18nText>{area.areaLabel}</I18nText></span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: weak ? "#9B1C1C" : "var(--color-text-primary)",
            whiteSpace: "nowrap",
          }}
        >
          <I18nText>{area.correct}</I18nText>/<I18nText>{area.total}</I18nText>
          <span style={{ opacity: 0.6, fontWeight: 600 }}> · <I18nText>{pct}</I18nText>%</span>
        </span>
      </div>
      <I18nElement as="div"
        role="img"
        aria-label={`${area.areaLabel}: ${area.correct} of ${area.total} correct`}
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: weak ? "#DC2626" : "#0E7C85",
          }}
        />
      </I18nElement>
      {unitHint && weak && unit && (
        <div
          style={{
            fontSize: 11.5,
            color: "var(--color-text-secondary)",
            marginTop: 4,
            fontWeight: 600,
          }}
        ><I18nText source={"Redo the teaching unit for this area before re-sitting."} /></div>
      )}
    </div>
  );
}
