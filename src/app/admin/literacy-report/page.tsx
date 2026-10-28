"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { DeskSignIn } from "../DeskSignIn";
import {
  fetchView,
  fmt,
  fmtPct,
  type CourseRow,
  type DropoffRow,
  type FunnelRow,
  type Overview,
} from "../analytics/lib";

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
const DOC = "NOTHO-FE-001";

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
        setDropoff(
          (dr ?? [])
            .slice()
            .sort((a, b) => (a.completion_pct ?? 100) - (b.completion_pct ?? 100))
            .slice(0, 6)
        );
        setGate("ok");
        fetchView<Outcomes>("outcomes")
          .then((o) => {
            if (!cancelled) setOutcomes(o);
          })
          .catch((e: Error) => {
            if (!cancelled) setOutcomesError(e.message);
          });
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message;
        setError(msg);
        setGate(msg.includes("admin-only") ? "denied" : "ok");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === "checking") return <main className="sheet"><p>Preparing the measurement record…</p></main>;
  if (gate === "signed-out") {
    return <DeskSignIn onSignedIn={() => window.location.reload()} returnPath="/admin/literacy-report" />;
  }
  if (gate === "denied") return <main className="sheet"><p>{error}</p></main>;

  const when = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  const periodEnd = when;
  const spend = outcomes ? [...outcomes.checks, outcomes.sinceJoining] : [];
  const comparable = spend.reduce((n, c) => n + c.comparable, 0);
  const improved = spend.reduce((n, c) => n + c.improved, 0);
  const finding = findingLine(overview, comparable, improved);

  return (
    <>
      <style>{css}</style>
      <div className="toolbar no-print">
        <button type="button" onClick={() => window.print()}>Save PDF</button>
        <Link href="/admin/analytics">Desk</Link>
        <span>Send the PDF. Do not attach the People export.</span>
      </div>
      <article className="sheet">
        <header className="mast">
          <img src="/notho-icon-192.png" alt="" width={42} height={42} />
          <div>
            <p className="brand">Notho</p>
            <p className="meta">{DOC} · Measurement record · Aggregates only</p>
          </div>
        </header>

        <h1>Financial education measurement record</h1>
        <p className="lede">
          Prepared for the illustrative seat, Notho. Cohort {COHORT} is every Notho account until a
          partner seat exists. Period: 90 days ending {periodEnd}. Prepared by The Solution Org (Pty)
          Ltd, which operates Notho and is not an FSP.
        </p>

        <div className="finding">
          <p className="eyebrow">Finding</p>
          <p>{finding}</p>
        </div>

        <Section n="1" title="The initiative">
          <p>
            Name: Notho Money Basics and budget practice. Objective, matched to Conduct Standard 1 of
            2025 section 4: help a person tell a need from a want, finish the basics course, and keep a
            budget so they can manage money more sustainably.
          </p>
          <p>
            Target group: natural persons using Notho. On a partner seat this line becomes that firm’s
            named group. Delivery: the Notho app, lessons, review, calculator and budget. The platform
            is appropriate for a phone-first audience. Content is objective instruction. It is not a
            campaign for a specific financial product, and this record does not sell one.
          </p>
        </Section>

        <Section n="2" title="Governance">
          <p>
            The institution keeps responsibility for the initiative. Notho is the service provider: it
            supplies the content, the platform, and this measurement. Oversight is the Notho Desk,
            restricted to admins. This record is the pre- and post-implementation view a governing body
            can read. The FSCA has not yet prescribed the reporting form under section 9, so this is
            not a filing.
          </p>
        </Section>

        <Section n="3" title="What is measured, and why">
          <p>
            Section 6 requires outcomes that can show effectiveness and, to the extent possible, impact.
            Each measure below is tied to the objective. A blank is reported as a blank.
          </p>
          <table>
            <thead>
              <tr>
                <th>Outcome</th>
                <th>Measure</th>
                <th>This period</th>
                <th>Reading</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Reach</td>
                <td>Accounts on the seat</td>
                <td>{fmt(overview?.totalUsers)}</td>
                <td>The people the initiative could reach.</td>
              </tr>
              <tr>
                <td>Effectiveness</td>
                <td>Finished at least one lesson</td>
                <td>{fmt(overview?.activatedUsers)} · {fmtPct(overview?.activationRate)}</td>
                <td>Instruction only counts once a lesson is finished.</td>
              </tr>
              <tr>
                <td>Knowledge</td>
                <td>First-try accuracy, 90 days</td>
                <td>{fmtPct(overview?.firstTryAccuracy)}</td>
                <td>Retry accuracy is not used. It is inflated by practice.</td>
              </tr>
              <tr>
                <td>Retention of the habit</td>
                <td>Active on two or more days</td>
                <td>{fmtPct(overview?.returningShare)}</td>
                <td>One visit is a trial. Two is the start of a skill.</td>
              </tr>
              <tr>
                <td>Impact</td>
                <td>Want share of day-to-day spend, before and after</td>
                <td>{comparable ? `${improved} of ${comparable} comparable improved` : "Not enough budget rows"}</td>
                <td>Only where both windows have real classified spend. Not causal.</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n="4" title="Effectiveness">
          <p>
            {fmt(overview?.activeUsers)} people were active in the 90 days. {fmt(overview?.lessonsInWindow)} lessons
            were finished in the window. {fmt(overview?.answers)} answers were recorded.
          </p>
          <table>
            <thead>
              <tr><th>Step</th><th>People</th><th>Of accounts</th><th>Drop from previous</th></tr>
            </thead>
            <tbody>
              {funnel.map((s) => (
                <tr key={s.step_key}>
                  <td>{s.label}</td>
                  <td>{fmt(s.users)}</td>
                  <td>{fmtPct(s.pct)}</td>
                  <td>{s.drop_pct == null ? "—" : fmtPct(s.drop_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr><th>Course</th><th>Learners</th><th>Lessons</th><th>First-try</th></tr>
            </thead>
            <tbody>
              {courses.slice(0, 8).map((c) => (
                <tr key={c.course_id}>
                  <td>{c.course_id}</td>
                  <td>{fmt(c.learners)}</td>
                  <td>{fmt(c.lessons_taken)}</td>
                  <td>{fmtPct(c.first_try_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section n="5" title="Impact, to the extent possible">
          <p>
            {outcomes?.coverage.classifiedNote} {fmt(outcomes?.coverage.budgetUsers)} people have budget rows.
            A person counts only when both windows have 14 days, 4 expense rows and R200 of classified spend,
            and the want share moves by at least 3 points. Transfers, debt and savings are excluded. Budget
            rows are what the person entered, not a bank feed.
          </p>
          {outcomesError && <p>This line could not be loaded: {outcomesError}</p>}
          <table>
            <thead>
              <tr>
                <th>Check</th><th>Finished</th><th>Comparable</th><th>Improved</th><th>Worsened</th><th>Median want share</th>
              </tr>
            </thead>
            <tbody>
              {spend.length === 0 ? (
                <tr><td colSpan={6}>Waiting on the spending line.</td></tr>
              ) : (
                spend.map((c) => (
                  <tr key={c.id}>
                    <td>{c.label}</td>
                    <td>{fmt(c.finished)}</td>
                    <td>{fmt(c.comparable)}</td>
                    <td>{fmt(c.improved)}</td>
                    <td>{fmt(c.worsened)}</td>
                    <td>{c.medianWantShareDeltaPp == null ? "—" : `${c.medianWantShareDeltaPp} pp`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Section>

        <Section n="6" title="Evaluation, and the next run">
          <p>
            Section 7 asks for effectiveness, areas for improvement, and data the next programme can use.
            The lessons below were started and finished least often. Rewrite those. Do not contact the people.
          </p>
          <table>
            <thead>
              <tr><th>Lesson</th><th>Starts</th><th>Finished</th><th>Completion</th></tr>
            </thead>
            <tbody>
              {dropoff.length === 0 ? (
                <tr><td colSpan={4}>No drop-off rows in this window.</td></tr>
              ) : (
                dropoff.map((d) => (
                  <tr key={d.lesson_id}>
                    <td>{d.lesson_id}</td>
                    <td>{fmt(d.starts)}</td>
                    <td>{fmt(d.completions)}</td>
                    <td>{fmtPct(d.completion_pct)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p>
            {fmt(overview?.atRiskUsers)} people who finished a lesson have been quiet for 7 to 30 days.
            {fmt(overview?.dormantUsers)} have been quiet for 30 days or more. The retention move is one
            resume of the last course, then stop.
          </p>
        </Section>

        <Section n="7" title="Limits">
          <p>
            No control group, so a change in spend is not proof the lesson caused it. No bank feed. No
            names and no emails on this record. Cohort {COHORT} is every account, not a firm’s employees,
            until a partner seat is cut. This document does not certify Conduct Standard 1 compliance.
            The institution still owns the plan, the oversight, and any filing.
          </p>
        </Section>

        <footer>
          <span>{DOC}</span>
          <span>Prepared {when}</span>
          <span>Internal</span>
        </footer>
      </article>
    </>
  );
}

function findingLine(overview: Overview | null, comparable: number, improved: number): string {
  if (!overview) return "The seat numbers have not loaded.";
  const knowledge =
    overview.firstTryAccuracy == null
      ? "First-try accuracy is not yet available."
      : `First-try accuracy is ${overview.firstTryAccuracy}%.`;
  const impact = comparable
    ? `${improved} of ${comparable} comparable spending windows improved on want share.`
    : "Impact on spending cannot be read yet: not enough people have a lesson and a comparable budget.";
  return `${overview.activatedUsers} of ${overview.totalUsers} accounts have finished a lesson. ${knowledge} ${impact}`;
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2><span>{n}</span>{title}</h2>
      {children}
    </section>
  );
}

const css = `
  .toolbar { display: flex; gap: 10px; align-items: center; max-width: 820px; margin: 18px auto 0; padding: 0 20px; font: 13px system-ui, sans-serif; color: #5c6e78; }
  .toolbar button, .toolbar a { border: 1px solid #c5d2d8; border-radius: 8px; padding: 8px 12px; background: white; color: #102027; text-decoration: none; }
  .sheet { max-width: 820px; margin: 18px auto 48px; padding: 36px 40px 28px; background: white; color: #102027; font: 14.5px/1.55 Georgia, "Iowan Old Style", serif; }
  .mast { display: flex; gap: 12px; align-items: center; margin-bottom: 22px; }
  .mast img { width: 42px; height: 42px; }
  .brand { margin: 0; font: 700 15px system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #007A85; }
  .meta { margin: 2px 0 0; font: 12px system-ui, sans-serif; color: #5c6e78; }
  h1 { font-size: 28px; line-height: 1.15; margin: 0 0 8px; font-weight: 600; }
  .lede { margin: 0 0 18px; color: #3d515b; }
  .finding { border-left: 3px solid #007A85; padding: 4px 0 4px 14px; margin: 0 0 22px; }
  .eyebrow { margin: 0; font: 700 11px system-ui, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: #007A85; }
  .finding p:last-child { margin: 4px 0 0; font-size: 16px; }
  section { margin-top: 22px; }
  h2 { font: 700 15px system-ui, sans-serif; margin: 0 0 8px; }
  h2 span { color: #007A85; margin-right: 8px; }
  p { margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 4px; font: 13px/1.4 system-ui, sans-serif; }
  th { text-align: left; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: #5c6e78; border-bottom: 1px solid #d7e0e4; padding: 6px 6px 6px 0; }
  td { border-bottom: 1px solid #eef2f4; padding: 7px 6px 7px 0; vertical-align: top; }
  footer { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 10px; border-top: 1px solid #d7e0e4; font: 11px system-ui, sans-serif; color: #5c6e78; letter-spacing: 0.04em; text-transform: uppercase; }
  @media print {
    .no-print { display: none !important; }
    .sheet { margin: 0; max-width: none; padding: 0; }
    body { background: white; }
  }
`;
