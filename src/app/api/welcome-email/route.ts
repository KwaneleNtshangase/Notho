import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { buildWelcome, nameFromAuthMetadata, sendEmail, type EmailProfile } from "@/lib/emails/lifecycle";

export const runtime = "nodejs";

/**
 * Sends the welcome email on signup. Derives the recipient + name server-side
 * (first name or username, never a generic label) and only sends once per user.
 *
 * Two things used to go wrong here, both silent:
 *
 *   1. The name came only from `profiles`, which is empty until someone saves
 *      their profile. So the welcome email - the first thing we ever send -
 *      greeted people as "there" when we had their name in auth metadata all
 *      along. It now falls back to metadata.
 *
 *   2. The "already sent" flag was written with UPDATE, which silently does
 *      nothing when the user has no profiles row yet. A user in that state
 *      would be re-sent the welcome email on every call. Now an upsert.
 */
export async function POST(req: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: true, skipped: "no-resend" });

  const user = await getUserFromRequest(req);
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceSupabase();
  const { data: profile } = await admin
    .from("profiles")
    .select("retention_fired, username, full_name, goal")
    .eq("user_id", user.id)
    .maybeSingle();

  const fired = String((profile as { retention_fired?: string } | null)?.retention_fired ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (fired.includes("welcome")) {
    return NextResponse.json({ ok: true, skipped: "already-sent" });
  }

  const p = (profile ?? {}) as EmailProfile;
  const metaName = nameFromAuthMetadata(user.user_metadata);
  const email = buildWelcome({ ...p, full_name: p.full_name || metaName });
  const res = await sendEmail(resendKey, user.email, email);
  if (!res.ok) return NextResponse.json({ error: res.detail }, { status: 500 });

  // Upsert, not update: a user who has not finished onboarding has no profiles
  // row, and an UPDATE against a missing row succeeds while changing nothing -
  // so the flag never sticks and the welcome email sends again next time.
  await admin.from("profiles").upsert(
    {
      user_id: user.id,
      retention_fired: [...fired, "welcome"].join(","),
      ...(p.full_name || !metaName ? {} : { full_name: metaName }),
    },
    { onConflict: "user_id" }
  );
  return NextResponse.json({ ok: true });
}
