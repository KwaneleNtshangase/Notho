import { createHash } from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";

/** Escapes characters that are special in HTML to prevent XSS in email bodies. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Extract the real client IP from Vercel / proxy forwarding headers. */
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const MAX_BODY_BYTES = 16_384; // 16 KB hard cap on the request body
const RL_WINDOW_MS   = 10 * 60 * 1000; // 10-minute sliding window
const RL_MAX_PER_IP  = 20;             // max submissions per IP per window
// TODO(rate-limiting): For true cross-instance limiting on Vercel serverless,
// replace the DB-count approach below with Upstash Redis via @upstash/ratelimit
// (INCR + EXPIRE). The DB approach is correct but adds one SELECT round-trip
// and is eventually consistent across cold-start instances.

/**
 * Records an auto-captured client error as a "bug" in the feedback table so the
 * team can triage it in the admin console and (once fixed) notify the user.
 * Stored alongside manual reports; resolution state lives in email_status.
 *
 * Intentionally unauthenticated - errors happen on logged-out screens.
 */
export async function POST(req: NextRequest) {
  // ── 1. Content-type + body-size guards ───────────────────────────────────
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ ok: false, reason: "json_required" }, { status: 415 });
  }
  const clHeader = Number(req.headers.get("content-length") ?? 0);
  if (clHeader > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, reason: "payload_too_large" }, { status: 413 });
  }

  let body: {
    area?: string; message?: string; stack?: string; url?: string; userAgent?: string;
    extra?: Record<string, unknown> | null;
  };
  try {
    // Read as text first so we can enforce the hard cap even without a
    // Content-Length header (chunked transfers, etc.).
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, reason: "payload_too_large" }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = (body.message ?? "").toString().slice(0, 500).trim();
  if (!message) return NextResponse.json({ ok: false }, { status: 400 });

  const area = (body.area ?? "unknown").toString().slice(0, 80);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ ok: true, skipped: true });

  const admin = createClient(supabaseUrl, serviceKey);

  // ── 2. IP-based rate limiting (DB-count approach - see TODO above) ────────
  const ip = clientIp(req);
  if (ip !== "unknown") {
    const windowStart = new Date(Date.now() - RL_WINDOW_MS).toISOString();
    const { count } = await admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("issue_type", "bug")
      .gte("created_at", windowStart)
      .filter("email_status->>client_ip", "eq", ip);
    if ((count ?? 0) >= RL_MAX_PER_IP) {
      return NextResponse.json({ ok: true, throttled: true }, { status: 202 });
    }
  }

  // User is optional - errors can happen on unauthenticated screens.
  const user = await getUserFromRequest(req).catch(() => null);

  // Hash the email for the description/subject (preserved from Cowork's change).
  const userIdentifier = user?.email
    ? createHash('sha256').update(user.email).digest('hex').substring(0, 12)
    : "anonymous";

  const subject = `[Auto] ${area}: ${message}`.slice(0, 200);
  // Values stored in the DB stay raw - the admin page renders them safely via
  // React text nodes. Only the email HTML needs escaping.
  const description = [
    `Area: ${area}`,
    `URL: ${body.url ?? "-"}`,
    `User: ${userIdentifier}`,
    `Device: ${body.userAgent ?? "-"}`,
    body.extra ? `Extra: ${JSON.stringify(body.extra)}` : null,
    "",
    body.stack || message,
  ].filter(Boolean).join("\n").slice(0, 6000);

  const id = crypto.randomUUID();
  const { error: insertErr } = await admin.from("feedback").insert({
    id,
    user_id:    user?.id ?? null,
    subject,
    description,
    issue_type: "bug",
    email_status: {
      auto:      true,
      area,
      url:       body.url      ?? null,
      userAgent: body.userAgent ?? null,
      userEmail: user?.email   ?? null,
      client_ip: ip,           // stored for the rate-limit SELECT above
      status:    "new",
    },
  });
  if (insertErr) return NextResponse.json({ ok: false }, { status: 500 });

  // Throttle the team alert: only email on the first occurrence of this exact
  // error in the last 24h (avoid inbox spam from a repeating bug).
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("subject", subject)
      .gte("created_at", since);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && (count ?? 1) <= 1) {
      // HTML-escape every attacker-controlled value before it enters the email.
      const eArea      = escapeHtml(area);
      const eMessage   = escapeHtml(message);
      const eUrl       = escapeHtml((body.url       ?? "-").toString());
      const eUserAgent = escapeHtml((body.userAgent  ?? "-").toString());
      // userIdentifier is a hex digest - safe, but escape for consistency.
      const eUserId    = escapeHtml(userIdentifier);
      // body.extra is arbitrary JSON - serialise then escape the whole blob.
      const eExtra     = body.extra
        ? escapeHtml(JSON.stringify(body.extra).slice(0, 500))
        : null;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Notho <hello@fundiapp.co.za>",
          to:   [process.env.ALERT_EMAIL || "kwanelebc031@gmail.com"],
          subject: `Auto-captured bug: ${area}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px">
              <h2 style="color:#E03C31">A user hit a bug</h2>
              <p style="margin:4px 0"><b>Area:</b> ${eArea}</p>
              <p style="margin:4px 0"><b>User:</b> ${eUserId}</p>
              <p style="margin:4px 0"><b>Message:</b> ${eMessage}</p>
              <p style="margin:4px 0"><b>URL:</b> ${eUrl}</p>
              <p style="margin:4px 0"><b>Device:</b> ${eUserAgent}</p>
              ${eExtra ? `<p style="margin:4px 0"><b>Extra:</b> ${eExtra}</p>` : ""}
              <p style="margin:4px 0;font-size:12px;color:#9ca3af">User token: ${eUserId}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
              <p style="font-size:13px;color:#6b7280">Triage and notify the user from the admin console:</p>
              <p><a href="https://notho.co.za/admin/bugs" style="color:#007A85;font-weight:700">Open bug console →</a></p>
            </div>`,
        }),
      }).catch(() => { });
    }
  } catch {
    /* team alert is best-effort */
  }

  return NextResponse.json({ ok: true, id });
}
