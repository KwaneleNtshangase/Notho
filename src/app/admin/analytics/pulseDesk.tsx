"use client";

import React, { useMemo } from "react";
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
  fmt,
  fmtMinutes,
  fmtPct,
  shortDate,
  type DailyRow,
  type Overview,
  type QuestionRow,
  type SegmentRow,
} from "./lib";
import { scoreTone } from "./insights";
import { honestDelta } from "./honesty";
import { deskHealth, deskInsights, storeReadiness } from "./deskExtras";
import { usePalette } from "./theme";
import { Btn, Card, Empty, ErrorNote, Gate, KV, Meter, Panel, Ring, Stat, StatGrid, StatSkeleton, useView } from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter } from "./charts";
import { InsightList, toneColor } from "./panelsPulse";

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
  const funnel = useView("funnel", { days: Math.max(days, 90) }, nonce);
  const segments = useView<SegmentRow[]>("segments", {}, nonce);
  const retention = useView("retention", {}, nonce);
  const content = useView("content", { days: 180 }, nonce);
  const questions = useView<QuestionRow[]>("questions", { days: 180, minAttempts: 4 }, nonce);
  const features = useView("features", { days }, nonce);
  const lift = useView("featureLift", { days: Math.max(days, 90) }, nonce);
  const atRisk = useView("atRisk", { limit: 20 }, nonce);
  const clock = useView("clock", { days: Math.max(days, 90) }, nonce);
  const dropoff = useView("dropoff", { days: Math.max(days, 90) }, nonce);
  const churn = useView("churn", { days: Math.max(days, 90) }, nonce);

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
    [o.data, d.data, funnel.data, segments.data, retention.data, content.data, questions.data, features.data, lift.data, atRisk.data, clock.data, dropoff.data, churn.data]
  );

  const insights = useMemo(() => deskInsights(input), [input]);
  const health = useMemo(() => deskHealth(input), [input]);
  const store = useMemo(() => storeReadiness(input), [input]);
  const brokenQuestions = useMemo(
    () => (questions.data ?? []).filter((q) => (q.first_try_pct ?? 100) < 25 && q.attempts >= 4).slice(0, 5),
    [questions.data]
  );

  if (o.error) return <ErrorNote message={o.error} />;
  if (o.loading && !o.data) return <StatSkeleton count={8} />;
  const s = o.data;
  if (!s) return null;

  const series = d.data ?? [];
  const spark = (key: keyof DailyRow) => series.slice(-21).map((r) => Number(r[key] ?? 0));
  const stickiness = s.mau ? Math.round((s.dau / s.mau) * 100) : 0;

  return (
    <div className="nv-stack">
      <StatGrid>
        <Stat label={`Active \u00b7 ${s.windowDays}d`} value={fmt(s.activeUsers)} trend={honestDelta(s.activeUsers, s.activeUsersPrev)} spark={spark("active_users")} accent={p.teal} hint="Opened the app, answered a question, or triggered any tracked action. Percent change hides until n \u2265 30." />
        <Stat label={`New sign-ups \u00b7 ${s.windowDays}d`} value={fmt(s.newUsers)} trend={honestDelta(s.newUsers, s.newUsersPrev)} spark={spark("new_users")} accent={p.gold} hint="Accounts created in this window." />
        <Stat label="Activation" value={`${s.activationRate}%`} accent={s.activationRate >= 55 ? p.green : s.activationRate >= 35 ? p.gold : p.red} hint={`${fmt(s.activatedUsers)} of ${fmt(s.totalUsers)} finished a lesson. ${fmt(s.neverActivated)} never started.`} />
        <Stat label={`Lessons \u00b7 ${s.windowDays}d`} value={fmt(s.lessonsInWindow)} trend={honestDelta(s.lessonsInWindow, s.lessonsInWindowPrev)} spark={spark("lessons")} accent={p.green} hint={`${fmt(s.lessonsCompleted)} completed all-time across every user.`} />
        <Stat label="Typical session" value={s.medianSessionMinutes ? `${s.medianSessionMinutes}` : "\u2014"} unit={s.medianSessionMinutes ? "min" : undefined} accent={p.purple} hint={`Median, not mean. Average is ${s.avgSessionMinutes} min.`} />
        <Stat label="Installed app" value={`${s.pwaShare}%`} accent={s.pwaShare >= 15 ? p.green : s.pwaShare > 0 ? p.gold : p.red} hint="Share of sessions from a home-screen or native install. 0% is a store-launch blocker." />
        <Stat label="Stickiness" value={stickiness ? `${stickiness}%` : "\u2014"} accent={s.mau >= 30 && stickiness >= 20 ? p.green : s.mau >= 30 && stickiness >= 10 ? p.gold : p.muted} hint={s.mau < 30 ? `${s.dau} today / ${s.mau} this month. Too small to call a habit.` : "Daily active over monthly active. Above 20% means a habit."} />
        <Stat label="First-try" value={s.firstTryAccuracy != null ? `${s.firstTryAccuracy}%` : "\u2014"} accent={s.firstTryAccuracy == null ? p.muted : s.firstTryAccuracy >= 55 && s.firstTryAccuracy <= 90 ? p.green : p.red} hint={`${fmt(s.answers)} answers in this window. Under 40% usually means broken keys or ambiguous stems.`} />
      </StatGrid>

      <div className="nv-grid" style={{ gridTemplateColumns: "minmax(280px, 340px) 1fr" }}>
        <ScoreCard title="Product health" score={health.score} label="out of 100" caption={healthCaption(health.score)} parts={health.parts} />
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">What to do next</h2>
            <span style={{ fontSize: 11.5, color: p.muted }}>{insights.length} findings, most urgent first</span>
          </div>
          <p className="nv-card-sub">Generated from the same queries the other tabs draw. Each card names the number that triggered it.</p>
          <InsightList insights={insights} onJump={onJump} />
        </Card>
      </div>

      <div className="nv-grid two">
        <ScoreCard title="Store readiness" score={store.score} label="launch floor" caption={store.score >= 70 ? "Ready to put in front of strangers." : "Fix the red bars before store review."} parts={store.parts} />
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Questions that look broken</h2>
            <Btn onClick={() => onJump("content")}>Open Content</Btn>
          </div>
          <p className="nv-card-sub">Under 25% first-try with real volume. Rewrite the stem or un-key the answer before a store reviewer meets them.</p>
          {questions.loading && !questions.data ? (
            <div className="nv-skel" style={{ height: 160 }} />
          ) : brokenQuestions.length === 0 ? (
            <Empty title="No obvious defects in this window" detail="Either the banks are clean, or there is not enough volume yet to call a question broken." />
          ) : (
            brokenQuestions.map((q) => (
              <div key={`${q.course_id}-${q.lesson_id}-${q.slot_id}-${q.variant_id}`} className="nv-kv">
                <div>
                  <div className="nv-kv-l">{q.course_id} / {q.lesson_id}</div>
                  <div className="nv-kv-d">{q.slot_id} \u00b7 {q.attempts} attempts \u00b7 {q.learners} learners</div>
                </div>
                <div className="nv-kv-v" style={{ color: p.red }}>{q.first_try_pct}%</div>
              </div>
            ))
          )}
        </Card>
      </div>

      <Panel title="Activity over time" subtitle="Active people, lessons finished and new sign-ups on one axis.">
        <Gate loading={d.loading && !d.data} error={d.error} empty={series.length === 0} emptyTitle="No activity recorded yet" emptyDetail="Once someone opens the app, this fills in.">
          <Frame height={290}>
            <ComposedChart data={series} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.teal} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={p.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
              <XAxis dataKey="day" tickFormatter={shortDate} tick={axis(p)} tickLine={false} axisLine={false} minTickGap={26} />
              <YAxis tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
              <ThemedTooltip labelFormatter={labelFormatter(shortDate)} />
              <Legend wrapperStyle={{ fontSize: 12, color: p.muted }} />
              <Area type="monotone" dataKey="active_users" name="Active people" stroke={p.teal} strokeWidth={2.4} fill="url(#gActive)" />
              <Bar dataKey="lessons" name="Lessons" fill={p.green} radius={[3, 3, 0, 0]} maxBarSize={14} opacity={0.75} />
              <Line type="monotone" dataKey="new_users" name="Sign-ups" stroke={p.gold} strokeWidth={2} dot={false} />
            </ComposedChart>
          </Frame>
        </Gate>
      </Panel>

      <div className="nv-grid two">
        <Card>
          <div className="nv-card-head"><h2 className="nv-card-title">Reach right now</h2></div>
          <KV label="Today" detail="people who did anything at all" value={fmt(s.dau)} accent={p.teal} />
          <KV label="This week" detail="unique people in 7 days" value={fmt(s.wau)} accent={p.teal} />
          <KV label="This month" detail="unique people in 30 days" value={fmt(s.mau)} accent={p.teal} />
          <KV label="On a 3+ day streak" detail="your habit-formers" value={fmt(s.usersWithStreak)} accent={p.gold} />
          <KV label="On a 7+ day streak" detail="the ones who will not churn" value={fmt(s.streak7Plus)} accent={p.green} />
          <KV label="Time in app" detail={`active minutes in the last ${s.windowDays} days`} value={fmtMinutes(s.totalMinutes)} accent={p.purple} />
        </Card>
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">Where everyone stands</h2>
            <Btn onClick={() => onJump("people")}>Open People</Btn>
          </div>
          <p className="nv-card-sub">Every account, bucketed by how recently and how deeply they use Notho. Each bucket takes a different move.</p>
          <Gate loading={segments.loading && !segments.data} error={segments.error} empty={(segments.data ?? []).length === 0} emptyTitle="No accounts yet" skeleton={180}>
            <SegmentBar segments={segments.data ?? []} />
            <div style={{ marginTop: 14 }}>
              {(segments.data ?? []).filter((x) => x.users > 0).map((x, i) => (
                <div key={x.segment} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${p.border}` }}>
                  <i style={{ width: 9, height: 9, borderRadius: 3, background: p.series[i % p.series.length], flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.ink }}>{x.label}</div>
                    <div style={{ fontSize: 11.5, color: p.muted, lineHeight: 1.45 }}>{x.action}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: p.ink, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(x.users)}<span style={{ fontSize: 11, color: p.muted, fontWeight: 700 }}> \u00b7 {fmtPct(x.pct)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Gate>
        </Card>
      </div>

      <Card className="pad-sm">
        <div style={{ fontSize: 11.5, color: p.muted, lineHeight: 1.6 }}>
          Numbers generated {ago(s.generatedAt)} \u00b7 window {s.windowDays} days \u00b7 answers {fmt(s.answers)} \u00b7 lessons {fmt(s.lessonsInWindow)} \u00b7 first-try {fmtPct(s.firstTryAccuracy)} \u00b7 installed {fmtPct(s.pwaShare)} \u00b7 {s.dau} today / {s.mau} this month. Percent deltas stay hidden until a window has 30 people so one extra friend cannot look like growth.
        </div>
      </Card>
    </div>
  );
}

function ScoreCard({
  title, score, label, caption, parts,
}: {
  title: string;
  score: number;
  label: string;
  caption: string;
  parts: { key: string; label: string; score: number; detail: string }[];
}) {
  const p = usePalette();
  return (
    <Card>
      <div className="nv-card-head"><h2 className="nv-card-title">{title}</h2></div>
      {title === "Store readiness" && (
        <p className="nv-card-sub">Launch gates for the App Store and Play listing. Red means do not spend on acquisition yet.</p>
      )}
      <div style={{ display: "grid", placeItems: "center", padding: "6px 0 14px" }}>
        <Ring value={score} label={label} color={toneColor(scoreTone(score), p)} caption={caption} />
      </div>
      {parts.map((part) => (
        <div key={part.key} style={{ marginBottom: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6, fontSize: 12.5, fontWeight: 700, color: p.ink }}>
            <span>{part.label}</span>
            <span style={{ color: partColor(part.score, p), fontVariantNumeric: "tabular-nums" }}>{part.score}</span>
          </div>
          <Meter pct={part.score} color={partColor(part.score, p)} />
          <div style={{ fontSize: 11, color: p.muted, marginTop: 5, lineHeight: 1.45 }}>{part.detail}</div>
        </div>
      ))}
    </Card>
  );
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

function SegmentBar({ segments }: { segments: SegmentRow[] }) {
  const p = usePalette();
  const total = segments.reduce((a, s) => a + s.users, 0) || 1;
  return (
    <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", gap: 2 }}>
      {segments.filter((s) => s.users > 0).map((s, i) => (
        <div key={s.segment} title={`${s.label}: ${s.users} (${s.pct}%)`} style={{ width: `${(s.users / total) * 100}%`, background: p.series[i % p.series.length], transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
      ))}
    </div>
  );
}
