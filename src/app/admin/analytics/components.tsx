"use client";

/**
 * Presentational building blocks for the analytics dashboard.
 *
 * Design rule throughout: every number carries a plain-English label and, where
 * the metric isn't self-evident, a one-line explainer. This dashboard gets read
 * under pressure - by you at 11pm, and by funders who have never seen the app -
 * so nothing should need a glossary.
 */

import React from "react";
import { C } from "./lib";

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: subtitle ? 4 : 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 800, color: C.ink, margin: 0 }}>
          {title}
        </h2>
        {action}
      </div>
      {subtitle && (
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 18px", maxWidth: 720, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
      {children}
    </Card>
  );
}

// ── KPI tile ─────────────────────────────────────────────────────────────────

export function Kpi({
  label,
  value,
  hint,
  trend,
  accent = C.teal,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { pct: number | null; dir: "up" | "down" | "flat" };
  accent?: string;
}) {
  return (
    <Card style={{ padding: 18 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        {trend && trend.pct !== null && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: trend.dir === "up" ? C.green : trend.dir === "down" ? C.red : C.muted,
            }}
          >
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"}{" "}
            {Math.abs(trend.pct)}%
          </span>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
          {hint}
        </div>
      )}
    </Card>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

// ── States ───────────────────────────────────────────────────────────────────

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 14 }}>
      {label}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "#FFF5F5",
        border: `1px solid ${C.red}33`,
        color: "#9B1C1C",
        fontSize: 13.5,
        lineHeight: 1.55,
      }}
    >
      {message}
    </div>
  );
}

/**
 * Shown when a query succeeds but returns nothing. Deliberately distinguishes
 * "no data yet" from "something broke" - after a fresh deploy the tracking
 * tables are empty, and that must not look like a bug.
 */
export function Empty({ title, detail }: { title: string; detail?: string }) {
  return (
    <div
      style={{
        padding: "36px 20px",
        textAlign: "center",
        border: `1px dashed ${C.line}`,
        borderRadius: 12,
        background: "#FAFBFC",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: C.body, marginBottom: 6 }}>
        {title}
      </div>
      {detail && (
        <div style={{ fontSize: 13, color: C.muted, maxWidth: 460, margin: "0 auto", lineHeight: 1.5 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  const tones = {
    good: { bg: "#E8F7F0", fg: "#046C4E", bd: "#0E9F6E33" },
    warn: { bg: "#FFF8E7", fg: "#8A5A00", bd: "#EAAC3E44" },
    bad: { bg: "#FFF0EF", fg: "#9B1C1C", bd: "#E03C3133" },
    neutral: { bg: "#F1F5F9", fg: C.body, bd: C.line },
  }[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 700,
        background: tones.bg,
        color: tones.fg,
        border: `1px solid ${tones.bd}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: string;
  label: string;
  /** Right-align numbers so columns of figures stay scannable. */
  numeric?: boolean;
  width?: number | string;
  render: (row: T) => React.ReactNode;
  /** Sort key passed to the server; omit for client-only columns. */
  sortKey?: string;
};

export function DataTable<T>({
  columns,
  rows,
  onRowClick,
  activeSort,
  onSort,
  emptyLabel = "Nothing to show yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  activeSort?: string;
  onSort?: (key: string) => void;
  emptyLabel?: string;
}) {
  if (!rows.length) return <Empty title={emptyLabel} />;

  return (
    <div style={{ overflowX: "auto", margin: "0 -4px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>
            {columns.map((c) => {
              const sortable = Boolean(c.sortKey && onSort);
              const active = c.sortKey && activeSort === c.sortKey;
              return (
                <th
                  key={c.key}
                  onClick={sortable ? () => onSort!(c.sortKey!) : undefined}
                  style={{
                    textAlign: c.numeric ? "right" : "left",
                    padding: "10px 12px",
                    borderBottom: `2px solid ${C.line}`,
                    color: active ? C.tealDeep : C.muted,
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    whiteSpace: "nowrap",
                    cursor: sortable ? "pointer" : "default",
                    userSelect: "none",
                    width: c.width,
                  }}
                >
                  {c.label}
                  {active ? " ▼" : sortable ? " ⇅" : ""}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? "pointer" : "default",
                background: i % 2 ? "#FBFCFD" : "transparent",
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.numeric ? "right" : "left",
                    padding: "11px 12px",
                    borderBottom: `1px solid ${C.line}`,
                    color: C.body,
                    verticalAlign: "middle",
                    fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
                  }}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Controls ─────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  variant = "ghost",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  disabled?: boolean;
}) {
  const solid = variant === "solid";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 14px",
        borderRadius: 9,
        border: `1px solid ${solid ? C.tealDeep : C.line}`,
        background: solid ? C.tealDeep : "#fff",
        color: solid ? "#fff" : C.body,
        fontWeight: 700,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "#F1F5F9",
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              padding: "6px 13px",
              borderRadius: 8,
              border: "none",
              background: active ? "#fff" : "transparent",
              color: active ? C.tealDeep : C.muted,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A small "what am I looking at" note, used under charts that need context. */
export function Explainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "10px 13px",
        background: "#F5FBF8",
        border: `1px solid ${C.teal}22`,
        borderRadius: 10,
        fontSize: 12.5,
        color: C.body,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}
