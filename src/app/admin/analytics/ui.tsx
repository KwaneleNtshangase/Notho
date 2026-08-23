"use client";

/**
 * Presentational building blocks.
 *
 * Design rule throughout: every number carries a plain-English label and, where
 * the metric is not self-evident, a one-line explainer. This dashboard gets read
 * under pressure - by you at 11pm, and by funders who have never seen the app -
 * so nothing here should need a glossary.
 */

import React, { useEffect, useMemo, useState } from "react";
import { fetchView } from "./lib";
import { usePalette } from "./theme";

// ── Data hook ────────────────────────────────────────────────────────────────

/**
 * Fetches one view and re-fetches when its params or the refresh nonce change.
 * Previous data deliberately stays on screen while refreshing, so the dashboard
 * does not flash empty every sixty seconds on auto-refresh.
 */
export function useView<T>(
  view: string,
  params: Record<string, string | number | undefined>,
  nonce: number
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    fetchView<T>(view, params)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, key, nonce]);

  return { data, error, loading };
}

// ── Shell pieces ─────────────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`nv-card nv-rise ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="nv-card-head">
        <h2 className="nv-card-title">{title}</h2>
        {action}
      </div>
      {subtitle && <p className="nv-card-sub">{subtitle}</p>}
      {children}
    </Card>
  );
}

// ── Stat tile ────────────────────────────────────────────────────────────────

export type Trend = { pct: number | null; dir: "up" | "down" | "flat" };

export function Stat({
  label,
  value,
  unit,
  hint,
  trend,
  accent,
  spark,
  invertTrend = false,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  trend?: Trend;
  accent?: string;
  spark?: number[];
  /** For metrics where down is good (churn, drop-off). */
  invertTrend?: boolean;
}) {
  const p = usePalette();
  const tone = accent ?? p.teal;
  const good = invertTrend ? "down" : "up";
  const cls =
    !trend || trend.pct === null
      ? "flat"
      : trend.dir === "flat"
      ? "flat"
      : trend.dir === good
      ? "up"
      : "down";

  return (
    <div className="nv-stat nv-rise" style={{ ["--accent" as string]: tone }}>
      <div className="nv-stat-label">{label}</div>
      <div className="nv-stat-value">
        <span className="nv-stat-num">{value}</span>
        {unit && <span className="nv-stat-unit">{unit}</span>}
        {trend && trend.pct !== null && (
          <span className={`nv-delta ${cls}`}>
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"}
            {Math.abs(trend.pct)}%
          </span>
        )}
      </div>
      {spark && spark.length > 1 && (
        <div className="nv-spark">
          <Sparkline values={spark} color={tone} />
        </div>
      )}
      {hint && <div className="nv-stat-hint">{hint}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="nv-stats">{children}</div>;
}

// ── Sparkline ────────────────────────────────────────────────────────────────

/** Hand-rolled rather than a chart library: 34px tall, no axes, no tooltip. */
export function Sparkline({ values, color }: { values: number[]; color: string }) {
  const { d, area, last } = useMemo(() => {
    const w = 100;
    const h = 30;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return {
      d: line,
      area: `${line} L${w},${h} L0,${h} Z`,
      last: pts[pts.length - 1],
    };
  }, [values]);

  const gid = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" width="100%" height="34" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      {last && <circle cx={last[0]} cy={last[1]} r="1.8" fill={color} />}
    </svg>
  );
}

// ── Small parts ──────────────────────────────────────────────────────────────

export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "bad" | "info" | "neutral";
}) {
  return <span className={`nv-tag ${tone}`}>{children}</span>;
}

