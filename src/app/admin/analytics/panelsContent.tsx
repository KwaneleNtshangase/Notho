"use client";

/**
 * CONTENT - which lessons and which individual questions to change.
 *
 * Everything here is scored on FIRST-TRY accuracy. Overall accuracy is
 * meaningless in this app: the mastery loop makes people retry until they are
 * correct, so given enough attempts every lesson trends to 100% and the chart
 * turns into a flat line that says nothing.
 */

import React, { useMemo } from "react";
import { CartesianGrid, Cell, ReferenceArea, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts";
import {
  ago,
  downloadCsv,
  fmt,
  fmtPct,
  type ContentRow,
  type CourseRow,
  type QuestionRow,
} from "./lib";
import { usePalette } from "./theme";
import {
  Btn,
  DataTable,
  Gate,
  Note,
  Panel,
  Stat,
  StatGrid,
  Tag,
  useView,
  type Column,
} from "./ui";
import { Frame, ThemedTooltip, axis } from "./charts";

export function ContentPanel({ days, nonce }: { days: number; nonce: number }) {
  const p = usePalette();
  // Content needs a longer memory than the rest of the dashboard: a lesson only
  // becomes judgeable once enough people have answered it, and seven days of
  // answers on a small user base is noise, not difficulty.
  const window = Math.max(days, 90);
  const c = useView<ContentRow[]>("content", { days: window }, nonce);
  const q = useView<QuestionRow[]>("questions", { days: Math.max(window, 180), minAttempts: 4 }, nonce);
  const courses = useView<CourseRow[]>("courses", { days: window }, nonce);

  const rows = useMemo(() => c.data ?? [], [c.data]);
  const questions = useMemo(() => q.data ?? [], [q.data]);

  const stats = useMemo(() => {
    const tooHard = rows.filter((r) => (r.first_try_pct ?? 100) < 40).length;
    const tooEasy = rows.filter((r) => (r.first_try_pct ?? 0) > 95).length;
    const good = rows.filter(
      (r) => (r.first_try_pct ?? 0) >= 55 && (r.first_try_pct ?? 0) <= 95
    ).length;
    const broken = questions.filter((x) => (x.first_try_pct ?? 100) < 25).length;
    return { tooHard, tooEasy, good, broken };
  }, [rows, questions]);

  const scatter = rows
    .filter((r) => r.first_try_pct != null)
    .map((r) => ({
      x: r.first_try_pct as number,
      y: r.learners,
      z: r.attempts,
      name: `${r.course_id} / ${r.lesson_id}`,
      verdict: r.verdict,
    }));

  const lessonColumns: Column<ContentRow>[] = [
    { key: "lesson", label: "Lesson", render: (r) => <span className="nv-strong">{r.lesson_id}</span> },
    { key: "course", label: "Course", render: (r) => <span style={{ color: p.muted }}>{r.course_id}</span> },
    { key: "learners", label: "Learners", numeric: true, render: (r) => fmt(r.learners) },
    { key: "attempts", label: "Answers", numeric: true, render: (r) => fmt(r.attempts) },
    {
      key: "first",
      label: "First-try correct",
      numeric: true,
      render: (r) => (
        <span style={{ fontWeight: 700, color: bandColor(r.first_try_pct, p) }}>
          {fmtPct(r.first_try_pct)}
        </span>
      ),
    },
    { key: "tries", label: "Avg tries", numeric: true, render: (r) => r.avg_attempts },
    {
      key: "verdict",
      label: "Verdict",
      render: (r) => <Tag tone={verdictTone(r.verdict)}>{r.verdict}</Tag>,
    },
  ];

  const questionColumns: Column<QuestionRow>[] = [
    {
      key: "q",
      label: "Question",
      render: (r) => (
        <div>
          <div className="nv-strong">
            {r.lesson_id} · {r.slot_id}
          </div>
          <div style={{ fontSize: 11.5, color: p.muted }}>
            {r.course_id} · variant {r.variant_id}
            {r.concept_id ? ` · ${r.concept_id}` : ""}
          </div>
        </div>
      ),
    },
    { key: "attempts", label: "Answers", numeric: true, render: (r) => fmt(r.attempts) },
    { key: "learners", label: "Learners", numeric: true, render: (r) => fmt(r.learners) },
    {
      key: "first",
      label: "First-try",
      numeric: true,
      render: (r) => (
        <span style={{ fontWeight: 700, color: bandColor(r.first_try_pct, p) }}>
          {fmtPct(r.first_try_pct)}
        </span>
      ),
    },
    { key: "overall", label: "Eventually right", numeric: true, render: (r) => fmtPct(r.overall_pct) },
    { key: "tries", label: "Avg tries", numeric: true, render: (r) => r.avg_attempts },
    { key: "verdict", label: "Verdict", render: (r) => <Tag tone={verdictTone(r.verdict)}>{r.verdict}</Tag> },
  ];

  return (
    <div className="nv-stack">
      <StatGrid>
        <Stat
          label="Lessons measured"
          value={fmt(rows.length)}
          accent={p.blue}
          hint="With enough answers in this window to judge."
        />
        <Stat
          label="Too hard"
          value={fmt(stats.tooHard)}
          accent={stats.tooHard ? p.red : p.green}
          invertTrend
          hint="Under 40% first-try. Usually a wording problem, not a concept problem."
        />
        <Stat
          label="Well pitched"
          value={fmt(stats.good)}
          accent={p.green}
          hint="In the 55-95% first-try band - hard enough to teach, easy enough to continue."
        />
        <Stat
          label="Too easy"
          value={fmt(stats.tooEasy)}
          accent={stats.tooEasy ? p.gold : p.green}
          invertTrend
          hint="Over 95% first-try. Free marks teach nothing."
        />
        <Stat
          label="Questions to check"
          value={fmt(stats.broken)}
          accent={stats.broken ? p.red : p.green}
          invertTrend
          hint="Individual questions under 25% first-try - below chance on a four-option question."
        />
      </StatGrid>

      <Panel
        title="Every lesson, pitched against difficulty"
        subtitle={`Last ${window} days. First-try accuracy across the bottom, how many learners reached it up the side, bubble size is total answers. The green band is the sweet spot; anything left of it is frustrating and anything right of it is filler.`}
        action={rows.length > 0 && <Btn onClick={() => downloadCsv("content-quality", rows)}>Export CSV</Btn>}
      >
        <Gate
          loading={c.loading && !c.data}
          error={c.error}
          empty={rows.length === 0}
          emptyTitle="Not enough answers yet"
          emptyDetail="A lesson appears here once it has at least five recorded question attempts in the window."
          skeleton={320}
        >
          <Frame height={310}>
            <ScatterChart margin={{ top: 14, right: 22, bottom: 22, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} />
              <ReferenceArea x1={55} x2={95} fill={p.green} fillOpacity={0.08} />
              <XAxis
                type="number"
                dataKey="x"
                name="First-try correct"
                unit="%"
                domain={[0, 100]}
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "First-try correct",
                  position: "insideBottom",
                  offset: -12,
                  fill: p.muted,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Learners"
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ZAxis type="number" dataKey="z" range={[80, 700]} name="Answers" />
              <ThemedTooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatter} name="Lessons">
                {scatter.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={bandColor(entry.x, p)}
                    fillOpacity={0.8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </Frame>
          <div style={{ marginTop: 16 }}>
            <DataTable columns={lessonColumns} rows={rows} maxHeight={430} />
          </div>
        </Gate>
      </Panel>

      <Panel
        title="The edit list"
        subtitle="Individual questions, worst first. Lesson-level scores tell you a lesson is off; this tells you which line to open. Anything under 25% first-try is below guessing on a four-option question, which almost always means the marked answer is wrong or the wording is ambiguous."
        action={questions.length > 0 && <Btn onClick={() => downloadCsv("question-offenders", questions)}>Export CSV</Btn>}
      >
        <Gate
          loading={q.loading && !q.data}
          error={q.error}
          empty={questions.length === 0}
          emptyTitle="No question has enough answers yet"
          emptyDetail="A question needs at least four recorded attempts before it is worth judging."
          skeleton={280}
        >
          <DataTable columns={questionColumns} rows={questions} maxHeight={520} />
          <Note>
            <strong>Work order:</strong> start at the top, open the question, and read it as a
            learner who has just been taught the concept. Fix the wording, then re-check this table
            in a week - the same question should climb into the green band without the lesson
            changing at all.
          </Note>
        </Gate>
      </Panel>

      <Panel
        title="Course engagement"
        subtitle="Which courses people actually reach, and how hard each is proving overall."
        action={(courses.data ?? []).length > 0 && <Btn onClick={() => downloadCsv("courses", courses.data!)}>Export CSV</Btn>}
      >
        <Gate
          loading={courses.loading && !courses.data}
          error={courses.error}
          empty={(courses.data ?? []).length === 0}
          emptyTitle="No course activity in this window"
          skeleton={220}
        >
          <DataTable
            columns={[
              { key: "course", label: "Course", render: (r: CourseRow) => <span className="nv-strong">{r.course_id}</span> },
              { key: "learners", label: "Learners", numeric: true, render: (r: CourseRow) => fmt(r.learners) },
              { key: "lessons", label: "Lessons touched", numeric: true, render: (r: CourseRow) => fmt(r.lessons_taken) },
              { key: "attempts", label: "Answers", numeric: true, render: (r: CourseRow) => fmt(r.attempts) },
              {
                key: "first",
                label: "First-try correct",
                numeric: true,
                render: (r: CourseRow) => (
                  <Tag
                    tone={
                      r.first_try_pct == null
                        ? "neutral"
                        : r.first_try_pct < 50
                        ? "bad"
                        : r.first_try_pct > 90
                        ? "warn"
                        : "good"
                    }
                  >
                    {fmtPct(r.first_try_pct)}
                  </Tag>
                ),
              },
              {
                key: "last",
                label: "Last activity",
                render: (r: CourseRow) => <span style={{ color: p.muted }}>{ago(r.last_activity)}</span>,
              },
            ]}
            rows={courses.data ?? []}
          />
        </Gate>
      </Panel>
    </div>
  );
}

function bandColor(pct: number | null | undefined, p: ReturnType<typeof usePalette>) {
  if (pct == null) return p.muted;
  if (pct < 25) return p.red;
  if (pct < 45) return p.gold;
  if (pct > 95) return p.purple;
  return p.green;
}

function verdictTone(v: string): "good" | "warn" | "bad" | "neutral" {
  if (v.startsWith("Broken") || v.startsWith("Too hard")) return "bad";
  if (v.startsWith("Too easy") || v.startsWith("Easy") || v.startsWith("Challenging")) return "warn";
  if (v === "Well pitched") return "good";
  return "neutral";
}
