"use client";

/**
 * The five dashboard tabs. Each panel owns its own fetching so a slow or broken
 * query degrades that panel only - the rest of the dashboard stays usable.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ago,
  C,
  ContentRow,
  CourseRow,
  DailyRow,
  DropoffRow,
  FeatureRow,
  FeatureTimeRow,
  featureLabel,
  fetchView,
  fmt,
  fmtMinutes,
  fmtPct,
  Overview,
  RetentionRow,
  SERIES,
  shortDate,
  UserDetail,
  UserRow,
  delta,
  downloadCsv,
} from "./lib";
import {
  Button,
  Card,
  Column,
  DataTable,
  Empty,
  ErrorNote,
  Explainer,
  Kpi,
  KpiGrid,
  Loading,
  Panel,
  Tag,
} from "./components";

// ── Shared fetch hook ────────────────────────────────────────────────────────

/**
 * Fetches one view and re-fetches when `deps` or `nonce` change. The nonce is
 * how the shell's auto-refresh reaches every panel without prop-drilling a
 * callback into each one.
 */
function useView<T>(
  view: string,
  params: Record<string, string | number | undefined>,
  nonce: number
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    // State is only touched in the async callbacks, never synchronously in the
    // effect body - the latter triggers a cascading re-render on every fetch.
    // Previous data deliberately stays on screen while refreshing, so the
    // dashboard doesn't flash empty every 60 seconds on auto-refresh.
    fetchView<T>(view, params)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, key, nonce]);

  return { data, error, loading };
}

const chartAxis = { fontSize: 11, fill: C.muted };

