-- Canonical server-owned RE5 mock-exam lifecycle.
--
-- This intentionally replaces the incompatible Task 1 and Task 3 draft
-- schemas before either is deployed. Active papers, answer keys, explanations,
-- deadlines, flags, views and marking are API-only. The browser receives an
-- explicit projection and cannot write these tables directly.

create table public.mock_attempts (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  course_id                text not null,
  lesson_id                text not null,
  content_version          text not null default 're5-mock-v1',
  status                   text not null default 'in_progress',
  started_at               timestamptz not null default clock_timestamp(),
  expires_at               timestamptz not null,
  last_activity_at         timestamptz not null default clock_timestamp(),
  submitted_at             timestamptz,
  submission_reason        text,
  state_version            bigint not null default 0,
  current_question_index   smallint not null default 0,
  total_questions          smallint not null default 50,
  time_limit_seconds       integer not null default 7200,
  pass_mark_correct        smallint not null default 33,
  correct_answers          smallint,
  score_pct                smallint,
  passed                   boolean,
  duration_seconds         integer,
  area_breakdown           jsonb not null default '[]'::jsonb,
  result_id                uuid references public.lesson_results(id),

  constraint mock_attempts_exam_chk
    check (course_id = 're5-exam-prep'
           and lesson_id in ('re5-mock-a', 're5-mock-b')),
  constraint mock_attempts_status_chk
    check (status in ('in_progress', 'submitted')),
  constraint mock_attempts_submission_reason_chk
    check (submission_reason is null
           or submission_reason in ('learner', 'time_expired')),
  constraint mock_attempts_re5_format_chk
    check (total_questions = 50
           and time_limit_seconds = 7200
           and pass_mark_correct = 33),
  constraint mock_attempts_question_index_chk
    check (current_question_index between 0 and 49),
  constraint mock_attempts_times_chk
    check (expires_at > started_at and last_activity_at >= started_at),
  constraint mock_attempts_score_chk
    check (correct_answers is null or correct_answers between 0 and 50),
  constraint mock_attempts_score_pct_chk
    check (score_pct is null or score_pct between 0 and 100),
  constraint mock_attempts_duration_chk
    check (duration_seconds is null
           or duration_seconds between 0 and time_limit_seconds),
  constraint mock_attempts_area_breakdown_chk
    check (jsonb_typeof(area_breakdown) = 'array'),
  constraint mock_attempts_submission_state_chk
    check (
      (status = 'submitted'
       and submitted_at is not null
       and submission_reason is not null
       and correct_answers is not null
       and score_pct is not null
       and passed is not null
       and passed = (correct_answers >= pass_mark_correct)
       and duration_seconds is not null
       and result_id is not null)
      or
      (status = 'in_progress'
       and submitted_at is null
       and submission_reason is null
       and correct_answers is null
       and score_pct is null
       and passed is null
       and duration_seconds is null
       and result_id is null)
    )
);

create unique index mock_attempts_one_live_paper_idx
  on public.mock_attempts (user_id, course_id, lesson_id)
  where status = 'in_progress';

create index mock_attempts_user_history_idx
  on public.mock_attempts (user_id, course_id, lesson_id, started_at desc);

create table public.mock_attempt_questions (
  attempt_id                uuid not null references public.mock_attempts(id) on delete cascade,
  question_id               uuid not null,
  question_index            smallint not null,
  slot_id                   text not null,
  variant_id                text not null,
  concept_id                text,
  area_id                   text not null,
  question_type             text not null,
  question_text             text not null,
  question_content          text,
  options                   jsonb not null,
  correct_option_id         uuid not null,
  explanation               text not null,
  answered_option_id        uuid,
  viewed                    boolean not null default false,
  flagged                   boolean not null default false,
  updated_at                timestamptz not null default clock_timestamp(),

  primary key (attempt_id, question_index),
  constraint mock_attempt_questions_public_id_key unique (attempt_id, question_id),
  constraint mock_attempt_questions_slot_key unique (attempt_id, slot_id),
  constraint mock_attempt_questions_index_chk check (question_index between 0 and 49),
  constraint mock_attempt_questions_type_chk check (question_type in ('mcq', 'scenario')),
  constraint mock_attempt_questions_area_chk
    check (area_id in (
      'framework', 'licensing', 'representatives', 'fitproper',
      'disclosure', 'suitability', 'complaints', 'fica'
    )),
  constraint mock_attempt_questions_options_chk
    check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  constraint mock_attempt_questions_explanation_chk check (length(trim(explanation)) > 0)
);

