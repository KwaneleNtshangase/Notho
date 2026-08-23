"use client";

/**
 * PULSE - the tab that opens first.
 *
 * It answers three questions in the order a founder actually asks them:
 *   1. Is the app alive today, and up or down on last period?
 *   2. How healthy is it overall, and which part is dragging?
 *   3. What should I do about it before I close the laptop?
 *
 * Everything else in the dashboard is evidence for question three.
 */

import React, { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ago,
  delta,
  fmt,
  fmtMinutes,
  fmtPct,
  shortDate,
  type AtRiskRow,
  type ChurnRow,
  type ClockRow,
  type ContentRow,
  type DailyRow,
  type DropoffRow,
  type FeatureLiftRow,
  type FeatureRow,
  type FunnelRow,
  type Overview,
  type QuestionRow,
  type RetentionRow,
  type SegmentRow,
} from "./lib";
import { buildInsights, healthScore, scoreTone, type Insight, type Severity } from "./insights";
import { usePalette } from "./theme";
import { Btn, Card, Empty, ErrorNote, Gate, KV, Meter, Panel, Ring, Stat, StatGrid, StatSkeleton, useView } from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter } from "./charts";

export function PulsePanel({
  days,
  nonce,
  onJump,
}: {
  days: number;
  nonce: number;
  onJump: (tab: string) => void;
}) {
  const p = usePalette();

  const o = useView<Overview>("overview", { days }, nonce);
  const d = useView<DailyRow[]>("daily", { days }, nonce);
  const funnel = useView<FunnelRow[]>("funnel", { days: Math.max(days, 90) }, nonce);
  const segments = useView<SegmentRow[]>("segments", {}, nonce);
  const retention = useView<RetentionRow[]>("retention", {}, nonce);
  const content = useView<ContentRow[]>("content", { days: 180 }, nonce);
  const questions = useView<QuestionRow[]>("questions", { days: 180, minAttempts: 4 }, nonce);
  const features = useView<FeatureRow[]>("features", { days }, nonce);
  const lift = useView<FeatureLiftRow[]>("featureLift", { days: Math.max(days, 90) }, nonce);
  const atRisk = useView<AtRiskRow[]>("atRisk", { limit: 20 }, nonce);
  const clock = useView<ClockRow[]>("clock", { days: Math.max(days, 90) }, nonce);
  const dropoff = useView<DropoffRow[]>("dropoff", { days: Math.max(days, 90) }, nonce);
  const churn = useView<ChurnRow[]>("churn", { days: Math.max(days, 90) }, nonce);

  const input = useMemo(
    () => ({
      overview: o.data,
      daily: d.data,
      funnel: funnel.data,
      segments: segments.data,
      retention: retention.data,
      content: content.data,
      questions: questions.data,
      features: features.data,
      lift: lift.data,
      atRisk: atRisk.data,
      clock: clock.data,
      dropoff: dropoff.data,
      churn: churn.data,
    }),
    [
      o.data, d.data, funnel.data, segments.data, retention.data, content.data,
      questions.data, features.data, lift.data, atRisk.data, clock.data,
      dropoff.data, churn.data,
    ]
  );

  const insights = useMemo(() => buildInsights(input), [input]);
  const health = useMemo(() => healthScore(input), [input]);

  if (o.error) return <ErrorNote message={o.error} />;
  if (o.loading && !o.data) return <StatSkeleton count={6} />;
  const s = o.data;
  if (!s) return null;

  const series = d.data ?? [];
  const spark = (key: keyof DailyRow) => series.slice(-21).map((r) => Number(r[key] ?? 0));
  const stickiness = s.mau ? Math.round((s.dau / s.mau) * 100) : 0;

  return (
    <div className="nv-stack">
      <StatGrid>
        <Stat
          label={`Active · ${s.windowDays}d`}
          value={fmt(s.activeUsers)}
          trend={delta(s.activeUsers, s.activeUsersPrev)}
          spark={spark("active_users")}
          accent={p.teal}
          hint="Opened the app, answered a question, or triggered any tracked action."
        />
        <Stat
          label={`New sign-ups · ${s.windowDays}d`}
          value={fmt(s.newUsers)}
          trend={delta(s.newUsers, s.newUsersPrev)}
          spark={spark("new_users")}
          accent={p.gold}
          hint="Accounts created in this window."
        />
        <Stat
          label="Activation"
          value={`${s.activationRate}%`}
          accent={s.activationRate >= 55 ? p.green : s.activationRate >= 35 ? p.gold : p.red}
          hint={`${fmt(s.activatedUsers)} of ${fmt(s.totalUsers)} accounts have finished at least one lesson.`}
        />
        <Stat
          label={`Lessons · ${s.windowDays}d`}
          value={fmt(s.lessonsInWindow)}
          trend={delta(s.lessonsInWindow, s.lessonsInWindowPrev)}
          spark={spark("lessons")}
          accent={p.green}
          hint={`${fmt(s.lessonsCompleted)} completed all-time across every user.`}
        />
        <Stat
          label="Typical session"
          value={s.medianSessionMinutes ? `${s.medianSessionMinutes}` : "—"}
          unit={s.medianSessionMinutes ? "min" : undefined}
          accent={p.purple}
          hint={`Median, not mean. Average is ${s.avgSessionMinutes} min - one long visit drags that somewhere nobody actually sits.`}
        />
        <Stat
          label="Stickiness"
          value={stickiness ? `${stickiness}%` : "—"}
          accent={stickiness >= 20 ? p.green : stickiness >= 10 ? p.gold : p.red}
          hint="Daily active over monthly active. Above 20% means a habit, not an occasional visit."
        />
      </StatGrid>

      <div className="nv-grid" style={{ gridTemplateColumns: "minmax(280px, 340px) 1fr" }}>
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Product health</h2>
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: "6px 0 14px" }}>
            <Ring
              value={health.score}
              label="out of 100"
              color={toneColor(scoreTone(health.score), p)}
              caption={healthCaption(health.score)}
            />
          </div>
          {health.parts.map((part) => (
            <div key={part.key} style={{ marginBottom: 13 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: p.ink,
                }}
              >
                <span>{part.label}</span>
                <span style={{ color: partColor(part.score, p), fontVariantNumeric: "tabular-nums" }}>
                  {part.score}
                </span>
              </div>
              <Meter pct={part.score} color={partColor(part.score, p)} />
              <div style={{ fontSize: 11, color: p.muted, marginTop: 5, lineHeight: 1.45 }}>
                {part.detail}
              </div>
            </div>
          ))}
          {health.parts.length === 0 && (
            <Empty title="Not enough data yet" detail="The score appears once there is activity to score." />
          )}
        </Card>

        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">What to do next</h2>
            <span style={{ fontSize: 11.5, color: p.muted }}>
              {insights.length} finding{insights.length === 1 ? "" : "s"}, most urgent first
            </span>
          </div>
          <p className="nv-card-sub">
            Generated from the same queries the other tabs draw. Each card names the number that
            triggered it, so you can disagree with it on the evidence rather than on the vibe.
          </p>
          <InsightList insights={insights} onJump={onJump} />
        </Card>
      </div>

      <Panel
        title="Activity over time"
        subtitle="Active people, lessons finished and new sign-ups on one axis. Healthy looks like all three climbing together - rising sign-ups with flat activity means people are arriving and leaving."
      >
        <Gate
          loading={d.loading && !d.data}
          error={d.error}
          empty={series.length === 0}
          emptyTitle="No activity recorded yet"
          emptyDetail="Once the tracking migration is applied and someone opens the app, this fills in."
        >
          <Frame height={290}>
            <ComposedChart data={series} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.teal} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={p.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={shortDate}
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                minTickGap={26}
              />
              <YAxis tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
              <ThemedTooltip labelFormatter={labelFormatter(shortDate)} />
              <Legend wrapperStyle={{ fontSize: 12, color: p.muted }} />
              <Area
                type="monotone"
                dataKey="active_users"
                name="Active people"
                stroke={p.teal}
                strokeWidth={2.4}
                fill="url(#gActive)"
              />
              <Bar dataKey="lessons" name="Lessons" fill={p.green} radius={[3, 3, 0, 0]} maxBarSize={14} opacity={0.75} />
              <Line type="monotone" dataKey="new_users" name="Sign-ups" stroke={p.gold} strokeWidth={2} dot={false} />
            </ComposedChart>
          </Frame>
        </Gate>
      </Panel>

      <div className="nv-grid two">
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Reach right now</h2>
          </div>
          <KV label="Today" detail="people who did anything at all" value={fmt(s.dau)} accent={p.teal} />
          <KV label="This week" detail="unique people in 7 days" value={fmt(s.wau)} accent={p.teal} />
          <KV label="This month" detail="unique people in 30 days" value={fmt(s.mau)} accent={p.teal} />
          <KV label="On a 3+ day streak" detail="your habit-formers" value={fmt(s.usersWithStreak)} accent={p.gold} />
          <KV label="On a 7+ day streak" detail="the ones who will not churn" value={fmt(s.streak7Plus)} accent={p.green} />
          <KV
            label="Time in app"
            detail={`active minutes in the last ${s.windowDays} days`}
            value={fmtMinutes(s.totalMinutes)}
            accent={p.purple}
          />
        </Card>

        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Where everyone stands</h2>
            <Btn onClick={() => onJump("people")}>Open People</Btn>
          </div>
          <p className="nv-card-sub">
            Every account, bucketed by how recently and how deeply they use Notho. Each bucket takes a
            different move.
          </p>
          <Gate
            loading={segments.loading && !segments.data}
            error={segments.error}
            empty={(segments.data ?? []).length === 0}
            emptyTitle="No accounts yet"
            skeleton={180}
          >
            <SegmentBar segments={segments.data ?? []} />
            <div style={{ marginTop: 14 }}>
              {(segments.data ?? [])
                .filter((x) => x.users > 0)
                .map((x, i) => (
                  <div
                    key={x.segment}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: `1px solid ${p.border}`,
                    }}
                  >
                    <i
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 3,
                        background: p.series[i % p.series.length],
                        flex: "none",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.ink }}>{x.label}</div>
                      <div style={{ fontSize: 11.5, color: p.muted, lineHeight: 1.45 }}>{x.action}</div>
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: p.ink,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmt(x.users)}
                      <span style={{ fontSize: 11, color: p.muted, fontWeight: 700 }}> · {fmtPct(x.pct)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Gate>
        </Card>
      </div>

      <Card className="pad-sm">
        <div style={{ fontSize: 11.5, color: p.muted, lineHeight: 1.6 }}>
          Numbers generated {ago(s.generatedAt)} · window {s.windowDays} days · answers in window{" "}
          {fmt(s.answers)} · first-try accuracy {fmtPct(s.firstTryAccuracy)} · installed-app share{" "}
          {fmtPct(s.pwaShare)}
        </div>
      </Card>
    </div>
  );
}

