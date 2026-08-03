// Supabase Edge Function — Notho Email
// Handles four types:
//   "welcome"    — sent immediately after onboarding (called from client)
//   "d1-batch"   — hourly cron; users 20-48h since last lesson
//   "drip-batch" — daily cron; fires D+7, D+14, D+30 milestone emails (inline HTML)
//
// Env vars (set in Dashboard -> Edge Functions -> Secrets):
//   RESEND_API_KEY            — Resend API key
//   SUPABASE_URL              — injected automatically by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — injected automatically by Supabase
//
// Resend Templates (edit at resend.com/templates):
//   notho-welcome         — a599bf54-7f17-4ed6-8f27-cdb058e0ae5d
//   notho-d1-retention    — 14f12c73-516c-4649-bf18-048c8891b535
//   notho-d7/d14/d30      — sent as inline HTML (no template ID required)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY            = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Sending identity. Mirrors src/lib/emails/sender.ts — same reasoning, but this
 * runs on Deno in Supabase rather than on Vercel, so it needs its own env read.
 *
 * The fallback is deliberately the OLD domain: fundiapp.co.za is the one
 * currently verified in Resend. Resend rejects mail from an unverified domain
 * rather than degrading, so defaulting to notho.co.za before verification would
 * silently stop every welcome email with no symptom to tell you.
 *
 * Cutover: verify notho.co.za in Resend (docs/EMAIL-MIGRATION-NOTHO.md steps
 * 4-5), then `supabase secrets set MAIL_FROM_ADDRESS="Notho <hello@notho.co.za>"`.
 * No redeploy, and flipping back is just as fast if verification regresses.
 */
const FROM = Deno.env.get("MAIL_FROM_ADDRESS") ?? "Notho <hello@fundiapp.co.za>";

/**
 * Link target, NOT a sending identity — safe to move ahead of Resend
 * verification, and it should move: fundiapp.co.za 301s to www.notho.co.za, and
 * a redirect inside an email body is a deliverability signal working against us.
 */
const APP_URL = Deno.env.get("APP_URL") ?? "https://www.notho.co.za";

const WELCOME_TEMPLATE_ID  = "a599bf54-7f17-4ed6-8f27-cdb058e0ae5d";
const D1_TEMPLATE_ID       = "14f12c73-516c-4649-bf18-048c8891b535";

// ── Goal -> human-readable label + encouragement ───────────────────────────────

const GOAL_LABELS: Record<string, { label: string; emoji: string; line: string }> = {
  "invest":         { label: "Start Investing",         emoji: "📈", line: "Every rand invested today is a rand working for you tomorrow." },
  "save-for-home":  { label: "Save for a Home",         emoji: "🏡", line: "You are building the foundation, literally." },
  "debt-free":      { label: "Get Debt-Free",           emoji: "⛓️‍💥", line: "Every lesson you complete is another link broken." },
  "emergency-fund": { label: "Build an Emergency Fund", emoji: "🛡️", line: "Peace of mind is a financial decision too." },
};

function goalInfo(goal?: string) {
  return GOAL_LABELS[goal ?? ""] ?? {
    label: "Build Financial Confidence",
    emoji: "💡",
    line:  "Knowledge is the best investment you can make.",
  };
}

// ── Streak helpers ─────────────────────────────────────────────────────────────

function streakLine(streak: number): string {
  if (streak <= 0) return "Start your streak today, one lesson is all it takes.";
  if (streak === 1) return "You are on a 1-day streak. Keep it alive!";
  if (streak < 7)  return `You are on a ${streak}-day streak; don't break the chain! 🔥`;
  if (streak < 30) return `${streak} days in a row. That is real discipline. 🔥`;
  return `${streak} days straight. You are in the top 1% of learners. 🏆`;
}

function streakBadge(streak: number): string {
  if (streak <= 0) return "";
  return `<div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:50px;padding:6px 18px;margin-top:12px;">
    <span style="color:#fff;font-size:15px;font-weight:700;">🔥 ${streak}-day streak</span>
  </div>`;
}

// ── Inline HTML builder for drip milestone emails ──────────────────────────────

interface MilestoneVars {
  username: string;
  headline: string;
  subhead: string;
  body: string;
  streakBadgeHtml: string;
  goalEmoji: string;
  goalLabel: string;
  goalLine: string;
  ctaText: string;
}