create table public.mock_attempt_mutations (
  attempt_id       uuid not null references public.mock_attempts(id) on delete cascade,
  mutation_id      uuid not null,
  action           text not null,
  question_index   smallint not null,
  answered_option_id uuid,
  flagged          boolean,
  created_at       timestamptz not null default clock_timestamp(),
  primary key (attempt_id, mutation_id),
  constraint mock_attempt_mutations_action_chk
    check (action in ('view', 'answer', 'flag')),
  constraint mock_attempt_mutations_index_chk check (question_index between 0 and 49),
  constraint mock_attempt_mutations_payload_chk check (
    (action = 'view' and answered_option_id is null and flagged is null)
    or (action = 'answer' and flagged is null)
    or (action = 'flag' and answered_option_id is null and flagged is not null)
  )
);

-- Exactly one immutable result row may be derived from a secure sitting.
alter table public.lesson_results
  add column mock_attempt_id uuid references public.mock_attempts(id);
alter table public.lesson_results
  add constraint lesson_results_mock_attempt_scope_chk
  check (
    mock_attempt_id is null
    or (
      course_id = 're5-exam-prep'
      and lesson_id in ('re5-mock-a', 're5-mock-b')
      and kind = 'exam'
      and total_questions = 50
      and pass_mark_correct = 33
      and source = 'live'
    )
  );
create unique index lesson_results_mock_attempt_idx
  on public.lesson_results (mock_attempt_id)
  where mock_attempt_id is not null;

-- Existing authenticated lesson recording remains available for ordinary
-- lessons, but cannot manufacture a competing RE5 exam result. The service
-- role used by submit_mock_attempt bypasses this RLS policy.
drop policy if exists "Users insert own lesson results" on public.lesson_results;
create policy "Users insert own lesson results" on public.lesson_results
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and mock_attempt_id is null
    and not (
      course_id = 're5-exam-prep'
      and lesson_id in ('re5-mock-a', 're5-mock-b')
    )
  );

drop policy if exists "Users insert own question attempts" on public.question_attempts;
create policy "Users insert own question attempts" on public.question_attempts
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not (
      course_id = 're5-exam-prep'
      and lesson_id in ('re5-mock-a', 're5-mock-b')
    )
  );

create table public.mock_exam_audit_log (
  id          bigint generated always as identity primary key,
  request_id  uuid not null unique,
  user_id     uuid not null references auth.users(id) on delete cascade,
  attempt_id  uuid references public.mock_attempts(id) on delete set null,
  action      text not null,
  outcome     text not null,
  ip_hash     text,
  user_agent  text,
  metadata    jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default clock_timestamp(),
  constraint mock_exam_audit_action_chk check (
    action in (
      'attempt_start', 'attempt_read', 'attempt_mutate',
      'attempt_submit', 'explanation_read'
    )
  ),
  constraint mock_exam_audit_outcome_chk check (
    outcome in ('allowed', 'denied', 'rate_limited', 'invalid', 'failed')
  ),
  constraint mock_exam_audit_metadata_chk check (jsonb_typeof(metadata) = 'object')
);

create index mock_exam_audit_rate_limit_idx
  on public.mock_exam_audit_log (user_id, action, occurred_at desc);
create index mock_exam_audit_attempt_idx
  on public.mock_exam_audit_log (attempt_id, occurred_at desc)
  where attempt_id is not null;

alter table public.mock_attempts enable row level security;
alter table public.mock_attempt_questions enable row level security;
alter table public.mock_attempt_mutations enable row level security;
alter table public.mock_exam_audit_log enable row level security;

