/**
 * Notho lifecycle emails (welcome + d1 + d7/d14/d30 milestones).
 *
 * All emails share one branded shell: a green header band with the logo, a
 * white content box, and a plain footer. Copy is deliberately human and
 * South-African in tone: no em dashes, no marketing-speak, no emoji clutter.
 *
 * People are always addressed by their first name (if we have it) or their
 * username. We never fall back to a generic label like "Mfundi".
 */

import { MAIL_FROM } from "./sender";

// The sender lives in one shared module and is overridable via the
// MAIL_FROM_ADDRESS env var, so the notho.co.za cutover is a Vercel setting
// rather than a code change in six files. It still points at the old domain by
// default, because that is the one Resend has verified - sending from an
// unverified domain does not degrade, Resend rejects it and every email
// silently stops. See docs/EMAIL-MIGRATION-NOTHO.md.
const FROM = MAIL_FROM;
// www, not the apex: the apex 308-redirects to www, and email clients do not
// follow redirects for images — the logo shows broken. The white mark reads on
// the teal (#007A85) header band; the colour icon's teal blends.
const APP_URL = "https://www.notho.co.za";
const LOGO = "https://www.notho.co.za/notho-icon-white.png";

export type EmailProfile = {
  username?: string | null;
  full_name?: string | null;
  goal?: string | null;
};

export type BuiltEmail = { subject: string; html: string; text: string };

function firstNameOf(full?: string | null): string {
  if (!full) return "";
  const t = full.trim().split(/\s+/)[0] ?? "";
  return t.length >= 2 ? t : "";
}

/** First name if known, else username, else a warm generic. Never "Mfundi". */
export function resolveName(p?: EmailProfile | null): string {
  return firstNameOf(p?.full_name) || (p?.username?.trim() || "") || "there";
}

const GOAL_LINES: Record<string, { label: string; line: string }> = {
  "debt-free": { label: "Get debt-free", line: "Every lesson is another step out of debt." },
  emergency: { label: "Build an emergency fund", line: "Peace of mind is a money decision too." },
  invest: { label: "Start investing", line: "Every rand you put away today works for you tomorrow." },
  home: { label: "Save for a home", line: "You're building the foundation, one habit at a time." },
  retire: { label: "Plan for retirement", line: "Future you will thank present you for starting now." },
  business: { label: "Grow my business", line: "Sharper money skills, stronger business." },
};

function goalInfo(goal?: string | null) {
  return GOAL_LINES[goal ?? ""] ?? { label: "Build financial confidence", line: "Knowledge is the best investment you can make." };
}

