/**
 * The single place the app's From address is defined.
 *
 * It used to be hardcoded in six files. That is fine until the sending domain
 * moves, at which point six edits are six chances to miss one - and the one you
 * miss is silent, because Resend rejects mail from an unverified domain rather
 * than degrading. The bug-alert route was the dangerous one: miss that and you
 * stop hearing about bugs, with no symptom to tell you.
 *
 * MAIL_FROM_ADDRESS lets the address be swapped in Vercel without a deploy,
 * which matters during the notho.co.za cutover: verify the domain in Resend,
 * flip the env var, done. If verification fails you flip it back in seconds.
 *
 * The fallback is deliberately the OLD domain. It is the one currently verified
 * in Resend, so an environment with no variable set keeps sending rather than
 * going quiet. See docs/EMAIL-MIGRATION-NOTHO.md.
 */

/** Transactional sender: lifecycle emails, welcome, feedback replies. */
export const MAIL_FROM = process.env.MAIL_FROM_ADDRESS || "Notho <hello@fundiapp.co.za>";

/**
 * Where automated bug alerts land. Separate from MAIL_FROM on purpose - this is
 * a human inbox, not a sending identity, and it must never accidentally inherit
 * a change to the sending domain.
 */
export const ALERT_TO = process.env.ALERT_EMAIL || "kwanelebc031@gmail.com";
