-- Server-authoritative hearts.
--
-- The retired user_progress.hearts fields were directly browser-writable, so
-- they are not imported. Existing accounts receive a deliberate, deterministic
-- five-heart migration allocation recorded in the new immutable ledger.

CREATE TABLE public.heart_balances (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance          integer NOT NULL CHECK (balance BETWEEN 0 AND 5),
  next_reward_at   timestamptz NULL,
  version          bigint NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at       timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at       timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    (balance = 5 AND next_reward_at IS NULL)
    OR (balance < 5 AND next_reward_at IS NOT NULL)
  )
);

CREATE TABLE public.heart_ledger (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Zero is reserved for a trusted grant that is already at the cap. Learner
  -- spend calls at zero return without appending attacker-controlled rows.
  delta             integer NOT NULL CHECK (delta BETWEEN -5 AND 5),
  balance_after     integer NOT NULL CHECK (balance_after BETWEEN 0 AND 5),
  reason            text NOT NULL CHECK (reason IN (
                      'initial_allocation', 'migration_allocation',
                      'scheduled_regeneration', 'approved_purchase',
                      'incorrect_answer')),
  actor_type        text NOT NULL CHECK (actor_type IN ('learner', 'system', 'admin')),
  actor_user_id     uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at       timestamptz NOT NULL DEFAULT clock_timestamp(),
  idempotency_key   text NOT NULL,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb
                    CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT heart_ledger_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT heart_ledger_grant_rules CHECK (
    (delta > 0 AND reason IN (
      'initial_allocation', 'migration_allocation',
      'scheduled_regeneration', 'approved_purchase'))
    OR (delta < 0 AND reason = 'incorrect_answer')
    OR (delta = 0 AND reason = 'approved_purchase')
  ),
  CONSTRAINT heart_ledger_actor_rules CHECK (
    (actor_type = 'system' AND actor_user_id IS NULL)
    OR (
      actor_type IN ('learner', 'admin')
      AND (
        actor_user_id IS NOT NULL
        OR metadata ->> 'actor_deleted' = 'true'
      )
    )
  )
);

CREATE INDEX heart_ledger_user_occurred_at_idx
  ON public.heart_ledger (user_id, occurred_at DESC);

ALTER TABLE public.heart_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own heart balance" ON public.heart_balances
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users read their own heart ledger" ON public.heart_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Remove browser write paths. Only the narrowly scoped SECURITY DEFINER
-- functions below can change the projection or append ledger events.
REVOKE ALL ON TABLE public.heart_balances
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.heart_ledger
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.heart_balances TO authenticated;
GRANT SELECT ON TABLE public.heart_ledger TO authenticated;

-- Retain the old columns for compatibility with deployed progress code, but
-- make them neutral and non-authoritative. INSERTs must continue to work
-- because several progress RPCs lazily create user_progress rows.
CREATE OR REPLACE FUNCTION public.guard_legacy_heart_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.hearts := 0;
    NEW.last_heart_lost_at := NULL;
    RETURN NEW;
  END IF;

  -- Deployed clients may still include these retired fields in a broad
  -- progress UPDATE during rollout. Ignore those values so unrelated progress
  -- continues to sync, while making it impossible for that write to affect the
  -- authoritative ledger projection.
  NEW.hearts := OLD.hearts;
  NEW.last_heart_lost_at := OLD.last_heart_lost_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_legacy_heart_columns
  BEFORE INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.guard_legacy_heart_columns();

CREATE OR REPLACE FUNCTION public.reject_heart_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- ON DELETE SET NULL may anonymise an actor whose account is being deleted.
  -- Permit only that referential action; annotate it without allowing any
  -- caller to rewrite an otherwise immutable event.
  IF TG_OP = 'UPDATE'
     AND OLD.actor_user_id IS NOT NULL
     AND NEW.actor_user_id IS NULL
     AND NOT EXISTS (
       SELECT 1 FROM auth.users WHERE id = OLD.actor_user_id
     )
     AND (to_jsonb(NEW) - 'actor_user_id') =
         (to_jsonb(OLD) - 'actor_user_id') THEN
    NEW.metadata := OLD.metadata || '{"actor_deleted": true}'::jsonb;
    RETURN NEW;
  END IF;

  -- Preserve normal account deletion: the auth.users parent is already gone
  -- when its ON DELETE CASCADE reaches this row. All other ledger rewrites and
  -- direct deletes remain forbidden, including service-role mistakes.
  IF TG_OP = 'DELETE'
     AND NOT EXISTS (
       SELECT 1 FROM auth.users WHERE id = OLD.user_id
     ) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'heart_ledger is immutable';
END;
$$;

CREATE TRIGGER heart_ledger_is_immutable
  BEFORE UPDATE OR DELETE ON public.heart_ledger
  FOR EACH ROW EXECUTE FUNCTION public.reject_heart_ledger_mutation();

