import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { sendWebPush } from "@/lib/push/send";
import { resolveNextLesson } from "@/lib/push/nextLesson";
import { CONTENT_DATA } from "@/data/content";
import { isTombstone } from "@/lib/sync/mergeRules";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceSupabase();
  const [{ data: subs }, { data: progress }] = await Promise.all([
    admin.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", user.id),
    admin
      .from("user_progress")
      .select("completed_lessons, pinned_courses, lesson_resume")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no-subscription" });
  }

  const catalog = CONTENT_DATA.courses.map((c) => ({
    id: c.id,
    title: c.title,
    units: c.units.map((u) => ({
      lessons: u.lessons.map((l) => ({ id: l.id, title: l.title, comingSoon: l.comingSoon })),
    })),
  }));
  const resumeRaw = progress?.lesson_resume as { courseId?: string; lessonId?: string; cleared?: boolean } | null;
  const next = resolveNextLesson({
    courses: catalog,
    completedLessons: (progress?.completed_lessons as string[] | null) ?? [],
    pinnedCourseIds: (progress?.pinned_courses as { ids?: string[] } | null)?.ids ?? [],
    resume: resumeRaw && !isTombstone(resumeRaw) ? resumeRaw : null,
  });

  const payload = {
    title: "You're in",
    body: `${next.lessonTitle} is next. We'll tap you when it's time — not before.`,
    url: next.url,
  };

  let sent = 0;
  for (const sub of subs) {
    const result = await sendWebPush(sub, payload);
    if (result.ok) sent++;
  }
  return NextResponse.json({ sent, url: next.url });
}