revoke all on public.mock_attempts from public, anon, authenticated, service_role;
revoke all on public.mock_attempt_questions from public, anon, authenticated, service_role;
revoke all on public.mock_attempt_mutations from public, anon, authenticated, service_role;
revoke all on public.mock_exam_audit_log from public, anon, authenticated, service_role;
revoke all on sequence public.mock_exam_audit_log_id_seq
  from public, anon, authenticated, service_role;
grant select, insert, update on public.mock_attempts to service_role;
grant select, insert, update on public.mock_attempt_questions to service_role;
grant select, insert on public.mock_attempt_mutations to service_role;
grant select, insert on public.mock_exam_audit_log to service_role;
grant usage, select on sequence public.mock_exam_audit_log_id_seq to service_role;

-- Persisted paper identity, deadline and completed output cannot be rewritten.
create function public.guard_mock_attempt_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'submitted' then
    raise exception 'submitted mock attempts are immutable';
  end if;
  if new.user_id <> old.user_id
     or new.course_id <> old.course_id
     or new.lesson_id <> old.lesson_id
     or new.content_version <> old.content_version
     or new.started_at <> old.started_at
     or new.expires_at <> old.expires_at
     or new.total_questions <> old.total_questions
     or new.time_limit_seconds <> old.time_limit_seconds
     or new.pass_mark_correct <> old.pass_mark_correct then
    raise exception 'mock attempt identity and deadline are immutable';
  end if;
  return new;
end;
$$;

create trigger guard_mock_attempt_update
before update on public.mock_attempts
for each row execute function public.guard_mock_attempt_update();

create function public.guard_mock_question_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.attempt_id <> old.attempt_id
     or new.question_id <> old.question_id
     or new.question_index <> old.question_index
     or new.slot_id <> old.slot_id
     or new.variant_id <> old.variant_id
     or new.concept_id is distinct from old.concept_id
     or new.area_id <> old.area_id
     or new.question_type <> old.question_type
     or new.question_text <> old.question_text
     or new.question_content is distinct from old.question_content
     or new.options <> old.options
     or new.correct_option_id <> old.correct_option_id
     or new.explanation <> old.explanation then
    raise exception 'mock question content and key are immutable';
  end if;
  return new;
end;
$$;

create trigger guard_mock_question_update
before update on public.mock_attempt_questions
for each row execute function public.guard_mock_question_update();

