import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { isAdminEmail, isAdminUser } from "@/lib/admin";

/** Escapes characters that are special in HTML to prevent XSS in email bodies. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type FeedbackRow = {
  id: string;
  user_id: string | null;
  subject: string | null;
  description: string | null;
  issue_type: string | null;
  email_status: Record<string, unknown> | null;
  created_at: string;
};

function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function requireAdmin(req: NextRequest, admin: SupabaseClient) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return null;
  // DB flag is authoritative; ADMIN_EMAILS env var is a secondary fallback.
  const dbAdmin = await isAdminUser(admin, user.id);
  const envAdmin = isAdminEmail(user.email);
  if (!dbAdmin && !envAdmin) return null;
  return user;
}

/** Resolve a user's email + first name (best-effort) for display / notifying. */
async function resolveUser(admin: SupabaseClient, userId: string | null, fallbackEmail?: string | null) {
  let email = fallbackEmail ?? null;
  let name: string | null = null;
  if (userId) {
    try {
      const { data } = await admin.auth.admin.getUserById(userId);
      email = data.user?.email ?? email;
    } catch { /* ignore */ }
    try {
      // NB: profiles has no display_name column - selecting it errors the query.
      const { data } = await admin.from("profiles").select("full_name, username").eq("user_id", userId).maybeSingle();
      const p = data as { full_name?: string; username?: string } | null;
      name = (p?.full_name || p?.username || "")?.trim() || null;
    } catch { /* ignore */ }
  }
  return { email, name };
}

export async function GET(req: NextRequest) {
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const user = await requireAdmin(req, admin);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await admin
    .from("feedback")
    .select("id, user_id, subject, description, issue_type, email_status, created_at")
    .eq("issue_type", "bug")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as FeedbackRow[];
  const emailCache = new Map<string, string | null>();
  const items = await Promise.all(rows.map(async (r) => {
    const es = (r.email_status ?? {}) as Record<string, unknown>;
    let email = (es.userEmail as string | null) ?? null;
    if (!email && r.user_id) {
      if (emailCache.has(r.user_id)) email = emailCache.get(r.user_id)!;
      else { const u = await resolveUser(admin, r.user_id); email = u.email; emailCache.set(r.user_id, email); }
    }
    const resolution = (es.resolution ?? null) as { status?: string; notified_at?: string; note?: string } | null;
    return {
      id: r.id,
      source: es.auto ? "auto" : "reported",
      area: (es.area as string) ?? null,
      subject: r.subject,
      description: r.description,
      userEmail: email,
      createdAt: r.created_at,
      status: resolution?.status ?? "new",
      notifiedAt: resolution?.notified_at ?? null,
      note: resolution?.note ?? null,
    };
  }));

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const user = await requireAdmin(req, admin);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = body.id as string | undefined;
  const status = (body.status as string | undefined) ?? "fixed";
  const notify = body.notify === true;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: row, error: readErr } = await admin
    .from("feedback").select("id, user_id, email_status").eq("id", id).maybeSingle();
  if (readErr || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const es = ((row as FeedbackRow).email_status ?? {}) as Record<string, unknown>;
  let emailResult: string | null = null;
  let emailDetail: string | null = null;

  if (notify) {
    const { email, name } = await resolveUser(admin, (row as FeedbackRow).user_id, es.userEmail as string | null);
    const resendKey = process.env.RESEND_API_KEY;
    if (!email) {
      emailResult = "no-email-on-file";
    } else if (!resendKey) {
      emailResult = "resend-not-configured";
    } else {
      // HTML-escape user-controlled values: name comes from profile data (user-
      // controlled); note comes from the admin POST but is still escaped for
      // defense in depth against stored-XSS if the admin UI ever renders it.
      const firstName = name ? escapeHtml(name.split(" ")[0]) : null;
      const greeting  = firstName ? `Hi ${firstName},` : "Hi there,";
      const fixedLine = note
        ? `Here's what changed: ${escapeHtml(note)}`
        : "Whatever wasn't behaving has been sorted on our side.";

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Notho <hello@fundiapp.co.za>",
          to: [email],
          subject: "Good news - we've fixed that for you",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;max-width:560px">
              <p>${greeting}</p>
              <p>A little while back something on Notho didn't work the way it should have while you were using it. We spotted it, and we wanted you to be the first to know: <b>it's now fixed.</b></p>
              <p>${fixedLine}</p>
              <p>You're all set - just carry on where you left off. Small things like this matter to us, and keeping Notho smooth and reliable for you is exactly what we're here for.</p>
              <p style="margin-top:20px">Thanks for being part of Notho 💚</p>
              <p style="color:#6b7280">- The Notho team</p>
              <p style="margin-top:24px"><a href="https://notho.co.za" style="background:#007A85;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700;display:inline-block">Open Notho</a></p>
            </div>`,
        }),
      });
      if (resp.ok) {
        emailResult = "sent";
      } else {
        const detail = await resp.text().catch(() => "");
        emailResult = `error-${resp.status}`;
        emailDetail = detail.slice(0, 400);
        console.error("[admin/bugs] Resend send failed", resp.status, detail);
      }
    }
  }

  const resolution = {
    status,
    note: note || (es.resolution as { note?: string } | undefined)?.note || null,
    notified_at: notify && emailResult === "sent"
      ? new Date().toISOString()
      : (es.resolution as { notified_at?: string } | undefined)?.notified_at ?? null,
    resolved_by: user.email ?? null,
  };
  const { error: updErr } = await admin
    .from("feedback")
    .update({ email_status: { ...es, resolution } })
    .eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, emailResult, emailDetail, status });
}
