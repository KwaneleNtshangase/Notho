import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin identity helpers for internal routes.
 *
 * Authority order (OR'd in requireAdmin):
 *   1. DB flag   - profiles.is_admin = true (authoritative; survives env changes)
 *   2. Env list  - ADMIN_EMAILS env var (secondary; useful for extra operators)
 *   3. Owner     - OWNER_ADMIN_EMAIL, always treated as admin so the founder
 *                  can open /admin without first flipping a DB row or an env var
 *
 * Everyone else fails closed.
 */

/** Founder mailbox. Used as the desk sign-in default and as a bootstrap allow-list. */
export const OWNER_ADMIN_EMAIL = "kwanelebc031@gmail.com";

/**
 * Returns the list of admin emails: ADMIN_EMAILS plus the owner mailbox.
 */
export function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS ?? "";
  const fromEnv = env
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set(fromEnv);
  set.add(OWNER_ADMIN_EMAIL.toLowerCase());
  return [...set];
}

/**
 * Returns true if the given email is the owner mailbox or is in ADMIN_EMAILS.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Authoritative admin check via the DB flag.
 *
 * Queries profiles.is_admin using the passed service-role client
 * (which bypasses RLS), so the result is trustworthy regardless of
 * the caller's own RLS policies.
 *
 * Returns false on any error (network, missing row, etc.) - fails closed.
 *
 * @param adminClient  A Supabase client created with the service-role key.
 * @param userId       The auth.users.id of the user to check.
 */
export async function isAdminUser(
  adminClient: SupabaseClient,
  userId: string,
): Promise<boolean> {
  try {
    const { data, error } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return false;
    return (data as { is_admin: boolean }).is_admin === true;
  } catch {
    return false;
  }
}
