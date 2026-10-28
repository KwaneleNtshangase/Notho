/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Target,
  TrendingUp,
  Wallet,
} from "@/components/icons/NothoIcons";
import { analytics } from "@/lib/analytics";
import { supabase } from "@/lib/supabaseClient";
import { sastToday } from "@/lib/dates";
import { bumpWeeklyStats } from "@/lib/weeklyStats";
import {
  type CalcInputs,
  calcGrowth,
  formatWithSpaces,
  formatZAR,
  ShareResultButton,
} from "@/lib/viewHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers (CalculatorView-only)
// ─────────────────────────────────────────────────────────────────────────────

/** Bisection solver - finds value where fn(v) ≈ 0; fn must be monotone increasing. */
function bisectSolver(fn: (v: number) => number, lo: number, hi: number, iters = 64): number {
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function solveForYears(base: CalcInputs, goal: number): number {
  if ((calcGrowth({ ...base, years: 0 }).at(-1)?.value ?? 0) >= goal) return 0;
  if ((calcGrowth({ ...base, years: 100 }).at(-1)?.value ?? 0) < goal) return Infinity;
  return bisectSolver((n) => (calcGrowth({ ...base, years: Math.ceil(n) }).at(-1)?.value ?? 0) - goal, 0, 100);
}
function solveForMonthly(base: CalcInputs, goal: number): number {
  if ((calcGrowth({ ...base, monthly: 0 }).at(-1)?.value ?? 0) >= goal) return 0;
  const cap = Math.max(goal / Math.max(base.years, 1) / 12, 50000);
  return bisectSolver((m) => (calcGrowth({ ...base, monthly: m }).at(-1)?.value ?? 0) - goal, 0, cap);
}
function solveForRate(base: CalcInputs, goal: number): number {
  if ((calcGrowth({ ...base, rate: 0 }).at(-1)?.value ?? 0) >= goal) return 0;
  if ((calcGrowth({ ...base, rate: 100 }).at(-1)?.value ?? 0) < goal) return Infinity;
  return bisectSolver((r) => (calcGrowth({ ...base, rate: r }).at(-1)?.value ?? 0) - goal, 0, 100);
}
function solveForInitial(base: CalcInputs, goal: number): number {
  if ((calcGrowth({ ...base, principal: 0 }).at(-1)?.value ?? 0) >= goal) return 0;
  return bisectSolver((p) => (calcGrowth({ ...base, principal: p }).at(-1)?.value ?? 0) - goal, 0, Math.max(goal * 2, 10_000_000));
}

function formatYAxis(v: number): string {
  if (v >= 1_000_000) return `R${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R${(v / 1_000).toFixed(0)}k`;
  return `R${v}`;
}

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
  min,
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
  min?: number;
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
        min={min}
        value={str}
        onChange={(e) => setStr(e.target.value)}
        onBlur={() => {
          const n = parseFloat(str.replace(/,/g, ""));
          if (Number.isNaN(n)) {
            setStr(String(value));
            return;
          }
          const clamped = min !== undefined ? Math.max(min, n) : n;
          onChange(clamped);
          setStr(String(clamped));
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

// ─────────────────────────────────────────────────────────────────────────────
// Formulae accordion
// ─────────────────────────────────────────────────────────────────────────────

function FormulaePanel() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, marginBottom: 16, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}
      >
        <span>📐 Calculator Formulae (for comparison with Liberty Life / any calculator)</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>🔢 Core simulation (what this calculator runs)</strong>
            <p style={{ margin: "0 0 4px" }}>Every month, balance compounds and the contribution is added:</p>
            <code style={{ display: "block", background: "var(--color-bg)", padding: "8px 10px", borderRadius: 8, fontSize: 12, marginBottom: 4 }}>
              balance = balance × (1 + r / 12) + PMT
            </code>
            <p style={{ margin: 0 }}>Where <strong>r</strong> = annual rate (e.g. 10% → 0.10), <strong>PMT</strong> = monthly contribution (increases by escalation% each year).</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>Closed-form equivalent (no escalation, lump sum only)</strong>
            <code style={{ display: "block", background: "var(--color-bg)", padding: "8px 10px", borderRadius: 8, fontSize: 12, marginBottom: 4 }}>
              FV = P × (1 + r/n)^(n×t)
            </code>
            <p style={{ margin: 0 }}>P = initial lump sum, n = 12 (monthly), t = years</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>Closed-form (monthly contributions, no escalation)</strong>
            <code style={{ display: "block", background: "var(--color-bg)", padding: "8px 10px", borderRadius: 8, fontSize: 12, marginBottom: 4 }}>
              FV = P × (1 + r/12)^(12t) + PMT × [(1 + r/12)^(12t) − 1] / (r/12)
            </code>
            <p style={{ margin: 0 }}>Add lump sum growth + annuity growth. When escalation = 0%, this matches the simulation exactly.</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>Annual escalation (growing annuity)</strong>
            <p style={{ margin: "0 0 4px" }}>Contribution after year y: <code>PMT × (1 + g)^y</code> where g = escalation rate (e.g. 5% → 0.05)</p>
            <p style={{ margin: "0 0 4px" }}>There's no simple closed-form when escalation is applied monthly. The simulation loop handles this correctly.</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>Total contributions & interest</strong>
            <code style={{ display: "block", background: "var(--color-bg)", padding: "8px 10px", borderRadius: 8, fontSize: 12, marginBottom: 4 }}>
              {`Total Contributions = initial lump sum + Σ(monthly payments made)`}{"\n"}
              {`Interest Earned = Final Value − Total Contributions`}{"\n"}
              {`Return % = (Interest / Contributions) × 100`}
            </code>
          </div>

          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 4 }}>Key assumptions</strong>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Rate is the gross annual return before fees/inflation</li>
              <li>Monthly contributions are paid at end of each month (ordinary annuity)</li>
              <li>Escalation applies once per year (at each year-end)</li>
              <li>"Once-off" mode: only lump sum compounds, no monthly additions</li>
              <li>"Annually" mode: 12 × monthly contribution added once per year (approximation)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CalculatorView