-- Transactionally mark one owned sitting. Before the deadline every question
-- must have been viewed; at/after the server deadline unviewed and blank items
-- score zero and the sitting is finalized instead of discarded.
create function public.submit_mock_attempt(
  p_user_id uuid,
  p_attempt_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_attempt       public.mock_attempts%rowtype;
  v_now           timestamptz;
  v_timed_out     boolean;
  v_correct       integer;
  v_unanswered    integer;
  v_duration      integer;
  v_attempt_no    integer;
  v_score_pct     integer;
  v_question_count integer;
  v_areas         jsonb;
  v_result_id     uuid;
begin
  select * into v_attempt
    from public.mock_attempts
   where id = p_attempt_id
   for update;

  if not found then raise exception 'MOCK_ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.user_id <> p_user_id then
    raise exception 'MOCK_ATTEMPT_FORBIDDEN';
  end if;
  -- The row lock may have waited behind another request. Deadline decisions
  -- must use the time after that wait, not the function-entry timestamp.
  v_now := clock_timestamp();
  if v_attempt.status = 'submitted' then return v_attempt.result_id; end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'MOCK_ATTEMPT_NOT_ACTIVE';
  end if;

  v_timed_out := v_now >= v_attempt.expires_at;
  if not v_timed_out and (
    select count(*) from public.mock_attempt_questions
     where attempt_id = p_attempt_id and viewed
  ) <> v_attempt.total_questions then
    raise exception 'MOCK_ATTEMPT_NOT_ALL_VIEWED';
  end if;

  select
    count(*)::integer,
    count(*) filter (
      where answered_option_id is not null
        and answered_option_id = correct_option_id
    )::integer,
    count(*) filter (where answered_option_id is null)::integer
  into v_question_count, v_correct, v_unanswered
  from public.mock_attempt_questions
  where attempt_id = p_attempt_id;

  if v_question_count <> v_attempt.total_questions then
    raise exception 'MOCK_ATTEMPT_INVALID: incomplete stored paper';
  end if;

  v_duration := greatest(
    0,
    least(
      v_attempt.time_limit_seconds,
      extract(epoch from (least(v_now, v_attempt.expires_at) - v_attempt.started_at))::integer
    )
  );
  v_score_pct := round((v_correct::numeric / v_attempt.total_questions) * 100)::integer;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'areaId', scored.area_id,
        'areaLabel', case scored.area_id
          when 'framework' then 'FAIS Act & Regulatory Framework'
          when 'licensing' then 'Licensing & the FSP'
          when 'representatives' then 'Key Individuals & Representatives'
          when 'fitproper' then 'Fit & Proper Requirements'
          when 'disclosure' then 'General Code — Duties & Disclosure'
          when 'suitability' then 'General Code — Suitability, Records & Conflicts'
          when 'complaints' then 'Complaints, TCF & the FAIS Ombud'
          when 'fica' then 'FICA & Anti-Money-Laundering'
        end,
        'correct', scored.correct,
        'total', scored.total
      ) order by scored.area_id
    ),
    '[]'::jsonb
  ) into v_areas
  from (
    select
      area_id,
      count(*) filter (
        where answered_option_id is not null
          and answered_option_id = correct_option_id
      )::integer as correct,
      count(*)::integer as total
    from public.mock_attempt_questions
    where attempt_id = p_attempt_id
    group by area_id
  ) scored;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_user_id::text || ':' || v_attempt.course_id || ':' || v_attempt.lesson_id,
      1
    )
  );
  select coalesce(max(attempt_no), 0) + 1
    into v_attempt_no
    from public.lesson_results
   where user_id = p_user_id
     and course_id = v_attempt.course_id
     and lesson_id = v_attempt.lesson_id;

  insert into public.lesson_results (
    user_id, course_id, lesson_id, attempt_no, kind,
    total_questions, first_try_correct, score_pct,
    pass_mark_correct, passed, duration_seconds,
    area_breakdown, source, completed_at, mock_attempt_id
  ) values (
    p_user_id, v_attempt.course_id, v_attempt.lesson_id, v_attempt_no, 'exam',
    v_attempt.total_questions, v_correct, v_score_pct,
    v_attempt.pass_mark_correct, v_correct >= v_attempt.pass_mark_correct,
    v_duration, v_areas, 'live', v_now, p_attempt_id
  )
  returning id into v_result_id;

  -- Per-question secure analytics remain in mock_attempt_questions. Do not
  -- copy authored slot/variant IDs into question_attempts: learners can read
  -- their own legacy analytics rows, while this normalized paper is private.
  -- Completion is server-idempotent even when the response is lost. XP and
  -- streak presentation remain in the existing progress workflow.
  insert into public.user_progress as up (user_id, completed_lessons)
  values (p_user_id, array[v_attempt.course_id || ':' || v_attempt.lesson_id])
  on conflict (user_id) do update set
    completed_lessons = (
      select coalesce(array_agg(distinct lesson_key), '{}')
      from unnest(
        up.completed_lessons || excluded.completed_lessons
      ) lesson_key
    ),
    updated_at = v_now;

  update public.mock_attempts
     set status = 'submitted',
         submitted_at = v_now,
         submission_reason = case when v_timed_out then 'time_expired' else 'learner' end,
         last_activity_at = v_now,
         correct_answers = v_correct,
         score_pct = v_score_pct,
         passed = v_correct >= pass_mark_correct,
         duration_seconds = v_duration,
         area_breakdown = v_areas,
         result_id = v_result_id,
         state_version = state_version + 1
   where id = p_attempt_id;

  return v_result_id;
end;
$$;

