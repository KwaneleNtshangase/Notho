"use client";

/**
 * CHURN - why the ones who left, left, in their own words.
 *
 * The panel is built around one rule: never show a reason count without the
 * skip rate next to it. If most people skipped the question, the rest are not a
 * sample of your churn - they are a sample of the people willing to fill in a
 * form on their way out, which is a different and much more opinionated group.
 * Reading the first number without the second is how teams confidently fix the
 * wrong thing.
 */

import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ago, downloadCsv, fmt, type ChurnRow, type VerbatimRow } from "./lib";
import { usePalette } from "./theme";
import {
  Btn,
  DataTable,
  Gate,
  Note,
  Panel,
  Stat,
  StatGrid,
  Tag,
  useView,
  type Column,
} from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter, valueFormatter } from "./charts";

const EXIT_LABELS: Record<string, string> = {
  account_deletion: "Deleted account",
  email_unsubscribe: "Unsubscribed",
  inactive_survey: "Went quiet",
};

const REASON_LABELS: Record<string, string> = {
  too_many_emails: "Too many emails",
  not_useful: "Content not useful",
  too_hard: "Too hard / confusing",
  too_easy: "Already knew it",
  no_time: "No time",
  technical: "Bugs or slowness",
  privacy: "Data privacy worry",
  found_alternative: "Using something else",
  other: "Something else",
  skipped: "Declined to say",
};

