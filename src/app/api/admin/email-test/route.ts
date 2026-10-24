import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { isAdminEmail, isAdminUser } from "@/lib/admin";
import { buildWelcome, buildD1, buildMilestone, sendEmail, type EmailProfile } from "@/lib/emails/lifecycle";
import { buildUnsubscribeAlert, buildUnsubscribeReasonAlert, type UnsubscribeChoice } from "@/lib/emails/unsubscribeAlert";

export const runtime = "nodejs";

/**
 * Admin-only: send a test copy of any lifecycle email to yourself so you can
 * preview welcome / d1 / d7 / d14 / d30 in your inbox before they go out.
 * POST { kind: "welcome" | "d1" | "d7" | "d14" | "d30" | "unsubscribe" | "unsubscribe_reason" }
 *
 * "unsubscribe" and "unsubscribe_reason" preview the founder alerts from
 * src/lib/emails/unsubscribeAlert.ts using the admin's own profile/progress,
 * the same way the other kinds preview lifecycle mail with the admin's own
 * data - there is no real unsubscribe involved, this only builds and sends
 * the email.
 */

function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  // Build admin client first - needed for both the DB-flag check and profile lookup.
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Missing config" }, { status: 500 });

  const user = await getUserFromRequest(req).catch(() => null);
  if (!user?.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // DB flag is authoritative; ADMIN_EMAILS env var is a secondary fallback.
  const dbAdmin  = await isAdminUser(admin, user.id);
  const envAdmin = isAdminEmail(user.email);
  if (!dbAdmin && !envAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });

  const { kind, choice, reason, detail } = (await req.json().catch(() => ({}))) as {
    kind?: string;
    choice?: string;
    reason?: string;
    detail?: string;
  };
  const allowed = ["welcome", "d1", "d7", "d14", "d30", "unsubscribe", "unsubscribe_reason"];
  if (!kind || !allowed.includes(kind)) {
    return NextResponse.json({ error: `kind must be one of ${allowed.join(", ")}` }, { status: 400 });
  }

  // Pull the admin's own profile so the preview is realistic; fall back gracefully.
  let profile: EmailProfile = {};
  let streak = 3;
  const { data: p } = await admin
    .from("profiles")
    .select("username, full_name, goal")
    .eq("user_id", user.id)
    .maybeSingle();
  if (p) profile = p as EmailProfile;
  const { data: prog } = await admin
    .from("user_progress")
    .select("streak, xp, completed_lessons")
    .eq("user_id", user.id)
    .maybeSingle();
  if (typeof prog?.streak === "number") streak = prog.streak;

  const firstName = (profile.full_name ?? "").trim().split(/\s+/)[0] || (profile.username ?? "").trim() || null;

  const email =
    kind === "welcome" ? buildWelcome(profile)
    : kind === "d1" ? buildD1(profile, streak)
    : kind === "unsubscribe"
    ? buildUnsubscribeAlert({
        choice: (choice as UnsubscribeChoice) ?? "all",
        firstName,
        daysSinceSignup: user.created_at
          ? Math.max(0, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000))
          : null,
        lessonsCompleted: Array.isArray(prog?.completed_lessons) ? prog.completed_lessons.length : null,
        streak: typeof prog?.streak === "number" ? prog.streak : null,
        xp: typeof prog?.xp === "number" ? prog.xp : null,
      })
    : kind === "unsubscribe_reason"
    ? buildUnsubscribeReasonAlert({
        firstName,
        reason: (reason as Parameters<typeof buildUnsubscribeReasonAlert>[0]["reason"]) ?? "not_useful",
        detail: detail ?? "Test comment from the admin email-test route.",
      })
    : buildMilestone(kind as "d7" | "d14" | "d30", profile, streak);

  // Prefix the subject so it's obviously a test.
  email.subject = `[TEST] ${email.subject}`;

  const res = await sendEmail(resendKey, user.email, email);
  if (!res.ok) return NextResponse.json({ error: res.detail }, { status: 500 });
  return NextResponse.json({ ok: true, kind, sentTo: user.email });
}
