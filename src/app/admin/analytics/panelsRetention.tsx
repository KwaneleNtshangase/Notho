"use client";

/**
 * RETENTION - do people come back, and who is about to stop?
 *
 * The cohort heatmap is the chart funders ask for first. The win-back list is
 * the one that actually changes anything this week, so it sits above the fold
 * on mobile rather than at the bottom.
 */

import React, { useMemo } from "react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ago,
  displayName,
  downloadCsv,
  fmt,
  fmtMinutes,
  fmtPct,
  shortDate,
  type AtRiskRow,
  type DropoffRow,
  type MatrixRow,
  type Overview,
  type RetentionRow,
  type StreakRow,
} from "./lib";
import { usePalette } from "./theme";
import {
  Btn,
  DataTable,
  Gate,
  HeatGrid,
  Note,
  Panel,
  Stat,
  StatGrid,
  Tag,
  useView,
  type Column,
} from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter, valueFormatter } from "./charts";

export function RetentionPanel({
  days,
  nonce,
  onOpenUser,
}: {
  days: number;
  nonce: number;
  onOpenUser: (id: string) => void;
}) {
  const p = usePalette();
  const o = useView<Overview>("overview", { days }, nonce);
  const r = useView<RetentionRow[]>("retention", {}, nonce);
  const m = useView<MatrixRow[]>("matrix", { weeks: 12 }, nonce);
  const risk = useView<AtRiskRow[]>("atRisk", { limit: 60 }, nonce);
  const streaks = useView<StreakRow[]>("streaks", {}, nonce);
  const drop = useView<DropoffRow[]>("dropoff", { days: Math.max(days, 90) }, nonce);

  const s = o.data;
  const rows = useMemo(() => r.data ?? [], [r.data]);
  const chartRows = useMemo(() => [...rows].reverse(), [rows]);
  const matrix = useMemo(() => m.data ?? [], [m.data]);

  // The heatmap needs a rectangular grid; the RPC returns only the cells that
  // exist, which is what keeps a two-day-old cohort from reading as 0%.
  const { cohorts, maxWeek, cellMap } = useMemo(() => {
    const cs: { week: string; size: number }[] = [];
    const map = new Map<string, MatrixRow>();
    let max = 0;
    for (const row of matrix) {
      map.set(`${row.cohort_week}-${row.week_index}`, row);
      if (!cs.some((c) => c.week === row.cohort_week)) {
        cs.push({ week: row.cohort_week, size: row.cohort_size });
      }
      if (row.week_index > max) max = row.week_index;
    }
    return { cohorts: cs, maxWeek: max, cellMap: map };
  }, [matrix]);

  const riskRows = risk.data ?? [];

  const riskColumns: Column<AtRiskRow>[] = [
    {
      key: "who",
      label: "User",
      render: (x) => (
        <div>
          <div className="nv-strong">{displayName(x)}</div>
          <div style={{ fontSize: 11.5, color: p.muted }}>{x.email}</div>
        </div>
      ),
    },
    {
      key: "risk",
      label: "Status",
      render: (x) => (
        <Tag tone={x.risk === "Slipping" ? "warn" : x.risk === "At risk" ? "bad" : "neutral"}>
          {x.risk}
        </Tag>
      ),
    },
    { key: "quiet", label: "Quiet for", numeric: true, render: (x) => `${x.days_since} days` },
    { key: "lessons", label: "Lessons", numeric: true, render: (x) => fmt(x.lessons_done) },
    { key: "streak", label: "Best streak", numeric: true, render: (x) => fmt(x.longest_streak) },
    { key: "mins", label: "Time invested", numeric: true, render: (x) => fmtMinutes(x.total_minutes) },
    {
      key: "score",
      label: "Worth saving",
      numeric: true,
      render: (x) => (
        <span style={{ fontWeight: 800, color: x.risk_score >= 40 ? p.gold : p.muted }}>
          {Math.round(x.risk_score)}
        </span>
      ),
    },
    { key: "seen", label: "Last seen", render: (x) => <span style={{ color: p.muted }}>{ago(x.last_seen)}</span> },
  ];

  return (
    <div className="nv-stack">
      {s && (
        <StatGrid>
          <Stat
            label="Came back a 2nd day"
            value={`${s.returningShare}%`}
            accent={s.returningShare >= 50 ? p.green : s.returningShare >= 30 ? p.gold : p.red}
            hint="Of everyone active in this window."
          />
          <Stat
            label="On a 3+ day streak"
            value={fmt(s.usersWithStreak)}
            accent={p.gold}
            hint="The habit threshold. Above three days, churn drops sharply."
          />
          <Stat
            label="Slipping away"
            value={fmt(s.atRiskUsers)}
            accent={s.atRiskUsers > 0 ? p.gold : p.green}
            invertTrend
            hint="Finished a lesson, then silent for 8-30 days. Still winnable."
          />
          <Stat
            label="Dormant"
            value={fmt(s.dormantUsers)}
            accent={p.muted}
            invertTrend
            hint="Nothing for over 30 days. Expensive to win back."
          />
          <Stat
            label="Never started"
            value={fmt(s.neverActivated)}
            accent={s.neverActivated ? p.red : p.green}
            invertTrend
            hint="Signed up and never did a thing."
          />
        </StatGrid>
      )}

      <Panel
        title="Who to message tonight"
        subtitle="People who got going and then went quiet, ranked by what is at stake - lessons finished, streak built and time invested, discounted by how long they have been gone. Click a row for their full history."
        action={
          riskRows.length > 0 && (
            <Btn variant="primary" onClick={() => downloadCsv("win-back-list", riskRows)}>
              Export list
            </Btn>
          )
        }
      >
        <Gate
          loading={risk.loading && !risk.data}
          error={risk.error}
          empty={riskRows.length === 0}
          emptyTitle="Nobody is slipping away"
          emptyDetail="Everyone who has completed a lesson has been active in the last four days."
          skeleton={280}
        >
          <DataTable
            columns={riskColumns}
            rows={riskRows}
            onRowClick={(x) => onOpenUser(x.user_id)}
            maxHeight={430}
          />
          <Note>
            <strong>At this size, personal beats automated.</strong> A three-line email that names
            the course they were on will out-perform any campaign. Work down from the top: the score
            already weighs how much they invested against how likely they are to still be reachable.
          </Note>
        </Gate>
      </Panel>

      <Panel
        title="Cohort retention"
        subtitle="Each row is everyone who signed up that week; each column is how many weeks later. A cell is blank when that cohort has not existed long enough to have the week yet - never zero, because 'too early to tell' and 'nobody came back' are very different findings."
        action={matrix.length > 0 && <Btn onClick={() => downloadCsv("cohort-matrix", matrix)}>Export CSV</Btn>}
      >
        <Gate
          loading={m.loading && !m.data}
          error={m.error}
          empty={cohorts.length === 0}
          emptyTitle="No cohorts yet"
          emptyDetail="Cohorts appear once people have signed up within the last twelve weeks."
          skeleton={280}
        >
          <HeatGrid
            columns={maxWeek + 1}
            rows={cohorts.length}
            colLabels={(c) => `W${c}`}
            rowLabels={(rIdx) => shortDate(cohorts[rIdx]?.week ?? "")}
            cell={(rIdx, c) => {
              const key = `${cohorts[rIdx]?.week}-${c}`;
              const hit = cellMap.get(key);
              if (!hit) return { value: null, title: "Too early to tell", text: "" };
              return {
                value: hit.pct ?? 0,
                text: hit.pct != null ? `${Math.round(hit.pct)}` : "",
                title: `${shortDate(hit.cohort_week)} cohort (${hit.cohort_size} people), week ${c}: ${hit.retained} back (${hit.pct}%)`,
              };
            }}
            colorFor={(v) =>
              v == null
                ? "transparent"
                : `color-mix(in srgb, ${p.teal} ${Math.max(6, Math.round(v))}%, transparent)`
            }
          />
          <div className="nv-legend">
            <span>
              <i style={{ background: `color-mix(in srgb, ${p.teal} 10%, transparent)` }} />
              low
            </span>
            <span>
              <i style={{ background: `color-mix(in srgb, ${p.teal} 45%, transparent)` }} />
              medium
            </span>
            <span>
              <i style={{ background: `color-mix(in srgb, ${p.teal} 90%, transparent)` }} />
              high
            </span>
            <span>
              <i style={{ background: "transparent", boxShadow: `inset 0 0 0 1px ${p.border}` }} />
              too early to tell
            </span>
          </div>
        </Gate>
      </Panel>

      <div className="nv-grid two">
        <Panel
          title="Day 1, 7 and 30"
          subtitle="The three milestones every funding application asks for, by signup week."
          action={rows.length > 0 && <Btn onClick={() => downloadCsv("retention", rows)}>Export CSV</Btn>}
        >
          <Gate
            loading={r.loading && !r.data}
            error={r.error}
            empty={rows.length === 0}
            emptyTitle="No cohorts yet"
            skeleton={250}
          >
            <Frame height={250}>
              <LineChart data={chartRows} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis
                  dataKey="cohort_week"
                  tickFormatter={shortDate}
                  tick={axis(p)}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis unit="%" domain={[0, 100]} tick={axis(p)} tickLine={false} axisLine={false} />
                <ThemedTooltip
                  labelFormatter={labelFormatter((v) => `Week of ${shortDate(v)}`)}
                  formatter={
                    // A null here means the cohort is too young for that
                    // milestone, which must read as "not yet", never as 0%.
                    ((value: unknown, name: unknown) => [
                      value == null ? "Too early to tell" : `${value}%`,
                      String(name ?? ""),
                    ]) as never
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="d1_pct" name="Day 1" stroke={p.teal} strokeWidth={2.4} connectNulls={false} />
                <Line type="monotone" dataKey="d7_pct" name="Day 7" stroke={p.gold} strokeWidth={2.4} connectNulls={false} />
                <Line type="monotone" dataKey="d30_pct" name="Day 30" stroke={p.purple} strokeWidth={2.4} connectNulls={false} />
              </LineChart>
            </Frame>
            <Note>
              <strong>Rough benchmarks for consumer learning apps:</strong> day 1 around 30-40%, day
              7 around 15-25%, day 30 around 8-15%. Being under these is a signal to work on the
              first week, not a reason to panic on a small sample.
            </Note>
          </Gate>
        </Panel>

        <Panel
          title="Habit formation"
          subtitle="Streak length across every account. The jump from 'no streak' to '3-6 days' is the one that matters - past three days, people mostly keep going."
        >
          <Gate
            loading={streaks.loading && !streaks.data}
            error={streaks.error}
            empty={(streaks.data ?? []).length === 0}
            emptyTitle="No streak data yet"
            skeleton={250}
          >
            <Frame height={250}>
              <BarChart data={streaks.data ?? []} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis dataKey="bucket" tick={axis(p)} tickLine={false} axisLine={false} />
                <YAxis tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
                <ThemedTooltip formatter={valueFormatter((n) => `${fmt(n)} people`, "Accounts")} />
                <Bar dataKey="users" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {(streaks.data ?? []).map((row, i) => (
                    <Cell key={i} fill={i === 0 ? p.muted : p.series[(i - 1) % p.series.length]} />
                  ))}
                </Bar>
              </BarChart>
            </Frame>
          </Gate>
        </Panel>
      </div>

      <Panel
        title="Where people give up mid-lesson"
        subtitle="Lessons users start but do not finish, worst first. A low completion rate usually means the lesson is too long, the question wording is unclear, or the hard part comes too early."
        action={(drop.data ?? []).length > 0 && <Btn onClick={() => downloadCsv("dropoff", drop.data!)}>Export CSV</Btn>}
      >
        <Gate
          loading={drop.loading && !drop.data}
          error={drop.error}
          empty={(drop.data ?? []).length === 0}
          emptyTitle="No lesson drop-off recorded yet"
          emptyDetail="This needs a few days of tracked lesson starts and completions."
          skeleton={220}
        >
          <DataTable
            columns={[
              { key: "lesson", label: "Lesson", render: (x: DropoffRow) => <span className="nv-strong">{x.lesson_id}</span> },
              { key: "course", label: "Course", render: (x: DropoffRow) => <span style={{ color: p.muted }}>{x.course_id ?? "—"}</span> },
              { key: "starts", label: "Started", numeric: true, render: (x: DropoffRow) => fmt(x.starts) },
              { key: "done", label: "Finished", numeric: true, render: (x: DropoffRow) => fmt(x.completions) },
              {
                key: "pct",
                label: "Completion",
                numeric: true,
                render: (x: DropoffRow) => (
                  <Tag tone={x.completion_pct == null ? "neutral" : x.completion_pct >= 80 ? "good" : x.completion_pct >= 60 ? "warn" : "bad"}>
                    {fmtPct(x.completion_pct)}
                  </Tag>
                ),
              },
              {
                key: "quit",
                label: "Quit at",
                numeric: true,
                render: (x: DropoffRow) => (x.avg_quit_pct == null ? "—" : `${x.avg_quit_pct}% through`),
              },
            ]}
            rows={drop.data ?? []}
          />
        </Gate>
      </Panel>
    </div>
  );
}
