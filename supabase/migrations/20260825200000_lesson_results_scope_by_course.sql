-- Scope a lesson result to its COURSE as well as its lesson.
--
-- THE BUG
-- =======
-- 20260824120000 keyed a sitting as (user_id, lesson_id, attempt_no). That
-- assumed lesson ids are globally unique. They are not: `lesson-1` through
-- `lesson-6` are reused by TWELVE courses — money-basics, salary-payslip,
-- banking-debit, credit-debt, emergency-fund, insurance, investing-basics,
-- sa-investing, property, taxes, scams-fraud and money-psychology all have a
-- lesson-1. Only re5-exam-prep and the newer lessons use distinctive ids,
-- which is why RE5 grades appeared and the early courses showed nothing.
--
-- Two consequences, both silent:
--
--   1. The backfill's `on conflict (user_id, lesson_id, attempt_no) do nothing`
--      kept the first course's lesson-1 and DISCARDED the other eleven. No
--      error, no log line — just missing grades.
--
--   2. record_lesson_result() computed the next attempt_no with
--      `where lesson_id = p_lesson_id` and no course filter, so finishing
--      money-basics/lesson-1 advanced the attempt counter for taxes/lesson-1,
--      and a live insert could collide outright and lose the result.
--
-- The fix is to include course_id everywhere a sitting is identified. The
-- client was always right about this — bestByLesson() in src/lib/results/select.ts
-- keys on `${courseId}:${lessonId}` — it was only the database that was wrong.

-- ── Re-key ──────────────────────────────────────────────────────────────────
alter table public.lesson_results
  drop constraint if exists lesson_results_user_lesson_attempt_key;

alter table public.lesson_results
  drop constraint if exists lesson_results_user_course_lesson_attempt_key;

alter table public.lesson_results
  add constraint lesson_results_user_course_lesson_attempt_key
  unique (user_id, course_id, lesson_id, attempt_no);

-- The old index led on lesson_id, which is not selective when twelve courses
-- share it. Lead on the course the map is rendering.
drop index if exists lesson_results_user_lesson_completed_idx;
create index if not exists lesson_results_user_course_lesson_completed_idx
  on public.lesson_results (user_id, course_id, lesson_id, completed_at desc);

-- ── Recording ───────────────────────────────────────────────────────────────
-- Same function as before, with the attempt counter scoped to the course.
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
     -- Scoped by course: lesson ids are NOT unique across courses.
     and course_id = p_course_id
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

-- ── Recover the rows the old constraint threw away ──────────────────────────
-- Identical to the backfill in 20260824120000, with the corrected conflict
-- target. Rows that survived the first run are left exactly as they are.
with first_try as (
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
  c.user_id, c.course_id, c.lesson_id, c.attempt_no,
  case when c.is_mock_exam then 'exam' else 'lesson' end,
  c.total_questions,
  c.first_try_correct,
  round((c.first_try_correct::numeric / c.total_questions) * 100)::int,
  case when c.is_mock_exam then c.mock_pass_mark end,
  case when c.is_mock_exam then c.first_try_correct >= c.mock_pass_mark end,
  null,
  '[]'::jsonb,
  'backfill',
  c.completed_at
from classified c
where c.completed_at < now() - interval '1 hour'
  and case
        when c.is_mock_exam then c.total_questions = c.mock_total_questions
        else c.total_questions >= 3
      end
on conflict (user_id, course_id, lesson_id, attempt_no) do nothing;
