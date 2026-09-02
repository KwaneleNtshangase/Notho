"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatZAR } from "@/lib/formatters";
import { type GrowthPoint } from "@/lib/calculators";

export function ResultCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? "var(--color-primary)" : "var(--color-surface)",
        border: `1px solid ${highlight ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: 12,
        padding: "16px 20px",
        textAlign: "center",
        flex: 1,
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: highlight ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: highlight ? "white" : "var(--color-text-primary)" }}>{value}</div>
    </div>
  );
}

export function GrowthChart({
  chartData,
  mode,
  showReal,
}: {
  chartData: Record<string, number | null>[];
  mode: "single" | "compare";
  showReal: boolean;
}) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Growth Over Time</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
          <YAxis
            tickFormatter={(v) => {
              if (v >= 1_000_000) return `R${(v / 1_000_000).toFixed(1)}M`;
              if (v >= 1_000) return `R${(v / 1_000).toFixed(0)}k`;
              return `R${v}`;
            }}
            tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
            width={58}
          />
          <Tooltip
            formatter={(v) => formatZAR(typeof v === "number" ? v : Number(v ?? 0))}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {mode === "single" ? (
            <>
              <Line type="monotone" dataKey="Portfolio Value" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Total Contributions" stroke="#EFB343" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              {showReal && <Line type="monotone" dataKey="Today's rands" stroke="#7C4DFF" strokeWidth={2} dot={false} />}
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="Investment A" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="Investment B" stroke="#EFB343" strokeWidth={2.5} dot={false} connectNulls={false} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetAsk({
  onDismiss,
  monthly,
}: {
  onDismiss: () => void;
  monthly?: number;
}) {
  const amount = Math.max(0, Math.round(monthly ?? 0));
  const openBudget = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "notho-calc-budget-hint",
        JSON.stringify({ monthly: amount, at: Date.now() })
      );
    }
  };
  return (
    <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Does this contribution fit the month?</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12, lineHeight: 1.45 }}>
        {amount > 0
          ? `This plan uses ${formatZAR(amount)} a month. Open Budget to put that figure next to this month's surplus — we will not change these calculator inputs or pull a live balance.`
          : "Open Budget to see this month's surplus next to the plan. Skip if this is a what-if or a client scenario. We will not change these inputs or pull a live balance."}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a href="/budget" className="btn btn-primary" style={{ padding: "8px 12px", fontSize: 13, textDecoration: "none" }} onClick={openBudget}>
          Check against budget
        </a>
        <button type="button" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: 13 }} onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}

export function CompareTable({
  finalA,
  finalB,
  yearsA,
  yearsB,
  startB,
}: {
  finalA: GrowthPoint;
  finalB: GrowthPoint;
  yearsA: number;
  yearsB: number;
  startB: number;
}) {
  const pct = (value: number, contributions: number) => (contributions <= 0 ? 0 : ((value - contributions) / contributions) * 100);
  const rows = [
    ["Final Value", formatZAR(finalA.value), formatZAR(finalB.value)],
    ["Contributions", formatZAR(finalA.contributions), formatZAR(finalB.contributions)],
    ["Interest", formatZAR(finalA.interest), formatZAR(finalB.interest)],
    ["Return %", `${pct(finalA.value, finalA.contributions).toFixed(1)}%`, `${pct(finalB.value, finalB.contributions).toFixed(1)}%`],
    ["Term", `${yearsA} yrs`, `${yearsB} yrs`],
    ["Starts at year", "0", startB > 0 ? `${startB}` : "0"],
    ["Ends at year", `${yearsA}`, `${startB + yearsB}`],
  ];
  return (
    <div style={{ marginBottom: 24, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "var(--color-bg)" }}>
            <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--color-text-secondary)" }}>Metric</th>
            <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>Investment A</th>
            <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}>Investment B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([metric, a, b]) => (
            <tr key={metric} style={{ borderTop: "1px solid var(--color-border)" }}>
              <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: 600 }}>{metric}</td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>{a}</td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
