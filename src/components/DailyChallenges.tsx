"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { assignChallengesForUser, lookupChallenge, rerollChallenge } from "@/lib/challenges";
import { sastToday, sastSundayDate } from "@/lib/dates";

type ChallengeAssignmentRow = {
  id: string;
  period_type: "daily" | "weekly";
  difficulty: "easy" | "medium" | "hard";
  challenge_code: string;
  target_value: number;
  xp_reward: number;
  completed_at: string | null;
};

export function DailyChallenges() {
  const [rows, setRows] = useState<ChallengeAssignmentRow[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { current: number; target: number; done: boolean }>>({});
  const [rerollUsed, setRerollUsed] = useState(false);
  const [xpPop, setXpPop] = useState<{ id: string; xp: number } | null>(null);
  const seenCompleted = useRef<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;
    await assignChallengesForUser(user.id);
    const today = sastToday();
    const week = sastSundayDate();

    const { data: assignments } = await supabase
      .from("user_challenge_assignments")
      .select("id,period_type,difficulty,challenge_code,target_value,xp_reward,completed_at")
      .eq("user_id", user.id)
      .in("period_key", [today, week]);
    setRows((assignments ?? []) as ChallengeAssignmentRow[]);

    const ids = (assignments ?? []).map((r: any) => r.id);
    if (ids.length > 0) {
      const { data: p } = await supabase
        .from("user_challenge_progress")
        .select("assignment_id,current_value,target_value,is_complete")
        .in("assignment_id", ids);
      const map: Record<string, { current: number; target: number; done: boolean }> = {};
      for (const row of (p ?? []) as any[]) {
        map[row.assignment_id] = { current: row.current_value ?? 0, target: row.target_value ?? 1, done: !!row.is_complete };
      }
      setProgressMap(map);
    } else {
      setProgressMap({});
    }

    const { data: up } = await supabase
      .from("user_progress")
      .select("challenge_rerolls_date,challenge_rerolls_used")
      .eq("user_id", user.id)
      .maybeSingle();
    setRerollUsed(up?.challenge_rerolls_date === today && Number(up?.challenge_rerolls_used ?? 0) >= 1);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 6000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    for (const row of rows) {
      if (!row.completed_at || seenCompleted.current.has(row.id)) continue;
      seenCompleted.current.add(row.id);
      setXpPop({ id: row.id, xp: row.xp_reward });
      const t = window.setTimeout(() => setXpPop(null), 1800);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [rows]);

  const daily = rows.filter((r) => r.period_type === "daily").slice(0, 3);
  const weekly = rows.filter((r) => r.period_type === "weekly").slice(0, 2);

  const renderCard = (row: ChallengeAssignmentRow) => {
    const meta = lookupChallenge(row.challenge_code, row.period_type);
    const p = progressMap[row.id] ?? { current: 0, target: row.target_value, done: !!row.completed_at };
    const done = !!row.completed_at || p.done;
    const pct = Math.min(100, Math.round((p.current / Math.max(1, p.target)) * 100));
    return (
      <div
        key={row.id}
        style={{
          position: "relative",
          border: `1px solid ${done ? "rgba(0,122,133,0.35)" : "var(--color-border)"}`,
          background: done ? "rgba(0,122,133,0.06)" : "var(--color-surface)",
          borderRadius: 12,
          padding: "12px 12px",
          transform: done ? "scale(1.01)" : "scale(1)",
          transition: "all 220ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}><I18nText>{meta?.title ?? row.challenge_code}</I18nText></div>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-secondary)" }}><I18nText>{row.difficulty}</I18nText></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)" }}><I18nText source={"+{value0} XP"} values={[row.xp_reward]} /></span>
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}><I18nText>{meta?.description ?? "Challenge in progress"}</I18nText></div>
        <div style={{ height: 6, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-primary)", transition: "width 250ms ease" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--color-text-secondary)" }}>
          <I18nText>{Math.min(p.current, p.target)}</I18nText>/<I18nText>{p.target}</I18nText>
        </div>
        {done && (
          <div style={{ position: "absolute", right: 10, bottom: 8, fontSize: 12, color: "#007A85", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 size={14} /> <I18nText source={" Done"} /></div>
        )}
        {xpPop?.id === row.id && (
          <div style={{ position: "absolute", right: 12, top: -10, background: "#007A85", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 800, padding: "4px 8px" }}><I18nText source={"+{value0} XP"} values={[xpPop.xp]} /></div>
        )}
        {row.period_type === "daily" && (
          <I18nElement as="button"
            type="button"
            disabled={rerollUsed}
            title="1 reroll per day"
            onClick={async () => {
              const { data: userRes } = await supabase.auth.getUser();
              if (!userRes.user) return;
              await rerollChallenge(userRes.user.id, row.id);
              setRerollUsed(true);
              await load();
            }}
            style={{
              marginTop: 8,
              border: "1px solid var(--color-border)",
              background: rerollUsed ? "#d1d5db" : "var(--color-bg)",
              color: rerollUsed ? "#6b7280" : "var(--color-text-primary)",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 8,
              padding: "4px 8px",
              cursor: rerollUsed ? "not-allowed" : "pointer",
            }}
          ><I18nText source={"Reroll"} /></I18nElement>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 800 }}><I18nText source={"Daily Challenges"} /></div>
      {daily.map(renderCard)}
      <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}><I18nText source={"Weekly Challenges"} /></div>
      {weekly.map(renderCard)}
    </div>
  );
}
