import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { applyLessonToStreak, sastToday } from "@/lib/dates";

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    return NextResponse.json({ ok: false, error: "Missing Supabase server credentials." }, { status: 500 });
  }
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(url, serviceKey);
  const { userId } = (await req.json()) as { userId?: string };
  if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  if (userId !== sessionUser.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("user_progress")
    .select("streak,last_activity_date,streak_freeze_count,longest_streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[sync-streak] DB read error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const today = sastToday();
  const lastActive = data?.last_activity_date ? String(data.last_activity_date) : null;
  const current = Number(data?.streak ?? 0);
  const freezeCount = Math.max(0, Number(data?.streak_freeze_count ?? 0));
  const prevLongest = Number(data?.longest_streak ?? 0);

  const next = applyLessonToStreak(current, freezeCount, lastActive, today);

  if (next.freezeCount < freezeCount) {
    console.info("[sync-streak] Consumed streak freeze(s)", {
      userId,
      previousStreak: current,
      remainingFreezes: next.freezeCount,
      used: freezeCount - next.freezeCount,
    });
  }

  const nextLongest = Math.max(next.streak, prevLongest);

  const { error: upsertError } = await admin.from("user_progress").upsert({
    user_id: userId,
    streak: next.streak,
    streak_freeze_count: next.freezeCount,
    longest_streak: nextLongest,
    last_activity_date: today,
  }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("[sync-streak] DB write error:", upsertError.message);
    return NextResponse.json({ ok: false, error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    streak: next.streak,
    longestStreak: nextLongest,
    lastActivityDate: today,
    freezeCount: next.freezeCount,
    extended: next.extended,
  });
}
