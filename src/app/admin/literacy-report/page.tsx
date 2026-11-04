"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

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

  if (gate === "checking") return <main className="sheet"><p><I18nText source={"Preparing the measurement record…"} /></p></main>;
  if (gate === "signed-out") {
    return <DeskSignIn onSignedIn={() => window.location.reload()} returnPath="/admin/literacy-report" />;
  }
  if (gate === "denied") return <main className="sheet"><p><I18nText>{error}</I18nText></p></main>;

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
        <button type="button" onClick={() => window.print()}><I18nText source={"Save PDF"} /></button>
        <Link href="/admin/analytics"><I18nText source={"Desk"} /></Link>
        <span><I18nText source={"Send the PDF. Do not attach the People export."} /></span>
      </div>
      <article className="sheet">
        <header className="mast">
          <I18nElement as="img" src="/notho-icon-192.png" alt="" width={42} height={42} />
          <div>
            <p className="brand"><I18nText source={"Notho"} /></p>
            <p className="meta"><I18nText source={"{value0} · Measurement record · Aggregates only"} values={[DOC]} /></p>
          </div>
        </header>

        <h1><I18nText source={"Financial education measurement record"} /></h1>
        <p className="lede"><I18nText source={"Prepared for the illustrative seat, Notho. Cohort {value0} is every Notho account until a partner seat exists. Period: 90 days ending {value1}. Prepared by The Solution Org (Pty) Ltd, which operates Notho and is not an FSP."} values={[COHORT, periodEnd]} /></p>

        <div className="finding">
          <p className="eyebrow"><I18nText source={"Finding"} /></p>
          <p><I18nText>{finding}</I18nText></p>
        </div>

        <Section n="1" title="The initiative">
          <p><I18nText source={"Name: Notho Money Basics and budget practice. Objective, matched to Conduct Standard 1 of 2025 section 4: help a person tell a need from a want, finish the basics course, and keep a budget so they can manage money more sustainably."} /></p>
          <p><I18nText source={"Target group: natural persons using Notho. On a partner seat this line becomes that firm’s named group. Delivery: the Notho app, lessons, review, calculator and budget. The platform is appropriate for a phone-first audience. Content is objective instruction. It is not a campaign for a specific financial product, and this record does not sell one."} /></p>
        </Section>

        <Section n="2" title="Governance">
          <p><I18nText source={"The institution keeps responsibility for the initiative. Notho is the service provider: it supplies the content, the platform, and this measurement. Oversight is the Notho Desk, restricted to admins. This record is the pre- and post-implementation view a governing body can read. The FSCA has not yet prescribed the reporting form under section 9, so this is not a filing."} /></p>
        </Section>

        <Section n="3" title="What is measured, and why">
          <p><I18nText source={"Section 6 requires outcomes that can show effectiveness and, to the extent possible, impact. Each measure below is tied to the objective. A blank is reported as a blank."} /></p>
          <table>
            <thead>
              <tr>
                <th><I18nText source={"Outcome"} /></th>
                <th><I18nText source={"Measure"} /></th>
                <th><I18nText source={"This period"} /></th>
                <th><I18nText source={"Reading"} /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><I18nText source={"Reach"} /></td>
                <td><I18nText source={"Accounts on the seat"} /></td>
                <td><I18nText>{fmt(overview?.totalUsers)}</I18nText></td>
                <td><I18nText source={"The people the initiative could reach."} /></td>
              </tr>
              <tr>
                <td><I18nText source={"Effectiveness"} /></td>
                <td><I18nText source={"Finished at least one lesson"} /></td>
                <td><I18nText>{fmt(overview?.activatedUsers)}</I18nText> · <I18nText>{fmtPct(overview?.activationRate)}</I18nText></td>
                <td><I18nText source={"Instruction only counts once a lesson is finished."} /></td>
              </tr>
              <tr>
                <td><I18nText source={"Knowledge"} /></td>
                <td><I18nText source={"First-try accuracy, 90 days"} /></td>
                <td><I18nText>{fmtPct(overview?.firstTryAccuracy)}</I18nText></td>
                <td><I18nText source={"Retry accuracy is not used. It is inflated by practice."} /></td>
              </tr>
              <tr>
                <td><I18nText source={"Retention of the habit"} /></td>
                <td><I18nText source={"Active on two or more days"} /></td>
                <td><I18nText>{fmtPct(overview?.returningShare)}</I18nText></td>
                <td><I18nText source={"One visit is a trial. Two is the start of a skill."} /></td>
              </tr>
              <tr>
                <td><I18nText source={"Impact"} /></td>
                <td><I18nText source={"Want share of day-to-day spend, before and after"} /></td>
                <td><I18nText>{comparable ? `${improved} of ${comparable} comparable improved` : "Not enough budget rows"}</I18nText></td>
                <td><I18nText source={"Only where both windows have real classified spend. Not causal."} /></td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n="4" title="Effectiveness">
          <p><I18nText source={"{value0} people were active in the 90 days. {value1} lessons were finished in the window. {value2} answers were recorded."} values={[fmt(overview?.activeUsers), fmt(overview?.lessonsInWindow), fmt(overview?.answers)]} preserveValues={[true,false,false]} /></p>
          <table>
            <thead>
              <tr><th><I18nText source={"Step"} /></th><th><I18nText source={"People"} /></th><th><I18nText source={"Of accounts"} /></th><th><I18nText source={"Drop from previous"} /></th></tr>
            </thead>
            <tbody>
              {funnel.map((s) => (
                <tr key={s.step_key}>
                  <td><I18nText>{s.label}</I18nText></td>
                  <td><I18nText>{fmt(s.users)}</I18nText></td>
                  <td><I18nText>{fmtPct(s.pct)}</I18nText></td>
                  <td><I18nText>{s.drop_pct == null ? "—" : fmtPct(s.drop_pct)}</I18nText></td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr><th><I18nText source={"Course"} /></th><th><I18nText source={"Learners"} /></th><th><I18nText source={"Lessons"} /></th><th><I18nText source={"First-try"} /></th></tr>
            </thead>
            <tbody>
              {courses.slice(0, 8).map((c) => (
                <tr key={c.course_id}>
                  <td><I18nText>{c.course_id}</I18nText></td>
                  <td><I18nText>{fmt(c.learners)}</I18nText></td>
                  <td><I18nText>{fmt(c.lessons_taken)}</I18nText></td>
                  <td><I18nText>{fmtPct(c.first_try_pct)}</I18nText></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section n="5" title="Impact, to the extent possible">
          <p><I18nText source={"{value0} {value1} people have budget rows. A person counts only when both windows have 14 days, 4 expense rows and R200 of classified spend, and the want share moves by at least 3 points. Transfers, debt and savings are excluded. Budget rows are what the person entered, not a bank feed."} values={[outcomes?.coverage.classifiedNote, fmt(outcomes?.coverage.budgetUsers)]} preserveValues={[false,true]} /></p>
          {outcomesError && <p><I18nText source={"This line could not be loaded: {value0}"} values={[outcomesError]} /></p>}
          <table>
            <thead>
              <tr>
                <th><I18nText source={"Check"} /></th><th><I18nText source={"Finished"} /></th><th><I18nText source={"Comparable"} /></th><th><I18nText source={"Improved"} /></th><th><I18nText source={"Worsened"} /></th><th><I18nText source={"Median want share"} /></th>
              </tr>
            </thead>
            <tbody>
              {spend.length === 0 ? (
                <tr><td colSpan={6}><I18nText source={"Waiting on the spending line."} /></td></tr>
              ) : (
                spend.map((c) => (
                  <tr key={c.id}>
                    <td><I18nText>{c.label}</I18nText></td>
                    <td><I18nText>{fmt(c.finished)}</I18nText></td>
                    <td><I18nText>{fmt(c.comparable)}</I18nText></td>
                    <td><I18nText>{fmt(c.improved)}</I18nText></td>
                    <td><I18nText>{fmt(c.worsened)}</I18nText></td>
                    <td><I18nText>{c.medianWantShareDeltaPp == null ? "—" : `${c.medianWantShareDeltaPp} pp`}</I18nText></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Section>

        <Section n="6" title="Evaluation, and the next run">
          <p><I18nText source={"Section 7 asks for effectiveness, areas for improvement, and data the next programme can use. The lessons below were started and finished least often. Rewrite those. Do not contact the people."} /></p>
          <table>
            <thead>
              <tr><th><I18nText source={"Lesson"} /></th><th><I18nText source={"Starts"} /></th><th><I18nText source={"Finished"} /></th><th><I18nText source={"Completion"} /></th></tr>
            </thead>
            <tbody>
              {dropoff.length === 0 ? (
                <tr><td colSpan={4}><I18nText source={"No drop-off rows in this window."} /></td></tr>
              ) : (
                dropoff.map((d) => (
                  <tr key={d.lesson_id}>
                    <td><I18nText>{d.lesson_id}</I18nText></td>
                    <td><I18nText>{fmt(d.starts)}</I18nText></td>
                    <td><I18nText>{fmt(d.completions)}</I18nText></td>
                    <td><I18nText>{fmtPct(d.completion_pct)}</I18nText></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p><I18nText source={"{value0} people who finished a lesson have been quiet for 7 to 30 days.{value1} have been quiet for 30 days or more. The retention move is one resume of the last course, then stop."} values={[fmt(overview?.atRiskUsers), fmt(overview?.dormantUsers)]} preserveValues={[true,true]} /></p>
        </Section>

        <Section n="7" title="Limits">
          <p><I18nText source={"No control group, so a change in spend is not proof the lesson caused it. No bank feed. No names and no emails on this record. Cohort {value0} is every account, not a firm’s employees, until a partner seat is cut. This document does not certify Conduct Standard 1 compliance. The institution still owns the plan, the oversight, and any filing."} values={[COHORT]} /></p>
        </Section>

        <footer>
          <span><I18nText>{DOC}</I18nText></span>
          <span><I18nText source={"Prepared {value0}"} values={[when]} /></span>
          <span><I18nText source={"Internal"} /></span>
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
      <h2><span><I18nText>{n}</I18nText></span><I18nText>{title}</I18nText></h2>
      <I18nText>{children}</I18nText>
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
