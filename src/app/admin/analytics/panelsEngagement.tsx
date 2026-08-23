"use client";

/**
 * ENGAGEMENT - which parts of Notho earn their place, and when people show up.
 *
 * The quadrant chart is the one to look at first. Reach and depth answer
 * different questions and a single bar chart of "uses" hides both: a feature
 * everyone tries once looks identical to a feature five people live in.
 */

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  DOW_LABELS,
  ago,
  downloadCsv,
  featureLabel,
  fmt,
  fmtMinutes,
  fmtPct,
  type ClockRow,
  type FeatureLiftRow,
  type FeatureRow,
  type FeatureTimeRow,
  type Overview,
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
import { Frame, ThemedTooltip, axis, labelFormatter, valueFormatter, type RcFormatter } from "./charts";

export function EngagementPanel({ days, nonce }: { days: number; nonce: number }) {
  const p = usePalette();
  const o = useView<Overview>("overview", { days }, nonce);
  const f = useView<FeatureRow[]>("features", { days }, nonce);
  const t = useView<FeatureTimeRow[]>("featureTime", { days }, nonce);
  const lift = useView<FeatureLiftRow[]>("featureLift", { days: Math.max(days, 90) }, nonce);
  const clock = useView<ClockRow[]>("clock", { days: Math.max(days, 90) }, nonce);

  const rows = useMemo(() => f.data ?? [], [f.data]);
  const timeRows = useMemo(() => (t.data ?? []).filter((r) => r.minutes > 0), [t.data]);
  const s = o.data;

  // Quadrant lines sit at the midpoint of the observed range rather than at a
  // fixed value: with five features, a hard-coded threshold puts everything in
  // one box and says nothing.
  const mid = useMemo(() => {
    if (!rows.length) return { x: 50, y: 1 };
    const xs = rows.map((r) => r.adoption_pct ?? 0).sort((a, b) => a - b);
    const ys = rows.map((r) => r.events_per_user ?? 0).sort((a, b) => a - b);
    const med = (arr: number[]) => arr[Math.floor(arr.length / 2)] ?? 0;
    return { x: med(xs), y: med(ys) };
  }, [rows]);

  const scatter = rows.map((r) => ({
    x: r.adoption_pct ?? 0,
    y: r.events_per_user ?? 0,
    z: Math.max(r.users, 1),
    name: featureLabel(r.feature),
    key: r.feature,
  }));

  const clockRows = clock.data ?? [];
  const clockMax = Math.max(1, ...clockRows.map((c) => c.users));
  const clockMap = new Map(clockRows.map((c) => [`${c.dow}-${c.hour}`, c]));
  const bestSlot = [...clockRows].sort((a, b) => b.users - a.users || b.events - a.events)[0];

  const columns: Column<FeatureRow>[] = [
    {
      key: "feature",
      label: "Feature",
      render: (r) => <span className="nv-strong">{featureLabel(r.feature)}</span>,
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
    {
      key: "verdict",
      label: "Read as",
      render: (r) => {
        const v = quadrant(r.adoption_pct ?? 0, r.events_per_user ?? 0, mid);
        return <Tag tone={v.tone}>{v.label}</Tag>;
      },
    },
    {
      key: "last",
      label: "Last used",
      render: (r) => <span style={{ color: p.muted }}>{ago(r.last_used)}</span>,
    },
  ];

  return (
    <div className="nv-stack">
      {s && (
        <StatGrid>
          <Stat
            label="Sessions"
            value={fmt(s.sessions)}
            accent={p.teal}
            hint={`Visits in the last ${s.windowDays} days.`}
          />
          <Stat
            label="Typical session"
            value={s.medianSessionMinutes ? `${s.medianSessionMinutes}` : "—"}
            unit={s.medianSessionMinutes ? "min" : undefined}
            accent={p.purple}
            hint="Median active minutes. Idle and background tabs are not counted."
          />
          <Stat
            label="Days per active user"
            value={String(s.avgActiveDays ?? 0)}
            accent={p.gold}
            hint="How many separate days the average active person showed up."
          />
          <Stat
            label="Came back a 2nd day"
            value={`${s.returningShare}%`}
            accent={s.returningShare >= 50 ? p.green : s.returningShare >= 30 ? p.gold : p.red}
            hint="Share of this window's active users seen on two or more days."
          />
          <Stat
            label="Installed as an app"
            value={fmtPct(s.pwaShare)}
            accent={p.blue}
            hint="Share of sessions from the home screen rather than a browser tab."
          />
        </StatGrid>
      )}

      <Panel
        title="Which features earn their keep"
        subtitle="Reach across the bottom, depth up the side, bubble size is how many people. The two dashed lines sit at the middle of your own range, so every feature lands in one of four boxes - and each box implies a different decision."
        action={rows.length > 0 && <Btn onClick={() => downloadCsv("feature-usage", rows)}>Export CSV</Btn>}
      >
        <Gate
          loading={f.loading && !f.data}
          error={f.error}
          empty={rows.length === 0}
          emptyTitle="No feature usage recorded yet"
          emptyDetail="Feature events start flowing the moment a signed-in user does something."
          skeleton={320}
        >
          <Frame height={330}>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 22, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} />
              <XAxis
                type="number"
                dataKey="x"
                name="Reach"
                unit="%"
                domain={[0, 100]}
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                label={{ value: "Reach - share of active users", position: "insideBottom", offset: -12, fill: p.muted, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Uses per person"
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
              />
              <ZAxis type="number" dataKey="z" range={[90, 900]} name="People" />
              <ReferenceLine x={mid.x} stroke={p.border} strokeDasharray="4 4" />
              <ReferenceLine y={mid.y} stroke={p.border} strokeDasharray="4 4" />
              <ThemedTooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={scatterFormatter}
              />
              <Scatter data={scatter} name="Features">
                {scatter.map((entry, i) => (
                  <Cell key={entry.key} fill={p.series[i % p.series.length]} fillOpacity={0.78} />
                ))}
              </Scatter>
            </ScatterChart>
          </Frame>

          <div className="nv-legend">
            {scatter.map((sc, i) => (
              <span key={sc.key}>
                <i style={{ background: p.series[i % p.series.length] }} />
                {sc.name}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Note>
              <strong>Top right</strong> is your core - protect it. <strong>Bottom right</strong> is a
              curiosity click: everyone tries it once, nobody returns, so either make it useful or
              stop giving it prime navigation. <strong>Top left</strong> is a power-user niche worth
              keeping even though few people find it. <strong>Bottom left</strong> is dead weight -
              promote it deliberately or remove it.
            </Note>
          </div>

          <div style={{ marginTop: 18 }}>
            <DataTable columns={columns} rows={rows} />
          </div>
        </Gate>
      </Panel>

      <div className="nv-grid two">
        <Panel
          title="Where the time actually goes"
          subtitle="Active minutes split by the screen people were last on. Clicks flatter a feature; minutes do not."
        >
          <Gate
            loading={t.loading && !t.data}
            error={t.error}
            empty={timeRows.length === 0}
            emptyTitle="No session time recorded yet"
            skeleton={240}
          >
            <Frame height={250}>
              <BarChart data={timeRows} margin={{ top: 6, right: 8, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis
                  dataKey="feature"
                  tickFormatter={featureLabel}
                  tick={axis(p)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={axis(p)} tickLine={false} axisLine={false} />
                <ThemedTooltip
                  formatter={valueFormatter(fmtMinutes, "Time")}
                  labelFormatter={labelFormatter(featureLabel)}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={54}>
                  {timeRows.map((_, i) => (
                    <Cell key={i} fill={p.series[i % p.series.length]} />
                  ))}
                </Bar>
              </BarChart>
            </Frame>
            <Note>
              Time is attributed to the screen a person was last on in each session, so read this as
              a strong indication rather than a stopwatch. Compare features against each other, not
              against a target.
            </Note>
          </Gate>
        </Panel>

        <Panel
          title="Does the feature bring people back?"
          subtitle="Return rate of people who touched a feature against those who did not, in percentage points. Correlation only - engaged people try more things - but a big gap is a good experiment to run."
        >
          <Gate
            loading={lift.loading && !lift.data}
            error={lift.error}
            empty={(lift.data ?? []).length === 0}
            emptyTitle="Not enough users to compare yet"
            emptyDetail="This needs a handful of people on both sides of each feature."
            skeleton={240}
          >
            <Frame height={Math.max(200, (lift.data ?? []).length * 44)}>
              <BarChart
                data={lift.data ?? []}
                layout="vertical"
                margin={{ top: 6, right: 26, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} horizontal={false} />
                <XAxis type="number" tick={axis(p)} tickLine={false} axisLine={false} unit="pts" />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tickFormatter={featureLabel}
                  tick={{ ...axis(p), fontSize: 11.5 }}
                  tickLine={false}
                  axisLine={false}
                  width={116}
                />
                <ReferenceLine x={0} stroke={p.border} />
                <ThemedTooltip
                  formatter={valueFormatter((n) => `${n} points`, "Return-rate gap")}
                  labelFormatter={labelFormatter(featureLabel)}
                />
                <Bar dataKey="lift_pts" radius={[0, 5, 5, 0]} maxBarSize={22}>
                  {(lift.data ?? []).map((r, i) => (
                    <Cell key={i} fill={(r.lift_pts ?? 0) >= 0 ? p.green : p.red} />
                  ))}
                </Bar>
              </BarChart>
            </Frame>
          </Gate>
        </Panel>
      </div>

      <Panel
        title="When your users are awake"
        subtitle="Every tracked action by day and hour, South African time. This is the answer to 'when should the reminder go out' - a question usually answered by guessing."
        action={clockRows.length > 0 && <Btn onClick={() => downloadCsv("activity-clock", clockRows)}>Export CSV</Btn>}
      >
        <Gate
          loading={clock.loading && !clock.data}
          error={clock.error}
          empty={clockRows.length === 0}
          emptyTitle="No activity recorded yet"
          skeleton={260}
        >
          <HeatGrid
            columns={24}
            rows={7}
            colLabels={(c) => (c % 3 === 0 ? String(c).padStart(2, "0") : "")}
            rowLabels={(r) => DOW_LABELS[r]}
            cell={(r, c) => {
              const hit = clockMap.get(`${r + 1}-${c}`);
              const users = hit?.users ?? 0;
              return {
                value: users ? (users / clockMax) * 100 : null,
                title: `${DOW_LABELS[r]} ${String(c).padStart(2, "0")}:00 — ${users} ${
                  users === 1 ? "person" : "people"
                }, ${hit?.events ?? 0} actions`,
              };
            }}
            colorFor={(v) =>
              v == null
                ? "color-mix(in srgb, currentColor 6%, transparent)"
                : `color-mix(in srgb, ${p.teal} ${Math.max(8, Math.round(v))}%, transparent)`
            }
          />
          {bestSlot && bestSlot.users > 0 && (
            <div style={{ marginTop: 16 }}>
              <Note>
                <strong>Peak:</strong> {DOW_LABELS[Math.max(0, bestSlot.dow - 1)]} at{" "}
                {String(bestSlot.hour).padStart(2, "0")}:00, with {bestSlot.users}{" "}
                {bestSlot.users === 1 ? "person" : "people"} active. Send the daily nudge about an
                hour before that, not on a round number.
              </Note>
            </div>
          )}
        </Gate>
      </Panel>
    </div>
  );
}

/** Scatter tooltips name the axis, not the series, so units go on per-axis. */
const scatterFormatter: RcFormatter = ((value: unknown, name: unknown) => {
  const n = String(name ?? "");
  if (n === "Reach") return [`${value}%`, "Reach"];
  if (n === "Uses per person") return [Number(value ?? 0).toFixed(1), "Uses per person"];
  return [String(value ?? ""), n];
}) as RcFormatter;

function quadrant(
  reach: number,
  depth: number,
  mid: { x: number; y: number }
): { label: string; tone: "good" | "warn" | "bad" | "info" } {
  const hiReach = reach >= mid.x;
  const hiDepth = depth >= mid.y;
  if (hiReach && hiDepth) return { label: "Core", tone: "good" };
  if (hiReach && !hiDepth) return { label: "Curiosity click", tone: "warn" };
  if (!hiReach && hiDepth) return { label: "Power niche", tone: "info" };
  return { label: "Dead weight", tone: "bad" };
}