function buildMilestoneEmail(v: MilestoneVars): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6B46C1,#9333EA);padding:32px 32px 28px;text-align:center">
          <div style="color:rgba(255,255,255,0.75);font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase">Notho</div>
          ${v.streakBadgeHtml}
          <h1 style="color:#fff;font-size:28px;font-weight:800;margin:14px 0 8px;line-height:1.2">${v.headline}</h1>
          <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0;line-height:1.5">${v.subhead}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px">Hi ${v.username},</p>
          <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 28px">${v.body}</p>
          <!-- Goal chip -->
          <div style="background:#F3F0FF;border-radius:12px;padding:16px 20px;margin-bottom:28px">
            <span style="font-size:22px">${v.goalEmoji}</span>
            <span style="color:#6B46C1;font-weight:700;font-size:15px;margin-left:10px">${v.goalLabel}</span>
            <p style="color:#6B46C1;font-size:14px;margin:6px 0 0;opacity:0.8">${v.goalLine}</p>
          </div>
          <!-- CTA -->
          <div style="text-align:center;margin:32px 0 8px">
            <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#6B46C1,#9333EA);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 36px;border-radius:50px">${v.ctaText}</a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #F3F4F6">
          <p style="color:#9CA3AF;font-size:13px;margin:0">Notho &middot; <a href="mailto:hello@notho.co.za" style="color:#9CA3AF">hello@notho.co.za</a></p>
          <p style="color:#D1D5DB;font-size:12px;margin:6px 0 0">You are receiving this because you signed up for Notho.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Resend helpers ─────────────────────────────────────────────────────────────

