"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { useUserSettings } from "@/hooks/useUserSettings";
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
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Info,
  Target,
  TrendingUp,
  Wallet,
} from "@/components/icons/NothoIcons";
import { formatWithSpaces, formatRand, formatZAR } from "@/lib/formatters";
import { ShareResultButton } from "@/components/ShareCard";
import {
  type CalcInputs,
  calcGrowth,
  solveForYears,
  solveForMonthly,
  solveForRate,
  solveForInitial,
} from "@/lib/calculators";

export type { CalcInputs };

type SolveMode = "goal" | "time" | "monthly" | "rate" | "initial";

function FieldTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        className="rounded-full p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info size={14} strokeWidth={2.5} aria-hidden />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-2 text-left text-xs font-medium leading-snug text-white shadow-lg dark:bg-gray-700"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function CalcNumberRow({
  label,
  tooltip,
  value,
  onChange,
  step = "any",
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
}) {
  const [str, setStr] = useState(String(value));
  useEffect(() => {
    setStr(String(value));
  }, [value]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{label}</span>
        <FieldTip text={tooltip} />
      </div>
      <input
        type="number"
        step={step}
        value={str}
        onChange={(e) => setStr(e.target.value)}
        onBlur={() => {
          const n = parseFloat(str.replace(/,/g, ""));
          if (Number.isNaN(n)) {
            setStr(String(value));
            return;
          }
          onChange(n);
          setStr(String(n));
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1.5px solid var(--color-border)",
          fontSize: 15,
          fontWeight: 600,
          background: "var(--color-surface)",
          color: "var(--color-text-primary)",
        }}
        aria-label={label}
      />
    </div>
  );
}

