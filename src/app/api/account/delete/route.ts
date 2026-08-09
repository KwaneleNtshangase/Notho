import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { userRef } from "@/lib/churn/unsubscribeToken";

export const runtime = "nodejs";

/**
 * POPIA "right to be forgotten": self-service account + data deletion.
 *
 * The signed-in user deletes their OWN account only. The identity comes from
 * their session token, never from the request body, so this cannot be pointed
 * at somebody else's account.
 *
 * Every user-scoped table is cleared EXPLICITLY rather than trusting ON DELETE
 * CASCADE. Two reasons, both learned the hard way:
 *
 *   1. Cascade coverage is incomplete. The legacy stokvel tables reference
 *      auth.users(id) with no cascade at all, so deleting a user who had ever
 *      joined a stokvel would fail on a foreign-key violation and the account
 *      would be undeletable. The stokvel feature is gone from the app, but the
 *      tables survive until the drop migration is applied, so the cleanup below
 *      stays until then.
 *   2. budget_entries was created outside the migrations folder, so its
 *      constraints are not in version control and cannot be verified by
 *      reading the repo. That table holds imported bank transactions - the
 *      most sensitive data in the product. "It probably cascades" is not good
 *      enough for the one table that matters most.
 *
 * The dialog promises to erase "your account, XP, progress, and all personal
 * data". This is the code that has to make that true.
 */

/**
 * Ordered child-first so foreign keys never block a delete. Anything that does
 * not exist yet is skipped, so an unapplied migration cannot stop a deletion.
 */
const USER_TABLES = [
  // Budget and imported bank data - the most sensitive rows we hold.
  "budget_entries",
  "budget_import_batches",
  "budget_targets",
  "user_merchant_rules",
  "custom_budget_categories",
  "bank_accounts",
  "report_snapshots",
  // Coaching and learning.
  "coach_ai_logs",
  "question_attempts",
  "concept_mastery",
  "user_challenge_progress",
  "user_challenge_assignments",
  "challenge_events",
  // Notifications and settings.
  "push_notification_log",
  "push_subscriptions",
  "user_settings",
  // LEGACY: the stokvel feature was removed from the app, but its tables are
  // still in the database until 20260803120000_drop_stokvel.sql is applied. Erasing
  // these rows is still required for a complete deletion, and once the tables
  // are dropped the loop skips them as "missing" and this block can go.
  "stokvel_contributions",
  "stokvel_members",
  // Email opt-outs and the win-back ledger. Both are squarely about a live
  // user, so both go.
  "email_preferences",
  "winback_send_log",
  // Identity last.
  "user_progress",
  "profiles",
] as const;

/**
 * exit_feedback is deliberately absent from the list above, and must stay that
 * way. It is the record of WHY this person left, written moments ago by the
 * survey step. Deleting it here would erase the answer at the exact instant we
 * finally have it, which defeats the entire point of asking.
 *
 * It is safe to keep because it holds no identity: no user_id, no email, no FK
 * to auth.users - only a one-way peppered hash, cohort numbers, and whatever
 * the person chose to type. See the migration header for the POPIA reasoning.
 */

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // The exit_feedback row id from the survey, if they answered. Optional: the
  // body may be empty (older clients, or a caller that skipped the survey), and
  // a missing id must never stop a deletion.
  const body = await req.json().catch(() => ({}));
  const exitId = typeof (body as { exitId?: unknown }).exitId === "string"
    ? (body as { exitId: string }).exitId
    : null;

  const admin = createServiceSupabase();
  const failed: string[] = [];

  for (const table of USER_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    // A missing table or column is fine - the feature may not be deployed here.
    // Anything else is a genuine failure to erase, and must be surfaced.
    if (error && error.code !== "42P01" && error.code !== "42703" && error.code !== "PGRST205") {
      failed.push(`${table}: ${error.message}`);
    }
  }

  // LEGACY: stokvel groups the user created. The feature is removed, but until
  // the drop migration runs these rows still carry the user's id, so detach it.
  // No-ops harmlessly once the table is gone.
  await admin.from("stokvels").update({ created_by: null }).eq("created_by", user.id);

  // Bug reports they filed, which carry their address in email_status.
  if (user.email) {
    await admin.from("broadcast_send_log").delete().eq("email", user.email);
  }
  await admin.from("feedback").delete().eq("user_id", user.id);

  if (failed.length > 0) {
    // Stop before deleting the auth user. Leaving the account alive means the
    // person can retry and we can still find their rows; deleting it now would
    // orphan data we failed to erase, which is the worse outcome under POPIA.
    console.error("[account-delete] incomplete erasure", { userId: user.id, failed });
    return NextResponse.json(
      {
        error:
          "We could not fully delete your data, so we have not deleted your account. " +
          "Please contact support@notho.co.za and we will finish it manually.",
      },
      { status: 500 }
    );
  }

  // Mark the exit as a real departure, not an abandoned dialog. This has to
  // happen BEFORE deleteUser: once the auth user is gone there is no session
  // and no second chance. Scoped by user_ref so a forged id cannot flip
  // somebody else's row.
  if (exitId) {
    const { error: exitErr } = await admin
      .from("exit_feedback")
      .update({ completed: true })
      .eq("id", exitId)
      .eq("user_ref", userRef(user.id));
    // Analytics never blocks an erasure. Log and carry on.
    if (exitErr) console.error("[account-delete] could not mark exit complete", exitErr.message);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: `Could not delete account: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