/** The shared branded shell. `bodyRows` is the inner HTML of the white box. */
function shell(bodyRows: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;margin:0;padding:0">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
        <tr><td style="background:#007A85;border-radius:16px 16px 0 0;padding:30px 28px">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:14px">
              <img src="${LOGO}" width="44" height="44" alt="Notho" style="display:block;border:0;outline:none;text-decoration:none" />
            </td>
            <td style="vertical-align:middle">
              <div style="font-size:19px;font-weight:800;color:#ffffff;line-height:1.25">Notho</div>
              <div style="font-size:12px;color:#B5E4E8;letter-spacing:0.04em;padding-top:3px">Master Your Money</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:30px 28px;color:#111827;line-height:1.6">
          ${bodyRows}
        </td></tr>
        <tr><td style="padding:16px 28px 0;text-align:center;font-size:11px;color:#9AA0A6;line-height:1.6">
          You're getting this because you have a Notho account.<br/>
          Educational content only, not financial advice.
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

function cta(label: string): string {
  return `<div style="margin:6px 0"><a href="${APP_URL}" style="display:inline-block;padding:13px 24px;background:#007A85;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px">${label}</a></div>`;
}

function goalChip(goal?: string | null): string {
  const g = goalInfo(goal);
  return `<div style="background:#E6F4F5;border-radius:12px;padding:14px 18px;margin:0 0 22px">
    <div style="font-size:14px;font-weight:700;color:#007A85">${g.label}</div>
    <div style="font-size:13px;color:#00636B;padding-top:3px">${g.line}</div>
  </div>`;
}

function streakBadge(streak: number): string {
  if (streak <= 0) return "";
  return `<div style="margin:0 0 16px"><span style="display:inline-block;background:#E6F4F5;color:#007A85;border-radius:50px;padding:5px 14px;font-size:13px;font-weight:700">${streak}-day streak</span></div>`;
}

/** ── Welcome (sent on signup) ──────────────────────────────────────────── */
export function buildWelcome(p: EmailProfile): BuiltEmail {
  const name = resolveName(p);
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:800">Welcome to Notho, ${name}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#374151">You're in. One short lesson a day is all it takes to get a real grip on your money, and you can start right now.</p>
    ${goalChip(p.goal)}
    ${cta("Start your first lesson")}
    <p style="margin:22px 0 0;font-size:15px;color:#374151">Small steps, real progress.<br/>Team Notho</p>
  `);
  const text = `Welcome to Notho, ${name}.\n\nYou're in. One short lesson a day is all it takes to get a real grip on your money, and you can start right now.\n\nStart your first lesson: ${APP_URL}\n\nSmall steps, real progress.\nTeam Notho`;
  return { subject: `Welcome to Notho, ${name}`, html, text };
}

/** ── D+1 re-engagement ─────────────────────────────────────────────────── */
export function buildD1(p: EmailProfile, streak: number): BuiltEmail {
  const name = resolveName(p);
  const line = streak > 0
    ? `Your ${streak}-day streak is still going. Do one lesson today to keep it alive.`
    : `Pick up where you left off. One lesson today gets your momentum back.`;
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:800">${name}, your next lesson is waiting</h1>
    ${streakBadge(streak)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151">${line}</p>
    ${goalChip(p.goal)}
    ${cta("Continue learning")}
    <p style="margin:22px 0 0;font-size:15px;color:#374151">You've got this.<br/>Team Notho</p>
  `);
  const text = `${name}, your next lesson is waiting.\n\n${line}\n\nContinue learning: ${APP_URL}\n\nYou've got this.\nTeam Notho`;
  const subject = streak > 0 ? `${name}, keep your ${streak}-day streak going` : `${name}, your next lesson is waiting`;
  return { subject, html, text };
}

type MilestoneKind = "d7" | "d14" | "d30";

const MILESTONES: Record<MilestoneKind, { headline: string; body: string; cta: string; subject: (name: string, streak: number) => string }> = {
  d7: {
    headline: "One week in",
    body: "Seven days ago you decided to take control of your money. Most people talk about it and never start. You did. That counts for more than you think.",
    cta: "Keep it going",
    subject: (name, s) => (s > 0 ? `${name}, one week in and ${s} days strong` : `${name}, one week in. You started something real.`),
  },
  d14: {
    headline: "Two weeks strong",
    body: "Two weeks in and you're still here. Most people quit after day three. Every lesson you finish is compounding, just like the money habits you're building.",
    cta: "Continue learning",
    subject: (name) => `${name}, two weeks of building a better money future`,
  },
  d30: {
    headline: "30 days",
    body: "A full month of lessons and streaks and honest thinking about money. That takes real consistency. Look back at where you started, then keep going. The hardest part was the beginning, and you're well past that.",
    cta: "See how far you've come",
    subject: (name) => `${name}, 30 days in. You're not the same person who signed up.`,
  },
};

/** ── D+7 / D+14 / D+30 milestone ───────────────────────────────────────── */
export function buildMilestone(kind: MilestoneKind, p: EmailProfile, streak: number): BuiltEmail {
  const name = resolveName(p);
  const m = MILESTONES[kind];
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:800">${m.headline}</h1>
    ${streakBadge(streak)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151">Hi ${name}, ${m.body}</p>
    ${goalChip(p.goal)}
    ${cta(m.cta)}
    <p style="margin:22px 0 0;font-size:15px;color:#374151">Proud of you.<br/>Team Notho</p>
  `);
  const text = `${m.headline}\n\nHi ${name}, ${m.body}\n\n${m.cta}: ${APP_URL}\n\nProud of you.\nTeam Notho`;
  return { subject: m.subject(name, streak), html, text };
}

/** ── Rebrand announcement (one-off broadcast) ──────────────────────────────
 *
 * Sent once to the whole list. Three jobs, in this order of importance:
 *   1. Reassure. Nothing about their account, streak or progress changes.
 *   2. Name the change plainly, so a different logo in their inbox tomorrow
 *      does not read as a phishing attempt.
 *   3. Explain the name, briefly.
 *
 * The sending address stays on the old domain until Resend verifies the new
 * one, which is also the safer sequencing: changing the From address in the
 * same week as the name is what actually trips spam filters. Links in the body
 * already point at notho.co.za.
 */
export function buildRebrandAnnouncement(p?: EmailProfile | null): BuiltEmail {
  const name = resolveName(p);
  // Bulk sends have no profile, so resolveName falls back to "there". Greeting
  // still reads fine, but "there, Fundi Finance is now Notho" does not.
  const personal = name !== "there";
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:800">We're now called Notho</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#374151">Hi ${name}, a quick heads up. Fundi Finance is now Notho. Same app, same team, same lessons. Only the name and the look have changed.</p>

    <div style="background:#E6F4F5;border-radius:12px;padding:16px 18px;margin:0 0 22px">
      <div style="font-size:14px;font-weight:700;color:#00636B">Nothing changes for you</div>
      <div style="font-size:14px;color:#374151;padding-top:6px;line-height:1.6">
        Your login is the same. Your streak, XP, badges and budget are all exactly where you left them. There is nothing you need to do.
      </div>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#374151">Why Notho. The name comes from <em>umnotho</em>, the isiZulu word for wealth. It says what the app is actually for better than the old name did, and it grows with us as we add more than just lessons.</p>

    <p style="margin:0 0 16px;font-size:15px;color:#374151">You'll see the new logo in the app and on emails from us from now on. If our name pops up somewhere and you're not sure it's really us, that's a healthy instinct. You can always go straight to the app instead of clicking a link.</p>

    ${cta("Open Notho")}

    <p style="margin:22px 0 0;font-size:15px;color:#374151">Thanks for being here since the Fundi days.<br/>Team Notho</p>
  `);
  const text = `We're now called Notho

Hi ${name}, a quick heads up. Fundi Finance is now Notho. Same app, same team, same lessons. Only the name and the look have changed.

Nothing changes for you. Your login is the same. Your streak, XP, badges and budget are all exactly where you left them. There is nothing you need to do.

Why Notho. The name comes from umnotho, the isiZulu word for wealth. It says what the app is actually for better than the old name did, and it grows with us as we add more than just lessons.

You'll see the new logo in the app and on emails from us from now on. If our name pops up somewhere and you're not sure it's really us, that's a healthy instinct. You can always go straight to the app instead of clicking a link.

Open Notho: ${APP_URL}

Thanks for being here since the Fundi days.
Team Notho`;
  return {
    subject: personal
      ? `${name}, Fundi Finance is now Notho`
      : `Fundi Finance is now Notho`,
    html,
    text,
  };
}

/** Send one email via Resend. Optional scheduledAt (ISO) to schedule. */
export async function sendEmail(
  resendKey: string,
  to: string,
  email: BuiltEmail,
  scheduledAt?: string,
): Promise<{ ok: boolean; detail?: string }> {
  const payload: Record<string, unknown> = { from: FROM, to: [to], subject: email.subject, html: email.html, text: email.text };
  if (scheduledAt) payload.scheduled_at = scheduledAt;
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) return { ok: false, detail: (await resp.text()).slice(0, 200) };
  return { ok: true };
}
