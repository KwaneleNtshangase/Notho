# Notho — Auth & RLS Authorization Review

**Date:** 10 July 2026
**Scope:** Authentication helpers (`src/lib/apiAuth.ts`, `src/lib/admin.ts`), Supabase RLS policies and `SECURITY DEFINER` functions (`supabase/migrations/*`), and the client paths that call them (`StokvelDashboard.tsx`, `useProgress.ts`).
**Focus:** Deviations from standard secure access-control practice, logic flaws, and authorization hardening. This complements — and in two places corrects — `SECURITY-AUDIT-2026-07-10.md`.

## Summary of findings

The JWT verification helper and the two cross-device RPCs (`apply_progress_delta`, `spend_xp`) are done correctly — they verify `auth.uid()` and fail closed. The problems are concentrated in the **stokvel (group savings) module** and in the **streak-freeze `SECURITY DEFINER` functions**, where several controls can be bypassed by an ordinary authenticated user.

| # | Severity | Issue | Class |
|---|----------|-------|-------|
| A1 | **Critical** | `stokvel_members` lets a user join *any* stokvel **as admin** (`is_admin` is client-set, no invite-code enforcement) | Privilege escalation / broken access control |
| A2 | **High** | `use_streak_freeze(p_user_id)` is `SECURITY DEFINER` with **no `auth.uid()` check** — any user can burn another user's freeze tokens | IDOR / missing authorization |
| A3 | **High** | `SECURITY DEFINER` functions callable by everyone via the default `PUBLIC` execute grant (incl. the cron-only `auto_apply_streak_freezes`) | Excessive privilege |
| A4 | **High** | Missing `SET search_path` on `use_streak_freeze` / `auto_apply_streak_freezes` (audit L4 states the opposite — it is **wrong**) | Search-path hijack |
| A5 | **Medium** | Stokvel contributions: no membership check on insert, no UPDATE/DELETE policy; members can write rows for arbitrary stokvels | Broken access control / integrity |
| A6 | **Medium** | `stokvels` SELECT policy makes join-by-invite-code impossible (functional break the code "works around") and recursive `stokvel_members` admin policy risks RLS recursion errors | Logic flaw / RLS recursion |
| A7 | **Low** | `user_progress` "for all" policy has no explicit `WITH CHECK`; `get_leaderboard` anon grant + `full_name` (restating audit H3 for completeness) | Hardening |

---

## A1 — Critical: join any stokvel, as admin, by setting a client-controlled flag

`20260704091528_stokvel.sql`:

```sql
CREATE POLICY "Users can join stokvels" ON stokvel_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

The only thing this policy checks is that the row you insert has *your own* `user_id`. It does **not** check that:

1. you actually hold the invite code for `stokvel_id`, and
2. `is_admin` is `false`.

`StokvelDashboard.tsx` inserts `is_admin` directly from the client (`is_admin: true` on create, `false` on join), so the flag is fully attacker-controlled. Because the insert bypasses nothing — RLS is the *only* gate — any authenticated user can run:

```js
await supabase.from("stokvel_members").insert({
  stokvel_id: "<any stokvel uuid>",   // enumerable; no code needed
  user_id: myUserId,                   // passes user_id = auth.uid()
  is_admin: true,                      // instant admin
});
```

That grants them the `"Admins can update members"` capability over a stokvel they were never invited to — they can reorder payout positions, and combined with A5/A6 they can read all members and contributions of that group. For a savings product where payout order equals money, this is the most serious issue in the codebase.

**Fix — never trust the client for membership or role. Gate joins on the invite code with a `SECURITY DEFINER` join RPC, and force `is_admin = false` at the RLS layer.**

```sql
-- 1) Lock down the flag even on the direct-insert path:
DROP POLICY IF EXISTS "Users can join stokvels" ON stokvel_members;

CREATE POLICY "Users can join stokvels" ON stokvel_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND is_admin = false          -- self-service joins are never admin
  );

