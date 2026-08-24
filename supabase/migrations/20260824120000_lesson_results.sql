-- Per-attempt lesson & exam results.
--
-- WHY A MATERIALISED RESULT ROW RATHER THAN AGGREGATING public.question_attempts
-- ==============================================================================
-- Correction first, because an earlier draft of this file got it wrong and a
-- future reader should not re-derive the error: question_attempts DOES cover
-- the two RE5 mock exams. They are bank-backed (src/data/banks/re5-mock-a.ts
-- registers 50 slots under "re5-exam-prep::re5-mock-a"), so resolved steps
-- carry slot_id/variant_id and logQuestionAttempt() fires for every answer.
-- The backfill at the bottom of this file relies on exactly that.
--
-- The log is still the wrong place to READ a score from:
--
-- 1. attempt_no IS DEVICE-LOCAL. It comes from nextAttemptNo(), which reads and
--    increments a localStorage map ("notho-lesson-attempts"). It restarts at 1
--    on a new device, in a private window, or after a storage clear, so
--    (user_id, lesson_id, attempt_no) does not reliably identify one sitting.
--    Two devices silently merge into one "attempt".
--
-- 2. NO COMPLETION EVENT. A row is written per answer, with nothing marking
--    "the learner finished". An abandoned 12-of-50 exam and a completed
--    12-question lesson are both just 12 rows. A score must know it is complete
--    before it is shown — which is why the backfill below will only score a
--    mock exam when all 50 slots are present.
--
-- 3. NO TIME TAKEN, NO PASS MARK, NO KNOWLEDGE-AREA BREAKDOWN. answered_at
--    spans are not a substitute for elapsed time: a learner who walks away
--    mid-paper would clock two hours.
--
-- 4. COST AND STABILITY. The course map renders a grade per lesson; deriving
--    those live means a DISTINCT ON over every answer the learner has ever
--    given, on every render. And a derived number moves when the log's shape
--    changes. A number shown for an FSCA regulatory exam should be recorded
--    once and stay put.
--
-- So question_attempts stays exactly what it is — the per-answer analytics log
-- — and results are recorded explicitly, once, at finalize. The two are
-- reconciled once, by the backfill.

-- SCORE SEMANTICS: FIRST-TRY ACCURACY.
-- src/lib/lessonMastery.ts re-queues every missed question until it is
-- answered correctly, so a lesson can only ever end with 100% of questions
-- eventually correct. The recorded score is therefore
-- (questions never missed on first presentation) / (distinct questions),
-- matching firstTryAccuracy() in that file. `first_try_correct` and
-- `total_questions` are stored as integers so the percentage is reproducible
-- and auditable rather than merely asserted.

create table if not exists public.lesson_results (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  course_id         text not null,
  lesson_id         text not null,
  -- Monotonic per (user, lesson). Assigned server-side by
  -- record_lesson_result() below, NOT by the client's localStorage counter.
  attempt_no        int  not null,
  -- 'exam' rows carry a pass mark and are graded pass/fail; 'lesson' rows are
  -- graded on the accuracy band alone.
  kind              text not null default 'lesson',
  total_questions   int  not null,
  first_try_correct int  not null,
  -- Denormalised for cheap ordering/filtering. Derived, never authoritative:
  -- first_try_correct / total_questions is the source of truth.
  score_pct         int  not null,
  -- Number of correct answers required to pass. NULL for ungraded lessons.
  -- Stored as a COUNT, not a percentage: the RE5 pass mark is "33 of 50", and
  -- a count re-derived from a stored percentage is a floating-point boundary
  -- that rounds up by one for some totals (100 questions at 55% yields 56).
  -- `passed` is then checked against it by CHECK constraint, below.
  pass_mark_correct int,
  passed            boolean,
  duration_seconds  int,
  -- [{ "areaId": "...", "areaLabel": "...", "correct": 7, "total": 9 }, ...]
  area_breakdown    jsonb not null default '[]'::jsonb,
  -- 'live'    — recorded by the app when the learner finished.
  -- 'backfill'— reconstructed from question_attempts by this migration.
  source            text not null default 'live',
  completed_at      timestamptz not null default now(),

  constraint lesson_results_kind_chk
    check (kind in ('lesson', 'exam')),
  constraint lesson_results_source_chk
    check (source in ('live', 'backfill')),
  constraint lesson_results_attempt_no_chk
    check (attempt_no >= 1),
  constraint lesson_results_totals_chk
    check (total_questions >= 0
           and first_try_correct >= 0
           and first_try_correct <= total_questions),
  constraint lesson_results_score_pct_chk
    check (score_pct between 0 and 100),
  constraint lesson_results_pass_mark_chk
    check (pass_mark_correct is null
           or (pass_mark_correct >= 0 and pass_mark_correct <= total_questions)),
  -- passed is meaningful only where a pass mark exists, and must agree with
  -- the counts. The database, not the client, is the last word on "did this
  -- learner pass a regulatory mock exam".
  constraint lesson_results_passed_chk
    check ((pass_mark_correct is null and passed is null)
           or (pass_mark_correct is not null
               and passed = (first_try_correct >= pass_mark_correct))),
  constraint lesson_results_area_breakdown_is_array_chk
    check (jsonb_typeof(area_breakdown) = 'array'),

  -- One row per sitting. Also makes the backfill below idempotent.
  constraint lesson_results_user_lesson_attempt_key
    unique (user_id, lesson_id, attempt_no)
);

