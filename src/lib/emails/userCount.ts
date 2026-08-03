import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * How many confirmed users exist right now.
 *
 * Used only to put "that makes 33 confirmed users" in the founder's signup
 * alert. That single number is the difference between a notification and a
 * progress report, which is worth one cheap query.
 *
 * Counts CONFIRMED users only, so it matches what the welcome email and the
 * broadcast audience both use, and never contradicts them.
 *
 * Returns null rather than throwing. A failed count must never stop a signup
 * alert going out, let alone a user's welcome email.
 */
export async function countConfirmedUsers(admin: SupabaseClient): Promise<number | null> {
  try {
    let total = 0;
    const perPage = 1000;
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return null;
      const users = data?.users ?? [];
      for (const u of users) {
        if (u.email_confirmed_at || (u as { confirmed_at?: string }).confirmed_at) total += 1;
      }
      if (users.length < perPage) break;
    }
    return total;
  } catch {
    return null;
  }
}
