import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tap on a reminder, or a lesson finished after that tap. */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; lesson?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (!body.id || !UUID.test(body.id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  const admin = createServiceSupabase();
  const patch = body.lesson
    ? { lesson_at: new Date().toISOString() }
    : { opened_at: new Date().toISOString() };

  const { data, error } = await admin
    .from("push_notification_log")
    .update(patch)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, detail: error.message }, { status: 200 });
  }
  return NextResponse.json({ ok: Boolean(data) });
}