function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${C.line}`,
      fontSize: 12.5,
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    },
  };
}

// Recharts types its tooltip callbacks against a union that includes undefined
// and arrays, which is accurate but unusable at every call site. These two
// factories absorb the cast once, so the chart code below stays readable and
// the loose typing is confined to this block.
type TooltipProps = React.ComponentProps<typeof Tooltip>;
type RcFormatter = NonNullable<TooltipProps["formatter"]>;
type RcLabelFormatter = NonNullable<TooltipProps["labelFormatter"]>;

/** Formats a tooltip value, optionally overriding the series name. */
function valueFormatter(fn: (n: number) => string, forceName?: string): RcFormatter {
  return ((value: unknown, name: unknown) => [
    fn(Number(value ?? 0)),
    forceName ?? String(name ?? ""),
  ]) as RcFormatter;
}

/** Formats a tooltip's heading (the x-axis value). */
function labelFormatter(fn: (s: string) => string): RcLabelFormatter {
  return ((label: unknown) => fn(String(label ?? ""))) as RcLabelFormatter;
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export function OverviewPanel({ days, nonce }: { days: number; nonce: number }) {
  const o = useView<Overview>("overview", { days }, nonce);
  const d = useView<DailyRow[]>("daily", { days }, nonce);

  if (o.error) return <ErrorNote message={o.error} />;
  if (o.loading && !o.data) return <Loading label="Loading your numbers…" />;
  const s = o.data;
  if (!s) return null;

  const activeTrend = delta(s.activeUsers, s.activeUsersPrev);
  const signupTrend = delta(s.newUsers, s.newUsersPrev);
  const stickiness = s.mau ? Math.round((s.dau / s.mau) * 100) : 0;
  const chart = d.data ?? [];
  const hasSessions = s.sessions > 0;

  return (
    <>
      <KpiGrid>
        <Kpi
          label="Total users"
          value={fmt(s.totalUsers)}
          hint="Everyone who has ever created an account."
          accent={C.navy}
        />
        <Kpi
          label={`Active (${s.windowDays}d)`}
          value={fmt(s.activeUsers)}
          trend={activeTrend}
          hint="Opened the app or answered a question. Compared to the previous period."
          accent={C.teal}
        />
        <Kpi
          label={`New sign-ups (${s.windowDays}d)`}
          value={fmt(s.newUsers)}
          trend={signupTrend}
          hint="Accounts created in this window."
          accent={C.gold}
        />
        <Kpi
          label="Lessons completed"
          value={fmt(s.lessonsCompleted)}
          hint="All-time, across every user."
          accent={C.green}
        />
        <Kpi
          label="Time in app"
          value={fmtMinutes(s.totalMinutes)}
          hint="Active time only — idle and background tabs are not counted."
          accent={C.purple}
        />
        <Kpi
          label="Avg session"
          value={hasSessions ? `${s.avgSessionMinutes} min` : "—"}
          hint="How long a typical visit lasts."
          accent={C.blue}
        />
        <Kpi
          label="Daily / monthly"
          value={stickiness ? `${stickiness}%` : "—"}
          hint="Stickiness. Above 20% is strong for a learning app."
          accent={stickiness >= 20 ? C.green : C.gold}
        />
        <Kpi
          label="Answer accuracy"
          value={fmtPct(s.answerAccuracy)}
          hint="Share of question attempts answered correctly."
          accent={C.tealDeep}
        />
      </KpiGrid>

      <Panel
        title="Activity over time"
        subtitle="Daily active users and time spent. A healthy app shows both lines climbing together — rising users with flat time means people are arriving but not staying."
        action={
          chart.length > 0 && (
            <Button onClick={() => downloadCsv("daily-activity", chart)}>
              Export CSV
            </Button>
          )
        }
      >
        {d.error ? (
          <ErrorNote message={d.error} />
        ) : chart.length === 0 ? (
          <Empty
            title="No activity recorded yet"
            detail="Once the tracking migration is applied and someone opens the app, this chart fills in."
          />
        ) : (
          // ComposedChart, not AreaChart: this mixes an area with two lines, and
          // only ComposedChart officially supports heterogeneous children.
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chart} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="day" tickFormatter={shortDate} tick={chartAxis} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={chartAxis} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                {...tooltipStyle()}
                labelFormatter={labelFormatter(shortDate)}
                formatter={
                  ((value: unknown, name: unknown) =>
                    name === "Minutes"
                      ? [fmtMinutes(Number(value ?? 0)), String(name)]
                      : [fmt(Number(value ?? 0)), String(name ?? "")]) as RcFormatter
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="active_users" name="Active users" stroke={C.teal} strokeWidth={2.5} fill="url(#gUsers)" />
              <Line type="monotone" dataKey="minutes" name="Minutes" stroke={C.gold} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="new_users" name="New sign-ups" stroke={C.navy} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: "0 0 14px" }}>
            Reach right now
          </h3>
          {[
            { label: "Today", value: s.dau, note: "people who opened the app" },
            { label: "This week", value: s.wau, note: "unique users in 7 days" },
            { label: "This month", value: s.mau, note: "unique users in 30 days" },
            { label: "On a 3+ day streak", value: s.usersWithStreak, note: "your habit-formers" },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: `1px solid ${C.line}`,
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: C.body, fontSize: 13.5 }}>{r.label}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{r.note}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.tealDeep, fontVariantNumeric: "tabular-nums" }}>
                {fmt(r.value)}
              </div>
            </div>
          ))}
          <Explainer>
            <strong>For funding decks:</strong> monthly active users and the daily/monthly
            ratio are the two numbers investors ask for first. Export the CSV above for
            a defensible, dated record.
          </Explainer>
        </Card>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: "0 0 14px" }}>
            How they use it
          </h3>
          {[
            { label: "Sessions", value: fmt(s.sessions), note: `visits in the last ${s.windowDays} days` },
            { label: "Installed as an app", value: fmtPct(s.pwaShare), note: "share of sessions from the home screen" },
            { label: "Total XP earned", value: fmt(s.totalXp), note: "all-time across all users" },
            { label: "Lessons per active user", value: s.activeUsers ? (s.lessonsCompleted / s.activeUsers).toFixed(1) : "—", note: "depth of engagement" },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: `1px solid ${C.line}`,
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: C.body, fontSize: 13.5 }}>{r.label}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{r.note}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums" }}>
                {r.value}
              </div>
            </div>
          ))}
          <Explainer>
            A high <strong>installed as an app</strong> share is a strong retention signal —
            home-screen users come back far more often than browser-tab users.
          </Explainer>
        </Card>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────

export function FeaturesPanel({ days, nonce }: { days: number; nonce: number }) {
  const f = useView<FeatureRow[]>("features", { days }, nonce);
  const t = useView<FeatureTimeRow[]>("featureTime", { days }, nonce);
  const c = useView<CourseRow[]>("courses", { days }, nonce);

  const rows = f.data ?? [];
  const timeRows = (t.data ?? []).filter((r) => r.minutes > 0);

  const columns: Column<FeatureRow>[] = [
    {
      key: "feature",
      label: "Feature",
      render: (r) => <strong style={{ color: C.ink }}>{featureLabel(r.feature)}</strong>,
    },
    { key: "users", label: "People", numeric: true, render: (r) => fmt(r.users) },
    {
      key: "adoption",
      label: "Reach",
      numeric: true,
      render: (r) => (
        <Tag tone={r.adoption_pct >= 50 ? "good" : r.adoption_pct >= 20 ? "warn" : "bad"}>
          {fmtPct(r.adoption_pct)}
        </Tag>
      ),
    },
    { key: "events", label: "Uses", numeric: true, render: (r) => fmt(r.events) },
    {
      key: "per_user",
      label: "Uses / person",
      numeric: true,
      render: (r) => (r.events_per_user ?? 0).toFixed(1),
    },
    { key: "days", label: "Days active", numeric: true, render: (r) => fmt(r.active_days) },
    { key: "last", label: "Last used", render: (r) => <span style={{ color: C.muted }}>{ago(r.last_used)}</span> },
  ];

  return (
    <>
      <Panel
        title="Which features earn their keep"
        subtitle="Reach is the share of active users who touched a feature. Uses per person is how deeply they engage. High reach with low depth is a curiosity click. Low reach with high depth is a power-user niche worth protecting, not cutting."
        action={rows.length > 0 && <Button onClick={() => downloadCsv("feature-usage", rows)}>Export CSV</Button>}
      >
        {f.error ? (
          <ErrorNote message={f.error} />
        ) : f.loading && !f.data ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty
            title="No feature usage recorded yet"
            detail="Feature events start flowing the moment the tracking code is deployed and a signed-in user does something."
          />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 42)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} horizontal={false} />
                <XAxis type="number" tick={chartAxis} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tickFormatter={featureLabel}
                  tick={{ ...chartAxis, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  {...tooltipStyle()}
                  formatter={valueFormatter(fmt, "People")}
                  labelFormatter={labelFormatter(featureLabel)}
                />
                <Bar dataKey="users" radius={[0, 6, 6, 0]} maxBarSize={26}>
                  {rows.map((_, i) => (
                    <Cell key={i} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 20 }}>
              <DataTable columns={columns} rows={rows} />
            </div>
          </>
        )}
      </Panel>

      <Panel
        title="Where the time actually goes"
        subtitle="Active minutes split by the part of the app people were last in. This is the honest answer to 'is anyone using the Budget planner' — clicks flatter a feature, minutes do not."
      >
        {t.error ? (
          <ErrorNote message={t.error} />
        ) : timeRows.length === 0 ? (
          <Empty title="No session time recorded yet" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={timeRows} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="feature" tickFormatter={featureLabel} tick={chartAxis} tickLine={false} axisLine={false} />
                <YAxis tick={chartAxis} tickLine={false} axisLine={false} />
                <Tooltip
                  {...tooltipStyle()}
                  formatter={valueFormatter(fmtMinutes, "Time")}
                  labelFormatter={labelFormatter(featureLabel)}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={54}>
                  {timeRows.map((_, i) => (
                    <Cell key={i} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Explainer>
              Time is attributed to the screen a person was last on in each session, so treat
              this as a strong indication rather than a stopwatch. Compare features against
              each other, not against an absolute target.
            </Explainer>
          </>
        )}
      </Panel>

      <Panel
        title="Course engagement"
        subtitle="Which of your 22 courses people actually reach, and how hard each one is proving."
        action={(c.data ?? []).length > 0 && <Button onClick={() => downloadCsv("courses", c.data!)}>Export CSV</Button>}
      >
        {c.error ? (
          <ErrorNote message={c.error} />
        ) : c.loading && !c.data ? (
          <Loading />
        ) : (
          <DataTable
            emptyLabel="No course activity in this window."
            columns={[
              { key: "course", label: "Course", render: (r: CourseRow) => <strong style={{ color: C.ink }}>{r.course_id}</strong> },
              { key: "learners", label: "Learners", numeric: true, render: (r: CourseRow) => fmt(r.learners) },
              { key: "lessons", label: "Lessons touched", numeric: true, render: (r: CourseRow) => fmt(r.lessons_taken) },
              { key: "attempts", label: "Answers", numeric: true, render: (r: CourseRow) => fmt(r.attempts) },
              {
                key: "first",
                label: "First-try correct",
                numeric: true,
                render: (r: CourseRow) => (
                  <Tag tone={r.first_try_pct == null ? "neutral" : r.first_try_pct < 50 ? "bad" : r.first_try_pct > 90 ? "warn" : "good"}>
                    {fmtPct(r.first_try_pct)}
                  </Tag>
                ),
              },
              { key: "last", label: "Last activity", render: (r: CourseRow) => <span style={{ color: C.muted }}>{ago(r.last_activity)}</span> },
            ]}
            rows={c.data ?? []}
          />
        )}
      </Panel>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RETENTION
// ─────────────────────────────────────────────────────────────────────────────

export function RetentionPanel({ days, nonce }: { days: number; nonce: number }) {
  const r = useView<RetentionRow[]>("retention", {}, nonce);
  const d = useView<DropoffRow[]>("dropoff", { days }, nonce);

  const rows = r.data ?? [];
  // Table reads newest-first; the chart reads oldest-first so time runs left to right.
  const chartRows = useMemo(() => [...(r.data ?? [])].reverse(), [r.data]);

  return (
    <>
      <Panel
        title="Do people come back?"
        subtitle="Users grouped by the week they signed up, and the share who returned 1, 7 and 30 days later. This is the single most-asked-for chart in funding applications. A dash means that cohort is too young to have reached the milestone yet."
        action={rows.length > 0 && <Button onClick={() => downloadCsv("retention", rows)}>Export CSV</Button>}
      >
        {r.error ? (
          <ErrorNote message={r.error} />
        ) : r.loading && !r.data ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty title="No cohorts yet" detail="Cohorts appear once you have sign-ups within the last 180 days." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartRows} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="cohort_week" tickFormatter={shortDate} tick={chartAxis} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis unit="%" domain={[0, 100]} tick={chartAxis} tickLine={false} axisLine={false} />
                <Tooltip
                  {...tooltipStyle()}
                  labelFormatter={labelFormatter((v) => `Week of ${shortDate(v)}`)}
                  formatter={
                    // A null here means the cohort is too young for that milestone,
                    // which must read as "not yet", never as 0%.
                    ((value: unknown, name: unknown) => [
                      value == null ? "Too early to tell" : `${value}%`,
                      String(name ?? ""),
                    ]) as RcFormatter
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="d1_pct" name="Day 1" stroke={C.teal} strokeWidth={2.5} connectNulls={false} />
                <Line type="monotone" dataKey="d7_pct" name="Day 7" stroke={C.gold} strokeWidth={2.5} connectNulls={false} />
                <Line type="monotone" dataKey="d30_pct" name="Day 30" stroke={C.navy} strokeWidth={2.5} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 20 }}>
              <DataTable
                columns={[
                  { key: "week", label: "Signed up week of", render: (x: RetentionRow) => <strong style={{ color: C.ink }}>{shortDate(x.cohort_week)}</strong> },
                  { key: "size", label: "People", numeric: true, render: (x: RetentionRow) => fmt(x.cohort_size) },
                  { key: "d1", label: "Back on day 1", numeric: true, render: (x: RetentionRow) => <Tag tone={x.d1_pct == null ? "neutral" : x.d1_pct >= 40 ? "good" : x.d1_pct >= 20 ? "warn" : "bad"}>{fmtPct(x.d1_pct)}</Tag> },
                  { key: "d7", label: "Back on day 7", numeric: true, render: (x: RetentionRow) => <Tag tone={x.d7_pct == null ? "neutral" : x.d7_pct >= 20 ? "good" : x.d7_pct >= 10 ? "warn" : "bad"}>{fmtPct(x.d7_pct)}</Tag> },
                  { key: "d30", label: "Back on day 30", numeric: true, render: (x: RetentionRow) => <Tag tone={x.d30_pct == null ? "neutral" : x.d30_pct >= 10 ? "good" : x.d30_pct >= 5 ? "warn" : "bad"}>{fmtPct(x.d30_pct)}</Tag> },
                ]}
                rows={rows}
              />
            </div>
            <Explainer>
              <strong>Rough benchmarks for consumer learning apps:</strong> day 1 around 30–40%,
              day 7 around 15–25%, day 30 around 8–15%. Being under these is a signal to work on
              the first-week experience, not a reason to panic on a small sample.
            </Explainer>
          </>
        )}
      </Panel>

      <Panel
        title="Where people give up"
        subtitle="Lessons users start but do not finish, worst first. A low completion rate on a specific lesson usually means it is too long, too hard, or the question wording is unclear."
        action={(d.data ?? []).length > 0 && <Button onClick={() => downloadCsv("dropoff", d.data!)}>Export CSV</Button>}
      >
        {d.error ? (
          <ErrorNote message={d.error} />
        ) : d.loading && !d.data ? (
          <Loading />
        ) : (
          <DataTable
            emptyLabel="No lesson drop-off data yet — this needs a few days of tracked lesson starts."
            columns={[
              { key: "lesson", label: "Lesson", render: (x: DropoffRow) => <strong style={{ color: C.ink }}>{x.lesson_id}</strong> },
              { key: "course", label: "Course", render: (x: DropoffRow) => <span style={{ color: C.muted }}>{x.course_id ?? "—"}</span> },
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
              { key: "quit", label: "Quit at", numeric: true, render: (x: DropoffRow) => (x.avg_quit_pct == null ? "—" : `${x.avg_quit_pct}% through`) },
            ]}
            rows={d.data ?? []}
          />
        )}
      </Panel>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export function ContentPanel({ nonce }: { nonce: number }) {
  const c = useView<ContentRow[]>("content", { days: 90 }, nonce);
  const rows = c.data ?? [];

  const tooHard = rows.filter((r) => (r.first_try_pct ?? 100) < 40).length;
  const tooEasy = rows.filter((r) => (r.first_try_pct ?? 0) > 95).length;

  return (
    <Panel
      title="Which lessons are pitched right"
      subtitle="Scored on first-try accuracy only. Overall accuracy is misleading here — your mastery loop makes people retry until they are correct, so every lesson eventually reads as 100%. First-try is the honest difficulty signal."
      action={rows.length > 0 && <Button onClick={() => downloadCsv("content-quality", rows)}>Export CSV</Button>}
    >
      {c.error ? (
        <ErrorNote message={c.error} />
      ) : c.loading && !c.data ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty
          title="Not enough answers yet"
          detail="A lesson appears here once it has at least 5 recorded question attempts in the last 90 days."
        />
      ) : (
        <>
          <KpiGrid>
            <Kpi label="Lessons measured" value={fmt(rows.length)} hint="With enough answers to judge." accent={C.navy} />
            <Kpi label="Too hard" value={fmt(tooHard)} hint="Under 40% first-try. Worth rewriting." accent={tooHard ? C.red : C.green} />
            <Kpi label="Too easy" value={fmt(tooEasy)} hint="Over 95% first-try. Add depth." accent={tooEasy ? C.gold : C.green} />
            <Kpi
              label="Well pitched"
              value={fmt(rows.filter((r) => r.verdict === "Well pitched").length)}
              hint="In the 60–95% sweet spot."
              accent={C.green}
            />
          </KpiGrid>

          <DataTable
            columns={[
              { key: "lesson", label: "Lesson", render: (r: ContentRow) => <strong style={{ color: C.ink }}>{r.lesson_id}</strong> },
              { key: "course", label: "Course", render: (r: ContentRow) => <span style={{ color: C.muted }}>{r.course_id}</span> },
              { key: "learners", label: "Learners", numeric: true, render: (r: ContentRow) => fmt(r.learners) },
              { key: "attempts", label: "Answers", numeric: true, render: (r: ContentRow) => fmt(r.attempts) },
              { key: "first", label: "First-try correct", numeric: true, render: (r: ContentRow) => fmtPct(r.first_try_pct) },
              { key: "tries", label: "Avg tries", numeric: true, render: (r: ContentRow) => r.avg_attempts },
              {
                key: "verdict",
                label: "Verdict",
                render: (r: ContentRow) => (
                  <Tag
                    tone={
                      r.verdict.startsWith("Too hard")
                        ? "bad"
                        : r.verdict.startsWith("Too easy")
                        ? "warn"
                        : r.verdict === "Well pitched"
                        ? "good"
                        : "neutral"
                    }
                  >
                    {r.verdict}
                  </Tag>
                ),
              },
            ]}
            rows={rows}
          />
          <Explainer>
            <strong>How to read this:</strong> 60–95% first-try correct is the sweet spot — hard
            enough to teach, easy enough to keep going. Below 40% usually means the question
            wording is unclear rather than the concept being genuinely difficult, so read the
            question before rewriting the lesson.
          </Explainer>
        </>
      )}
    </Panel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

export function UsersPanel({ nonce }: { nonce: number }) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState("last_seen");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const u = useView<UserRow[]>("users", { search: debounced, sort, limit: 200 }, nonce);
  const rows = u.data ?? [];

  const columns: Column<UserRow>[] = [
    {
      key: "who",
      label: "User",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: C.ink }}>
            {r.username || r.full_name || r.email?.split("@")[0] || "Unknown"}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted }}>{r.email}</div>
        </div>
      ),
    },
    { key: "lessons", label: "Lessons", numeric: true, sortKey: "lessons", render: (r) => fmt(r.lessons_done) },
    { key: "minutes", label: "Time in app", numeric: true, sortKey: "minutes", render: (r) => fmtMinutes(r.total_minutes) },
    { key: "sessions", label: "Visits", numeric: true, render: (r) => fmt(r.sessions) },
    { key: "features", label: "Features", numeric: true, render: (r) => fmt(r.features_used) },
    { key: "xp", label: "XP", numeric: true, sortKey: "xp", render: (r) => fmt(r.xp) },
    {
      key: "streak",
      label: "Streak",
      numeric: true,
      sortKey: "streak",
      render: (r) => (r.streak > 0 ? `${r.streak} 🔥` : "—"),
    },
    { key: "accuracy", label: "Accuracy", numeric: true, render: (r) => fmtPct(r.accuracy_pct) },
    {
      key: "seen",
      label: "Last seen",
      sortKey: "last_seen",
      render: (r) => (
        <Tag tone={r.days_since_seen == null ? "neutral" : r.days_since_seen <= 2 ? "good" : r.days_since_seen <= 14 ? "warn" : "bad"}>
          {ago(r.last_seen)}
        </Tag>
      ),
    },
    { key: "joined", label: "Joined", sortKey: "signup", render: (r) => <span style={{ color: C.muted }}>{ago(r.signed_up)}</span> },
  ];

  return (
    <>
      <Panel
        title="Every user"
        subtitle="Click any row to open their full profile. Search by email, username or name."
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{
                padding: "8px 12px",
                borderRadius: 9,
                border: `1px solid ${C.line}`,
                fontSize: 13,
                minWidth: 200,
                outline: "none",
              }}
            />
            {rows.length > 0 && <Button onClick={() => downloadCsv("users", rows)}>Export CSV</Button>}
          </div>
        }
      >
        {u.error ? (
          <ErrorNote message={u.error} />
        ) : u.loading && !u.data ? (
          <Loading label="Loading users…" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              activeSort={sort}
              onSort={setSort}
              onRowClick={(r) => setSelected(r.user_id)}
              emptyLabel={debounced ? `No users match "${debounced}".` : "No users yet."}
            />
            {rows.length >= 200 && (
              <p style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>
                Showing the first 200. Use search to narrow it down.
              </p>
            )}
          </>
        )}
      </Panel>

      {selected && <UserDetailPanel userId={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function UserDetailPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  // Keyed by the user id it belongs to, so switching users shows the loader
  // rather than the previous person's numbers - without clearing state
  // synchronously in an effect, which causes a cascading render.
  const [loaded, setLoaded] = useState<{ id: string; data: UserDetail } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchView<UserDetail>("user", { userId })
      .then((data) => {
        if (cancelled) return;
        setLoaded({ id: userId, data });
        setErr(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const d = loaded?.id === userId ? loaded.data : null;

  // Escape closes the drawer - it covers the table, so there must be a way out
  // that doesn't require finding the button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(620px, 100%)",
          height: "100%",
          background: "#fff",
          overflowY: "auto",
          padding: 24,
          boxShadow: "-8px 0 30px rgba(0,0,0,0.14)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>User detail</h2>
          <Button onClick={onClose}>Close</Button>
        </div>

        {err ? (
          <ErrorNote message={err} />
        ) : !d ? (
          <Loading />
        ) : (
          <>
            <Card style={{ marginBottom: 16, background: "#F5FBF8", border: `1px solid ${C.teal}22` }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>
                {d.profile?.username || d.profile?.fullName || d.profile?.email?.split("@")[0] || "Unknown"}
              </div>
              <div style={{ fontSize: 13, color: C.body, marginTop: 3 }}>{d.profile?.email}</div>
              <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
                {d.profile?.isAdmin && <Tag tone="warn">Admin</Tag>}
                {d.profile?.goal && <Tag>Goal: {d.profile.goal}</Tag>}
                {d.profile?.ageRange && <Tag>Age {d.profile.ageRange}</Tag>}
                {d.usage?.usesPwa && <Tag tone="good">Installed as app</Tag>}
                {(d.usage?.devices ?? []).map((dev) => (
                  <Tag key={dev}>{dev}</Tag>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>
                Joined {ago(d.profile?.signedUp)} · Last seen {ago(d.usage?.lastSeen ?? d.profile?.lastSignIn)}
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
              <Kpi label="Lessons" value={fmt(d.progress?.lessonsDone ?? 0)} accent={C.teal} />
              <Kpi label="Time in app" value={fmtMinutes(d.usage?.totalMinutes ?? 0)} accent={C.purple} />
              <Kpi label="Visits" value={fmt(d.usage?.sessions ?? 0)} accent={C.navy} />
              <Kpi label="XP" value={fmt(d.progress?.xp ?? 0)} accent={C.gold} />
              <Kpi label="Streak" value={`${d.progress?.streak ?? 0} days`} accent={C.red} />
              <Kpi label="Accuracy" value={fmtPct(d.accuracy?.pct)} accent={C.green} />
            </div>

            {(d.dailyMinutes ?? []).length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: "0 0 12px" }}>
                  Time per day (last 30 days)
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={d.dailyMinutes} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                    <XAxis dataKey="day" tickFormatter={shortDate} tick={chartAxis} tickLine={false} axisLine={false} minTickGap={22} />
                    <YAxis tick={chartAxis} tickLine={false} axisLine={false} />
                    <Tooltip
                      {...tooltipStyle()}
                      labelFormatter={labelFormatter(shortDate)}
                      formatter={valueFormatter(fmtMinutes, "Time")}
                    />
                    <Bar dataKey="minutes" fill={C.teal} radius={[4, 4, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: "0 0 12px" }}>
                Features they use
              </h3>
              {(d.features ?? []).length === 0 ? (
                <Empty title="No feature activity recorded" />
              ) : (
                d.features.map((f) => (
                  <div
                    key={f.feature}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: `1px solid ${C.line}`,
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: C.body, fontSize: 13.5 }}>{featureLabel(f.feature)}</div>
                      <div style={{ fontSize: 11.5, color: C.muted }}>Last used {ago(f.lastUsed)}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: C.tealDeep, fontVariantNumeric: "tabular-nums" }}>
                      {fmt(f.events)}
                    </div>
                  </div>
                ))
              )}
            </Card>

            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: "0 0 12px" }}>
                Recent activity
              </h3>
              {(d.recentEvents ?? []).length === 0 ? (
                <Empty title="No recent events" />
              ) : (
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {d.recentEvents.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "7px 0",
                        borderBottom: `1px solid ${C.line}`,
                        fontSize: 12.5,
                      }}
                    >
                      <span style={{ color: C.body }}>
                        {e.event.replace(/_/g, " ")}
                        {e.props?.lessonId ? (
                          <span style={{ color: C.muted }}> · {String(e.props.lessonId)}</span>
                        ) : null}
                      </span>
                      <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{ago(e.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