async function sendViaTemplate(
  to:         string,
  subject:    string,
  templateId: string,
  variables:  Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  if (!templateId) {
    return { ok: false, error: "template_id_not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:        FROM,
        to,
        subject,
        template_id: templateId,
        variables,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: txt };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function sendViaHTML(
  to:      string,
  subject: string,
  html:    string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: txt };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Drip milestone config ──────────────────────────────────────────────────────

interface DripMilestone {
  fired:     string;
  daysMin:   number;
  daysMax:   number;
  subjectFn: (username: string, streak: number) => string;
  buildHtml: (vars: { username: string; streak: number; xp: number; goalEmoji: string; goalLabel: string; goalLine: string }) => string;
}

const DRIP_MILESTONES: DripMilestone[] = [
  {
    fired:    "d7",
    daysMin:  7,
    daysMax:  8,
    subjectFn: (u, s) => s > 0
      ? `${u}, one week in and ${s} days strong 🔥`
      : `${u}, one week in. You started something real.`,
    buildHtml: ({ username, streak, goalEmoji, goalLabel, goalLine }) =>
      buildMilestoneEmail({
        username,
        headline: "One week in.",
        subhead: "That is further than most people ever get.",
        body: `Seven days ago you decided to take control of your money. Most people talk about it and never start. You started. That matters more than you realise.`,
        streakBadgeHtml: streakBadge(streak),
        goalEmoji,
        goalLabel,
        goalLine,
        ctaText: "Keep the Streak Going",
      }),
  },
  {
    fired:    "d14",
    daysMin:  14,
    daysMax:  16,
    subjectFn: (u) => `${u}, two weeks of building a better financial future 💪`,
    buildHtml: ({ username, streak, goalEmoji, goalLabel, goalLine }) =>
      buildMilestoneEmail({
        username,
        headline: "Two weeks strong.",
        subhead: "You are building a habit that will last.",
        body: `Two weeks in and you are still here. Most people quit after day three. You did not. Every lesson you have completed is compounding, just like the money habits you are building.`,
        streakBadgeHtml: streakBadge(streak),
        goalEmoji,
        goalLabel,
        goalLine,
        ctaText: "Continue Learning",
      }),
  },
  {
    fired:    "d30",
    daysMin:  30,
    daysMax:  33,
    subjectFn: (u) => `${u}, 30 days. You are not the same person who signed up. 🏆`,
    buildHtml: ({ username, streak, xp, goalEmoji, goalLabel, goalLine }) =>
      buildMilestoneEmail({
        username,
        headline: "30 days.",
        subhead: `${xp > 0 ? xp + " XP earned. " : ""}You are not the same person who signed up.`,
        body: `A full month of lessons, streaks, and honest conversations about money. That takes real consistency. Look back at where you started, then keep going. The hardest part was the beginning and you are well past that.`,
        streakBadgeHtml: streakBadge(streak),
        goalEmoji,
        goalLabel,
        goalLine,
        ctaText: "See How Far You've Come",
      }),
  },
];

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let body: { type?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }

  // ── WELCOME EMAIL ───────────────────────────────────────────────────────────
  if (body.type === "welcome") {
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("retention_fired, username, goal")
      .eq("user_id", user.id)
      .maybeSingle();

    const fired: string[] = (profile?.retention_fired ?? "").split(",").filter(Boolean);
    if (fired.includes("welcome")) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_sent" }), { status: 200 });
    }

    const username = profile?.username ?? "Mfundi";
    const g        = goalInfo(profile?.goal);

    const result = await sendViaTemplate(
      user.email,
      `Welcome to Notho, ${username}!`,
      WELCOME_TEMPLATE_ID,
      { username, goal_emoji: g.emoji, goal_label: g.label, goal_line: g.line },
    );

    if (result.ok) {
      await supabase.from("profiles").update({
        retention_fired: [...fired, "welcome"].join(","),
      }).eq("user_id", user.id);
    }

    return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500 });
  }

  // ── D+1 RETENTION BATCH ─────────────────────────────────────────────────────
  if (body.type === "d1-batch") {
    const { data: candidates, error: queryErr } = await supabase
      .from("user_progress")
      .select("user_id, last_lesson_at, streak")
      .not("last_lesson_at", "is", null)
      .lt("last_lesson_at", new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString())
      .gt("last_lesson_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (queryErr) {
      return new Response(JSON.stringify({ error: queryErr.message }), { status: 500 });
    }

    if (!candidates?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_candidates" }), { status: 200 });
    }

    const results: Array<{ userId: string; status: string }> = [];

    for (const row of candidates) {
      const userId = row.user_id as string;
      const streak = (row.streak as number) ?? 0;

      const { data: profile } = await supabase
        .from("profiles")
        .select("retention_fired, username, goal")
        .eq("user_id", userId)
        .maybeSingle();

      const fired: string[] = (profile?.retention_fired ?? "").split(",").filter(Boolean);
      if (fired.includes("d1")) {
        results.push({ userId, status: "skipped_already_sent" });
        continue;
      }

      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
      if (authErr || !authUser?.user?.email) {
        results.push({ userId, status: "skipped_no_email" });
        continue;
      }

      const username = profile?.username ?? "Mfundi";
      const g        = goalInfo(profile?.goal);
      const subject  = streak > 0
        ? `${username}, your ${streak}-day streak is waiting 🔥`
        : `${username}, your momentum is waiting 🔥`;

      const emailResult = await sendViaTemplate(
        authUser.user.email,
        subject,
        D1_TEMPLATE_ID,
        {
          username,
          streak_badge: streakBadge(streak),
          streak_line:  streakLine(streak),
          goal_emoji:   g.emoji,
          goal_label:   g.label,
        },
      );

      if (emailResult.ok) {
        await supabase.from("profiles").update({
          retention_fired: [...fired, "d1"].join(","),
        }).eq("user_id", userId);
        results.push({ userId, status: "sent" });
      } else {
        results.push({ userId, status: `failed: ${emailResult.error}` });
      }
    }

    const sent = results.filter(r => r.status === "sent").length;
    return new Response(JSON.stringify({ sent, results }), { status: 200 });
  }

  // ── D+7 / D+14 / D+30 DRIP BATCH ───────────────────────────────────────────
  if (body.type === "drip-batch") {
    const allResults: Array<{ userId: string; milestone: string; status: string }> = [];

    for (const milestone of DRIP_MILESTONES) {
      const minDate = new Date(Date.now() - milestone.daysMax * 24 * 60 * 60 * 1000).toISOString();
      const maxDate = new Date(Date.now() - milestone.daysMin * 24 * 60 * 60 * 1000).toISOString();

      const { data: authUsers, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) {
        allResults.push({ userId: "ALL", milestone: milestone.fired, status: `query_error: ${listErr.message}` });
        continue;
      }

      const targets = (authUsers?.users ?? []).filter(u =>
        u.created_at >= minDate && u.created_at <= maxDate && u.email,
      );

      for (const authUser of targets) {
        const userId = authUser.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("retention_fired, username, goal")
          .eq("user_id", userId)
          .maybeSingle();

        const fired: string[] = (profile?.retention_fired ?? "").split(",").filter(Boolean);
        if (fired.includes(milestone.fired)) {
          allResults.push({ userId, milestone: milestone.fired, status: "skipped_already_sent" });
          continue;
        }

        const { data: progress } = await supabase
          .from("user_progress")
          .select("streak, xp")
          .eq("user_id", userId)
          .maybeSingle();

        const username = profile?.username ?? "Mfundi";
        const streak   = (progress?.streak as number) ?? 0;
        const xp       = (progress?.xp as number) ?? 0;
        const g        = goalInfo(profile?.goal);

        const html = milestone.buildHtml({
          username,
          streak,
          xp,
          goalEmoji: g.emoji,
          goalLabel: g.label,
          goalLine:  g.line,
        });

        const emailResult = await sendViaHTML(
          authUser.email!,
          milestone.subjectFn(username, streak),
          html,
        );

        if (emailResult.ok) {
          await supabase.from("profiles").update({
            retention_fired: [...fired, milestone.fired].join(","),
          }).eq("user_id", userId);
          allResults.push({ userId, milestone: milestone.fired, status: "sent" });
        } else {
          allResults.push({ userId, milestone: milestone.fired, status: `failed: ${emailResult.error}` });
        }
      }
    }

    const sent = allResults.filter(r => r.status === "sent").length;
    return new Response(JSON.stringify({ sent, results: allResults }), { status: 200 });
  }

  return new Response(
    JSON.stringify({ error: "Unknown type. Use 'welcome', 'd1-batch', or 'drip-batch'." }),
    { status: 400 },
  );
});
