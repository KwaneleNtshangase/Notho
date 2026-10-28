/**
 * "Someone unsubscribed" alert, sent to the founder.
 *
 * Two separate emails, because the two events happen at different times and
 * one of them might never happen at all:
 *
 *   sendUnsubscribeAlert       - fires the moment /api/unsubscribe applies a
 *                                 choice. Always sent; this is the news that
 *                                 actually matters (someone's mail preference
 *                                 changed) and it cannot wait on anything else.
 *   sendUnsubscribeReasonAlert - fires only if the person goes on to answer
 *                                 the optional "why" survey, which is a later,
 *                                 separate request to /api/exit-feedback. Most
 *                                 people skip it, so most unsubscribes get only
 *                                 the first email.
 *
 * Holding the first email to wait for a reason that may never arrive would
 * mean the founder hears about a lost subscriber only sometimes, and always
 * late. Two emails, in order, is the honest version of "tell me now, and
 * again if there's more".
 *
 * Like signupAlert.ts, this is an internal notification to one person - no
 * marketing shell, no unsubscribe link (it would be absurd on an email about
 * an unsubscribe), and best-effort only: a failure here must never surface to
 * the person who just changed their email preference.
 *
 * PRIVACY: same standard as /api/unsubscribe/route.ts's GET handler ("First
 * name only... Never the email address"). This file never takes an email
 * address as input, on purpose - there is no field to accidentally fill in.
 * A first name is enough to say hello to in Slack; the account itself is one
 * click away in the dashboard for anyone who needs more.
 */

import { ALERT_TO } from "./sender";
import { REASON_BY_CODE, type ReasonCode } from "@/lib/churn/reasons";
import type { BuiltEmail } from "./lifecycle";

export type UnsubscribeChoice = "all" | "weekly" | "pause30" | "product_only" | "resubscribe";

const CHOICE_COPY: Record<UnsubscribeChoice, { headline: string; line: string }> = {
  all: {
    headline: "unsubscribed from all Notho emails",
    line: "Turned off every email except account ones like password resets.",
  },
  weekly: {
    headline: "switched to weekly emails",
    line: "Dropped from the normal cadence to one summary email a week.",
  },
  pause30: {
    headline: "paused emails for 30 days",
    line: "Every email is paused for 30 days, then back to normal.",
  },
  product_only: {
    headline: "turned off lesson reminders",
    line: "Lesson reminders are off. Still getting important account updates.",
  },
  // The one good-news case in the bunch, worth a different tone in the subject.
  resubscribe: {
    headline: "resubscribed to Notho emails",
    line: "Changed their mind and turned emails back on.",
  },
};

export type UnsubscribeAlertInput = {
  choice: UnsubscribeChoice;
  /** First name only - see the file header. */
  firstName?: string | null;
  daysSinceSignup?: number | null;
  lessonsCompleted?: number | null;
  streak?: number | null;
  xp?: number | null;
};