-- Serialise reward application for one learner. Each hourly reward has a
-- deterministic key, so retries cannot append a duplicate grant.
CREATE OR REPLACE FUNCTION public.apply_due_heart_rewards(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance public.heart_balances%ROWTYPE;
  rewards_due integer;
  i integer;
  reward_at timestamptz;
BEGIN
  SELECT * INTO current_balance
  FROM public.heart_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND
     OR current_balance.balance >= 5
     OR current_balance.next_reward_at IS NULL THEN
    RETURN;
  END IF;

  rewards_due := LEAST(
    5 - current_balance.balance,
    FLOOR(EXTRACT(EPOCH FROM (
      clock_timestamp() - current_balance.next_reward_at
    )) / 3600)::integer + 1
  );
  IF rewards_due <= 0 THEN
    RETURN;
  END IF;

  FOR i IN 1..rewards_due LOOP
    reward_at := current_balance.next_reward_at + ((i - 1) * INTERVAL '1 hour');
    current_balance.balance := current_balance.balance + 1;

    INSERT INTO public.heart_ledger (
      user_id, delta, balance_after, reason, actor_type, actor_user_id,
      occurred_at, idempotency_key, metadata
    ) VALUES (
      p_user_id, 1, current_balance.balance, 'scheduled_regeneration',
      'system', NULL, clock_timestamp(),
      'scheduled-regeneration:' ||
        to_char(reward_at AT TIME ZONE 'UTC', 'YYYYMMDDHH24MISS.US'),
      jsonb_build_object('scheduled_for', reward_at)
    );
  END LOOP;

  current_balance.version := current_balance.version + 1;
  UPDATE public.heart_balances
  SET balance = current_balance.balance,
      next_reward_at = CASE
        WHEN current_balance.balance = 5 THEN NULL
        ELSE reward_at + INTERVAL '1 hour'
      END,
      version = current_balance.version,
      updated_at = clock_timestamp()
  WHERE user_id = p_user_id;
END;
$$;

-- Learner-facing read. It first materialises due scheduled rewards on the
-- server, then returns a versioned display projection.
CREATE OR REPLACE FUNCTION public.get_heart_balance()
RETURNS TABLE (balance integer, next_reward_at timestamptz, version bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  PERFORM public.apply_due_heart_rewards(uid);
  RETURN QUERY
    SELECT hb.balance, hb.next_reward_at, hb.version
    FROM public.heart_balances hb
    WHERE hb.user_id = uid;
END;
$$;

-- Atomically consume a heart. Identity and reason are server-derived; a replay
-- of the same UUID cannot debit twice. An existing regeneration schedule is
-- preserved rather than postponed by successive wrong answers.
CREATE OR REPLACE FUNCTION public.spend_heart(p_idempotency_key uuid)
RETURNS TABLE (
  balance integer,
  spent boolean,
  next_reward_at timestamptz,
  version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  current_balance public.heart_balances%ROWTYPE;
  prior public.heart_ledger%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'idempotency key required';
  END IF;

  PERFORM public.apply_due_heart_rewards(uid);
  SELECT * INTO current_balance
  FROM public.heart_balances
  WHERE user_id = uid
  FOR UPDATE;

  -- Fail closed if an account somehow missed both allocation paths.
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, false, NULL::timestamptz, 0::bigint;
    RETURN;
  END IF;

  SELECT * INTO prior
  FROM public.heart_ledger
  WHERE user_id = uid
    AND idempotency_key = p_idempotency_key::text;
  IF FOUND THEN
    RETURN QUERY SELECT
      current_balance.balance,
      prior.delta < 0,
      current_balance.next_reward_at,
      current_balance.version;
    RETURN;
  END IF;

  IF current_balance.balance = 0 THEN
    RETURN QUERY SELECT
      0, false, current_balance.next_reward_at, current_balance.version;
    RETURN;
  END IF;

  current_balance.balance := current_balance.balance - 1;
  current_balance.next_reward_at := COALESCE(
    current_balance.next_reward_at,
    clock_timestamp() + INTERVAL '1 hour'
  );
  current_balance.version := current_balance.version + 1;

  UPDATE public.heart_balances
  SET balance = current_balance.balance,
      next_reward_at = current_balance.next_reward_at,
      version = current_balance.version,
      updated_at = clock_timestamp()
  WHERE user_id = uid;

  INSERT INTO public.heart_ledger (
    user_id, delta, balance_after, reason, actor_type, actor_user_id,
    occurred_at, idempotency_key
  ) VALUES (
    uid, -1, current_balance.balance, 'incorrect_answer', 'learner', uid,
    clock_timestamp(), p_idempotency_key::text
  );

  RETURN QUERY SELECT
    current_balance.balance,
    true,
    current_balance.next_reward_at,
    current_balance.version;
END;
$$;

-- Trusted grant path for purchases, support corrections and automated test
-- setup. Browser roles cannot execute it. The projection and ledger append are
-- one locked transaction and the caller supplies an idempotency UUID.
CREATE OR REPLACE FUNCTION public.grant_hearts(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (balance integer, granted integer, next_reward_at timestamptz, version bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance public.heart_balances%ROWTYPE;
  prior public.heart_ledger%ROWTYPE;
  grant_amount integer;
BEGIN
  IF p_user_id IS NULL
     OR p_idempotency_key IS NULL
     OR p_amount IS NULL
     OR p_amount < 1
     OR p_amount > 5
     OR p_metadata IS NULL
     OR jsonb_typeof(p_metadata) <> 'object' THEN
    RAISE EXCEPTION 'invalid heart grant';
  END IF;

  PERFORM public.apply_due_heart_rewards(p_user_id);
  SELECT * INTO current_balance
  FROM public.heart_balances
  WHERE user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'heart balance not found';
  END IF;

  SELECT * INTO prior
  FROM public.heart_ledger
  WHERE user_id = p_user_id
    AND idempotency_key = p_idempotency_key::text;
  IF FOUND THEN
    RETURN QUERY SELECT
      current_balance.balance,
      GREATEST(prior.delta, 0),
      current_balance.next_reward_at,
      current_balance.version;
    RETURN;
  END IF;

  grant_amount := LEAST(p_amount, 5 - current_balance.balance);
  IF grant_amount <= 0 THEN
    INSERT INTO public.heart_ledger (
      user_id, delta, balance_after, reason, actor_type, actor_user_id,
      occurred_at, idempotency_key, metadata
    ) VALUES (
      p_user_id, 0, current_balance.balance, 'approved_purchase',
      'system', NULL, clock_timestamp(), p_idempotency_key::text,
      p_metadata || jsonb_build_object('outcome', 'already_at_cap')
    );
    RETURN QUERY SELECT
      current_balance.balance, 0, current_balance.next_reward_at,
      current_balance.version;
    RETURN;
  END IF;

  current_balance.balance := current_balance.balance + grant_amount;
  current_balance.version := current_balance.version + 1;
  IF current_balance.balance = 5 THEN
    current_balance.next_reward_at := NULL;
  END IF;

  UPDATE public.heart_balances
  SET balance = current_balance.balance,
      next_reward_at = current_balance.next_reward_at,
      version = current_balance.version,
      updated_at = clock_timestamp()
  WHERE user_id = p_user_id;

  INSERT INTO public.heart_ledger (
    user_id, delta, balance_after, reason, actor_type, actor_user_id,
    occurred_at, idempotency_key, metadata
  ) VALUES (
    p_user_id, grant_amount, current_balance.balance, 'approved_purchase',
    'system', NULL, clock_timestamp(), p_idempotency_key::text, p_metadata
  );

  RETURN QUERY SELECT
    current_balance.balance, grant_amount, current_balance.next_reward_at,
    current_balance.version;
END;
$$;

-- New accounts receive their initial allocation in the same ledger used by
-- every later spend and reward.
CREATE OR REPLACE FUNCTION public.create_initial_heart_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.heart_balances (user_id, balance, next_reward_at)
  VALUES (NEW.id, 5, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.heart_ledger (
    user_id, delta, balance_after, reason, actor_type, actor_user_id,
    occurred_at, idempotency_key
  ) VALUES (
    NEW.id, 5, 5, 'initial_allocation', 'system', NULL,
    clock_timestamp(), 'initial-allocation:' || NEW.id::text
  ) ON CONFLICT (user_id, idempotency_key) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_initial_heart_balance_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_heart_balance();

-- Existing accounts intentionally receive five, regardless of their retired
-- browser-writable value. Creating the trigger first and locking auth.users
-- closes the signup race: later inserts wait and are handled by the trigger.
LOCK TABLE auth.users IN SHARE ROW EXCLUSIVE MODE;

WITH allocated AS (
  INSERT INTO public.heart_balances (user_id, balance, next_reward_at)
  SELECT id, 5, NULL
  FROM auth.users
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
)
INSERT INTO public.heart_ledger (
  user_id, delta, balance_after, reason, actor_type, actor_user_id,
  occurred_at, idempotency_key, metadata
)
SELECT
  user_id, 5, 5, 'migration_allocation', 'system', NULL,
  clock_timestamp(), 'migration-allocation:' || user_id::text,
  jsonb_build_object('policy', 'deterministic-five-no-legacy-import')
FROM allocated;

REVOKE ALL ON FUNCTION public.apply_due_heart_rewards(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_initial_heart_balance()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.reject_heart_ledger_mutation()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_legacy_heart_columns()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_heart_balance()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.spend_heart(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.grant_hearts(uuid, integer, uuid, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_heart_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_heart(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_hearts(uuid, integer, uuid, jsonb)
  TO service_role;
