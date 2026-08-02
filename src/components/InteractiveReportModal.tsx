"use client";

/**
 * Interactive in-app budget report.
 *
 * Renders the SAME report model the PDF is built from, but live and
 * explorable: hover a chart slice for details, tap a category to drill into
 * its transactions. The PDF stays as the static "download & share" export.
 */
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { sastToday } from "@/lib/dates";
import { formatRand } from "@/lib/viewHelpers";
import { resolvePeriod, formatPeriodLabel, type PeriodPreset } from "@/lib/budget/report/period";
import { flexibleRows, simulate, type WhatIfChanges } from "@/lib/budget/report/simulate";
import { computeStreaks, missionOutcome } from "@/lib/budget/report/snapshot";
import { X, FileText, Lightbulb } from "@/components/icons/NothoIcons";
import type { ReportModel, InsightTone, ReportSnapshotMetrics } from "@/lib/budget/report/types";

const PERIOD_OPTIONS: { key: PeriodPreset; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
  { key: "custom", label: "Custom" },
];

type LightEntry = {
  category: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  entry_date: string;
};

type ReportData = { model: ReportModel; entries: LightEntry[]; prevSnapshot: ReportSnapshotMetrics | null };

type ScorePoint = {
  monthYear: string;
  label: string;
  healthScore: number;
  healthBand: string;
  savingsRatePct: number;
  netCents: number;
};

const TONE: Record<InsightTone, string> = {
  good: "#00A97A",
  warn: "#F0A030",
  bad: "#DE6B62",
  info: "#3B7DD8",
};

function zar(cents: number): string {
  // formatRand already prefixes "R" (and a "-" for negatives).
  return formatRand(Math.round(cents / 100));
}
function zarSigned(cents: number): string {
  const v = Math.round(cents / 100);
  return (v >= 0 ? "+" : "") + formatRand(v);
}

