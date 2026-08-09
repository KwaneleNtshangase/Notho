import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { verifyUnsubscribeToken, userRef } from "@/lib/churn/unsubscribeToken";
import { DETAIL_MAX, isReasonCode, offerFor, type ExitType, type OfferAction } from "@/lib/churn/reasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The single write path for every exit survey: the in-app delete dialog, the
 * public unsubscribe page, and the one-click reply in the win-back email.
 *
 * POST   records a reason and returns an id.
 * PATCH  accepts a save offer against that id and actually applies it.
 *
 * WHY THE CLIENT DOES NOT WRITE THIS TABLE DIRECTLY
 *   The cohort context (tenure, lessons done, streak) is the difference between
 *   "people say it was too hard" and "people say it was too hard in their first
 *   week, and never after day thirty". If the client supplied those numbers
 *   they would be worthless, so they are read here, server-side, from the
 *   user's own rows. exit_feedback therefore has RLS on with no policies and is
 *   only reachable through this route.
 *
 * AUTHENTICATION - two accepted proofs, because the three doors differ:
 *   Bearer token  - the person is signed in and deleting their account.
 *   ?t= HMAC      - they clicked a link in an email and have no session. The
 *                   token is signed over their user id, so it proves identity
 *                   without one.
 * An anonymous request with neither is rejected. Letting the world post rows
 * would fill the dashboard with noise, which is the one failure mode that makes
 * the whole feature useless.
 */

const EXIT_TYPES: ExitType[] = ["account_deletion", "email_unsubscribe", "inactive_survey"];

/** The budget/statement tables, child-first. Mirrors /api/account/delete. */
const BUDGET_TABLES = [
  "budget_entries",
  "budget_import_batches",
  "budget_targets",
  "user_merchant_rules",
  "custom_budget_categories",
  "bank_accounts",
  "report_snapshots",
] as const;

/** A missing table or column means the feature is not deployed here, not a failure. */
const BENIGN = new Set(["42P01", "42703", "PGRST205"]);

async function resolveUser(req: NextRequest, bodyToken?: unknown): Promise<string | null> {
  const authed = await getUserFromRequest(req).catch(() => null);
  if (authed) return authed.id;
  if (typeof bodyToken === "string") return verifyUnsubscribeToken(bodyToken);
  return null;
}

/**
 * Snapshot of who this person was at the moment they left. Read here rather
 * than trusted from the client, and best-effort: a failure to read the streak
 * must never stop us recording the reason, which is the part that matters.
 */