export type UnsubscribeReasonAlertInput = {
  firstName?: string | null;
  reason: ReasonCode;
  detail?: string | null;
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
    <td style="padding:4px 0;color:#6b7280;width:120px;vertical-align:top">${label}</td>
    <td style="padding:4px 0;color:#111827">${value}</td>
  </tr>`;
}

function sastNow(): string {
  return new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "short",
  });
}

/** "3 months" rather than a raw day count, once it gets past a few weeks. */
function formatTenure(days: number): string {
  if (days < 1) return "joined today";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

function activityLine(input: {
  daysSinceSignup?: number | null;
  lessonsCompleted?: number | null;
  streak?: number | null;
  xp?: number | null;
}): string {
  const parts: string[] = [];
  if (typeof input.lessonsCompleted === "number") parts.push(`${input.lessonsCompleted} lesson${input.lessonsCompleted === 1 ? "" : "s"} done`);
  if (typeof input.xp === "number") parts.push(`${input.xp} XP`);
  if (typeof input.streak === "number" && input.streak > 0) parts.push(`${input.streak}-day streak`);
  return parts.length ? parts.join(" · ") : "no activity on record";
}

export function buildUnsubscribeAlert(input: UnsubscribeAlertInput): BuiltEmail {
  const name = (input.firstName ?? "").trim();
  const copy = CHOICE_COPY[input.choice];
  const who = name ? esc(name) : "Someone";
  const goodNews = input.choice === "resubscribe" ? "Good news: " : "";

  const subject = `${goodNews}${who} ${copy.headline}`;
  const when = sastNow();
  const tenure = typeof input.daysSinceSignup === "number" ? formatTenure(input.daysSinceSignup) : null;

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
    <h2 style="margin:0 0 4px;font-size:19px;color:#007A85">${esc(who)} ${esc(copy.headline)}</h2>
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280">${esc(copy.line)}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
      ${row("Name", name ? esc(name) : '<span style="color:#9ca3af">not given</span>')}
      ${row("Been a user", tenure ? esc(tenure) : '<span style="color:#9ca3af">unknown</span>')}
      ${row("Activity", esc(activityLine(input)))}
      ${row("When", `${esc(when)} (SAST)`)}
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af">
      Sent when someone changes their email preference from the unsubscribe page.
      No reason given yet - if they answer the optional survey, a follow-up email will say why.
    </p>
  </div>`;

  const text = [
    `${goodNews}${who} ${copy.headline}`,
    copy.line,
    "",
    `Name:      ${name || "not given"}`,
    `Been a user: ${tenure || "unknown"}`,
    `Activity:  ${activityLine(input)}`,
    `When:      ${when} (SAST)`,
  ].join("\n");

  return { subject, html, text };
}

export function buildUnsubscribeReasonAlert(input: UnsubscribeReasonAlertInput): BuiltEmail {
  const name = (input.firstName ?? "").trim();
  const who = name ? esc(name) : "They";
  const label = REASON_BY_CODE[input.reason]?.label ?? input.reason;
  const detail = (input.detail ?? "").trim();

  const subject = name ? `Why ${name} unsubscribed: ${label}` : `Why they unsubscribed: ${label}`;
  const when = sastNow();

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
    <h2 style="margin:0 0 4px;font-size:19px;color:#007A85">The reason ${esc(who.toLowerCase() === "they" ? "they" : who)} gave</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
      ${row("Name", name ? esc(name) : '<span style="color:#9ca3af">not given</span>')}
      ${row("Reason", esc(label))}
      ${detail ? row("Comment", esc(detail).replace(/\n/g, "<br/>")) : ""}
      ${row("When", `${esc(when)} (SAST)`)}
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#9ca3af">
      Follow-up to the unsubscribe alert - this is the answer to the optional "why" question.
    </p>
  </div>`;

  const text = [
    `The reason ${who.toLowerCase() === "they" ? "they" : who} gave`,
    "",
    `Name:    ${name || "not given"}`,
    `Reason:  ${label}`,
    detail ? `Comment: ${detail}` : "",
    `When:    ${when} (SAST)`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/**
 * Send the initial choice alert. Never throws and never blocks the caller -
 * a failed founder notification must not stop or slow someone's unsubscribe.
 */
export async function sendUnsubscribeAlert(resendKey: string, input: UnsubscribeAlertInput): Promise<void> {
  try {
    const built = buildUnsubscribeAlert(input);
    const { MAIL_FROM } = await import("./sender");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [ALERT_TO],
        subject: built.subject,
        html: built.html,
        text: built.text,
      }),
    });
  } catch {
    /* best effort - never let a founder alert fail the unsubscribe */
  }
}

/**
 * Send the follow-up reason alert. Same guarantees as sendUnsubscribeAlert:
 * never throws, never blocks the caller.
 */
export async function sendUnsubscribeReasonAlert(resendKey: string, input: UnsubscribeReasonAlertInput): Promise<void> {
  try {
    const built = buildUnsubscribeReasonAlert(input);
    const { MAIL_FROM } = await import("./sender");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [ALERT_TO],
        subject: built.subject,
        html: built.html,
        text: built.text,
      }),
    });
  } catch {
    /* best effort */
  }
}
