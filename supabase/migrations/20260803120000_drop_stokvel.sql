-- ============================================================================
-- Drop the stokvel (group savings) feature.
--
-- The feature was removed from the app on 2026-08-03: it added surface area
-- and complexity without a clear job to do for users. The frontend is already
-- gone; this migration removes the database objects behind it.
--
-- ⚠️  NOT YET APPLIED — THIS IS DESTRUCTIVE AND IRREVERSIBLE.
--
--     Any stokvel groups, memberships and logged contributions real users
--     created are permanently deleted. Before running this:
--
--       1. Check whether anyone actually used it:
--            select count(*) from stokvels;
--            select count(*) from stokvel_members;
--            select count(*) from stokvel_contributions;
--       2. If there are rows you care about, back them up first:
--            \copy (select * from stokvels) to 'stokvels.csv' csv header
--            (repeat for stokvel_members, stokvel_contributions)
--       3. Only then apply.
--
--     Once applied, delete the LEGACY stokvel cleanup blocks in
--     src/app/api/account/delete/route.ts — they become dead code.
--
-- Scope note: this touches ONLY stokvel objects. The streak-freeze functions
-- that share a migration file with the stokvel authz hardening
-- (use_streak_freeze, auto_apply_streak_freezes) are unrelated and stay.
--
-- "Stokvel" also survives as a budget CATEGORY and as lesson content. That is
-- deliberate — users still pay into real-world stokvels and need to track and
-- understand them. Nothing here affects categorisation or the budget report.
-- ============================================================================

BEGIN;

-- ── RPCs ────────────────────────────────────────────────────────────────────
-- Dropped before the tables: create_stokvel and join_stokvel_by_code are
-- SECURITY DEFINER and would otherwise briefly outlive the tables they write
-- to. is_stokvel_admin / is_stokvel_creator exist only for the RLS policies
-- below and are not referenced by any other migration.
DROP FUNCTION IF EXISTS public.create_stokvel(text, text, numeric);
DROP FUNCTION IF EXISTS public.join_stokvel_by_code(text);
DROP FUNCTION IF EXISTS public.is_stokvel_admin(uuid);
DROP FUNCTION IF EXISTS public.is_stokvel_creator(uuid);

-- ── Policies ────────────────────────────────────────────────────────────────
-- DROP TABLE removes these implicitly; they are listed explicitly so that a
-- partial/manual run of this file leaves nothing behind, and so the objects
-- being destroyed are auditable from the migration alone.
DROP POLICY IF EXISTS "Members can view contributions"    ON stokvel_contributions;
DROP POLICY IF EXISTS "Users can insert own contributions" ON stokvel_contributions;
DROP POLICY IF EXISTS "Members can view stokvel members"  ON stokvel_members;
DROP POLICY IF EXISTS "Users can join stokvels"           ON stokvel_members;
DROP POLICY IF EXISTS "Admins can update members"         ON stokvel_members;
DROP POLICY IF EXISTS "Members can view stokvels"         ON stokvels;
DROP POLICY IF EXISTS "Users can create stokvels"         ON stokvels;
DROP POLICY IF EXISTS "Creators can update stokvels"      ON stokvels;
DROP POLICY IF EXISTS "Creators can delete stokvels"      ON stokvels;

-- ── Tables ──────────────────────────────────────────────────────────────────
-- Child tables first so foreign keys never block the drop. No CASCADE on the
-- parent: if something outside these three tables still references stokvels,
-- this should fail loudly rather than silently destroy it.
DROP TABLE IF EXISTS stokvel_contributions;
DROP TABLE IF EXISTS stokvel_members;
DROP TABLE IF EXISTS stokvels;

COMMIT;
