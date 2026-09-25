import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { sastToday } from "@/lib/dates";
import { resolveMonthlyBudget, type BudgetTargetRow } from "@/lib/budget/budgetResolve";
import { computeCoachInsights, type CoachEntry } from "@/lib/coach/insights";
import {
  streakAtRiskPush,
  coachAlertPush,
  routinePush,
  pickPush,
  type PushMessage,
} from "@/lib/push/triggers";
import { resolveNextLesson } from "@/lib/push/nextLesson";
import { sendWebPush } from "@/lib/push/send";
import { CONTENT_DATA } from "@/data/content";
import { isTombstone } from "@/lib/sync/mergeRules";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUILT_IN_LABELS: Record<string, string> = {
  food: "Food & Groceries", transport: "Transport", housing: "Housing/Rent",
  debt: "Debt Repayments", savings: "Savings", entertainment: "Entertainment",
  airtime: "Airtime & Data", healthcare: "Healthcare", education: "Education",
  other: "Other",
};

function prevMonthKeyOf(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function daysInMonthOf(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceSupabase();
  const today = sastToday();
  const monthKey = today.slice(0, 7);
  const prevMonthKey = prevMonthKeyOf(monthKey);
  const catalog = CONTENT_DATA.courses.map((c) => ({
    id: c.id,
    title: c.title,
    units: c.units.map((u) => ({
      lessons: u.lessons.map((l) => ({ id: l.id, title: l.title, comingSoon: l.comingSoon })),
    })),
  }));

  const { data: subs } = await admin.from("push_subscriptions").select("user_id, endpoint, p256dh, auth");
  const byUser = new Map<string, { endpoint: string; p256dh: string; auth: string }[]>();
  for (const s of subs ?? []) {
    const uid = (s as { user_id: string }).user_id;
    const list = byUser.get(uid) ?? [];
    list.push({
      endpoint: (s as { endpoint: string }).endpoint,
      p256dh: (s as { p256dh: string }).p256dh,
      auth: (s as { auth: string }).auth,
    });
    byUser.set(uid, list);
  }
  const userIds = [...byUser.keys()];
  if (userIds.length === 0) return NextResponse.json({ sent: 0, evaluated: 0 });

  const { data: progressRows } = await admin
    .from("user_progress")
    .select("user_id, streak, last_activity_date, completed_lessons, pinned_courses, lesson_resume")
    .in("user_id", userIds);
  const progress = new Map(
    (progressRows ?? []).map((r: Record<string, unknown>) => [r.user_id as string, r])
  );

  const summary = { evaluated: userIds.length, sent: 0, skippedDuplicate: 0, failed: 0 };

  for (const userId of userIds) {
    try {
      const p = progress.get(userId);
      const pinned = (p?.pinned_courses as { ids?: string[] } | null)?.ids ?? [];
      const resumeRaw = p?.lesson_resume as { courseId?: string; lessonId?: string; cleared?: boolean } | null;
      const resume = resumeRaw && !isTombstone(resumeRaw) ? resumeRaw : null;
      const next = resolveNextLesson({
        courses: catalog,
        completedLessons: (p?.completed_lessons as string[] | null) ?? [],
        pinnedCourseIds: pinned,
        resume,
      });

      const streakMsg = streakAtRiskPush(
        Number(p?.streak ?? 0),
        (p?.last_activity_date as string | null) ?? null,
        today,
        next
      );
      const habitMsg = routinePush(
        (p?.last_activity_date as string | null) ?? null,
        today,
        next
      );

      let coachMsg: PushMessage | null = null;
      if (!streakMsg && !habitMsg) {
        const [entriesRes, targetsRes, catsRes] = await Promise.all([
          admin
            .from("budget_entries")
            .select("type, category, amount, entry_date, is_transfer")
            .eq("user_id", userId)
            .gte("entry_date", `${prevMonthKey}-01`)
            .lte("entry_date", today),
          admin
            .from("budget_targets")
            .select("category, monthly_limit, month_year")
            .eq("user_id", userId),
          admin.from("custom_budget_categories").select("id, name").eq("user_id", userId),
        ]);
        const targetRows = (targetsRes.data ?? []) as BudgetTargetRow[];
        const budgets: Record<string, number> = {};
        for (const c of new Set(targetRows.map((r) => r.category))) {
          const limit = resolveMonthlyBudget(targetRows, c, monthKey);
          if (limit > 0) budgets[c] = limit;
        }
        const categoryLabels: Record<string, string> = { ...BUILT_IN_LABELS };
        for (const c of (catsRes.data ?? []) as { id: string; name: string }[]) {
          categoryLabels[c.id] = c.name;
        }
        const insights = computeCoachInsights({
          monthKey,
          prevMonthKey,
          entries: (entriesRes.data ?? []) as CoachEntry[],
          budgets,
          categoryLabels,
          dayOfMonth: Number(today.slice(8, 10)),
          daysInMonth: daysInMonthOf(monthKey),
        });
        coachMsg = coachAlertPush(insights.find((i) => i.severity === "alert"));
      }

      const msg = pickPush([streakMsg, habitMsg, coachMsg]);
      if (!msg) continue;

      const { data: claimed } = await admin
        .from("push_notification_log")
        .upsert(
          { user_id: userId, key: msg.key },
          { onConflict: "user_id,key", ignoreDuplicates: true }
        )
        .select("id");
      if (!claimed || claimed.length === 0) {
        summary.skippedDuplicate++;
        continue;
      }

      let delivered = 0;
      for (const sub of byUser.get(userId) ?? []) {
        const result = await sendWebPush(sub, { title: msg.title, body: msg.body, url: msg.url });
        if (result.ok) delivered++;
      }
      if (delivered > 0) summary.sent++;
      else summary.failed++;
    } catch (err) {
      console.error("[push-triggers]", userId, err);
      summary.failed++;
    }
  }

  return NextResponse.json(summary);
}