export function ChurnPanel({ days, nonce }: { days: number; nonce: number }) {
  const p = usePalette();
  const c = useView<ChurnRow[]>("churn", { days }, nonce);
  const v = useView<VerbatimRow[]>("churnVerbatims", { days, limit: 100 }, nonce);
  const [showWords, setShowWords] = useState(false);

  const rows = useMemo(() => c.data ?? [], [c.data]);

  const totals = useMemo(() => {
    // `responses` and `left` are counted separately on purpose. Someone who gave
    // a reason and then took the save offer is a response but not a departure,
    // and folding them together would both overstate churn and hide the only
    // evidence that the offers do anything.
    const t = { responses: 0, left: 0, skipped: 0, offered: 0, taken: 0 };
    for (const r of rows) {
      t.responses += r.n;
      t.left += r.n_left;
      if (r.reason === "skipped") t.skipped += r.n;
      t.offered += r.n_offer_shown;
      t.taken += r.n_offer_taken;
    }
    return t;
  }, [rows]);

  /** Reasons rolled up across doors - the view most decisions actually need. */
  const byReason = useMemo(() => {
    const m = new Map<string, { reason: string; n: number; tenure: number[]; taken: number; offered: number }>();
    for (const r of rows) {
      const e = m.get(r.reason) ?? { reason: r.reason, n: 0, tenure: [], taken: 0, offered: 0 };
      e.n += r.n;
      e.taken += r.n_offer_taken;
      e.offered += r.n_offer_shown;
      if (r.avg_days_tenure != null) e.tenure.push(r.avg_days_tenure);
      m.set(r.reason, e);
    }
    return [...m.values()]
      .map((e) => ({
        ...e,
        avgTenure: e.tenure.length ? e.tenure.reduce((a, b) => a + b, 0) / e.tenure.length : null,
      }))
      .sort((a, b) => b.n - a.n);
  }, [rows]);

  const answered = totals.responses - totals.skipped;
  const answerRate = totals.responses > 0 ? Math.round((answered / totals.responses) * 100) : 0;
  const saveRate = totals.offered > 0 ? Math.round((totals.taken / totals.offered) * 100) : 0;

  const columns: Column<ChurnRow>[] = [
    { key: "door", label: "Exit", width: "20%", render: (r) => EXIT_LABELS[r.exit_type] ?? r.exit_type },
    {
      key: "reason",
      label: "Reason",
      render: (r) =>
        r.reason === "skipped" ? (
          <Tag tone="neutral">{REASON_LABELS.skipped}</Tag>
        ) : (
          REASON_LABELS[r.reason] ?? r.reason
        ),
    },
    { key: "n", label: "Said this", numeric: true, render: (r) => fmt(r.n) },
    {
      key: "left",
      label: "Left anyway",
      numeric: true,
      render: (r) => (r.n_left < r.n ? <Tag tone="good">{fmt(r.n_left)}</Tag> : fmt(r.n_left)),
    },
    {
      key: "tenure",
      label: "Avg days signed up",
      numeric: true,
      render: (r) => (r.avg_days_tenure == null ? "—" : fmt(r.avg_days_tenure)),
    },
    {
      key: "lessons",
      label: "Avg lessons done",
      numeric: true,
      render: (r) => (r.avg_lessons == null ? "—" : fmt(r.avg_lessons)),
    },
    {
      key: "saved",
      label: "Offer taken",
      numeric: true,
      render: (r) =>
        r.n_offer_shown === 0 ? (
          "—"
        ) : (
          <Tag tone={r.n_offer_taken > 0 ? "good" : "neutral"}>
            {r.n_offer_taken} / {r.n_offer_shown}
          </Tag>
        ),
    },
  ];

  return (
    <div className="nv-stack">
      <StatGrid>
        <Stat
          label="Actually left"
          value={fmt(totals.left)}
          accent={p.red}
          invertTrend
          hint="Completed the exit. Excludes anyone who opened the dialog and backed out, and anyone the save offer kept."
        />
        <Stat
          label="Gave a reason"
          value={fmt(answered)}
          accent={p.teal}
          hint={`${answerRate}% of ${fmt(totals.responses)} responses named a reason rather than skipping.`}
        />
        <Stat
          label="Declined to say"
          value={fmt(totals.skipped)}
          accent={p.muted}
          hint="Skipping is always one click, by design. A high number here is a finding, not a bug."
        />
        <Stat
          label="Save offers shown"
          value={fmt(totals.offered)}
          accent={p.gold}
          hint="Alternatives matched to the reason given - a weekly email instead of none, for example."
        />
        <Stat
          label="Offers accepted"
          value={fmt(totals.taken)}
          accent={saveRate > 0 ? p.green : p.muted}
          hint={`${saveRate}% take-up. This is the number that decides whether the offers are worth keeping.`}
        />
      </StatGrid>

      <Panel
        title="Why people leave"
        subtitle="Every reason given at every exit, rolled up. Read the bars against the skip count above: if most people skipped, this chart describes the ones who talked, not the ones who left."
        action={rows.length > 0 && <Btn onClick={() => downloadCsv("churn-reasons", rows)}>Export CSV</Btn>}
      >
        <Gate
          loading={c.loading && !c.data}
          error={c.error}
          empty={byReason.length === 0}
          emptyTitle="Nobody has left through the survey yet"
          emptyDetail="Reasons appear here once someone deletes their account, unsubscribes, or answers the win-back email."
          skeleton={240}
        >
          <Frame height={Math.max(200, byReason.length * 40)}>
            <BarChart data={byReason} layout="vertical" margin={{ top: 6, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} horizontal={false} />
              <XAxis type="number" tick={axis(p)} allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="reason"
                width={150}
                tick={{ ...axis(p), fontSize: 11.5 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(r: string) => REASON_LABELS[r] ?? r}
              />
              <ThemedTooltip
                formatter={valueFormatter((n) => `${fmt(n)} people`, "Count")}
                labelFormatter={labelFormatter((r) => REASON_LABELS[r] ?? r)}
              />
              <Bar dataKey="n" radius={[0, 5, 5, 0]} maxBarSize={26}>
                {byReason.map((r) => (
                  // Skips are greyed: they are context for the other bars, not a
                  // reason competing with them.
                  <Cell key={r.reason} fill={r.reason === "skipped" ? p.muted : p.red} />
                ))}
              </Bar>
            </BarChart>
          </Frame>
          <div style={{ marginTop: 16 }}>
            <DataTable columns={columns} rows={rows} emptyLabel="No exits recorded in this window." />
          </div>
        </Gate>
      </Panel>

      <Panel
        title="What they actually wrote"
        subtitle="Free-text comments, newest first. Hidden until you ask for them - these are people's own words, and there is no reason for them to be on screen by default."
        action={<Btn onClick={() => setShowWords((s) => !s)}>{showWords ? "Hide comments" : "Show comments"}</Btn>}
      >
        {!showWords ? (
          <Note>
            {(v.data?.length ?? 0) > 0
              ? `${v.data?.length} written comment${v.data?.length === 1 ? "" : "s"} in the last ${days} days.`
              : "No written comments yet."}
          </Note>
        ) : (
          <Gate
            loading={v.loading && !v.data}
            error={v.error}
            empty={(v.data?.length ?? 0) === 0}
            emptyTitle="No comments yet"
            emptyDetail="The free-text box is optional, so most exits will not have one."
            skeleton={200}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(v.data ?? []).map((row, i) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${p.border}`,
                    borderRadius: 13,
                    padding: "13px 15px",
                    background: "var(--panel-2)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                    <Tag tone="neutral">{EXIT_LABELS[row.exit_type] ?? row.exit_type}</Tag>
                    {row.reason && <Tag tone="warn">{REASON_LABELS[row.reason] ?? row.reason}</Tag>}
                    <span style={{ fontSize: 11.5, color: p.muted }}>
                      {ago(row.created_at)}
                      {row.days_since_signup != null && ` · ${row.days_since_signup} days signed up`}
                      {row.lessons_completed != null && ` · ${row.lessons_completed} lessons`}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: p.ink, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {row.detail}
                  </div>
                </div>
              ))}
            </div>
          </Gate>
        )}
      </Panel>
    </div>
  );
}
