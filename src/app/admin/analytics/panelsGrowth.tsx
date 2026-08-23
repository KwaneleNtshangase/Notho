"use client";

/**
 * GROWTH - are new people arriving, and do they turn into users?
 *
 * The two charts here answer different questions and are easy to confuse.
 * The funnel is about one cohort's journey; growth accounting is about whether
 * the living user base is expanding. A product can have a beautiful funnel and
 * a shrinking base, and that combination is the one that kills companies
 * quietly.
 */

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  delta,
  downloadCsv,
  fmt,
  shortDate,
  type FunnelRow,
  type GrowthRow,
  type Overview,
  type SegmentRow,
} from "./lib";
import { usePalette } from "./theme";
import {
  Btn,
  Card,
  FunnelBars,
  Gate,
  Note,
  Panel,
  Stat,
  StatGrid,
  StatSkeleton,
  useView,
} from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter } from "./charts";
import { ComposedChart } from "recharts";

export function GrowthPanel({ days, nonce }: { days: number; nonce: number }) {
  const p = usePalette();
  // The funnel always looks back at least 90 days regardless of the window
  // picker: a seven-day activation funnel measures cohorts that have not had
  // time to activate, and reads as a collapse that is really just impatience.
  const funnelDays = Math.max(days, 90);
  const o = useView<Overview>("overview", { days }, nonce);
  const funnel = useView<FunnelRow[]>("funnel", { days: funnelDays }, nonce);
  const growth = useView<GrowthRow[]>("growth", { weeks: 12 }, nonce);
  const segments = useView<SegmentRow[]>("segments", {}, nonce);

  const s = o.data;
  const rows = funnel.data ?? [];
  const g = growth.data ?? [];

  return (
    <div className="nv-stack">
      {o.loading && !s ? (
        <StatSkeleton count={5} />
      ) : s ? (
        <StatGrid>
          <Stat
            label="Total accounts"
            value={fmt(s.totalUsers)}
            accent={p.blue}
            hint="Everyone who has ever signed up."
          />
          <Stat
            label={`New · ${s.windowDays}d`}
            value={fmt(s.newUsers)}
            trend={delta(s.newUsers, s.newUsersPrev)}
            accent={p.gold}
            hint="Compared with the previous window of the same length."
          />
          <Stat
            label="Activated"
            value={fmt(s.activatedUsers)}
            accent={p.green}
            hint={`${s.activationRate}% of all accounts have finished at least one lesson.`}
          />
          <Stat
            label="Never started"
            value={fmt(s.neverActivated)}
            accent={s.neverActivated > 0 ? p.red : p.green}
            invertTrend
            hint="Signed up and produced no activity at all. Pure onboarding loss."
          />
          <Stat
            label="Answers logged"
            value={fmt(s.answers)}
            accent={p.purple}
            hint={`In the last ${s.windowDays} days, across every lesson.`}
          />
        </StatGrid>
      ) : null}

      <Panel
        title="Where new sign-ups stall"
        subtitle={`Everyone who signed up in the last ${funnelDays} days. Each step is a strict subset of the one above it, so the bars can only ever shrink, and the red number is the single steepest drop - that step is where the next week of work belongs.`}
        action={
          rows.length > 0 && (
            <Btn onClick={() => downloadCsv("activation-funnel", rows)}>Export CSV</Btn>
          )
        }
      >
        <Gate
          loading={funnel.loading && !funnel.data}
          error={funnel.error}
          empty={rows.length === 0}
          emptyTitle="No sign-ups in this window"
          skeleton={280}
        >
          <FunnelBars
            rows={rows.map((r) => ({
              label: r.label,
              users: r.users,
              pct: r.pct,
              drop_pct: r.drop_pct,
              hint: r.hint,
            }))}
            colors={[p.teal, p.blue, p.purple, p.pink, p.gold, p.green, p.teal]}
          />
          <div style={{ marginTop: 16 }}>
            <Note>
              <strong>How to read it:</strong> the percentage inside each bar is share of the
              original cohort; the red figure on the right is the share lost at that step alone.
              Fixing a step below a big leak is wasted work - the people never get there.
            </Note>
          </div>
        </Gate>
      </Panel>

      <Panel
        title="Is the active base actually growing?"
        subtitle="Headline account totals only ever go up, because accounts never disappear. This is the honest version: people who came back (retained), people who returned after a gap (resurrected), brand-new people, and the ones who stopped."
        action={g.length > 0 && <Btn onClick={() => downloadCsv("growth-accounting", g)}>Export CSV</Btn>}
      >
        <Gate
          loading={growth.loading && !growth.data}
          error={growth.error}
          empty={g.length === 0}
          emptyTitle="Not enough weeks of activity yet"
          emptyDetail="This chart needs at least two consecutive weeks of tracked activity."
          skeleton={300}
        >
          <Frame height={300}>
            <ComposedChart
              data={g.map((r) => ({ ...r, churned_neg: -r.churned }))}
              margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
              stackOffset="sign"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
              <XAxis
                dataKey="week"
                tickFormatter={shortDate}
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
              <ReferenceLine y={0} stroke={p.border} />
              <ThemedTooltip labelFormatter={labelFormatter((v) => `Week of ${shortDate(v)}`)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="retained" name="Retained" stackId="a" fill={p.teal} radius={[0, 0, 0, 0]} />
              <Bar dataKey="resurrected" name="Resurrected" stackId="a" fill={p.purple} />
              <Bar dataKey="new_users" name="New" stackId="a" fill={p.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="churned_neg" name="Stopped" stackId="a" fill={p.red} radius={[0, 0, 4, 4]} />
              <Line type="monotone" dataKey="active" name="Active total" stroke={p.gold} strokeWidth={2.4} dot={false} />
            </ComposedChart>
          </Frame>
          <Note>
            <strong>The test:</strong> if the red bar below the line is taller than the green and
            purple above it, you are replacing users rather than adding them. Acquisition spend in
            that state just refills a leaking bucket.
          </Note>
        </Gate>
      </Panel>

      <div className="nv-grid two">
        <Panel
          title="Sign-ups by week"
          subtitle="Raw arrivals, before any judgement about whether they stayed."
        >
          <Gate
            loading={growth.loading && !growth.data}
            error={growth.error}
            empty={g.length === 0}
            emptyTitle="No sign-up history yet"
            skeleton={220}
          >
            <Frame height={220}>
              <BarChart data={g} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
                <XAxis
                  dataKey="week"
                  tickFormatter={shortDate}
                  tick={axis(p)}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
                <ThemedTooltip labelFormatter={labelFormatter((v) => `Week of ${shortDate(v)}`)} />
                <Bar dataKey="new_users" name="New sign-ups" fill={p.gold} radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </Frame>
          </Gate>
        </Panel>

        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Onboarding losses</h2>
          </div>
          <p className="nv-card-sub">
            The two buckets that never became users. Both are recoverable, and both need a different
            message.
          </p>
          <Gate
            loading={segments.loading && !segments.data}
            error={segments.error}
            skeleton={160}
          >
            {(segments.data ?? [])
              .filter((x) => x.segment === "never_started" || x.segment === "lost")
              .map((x) => (
                <div
                  key={x.segment}
                  style={{
                    padding: "13px 0",
                    borderBottom: `1px solid ${p.border}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: p.ink }}>{x.label}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: p.ink }}>{fmt(x.users)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: p.muted, marginTop: 5, lineHeight: 1.55 }}>
                    {x.action}
                  </div>
                </div>
              ))}
          </Gate>
        </Card>
      </div>
    </div>
  );
}