-- 2) Preferred path: a definer RPC that requires the invite code and
--    performs the join atomically. Clients call this instead of a raw insert.
CREATE OR REPLACE FUNCTION public.join_stokvel_by_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_stokvel_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'forbidden: not authenticated';
  END IF;

  SELECT id INTO v_stokvel_id
  FROM public.stokvels
  WHERE invite_code = upper(trim(p_code));

  IF v_stokvel_id IS NULL THEN
    RAISE EXCEPTION 'invalid invite code';
  END IF;

  INSERT INTO public.stokvel_members (stokvel_id, user_id, is_admin, display_name)
  VALUES (v_stokvel_id, v_uid, false, 'Member')
  ON CONFLICT (stokvel_id, user_id) DO NOTHING;

  RETURN v_stokvel_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_stokvel_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_stokvel_by_code(text) TO authenticated;
```

Then the creator becomes admin server-side (in a `create_stokvel` RPC or a trigger), never via a client-set `is_admin: true`.

---

## A2 — High: `use_streak_freeze` lets any user mutate another user's row (IDOR)

`20260519120000_fix_use_streak_freeze_last_activity.sql` (latest definition):

```sql
CREATE OR REPLACE FUNCTION use_streak_freeze(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER          -- bypasses RLS
AS $$
...
  UPDATE user_progress
     SET streak_freeze_count = streak_freeze_count - 1, ...
   WHERE user_id = p_user_id;   -- p_user_id is caller-supplied, never checked
```

Compare this with `apply_progress_delta` and `spend_xp` in `20260623000000_cross_device_merge_rpcs.sql`, which both correctly guard:

```sql
IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
  RAISE EXCEPTION 'forbidden: cannot modify progress for another user';
END IF;
```

`use_streak_freeze` has **no such guard** and runs as definer, so any caller who passes someone else's UUID will decrement *that user's* freeze tokens and overwrite their `last_activity_date`. It's a textbook Insecure Direct Object Reference: authorization is missing, and the object key comes straight from the request.

**Fix — add the same caller check and stop taking the id from the client:**

```sql
CREATE OR REPLACE FUNCTION public.use_streak_freeze(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_freezes integer;
  v_streak  integer;
  sast_today     date := (now() AT TIME ZONE 'Africa/Johannesburg')::date;
  sast_yesterday date := sast_today - INTERVAL '1 day';
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: cannot use a freeze for another user';
  END IF;

  SELECT streak_freeze_count, streak
    INTO v_freezes, v_streak
    FROM public.user_progress
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_progress_row');
  END IF;
  IF v_freezes <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_freezes_left', 'streak', v_streak);
  END IF;

  UPDATE public.user_progress
     SET streak_freeze_count   = streak_freeze_count - 1,
         streak_freeze_used_at = now(),
         last_activity_date    = sast_yesterday,
         updated_at            = now()
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'streak', v_streak, 'freezes_left', v_freezes - 1);
END;
$$;

REVOKE ALL ON FUNCTION public.use_streak_freeze(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.use_streak_freeze(uuid) TO authenticated;
```

---

## A3 — High: `SECURITY DEFINER` functions inherit the default `PUBLIC` execute grant

In Postgres, a newly created function is granted `EXECUTE` to `PUBLIC` unless you revoke it. Neither `use_streak_freeze` nor `auto_apply_streak_freezes` has any `REVOKE`/`GRANT`, so both are callable by `anon` and `authenticated`. That is especially dangerous for the cron-only function:

```sql
-- 20260505000000_auto_streak_freeze.sql — runs as definer, mutates EVERY user's row
CREATE OR REPLACE FUNCTION auto_apply_streak_freezes() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$ ... UPDATE user_progress ... $$;
```

Any authenticated user can invoke `select auto_apply_streak_freezes()` and force a bulk mutation across all users. This should only be reachable by the cron role.

**Fix — fail closed by revoking `PUBLIC` and granting narrowly:**

```sql
REVOKE ALL ON FUNCTION public.auto_apply_streak_freezes() FROM PUBLIC;
-- do NOT grant to authenticated/anon; pg_cron runs as a superuser/owner and
-- does not need the grant. If you use a dedicated cron role, grant only to it.

-- Apply the same pattern to every SECURITY DEFINER function:
REVOKE ALL ON FUNCTION public.use_streak_freeze(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.use_streak_freeze(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC;   -- see A7
GRANT  EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
```

Make "revoke from PUBLIC, then grant to the minimum role" the standard footer for every function migration.

---

## A4 — High: missing `SET search_path` (audit L4 is incorrect)

`SECURITY-AUDIT-2026-07-10.md` L4 claims *"the streak/leaderboard functions correctly set `search_path = public`."* That is only true for `get_leaderboard`. The streak-freeze definer functions do **not** set it:

- `20260501000000_streak_freeze.sql` → `use_streak_freeze`: no `SET search_path`
- `20260505000000_auto_streak_freeze.sql` → `auto_apply_streak_freezes`: no `SET search_path`
- `20260519000000_*` / `20260519120000_*` (redefinitions of the above): no `SET search_path`

A `SECURITY DEFINER` function without a pinned `search_path` is the canonical search-path-hijack sink: an attacker who can create objects in a schema earlier on the resolution path can shadow an unqualified name (`user_progress`, `now`, etc.) and have it execute with the definer's rights. Every definer function must pin it:

```sql
... LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public   -- add to use_streak_freeze AND auto_apply_streak_freezes
AS $$ ... $$;
```

(The corrected bodies in A2/A3 already include this.) The audit line should be updated to "only `get_leaderboard` set it; the streak functions did not."

---

## A5 — Medium: stokvel contributions lack membership and mutation controls

`20260704091528_stokvel.sql`:

```sql
CREATE POLICY "Users can insert own contributions" ON stokvel_contributions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());   -- no check that the user belongs to stokvel_id
```

Two gaps: (1) a user can insert a contribution row for **any** `stokvel_id`, member or not — combined with A1 this pollutes another group's ledger; (2) there is **no UPDATE and no DELETE policy**, so with RLS enabled those operations are silently denied for everyone, including legitimate corrections. Decide the intended behavior and state it explicitly.

**Fix — require membership on insert; add scoped update/delete (owner or stokvel admin):**

```sql
DROP POLICY IF EXISTS "Users can insert own contributions" ON stokvel_contributions;

CREATE POLICY "Members insert own contributions" ON stokvel_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_stokvel_member(stokvel_id, auth.uid())   -- helper from A6
  );

CREATE POLICY "Owner or admin edits contributions" ON stokvel_contributions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_stokvel_admin(stokvel_id, auth.uid())
  );

CREATE POLICY "Owner or admin deletes contributions" ON stokvel_contributions
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_stokvel_admin(stokvel_id, auth.uid())
  );
