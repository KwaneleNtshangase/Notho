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
import { scoreTone, type InsightInput } from "./insights";
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
    () =>
      ({
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
      }) as InsightInput,
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
        <Stat label="Activation" value={`${s.activationRate}%`} accent={s.activationRate >= 55 ? p.green : s.activationRate >= 35 ? p.gold : p.red} hint={`${fmt(s.activatedUsers)} of ${fmt(s.totalUsers)} finished a lesson. ${fmt(s.neverActivated)} never started."} />
      </StatGrid>
    </div>
  );
}
