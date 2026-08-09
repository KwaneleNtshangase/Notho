import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The gate every non-transactional send must pass through.
 *
 * A preferences table that nothing reads is worse than no table at all: the
 * person is told their request was honoured, then keeps getting email. That is
 * the single fastest way to earn a spam complaint from someone who was trying
 * to be polite about leaving.
 *
 * So this is the only place that decides whether an email may go out, and every
 * sender calls it. One function, one rule set.
 *
 * OUT OF SCOPE, deliberately: transactional mail. Password resets, email
 * confirmations and magic links are sent by Supabase Auth and must never be
 * suppressed - an unsubscribe is a request to stop being marketed to, not a
 * request to be locked out of your own account.
 */

export type EmailKind =
  /** D+1 nudges and D7/D14/D30 milestones. The high-frequency stream. */
  | "lifecycle"
  /** Announcements and product news. Rare, and usually the one people keep. */
  | "product"
  /** The one-off inactivity survey. */
  | "winback";

type PrefRow = {
  unsubscribed_all: boolean | null;
  lifecycle_emails: boolean | null;
  product_emails: boolean | null;
  frequency: string | null;
  paused_until: string | null;
};

/**
 * Fetch preferences for a batch of users in one query.
 *
 * The crons iterate over hundreds of users; a per-user round trip would turn a
 * 5-second job into a timeout. Returns a Map so callers can look up by id.
 */
export async function loadEmailPrefs(
  admin: SupabaseClient,
  userIds: string[],
): Promise<Map<string, PrefRow>> {
  const map = new Map<string, PrefRow>();
  if (userIds.length === 0) return map;
  const { data, error } = await admin
    .from("email_preferences")
    .select("user_id, unsubscribed_all, lifecycle_emails, product_emails, frequency, paused_until")
    .in("user_id", userIds);
  // A missing table (migration not yet applied) must not silently suppress
  // every email. No row means defaults, and the default is "yes, send".
  if (error) return map;
  for (const row of data ?? []) map.set(row.user_id as string, row as PrefRow);
  return map;
}

/**
 * May we send this kind of email to this person right now?
 *
 * `prefs` undefined means no row, which means they have never expressed a
 * preference, which means yes. Opt-out, not opt-in - correct for a product
 * people signed up to, and the reason a failed prefs lookup above is safe.
 */
export function canSend(kind: EmailKind, prefs: PrefRow | undefined): boolean {
  if (!prefs) return true;

  if (prefs.unsubscribed_all) return false;

  // A pause is a hard stop for everything while it lasts, including win-back.
  // Emailing "we miss you" to somebody who asked for a month of silence is
  // exactly the wrong message at exactly the wrong time.
  if (prefs.paused_until && new Date(prefs.paused_until).getTime() > Date.now()) return false;

  switch (kind) {
    case "lifecycle":
      if (prefs.lifecycle_emails === false) return false;
      // 'weekly' and 'none' both mean "stop the daily stream". Notho does not
      // build a weekly digest yet, so 'weekly' currently suppresses the
      // per-event nudges rather than batching them. That is the honest
      // behaviour until the digest exists: fewer emails, as asked. When the
      // digest ships, this branch is where it hooks in.
      return prefs.frequency === "normal";
    case "product":
      return prefs.product_emails !== false;
    case "winback":
      // Only gated by the global switches above. Someone who turned off lesson
      // reminders has not asked us never to ask them a question, and this is
      // the one email that exists to hear from them rather than talk at them.
      return true;
  }
}