export function Btn({
  children,
  onClick,
  variant = "ghost",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`nv-btn ${variant === "primary" ? "primary" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="nv-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Meter({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="nv-bar-track">
      <div
        className="nv-bar-fill"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}

export function KV({
  label,
  detail,
  value,
  accent,
}: {
  label: string;
  detail?: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="nv-kv">
      <div>
        <div className="nv-kv-l">{label}</div>
        {detail && <div className="nv-kv-d">{detail}</div>}
      </div>
      <div className="nv-kv-v" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}

// ── States ───────────────────────────────────────────────────────────────────

export function Skeleton({ height = 220 }: { height?: number }) {
  return <div className="nv-skel" style={{ height }} />;
}

export function StatSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="nv-stats">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nv-skel" style={{ height: 118 }} />
      ))}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  const [head, ...rest] = message.split("\n");
  return (
    <div className="nv-error">
      <strong>{head}</strong>
      {rest.length > 0 && <code>{rest.join(" ")}</code>}
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
    <div className="nv-empty">
      <div className="nv-empty-t">{title}</div>
      {detail && <div className="nv-empty-d">{detail}</div>}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <div className="nv-note">{children}</div>;
}

/** One wrapper for the load / error / empty dance every panel repeats. */
export function Gate({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDetail,
  skeleton = 240,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  skeleton?: number;
  children: React.ReactNode;
}) {
  if (error) return <ErrorNote message={error} />;
  if (loading) return <Skeleton height={skeleton} />;
  if (empty) return <Empty title={emptyTitle ?? "Nothing here yet"} detail={emptyDetail} />;
  return <>{children}</>;
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
  maxHeight,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  activeSort?: string;
  onSort?: (key: string) => void;
  emptyLabel?: string;
  maxHeight?: number;
}) {
  if (!rows.length) return <Empty title={emptyLabel} />;

  return (
    <div className="nv-table-wrap" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
      <table className="nv-table">
        <thead>
          <tr>
            {columns.map((c) => {
              const sortable = Boolean(c.sortKey && onSort);
              const active = Boolean(c.sortKey && activeSort === c.sortKey);
              return (
                <th
                  key={c.key}
                  onClick={sortable ? () => onSort!(c.sortKey!) : undefined}
                  className={[c.numeric ? "num" : "", sortable ? "sortable" : "", active ? "active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ width: c.width }}
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
              className={onRowClick ? "clickable" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? "num" : ""}>
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

// ── Score ring ───────────────────────────────────────────────────────────────

/** A single 0-100 dial. Hand-drawn SVG - a chart library for one arc is silly. */
export function Ring({
  value,
  size = 168,
  label,
  caption,
  color,
}: {
  value: number;
  size?: number;
  label: string;
  caption?: string;
  color: string;
}) {
  const p = usePalette();
  const stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} role="img" aria-label={`${label}: ${Math.round(pct)} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.grid} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .8s cubic-bezier(.22,1,.36,1)" }}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize={size * 0.26}
          fontWeight="800"
          fill={p.ink}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(pct)}
        </text>
        <text x="50%" y="63%" textAnchor="middle" fontSize={11.5} fontWeight="700" fill={p.muted}>
          {label}
        </text>
      </svg>
      {caption && (
        <div style={{ fontSize: 12, color: p.muted, textAlign: "center", maxWidth: 230, lineHeight: 1.5 }}>
          {caption}
        </div>
      )}
    </div>
  );
}

// ── Funnel ───────────────────────────────────────────────────────────────────

export function FunnelBars({
  rows,
  colors,
}: {
  rows: { label: string; users: number; pct: number | null; drop_pct: number | null; hint?: string }[];
  colors: string[];
}) {
  const p = usePalette();
  const top = rows[0]?.users || 1;
  // The steepest drop is the one worth acting on, so it gets called out rather
  // than left for the reader to spot by comparing seven numbers.
  const worst = rows.reduce(
    (acc, r, i) => (i > 0 && (r.drop_pct ?? 0) > (acc.drop ?? -1) ? { i, drop: r.drop_pct ?? 0 } : acc),
    { i: -1, drop: -1 as number }
  );

  return (
    <div>
      {rows.map((r, i) => {
        const width = Math.max(2, (r.users / top) * 100);
        const isWorst = i === worst.i && worst.drop > 0;
        return (
          <div key={r.label} className="nv-funnel-row" title={r.hint}>
            <div className="nv-funnel-label">{r.label}</div>
            <div className="nv-funnel-bar">
              <div
                className="nv-funnel-fill"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${
                    colors[(i + 1) % colors.length]
                  })`,
                }}
              >
                {r.users} · {r.pct ?? 0}%
              </div>
            </div>
            <div
              className="nv-funnel-drop"
              style={{ color: isWorst ? p.red : r.drop_pct ? p.muted : "transparent" }}
            >
              {r.drop_pct != null && r.drop_pct > 0 ? `−${r.drop_pct}%` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

export function HeatGrid({
  columns,
  rows,
  cell,
  colLabels,
  rowLabels,
  colorFor,
}: {
  columns: number;
  rows: number;
  cell: (r: number, c: number) => { value: number | null; title: string; text?: string };
  colLabels: (c: number) => string;
  rowLabels: (r: number) => string;
  colorFor: (value: number | null) => string;
}) {
  const p = usePalette();
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: columns > 12 ? 720 : 460 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `54px repeat(${columns}, minmax(0, 1fr))`,
            gap: 3,
            marginBottom: 3,
          }}
        >
          <div />
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="nv-axis" style={{ textAlign: "center" }}>
              {colLabels(c)}
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "grid",
              gridTemplateColumns: `54px repeat(${columns}, minmax(0, 1fr))`,
              gap: 3,
              marginBottom: 3,
            }}
          >
            <div className="nv-axis" style={{ display: "flex", alignItems: "center" }}>
              {rowLabels(r)}
            </div>
            {Array.from({ length: columns }).map((_, c) => {
              const d = cell(r, c);
              return (
                <div
                  key={c}
                  className="nv-heat-cell"
                  title={d.title}
                  style={{
                    background: colorFor(d.value),
                    color: d.value != null && d.value > 55 ? "#04121B" : p.body,
                  }}
                >
                  {d.text ?? ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
