"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { useUserSettings } from "@/hooks/useUserSettings";
import { BarChart2, CheckCircle2, Clock, Target, TrendingUp, Wallet } from "@/components/icons/NothoIcons";
import { formatWithSpaces, formatRand, formatZAR } from "@/lib/formatters";
import { ShareResultButton } from "@/components/ShareCard";
import {
  type CalcInputs,
  assumptionLine,
  calcGrowth,
  formatDuration,
  projectGrowth,
  solveForYears,
  solveForMonths,
  solveForMonthly,
  solveForRate,
  solveForInitial,
} from "@/lib/calculators";
import { CalcNumberRow, InputPanel, type SolveMode } from "@/components/calculator/fields";
import { BudgetAsk, CompareTable, GrowthChart, ResultCard } from "@/components/calculator/results";

export type { CalcInputs };
export { calcGrowth };

const defaultInputs: CalcInputs = {
  principal: 50000,
  monthly: 1000,
  rate: 10,
  years: 10,
  escalation: 5,
  frequency: "monthly",
  fee: 0,
  inflation: 0,
  withdrawal: 0,
  withdrawFromYear: 10,
  wrapper: "none",
  annualIncome: 0,
  tfsaUsedLifetime: 0,
};

export function CalculatorView() {
  const [calcViewUserId, setCalcViewUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCalcViewUserId(data.user?.id ?? null)).catch(() => {});
  }, []);
  const calcViewSettings = useUserSettings(calcViewUserId);
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
  const [showMore, setShowMore] = useState(false);
  const [budgetAsk, setBudgetAsk] = useState<"hidden" | "offer" | "dismissed">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const remoteCalc = calcViewSettings.settings.calcSaved as Partial<CalcInputs> | null;
    const localRaw = localStorage.getItem("notho-calc-saved");
    let saved: Partial<CalcInputs> | null = remoteCalc;
    if (!saved && localRaw) {
      try {
        saved = JSON.parse(localRaw) as Partial<CalcInputs>;
      } catch {
        saved = null;
      }
    }
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
        const months = solveForMonths(inputsA, goal);
        if (!isFinite(yrs)) result = { label: "Time Needed", value: "Not achievable", sub: "Try a higher monthly amount or return rate" };
        else {
          effectiveA = { ...inputsA, years: Math.max(yrs, Math.ceil((Number.isFinite(months) ? months : yrs * 12) / 12)) };
          result = { label: "Time Needed", value: formatDuration(months), sub: `to reach ${formatZAR(goal)}` };
        }
      } else if (solveMode === "monthly") {
        const monthly = solveForMonthly(inputsA, goal);
        if (!isFinite(monthly)) result = { label: "Monthly Savings Needed", value: "Not achievable", sub: "Try a longer period or lower goal" };
        else {
          effectiveA = { ...inputsA, monthly };
          result = { label: "Monthly Savings Needed", value: formatZAR(monthly), sub: `per month to reach ${formatZAR(goal)} in ${inputsA.years} years` };
        }
      } else if (solveMode === "rate") {
        const rate = solveForRate(inputsA, goal);
        if (!isFinite(rate)) result = { label: "Return Rate Needed", value: "Not achievable", sub: "Try a higher contribution or longer period" };
        else {
          effectiveA = { ...inputsA, rate };
          result = { label: "Annual Return Rate Needed", value: `${rate.toFixed(2)}% p.a.`, sub: `to reach ${formatZAR(goal)} in ${inputsA.years} years` };
        }
      } else if (solveMode === "initial") {
        const principal = solveForInitial(inputsA, goal);
        if (!isFinite(principal)) result = { label: "Lump Sum Needed Today", value: "Not achievable", sub: "Try a longer period or higher monthly amount" };
        else {
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
    setBudgetAsk("offer");
    analytics.calculatorSolveModeUsed(solveMode, { monthly: inputsA.monthly, rate: inputsA.rate, years: inputsA.years, principal: inputsA.principal });
  };

  const projectionA = useMemo(() => (hasCalculated ? projectGrowth(calcA) : null), [hasCalculated, calcA]);
  const dataA = projectionA?.points ?? [];
  const dataB = useMemo(() => (hasCalculated ? calcGrowth(calcB) : []), [hasCalculated, calcB]);
  const empty = { year: 0, value: 0, contributions: 0, interest: 0, withdrawals: 0, realValue: 0 };
  const finalA = dataA[dataA.length - 1] ?? empty;
  const finalB = dataB[dataB.length - 1] ?? empty;
  const showReal = (calcA.inflation ?? 0) > 0;
  const showWithdrawals = (calcA.withdrawal ?? 0) > 0 && (calcA.withdrawFromYear ?? calcA.years) < calcA.years;

  const chartData = useMemo(() => {
    if (!hasCalculated) return [];
    if (mode === "single") {
      return dataA.map((d) => ({
        year: d.year,
        "Portfolio Value": d.value,
        "Total Contributions": d.contributions,
        ...(showReal ? { "Today's rands": d.realValue } : {}),
      }));
    }
    const maxYear = Math.max(dataA.at(-1)?.year ?? 0, calcStartYearB + (dataB.at(-1)?.year ?? 0));
    const rows: Record<string, number | null>[] = [];
    for (let y = 0; y <= maxYear; y++) {
      const bIdx = y - calcStartYearB;
      rows.push({ year: y, "Investment A": y < dataA.length ? dataA[y].value : null, "Investment B": bIdx >= 0 && bIdx < dataB.length ? dataB[bIdx].value : null });
    }
    return rows;
  }, [hasCalculated, mode, dataA, dataB, calcStartYearB, showReal]);

  const SOLVE_OPTIONS: { id: SolveMode; label: string; Icon: React.ComponentType<{ size?: number }>; desc: string }[] = [
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
            <button
              key={opt.id}
              onClick={() => { setSolveMode(opt.id); setHasCalculated(false); setSolveResult(null); setBudgetAsk("hidden"); }}
              style={{ padding: "10px 8px", borderRadius: 10, border: `2px solid ${solveMode === opt.id ? "var(--color-primary)" : "var(--color-border)"}`, background: solveMode === opt.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", cursor: "pointer", textAlign: "center" }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-secondary)" }}><opt.Icon size={18} /></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: solveMode === opt.id ? "var(--color-primary)" : "var(--color-text-primary)" }}>{opt.label}</div>
            </button>
          ))}
        </div>
        {solveMode !== "goal" && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>{SOLVE_OPTIONS.find((o) => o.id === solveMode)?.desc} - Target Goal Amount (R)</div>
            <input type="number" inputMode="decimal" placeholder="e.g. 1000000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--color-primary)", fontSize: 16, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <InputPanel inputs={inputsA} setInputs={setInputsA} label={mode === "compare" && solveMode === "goal" ? "Investment A" : undefined} hideField={solveMode !== "goal" ? solveMode : undefined} allowMore showMore={showMore} setShowMore={setShowMore} />
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
      {!hasCalculated && <div style={{ textAlign: "center", padding: "18px 0", color: "var(--color-text-secondary)" }}>{solveMode === "goal" ? "Set your values above, then tap Calculate" : "Set your inputs above and enter a target goal, then tap Calculate"}</div>}
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
            {showWithdrawals && <ResultCard label="Withdrawn" value={formatRand(finalA.withdrawals)} />}
            {showReal && <ResultCard label="In today's rands" value={formatRand(finalA.realValue)} />}
          </div>
          {projectionA?.depletedYear != null && (
            <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(224,60,49,0.08)", color: "#E03C31", fontWeight: 700, fontSize: 14 }}>
              This withdrawal empties the pot in year {projectionA.depletedYear}.
            </div>
          )}
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{assumptionLine(calcA)}</div>
          {projectionA?.notes.filter((n) => !n.startsWith("The pot reaches")).map((n) => (
            <div key={n} style={{ marginBottom: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>{n}</div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <ShareResultButton data={{ type: "calculator", headline: `My R${formatWithSpaces(inputsA.monthly)}/month investment could be worth ${formatRand(finalA.value)} in ${inputsA.years} years`, sub: `At ${inputsA.rate}% p.a. · R${formatWithSpaces(finalA.interest)} in interest earned · Calculated on Notho` }} label="Share this calculation" />
          </div>
        </>
      )}
      {hasCalculated && mode === "compare" && (
        <>
          <CompareTable finalA={finalA} finalB={finalB} yearsA={calcA.years} yearsB={calcB.years} startB={calcStartYearB} />
          <div style={{ marginBottom: 16 }}>
            <ShareResultButton data={{ type: "calculator", headline: `Investment A: ${formatZAR(finalA.value)} vs Investment B: ${formatZAR(finalB.value)}`, sub: `A: R${formatWithSpaces(calcA.monthly)}/mo at ${calcA.rate}% over ${calcA.years} yrs · B: R${formatWithSpaces(calcB.monthly)}/mo at ${calcB.rate}%${calcStartYearB > 0 ? ` (starts yr ${calcStartYearB})` : ""} · Calculated on Notho` }} label="Share this comparison" />
          </div>
        </>
      )}
      {hasCalculated && <GrowthChart chartData={chartData} mode={mode} showReal={showReal} />}
      {hasCalculated && budgetAsk === "offer" && <BudgetAsk onDismiss={() => setBudgetAsk("dismissed")} />}
      {hasCalculated && !projectionSaved && (
        <button
          onClick={() => {
            localStorage.setItem("notho-calc-saved", JSON.stringify(inputsA));
            void calcViewSettings.setCalcSaved(inputsA as Record<string, unknown>);
            setProjectionSaved(true);
          }}
          style={{ width: "100%", marginBottom: 12, padding: "11px 16px", borderRadius: 12, border: "1.5px solid var(--color-primary)", background: "transparent", color: "var(--color-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
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
        <button type="button" onClick={() => { analytics.advisorCtaClicked("calculator_cta"); window.open("https://wealthwithkwanele.co.za", "_blank", "noopener,noreferrer"); }} className="block w-full py-3 bg-white text-green-800 rounded-xl font-bold text-center text-sm hover:bg-green-50 transition-colors">
          Get Your Free Investment Plan
        </button>
      </div>
    </main>
  );
}