-- Resume the one live paper. If it crossed its fixed deadline, finalize and
-- return its report. With p_new_attempt=false, the latest completed report is
-- reopenable; an explicit Retake creates the next randomized sitting.
create function public.start_or_resume_mock_attempt(
  p_user_id uuid,
  p_course_id text,
  p_lesson_id text,
  p_questions jsonb,
  p_new_attempt boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_attempt_id uuid;
  v_expires_at timestamptz;
  v_now timestamptz;
begin
  if p_user_id is null
     or p_course_id <> 're5-exam-prep'
     or p_lesson_id not in ('re5-mock-a', 're5-mock-b') then
    raise exception 'MOCK_ATTEMPT_INVALID: unknown exam';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || p_course_id || ':' || p_lesson_id, 0)
  );

  select id, expires_at
    into v_attempt_id, v_expires_at
    from public.mock_attempts
   where user_id = p_user_id
     and course_id = p_course_id
     and lesson_id = p_lesson_id
     and status = 'in_progress'
   order by started_at desc
   limit 1
   for update;

  -- A concurrent submission can hold this row after the advisory lock was
  -- acquired. Refresh time after both waits before resuming or creating.
  v_now := clock_timestamp();

  if v_attempt_id is not null then
    if v_expires_at <= v_now then
      perform public.submit_mock_attempt(p_user_id, v_attempt_id);
    else
      update public.mock_attempts
         set last_activity_at = v_now,
             state_version = state_version + 1
       where id = v_attempt_id;
    end if;
    return v_attempt_id;
  end if;

  if not coalesce(p_new_attempt, false) then
    select id into v_attempt_id
      from public.mock_attempts
     where user_id = p_user_id
       and course_id = p_course_id
       and lesson_id = p_lesson_id
       and status = 'submitted'
     order by submitted_at desc
     limit 1;
    if v_attempt_id is not null then return v_attempt_id; end if;
  end if;

  if jsonb_typeof(p_questions) <> 'array'
     or jsonb_array_length(p_questions) <> 50 then
    raise exception 'MOCK_ATTEMPT_INVALID: a paper must contain 50 questions';
  end if;

  insert into public.mock_attempts (
    user_id, course_id, lesson_id, content_version, status,
    started_at, expires_at, last_activity_at,
    total_questions, time_limit_seconds, pass_mark_correct
  ) values (
    p_user_id, p_course_id, p_lesson_id, 're5-mock-v1', 'in_progress',
    v_now, v_now + interval '2 hours', v_now, 50, 7200, 33
  ) returning id into v_attempt_id;

  insert into public.mock_attempt_questions (
    attempt_id, question_id, question_index, slot_id, variant_id, concept_id,
    area_id, question_type, question_text, question_content, options,
    correct_option_id, explanation
  )
  select
    v_attempt_id, q.question_id, q.question_index, q.slot_id, q.variant_id,
    q.concept_id, q.area_id, q.question_type, q.question_text,
    q.question_content, q.options, q.correct_option_id, q.explanation
  from jsonb_to_recordset(p_questions) as q(
    question_id uuid,
    question_index smallint,
    slot_id text,
    variant_id text,
    concept_id text,
    area_id text,
    question_type text,
    question_text text,
    question_content text,
    options jsonb,
    correct_option_id uuid,
    explanation text
  );

  if (select count(*) from public.mock_attempt_questions
       where attempt_id = v_attempt_id) <> 50 then
    raise exception 'MOCK_ATTEMPT_INVALID: paper insert was incomplete';
  end if;

  if exists (
    select 1
    from public.mock_attempt_questions q
    where q.attempt_id = v_attempt_id
      and not exists (
        select 1 from jsonb_array_elements(q.options) option
        where option ->> 'id' = q.correct_option_id::text
      )
  ) then
    raise exception 'MOCK_ATTEMPT_INVALID: correct option is absent';
  end if;

  return v_attempt_id;
end;
$$;

