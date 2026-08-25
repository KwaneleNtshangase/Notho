import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { RE5_MOCK_EXAMS } from "@/lib/results/re5";

/**
 * Guards on the lesson_results migration.
 *
 * These scores are per-learner exam performance on an FSCA regulatory exam. A
 * policy edit that widens a read is the failure that matters most here and the
 * one least likely to be noticed in review, so the shape of the SQL is pinned
 * the same way the arithmetic is. The reference is
 * supabase/migrations/20260712020000_lock_down_profiles_progress_reads.sql,
 * which exists because a read-all policy on user_progress let any signed-in
 * user enumerate every other user's rows.
 */

const MIGRATIONS = join(process.cwd(), "supabase", "migrations");
const FILE = "20260824120000_lesson_results.sql";
const raw = readFileSync(join(MIGRATIONS, FILE), "utf8");

/**
 * Comments stripped before anything is asserted. The migration explains itself
 * at length, and prose that happens to contain "security definer" or
 * "create policy" must not be able to satisfy — or trip — a check about the
 * SQL that actually runs.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ");
}

const sql = stripComments(raw);
const lower = sql.toLowerCase();

/** `create policy "name" on table for CMD ... using (...) with check (...)` */
function policies(source: string) {
  const re =
    /create\s+policy\s+"([^"]+)"\s+on\s+([a-z_.]+)\s+for\s+(\w+)([\s\S]*?);/gi;
  const out: { name: string; table: string; cmd: string; body: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    out.push({ name: m[1], table: m[2], cmd: m[3].toLowerCase(), body: m[4] });
  }
  return out;
}

describe("lesson_results RLS", () => {
  const own = policies(sql);

  it("enables row level security on the table", () => {
    expect(lower).toContain("alter table public.lesson_results enable row level security");
  });

  it("defines at least a read and a write policy", () => {
    expect(own.length > 1).toBe(true);
    expect(own.some((p) => p.cmd === "select")).toBe(true);
    expect(own.some((p) => p.cmd === "insert")).toBe(true);
  });

  it("scopes every policy to the calling user", () => {
    for (const p of own) {
      expect(p.table).toBe("public.lesson_results");
      expect(p.body.toLowerCase(), `policy "${p.name}" never names auth.uid()`)
        .toContain("auth.uid()");
    }
  });

  it("never grants a read-all", () => {
    for (const p of own.filter((x) => x.cmd === "select")) {
      const using = /using\s*\(([\s\S]*?)\)\s*;?\s*$/i.exec(p.body.trim());
      const clause = (using?.[1] ?? p.body).toLowerCase().replace(/\s+/g, " ");
      expect(clause, `policy "${p.name}" has a permissive USING`).toContain(
        "auth.uid() = user_id"
      );
      expect(clause.includes("true")).toBe(false);
    }
  });

  it("writes WITH CHECK out in full rather than defaulting it from USING", () => {
    // The A7 finding in 20260712000000: an implicit WITH CHECK silently tracks
    // later edits to USING.
    for (const p of own.filter((x) => x.cmd === "insert" || x.cmd === "update")) {
      expect(p.body.toLowerCase(), `policy "${p.name}" has no explicit WITH CHECK`)
        .toContain("with check");
    }
  });

  it("grants no UPDATE or DELETE, so a recorded result cannot be edited", () => {
    expect(own.some((p) => p.cmd === "update" || p.cmd === "delete")).toBe(false);
  });

  it("takes user_id from auth.uid() inside the RPC rather than from the caller", () => {
    expect(lower).toContain("v_user_id uuid := auth.uid()");
    // No p_user_id parameter: a client cannot name the account it writes to.
    expect(lower.includes("p_user_id")).toBe(false);
  });

  it("keeps the RPC SECURITY INVOKER so RLS still applies inside it", () => {
    expect(lower).toContain("security invoker");
    expect(lower.includes("security definer")).toBe(false);
  });

  it("revokes the RPC from anon before granting it to authenticated", () => {
    expect(lower).toContain("revoke all on function public.record_lesson_result");
    expect(lower).toContain("to authenticated");
  });

  it("pins search_path on the RPC", () => {
    expect(lower).toContain("set search_path = public");
  });
});

describe("lesson_results integrity constraints", () => {
  it("cannot store more correct answers than questions", () => {
    expect(lower).toContain("first_try_correct <= total_questions");
  });

  it("ties `passed` to the counts rather than trusting the client", () => {
    expect(lower).toContain("passed = (first_try_correct >= pass_mark_correct)");
  });

  it("keeps one row per sitting", () => {
    expect(lower).toContain("unique (user_id, lesson_id, attempt_no)");
  });
});

describe("the question_attempts backfill", () => {
  it("takes the EARLIEST row per question, which is the first-try outcome", () => {
    // Without DISTINCT ON ordered by answered_at, the mastery loop's re-queued
    // correct answers would be counted and every lesson would read 100%.
    expect(lower).toContain(
      "distinct on (user_id, course_id, lesson_id, attempt_no, slot_id)"
    );
    expect(lower).toContain("answered_at asc");
  });

  it("labels reconstructed rows so the UI can say so", () => {
    expect(lower).toContain("'backfill'");
  });

  it("is idempotent, so a re-run cannot duplicate a sitting", () => {
    expect(lower).toContain("on conflict (user_id, lesson_id, attempt_no) do nothing");
  });

  it("scores a mock exam only when the whole 50-question paper is there", () => {
    // Judging a partial paper against "33 of 50" manufactures a fail out of an
    // abandoned attempt — on the one number a learner may spend money acting on.
    expect(lower).toContain("c.total_questions = c.mock_total_questions");
  });

  it("keeps the SQL's hardcoded mock literals in step with RE5_MOCK_EXAMS", () => {
    // SQL cannot import the TS spec, so the duplication is asserted instead of
    // hoped for. If the FSCA changes the format, this fails loudly.
    const spec = RE5_MOCK_EXAMS["re5-mock-a"];
    expect(lower).toContain(`${spec.totalQuestions} as mock_total_questions`);
    expect(lower).toContain(`${spec.passMarkCorrect} as mock_pass_mark`);
    for (const lessonId of Object.keys(RE5_MOCK_EXAMS)) {
      expect(lower, `${lessonId} is not classified as a mock in the backfill`)
        .toContain(`'${lessonId}'`);
    }
  });

  it("invents no knowledge-area breakdown", () => {
    // conceptId is nullable on question_attempts, so a reconstructed breakdown
    // would be silently partial. Empty is honest; partial-presented-as-whole is not.
    const insert = lower.slice(lower.indexOf("insert into public.lesson_results ("));
    expect(insert).toContain("'[]'::jsonb");
  });

});

describe("no other migration re-opens these reads", () => {
  // Not "this is the only file that mentions lesson_results" — a later
  // migration adding an index is fine. The invariant is that no migration,
  // this one included, ever grants a SELECT on it that is not scoped to
  // auth.uid(). That is the exact regression 20260712020000 had to clean up
  // on user_progress after the leaderboard shipped a read-all policy.
  it("never grants an unscoped SELECT on lesson_results anywhere", () => {
    const offenders: string[] = [];
    for (const f of readdirSync(MIGRATIONS).filter((n) => n.endsWith(".sql"))) {
      const body = stripComments(readFileSync(join(MIGRATIONS, f), "utf8"));
      for (const p of policies(body)) {
        if (p.table !== "public.lesson_results" || p.cmd !== "select") continue;
        if (!p.body.toLowerCase().includes("auth.uid()")) {
          offenders.push(`${f}: "${p.name}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