async function cohort(admin: ReturnType<typeof createServiceSupabase>, userId: string) {
  const out: {
    days_since_signup: number | null;
    lessons_completed: number | null;
    current_streak: number | null;
    had_budget_data: boolean | null;
  } = { days_since_signup: null, lessons_completed: null, current_streak: null, had_budget_data: null };

  try {
    const { data: progress } = await admin
      .from("user_progress")
      .select("streak, completed_lessons")
      .eq("user_id", userId)
      .maybeSingle();
    if (progress) {
      out.current_streak = (progress.streak as number) ?? 0;
      out.lessons_completed = Array.isArray(progress.completed_lessons)
        ? progress.completed_lessons.length
        : 0;
    }
  } catch { /* best effort */ }

  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    const created = data?.user?.created_at;
    if (created) {
      out.days_since_signup = Math.max(
        0,
        Math.floor((Date.now() - new Date(created).getTime()) / 86_400_000),
      );
    }
  } catch { /* best effort */ }

  try {
    // head+count: we want to know whether any exist, not pull the rows. These
    // are bank transactions; there is no reason to read them here.
    const { count } = await admin
      .from("budget_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    out.had_budget_data = (count ?? 0) > 0;
  } catch { /* best effort */ }

  return out;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const userId = await resolveUser(req, body.token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exitType = body.exitType as ExitType;
  if (!EXIT_TYPES.includes(exitType)) {
    return NextResponse.json({ error: "Unknown exitType" }, { status: 400 });
  }

  const skipped = body.skipped === true;
  const reason = isReasonCode(body.reason) && !skipped ? body.reason : null;
  const detail =
    typeof body.detail === "string" && body.detail.trim()
      ? body.detail.trim().slice(0, DETAIL_MAX)
      : null;

  const admin = createServiceSupabase();
  const ctx = await cohort(admin, userId);

  const { data, error } = await admin
    .from("exit_feedback")
    .insert({
      exit_type: exitType,
      reason,
      skipped,
      detail,
      offer_shown: offerFor(exitType, reason)?.action ?? null,
      // The unsubscribe and win-back doors complete the moment they are
      // submitted. Account deletion does not: the row is written before the
      // irreversible part runs, and /api/account/delete flips this to true only
      // once the account is genuinely gone. Counting an abandoned dialog as
      // churn would inflate the number we most need to be honest about.
      completed: exitType !== "account_deletion",
      user_ref: userRef(userId),
      ...ctx,
    })
    .select("id")
    .single();

  if (error) {
    // Never block an exit on our own analytics. A person who clicked delete is
    // entitled to have it happen whether or not this insert worked.
    console.error("[exit-feedback] insert failed", error.message);
    return NextResponse.json({ ok: false, id: null }, { status: 200 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

/**
 * The person took the alternative instead of leaving. Marks the offer accepted
 * and applies it for real - an offer that only records intent is a dark
 * pattern, because they clicked believing something changed.
 */
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const userId = await resolveUser(req, body.token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action = body.action as OfferAction;
  const exitId = typeof body.id === "string" ? body.id : null;
  const admin = createServiceSupabase();

  const now = new Date();
  let applied = true;

  switch (action) {
    case "email_weekly":
      await upsertPrefs(admin, userId, { frequency: "weekly", unsubscribed_all: false });
      break;
    case "email_pause_30":
      await upsertPrefs(admin, userId, {
        paused_until: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
      });
      break;
    case "email_off_keep":
      await upsertPrefs(admin, userId, {
        unsubscribed_all: true,
        lifecycle_emails: false,
        product_emails: false,
        frequency: "none",
        unsubscribed_at: now.toISOString(),
      });
      break;
    case "delete_budget": {
      // The privacy offer. This has to be a real erasure, immediately, or the
      // offer is a lie told to somebody who has just said they do not trust us
      // with their bank data.
      const failed: string[] = [];
      for (const table of BUDGET_TABLES) {
        const { error } = await admin.from(table).delete().eq("user_id", userId);
        if (error && !BENIGN.has(error.code)) failed.push(`${table}: ${error.message}`);
      }
      if (failed.length > 0) {
        console.error("[exit-feedback] partial budget erasure", { userId, failed });
        return NextResponse.json(
          {
            error:
              "We could not delete all of your financial data. Nothing has been changed on your account. " +
              "Please contact support@notho.co.za and we will finish it manually.",
          },
          { status: 500 },
        );
      }
      break;
    }
    // Navigation-only offers: the client routes the user and there is nothing
    // to persist beyond the fact that they took it.
    case "report_bug":
    case "goto_basics":
    case "goto_advanced":
      break;
    default:
      applied = false;
  }

  if (!applied) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  if (exitId) {
    await admin
      .from("exit_feedback")
      .update({ offer_accepted: true, offer_shown: action })
      .eq("id", exitId)
      // Scoped to this person's own row: the id came from the client, so
      // without this anyone could mark someone else's exit as saved.
      .eq("user_ref", userRef(userId));
  }

  return NextResponse.json({ ok: true });
}

async function upsertPrefs(
  admin: ReturnType<typeof createServiceSupabase>,
  userId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await admin
    .from("email_preferences")
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) console.error("[exit-feedback] email prefs write failed", error.message);
}