// ── Insight list ─────────────────────────────────────────────────────────────

export function InsightList({
  insights,
  onJump,
  limit = 6,
}: {
  insights: Insight[];
  onJump: (tab: string) => void;
  limit?: number;
}) {
  const p = usePalette();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? insights : insights.slice(0, limit);

  if (!insights.length) {
    return (
      <Empty
        title="Nothing needs your attention"
        detail="Either everything is inside its healthy band, or there is not enough data yet to say. Come back once a few more people have used the app."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {shown.map((i) => (
        <div key={i.id} className="nv-insight" style={{ ["--tone" as string]: toneColor(i.severity, p) }}>
          <div className="nv-insight-rail" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <span className={`nv-tag ${toneClass(i.severity)}`}>{SEVERITY_LABEL[i.severity]}</span>
            </div>
            <h3 className="nv-insight-title">{i.title}</h3>
            <p className="nv-insight-body">{i.evidence}</p>
            <p className="nv-insight-do">
              <b>Do this:</b> {i.action}
            </p>
            {i.tab && (
              <button type="button" className="nv-insight-jump" onClick={() => onJump(i.tab!)}>
                See the evidence →
              </button>
            )}
          </div>
        </div>
      ))}
      {insights.length > limit && (
        <button
          type="button"
          className="nv-btn"
          style={{ alignSelf: "flex-start" }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show fewer" : `Show ${insights.length - limit} more`}
        </button>
      )}
    </div>
  );
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Fix first",
  warning: "Needs attention",
  opportunity: "Opportunity",
  win: "Working well",
};

function toneClass(s: Severity) {
  return s === "critical" ? "bad" : s === "warning" ? "warn" : s === "win" ? "good" : "info";
}

export function toneColor(s: Severity, p: ReturnType<typeof usePalette>) {
  return s === "critical" ? p.red : s === "warning" ? p.gold : s === "win" ? p.green : p.blue;
}

function partColor(score: number, p: ReturnType<typeof usePalette>) {
  return score >= 70 ? p.green : score >= 45 ? p.teal : score >= 25 ? p.gold : p.red;
}

function healthCaption(score: number) {
  if (score >= 70) return "Strong. Keep doing what you are doing and protect it.";
  if (score >= 45) return "Working, with one or two weak links. See the breakdown.";
  if (score >= 25) return "Fragile. Fix the lowest bar before adding anything new.";
  return "Early days, or something is broken. Start at the top of the action list.";
}

// ── Segment bar ──────────────────────────────────────────────────────────────

function SegmentBar({ segments }: { segments: SegmentRow[] }) {
  const p = usePalette();
  const total = segments.reduce((a, s) => a + s.users, 0) || 1;
  return (
    <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", gap: 2 }}>
      {segments
        .filter((s) => s.users > 0)
        .map((s, i) => (
          <div
            key={s.segment}
            title={`${s.label}: ${s.users} (${s.pct}%)`}
            style={{
              width: `${(s.users / total) * 100}%`,
              background: p.series[i % p.series.length],
              transition: "width .6s cubic-bezier(.22,1,.36,1)",
            }}
          />
        ))}
    </div>
  );
}