```

---

## A6 — Medium: join-by-code is broken by the SELECT policy, and the admin policy risks RLS recursion

Two related issues in the same migration.

**(a) SELECT policy makes invite joins impossible.** `stokvels` is only visible to existing members:

```sql
CREATE POLICY "Members can view stokvels" ON stokvels
  FOR SELECT USING (id IN (SELECT stokvel_id FROM stokvel_members WHERE user_id = auth.uid()));
```

But `handleJoin` tries to look the stokvel up *by invite code before joining* (`StokvelDashboard.tsx:165`), which RLS blocks — the code comment even admits it's guessing at a "bypass." The correct fix is to not read the table at all from the client and go through `join_stokvel_by_code` (A1), which resolves the code under definer rights.

**(b) Self-referential admin policy risks infinite recursion.** A policy on `stokvel_members` that sub-queries `stokvel_members` re-triggers the table's own policies and Postgres raises `infinite recursion detected in policy`:

```sql
CREATE POLICY "Admins can update members" ON stokvel_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stokvel_members
            WHERE stokvel_id = stokvel_members.stokvel_id   -- ambiguous + recursive
            AND user_id = auth.uid() AND is_admin = true));
```

The standard Supabase remedy is to push the membership/role lookup into a `SECURITY DEFINER` helper that reads the table without re-invoking RLS:

```sql
CREATE OR REPLACE FUNCTION public.is_stokvel_member(p_stokvel uuid, p_uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.stokvel_members
                 WHERE stokvel_id = p_stokvel AND user_id = p_uid);
