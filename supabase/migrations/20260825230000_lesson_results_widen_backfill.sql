-- Score every lesson the answer log can actually score.
--
-- The first backfill required at least 3 distinct questions per attempt and
-- left anything answered in the last hour alone. Both guards were aimed at a
-- real risk — a 1-of-1 = 100% badge on a lesson someone opened and quit is a
-- number nobody should act on — but between them they left most of the course
-- map blank, which reads as a broken feature rather than as missing data.
--
-- Coverage wins here. A lesson with two answered questions is still a lesson
-- the learner touched, and the grade chip states the percentage that the
-- recorded answers support. The one guard kept is the mock exams: a partial
-- RE5 paper judged against "33 of 50" manufactures a fail out of an abandoned
-- sitting, and that number costs money to act on.
--
-- WHAT THIS CANNOT DO
-- ===================
-- public.question_attempts only began collecting on 22 July 2026, and only for
-- bank-backed lessons answered while signed in. A lesson completed before that
-- has no per-question record anywhere in the database — not in user_progress,
-- which stores completed_lessons as a bare text[], and not in any other table.
-- There is no honest score to reconstruct for those, and inventing one on a
-- study app is not on the table. They fill in as lessons are replayed.

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
-- Five minutes, not an hour: long enough that a lesson still being answered
-- is not scored mid-flight, short enough that finishing one and opening the
-- course map shows a grade.
where c.completed_at < now() - interval '5 minutes'
  and case
        -- A mock exam is still all-or-nothing.
        when c.is_mock_exam then c.total_questions = c.mock_total_questions
        -- Every other lesson is scored on whatever it actually recorded.
        else c.total_questions >= 1
      end
on conflict (user_id, course_id, lesson_id, attempt_no) do nothing;
