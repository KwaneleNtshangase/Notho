"use client";

import React, { useEffect, useState } from "react";
import { Info } from "@/components/icons/NothoIcons";
import { type AccountWrapper, type CalcInputs } from "@/lib/calculators";

export type SolveMode = "goal" | "time" | "monthly" | "rate" | "initial";

export const WRAPPERS: { id: AccountWrapper; label: string }[] = [
  { id: "none", label: "Any account" },
  { id: "tfsa", label: "TFSA" },
  { id: "ra", label: "RA" },
  { id: "living-annuity", label: "Living annuity" },
];

export function FieldTip({ text }: { text: string }) {
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

export function CalcNumberRow({
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

export function InputPanel({
  label,
  inputs,
  setInputs,
  hideField,
  allowMore,
  showMore,
  setShowMore,
}: {
  label?: string;
  inputs: CalcInputs;
  setInputs: (i: CalcInputs) => void;
  hideField?: SolveMode;
  allowMore?: boolean;
  showMore?: boolean;
  setShowMore?: (v: boolean | ((s: boolean) => boolean)) => void;
}) {
  const living = inputs.wrapper === "living-annuity";
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, flex: 1 }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Account type</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {WRAPPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                const next: CalcInputs = { ...inputs, wrapper: w.id };
                if (w.id === "living-annuity") {
                  next.monthly = 0;
                  next.frequency = "once-off";
                  next.withdrawFromYear = 0;
                  next.withdrawalMode = "percent";
                  if (!(next.withdrawalPercent ?? 0) && !(next.withdrawal ?? 0)) next.withdrawalPercent = 5;
                }
                setInputs(next);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: "2px solid",
                borderColor: (inputs.wrapper ?? "none") === w.id ? "var(--color-primary)" : "var(--color-border)",
                background: (inputs.wrapper ?? "none") === w.id ? "var(--color-primary-light)" : "transparent",
                color: (inputs.wrapper ?? "none") === w.id ? "var(--color-primary)" : "var(--color-text-secondary)",
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      {hideField !== "initial" && (
        <CalcNumberRow
          label="Initial Amount (R)"
          tooltip="The lump sum this plan starts with today. Typed in — we never pull a live balance."
          value={inputs.principal}
          onChange={(v) => setInputs({ ...inputs, principal: Math.max(0, v) })}
        />
      )}
      {hideField !== "monthly" && !living && (
        <CalcNumberRow
          label="Monthly Contribution (R)"
          tooltip="How much is added every month."
          value={inputs.monthly}
          onChange={(v) => setInputs({ ...inputs, monthly: Math.max(0, v) })}
        />
      )}
      {hideField !== "rate" && (
        <div>
          <CalcNumberRow
            label="Annual Return Rate (%)"
            tooltip="Nominal yearly growth before fees. JSE long-run average is often illustrated around 10%."
            value={inputs.rate}
            step="0.01"
            onChange={(v) => setInputs({ ...inputs, rate: v })}
          />
          <div style={{ display: "flex", gap: 6, marginTop: -12, marginBottom: 16 }}>
            {[8, 10, 12].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setInputs({ ...inputs, rate: r })}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  background: inputs.rate === r ? "var(--color-primary-light)" : "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      )}
      {!living && (
        <CalcNumberRow
          label="Annual Contribution Increase (%)"
          tooltip="How much the monthly contribution rises each year."
          value={inputs.escalation}
          step="0.01"
          onChange={(v) => setInputs({ ...inputs, escalation: v })}
        />
      )}
      {hideField !== "time" && (
        <CalcNumberRow
          label="Investment Period (years)"
          tooltip="How many years the chart runs for."
          value={inputs.years}
          step="1"
          onChange={(v) =>
            setInputs({
              ...inputs,
              years: Math.max(0, Math.floor(v)),
              withdrawFromYear: inputs.withdrawal ? inputs.withdrawFromYear : Math.max(0, Math.floor(v)),
            })
          }
        />
      )}
      {inputs.wrapper === "ra" && (
        <CalcNumberRow
          label="Annual income (R, optional)"
          tooltip="Used only to size the RA 27.5% / R430 000 cap. Leave 0 to apply the rand cap alone."
          value={inputs.annualIncome ?? 0}
          onChange={(v) => setInputs({ ...inputs, annualIncome: Math.max(0, v) })}
        />
      )}
      {!living && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Investment Frequency</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["monthly", "annually", "once-off"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setInputs({ ...inputs, frequency: f })}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: inputs.frequency === f ? "var(--color-primary)" : "var(--color-border)",
                  background: inputs.frequency === f ? "var(--color-primary-light)" : "white",
                  color: inputs.frequency === f ? "var(--color-primary)" : "var(--color-text-secondary)",
                }}
              >
                {f === "once-off" ? "Once-off" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      {allowMore && setShowMore && (
        <>
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: showMore ? 16 : 0 }}
          >
            {showMore ? "Hide fees, inflation and withdrawals" : "Fees, inflation and withdrawals"}
          </button>
          {showMore && (
            <div>
              <CalcNumberRow
                label="Annual fee / EAC (%)"
                tooltip="Taken off the pot each month. 0 keeps the current no-fee path."
                value={inputs.fee ?? 0}
                step="0.01"
                onChange={(v) => setInputs({ ...inputs, fee: Math.max(0, v) })}
              />
              <CalcNumberRow
                label="Inflation (%)"
                tooltip="Does not change the rand total. Adds a today's-rands line on the chart."
                value={inputs.inflation ?? 0}
                step="0.01"
                onChange={(v) => setInputs({ ...inputs, inflation: Math.max(0, v) })}
              />
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Withdrawal</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["rand", "percent"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setInputs({ ...inputs, withdrawalMode: mode })}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: "1px solid var(--color-border)",
                          background: (inputs.withdrawalMode ?? "rand") === mode ? "var(--color-primary-light)" : "transparent",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {mode === "rand" ? "R / month" : "% of pot / year"}
                      </button>
                    ))}
                  </div>
                </div>
                {(inputs.withdrawalMode ?? "rand") === "percent" ? (
                  <>
                    <CalcNumberRow
                      label="Annual withdrawal (% of pot)"
                      tooltip="Percent of the pot at the start of each year, taken monthly. Living annuities must stay between 2.5% and 17.5%."
                      value={inputs.withdrawalPercent ?? 0}
                      step="0.1"
                      onChange={(v) =>
                        setInputs({
                          ...inputs,
                          withdrawalMode: "percent",
                          withdrawalPercent: Math.max(0, v),
                          withdrawFromYear: v > 0 ? (inputs.withdrawFromYear ?? 0) : inputs.years,
                        })
                      }
                    />
                    {(inputs.withdrawalPercent ?? 0) > 0 && (
                      <div style={{ marginTop: -12, marginBottom: 16, fontSize: 12, color: "var(--color-text-secondary)" }}>
                        Year 1 ≈ R{Math.round(((inputs.principal || 0) * (inputs.withdrawalPercent || 0)) / 100 / 12).toLocaleString("en-ZA")} / month
                      </div>
                    )}
                  </>
                ) : (
                  <CalcNumberRow
                    label="Monthly withdrawal (R)"
                    tooltip="Fixed rand amount taken at the end of each month once withdrawals start. Switch to % to draw a share of the pot."
                    value={inputs.withdrawal ?? 0}
                    onChange={(v) =>
                      setInputs({
                        ...inputs,
                        withdrawalMode: "rand",
                        withdrawal: Math.max(0, v),
                        withdrawFromYear: v > 0 ? (inputs.withdrawFromYear ?? 0) : inputs.years,
                      })
                    }
                  />
                )}
              </div>
              {(((inputs.withdrawalMode ?? "rand") === "percent" ? (inputs.withdrawalPercent ?? 0) : (inputs.withdrawal ?? 0)) > 0) && (
                <CalcNumberRow
                  label="Start withdrawals in year"
                  tooltip="0 = from today. Set this below the period to see the pot drawn down on the chart."
                  value={inputs.withdrawFromYear ?? 0}
                  step="1"
                  onChange={(v) => setInputs({ ...inputs, withdrawFromYear: Math.max(0, Math.floor(v)) })}
                />
              )}
              {inputs.wrapper === "tfsa" && (
                <CalcNumberRow
                  label="TFSA lifetime already used (R)"
                  tooltip="Contributions already made across every TFSA. Growth does not count."
                  value={inputs.tfsaUsedLifetime ?? 0}
                  onChange={(v) => setInputs({ ...inputs, tfsaUsedLifetime: Math.max(0, v) })}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
