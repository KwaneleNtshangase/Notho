import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { sastToday } from "@/lib/dates";
import { sastWeekKey } from "@/lib/dates";
import { resolveMonthlyBudget, type BudgetTargetRow } from "@/lib/budget/budgetResolve";
import { computeCoachInsights, type CoachEntry } from "@/lib/coach/insights";
import {
  streakAtRiskPush,
  coachAlertPush,
  pickPush,
  type PushMessage,
} from "@/lib/push/triggers";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Evening push-trigger cron (vercel.json, 16:00 UTC = 18:00 SAST).
 *
 * For every user with a push subscription, evaluates in priority order:
 *   1. streak at risk (3+ day streak, nothing done today)
 *   2. coach alert (a category just went over budget)
 * Leaderboard defence is parked with the public board.
 * and sends AT MOST ONE push per user per day. The push_notification_log
 * unique (user_id, key) constraint makes every send idempotent.
 */

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const admin = createServiceSupabase();
  const today = sastToday();
  const monthKey = today.slice(0, 7);
  const prevMonthKey = prevMonthKeyOf(monthKey);
  const weekKey = sastWeekKey();

  // ── Who can we even push to? ───────────────────────────────────────────────
  const { data: subs } = await admin.from("push_subscriptions").select("user_id");
  const userIds = [...new Set((subs ?? []).map((s: { user_id: string }) => s.user_id))];
  if (userIds.length === 0) return NextResponse.json({ sent: 0, evaluated: 0 });

  // ── Progress rows (streak) for subscribed users ───────────────
  const { data: progressRows } = await admin
    .from("user_progress")
    .select("user_id, streak, last_activity_date, weekly_xp, week_key")
    .in("user_id", userIds);
  const progress = new Map(
    (progressRows ?? []).map((r: {
      user_id: string; streak: number | null; last_activity_date: string | null;
      weekly_xp: number | null; week_key: string | null;
    }) => [r.user_id, r])
  );

  const summary = { evaluated: userIds.length, sent: 0, skippedDuplicate: 0, failed: 0 };

  for (const userId of userIds) {
    try {
      const p = progress.get(userId);

      // 1. Streak at risk
      const streakMsg = streakAtRiskPush(
        Number(p?.streak ?? 0),
        p?.last_activity_date ?? null,
        today
      );

      // 2. Coach alert (only compute the heavier budget query when needed)
      let coachMsg: PushMessage | null = null;
      if (!streakMsg) {
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

      const msg = pickPush([streakMsg, coachMsg]);
      if (!msg) continue;

      // Dedupe: claim the (user_id, key) slot; only send if we inserted it.
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

      const res = await fetch(`${supabaseUrl}/functions/v1/send-push-notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          mode: "targeted",
          user_id: userId,
          title: msg.title,
          body: msg.body,
          url: msg.url,
        }),
      });
      if (res.ok) summary.sent++;
      else summary.failed++;
    } catch (err) {
      console.error("[push-triggers]", userId, err);
      summary.failed++;
    }
  }

  return NextResponse.json(summary);
}
