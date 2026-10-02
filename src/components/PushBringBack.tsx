"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Stats = {
  ready: boolean;
  hint?: string;
  sent: number;
  opened: number;
  lesson: number;
  byKind: { kind: string; label: string; sent: number; opened: number; lesson: number; openRate: number; lessonRate: number }[];
  byCopy: { title: string; kind: string; sent: number; opened: number; lesson: number; openRate: number }[];
};

export function PushBringBack() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/admin/push-stats", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (cancelled) return;
      if (!res.ok) setErr(json.error ?? "Could not load reminders");
      else setStats(json);
    })().catch(() => setErr("Could not load reminders"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <p style={{ fontSize: 13, color: "var(--nv-muted, #888)" }}>{err}</p>;
  if (!stats) return <div className="nv-skel" style={{ height: 120 }} />;
  if (!stats.ready) {
    return <p style={{ fontSize: 13, color: "var(--nv-muted, #888)" }}>{stats.hint ?? "Attribution table is not on the database yet."}</p>;
  }
  if (stats.sent === 0) {
    return <p style={{ fontSize: 13, color: "var(--nv-muted, #888)" }}>No reminders sent in the last 28 days. The first send after this ships will show up here.</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 18, marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>
        <Metric label="Sent" value={stats.sent} />
        <Metric label="Tapped" value={stats.opened} sub={stats.sent ? `${Math.round((stats.opened / stats.sent) * 100)}%` : ""} />
        <Metric label="Did a lesson" value={stats.lesson} sub={stats.opened ? `${Math.round((stats.lesson / stats.opened) * 100)}% of taps` : ""} />
      </div>
      {stats.byKind.map((k) => (
        <div key={k.kind} className="nv-kv">
          <div>
            <div className="nv-kv-l">{k.label}</div>
            <div className="nv-kv-d">{k.sent} sent · {k.opened} tapped · {k.lesson} finished a lesson</div>
          </div>
          <div className="nv-kv-v">{k.openRate}%</div>
        </div>
      ))}
      {stats.byCopy.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>Copy that brought people back</div>
          {stats.byCopy.map((c) => (
            <div key={c.title} className="nv-kv">
              <div>
                <div className="nv-kv-l">{c.title}</div>
                <div className="nv-kv-d">{c.sent} sent · {c.opened} tapped · {c.lesson} lessons</div>
              </div>
              <div className="nv-kv-v">{c.openRate}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}{sub ? <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 6, opacity: 0.65 }}>{sub}</span> : null}</div>
    </div>
  );
}
