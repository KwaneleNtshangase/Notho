import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";
import {
  buildD1,
  buildMilestone,
  buildWelcome,
  nameFromAuthMetadata,
  sendEmail,
  type EmailProfile,
} from "@/lib/emails/lifecycle";
import { sendSignupAlert } from "@/lib/emails/signupAlert";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily lifecycle cron (Vercel Cron -> vercel.json).
 * Fires the D+1 re-engagement email and the D+7 / D+14 / D+30 milestones.
 * Idempotent via profiles.retention_fired so a user only gets each once.
 *
 * Secured with CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * on cron invocations when the env var is set.
 */

type Milestone = { key: "d7" | "d14" | "d30"; daysMin: number; daysMax: number };
const MILESTONES: Milestone[] = [
  { key: "d7", daysMin: 7, daysMax: 8 },
  { key: "d14", daysMin: 14, daysMax: 16 },
  { key: "d30", daysMin: 30, daysMax: 33 },
];

const DAY = 24 * 60 * 60 * 1000;

function firedList(v: unknown): string[] {
  return String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

// deno-lint friendly minimal profile shape
type ProfileRow = EmailProfile & { retention_fired?: string | null };

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });

  const admin = createServiceSupabase();
  const now = Date.now();
  const summary = { welcome: 0, d1: 0, d7: 0, d14: 0, d30: 0, failed: 0 };

  // ── D+1 re-engagement: last lesson 20-48h ago, not yet nudged ──────────────
  try {
    const { data: rows } = await admin
      .from("user_progress")
      .select("user_id, last_lesson_at, streak")
      .not("last_lesson_at", "is", null)
      .lt("last_lesson_at", new Date(now - 20 * 60 * 60 * 1000).toISOString())
      .gt("last_lesson_at", new Date(now - 48 * 60 * 60 * 1000).toISOString());

    for (const row of rows ?? []) {
      const userId = row.user_id as string;
      const streak = (row.streak as number) ?? 0;
      const { data: profile } = await admin
        .from("profiles")
        .select("retention_fired, username, full_name, goal")
        .eq("user_id", userId)
        .maybeSingle();
      const fired = firedList((profile as ProfileRow | null)?.retention_fired);
      if (fired.includes("d1")) continue;
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      const email = authUser?.user?.email;
      if (!email) continue;
      const built = buildD1((profile ?? {}) as EmailProfile, streak);
      const res = await sendEmail(resendKey, email, built);
      if (res.ok) {
        await admin.from("profiles").update({ retention_fired: [...fired, "d1"].join(",") }).eq("user_id", userId);
        summary.d1++;
      } else {
        summary.failed++;
      }
    }
  } catch {
    /* d1 batch is best-effort; milestones still run */
  }

  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = list?.users ?? [];
  // Counted once for the whole run rather than per user: the backstop can send
  // a burst, and re-counting for each would be pointless load.
  const confirmedCount = users.filter(
    (u) => u.email_confirmed_at || (u as { confirmed_at?: string }).confirmed_at
  ).length;

  // ── Welcome backstop ───────────────────────────────────────────────────────
  //
  // The welcome email used to fire from exactly one place: the last step of
  // onboarding. Anyone who signed up, confirmed their email and then closed the
  // tab - or went straight to the budget importer, as our most engaged tester
  // did - got nothing at all. No welcome, and no profiles row either, since
  // onboarding is also the only thing that creates one.
  //
  // Client-side triggers keep finding new ways to be skipped, so the safety net
  // lives here instead: anyone confirmed for over an hour who has never had a
  // welcome gets one. Idempotent through retention_fired, and self-healing for
  // everyone already stuck in that state.
  //
  // The hour of grace lets the normal onboarding path send it first, so a
  // brand-new user does not get a duplicate from the cron.
  try {
    for (const u of users) {
      if (!u.email || !u.email_confirmed_at) continue;
      if (new Date(u.email_confirmed_at).getTime() > now - 60 * 60 * 1000) continue;

      const { data: profile } = await admin
        .from("profiles")
        .select("retention_fired, username, full_name, goal")
        .eq("user_id", u.id)
        .maybeSingle();
      const fired = firedList((profile as ProfileRow | null)?.retention_fired);
      if (fired.includes("welcome")) continue;

      const p = (profile ?? {}) as EmailProfile;
      const metaName = nameFromAuthMetadata(u.user_metadata);
      const built = buildWelcome({ ...p, full_name: p.full_name || metaName });
      const res = await sendEmail(resendKey, u.email, built);
      if (res.ok) {
        // Founder alert rides the same trigger, so someone who confirms and
        // never opens the app is still reported rather than vanishing. Same
        // ledger guard above means it cannot double up with the app path.
        void sendSignupAlert(resendKey, {
          email: u.email,
          name: p.full_name || metaName,
          goal: p.goal ?? null,
          provider: u.app_metadata?.provider ?? null,
          totalUsers: confirmedCount,
        });
        // Upsert: these are precisely the users with no profiles row, and an
        // UPDATE would change nothing while reporting success - which would
        // re-send the welcome email every single morning.
        await admin.from("profiles").upsert(
          {
            user_id: u.id,
            retention_fired: [...fired, "welcome"].join(","),
            ...(p.full_name || !metaName ? {} : { full_name: metaName }),
          },
          { onConflict: "user_id" }
        );
        summary.welcome++;
      } else {
        summary.failed++;
      }
    }
  } catch {
    /* backstop is best-effort; milestones still run */
  }

  // ── D+7 / D+14 / D+30 milestones by signup age ─────────────────────────────

  for (const m of MILESTONES) {
    const minDate = now - m.daysMax * DAY;
    const maxDate = now - m.daysMin * DAY;
    const targets = users.filter((u) => {
      if (!u.email || !u.created_at) return false;
      const t = new Date(u.created_at).getTime();
      return t >= minDate && t <= maxDate;
    });
    for (const u of targets) {
      const { data: profile } = await admin
        .from("profiles")
        .select("retention_fired, username, full_name, goal")
        .eq("user_id", u.id)
        .maybeSingle();
      const fired = firedList((profile as ProfileRow | null)?.retention_fired);
      if (fired.includes(m.key)) continue;
      const { data: progress } = await admin
        .from("user_progress")
        .select("streak")
        .eq("user_id", u.id)
        .maybeSingle();
      const streak = ((progress?.streak as number) ?? 0);
      const built = buildMilestone(m.key, (profile ?? {}) as EmailProfile, streak);
      const res = await sendEmail(resendKey, u.email!, built);
      if (res.ok) {
        await admin.from("profiles").update({ retention_fired: [...fired, m.key].join(",") }).eq("user_id", u.id);
        summary[m.key]++;
      } else {
        summary.failed++;
      }
    }
  }

  return NextResponse.json({ ok: true, ...summary });
}
