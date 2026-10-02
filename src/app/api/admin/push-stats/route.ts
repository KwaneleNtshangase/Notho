import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { isAdminEmail, isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  streak: "Streak save",
  routine: "Daily reminder",
  hello: "You're in",
  budget: "Budget",
  rank: "Rank",
  other: "Other",
};

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const ok = (await isAdminUser(admin, user.id)) || isAdminEmail(user.email);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = new Date(Date.now() - 28 * 86400000).toISOString();
  const { data, error } = await admin
    .from("push_notification_log")
    .select("id, kind, title, body, sent_at, opened_at, lesson_at")
    .gte("sent_at", since)
    .order("sent_at", { ascending: false })
    .limit(2000);

  if (error) {
    const missing = /column|schema cache|does not exist/i.test(error.message);
    return NextResponse.json({
      ready: false,
      detail: error.message,
      hint: missing
        ? "Run supabase/migrations/20261002133000_push_attribution.sql in the SQL editor."
        : error.message,
      rows: [],
      byKind: [],
      byCopy: [],
    });
  }

  const rows = data ?? [];
  const byKind = new Map<string, { kind: string; sent: number; opened: number; lesson: number }>();
  const byCopy = new Map<string, { title: string; kind: string; sent: number; opened: number; lesson: number }>();
  for (const r of rows) {
    const kind = (r.kind as string) || "other";
    const title = (r.title as string) || "(no title yet)";
    const k = byKind.get(kind) ?? { kind, sent: 0, opened: 0, lesson: 0 };
    k.sent++;
    if (r.opened_at) k.opened++;
    if (r.lesson_at) k.lesson++;
    byKind.set(kind, k);
    const c = byCopy.get(title) ?? { title, kind, sent: 0, opened: 0, lesson: 0 };
    c.sent++;
    if (r.opened_at) c.opened++;
    if (r.lesson_at) c.lesson++;
    byCopy.set(title, c);
  }

  const rate = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  return NextResponse.json({
    ready: true,
    windowDays: 28,
    sent: rows.length,
    opened: rows.filter((r) => r.opened_at).length,
    lesson: rows.filter((r) => r.lesson_at).length,
    byKind: [...byKind.values()]
      .map((x) => ({ ...x, label: KIND_LABEL[x.kind] ?? x.kind, openRate: rate(x.opened, x.sent), lessonRate: rate(x.lesson, x.sent) }))
      .sort((a, b) => b.sent - a.sent),
    byCopy: [...byCopy.values()]
      .map((x) => ({ ...x, openRate: rate(x.opened, x.sent), lessonRate: rate(x.lesson, x.sent) }))
      .sort((a, b) => b.opened - a.opened || b.sent - a.sent)
      .slice(0, 8),
  });
}
