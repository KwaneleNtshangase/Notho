"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { DeskSignIn } from "../DeskSignIn";
import { fetchView, fmt, fmtPct, type CourseRow, type DropoffRow, type FunnelRow, type Overview } from "../analytics/lib";

type OutcomeSummary = {
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
};

type Outcomes = {
  checks: OutcomeSummary[];
  sinceJoining: OutcomeSummary;
  coverage: { budgetUsers: number; lessonUsers: number; classifiedNote: string };
};

const COHORT = "notho-all";

export default function LiteracyReportPage() {
  const [gate, setGate] = useState<"checking" | "ok" | "signed-out" | "denied">("checking");
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [dropoff, setDropoff] = useState<DropoffRow[]>([]);
  const [outcomes, setOutcomes] = useState<Outcomes | null>(null);
  const [outcomesError, setOutcomesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setGate("signed-out");
        return;
      }
      try {
        const [ov, fn, co, dr] = await Promise.all([
          fetchView<Overview>("overview", { days: 90 }),
          fetchView<FunnelRow[]>("funnel"),
          fetchView<CourseRow[]>("courses", { days: 90 }),
          fetchView<DropoffRow[]>("dropoff", { days: 90 }),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setFunnel(fn ?? []);
        setCourses(co ?? []);
        setDropoff((dr ?? []).slice().sort((a, b) => (a.completion_pct ?? 100) - (b.completion_pct ?? 100)).slice(0, 8));
        setGate("ok");
        fetchView<Outcomes>("outcomes")
          .then((o) => { if (!cancelled) setOutcomes(o); })
          .catch((e: Error) => { if (!cancelled) setOutcomesError(e.message); });
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message;
        setError(msg);
        setGate(msg.includes("admin-only") ? "denied" : "ok");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (gate === "checking") return <main style={page}><p>Loading the seat report…</p></main>;
  if (gate === "signed-out") return <DeskSignIn onSignedIn={() => window.location.reload()} returnPath="/admin/literacy-report" />;
  if (gate === "denied") return <main style={page}><p>{error}</p></main>;

  const when = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main style={page}>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button type="button" onClick={() => window.print()} style={btn}>Save PDF</button>
        <Link href="/admin/analytics" style={btn}>Desk</Link>
      </div>

      <p style={kicker}>Illustrative seat · cohort {COHORT} · not an FSCA filing</p>
      <h1 style={{ fontSize: 28, margin: "6px 0 4px" }}>Financial education measurement</h1>
      <p style={sub}>Notho as the institution. Every Notho account as the seat. Prepared {when} for internal use. Partner cohorts replace {COHORT} when a firm is on a seat. No names or emails are on this page.</p>

      <Section title="1. Initiative">
        <p>Objective: help people tell a need from a want, finish Money Basics, and keep a budget. Delivery is the Notho app (lessons, review, calculator, budget). This report measures that objective. It is not product marketing.</p>
      </Section>

      <Section title="2. Reach, last 90 days">
        <Grid>
          <Stat label="Accounts" value={fmt(overview?.totalUsers)} />
          <Stat label="Finished a lesson" value={fmt(overview?.activatedUsers)} hint={fmtPct(overview?.activationRate)} />
          <Stat label="Active" value={fmt(overview?.activeUsers)} />
          <Stat label="Lessons in window" value={fmt(overview?.lessonsInWindow)} />
          <Stat label="First-try accuracy" value={fmtPct(overview?.firstTryAccuracy)} />
          <Stat label="Came back" value={fmtPct(overview?.returningShare)} hint="Active on 2+ days" />
        </Grid>
      </Section>

      <Section title="3. Effectiveness">
        <p>Effectiveness is lessons finished and answers retained. First-try accuracy is the knowledge line. Overall accuracy is higher because people can retry.</p>
        <Table
          headers={["Step", "People", "Of accounts", "Drop from previous"]}
          rows={funnel.map((s) => [s.label, fmt(s.users), fmtPct(s.pct), s.drop_pct == null ? "—" : fmtPct(s.drop_pct)])}
        />
        <Table
          headers={["Course", "Learners", "Lessons", "First-try"]}
          rows={courses.slice(0, 8).map((c) => [c.course_id, fmt(c.learners), fmt(c.lessons_taken), fmtPct(c.first_try_pct)])}
        />
      </Section>

      <Section title="4. Impact, where a budget exists">
        <p>{outcomes?.coverage.classifiedNote ?? "Spending is only counted when both windows have real classified rows."} {fmt(outcomes?.coverage.budgetUsers)} people have budget rows. A move in want share is an association, not proof the lesson caused it. Budget rows are what the person entered.</p>
        {outcomesError && <p>Spending line could not load: {outcomesError}</p>}
        {outcomes && (
          <Table
            headers={["Check", "Finished", "Comparable", "Improved", "Worsened", "Median want share"]}
            rows={[...outcomes.checks, outcomes.sinceJoining].map((c) => [
              c.label,
              fmt(c.finished),
              fmt(c.comparable),
              fmt(c.improved),
              fmt(c.worsened),
              c.medianWantShareDeltaPp == null ? "—" : `${c.medianWantShareDeltaPp} pp`,
            ])}
          />
        )}
      </Section>

      <Section title="5. Where to improve the next run">
        <p>Lowest completion in the window. Use this to rewrite a lesson, not to contact a person.</p>
        <Table
          headers={["Lesson", "Starts", "Finished", "Completion"]}
          rows={dropoff.map((d) => [d.lesson_id, fmt(d.starts), fmt(d.completions), fmtPct(d.completion_pct)])}
        />
        <p>{fmt(overview?.atRiskUsers)} people with a lesson are quiet for 7–30 days. {fmt(overview?.dormantUsers)} have been quiet for 30 days or more. One resume nudge, then stop.</p>
      </Section>

      <Section title="6. What this is not">
        <p>Not a Conduct Standard 1 of 2025 submission. The institution still owns the plan, the governance, and the filing. No control group. No bank feed. Cohort {COHORT} is every account until a partner seat exists. Do not attach the People export to this report.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>{title}</h2>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#1c2830" }}>{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>{children}</div>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ border: "1px solid #d7e0e4", borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5c6e78" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "#5c6e78" }}>{hint}</div>}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (!rows.length) return <p>No rows yet.</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 13 }}>
      <thead>
        <tr>{headers.map((h) => <th key={h} style={th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} style={td}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

const page: React.CSSProperties = { maxWidth: 820, margin: "32px auto", padding: "0 20px 48px", color: "#102027", fontFamily: "Georgia, serif" };
const kicker: React.CSSProperties = { fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#007A85", fontFamily: "system-ui, sans-serif" };
const sub: React.CSSProperties = { fontSize: 13.5, color: "#3d515b", lineHeight: 1.5 };
const btn: React.CSSProperties = { border: "1px solid #c5d2d8", borderRadius: 8, padding: "8px 12px", background: "white", color: "#102027", textDecoration: "none", fontFamily: "system-ui, sans-serif", fontSize: 13 };
const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #d7e0e4", padding: "6px 4px", fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" };
const td: React.CSSProperties = { borderBottom: "1px solid #eef2f4", padding: "6px 4px" };