$$;

CREATE OR REPLACE FUNCTION public.is_stokvel_admin(p_stokvel uuid, p_uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.stokvel_members
                 WHERE stokvel_id = p_stokvel AND user_id = p_uid AND is_admin = true);
$$;

REVOKE ALL ON FUNCTION public.is_stokvel_member(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_stokvel_admin(uuid,uuid)  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_stokvel_member(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_stokvel_admin(uuid,uuid)  TO authenticated;

-- Rewrite the member/view/update policies in terms of the helpers:
DROP POLICY IF EXISTS "Members can view stokvel members" ON stokvel_members;
CREATE POLICY "Members can view stokvel members" ON stokvel_members
  FOR SELECT TO authenticated
  USING (public.is_stokvel_member(stokvel_id, auth.uid()));

DROP POLICY IF EXISTS "Admins can update members" ON stokvel_members;
CREATE POLICY "Admins can update members" ON stokvel_members
  FOR UPDATE TO authenticated
  USING (public.is_stokvel_admin(stokvel_id, auth.uid()))
  WITH CHECK (public.is_stokvel_admin(stokvel_id, auth.uid()));

-- Also scope stokvels visibility through the helper (avoids the raw subquery):
DROP POLICY IF EXISTS "Members can view stokvels" ON stokvels;
CREATE POLICY "Members can view stokvels" ON stokvels
  FOR SELECT TO authenticated
  USING (public.is_stokvel_member(id, auth.uid()));
```

---

## A7 — Low / hardening

**`user_progress` "for all" policy has no explicit `WITH CHECK`.** `20260317000000_create_user_progress.sql`:

```sql
create policy "Users can upsert own progress" on public.user_progress
  for all using (auth.uid() = user_id);
```

Postgres defaults the missing `WITH CHECK` to the `USING` expression, so this is not currently exploitable — but relying on that default is fragile. Make it explicit, and split read from write so intent is clear:

```sql
DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_progress;

CREATE POLICY "Users modify own progress" ON public.user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**`get_leaderboard` anon grant + real-name exposure** (restating audit H3, since it is core to the RLS surface). It is `SECURITY DEFINER`, granted to `anon`, and returns `full_name` + `age_range` for every user — an unauthenticated PII enumeration (POPIA-relevant in ZA). Drop the `anon` grant and return a handle, not a legal name:

```sql
-- return `username` instead of full_name; restrict execution:
REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
-- and change the SELECT list to p.username (or an opt-in display_name), dropping age_range.
```

---

## What's correctly implemented (no change needed)

`getUserFromRequest` (`apiAuth.ts`) verifies the Bearer token via `auth.getUser(token)` and returns `null` on any failure — the right pattern. `apply_progress_delta` and `spend_xp` both check `auth.uid() <> p_user_id` and raise, and use `FOR UPDATE` row locks for atomic spends. RLS is enabled on all user-owned tables and the `auth.uid() = user_id` scoping on `user_progress`, `custom_budget_categories`, `user_settings`, `budget_import_batches`, `user_merchant_rules`, and `bank_accounts` is correct.

## Suggested remediation order

1. **A1** (stokvel admin escalation) and **A2** (freeze IDOR) — both are exploitable by any logged-in user today.
2. **A3 / A4** — apply the `REVOKE PUBLIC` + `SET search_path` footer to every definer function; these are one-line-per-function and close a broad class.
3. **A5 / A6** — land with the stokvel helper functions in the same migration.
4. **A7** — hardening; bundle with the leaderboard PII fix already tracked as audit H3.
