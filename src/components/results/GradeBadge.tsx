"use client";

import React from "react";
import type { Grade } from "@/lib/results/types";
import { gradeFor } from "@/lib/results/score";

/**
 * Colours for the five score bands.
 *
 * Defined here rather than in globals.css on purpose — this is the only
 * surface that uses them, and adding five variables to the global sheet to
 * serve one badge is how a design system rots. Text colours are the darker end
 * of each ramp so the contrast holds on the pale fills in both themes.
 */
const TONE: Record<Grade["tone"], { bg: string; fg: string; border: string }> = {
  excellent: { bg: "#E6F5EE", fg: "#0B6B45", border: "#0B6B45" },
  strong:    { bg: "#E8F3F4", fg: "#0E6F78", border: "#0E7C85" },
  pass:      { bg: "#FFF8E7", fg: "#8A6100", border: "#EFB343" },
  weak:      { bg: "#FFF1E6", fg: "#9A4B10", border: "#D97A2B" },
  poor:      { bg: "#FDECEC", fg: "#9B1C1C", border: "#DC2626" },
};

/**
 * The score band for one attempt.
 *
 * `scorePct` is first-try accuracy (see src/lib/results/score.ts) — the share
 * of questions right the first time they appeared, not the share of answers
 * that were eventually correct, which the mastery loop pins at 100%.
 */
export function GradeBadge({
  scorePct,
  size = "md",
  showLabel = true,
  title,
}: {
  scorePct: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  title?: string;
}) {
  const grade = gradeFor(scorePct);
  const tone = TONE[grade.tone];
  const small = size === "sm";

  return (
    <span
      title={title ?? `${grade.label} — ${Math.round(scorePct)}% first-try accuracy`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: small ? 4 : 6,
        background: tone.bg,
        color: tone.fg,
        border: `1.5px solid ${tone.border}`,
        borderRadius: 999,
        padding: small ? "1px 7px" : "3px 10px",
        fontSize: small ? 11 : 13,
        fontWeight: 800,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      <span>{grade.letter}</span>
      <span style={{ opacity: 0.55 }}>·</span>
      <span>{Math.round(scorePct)}%</span>
      {showLabel && !small && (
        <span style={{ fontWeight: 600, opacity: 0.85 }}>{grade.label}</span>
      )}
    </span>
  );
}

/** PASS / FAIL against a stated pass mark. The headline on an exam result. */
export function PassPill({
  passed,
  passMarkCorrect,
  totalQuestions,
  size = "md",
}: {
  passed: boolean;
  passMarkCorrect: number;
  totalQuestions: number;
  size?: "sm" | "md";
}) {
  const tone = passed ? TONE.excellent : TONE.poor;
  const small = size === "sm";
  return (
    <span
      title={`Pass mark: ${passMarkCorrect} of ${totalQuestions}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: tone.bg,
        color: tone.fg,
        border: `2px solid ${tone.border}`,
        borderRadius: 999,
        padding: small ? "2px 10px" : "5px 16px",
        fontSize: small ? 12 : 15,
        fontWeight: 900,
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
      }}
    >
      {passed ? "PASS" : "FAIL"}
    </span>
  );
}
