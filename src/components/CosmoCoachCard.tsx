"use client";

/**
 * Cosmo - Tier 1 (deterministic, no AI).
 *
 * Self-contained card: fetches the user's current + previous month budget
 * data, runs the pure rules engine (src/lib/coach/insights.ts), and shows
 * the top nudges with links to lessons.
 *
 * Compliance by design:
 *  - All figures are computed locally from the user's own data; nothing is
 *    sent to any AI or third party (POPIA).
 *  - Content is educational and never recommends financial products (FAIS).
 *    A disclaimer renders on every card.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { sastToday } from "@/lib/dates";
import { resolveMonthlyBudget, type BudgetTargetRow } from "@/lib/budget/budgetResolve";
import {
  computeCoachInsights,
  type CoachEntry,
  type CoachInsight,
} from "@/lib/coach/insights";
import { ChevronDown, Lightbulb } from "@/components/icons/NothoIcons";

const BUILT_IN_LABELS: Record<string, string> = {
  food: "Food & Groceries",
  transport: "Transport",
  housing: "Housing/Rent",
  debt: "Debt Repayments",
  savings: "Savings",
  entertainment: "Entertainment",
  airtime: "Airtime & Data",
  healthcare: "Healthcare",
  education: "Education",
  other: "Other",
};

const SEVERITY_STYLES: Record<CoachInsight["severity"], { border: string; bg: string; chip: string; chipText: string }> = {
  alert:  { border: "rgba(222,107,98,0.45)", bg: "rgba(222,107,98,0.06)", chip: "#DE6B62", chipText: "Over budget" },
  warn:   { border: "rgba(239,179,67,0.55)", bg: "rgba(239,179,67,0.07)", chip: "#B8860B", chipText: "Heads up" },
  info:   { border: "var(--color-border)",   bg: "transparent",           chip: "#3B7DD8", chipText: "Tip" },
  praise: { border: "rgba(0,122,133,0.45)",   bg: "rgba(0,122,133,0.06)",   chip: "#007A85", chipText: "Well done" },
};

function monthKeyOf(isoDay: string): string {
  return isoDay.slice(0, 7);
}

function prevMonthKeyOf(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysInMonthOf(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function CosmoCoachCard({
  maxInsights = 3,
  monthYear,
}: {
  maxInsights?: number;
  /** Month to analyse, "YYYY-MM". Defaults to the current SAST month. */
  monthYear?: string;
}) {
  const [insights, setInsights] = useState<CoachInsight[] | null>(null);
  // Remember the user's show/hide choice across sessions; default collapsed so
  // the budget page opens clean, with the count visible to invite a peek.
  const [collapsed, setCollapsed] = useState<boolean>(
    () => typeof window === "undefined" || window.localStorage.getItem("notho.cosmoCollapsed") !== "false"
  );
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("notho.cosmoCollapsed", String(collapsed));
    }
  }, [collapsed]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = sastToday(); // YYYY-MM-DD (SAST)
        const currentMonth = monthKeyOf(today);
        // Analyse the month the user is LOOKING AT, not blindly "now".
        const monthKey = monthYear ?? currentMonth;
        const prevMonthKey = prevMonthKeyOf(monthKey);
        const daysInMonth = daysInMonthOf(monthKey);
        // Past months are complete; the current month runs to today's date.
        const dayOfMonth =
          monthKey === currentMonth ? Number(today.slice(8, 10)) : daysInMonth;
        const rangeEnd =
          monthKey === currentMonth
            ? today
            : `${monthKey}-${String(daysInMonth).padStart(2, "0")}`;

        const [entriesRes, targetsRes, catsRes] = await Promise.all([
          supabase
            .from("budget_entries")
            .select("type, category, amount, entry_date, is_transfer")
            .eq("user_id", user.id)
            .gte("entry_date", `${prevMonthKey}-01`)
            .lte("entry_date", rangeEnd),
          supabase
            .from("budget_targets")
            .select("category, monthly_limit, month_year")
            .eq("user_id", user.id),
          supabase
            .from("custom_budget_categories")
            .select("id, name")
            .eq("user_id", user.id),
        ]);

        const entries = (entriesRes.data ?? []) as CoachEntry[];
        const targetRows = (targetsRes.data ?? []) as BudgetTargetRow[];

        const budgets: Record<string, number> = {};
        for (const c of new Set(targetRows.map((r) => r.category))) {
          const limit = resolveMonthlyBudget(targetRows, c, monthKey);
          if (limit > 0) budgets[c] = limit;
        }

        const categoryLabels: Record<string, string> = { ...BUILT_IN_LABELS };
        for (const c of (catsRes.data ?? []) as { id: string; name: string }[]) {
          categoryLabels[c.id] = c.name;
        }

        const result = computeCoachInsights({
          monthKey,
          prevMonthKey,
          entries,
          budgets,
          categoryLabels,
          dayOfMonth,
          daysInMonth,
        });

        if (!cancelled) setInsights(result.slice(0, maxInsights));
      } catch {
        if (!cancelled) setInsights([]);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [maxInsights, monthYear]);

  // The card (and its chat) is always available; the insights list simply
  // stays empty until the rules engine has something worth saying.
  const showInsights = !!insights && insights.length > 0;

  return (
    <section
      aria-label="Cosmo insights"
      style={{
        border: "1.5px solid var(--color-border)",
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 20,
        background: "var(--color-surface, transparent)",
      }}
    >
      {/* Header doubles as a collapse toggle so users who don't want coaching
          can tuck it away - the page stays uncluttered by default. */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          marginBottom: collapsed ? 0 : 12, color: "var(--color-text-primary)",
        }}
      >
        <Lightbulb size={18} style={{ color: "var(--color-accent, #EFB343)" }} />
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Cosmo</h3>
        {showInsights && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-accent, #EFB343)", background: "rgba(239,179,67,0.14)", borderRadius: 999, padding: "1px 8px" }}>
            {insights!.length}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: "auto" }}>
          {collapsed ? (showInsights ? "Show insights" : "Based on your own numbers") : "Hide"}
        </span>
        <ChevronDown
          size={18}
          style={{ color: "var(--color-text-secondary)", transform: collapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }}
        />
      </button>

      {!collapsed && (
      <>
      {!showInsights && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Nothing flagged on this month yet. Add entries or import a statement.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(insights ?? []).map((i) => {
          const s = SEVERITY_STYLES[i.severity];
          return (
            <div
              key={i.id}
              style={{
                border: `1.5px solid ${s.border}`,
                background: s.bg,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#fff", background: s.chip,
                  borderRadius: 8, padding: "2px 8px",
                }}>
                  {s.chipText}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{i.title}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "6px 0 0" }}>
                {i.body}
              </p>
              {i.lesson && (
                <Link
                  href={`/lesson/${i.lesson.courseId}/${i.lesson.lessonId}`}
                  style={{
                    display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 700,
                    color: "var(--color-primary)", textDecoration: "none",
                  }}
                >
                  Lesson: {i.lesson.title} →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "12px 0 0" }}>
        Educational information based on your budget data, not financial advice.
        Notho is not a registered financial services provider.
      </p>
      </>
      )}
    </section>
  );
}