export function InteractiveReportModal({
  open,
  onClose,
  initialStart,
  initialEnd,
  onDownloadPdf,
  downloadingPdf,
}: {
  open: boolean;
  onClose: () => void;
  initialStart: string;
  initialEnd: string;
  onDownloadPdf: (periodStart: string, periodEnd: string, redactNames: boolean) => void;
  downloadingPdf?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [drill, setDrill] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [history, setHistory] = useState<ScorePoint[]>([]);
  const [whatIf, setWhatIf] = useState<WhatIfChanges>({});
  const [preset, setPreset] = useState<PeriodPreset>("this_month");
  const [customStart, setCustomStart] = useState(initialStart);
  const [customEnd, setCustomEnd] = useState(initialEnd);
  // Defaults to true, and deliberately resets to true every time the modal
  // opens rather than being remembered. Turning masking off is a decision about
  // one specific file going to one specific person; it should not silently
  // persist into the next export weeks later.
  const [redactNames, setRedactNames] = useState(true);

  // Resolve the active window from the picker; "custom" uses the date inputs.
  const { periodStart, periodEnd } = useMemo(() => {
    if (preset === "custom") return resolvePeriod("custom", { periodStart: customStart, periodEnd: customEnd });
    return resolvePeriod(preset);
  }, [preset, customStart, customEnd]);
  const periodLabel = formatPeriodLabel(periodStart, periodEnd);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setDrill(null);
      setWhatIf({});
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setError("Please sign in again."); setLoading(false); return; }
        const [res, histRes] = await Promise.all([
          fetch("/api/budget/report", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ periodStart, periodEnd, format: "json" }),
          }),
          // Score trend is best-effort - the report renders fine without it.
          fetch("/api/budget/report/history", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ months: 12 }),
          }).catch(() => null),
        ]);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.ok) { setError(json.error || "Could not build the report."); }
        else setData({ model: json.model, entries: json.entries ?? [], prevSnapshot: json.prevSnapshot ?? null });
        if (histRes && histRes.ok) {
          const hj = await histRes.json().catch(() => null);
          if (!cancelled && hj?.ok) setHistory(hj.history ?? []);
        }
      } catch {
        if (!cancelled) setError("Could not build the report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, periodStart, periodEnd]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const model = data?.model;

  const consumptionRows = useMemo(
    () => (model?.expenseCategories ?? []).filter((r) => !r.isSavingsVehicle && r.actualCents > 0),
    [model]
  );
  const setAsideRows = useMemo(
    () => (model?.expenseCategories ?? []).filter((r) => r.isSavingsVehicle && r.actualCents > 0),
    [model]
  );
  const drillTxns = useMemo(() => {
    if (!drill || !data) return [];
    return data.entries
      .filter((e) => e.type === "expense" && e.category === drill)
      .sort((a, b) => b.amount - a.amount);
  }, [drill, data]);

  // Month-over-month score trend from history (last point vs the one before).
  const trend = useMemo(() => {
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    return { delta: last.healthScore - prev.healthScore, label: prev.label };
  }, [history]);

  // Streaks over COMPLETE months only - the in-progress month can't break
  // (or fake) a streak halfway through. SAST month, same convention as the
  // history endpoint, so the two can never disagree around month rollover.
  const streaks = useMemo(() => computeStreaks(history, sastToday().slice(0, 7)), [history]);

  // Did last report's single most important action actually happen?
  const mission = useMemo(
    () => (data?.model ? missionOutcome(data.prevSnapshot, data.model) : null),
    [data]
  );
  const topAction = model?.insights.actions.find((a) => a.isTopPriority) ?? model?.insights.actions[0];

  // What-if sliders: top flexible categories plus the biggest savings vehicle
  // ("what if I saved more?"), simulated with the SAME scoring the report
  // itself uses (shared scoreHealth), so the numbers can't disagree.
  const sliderRows = useMemo(() => {
    if (!model) return [];
    const flex = flexibleRows(model, 4);
    const vehicle = model.expenseCategories
      .filter((r) => r.isSavingsVehicle && r.actualCents > 0)
      .sort((a, b) => b.actualCents - a.actualCents)[0];
    return vehicle ? [...flex, vehicle] : flex;
  }, [model]);
  const hasWhatIf = useMemo(() => Object.values(whatIf).some((v) => v !== 0), [whatIf]);
  const sim = useMemo(
    () => (model && hasWhatIf ? simulate(model, whatIf) : null),
    [model, whatIf, hasWhatIf]
  );

  if (!open) return null;

  const bandColor = model
    ? model.insights.healthScore >= 60 ? TONE.good : model.insights.healthScore >= 40 ? TONE.warn : TONE.bad
    : TONE.info;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center" style={{ background: "rgba(0,0,0,0.6)", overflowY: "auto" }} role="dialog" aria-modal="true" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--color-bg)", width: "100%", maxWidth: 720, minHeight: "100%", boxShadow: "0 0 40px rgba(0,0,0,0.4)" }}
      >
        {/* Sticky header */}
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Budget report</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{periodLabel}</div>
          </div>
          <button type="button" onClick={() => onDownloadPdf(periodStart, periodEnd, redactNames)} disabled={downloadingPdf}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <FileText size={15} /> {downloadingPdf ? "..." : "PDF"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 999, cursor: "pointer", padding: 7, display: "flex" }}>
            <X size={18} style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>

        {/* Period selector */}
        <div style={{ position: "sticky", top: 60, zIndex: 1, background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", padding: "10px 14px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {PERIOD_OPTIONS.map((o) => (
            <button key={o.key} type="button" onClick={() => setPreset(o.key)}
              style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${preset === o.key ? "var(--color-primary)" : "var(--color-border)"}`,
                background: preset === o.key ? "var(--color-primary)" : "var(--color-surface)",
                color: preset === o.key ? "#fff" : "var(--color-text-secondary)" }}>
              {o.label}
            </button>
          ))}
          {preset === "custom" && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", width: "100%", marginTop: 6 }}>
              <input type="date" value={customStart} max={customEnd} onChange={(e) => setCustomStart(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--color-text-primary)" }} />
              <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>to</span>
              <input type="date" value={customEnd} min={customStart} onChange={(e) => setCustomEnd(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-surface)", color: "var(--color-text-primary)" }} />
            </div>
          )}
          {/* Export privacy. Lives next to the period controls because it is a
              property of the file you are about to download, not of the report
              you are reading on screen - what is shown below always uses real
              names. */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={redactNames} onChange={(e) => setRedactNames(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
              Hide names of people I pay in the PDF
              <span style={{ display: "block", fontSize: 11, color: "var(--color-text-secondary)", opacity: 0.75 }}>
                Shops and companies stay visible. Amounts never change.
              </span>
            </span>
          </label>
        </div>

        <div style={{ padding: "16px 18px 40px" }}>
          {loading && <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>Building your report…</div>}
          {error && !loading && <div style={{ padding: 24, textAlign: "center", color: TONE.bad, fontWeight: 600 }}>{error}</div>}

          {model && !loading && (
            <>
              {/* Health hero - the exec summary: verdict, score, trend */}
              <div style={{ background: "linear-gradient(135deg, #15294B, #0E1C38)", borderRadius: 16, padding: 18, marginBottom: 14, color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: "#9AA7BD" }}>Financial health</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: bandColor, lineHeight: 1 }}>{model.insights.healthScore}</span>
                      <span style={{ fontSize: 14, color: "#9AA7BD", marginBottom: 4 }}>/100</span>
                      {trend && (
                        <span style={{ fontSize: 12, fontWeight: 800, marginBottom: 5, marginLeft: 4, color: trend.delta >= 0 ? TONE.good : TONE.bad }}>
                          {trend.delta >= 0 ? "▲" : "▼"} {Math.abs(trend.delta)} vs {trend.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: bandColor }}>{model.insights.healthBand}</div>
                    {history.length >= 2 && <Sparkline points={history.map((h) => h.healthScore)} color={bandColor} />}
                  </div>
                </div>
                {/* One-line verdict - answers "how did I do?" before any chart. */}
                <div style={{ fontSize: 13.5, lineHeight: 1.45, color: "#EAF0F7", margin: "8px 0 12px" }}>{model.insights.verdict}</div>
                <div style={{ height: 7, background: "#0A1526", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ width: `${model.insights.healthScore}%`, height: "100%", background: bandColor, borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {model.insights.healthComponents.map((c) => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 4, background: TONE[c.tone], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, width: 120, flexShrink: 0 }}>{c.label} {c.score}/{c.max}</span>
                      <span style={{ fontSize: 11, color: "#9AA7BD", flex: 1 }}>{c.note}</span>
                    </div>
                  ))}
                </div>
                {model.insights.healthCapNote && (
                  <div style={{ fontSize: 11, color: "#E6B84C", marginTop: 8 }}>{model.insights.healthCapNote}</div>
                )}
                {(streaks.greenMonths >= 2 || streaks.scoreUps >= 2) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {streaks.greenMonths >= 2 && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(0,169,122,0.18)", color: "#4ADE9F", border: "1px solid rgba(0,169,122,0.4)" }}>
                        {streaks.greenMonths} green months in a row
                      </span>
                    )}
                    {streaks.scoreUps >= 2 && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(59,125,216,0.18)", color: "#7FAEE8", border: "1px solid rgba(59,125,216,0.4)" }}>
                        Score up {streaks.scoreUps} months running
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Key stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <Stat label="Income" value={zar(model.totalIncomeCents)} color={TONE.good} delta={model.comparison?.incomeDeltaPct ?? null} goodWhenUp />
                <Stat label="Day-to-day spending" value={zar(model.consumptionCents)} color={TONE.bad} delta={model.comparison?.expenseDeltaPct ?? null} goodWhenUp={false} />
                <Stat label="Set aside" value={zar(model.setAsideCents)} color="#E6B84C" sub={`${model.savingsRatePct}% of income · aim 20%`} />
                {(() => {
                  const afterLiving = model.totalIncomeCents - model.consumptionCents;
                  const allocationDeficit = model.netCents < 0 && afterLiving >= 0;
                  return (
                    <Stat
                      label={model.netCents >= 0 ? "Surplus" : allocationDeficit ? "After saving" : "Shortfall"}
                      value={zarSigned(model.netCents)}
                      color={model.netCents >= 0 ? TONE.good : allocationDeficit ? "#E6B84C" : TONE.bad}
                      sub={allocationDeficit ? "from saving, not overspending" : undefined}
                    />
                  );
                })()}
              </div>

              {/* At a glance */}
              {model.insights.highlights.length > 0 && (
                <Section title="At a glance">
                  {model.insights.highlights.map((h, i) => <ToneRow key={i} tone={h.tone} text={h.text} />)}
                </Section>
              )}

              {/* Follow-through on the PREVIOUS report's top action. */}
              {mission && (
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderLeft: `4px solid ${mission.status === "done" ? TONE.good : mission.status === "open" ? "#E6B84C" : "var(--color-border)"}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.4, flex: 1 }}>Last report&apos;s mission</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, color: "#fff", background: mission.status === "done" ? TONE.good : mission.status === "open" ? "#E6B84C" : "var(--color-text-secondary)" }}>
                      {mission.status === "done" ? "DONE" : mission.status === "open" ? "STILL OPEN" : "CAN'T MEASURE"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 2 }}>{mission.title}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--color-text-secondary)" }}>{mission.detail}</div>
                </div>
              )}

              {/* The single most important next step, surfaced in the summary. */}
              {topAction && (
                <div style={{ background: "var(--color-surface)", border: `1px solid var(--color-border)`, borderLeft: `4px solid ${TONE.good}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: TONE.good, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Do this first</div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 3 }}>{topAction.title}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--color-text-secondary)" }}>{topAction.detail}</div>
                  {topAction.impact && <div style={{ fontSize: 11.5, fontWeight: 700, color: TONE.good, marginTop: 5 }}>Impact: {topAction.impact}</div>}
                </div>
              )}

              {model.insights.dataQualityAlert && (
                <div style={{ background: "rgba(222,107,98,0.08)", border: "1px solid rgba(222,107,98,0.3)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: TONE.bad, marginBottom: 3, textTransform: "uppercase" }}>Data quality</div>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>{model.insights.dataQualityAlert}</div>
                </div>
              )}

              {/* Coach */}
              {model.insights.coachParagraphs.length > 0 && (
                <Section title="What Cosmo noticed" icon={<Lightbulb size={16} style={{ color: "#E6B84C" }} />}>
                  {model.insights.coachParagraphs.map((p, i) => (
                    <p key={i} style={{ fontSize: 13.5, lineHeight: 1.5, margin: i === 0 ? 0 : "8px 0 0" }}>{p}</p>
                  ))}
                </Section>
              )}

              {/* Behavioural patterns + money personality (Phase 2) */}
              {model.behaviour && (model.behaviour.patterns.length > 0 || model.behaviour.monthsAnalysed >= 1) && (
                <Section title="Your patterns">
                  {model.behaviour.personality ? (
                    <div style={{ background: "linear-gradient(135deg, rgba(230,184,76,0.12), rgba(230,184,76,0.04))", border: "1px solid rgba(230,184,76,0.35)", borderRadius: 10, padding: 12, marginBottom: model.behaviour.patterns.length ? 10 : 0 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#B8860B", marginBottom: 2 }}>Money personality</div>
                      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{model.behaviour.personality.label}</div>
                      {model.behaviour.personality.evidence.map((ev, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>· {ev}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: model.behaviour.patterns.length ? 10 : 0, lineHeight: 1.4 }}>
                      Still learning your patterns - your money personality appears once 3 complete months of data are in ({model.behaviour.monthsAnalysed} so far).
                    </div>
                  )}
                  {model.behaviour.patterns.map((p) => (
                    <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 4, background: TONE[p.tone], marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{p.title}</div>
                        <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--color-text-secondary)" }}>{p.detail}</div>
                      </div>
                    </div>
                  ))}
                  {model.behaviour.monthsAnalysed >= 2 && (
                    <div style={{ fontSize: 10.5, color: "var(--color-text-secondary)", marginTop: 4 }}>
                      Based on your last {model.behaviour.monthsAnalysed} complete months of data, not just this period.
                    </div>
                  )}
                </Section>
              )}

              {/* Wins / Risks */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px" }}>Wins</h4>
                  {model.insights.wins.length ? model.insights.wins.map((w, i) => <ToneRow key={i} tone="good" text={w} small />) : <Muted>None this period.</Muted>}
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px" }}>Risks</h4>
                  {model.insights.risks.length ? model.insights.risks.map((r, i) => <ToneRow key={i} tone="bad" text={r} small />) : <Muted>Nothing flagged.</Muted>}
                </div>
              </div>

              {/* Actions */}
              {model.insights.actions.length > 0 && (
                <Section title="Your next moves">
                  {model.insights.actions.map((a, i) => (
                    <div key={i} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderLeft: `3px solid ${a.isTopPriority ? TONE.bad : "#E6B84C"}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 800, fontSize: 13.5, flex: 1 }}>{i + 1}. {a.title}</span>
                        {a.isTopPriority && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: TONE.bad, padding: "2px 6px", borderRadius: 4 }}>DO THIS FIRST</span>}
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--color-text-secondary)" }}>{a.detail}</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 5 }}>
                        {a.impact && <span style={{ fontSize: 11, fontWeight: 700, color: TONE.good }}>Impact: {a.impact}</span>}
                        {a.lesson && <Link href={`/lesson/${a.lesson.courseId}/${a.lesson.lessonId}`} style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lesson: {a.lesson.title} →</Link>}
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {/* What-if sliders - try a change, watch the score move */}
              {sliderRows.length > 0 && (
                <Section title="What if?">
                  <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginBottom: 10, lineHeight: 1.4 }}>
                    Drag a slider to try a change to your flexible spending - or to how much you set aside. A simple projection: income and everything else stay as they are.
                  </div>
                  {sliderRows.map((r) => {
                    const pct = whatIf[r.categoryId] ?? 0;
                    const adjusted = Math.round(r.actualCents * (1 + pct / 100));
                    // For spending, cutting (-) is the good direction; for a
                    // savings vehicle, putting MORE away (+) is the good one.
                    const goodDir = r.isSavingsVehicle ? pct > 0 : pct < 0;
                    return (
                      <div key={r.categoryId} style={{ padding: "6px 0 10px", borderBottom: "1px solid var(--color-border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: r.isSavingsVehicle ? "#E6B84C" : r.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>
                            {r.categoryName}
                            {r.isSavingsVehicle && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-secondary)" }}> · set aside</span>}
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: pct === 0 ? "var(--color-text-secondary)" : goodDir ? TONE.good : TONE.bad, width: 44, textAlign: "right" }}>
                            {pct === 0 ? "as is" : `${pct > 0 ? "+" : ""}${pct}%`}
                          </span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, width: 130, textAlign: "right", color: "var(--color-text-secondary)" }}>
                            {pct === 0 ? zar(r.actualCents) : <>{zar(r.actualCents)} → <span style={{ color: "var(--color-text-primary)" }}>{zar(adjusted)}</span></>}
                          </span>
                        </div>
                        <input
                          type="range" min={-30} max={30} step={5} value={pct}
                          aria-label={r.isSavingsVehicle ? `Change how much you set aside into ${r.categoryName}` : `Change ${r.categoryName} spending`}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setWhatIf((cur) => ({ ...cur, [r.categoryId]: v }));
                          }}
                          style={{ width: "100%", accentColor: pct === 0 || goodDir ? TONE.good : TONE.bad, cursor: "pointer" }}
                        />
                      </div>
                    );
                  })}

                  {sim ? (
                    <div style={{ marginTop: 10, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>Health score</span>
                        <span style={{ fontSize: 14, fontWeight: 900 }}>
                          {sim.baseline.healthScore} → <span style={{ color: sim.scoreDelta > 0 ? TONE.good : sim.scoreDelta < 0 ? TONE.bad : "var(--color-text-primary)" }}>{sim.adjusted.healthScore}</span>
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 999, color: "#fff", background: sim.scoreDelta > 0 ? TONE.good : sim.scoreDelta < 0 ? TONE.bad : "var(--color-text-secondary)" }}>
                          {sim.scoreDelta > 0 ? `▲ +${sim.scoreDelta}` : sim.scoreDelta < 0 ? `▼ ${sim.scoreDelta}` : "no change"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{sim.adjusted.netCents >= 0 ? "Surplus" : "Net for period"}</span>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>
                          {zarSigned(sim.baseline.netCents)} → <span style={{ color: sim.netDeltaCents > 0 ? TONE.good : sim.netDeltaCents < 0 ? TONE.bad : "var(--color-text-primary)" }}>{zarSigned(sim.adjusted.netCents)}</span>
                        </span>
                      </div>
                      {sim.savingsRateDeltaPct !== 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>Set-aside rate</span>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{sim.baseline.savingsRatePct}% → {sim.adjusted.savingsRatePct}%</span>
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, color: sim.monthlyFreedCents >= 0 ? TONE.good : TONE.bad, marginTop: 2 }}>
                        {sim.monthlyFreedCents >= 0
                          ? `Frees ≈ ${zar(sim.monthlyFreedCents)}/month - about ${zar(sim.annualFreedCents)} over 12 months.`
                          : `Costs ≈ ${zar(-sim.monthlyFreedCents)}/month more - about ${zar(-sim.annualFreedCents)} over 12 months.`}
                      </div>
                      <button type="button" onClick={() => setWhatIf({})}
                        style={{ marginTop: 8, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-secondary)", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--color-text-secondary)" }}>
                      Move a slider to see the effect on your score, surplus and the next 12 months.
                    </div>
                  )}
                </Section>
              )}

              {/* Interactive spending donut */}
              <Section title="Where every rand went">
                <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  Hover a slice for detail. Tap a category to see its transactions. Money set aside is listed separately.
                </div>
                {consumptionRows.length > 0 ? (
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={consumptionRows.map((r) => ({ name: r.categoryName, value: r.actualCents / 100, id: r.categoryId, color: r.color }))}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={1}
                          onClick={(d: unknown) => { const p = d as { id?: string }; if (p?.id) setDrill((cur) => cur === p.id ? null : p.id!); }}
                        >
                          {consumptionRows.map((r) => (
                            <Cell key={r.categoryId} fill={r.color} style={{ cursor: "pointer", outline: "none", opacity: drill && drill !== r.categoryId ? 0.4 : 1 }} />
                          ))}
                        </Pie>
                        <Tooltip content={<SpendTooltip total={model.consumptionCents} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <Muted>No day-to-day spending recorded.</Muted>}

                {/* Category list (tap to drill) */}
                <div style={{ marginTop: 6 }}>
                  {consumptionRows.map((r) => (
                    <div key={r.categoryId}>
                      <button type="button" onClick={() => setDrill((cur) => cur === r.categoryId ? null : r.categoryId)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", background: drill === r.categoryId ? "var(--color-surface)" : "transparent", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left", color: "var(--color-text-primary)" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{r.categoryName}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{r.sharePct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 800, width: 78, textAlign: "right" }}>{zar(r.actualCents)}</span>
                      </button>
                      {drill === r.categoryId && (
                        <div style={{ padding: "6px 4px 10px 24px", background: "var(--color-surface)" }}>
                          {drillTxns.length ? drillTxns.slice(0, 20).map((t, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, padding: "3px 0", color: "var(--color-text-secondary)" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.entry_date} · {t.description || "—"}</span>
                              <span style={{ fontWeight: 700, flexShrink: 0, color: "var(--color-text-primary)" }}>{zar(Math.round(t.amount * 100))}</span>
                            </div>
                          )) : <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No itemised transactions.</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {setAsideRows.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--color-border)" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 4 }}>Money set aside (not spent)</div>
                    {setAsideRows.map((r) => (
                      <div key={r.categoryId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#E6B84C", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, flex: 1 }}>{r.categoryName}</span>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{zar(r.actualCents)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Monthly performance */}
              {model.monthlySpend.length >= 2 && (
                <Section title="Month by month">
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={model.monthlySpend.map((m) => ({ name: m.label + (m.isPartial ? "*" : ""), Income: Math.round(m.incomeCents / 100), "Day-to-day": Math.round(m.consumptionCents / 100), "Set aside": Math.round(m.setAsideCents / 100) }))} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                        <Tooltip formatter={(v) => formatRand(Number(v))} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Income" fill="#00A97A" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Day-to-day" fill="#DE6B62" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Set aside" fill="#E6B84C" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {/* Progressive disclosure: the reference detail lives behind a toggle
                  so the default view stays a focused executive summary. */}
              {(model.insights.benchmarks.length > 0 || model.recurringCommitments.length > 0) && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetail((v) => !v)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}
                  >
                    {showDetail ? "Hide full detail" : "See full detail (guidelines, recurring bills)"}
                  </button>

                  {showDetail && (
                    <>
                      {model.insights.benchmarks.length > 0 && (
                        <Section title="How you compare to guidelines">
                          {model.insights.benchmarks.map((b) => (
                            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: TONE[b.tone], flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5, flex: 1 }}>{b.label}</span>
                              <span style={{ fontSize: 12.5, fontWeight: 800, color: TONE[b.tone] }}>{b.value}</span>
                              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", width: 110, textAlign: "right" }}>{b.target}</span>
                            </div>
                          ))}
                        </Section>
                      )}

                      {model.recurringCommitments.length > 0 && (
                        <Section title="Recurring commitments">
                          {model.recurringCommitments.map((r) => (
                            <div key={r.description} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                              <span style={{ fontSize: 13, flex: 1 }}>{r.description}<span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}> · {r.categoryName}</span></span>
                              <span style={{ fontSize: 13, fontWeight: 800 }}>{zar(r.typicalCents)}<span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontWeight: 600 }}>/mo</span></span>
                            </div>
                          ))}
                        </Section>
                      )}
                    </>
                  )}
                </>
              )}

              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8 }}>
                Educational insights based on your own data - not financial advice. Notho is not a registered financial services provider.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, sub, delta, goodWhenUp }: { label: string; value: string; color: string; sub?: string; delta?: number | null; goodWhenUp?: boolean }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--color-text-secondary)", marginTop: 2 }}>{sub}</div>}
      {delta != null && (
        <div style={{ fontSize: 10.5, marginTop: 3, color: (delta >= 0) === !!goodWhenUp ? TONE.good : TONE.bad }}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs previous
        </div>
      )}
    </div>
  );
}

/** Tiny inline score sparkline (last N monthly scores). */
function Sparkline({ points, color, width = 96, height = 26 }: { points: number[]; color: string; width?: number; height?: number }) {
  if (points.length < 2) return null;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => `${(i * stepX).toFixed(1)},${(height - ((p - min) / span) * height).toFixed(1)}`);
  const last = coords[coords.length - 1].split(",");
  return (
    <svg width={width} height={height} style={{ display: "block", marginTop: 4 }} aria-hidden>
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={color} />
    </svg>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {icon}
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 12 }}>{children}</div>
    </div>
  );
}

function ToneRow({ tone, text, small }: { tone: InsightTone; text: string; small?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: 4, background: TONE[tone], marginTop: 5, flexShrink: 0 }} />
      <span style={{ fontSize: small ? 12 : 13, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>{children}</div>;
}

function SpendTooltip({ active, payload, total }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }>; total?: number }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const pct = total && total > 0 ? Math.round((p.value * 100) / (total / 100)) : 0;
  return (
    <div style={{ background: "#15294B", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />{p.name}
      </div>
      <div style={{ marginTop: 2 }}>{formatRand(p.value)} · {pct}%</div>
    </div>
  );
}

export default InteractiveReportModal;