// ─────────────────────────────────────────────────────────────────────────────

type SolveMode = "goal" | "time" | "monthly" | "rate" | "initial";

export function CalculatorView() {
  const defaultInputs: CalcInputs = {
    principal: 50000,
    monthly: 1000,
    rate: 10,
    years: 10,
    escalation: 5,
    frequency: "monthly",
  };

  // Daily/weekly "used the calculator" flags. The localStorage key existed
  // before but was never written, so calculator quests could never complete;
  // the weekly counter is merged server-side so any device's usage counts.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`notho-calc-visited-${sastToday()}`, "1");
    } catch { /* best-effort */ }
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user) bumpWeeklyStats(user.id, { calculatorDayToday: true });
      })
      .catch(() => {});
  }, []);

  const [mode, setMode] = useState<"single" | "compare">("single");
  const [solveMode, setSolveMode] = useState<SolveMode>("goal");
  const [goalTarget, setGoalTarget] = useState("500000");
  const [solveResult, setSolveResult] = useState<{ label: string; value: string; sub?: string } | null>(null);
  const [inputsA, setInputsA] = useState<CalcInputs>(defaultInputs);
  const [inputsB, setInputsB] = useState<CalcInputs>({
    ...defaultInputs,
    rate: 7,
    monthly: 500,
    years: 20,
  });
  // How many years after "now" does Investor B start? (0 = starts same time as A)
  const [startYearB, setStartYearB] = useState(0);

  const [hasCalculated, setHasCalculated] = useState(false);
  const [calcA, setCalcA] = useState<CalcInputs>(defaultInputs);
  const [calcB, setCalcB] = useState<CalcInputs>({ ...defaultInputs, rate: 7, monthly: 500, years: 20 });
  const [calcStartYearB, setCalcStartYearB] = useState(0);
  const [projectionSaved, setProjectionSaved] = useState(false);

  // Load user's previously saved projection as default inputs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("notho-calc-saved");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<CalcInputs>;
        setInputsA((prev) => ({ ...prev, ...parsed }));
        setCalcA((prev) => ({ ...prev, ...parsed }));
      } catch { /* ignore */ }
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
        effectiveA = { ...inputsA, monthly };
        result = { label: "Monthly Savings Needed", value: formatZAR(monthly), sub: `per month to reach ${formatZAR(goal)} in ${inputsA.years} years` };
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
        effectiveA = { ...inputsA, principal };
        result = { label: "Lump Sum Needed Today", value: formatZAR(principal), sub: `to reach ${formatZAR(goal)} in ${inputsA.years} years` };
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
      setProjectionSaved(true);
    }
  };

  const dataA = useMemo(() => (hasCalculated ? calcGrowth(calcA) : []), [hasCalculated, calcA]);
  const dataB = useMemo(() => (hasCalculated ? calcGrowth(calcB) : []), [hasCalculated, calcB]);
  const finalA = hasCalculated && dataA.length > 0 ? dataA[dataA.length - 1] : { year: 0, value: 0, contributions: 0, interest: 0 };
  const finalB = hasCalculated && dataB.length > 0 ? dataB[dataB.length - 1] : { year: 0, value: 0, contributions: 0, interest: 0 };

  // Chart data: spans max(A end, B end) years. B starts at calcStartYearB.
  // Uses null for years where an investor hasn't started or has finished → line simply ends.
  const chartData = useMemo(() => {
    if (!hasCalculated) return [];
    if (mode === "single") {
      return dataA.map((d) => ({
        year: d.year,
        "Portfolio Value": d.value,
        "Total Contributions": d.contributions,
      }));
    }
    // Compare mode
    const totalYears = Math.max(calcA.years, calcStartYearB + calcB.years);
    const rows: Record<string, number | null>[] = [];
    for (let y = 0; y <= totalYears; y++) {
      // Investment A: data from year 0..calcA.years (null beyond)
      const aVal: number | null = y <= calcA.years ? (dataA[y]?.value ?? null) : null;
      // Investment B: starts at calcStartYearB, runs calcB.years more
      const bIdx = y - calcStartYearB;
      const bVal: number | null = bIdx >= 0 && bIdx <= calcB.years ? (dataB[bIdx]?.value ?? null) : null;
      rows.push({ year: y, "Investment A": aVal, "Investment B": bVal });
    }
    return rows;
  }, [hasCalculated, mode, dataA, dataB, calcA.years, calcB.years, calcStartYearB]);

  const ResultCard = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
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
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: highlight ? "white" : "var(--color-text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );

  const calcReturnPct = (value: number, contributions: number) => {
    if (contributions <= 0) return 0;
    return ((value - contributions) / contributions) * 100;
  };

  const InputPanel = ({
    label,
    inputs,
    setInputs,
    hideField,
    showStartYear,
    startYear,
    onStartYearChange,
  }: {
    label?: string;
    inputs: CalcInputs;
    setInputs: (i: CalcInputs) => void;
    hideField?: SolveMode;
    showStartYear?: boolean;
    startYear?: number;
    onStartYearChange?: (n: number) => void;
  }) => (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: 20,
        flex: 1,
      }}
    >
      {label && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </div>
      )}

      {showStartYear && onStartYearChange !== undefined && (
        <CalcNumberRow
          label="Starts how many years from now?"
          tooltip="Set to 0 if this investor starts today. Set to 10 if they wait 10 years before starting."
          value={startYear ?? 0}
          min={0}
          step="1"
          onChange={onStartYearChange}
        />
      )}

      {hideField !== "initial" && (
        <CalcNumberRow label="Initial Amount (R)" tooltip="The lump sum you're starting with today." value={inputs.principal} onChange={(v) => setInputs({ ...inputs, principal: v })} />
      )}
      {hideField !== "monthly" && (
        <CalcNumberRow label="Monthly Contribution (R)" tooltip="How much you add every month." value={inputs.monthly} onChange={(v) => setInputs({ ...inputs, monthly: v })} />
      )}
      {hideField !== "rate" && (
        <CalcNumberRow label="Annual Return Rate (%)" tooltip="The yearly growth rate (e.g. JSE average is ~10%)." value={inputs.rate} step="0.01" onChange={(v) => setInputs({ ...inputs, rate: v })} />
      )}
      <CalcNumberRow label="Annual Contribution Increase (%)" tooltip="How much you increase your monthly contribution each year (inflation hedge)." value={inputs.escalation} step="0.01" onChange={(v) => setInputs({ ...inputs, escalation: v })} />
      {hideField !== "time" && (
        <CalcNumberRow label="Investment Period (years)" tooltip="How many years you plan to invest for." value={inputs.years} step="1" min={1} onChange={(v) => setInputs({ ...inputs, years: v })} />
      )}

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
    { id: "goal",    label: "End Goal",        Icon: Target,       desc: "What will my investment be worth?" },
    { id: "time",    label: "Time Needed",     Icon: Clock,        desc: "How long to reach my goal?" },
    { id: "monthly", label: "Monthly Amount",  Icon: TrendingUp,   desc: "How much must I save monthly?" },
    { id: "rate",    label: "Return Rate",     Icon: BarChart2,    desc: "What return rate do I need?" },
    { id: "initial", label: "Starting Amount", Icon: Wallet,       desc: "How much must I invest today?" },
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

      {/* ── Formulae ── */}
      <FormulaePanel />

      {/* ── Solve For selector ── */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>What are you solving for?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {SOLVE_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => { setSolveMode(opt.id); setHasCalculated(false); setSolveResult(null); }}
              style={{ padding: "10px 8px", borderRadius: 10, border: `2px solid ${solveMode === opt.id ? "var(--color-primary)" : "var(--color-border)"}`, background: solveMode === opt.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", cursor: "pointer", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
                <opt.Icon size={18} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-primary)" }}>{opt.label}</div>
            </button>
          ))}
        </div>
        {solveMode !== "goal" && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              {SOLVE_OPTIONS.find(o => o.id === solveMode)?.desc} - Target Goal Amount (R)
            </div>
            <input
              type="number" inputMode="decimal" placeholder="e.g. 1000000"
              value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--color-primary)", fontSize: 16, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <InputPanel
          inputs={inputsA}
          setInputs={setInputsA}
          label={mode === "compare" && solveMode === "goal" ? "Investment A (starts now)" : undefined}
          hideField={solveMode !== "goal" ? solveMode : undefined}
        />
        {mode === "compare" && solveMode === "goal" && (
          <InputPanel
            inputs={inputsB}
            setInputs={setInputsB}
            label="Investment B"
            showStartYear
            startYear={startYearB}
            onStartYearChange={setStartYearB}
          />
        )}
      </div>

      {/* Results + chart section (clean) */}
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleCalculate}>
        <BarChart2 size={20} aria-hidden />
        Calculate
      </button>

      {!hasCalculated && (
        <div style={{ textAlign: "center", padding: "18px 0", color: "var(--color-text-secondary)" }}>
          {solveMode === "goal" ? "Set your values above, then tap Calculate" : "Set your inputs above and enter a target goal, then tap Calculate"}
        </div>
      )}

      {/* ── Solve Result (non-goal modes) ── */}
      {hasCalculated && solveResult && (
        <>
          <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #005F68 100%)", borderRadius: 16, padding: "20px 24px", marginBottom: 12, color: "white", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.8, marginBottom: 8 }}>{solveResult.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{solveResult.value}</div>
            {solveResult.sub && <div style={{ fontSize: 13, opacity: 0.85 }}>{solveResult.sub}</div>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <ShareResultButton
              data={{
                type: "calculator",
                headline: `${solveResult.value} - ${solveResult.label.toLowerCase()}`,
                sub: solveResult.sub ?? `Saving R${formatWithSpaces(inputsA.monthly)}/month at ${inputsA.rate}% p.a. - calculated on Notho`,
              }}
              label="Share this result"
            />
          </div>
        </>
      )}

      {hasCalculated && mode === "single" && solveMode === "goal" && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <ResultCard label="Final Value" value={formatZAR(finalA.value)} highlight />
            <ResultCard label="Total Contributions" value={formatZAR(finalA.contributions)} />
            <ResultCard label="Total Interest" value={formatZAR(finalA.interest)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <ShareResultButton
              data={{
                type: "calculator",
                headline: `My R${formatWithSpaces(inputsA.monthly)}/month investment could be worth ${formatZAR(finalA.value)} in ${inputsA.years} years`,
                sub: `At ${inputsA.rate}% p.a. · R${formatWithSpaces(finalA.interest)} in interest earned · Calculated on Notho`,
              }}
              label="Share this calculation"
            />
          </div>
        </>
      )}

      {hasCalculated && mode === "compare" && (
        <>
          <div
            style={{
              marginBottom: 16,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                    Metric
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>
                    Investment A
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--color-secondary)" }}>
                    Investment B
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Final Value", formatZAR(finalA.value), formatZAR(finalB.value)],
                  ["Contributions", formatZAR(finalA.contributions), formatZAR(finalB.contributions)],
                  ["Interest", formatZAR(finalA.interest), formatZAR(finalB.interest)],
                  ["Return %", `${calcReturnPct(finalA.value, finalA.contributions).toFixed(1)}%`, `${calcReturnPct(finalB.value, finalB.contributions).toFixed(1)}%`],
                  ["Term", `${calcA.years} yrs`, `${calcB.years} yrs${calcStartYearB > 0 ? ` (starts yr ${calcStartYearB})` : ""}`],
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

          {/* Difference callout */}
          {(() => {
            const diff = finalA.value - finalB.value;
            const winner = diff > 0 ? "A" : diff < 0 ? "B" : null;
            if (!winner) return null;
            return (
              <div style={{
                marginBottom: 16, padding: "14px 16px", borderRadius: 12,
                background: "rgba(0,122,133,0.08)", border: "1px solid rgba(0,122,133,0.2)",
                fontSize: 14, fontWeight: 600, color: "var(--color-primary)", textAlign: "center",
              }}>
                {calcStartYearB > 0
                  ? `Starting ${calcStartYearB} year${calcStartYearB > 1 ? "s" : ""} earlier is worth ${formatZAR(Math.abs(diff))} extra`
                  : `Investment ${winner} ends ${formatZAR(Math.abs(diff))} ahead`}
              </div>
            );
          })()}

          <div style={{ marginBottom: 20 }}>
            <ShareResultButton
              data={{
                type: "calculator",
                headline: calcStartYearB > 0
                  ? `Starting ${calcStartYearB} yrs earlier adds ${formatZAR(Math.abs(finalA.value - finalB.value))} to your wealth`
                  : `Investment A: ${formatZAR(finalA.value)} vs Investment B: ${formatZAR(finalB.value)}`,
                sub: `At ${calcA.rate}% vs ${calcB.rate}% p.a. · Calculated on Notho`,
              }}
              label="Share this comparison"
            />
          </div>
        </>
      )}

      {hasCalculated && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Growth Over Time</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} width={58} />
              <Tooltip
                formatter={(v) => v === null || v === undefined ? "-" : formatZAR(typeof v === "number" ? v : Number(v ?? 0))}
                labelFormatter={(l) => `Year ${l}`}
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {mode === "single" ? (
                <>
                  <Line type="monotone" dataKey="Portfolio Value" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="Total Contributions" stroke="#EFB343" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={false} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="Investment A" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="Investment B" stroke="#EFB343" strokeWidth={2.5} dot={false} connectNulls={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
          {mode === "compare" && calcStartYearB > 0 && (
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", marginTop: 8 }}>
              Investment B (orange) begins at Year {calcStartYearB} and ends at Year {calcStartYearB + calcB.years}
            </div>
          )}
        </div>
      )}

      {hasCalculated && !projectionSaved && (
        <button
          onClick={handlePinProjection}
          style={{
            width: "100%", marginBottom: 12, padding: "11px 16px", borderRadius: 12,
            border: "1.5px solid var(--color-primary)", background: "transparent",
            color: "var(--color-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <TrendingUp size={16} aria-hidden />
          Save this projection to my Profile
        </button>
      )}
      {projectionSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 size={16} className="shrink-0" aria-hidden />
          <span>Projection pinned to your Profile - tap Profile to view it.</span>
        </div>
      )}

      <div
        className="relative overflow-hidden bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-5 text-white mb-8"
        style={{ marginBottom: 32 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-green-100/90">Available</span>
        </div>
        <p className="text-green-100 text-sm leading-relaxed mb-4">
          See how your investments could grow with projections built around your numbers.
        </p>
        <button
          type="button"
          onClick={() => {
            analytics.advisorCtaClicked("calculator_cta");
            window.open("https://wealthwithkwanele.co.za", "_blank", "noopener,noreferrer");
          }}
          className="block w-full py-3 bg-white text-green-800 rounded-xl font-bold text-center text-sm hover:bg-green-50 transition-colors"
        >
          Get Your Free Investment Plan
        </button>
      </div>
    </main>
  );
}

export default CalculatorView;
