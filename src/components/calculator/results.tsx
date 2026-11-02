"use client";
import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import { useLocale } from '@/i18n/LocaleProvider';
import { localizeString } from '@/i18n/stringZu';

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
        <I18nText>{label}</I18nText>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: highlight ? "white" : "var(--color-text-primary)" }}><I18nText>{value}</I18nText></div>
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
  const { locale } = useLocale();
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}><I18nText source={"Growth Over Time"} /></div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="year" tickFormatter={(v) => localizeString(locale, "Yr {value0}").replace("{value0}", String(v))} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
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
            labelFormatter={(l) => localizeString(locale, "Year {value0}").replace("{value0}", String(l))}
            contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {mode === "single" ? (
            <>
              <Line type="monotone" dataKey="Portfolio Value" name={localizeString(locale, "Portfolio Value")}  stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Total Contributions" name={localizeString(locale, "Total Contributions")}  stroke="#EFB343" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              {showReal && <Line type="monotone" dataKey="Today's rands" name={localizeString(locale, "Today's rands")}  stroke="#7C4DFF" strokeWidth={2} dot={false} />}
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="Investment A" name={localizeString(locale, "Investment A")}  stroke="var(--color-primary)" strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="Investment B" name={localizeString(locale, "Investment B")}  stroke="#EFB343" strokeWidth={2.5} dot={false} connectNulls={false} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
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
            <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--color-text-secondary)" }}><I18nText source={"Metric"} /></th>
            <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}><I18nText source={"Investment A"} /></th>
            <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}><I18nText source={"Investment B"} /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([metric, a, b]) => (
            <tr key={metric} style={{ borderTop: "1px solid var(--color-border)" }}>
              <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: 600 }}><I18nText>{metric}</I18nText></td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}><I18nText>{a}</I18nText></td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}><I18nText>{b}</I18nText></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
