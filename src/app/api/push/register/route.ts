import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

/** Native token save. Client upsert was dropped by RLS, so the phone never appeared. */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { endpoint?: string } | null;
  const endpoint = body?.endpoint?.trim();
  if (!endpoint || (!endpoint.startsWith("apns:") && !endpoint.startsWith("fcm:"))) {
    return NextResponse.json({ error: "bad-endpoint" }, { status: 400 });
  }

  const admin = createServiceSupabase();
  const { error } = await admin.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh: "native", auth: "native" },
    { onConflict: "user_id,endpoint" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
