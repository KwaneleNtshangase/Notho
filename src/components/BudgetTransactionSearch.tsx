"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizedDate } from "@/i18n/date";
import { supabase } from "@/lib/supabaseClient";
import { formatRand } from "@/lib/viewHelpers";
import { Search, ArrowLeftRight, TrendingUp } from "@/components/icons/NothoIcons";
import {
  budgetEntrySearchOrs,
  entryMatchesQuery,
  TXN_SEARCH_LIMIT,
  TXN_SEARCH_MIN,
} from "@/lib/budget/transactionSearch";

type SearchRow = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string | null;
  entry_date: string;
  is_transfer?: boolean;
  account_label?: string | null;
};

const EXPENSE_LABELS: Record<string, string> = {
  food: "Food & Groceries",
  transport: "Transport",
  housing: "Housing/Rent",
  debt: "Debt Repayments",
  savings: "Savings",
  entertainment: "Entertainment",
  airtime: "Airtime & Data",
  healthcare: "Healthcare",
  education: "Education",
  shopping: "Shopping",
  travel: "Travel",
  transfers: "Transfers",
  business: "Business",
  other: "Other",
};

const INCOME_LABELS: Record<string, string> = {
  salary: "Salary / Wages",
  freelance: "Freelance",
  business: "Business Income",
  transfers: "Transfers",
  "other-income": "Other Income",
};

function categoryLabel(row: SearchRow, custom: Record<string, string>): string {
  if (row.is_transfer) return "Transfer";
  return custom[row.category]
    ?? (row.type === "income" ? INCOME_LABELS[row.category] : EXPENSE_LABELS[row.category])
    ?? row.category;
}

export function BudgetTransactionSearch() {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [truncated, setTruncated] = useState(false);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("custom_budget_categories")
        .select("id, name")
        .eq("user_id", user.id);
      if (cancelled || !data) return;
      const map: Record<string, string> = {};
      for (const row of data) map[row.id] = row.name;
      setCustomLabels(map);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < TXN_SEARCH_MIN) {
      setRows([]);
      setTruncated(false);
      setStatus("idle");
      return;
    }
    const ors = budgetEntrySearchOrs(q);
    if (!ors) {
      setRows([]);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    const timer = window.setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const selectCols = "id, type, category, amount, description, entry_date, is_transfer, account_label";
      let request = supabase.from("budget_entries").select(selectCols).eq("user_id", user.id);
      for (const clause of ors) request = request.or(clause);
      const { data, error } = await request
        .order("entry_date", { ascending: false })
        .limit(TXN_SEARCH_LIMIT + 1);
      if (cancelled) return;
      if (error) {
        setStatus("error");
        setRows([]);
        return;
      }
      const qLower = q.toLowerCase();
      const labelIds = Object.entries({ ...EXPENSE_LABELS, ...INCOME_LABELS, ...customLabels })
        .filter(([, label]) => label.toLowerCase().includes(qLower))
        .map(([id]) => id);
      let matched = ((data ?? []) as SearchRow[]).filter((row) => entryMatchesQuery(
        row,
        q,
        categoryLabel(row, customLabels),
      ));
      if (labelIds.length > 0) {
        const labelled = await supabase
          .from("budget_entries")
          .select(selectCols)
          .eq("user_id", user.id)
          .in("category", labelIds)
          .order("entry_date", { ascending: false })
          .limit(TXN_SEARCH_LIMIT + 1);
        if (!labelled.error && labelled.data) {
          const seen = new Set(matched.map((row) => row.id));
          for (const row of labelled.data as SearchRow[]) {
            if (!seen.has(row.id) && entryMatchesQuery(row, q, categoryLabel(row, customLabels))) {
              matched.push(row);
            }
          }
        }
      }
      matched.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
      if (cancelled) return;
      setTruncated(matched.length > TXN_SEARCH_LIMIT);
      setRows(matched.slice(0, TXN_SEARCH_LIMIT));
      setStatus("ready");
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, customLabels]);

  const real = rows.filter((row) => !row.is_transfer);
  const moneyIn = real.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
  const moneyOut = real.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);
  const groups: { label: string; rows: SearchRow[] }[] = [];
  for (const row of rows) {
    const label = localizedDate(new Date(row.entry_date + "T00:00:00"), locale, { month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(row);
    else groups.push({ label, rows: [row] });
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "16px 0 0" }}>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <I18nElement as="input"
          id="budget-txn-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions"
          autoComplete="off"
          aria-label="Search transactions"
          style={{
            width: "100%",
            padding: "12px 40px 12px 16px",
            borderRadius: 12,
            border: "1.5px solid var(--color-border)",
            fontSize: 14,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            boxSizing: "border-box",
          }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)", display: "flex", pointerEvents: "none" }}>
          <Search size={18} aria-hidden />
        </span>
      </div>
      {query.trim().length >= TXN_SEARCH_MIN && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}><I18nText source={"Results across your whole budget"} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", flexShrink: 0 }}>
              <I18nText>{status === "loading" ? "Searching\u2026" : `${rows.length}${truncated ? "+" : ""}`}</I18nText>
            </div>
          </div>
          {status === "error" && (
            <div style={{ padding: 16, fontSize: 13, color: "#E03C31" }}><I18nText source={"Could not search transactions. Try again."} /></div>
          )}
          {status === "ready" && rows.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: "var(--color-text-secondary)" }}><I18nText source={"No transactions match “{value0}”."} values={[query.trim()]} /></div>
          )}
          {rows.length > 0 && (
            <>
              <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span><I18nText source={"In "} /><strong style={{ color: "#007A85" }}><I18nText>{formatRand(moneyIn)}</I18nText></strong></span>
                <span><I18nText source={"Out "} /><strong style={{ color: "var(--color-text-primary)" }}><I18nText>{formatRand(moneyOut)}</I18nText></strong></span>
                <span><I18nText source={"All months"} /></span>
              </div>
              {groups.map((group) => (
                <div key={group.label}>
                  <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase", color: "var(--color-text-secondary)", background: "var(--color-bg)" }}><I18nText>{group.label}</I18nText></div>
                  {group.rows.map((row) => (
                    <div key={row.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, borderBottom: "1px solid var(--color-border)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: row.is_transfer ? "rgba(120,130,150,0.15)" : row.type === "income" ? "rgba(0,122,133,0.12)" : "rgba(0,122,133,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {row.is_transfer ? <ArrowLeftRight size={15} style={{ color: "var(--color-text-secondary)" }} /> : row.type === "income" ? <TrendingUp size={16} style={{ color: "#007A85" }} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#007A85" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>{customLabels[row.category] && !row.is_transfer ? customLabels[row.category] : <I18nText>{categoryLabel(row, customLabels)}</I18nText>}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <I18nText>{localizedDate(new Date(row.entry_date + "T00:00:00"), locale, { day: "numeric", month: "short", year: "numeric" })}</I18nText>
                          {row.description ? ` \u00b7 ${row.description}` : ""}
                        </div>
                        {row.account_label && (
                          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.account_label}</div>
                        )}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: row.is_transfer ? "var(--color-text-secondary)" : row.type === "income" ? "#007A85" : "var(--color-text-primary)", flexShrink: 0 }}>
                        <I18nText>{row.is_transfer ? "\u21c4 " : row.type === "income" ? "+" : "-"}</I18nText><I18nText>{formatRand(row.amount)}</I18nText>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {truncated && (
                <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--color-text-secondary)" }}><I18nText source={"Showing the first {value0} matches. Add another word to narrow it."} values={[TXN_SEARCH_LIMIT]} preserveValues={[true]} /></div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
