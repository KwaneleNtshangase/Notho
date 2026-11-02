"use client";
import { LocalizedText as I18nText } from "@/i18n/LocalizedText";

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

export function OutcomesPanel({ nonce }: { nonce: number }) {
  const p = usePalette();
  const view = useView<Payload>("outcomes", {}, nonce);
  const [open, setOpen] = useState<string>("needs-vs-wants");

  if (view.error) return <ErrorNote message={view.error} />;
  return (
    <Gate loading={view.loading && !view.data} error={view.error} empty={!view.data} emptyTitle="No outcome data yet" skeleton={220}>
      {view.data && <OutcomesBody data={view.data} open={open} setOpen={setOpen} ink={p.ink} muted={p.muted} green={p.green} red={p.red} gold={p.gold} teal={p.teal} />}
    </Gate>
  );
}

function OutcomesBody({
  data,
  open,
  setOpen,
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
        <h2 className="nv-card-title"><I18nText source={"Are the lessons showing up in the budget?"} /></h2>
        <p className="nv-card-sub"><I18nText source={"{value0} {value1} people have budget rows.{value2}{value3} have a recorded lesson. A person only counts as improved when both windows have real spend. This is not proof the lesson caused the change."} values={[data.coverage.classifiedNote, fmt(data.coverage.budgetUsers), " ", fmt(data.coverage.lessonUsers)]} preserveValues={[false,true,false,true]} /></p>
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
            <h2 className="nv-card-title"><I18nText>{active.label}</I18nText></h2>
            <span style={{ fontSize: 12, color: muted }}><I18nText source={"{value0} improved · {value1} flat · {value2} worsened · {value3} waiting on budget"} values={[fmt(active.improved), fmt(active.flat), fmt(active.worsened), fmt(active.insufficient)]} /></span>
          </div>
          <p className="nv-card-sub"><I18nText>{active.note}</I18nText></p>
          {active.pairs.length === 0 ? (
            <Empty title="Nobody has finished this yet" detail="The card fills once a lesson result and a budget both exist." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: ink }}>
                <thead>
                  <tr style={{ color: muted, textAlign: "left" }}>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Person"} /></th>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Call"} /></th>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Wants before"} /></th>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Wants after"} /></th>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Change"} /></th>
                    <th style={{ padding: "8px 6px" }}><I18nText source={"Why"} /></th>
                  </tr>
                </thead>
                <tbody>
                  {active.pairs.slice(0, 40).map((pair) => (
                    <tr key={pair.userId} style={{ borderTop: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 700 }}>{pair.username || "No username"}</td>
                      <td style={{ padding: "8px 6px", color: tone(pair.call.verdict), fontWeight: 800 }}><I18nText>{pair.call.verdict}</I18nText></td>
                      <td style={{ padding: "8px 6px" }}><I18nText>{fmtPct(pair.call.before.wantSharePct)}</I18nText></td>
                      <td style={{ padding: "8px 6px" }}><I18nText>{fmtPct(pair.call.after.wantSharePct)}</I18nText></td>
                      <td style={{ padding: "8px 6px" }}><I18nText>{deltaLabel(pair.call.wantShareDeltaPp)}</I18nText></td>
                      <td style={{ padding: "8px 6px", color: muted, maxWidth: 360 }}><I18nText>{pair.call.reason}</I18nText></td>
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
