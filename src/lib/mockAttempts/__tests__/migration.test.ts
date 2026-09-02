import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260901140000_re5_mock_attempts.sql"),
  "utf8"
);

describe("canonical RE5 mock-attempt migration", () => {
  it("uses one server-owned lifecycle with a fixed deadline and durable state", () => {
    expect(sql).toContain("create table public.mock_attempts");
    expect(sql).toContain("create table public.mock_attempt_questions");
    expect(sql).toContain("create table public.mock_attempt_mutations");
    expect(sql).toContain("MOCK_ATTEMPT_INVALID: mutation id reused");
    expect(sql).toContain("expires_at               timestamptz not null");
    expect(sql).toContain("state_version            bigint not null default 0");
    expect(sql).toContain("viewed                    boolean not null default false");
    expect(sql).toContain("flagged                   boolean not null default false");
    expect(sql).toContain("answered_option_id        uuid");
    expect(sql).toContain("v_now + interval '2 hours'");
  });

  it("marks transactionally, gates learner submission and finalizes expiry", () => {
    expect(sql).toContain("create function public.submit_mock_attempt");
    expect(sql).toContain("for update");
    expect(sql).toContain("MOCK_ATTEMPT_NOT_ALL_VIEWED");
    expect(sql).toContain("answered_option_id = correct_option_id");
    expect(sql).toContain("submission_reason = case when v_timed_out");
    expect(sql).toContain("perform public.submit_mock_attempt(p_user_id, v_attempt_id)");
    expect(sql).toContain("perform public.submit_mock_attempt(p_user_id, p_attempt_id)");
    expect(sql).toContain("lesson_results_mock_attempt_idx");
    expect(sql.match(/v_now := clock_timestamp\(\);/g)).toHaveLength(3);
  });

  it("keeps private content and mutations inaccessible to browser roles", () => {
    for (const table of [
      "mock_attempts",
      "mock_attempt_questions",
      "mock_attempt_mutations",
      "mock_exam_audit_log",
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(
        `revoke all on public.${table} from public, anon, authenticated, service_role`
      );
    }
    expect(sql).toContain(
      "revoke all on sequence public.mock_exam_audit_log_id_seq"
    );
    expect(sql).toContain("correct_option_id         uuid not null");
    expect(sql).toContain("explanation               text not null");
    expect(sql).toContain(
      "grant execute on function public.submit_mock_attempt(uuid, uuid) to service_role"
    );
    expect(sql).not.toMatch(/grant execute on function public\.submit_mock_attempt[^;]+authenticated/);
  });

  it("blocks the legacy client result paths for both secure mock IDs", () => {
    expect(sql).toContain('drop policy if exists "Users insert own lesson results"');
    expect(sql).toContain('drop policy if exists "Users insert own question attempts"');
    expect(sql.match(/lesson_id in \('re5-mock-a', 're5-mock-b'\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(sql).toContain("mock_attempt_id uuid references public.mock_attempts(id)");
    expect(sql).toContain("lesson_results_mock_attempt_scope_chk");
    expect(sql).toContain("and mock_attempt_id is null");
    expect(sql).not.toContain("insert into public.question_attempts");
  });
});
