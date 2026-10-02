"use client";

import React, { useState } from "react";
import { fmt, fmtPct } from "./lib";
import { usePalette } from "./theme";
import { Card, Empty, ErrorNote, Gate, Stat, StatGrid, useView } from "./ui";

type WindowSpend = {
  days: number;
  income: number;
  need: number;
  want: number;
  savings: number;
  expenseRows: number;
  wantSharePct: number | null;
  savingsRatePct: number | null;
};

type Pair = {
  userId: string;
  username: string | null;
  completedAt: string;
  call: {
    verdict: "improved" | "flat" | "worsened" | "insufficient";
    reason: string;
    before: WindowSpend;
    after: WindowSpend;
    wantShareDeltaPp: number | null;
    savingsRateDeltaPp: number | null;
  };
};

type Summary = {
  id: string;
  label: string;
  finished: number;
  comparable: number;
  improved: number;
  flat: number;
  worsened: number;
  insufficient: number;
  medianWantShareDeltaPp: number | null;
  note: string;
  pairs: Pair[];
};

type Payload = {
  generatedAt: string;
  checks: Summary[];
  sinceJoining: Summary;
  coverage: { budgetUsers: number; lessonUsers: number; classifiedNote: string };
};

function deltaLabel(n: number | null): string {
  if (n == null) return "\u2014";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n} pp`;
}

export function OutcomesPanel({
  nonce,
  onOpenUser,
}: {
  nonce: number;
  onOpenUser?: (id: string) => void;
}) {
  const p = usePalette();
  const view = useView<Payload>("outcomes", {}, nonce);
  const [open, setOpen] = useState<string>("needs-vs-wants");

  if (view.error) return <ErrorNote message={view.error} />;
  return (
    <Gate loading={view.loading && !view.data} error={view.error} empty={!view.data} emptyTitle="No outcome data yet" skeleton={220}>
      {view.data && (
        <OutcomesBody
          data={view.data}
          open={open}
          setOpen={setOpen}
          onOpenUser={onOpenUser}
          ink={p.ink}
          muted={p.muted}
          green={p.green}
          red={p.red}
          gold={p.gold}
          teal={p.teal}
        />
      )}
    </Gate>
  );
}

function OutcomesBody({
  data,
  open,
  setOpen,
  onOpenUser,
  ink,
  muted,
  green,
  red,
  gold,
  teal,
}: {
  data: Payload;
  open: string;
  setOpen: (id: string) => void;
  onOpenUser?: (id: string) => void;
  ink: string;
  muted: string;
  green: string;
  red: string;
  gold: string;
  teal: string;
}) {
  const blocks = [...data.checks, data.sinceJoining];
  const active = blocks.find((b) => b.id === open) ?? blocks[0];
  const tone = (verdict: Pair["call"]["verdict"]) =>
    verdict === "improved" ? green : verdict === "worsened" ? red : verdict === "flat" ? gold : muted;

  return (
    <div className="nv-stack">
      <Card>
        <h2 className="nv-card-title">Are the lessons showing up in the budget?</h2>
        <p className="nv-card-sub">
          {data.coverage.classifiedNote} {fmt(data.coverage.budgetUsers)} people have budget rows.{" "}
          {fmt(data.coverage.lessonUsers)} have a recorded lesson. A person only counts as improved
          when both windows have real spend. This is not proof the lesson caused the change. Names
          open the person view. Do not copy those rows into a deck.
        </p>
      </Card>
      <StatGrid>
        {blocks.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setOpen(b.id)}
            style={{
              textAlign: "left",
              border: open === b.id ? `1px solid ${teal}` : "1px solid transparent",
              borderRadius: 16,
              padding: 0,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <Stat
              label={b.label}
              value={b.comparable ? `${b.improved}/${b.comparable}` : "\u2014"}
              unit={b.comparable ? "improved" : undefined}
              accent={b.comparable && b.improved > b.worsened ? green : b.comparable ? gold : muted}
              hint={`${fmt(b.finished)} finished \u00b7 ${fmt(b.insufficient)} not comparable \u00b7 median want share ${deltaLabel(b.medianWantShareDeltaPp)}`}
            />
          </button>
        ))}
      </StatGrid>
      {active && (
        <Card>
          <div className="nv-card-head">
            <h2 className="nv-card-title">{active.label}</h2>
            <span style={{ fontSize: 12, color: muted }}>
              {fmt(active.improved)} improved \u00b7 {fmt(active.flat)} flat \u00b7 {fmt(active.worsened)} worsened \u00b7 {fmt(active.insufficient)} waiting on budget
            </span>
          </div>
          <p className="nv-card-sub">{active.note}</p>
          {active.pairs.length === 0 ? (
            <Empty title="Nobody has finished this yet" detail="The card fills once a lesson result and a budget both exist." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: ink }}>
                <thead>
                  <tr style={{ color: muted, textAlign: "left" }}>
                    <th style={{ padding: "8px 6px" }}>Person</th>
                    <th style={{ padding: "8px 6px" }}>Call</th>
                    <th style={{ padding: "8px 6px" }}>Wants before</th>
                    <th style={{ padding: "8px 6px" }}>Wants after</th>
                    <th style={{ padding: "8px 6px" }}>Change</th>
                    <th style={{ padding: "8px 6px" }}>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {active.pairs.slice(0, 40).map((pair) => (
                    <tr key={pair.userId} style={{ borderTop: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 700 }}>
                        {onOpenUser ? (
                          <button type="button" onClick={() => onOpenUser(pair.userId)} style={{ background: "none", border: "none", padding: 0, color: teal, fontWeight: 800, cursor: "pointer" }}>
                            {pair.username || "Open person"}
                          </button>
                        ) : (
                          pair.username || "No username"
                        )}
                      </td>
                      <td style={{ padding: "8px 6px", color: tone(pair.call.verdict), fontWeight: 800 }}>{pair.call.verdict}</td>
                      <td style={{ padding: "8px 6px" }}>{fmtPct(pair.call.before.wantSharePct)}</td>
                      <td style={{ padding: "8px 6px" }}>{fmtPct(pair.call.after.wantSharePct)}</td>
                      <td style={{ padding: "8px 6px" }}>{deltaLabel(pair.call.wantShareDeltaPp)}</td>
                      <td style={{ padding: "8px 6px", color: muted, maxWidth: 360 }}>{pair.call.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