create function public.mutate_mock_attempt(
  p_user_id uuid,
  p_attempt_id uuid,
  p_mutation_id uuid,
  p_action text,
  p_question_index integer,
  p_answered_option_id uuid default null,
  p_flagged boolean default null
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_attempt public.mock_attempts%rowtype;
  v_now timestamptz;
  v_inserted integer;
begin
  select * into v_attempt
    from public.mock_attempts
   where id = p_attempt_id
   for update;

  if not found then raise exception 'MOCK_ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.user_id <> p_user_id then
    raise exception 'MOCK_ATTEMPT_FORBIDDEN';
  end if;
  -- Do not let a request queued before expiry mutate after its row lock clears.
  v_now := clock_timestamp();
  if v_attempt.status <> 'in_progress' then
    return false;
  end if;
  if v_attempt.expires_at <= v_now then
    perform public.submit_mock_attempt(p_user_id, p_attempt_id);
    return false;
  end if;
  if p_action not in ('view', 'answer', 'flag')
     or p_question_index < 0
     or p_question_index >= v_attempt.total_questions then
    raise exception 'MOCK_ATTEMPT_INVALID: invalid mutation';
  end if;

  insert into public.mock_attempt_mutations (
    attempt_id, mutation_id, action, question_index,
    answered_option_id, flagged
  ) values (
    p_attempt_id, p_mutation_id, p_action, p_question_index,
    case when p_action = 'answer' then p_answered_option_id end,
    case when p_action = 'flag' then p_flagged end
  ) on conflict (attempt_id, mutation_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    if not exists (
      select 1 from public.mock_attempt_mutations m
      where m.attempt_id = p_attempt_id
        and m.mutation_id = p_mutation_id
        and m.action = p_action
        and m.question_index = p_question_index
        and m.answered_option_id is not distinct from
          case when p_action = 'answer' then p_answered_option_id end
        and m.flagged is not distinct from
          case when p_action = 'flag' then p_flagged end
    ) then
      raise exception 'MOCK_ATTEMPT_INVALID: mutation id reused';
    end if;
    return true;
  end if;

  if p_action = 'view' then
    update public.mock_attempt_questions
       set viewed = true, updated_at = v_now
     where attempt_id = p_attempt_id and question_index = p_question_index;
  elsif p_action = 'answer' then
    if p_answered_option_id is not null and not exists (
      select 1
      from public.mock_attempt_questions q,
           jsonb_array_elements(q.options) option
      where q.attempt_id = p_attempt_id
        and q.question_index = p_question_index
        and option ->> 'id' = p_answered_option_id::text
    ) then
      raise exception 'MOCK_ATTEMPT_INVALID: invalid option';
    end if;
    update public.mock_attempt_questions
       set answered_option_id = p_answered_option_id,
           viewed = true,
           updated_at = v_now
     where attempt_id = p_attempt_id and question_index = p_question_index;
  else
    if p_flagged is null then
      raise exception 'MOCK_ATTEMPT_INVALID: invalid flag';
    end if;
    update public.mock_attempt_questions
       set flagged = p_flagged,
           viewed = true,
           updated_at = v_now
     where attempt_id = p_attempt_id and question_index = p_question_index;
  end if;

  if not found then
    raise exception 'MOCK_ATTEMPT_INVALID: question not found';
  end if;

  update public.mock_attempts
     set last_activity_at = v_now,
         current_question_index = p_question_index,
         state_version = state_version + 1
   where id = p_attempt_id;
  return true;
end;
$$;

revoke all on function public.guard_mock_attempt_update()
  from public, anon, authenticated, service_role;
revoke all on function public.guard_mock_question_update()
  from public, anon, authenticated, service_role;
revoke all on function public.submit_mock_attempt(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.start_or_resume_mock_attempt(uuid, text, text, jsonb, boolean)
  from public, anon, authenticated, service_role;
revoke all on function public.mutate_mock_attempt(uuid, uuid, uuid, text, integer, uuid, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_mock_attempt(uuid, uuid) to service_role;
grant execute on function public.start_or_resume_mock_attempt(uuid, text, text, jsonb, boolean)
  to service_role;
grant execute on function public.mutate_mock_attempt(uuid, uuid, uuid, text, integer, uuid, boolean)
  to service_role;

comment on table public.mock_attempt_questions is
  'Server-only RE5 paper content. Correct options, authoring IDs and explanations must never be selected by a browser client.';
comment on table public.mock_exam_audit_log is
  'Append-only account-scoped audit/rate-limit events for protected RE5 content.';
