import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { resolveNextLesson } from "@/lib/push/nextLesson";
import { CONTENT_DATA } from "@/data/content";
import { deliverPush } from "@/lib/push/deliver";
import { sastToday } from "@/lib/dates";

export const runtime = "nodejs";

function resumeFrom(raw: unknown): { courseId?: string; lessonId?: string; cleared?: boolean } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { courseId?: string; lessonId?: string; cleared?: boolean };
  if (r.cleared) return null;
  if (!r.courseId || !r.lessonId) return null;
  return r;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceSupabase();
  const [{ data: subs }, { data: progress }] = await Promise.all([
    admin.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", user.id),
    admin.from("user_progress").select("completed_lessons, pinned_courses, lesson_resume").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0, reason: "no-subscription" });

  const catalog = CONTENT_DATA.courses.map((c) => ({
    id: c.id,
    title: c.title,
    units: c.units.map((u) => ({ lessons: u.lessons.map((l) => ({ id: l.id, title: l.title, comingSoon: l.comingSoon })) })),
  }));
  const next = resolveNextLesson({
    courses: catalog,
    completedLessons: (progress?.completed_lessons as string[] | null) ?? [],
    pinnedCourseIds: (progress?.pinned_courses as { ids?: string[] } | null)?.ids ?? [],
    resume: resumeFrom(progress?.lesson_resume),
  });

  const msg = {
    key: `hello:${sastToday()}`,
    title: "You're in",
    body: `${next.lessonTitle} is next. We'll tap you when it's time — not before.`,
    url: next.url,
  };
  const { data: claimed } = await admin
    .from("push_notification_log")
    .upsert({ user_id: user.id, key: msg.key }, { onConflict: "user_id,key", ignoreDuplicates: true })
    .select("id");
  const id = claimed?.[0]?.id as string | undefined;
  if (!id) return NextResponse.json({ sent: 0, reason: "already-pinged-today" });

  const sent = await deliverPush(admin, user.id, id, msg, subs);
  return NextResponse.json({ sent, url: next.url });
}
