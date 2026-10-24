import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { verifyUnsubscribeToken } from "@/lib/churn/unsubscribeToken";
import { isReasonCode } from "@/lib/churn/reasons";
import {
  sendUnsubscribeAlert,
  sendUnsubscribeReasonAlert,
  type UnsubscribeChoice,
} from "@/lib/emails/unsubscribeAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The public unsubscribe endpoint. No session: identity comes from the HMAC in
 * the link, which is the only thing an email client can carry.
 *
 * GET   - what is this person currently signed up for, and what is their name.
 * POST  - apply their choice.
 * PATCH - they went on to answer the optional "why" survey (a separate,
 *         later request from the client); tell the founder what they said.
 *
 * Deliberately NOT a one-click GET that unsubscribes on load. Mail scanners,
 * link previewers and corporate security gateways fetch every URL in an email;
 * a GET that mutates would silently unsubscribe people who never clicked
 * anything. The page renders first, the change happens on submit.
 */

type Prefs = {
  unsubscribed_all: boolean;
  lifecycle_emails: boolean;
  product_emails: boolean;
  frequency: "normal" | "weekly" | "none";
  paused_until: string | null;
};

const DEFAULTS: Prefs = {
  unsubscribed_all: false,
  lifecycle_emails: true,
  product_emails: true,
  frequency: "normal",
  paused_until: null,
};

export async function GET(req: NextRequest) {
  const userId = verifyUnsubscribeToken(req.nextUrl.searchParams.get("t"));
  if (!userId) return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });

  const admin = createServiceSupabase();

  const { data: prefs } = await admin
    .from("email_preferences")
    .select("unsubscribed_all, lifecycle_emails, product_emails, frequency, paused_until")
    .eq("user_id", userId)
    .maybeSingle();

  // First name only, to greet them. Never the email address: it is already in
  // the URL bar's referrer chain often enough without us rendering it too.
  let firstName = "";
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, username")
    .eq("user_id", userId)
    .maybeSingle();
  const full = (profile?.full_name as string | null) ?? "";
  firstName = full.trim().split(/\s+/)[0] || ((profile?.username as string | null) ?? "").trim();

  return NextResponse.json({
    ok: true,
    firstName: firstName.length >= 2 ? firstName : "",
    prefs: (prefs as Prefs | null) ?? DEFAULTS,
  });
}

/**
 * Best-effort "someone changed their email preference" alert to the founder.
 * Reads a first name and a cheap activity snapshot so the alert is a moment,
 * not just a fact - but every read is best-effort and the whole thing is
 * fire-and-forget from the caller, so a slow or failing lookup here can never
 * delay or fail the unsubscribe response itself. Same POPIA standard as the
 * GET handler above: first name only, never the email address, because we
 * have another way to tell one person's alerts apart (their name, or nothing).
 */
async function notifyFounderOfChoice(
  admin: ReturnType<typeof createServiceSupabase>,
  userId: string,
  choice: UnsubscribeChoice,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  try {
    const [{ data: profile }, { data: progress }, authResult] = await Promise.all([
      admin.from("profiles").select("full_name, username").eq("user_id", userId).maybeSingle(),
      admin.from("user_progress").select("xp, streak, completed_lessons").eq("user_id", userId).maybeSingle(),
      admin.auth.admin.getUserById(userId).catch(() => null),
    ]);

    const full = (profile?.full_name as string | null) ?? "";
    const firstName =
      full.trim().split(/\s+/)[0] || ((profile?.username as string | null) ?? "").trim() || null;

    const created = authResult?.data?.user?.created_at;
    const daysSinceSignup = created
      ? Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / 86_400_000))
      : null;

    await sendUnsubscribeAlert(resendKey, {
      choice,
      firstName,
      daysSinceSignup,
      lessonsCompleted: Array.isArray(progress?.completed_lessons) ? progress.completed_lessons.length : null,
      streak: typeof progress?.streak === "number" ? progress.streak : null,
      xp: typeof progress?.xp === "number" ? progress.xp : null,
    });
  } catch {
    /* best effort - a founder alert must never surface to the caller */
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const userId = verifyUnsubscribeToken(typeof body.token === "string" ? body.token : null);
  if (!userId) return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });

  const choice = body.choice;
  const now = new Date().toISOString();

  let patch: Partial<Prefs> & { unsubscribed_at?: string | null };
  switch (choice) {
    case "all":
      patch = {
        unsubscribed_all: true,
        lifecycle_emails: false,
        product_emails: false,
        frequency: "none",
        unsubscribed_at: now,
      };
      break;
    case "weekly":
      patch = { unsubscribed_all: false, lifecycle_emails: true, frequency: "weekly", unsubscribed_at: null };
      break;
    case "pause30":
      patch = {
        unsubscribed_all: false,
        paused_until: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        unsubscribed_at: null,
      };
      break;
    case "product_only":
      patch = { unsubscribed_all: false, lifecycle_emails: false, product_emails: true, frequency: "none", unsubscribed_at: null };
      break;
    case "resubscribe":
      // Someone who clicked by accident, or changed their mind. Reversing has
      // to be as easy as leaving, or the unsubscribe link becomes a trap.
      patch = { ...DEFAULTS, unsubscribed_at: null };
      break;
    default:
      return NextResponse.json({ error: "Unknown choice" }, { status: 400 });
  }

  const admin = createServiceSupabase();
  const { error } = await admin
    .from("email_preferences")
    .upsert({ user_id: userId, ...patch, updated_at: now }, { onConflict: "user_id" });

  if (error) {
    console.error("[unsubscribe] write failed", error.message);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again, or email support@notho.co.za." },
      { status: 500 },
    );
  }

  // Tell the founder. Deliberately not awaited: the person's change is already
  // saved and confirmed above, and nothing about telling a human should be
  // able to slow down or fail the response to the person who just clicked.
  void notifyFounderOfChoice(admin, userId, choice as UnsubscribeChoice);

  return NextResponse.json({ ok: true });
}

/**
 * The optional "why" survey is a separate, later request from the client to
 * /api/exit-feedback (which owns writing exit_feedback - this route does not
 * duplicate that write). This endpoint exists only so the founder also hears
 * the reason, when one was given: the client calls it right after a
 * successful, non-skipped exit-feedback submission.
 */
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const userId = verifyUnsubscribeToken(typeof body.token === "string" ? body.token : null);
  if (!userId) return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });

  const reason = body.reason;
  if (!isReasonCode(reason)) {
    // Nothing to notify - skipped or malformed. Still fine, this is best-effort.
    return NextResponse.json({ ok: true });
  }
  const detail = typeof body.detail === "string" ? body.detail : null;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const admin = createServiceSupabase();
    void (async () => {
      try {
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name, username")
          .eq("user_id", userId)
          .maybeSingle();
        const full = (profile?.full_name as string | null) ?? "";
        const firstName =
          full.trim().split(/\s+/)[0] || ((profile?.username as string | null) ?? "").trim() || null;
        await sendUnsubscribeReasonAlert(resendKey, { firstName, reason, detail });
      } catch {
        /* best effort */
      }
    })();
  }

  return NextResponse.json({ ok: true });
}
