/**
 * "Someone joined Notho" alert, sent to the founder.
 *
 * Deliberately fires at the same moment as the welcome email rather than on
 * account creation. Signup and confirmation are different events: signup
 * includes typo'd addresses and people who never come back, and alerting on it
 * would mean most notifications were about users who do not exist. Confirmation
 * is the point someone becomes real.
 *
 * Sharing the welcome email's trigger buys two things for free:
 *   - the same `retention_fired` ledger, so nobody is alerted twice
 *   - the daily cron backstop, so someone who confirms and never opens the app
 *     is still reported the next morning instead of vanishing
 *
 * This is an internal email to one person, so no unsubscribe link and no
 * marketing shell - it is a notification, and it should read like one.
 */

import { ALERT_TO } from "./sender";
import type { BuiltEmail, EmailProfile } from "./lifecycle";

const GOAL_LABELS: Record<string, string> = {
  "debt-free": "Get debt-free",
  emergency: "Build an emergency fund",
  invest: "Start investing",
  home: "Save for a home",
  retire: "Plan for retirement",
  business: "Grow my business",
};

export type SignupAlertInput = {
  email: string;
  /** Profile name, else the name given at signup, else empty. */
  name?: string | null;
  goal?: string | null;
  /** Total confirmed users AFTER this one. Omitted if the count failed. */
  totalUsers?: number | null;
  /** How they signed up, e.g. "email" or "google". */
  provider?: string | null;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:4px 0;color:#6b7280;width:96px;vertical-align:top">${label}</td>
    <td style="padding:4px 0;color:#111827">${value}</td>
  </tr>`;
}

export function buildSignupAlert(input: SignupAlertInput): BuiltEmail {
  const name = (input.name ?? "").trim();
  const goal = input.goal ? (GOAL_LABELS[input.goal] ?? input.goal) : "";
  const when = new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "short",
  });

  // mailto rather than a console link. The point of knowing quickly is being
  // able to say hello the same day, and one tap should start that.
  const subject = name ? `New Notho user: ${name}` : `New Notho user: ${input.email}`;
  const greeting = name ? name.split(/\s+/)[0] : "there";
  const mailto =
    `mailto:${encodeURIComponent(input.email)}` +
    `?subject=${encodeURIComponent("Welcome to Notho")}` +
    `&body=${encodeURIComponent(`Hi ${greeting},\n\nI'm Kwanele, I built Notho. Just saw you joined - thank you.\n\nIf there's one money thing you're trying to get a handle on, tell me and I'll point you at the right lesson.\n\nKwanele`)}`;

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
    <h2 style="margin:0 0 4px;font-size:19px;color:#007A85">Someone joined Notho</h2>
    ${input.totalUsers ? `<p style="margin:0 0 16px;font-size:13px;color:#6b7280">That makes ${input.totalUsers} confirmed users.</p>` : ""}
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
      ${row("Name", name ? esc(name) : '<span style="color:#9ca3af">not given</span>')}
      ${row("Email", `<a href="mailto:${esc(input.email)}" style="color:#007A85">${esc(input.email)}</a>`)}
      ${goal ? row("Goal", esc(goal)) : ""}
      ${input.provider ? row("Signed up", esc(input.provider)) : ""}
      ${row("When", `${esc(when)} (SAST)`)}
    </table>
    <p style="margin:20px 0 0">
      <a href="${mailto}" style="display:inline-block;padding:11px 20px;background:#007A85;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">Say hello</a>
    </p>
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af">
      Sent when a new user confirms their email address.
    </p>
  </div>`;

  const text = [
    "Someone joined Notho",
    input.totalUsers ? `That makes ${input.totalUsers} confirmed users.` : "",
    "",
    `Name:  ${name || "not given"}`,
    `Email: ${input.email}`,
    goal ? `Goal:  ${goal}` : "",
    input.provider ? `Via:   ${input.provider}` : "",
    `When:  ${when} (SAST)`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/**
 * Send the alert. Never throws and never blocks the caller: a failed founder
 * notification must not stop a user's welcome email or break their signup.
 */
export async function sendSignupAlert(
  resendKey: string,
  input: SignupAlertInput
): Promise<void> {
  try {
    const built = buildSignupAlert(input);
    const { MAIL_FROM } = await import("./sender");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [ALERT_TO],
        reply_to: input.email,
        subject: built.subject,
        html: built.html,
        text: built.text,
      }),
    });
  } catch {
    /* best effort - the user's own email matters more than this one */
  }
}

/** Profile shape the alert needs, so callers can pass what they already have. */
export type SignupAlertProfile = EmailProfile;