create index if not exists lesson_results_user_course_idx
  on public.lesson_results (user_id, course_id);

create index if not exists lesson_results_user_lesson_completed_idx
  on public.lesson_results (user_id, lesson_id, completed_at desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Same shape as user_progress after 20260712000000 /20260712020000: every
-- policy names auth.uid(), read is scoped to the caller's own rows, and there
-- is deliberately NO read-all policy for leaderboards or admin screens. A user
-- must never be able to read another user's scores; anything cross-user goes
-- through a SECURITY DEFINER RPC that aggregates, as get_leaderboard() does.

alter table public.lesson_results enable row level security;

-- Table privileges, stated rather than inherited.
--
-- Supabase's bootstrap sets default privileges that grant new public tables to
-- anon/authenticated, and every earlier migration in this repo relies on that.
-- Relying on it here is a silent failure waiting to happen: fetchLessonResults()
-- swallows errors and returns [], so a missing SELECT grant shows up as "no
-- grades anywhere" with nothing in the console. RLS is what actually restricts
-- the rows; this only opens the door RLS then guards.
grant select, insert on public.lesson_results to authenticated;
-- anon gets nothing: results belong to a signed-in learner or to no one.
revoke all on public.lesson_results from anon;

drop policy if exists "Users read own lesson results" on public.lesson_results;
create policy "Users read own lesson results" on public.lesson_results
  for select to authenticated
  using (auth.uid() = user_id);

-- WITH CHECK is written out rather than left to default from USING — same
-- reasoning as the A7 fix in 20260712000000_user_progress_explicit_with_check.
drop policy if exists "Users insert own lesson results" on public.lesson_results;
create policy "Users insert own lesson results" on public.lesson_results
  for insert to authenticated
  with check (auth.uid() = user_id);

-- No UPDATE and no DELETE policy, on purpose. A recorded RE5 mock result is
-- immutable: a learner cannot edit a fail into a pass, and neither can a bug.
-- Re-sitting the exam writes a new row with the next attempt_no.

-- ── Recording ───────────────────────────────────────────────────────────────
-- SECURITY INVOKER: RLS still applies inside the function, so the max() below
-- can only see the caller's own rows. user_id is taken from auth.uid() and is
-- never a parameter, so a client cannot write a result onto another account
-- even if it forges every other field.
create or replace function public.record_lesson_result(
  p_course_id         text,
  p_lesson_id         text,
  p_kind              text,
  p_total_questions   int,
  p_first_try_correct int,
  p_pass_mark_correct int    default null,
  p_duration_seconds  int    default null,
  p_area_breakdown    jsonb  default '[]'::jsonb
)
returns public.lesson_results
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt int;
  v_row     public.lesson_results;
begin
  if v_user_id is null then
    raise exception 'record_lesson_result: no authenticated user';
  end if;

  select coalesce(max(attempt_no), 0) + 1
    into v_attempt
    from public.lesson_results
   where user_id = v_user_id
     and lesson_id = p_lesson_id;

  insert into public.lesson_results (
    user_id, course_id, lesson_id, attempt_no, kind,
    total_questions, first_try_correct, score_pct,
    pass_mark_correct, passed, duration_seconds, area_breakdown, source
  ) values (
    v_user_id, p_course_id, p_lesson_id, v_attempt, p_kind,
    p_total_questions,
    p_first_try_correct,
    case when p_total_questions > 0
         then round((p_first_try_correct::numeric / p_total_questions) * 100)::int
         else 0 end,
    p_pass_mark_correct,
    case when p_pass_mark_correct is null then null
         else p_first_try_correct >= p_pass_mark_correct end,
    p_duration_seconds,
    coalesce(p_area_breakdown, '[]'::jsonb),
    'live'
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.record_lesson_result(
  text, text, text, int, int, int, int, jsonb) from public, anon;
grant execute on function public.record_lesson_result(
  text, text, text, int, int, int, int, jsonb) to authenticated;

-- ── Backfill from question_attempts ─────────────────────────────────────────
-- So learners open the new screens on their real history instead of an empty
-- state. For bank-backed lessons the log records every answer with is_correct,
-- and slot_id is a stable per-question identity, so "was this question right
-- the FIRST time it was presented?" is recoverable by taking the earliest row
-- per slot. The RE5 mock exams are bank-backed too, so past sittings are
-- recoverable — and are scored as exams, against the real pass mark.
--
-- Scope, and the limits of it:
--   • attempt_no is the client's device-local counter (reason 1 above), so
--     attempts from two devices can collide into one row. Every row here is
--     stamped source='backfill' and the UI labels it as reconstructed rather
--     than presenting it as a recorded sitting.
--   • A MOCK EXAM is only scored when all 50 slots are present. Judging a
--     partial paper against "33 of 50" would manufacture a fail out of an
--     abandoned attempt, on the one number in this app a learner might spend
--     money acting on. Partial mock attempts are skipped entirely — no row —
--     rather than recorded as an ungraded lesson, which would put a bare grade
--     chip on an exam with no pass/fail beside it.
--   • Ordinary lessons need at least 3 distinct questions: fewer is more likely
--     an abandoned opening, and a 1-of-1 = 100% badge on a lesson someone quit
--     is exactly the untrustworthy number this work exists to avoid.
--   • Anything answered in the last hour is left alone; it may still be in
--     flight and will be recorded live.
--   • area_breakdown stays empty. conceptId is nullable on question_attempts
--     and was not populated for older rows, so a breakdown reconstructed from
--     it would be silently partial. An incomplete breakdown presented as a
--     complete one is worse than none; new sittings record it properly.

with first_try as (
  -- Earliest answer per question (slot) within one recorded attempt: the
  -- first-try outcome. Later rows for the same slot are the mastery loop's
  -- re-queues and must not count, or every lesson reads 100%.
  select distinct on (user_id, course_id, lesson_id, attempt_no, slot_id)
    user_id, course_id, lesson_id, attempt_no, slot_id, is_correct, answered_at
  from public.question_attempts
  order by user_id, course_id, lesson_id, attempt_no, slot_id, answered_at asc, id asc
),
grouped as (
  select
    user_id, course_id, lesson_id, attempt_no,
    count(*)::int                            as total_questions,
    count(*) filter (where is_correct)::int  as first_try_correct,
    max(answered_at)                         as completed_at
  from first_try
  group by user_id, course_id, lesson_id, attempt_no
),
classified as (
  select
    g.*,
    -- These literals mirror RE5_MOCK_EXAMS in src/lib/results/re5.ts, which is
    -- the single source of truth in the app. SQL cannot import it, so the unit
    -- tests assert the two agree (see results/__tests__/rls.test.ts).
    (g.lesson_id in ('re5-mock-a', 're5-mock-b')) as is_mock_exam,
    50 as mock_total_questions,
    33 as mock_pass_mark
  from grouped g
)
insert into public.lesson_results (
  user_id, course_id, lesson_id, attempt_no, kind,
  total_questions, first_try_correct, score_pct,
  pass_mark_correct, passed, duration_seconds, area_breakdown, source,
  completed_at
)
select
  c.user_id,
  c.course_id,
  c.lesson_id,
  c.attempt_no,
  case when c.is_mock_exam then 'exam' else 'lesson' end,
  c.total_questions,
  c.first_try_correct,
  round((c.first_try_correct::numeric / c.total_questions) * 100)::int,
  case when c.is_mock_exam then c.mock_pass_mark end,
  case when c.is_mock_exam then c.first_try_correct >= c.mock_pass_mark end,
  null,                 -- duration is not recoverable from an answer log
  '[]'::jsonb,
  'backfill',
  c.completed_at
from classified c
where c.completed_at < now() - interval '1 hour'
  and case
        when c.is_mock_exam then c.total_questions = c.mock_total_questions
        else c.total_questions >= 3
      end
on conflict (user_id, lesson_id, attempt_no) do nothing;

comment on table public.lesson_results is
  'One row per completed lesson or exam sitting. Score is FIRST-TRY accuracy '
  '(see src/lib/lessonMastery.ts): the mastery loop re-queues missed questions '
  'until correct, so raw correctness is always 100%. Immutable by design — no '
  'UPDATE or DELETE policy. Rows with source=''backfill'' were reconstructed '
  'from question_attempts and are labelled as such in the UI.';
