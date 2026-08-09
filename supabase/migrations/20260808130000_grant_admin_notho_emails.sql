-- ============================================================================
-- Grant admin access to the current owner emails
-- ----------------------------------------------------------------------------
-- WHY
--   20260711000000_admin_is_admin_flag.sql backfilled is_admin for
--   'kwanelebc031@gmail.com' and 'hello@fundiapp.co.za'. The fundiapp →notho
--   rebrand means the second address is now 'hello@notho.co.za', so nobody on
--   the new domain can reach /admin/* until this runs.
--
--   The old fundiapp address is deliberately left as-is rather than revoked:
--   docs/REBRAND-NOTHO.md keeps that domain alive for ~12 months, and removing
--   access to a mailbox that still receives mail is a lockout risk, not a
--   security win.
--
-- SAFE TO RE-RUN. Only sets the flag; never clears it.
--
-- NOTE ON ORDERING
--   This can only grant access to an account that already exists. If an address
--   has not signed up yet, the NOTICE below tells you so, and the ADMIN_EMAILS
--   env var (already supported by src/lib/admin.ts) covers that case without a
--   database change.
-- ============================================================================

DO $$
DECLARE
  target_emails text[] := ARRAY[
    'kwanelebc031@gmail.com',
    'hello@notho.co.za'
  ];
  addr     text;
  uid      uuid;
  granted  int := 0;
BEGIN
  FOREACH addr IN ARRAY target_emails LOOP
    SELECT id INTO uid FROM auth.users WHERE lower(email) = addr;

    IF uid IS NULL THEN
      RAISE NOTICE
        'No account found for %. Sign up with this address first, then re-run '
        'this migration - or add it to the ADMIN_EMAILS env var instead.', addr;
      CONTINUE;
    END IF;

    -- profiles.user_id is the FK to auth.users.id. A user can exist in
    -- auth.users without a profiles row (the row is created on first app load),
    -- so insert one if it is missing rather than silently doing nothing.
    INSERT INTO public.profiles (user_id, is_admin)
    VALUES (uid, true)
    ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

    granted := granted + 1;
    RAISE NOTICE 'Admin access granted to %.', addr;
  END LOOP;

  RAISE NOTICE 'Done: % of % addresses granted admin access.',
    granted, array_length(target_emails, 1);
END;
$$;

-- ── Verification ────────────────────────────────────────────────────────────
-- Run this afterwards to see exactly who can reach /admin/*:
--
--   SELECT u.email, p.is_admin
--     FROM public.profiles p
--     JOIN auth.users u ON u.id = p.user_id
--    WHERE p.is_admin = true
--    ORDER BY u.email;
