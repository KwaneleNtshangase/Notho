/**
 * Stateless unsubscribe tokens.
 *
 * An unsubscribe link has to work from an email client, months later, with no
 * session and no login. The obvious implementations are both wrong:
 *
 *   - Putting the raw user id in the URL lets anyone who can guess or scrape a
 *     uuid unsubscribe somebody else, and leaks ids into mail-scanner logs.
 *   - A tokens table means rows to create, expire and clean up, and a link that
 *     silently dies if the row is pruned.
 *
 * So: HMAC-SHA256 over the user id, keyed with a server-side secret. The token
 * is `<userId>.<sig>`, verifiable with no lookup, forgeable only with the key,
 * and revocable en masse by rotating the key. It does not expire, which is
 * correct - an unsubscribe link in a two-year-old email must still work.
 *
 * Key selection, in order:
 *   1. UNSUBSCRIBE_SECRET  - set this. Rotating it invalidates every live link,
 *                            which is the point of having a dedicated one.
 *   2. CRON_SECRET         - already set in production, so links work the day
 *                            this ships rather than the day someone remembers
 *                            to add an env var.
 * If neither exists we throw rather than fall back to a constant. A predictable
 * key here means anyone can unsubscribe anyone.
 */

import { createHmac, createHash, timingSafeEqual } from "crypto";

function key(): string {
  const k = process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET;
  if (!k) {
    throw new Error(
      "UNSUBSCRIBE_SECRET (or CRON_SECRET) must be set to sign unsubscribe links",
    );
  }
  return k;
}

function sign(userId: string): string {
  return createHmac("sha256", key()).update(userId).digest("base64url").slice(0, 43);
}

export function makeUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/** Returns the user id if the token is authentic, else null. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  let expected: string;
  try {
    expected = sign(userId);
  } catch {
    return null;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false, and the length is not a secret.
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? userId : null;
}

/**
 * The one-way reference stored on exit_feedback.
 *
 * exit_feedback outlives the account, so it must not hold anything that can be
 * turned back into a person. This hash exists only to notice that the same
 * someone unsubscribed on Tuesday and deleted on Friday, so that is one
 * departure and not two. Peppered, so the hash cannot be recomputed from a
 * stolen table plus a list of user ids.
 */
export function userRef(userId: string): string {
  const pepper = process.env.EXIT_FEEDBACK_PEPPER || process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "";
  return createHash("sha256").update(`${userId}::${pepper}`).digest("hex").slice(0, 32);
}

/** The absolute URL to put in an email footer. */
export function unsubscribeUrl(userId: string, appUrl = "https://www.notho.co.za"): string {
  return `${appUrl}/unsubscribe?t=${encodeURIComponent(makeUnsubscribeToken(userId))}`;
}