export function CalculatorView() {
  const [calcViewUserId, setCalcViewUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCalcViewUserId(data.user?.id ?? null)).catch(() => {});
  }, []);
  const calcViewSettings = useUserSettings(calcViewUserId);

  const defaultInputs: CalcInputs = {
    principal: 50000,
    monthly: 1000,
    rate: 10,
    years: 10,
    escalation: 5,
    frequency: "monthly",
  };

  const [mode, setMode] = useState<"single" | "compare">("single");
  const [solveMode, setSolveMode] = useState<SolveMode>("goal");
  const [goalTarget, setGoalTarget] = useState("500000");
  const [solveResult, setSolveResult] = useState<{ label: string; value: string; sub?: string } | null>(null);
  const [inputsA, setInputsA] = useState<CalcInputs>(defaultInputs);
  const [inputsB, setInputsB] = useState<CalcInputs>({ ...defaultInputs, rate: 7, monthly: 500 });
  const [startYearB, setStartYearB] = useState(0);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calcA, setCalcA] = useState<CalcInputs>(defaultInputs);
  const [calcB, setCalcB] = useState<CalcInputs>({ ...defaultInputs, rate: 7, monthly: 500 });
  const [calcStartYearB, setCalcStartYearB] = useState(0);
  const [projectionSaved, setProjectionSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const remoteCalc = calcViewSettings.settings.calcSaved as Partial<CalcInputs> | null;
    const localRaw = localStorage.getItem("notho-calc-saved");
    const saved: Partial<CalcInputs> | null = remoteCalc ?? (() => {
      try { return localRaw ? JSON.parse(localRaw) as Partial<CalcInputs> : null; } catch { return null; }
    })();
    if (saved) {
      setInputsA((prev) => ({ ...prev, ...saved }));
      setCalcA((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  const handleCalculate = () => {
    const goal = parseFloat(goalTarget.replace(/[^0-9.]/g, "")) || 0;
    let effectiveA = { ...inputsA };
    let result: { label: string; value: string; sub?: string } | null = null;
    if (solveMode !== "goal" && goal > 0) {
      if (solveMode === "time") {
        const yrs = solveForYears(inputsA, goal);
        if (!isFinite(yrs)) {
          result = { label: "Time Needed", value: "Not achievable", sub: "Try a higher monthly amount or return rate" };
        } else {
          const roundedYrs = Math.ceil(yrs);
          effectiveA = { ...inputsA, years: roundedYrs };
          result = { label: "Time Needed", value: `${roundedYrs} year${roundedYrs !== 1 ? "s" : ""}`, sub: `to reach ${formatZAR(goal)}` };
        }
      } else if (solveMode === "monthly") {
        const monthly = solveForMonthly(inputsA, goal);
        if (!isFinite(monthly)) {
          result = { label: "Monthly Savings Needed", value: "Not achievable", sub: "Try a longer period or lower goal" };
        } else {
          effectiveA = { ...inputsA, monthly };
          result = { label: "Monthly Savings Needed", value: formatZAR(monthly), sub: `per month to reach ${formatZAR(goal)} in ${inputsA.years} years` };
        }
      } else if (solveMode === "rate") {
        const rate = solveForRate(inputsA, goal);
        if (!isFinite(rate)) {
          result = { label: "Return Rate Needed", value: "Not achievable", sub: "Try a higher contribution or longer period" };
        } else {
          effectiveA = { ...inputsA, rate };
          result = { label: "Annual Return Rate Needed", value: `${rate.toFixed(2)}% p.a.`, sub: `to reach ${formatZAR(goal)} in ${inputsA.years} years` };
        }
      } else if (solveMode === "initial") {
        const principal = solveForInitial(inputsA, goal);
        if (!isFinite(principal)) {
          result = { label: "Lump Sum Needed Today", value: "Not achievable", sub: "Try a longer period or higher monthly amount" };
        } else {
          effectiveA = { ...inputsA, principal };
          result = { label: "Lump Sum Needed Today", value: formatZAR(principal), sub: `to reach ${formatZAR(goal)} in ${inputsA.years} years` };
        }
      }
    }
    setCalcA(effectiveA);
    setCalcB(inputsB);
    setCalcStartYearB(startYearB);
    setHasCalculated(true);
    setProjectionSaved(false);
    setSolveResult(result);
    analytics.calculatorSolveModeUsed(solveMode, {
      monthly: inputsA.monthly,
      rate: inputsA.rate,
      years: inputsA.years,
      principal: inputsA.principal,
    });
  };

  const handlePinProjection = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notho-calc-saved", JSON.stringify(inputsA));
      void calcViewSettings.setCalcSaved(inputsA as Record<string, unknown>);
      setProjectionSaved(true);
    }
  };

  const dataA = useMemo(() => (hasCalculated ? calcGrowth(calcA) : []), [hasCalculated, calcA]);
  const dataB = useMemo(() => (hasCalculated ? calcGrowth(calcB) : []), [hasCalculated, calcB]);
  const finalA = hasCalculated && dataA.length > 0 ? dataA[dataA.length - 1] : { year: 0, value: 0, contributions: 0, interest: 0 };
  const finalB = hasCalculated && dataB.length > 0 ? dataB[dataB.length - 1] : { year: 0, value: 0, contributions: 0, interest: 0 };

  const chartData: Record<string, number | null>[] = useMemo(() => {
    if (!hasCalculated) return [];
    if (mode === "single") {
      return dataA.map((d) => ({
        year: d.year,
        "Portfolio Value": d.value,
        "Total Contributions": d.contributions,
      }));
    }
    const maxYear = Math.max(
      dataA.length > 0 ? dataA[dataA.length - 1].year : 0,
      calcStartYearB + (dataB.length > 0 ? dataB[dataB.length - 1].year : 0)
    );
    const rows: Record<string, number | null>[] = [];
    for (let y = 0; y <= maxYear; y++) {
      const aVal: number | null = y < dataA.length ? dataA[y].value : null;
      const bIdx = y - calcStartYearB;
      const bVal: number | null = bIdx >= 0 && bIdx < dataB.length ? dataB[bIdx].value : null;
      rows.push({ year: y, "Investment A": aVal, "Investment B": bVal });
    }
    return rows;
  }, [hasCalculated, mode, dataA, dataB, calcStartYearB]);

  const ResultCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div style={{ background: highlight ? "var(--color-primary)" : "var(--color-surface)", border: `1px solid ${highlight ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: 12, padding: "16px 20px", textAlign: "center", flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: highlight ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: highlight ? "white" : "var(--color-text-primary)" }}>{value}</div>
    </div>
  );

  const calcReturnPct = (value: number, contributions: number) => {
    if (contributions <= 0) return 0;
    return ((value - contributions) / contributions) * 100;
  };

  const InputPanel = ({ label, inputs, setInputs, hideField }: { label?: string; inputs: CalcInputs; setInputs: (i: CalcInputs) => void; hideField?: SolveMode }) => (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, flex: 1 }}>
      {label && (<div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>)}
      {hideField !== "initial" && (<CalcNumberRow label="Initial Amount (R)" tooltip="The lump sum you're starting with today." value={inputs.principal} onChange={(v) => setInputs({ ...inputs, principal: Math.max(0, v) })} />)}
      {hideField !== "monthly" && (<CalcNumberRow label="Monthly Contribution (R)" tooltip="How much you add every month." value={inputs.monthly} onChange={(v) => setInputs({ ...inputs, monthly: Math.max(0, v) })} />)}
      {hideField !== "rate" && (<CalcNumberRow label="Annual Return Rate (%)" tooltip="The yearly growth rate (e.g. JSE average is ~10%)." value={inputs.rate} step="0.01" onChange={(v) => setInputs({ ...inputs, rate: v })} />)}
      <CalcNumberRow label="Annual Contribution Increase (%)" tooltip="How much you increase your monthly contribution each year (inflation hedge)." value={inputs.escalation} step="0.01" onChange={(v) => setInputs({ ...inputs, escalation: v })} />
      {hideField !== "time" && (<CalcNumberRow label="Investment Period (years)" tooltip="How many years you plan to invest for." value={inputs.years} step="1" onChange={(v) => setInputs({ ...inputs, years: Math.max(0, Math.floor(v)) })} />)}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Investment Frequency</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["monthly", "annually", "once-off"] as const).map((f) => (
            <button key={f} onClick={() => setInputs({ ...inputs, frequency: f })} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "2px solid", borderColor: inputs.frequency === f ? "var(--color-primary)" : "var(--color-border)", background: inputs.frequency === f ? "var(--color-primary-light)" : "white", color: inputs.frequency === f ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
              {f === "once-off" ? "Once-off" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const SOLVE_OPTIONS: { id: SolveMode; label: string; Icon: React.ComponentType<{size?: number; style?: React.CSSProperties}>; desc: string }[] = [
    { id: "goal", label: "End Goal", Icon: Target, desc: "What will my investment be worth?" },
    { id: "time", label: "Time Needed", Icon: Clock, desc: "How long to reach my goal?" },
    { id: "monthly", label: "Monthly Amount", Icon: TrendingUp, desc: "How much must I save monthly?" },
    { id: "rate", label: "Return Rate", Icon: BarChart2, desc: "What return rate do I need?" },
    { id: "initial", label: "Starting Amount", Icon: Wallet, desc: "How much must I invest today?" },
  ];

  return (
    <main id="mainContent">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Investment Calculator</h2>
        {solveMode === "goal" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className={mode === "single" ? "btn btn-primary" : "btn btn-secondary"} style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => setMode("single")}>Single</button>
            <button className={mode === "compare" ? "btn btn-primary" : "btn btn-secondary"} style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => setMode("compare")}>Compare</button>
          </div>
        )}
      </div>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>What are you solving for?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {SOLVE_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => { setSolveMode(opt.id); setHasCalculated(false); setSolveResult(null); }} style={{ padding: "10px 8px", borderRadius: 10, border: `2px solid ${solveMode === opt.id ? "var(--color-primary)" : "var(--color-border)"}`, background: solveMode === opt.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", cursor: "pointer", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}><opt.Icon size={18} /></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-primary)" }}>{opt.label}</div>
            </button>
          ))}
        </div>
        {solveMode !== "goal" && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>{SOLVE_OPTIONS.find(o => o.id === solveMode)?.desc} - Target Goal Amount (R)</div>
            <input type="number" inputMode="decimal" placeholder="e.g. 1000000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--color-primary)", fontSize: 16, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <InputPanel inputs={inputsA} setInputs={setInputsA} label={mode === "compare" && solveMode === "goal" ? "Investment A" : undefined} hideField={solveMode !== "goal" ? solveMode : undefined} />
        {mode === "compare" && solveMode === "goal" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <InputPanel inputs={inputsB} setInputs={setInputsB} label="Investment B" />
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "12px 16px" }}>
              <CalcNumberRow label="Starts how many years from now?" tooltip="Delay Investment B's start date to simulate the cost of waiting." value={startYearB} step="1" onChange={(v) => setStartYearB(Math.max(0, Math.round(v)))} />
            </div>
          </div>
        )}
      </div>
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleCalculate}>
        <BarChart2 size={20} aria-hidden /> Calculate
      </button>
      {!hasCalculated && (<div style={{ textAlign: "center", padding: "18px 0", color: "var(--color-text-secondary)" }}>{solveMode === "goal" ? "Set your values above, then tap Calculate" : "Set your inputs above and enter a target goal, then tap Calculate"}</div>)}
      {hasCalculated && solveResult && (
        <>
          <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #005F68 100%)", borderRadius: 16, padding: "20px 24px", marginBottom: 12, color: "white", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.8, marginBottom: 8 }}>{solveResult.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{solveResult.value}</div>
            {solveResult.sub && <div style={{ fontSize: 13, opacity: 0.85 }}>{solveResult.sub}</div>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <ShareResultButton data={{ type: "calculator", headline: `${solveResult.value} - ${solveResult.label.toLowerCase()}`, sub: solveResult.sub ?? `Saving R${formatWithSpaces(inputsA.monthly)}/month at ${inputsA.rate}% p.a. - calculated on Notho` }} label="Share this result" />
          </div>
        </>
      )}
      {hasCalculated && mode === "single" && solveMode === "goal" && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <ResultCard label="Final Value" value={formatRand(finalA.value)} highlight />
            <ResultCard label="Total Contributions" value={formatRand(finalA.contributions)} />
            <ResultCard label="Total Interest" value={formatRand(finalA.interest)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <ShareResultButton data={{ type: "calculator", headline: `My R${formatWithSpaces(inputsA.monthly)}/month investment could be worth ${formatRand(finalA.value)} in ${inputsA.years} years`, sub: `At ${inputsA.rate}% p.a. \u00b7 R${formatWithSpaces(finalA.interest)} in interest earned \u00b7 Calculated on Notho` }} label="Share this calculation" />
          </div>
        </>
      )}
      {hasCalculated && mode === "compare" && (
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
              {[
                ["Final Value", formatZAR(finalA.value), formatZAR(finalB.value)],
                ["Contributions", formatZAR(finalA.contributions), formatZAR(finalB.contributions)],
                ["Interest", formatZAR(finalA.interest), formatZAR(finalB.interest)],
                ["Return %", `${calcReturnPct(finalA.value, finalA.contributions).toFixed(1)}%`, `${calcReturnPct(finalB.value, finalB.contributions).toFixed(1)}%`],
                ["Term", `${calcA.years} yrs`, `${calcB.years} yrs`],
                ["Starts at year", "0", calcStartYearB > 0 ? `${calcStartYearB}` : "0"],
                ["Ends at year", `${calcA.years}`, `${calcStartYearB + calcB.years}`],
              ].map(([metric, a, b]) => (
                <tr key={metric} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: 600 }}>{metric}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>{a}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasCalculated && mode === "compare" && (
        <div style={{ marginBottom: 16 }}>
          <ShareResultButton data={{ type: "calculator", headline: `Investment A: ${formatZAR(finalA.value)} vs Investment B: ${formatZAR(finalB.value)}`, sub: `A: R${formatWithSpaces(calcA.monthly)}/mo at ${calcA.rate}% over ${calcA.years} yrs \u00b7 B: R${formatWithSpaces(calcB.monthly)}/mo at ${calcB.rate}%${calcStartYearB > 0 ? ` (starts yr ${calcStartYearB})` : ""} \u00b7 Calculated on Notho` }} label="Share this comparison" />
        </div>
      )}
      {hasCalculated && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Growth Over Time</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <YAxis tickFormatter={(v) => { if (v >= 1_000_000) return `R${(v / 1_000_000).toFixed(1)}M`; if (v >= 1_000) return `R${(v / 1_000).toFixed(0)}k`; return `R${v}`; }} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} width={58} />
              <Tooltip formatter={(v) => formatZAR(typeof v === "number" ? v : Number(v ?? 0))} labelFormatter={(l) => `Year ${l}`} contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {mode === "single" ? (
                <>
                  <Line type="monotone" dataKey="Portfolio Value" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Total Contributions" stroke="#EFB343" strokeWidth={2} dot={false} strokeDasharray="5 5" />
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
      )}
      {hasCalculated && !projectionSaved && (
        <button onClick={handlePinProjection} style={{ width: "100%", marginBottom: 12, padding: "11px 16px", borderRadius: 12, border: "1.5px solid var(--color-primary)", background: "transparent", color: "var(--color-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <TrendingUp size={16} aria-hidden /> Save this projection to my Profile
        </button>
      )}
      {projectionSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 size={16} className="shrink-0" aria-hidden />
          <span>Projection pinned to your Profile - tap Profile to view it.</span>
        </div>
      )}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-5 text-white mb-8" style={{ marginBottom: 32 }}>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-green-100/90">Available</span>
        </div>
        <p className="text-green-100 text-sm leading-relaxed mb-4">See how your investments could grow with projections built around your numbers.</p>
        <button type="button" onClick={() => { analytics.advisorCtaClicked("calculator_cta"); window.open("https://wealthwithkwanele.co.za", "_blank", "noopener,noreferrer"); }} className="block w-full py-3 bg-white text-green-800 rounded-xl font-bold text-center text-sm hover:bg-green-50 transition-colors">Get Your Free Investment Plan</button>
      </div>
    </main>
  );
}
