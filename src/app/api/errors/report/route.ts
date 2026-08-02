import { MAIL_FROM, ALERT_TO } from "@/lib/emails/sender";
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

  // Pseudonymous id, still used to correlate reports in the admin console
  // without printing an address on every row.
  const userIdentifier = user?.email
    ? createHash('sha256').update(user.email).digest('hex').substring(0, 12)
    : "anonymous";

  // The alert email needs a real person, not a hash. A bug report you cannot
  // reply to is half a bug report: the whole point is to message the user back
  // once it is fixed. Name comes from their profile; both are already ours.
  let userName = "";
  if (user?.id) {
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .maybeSingle();
    userName = (prof?.full_name || prof?.username || "").trim();
  }
  const userLabel = user?.email
    ? `${userName || "(no name set)"} <${user.email}>`
    : "Not signed in";

  // SAST, because that is the clock the person reporting it was looking at.
  const occurredAt = new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const subject = `[Auto] ${area}: ${message}`.slice(0, 200);
  // Values stored in the DB stay raw - the admin page renders them safely via
  // React text nodes. Only the email HTML needs escaping.
  const description = [
    `Area: ${area}`,
    `When: ${occurredAt} (SAST)`,
    `User: ${userLabel}`,
    `URL: ${body.url ?? "-"}`,
    `Device: ${body.userAgent ?? "-"}`,
    body.extra ? `Extra: ${JSON.stringify(body.extra)}` : null,
    "",
    body.stack || message,
  ].filter(Boolean).join("\n").slice(0, 12000);

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

  // EVERY occurrence is emailed. No throttle, no thresholds, no dedupe.
  //
  // Throttling was hiding exactly the signal that matters: the same person
  // hitting the same bug three times running is not noise, it is someone stuck
  // in a loop and about to give up on the product. At current volumes the
  // inbox can take it, and a full log beats a tidy one. Revisit only if the
  // volume genuinely becomes unmanageable - and then by routing, not silencing.
  //
  // The occurrence count is still computed, because "3rd time today" in the
  // subject line is useful triage context even when every one gets sent.
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("subject", subject)
      .gte("created_at", since);

    const occurrence = count ?? 1;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // HTML-escape every attacker-controlled value before it enters the email.
      const eArea      = escapeHtml(area);
      const eMessage   = escapeHtml(message);
      const eUrl       = escapeHtml((body.url       ?? "-").toString());
      const eUserAgent = escapeHtml((body.userAgent  ?? "-").toString());
      // userIdentifier is a hex digest - safe, but escape for consistency.
      const eUserId    = escapeHtml(userIdentifier);
      const eUser      = escapeHtml(userLabel);
      const eWhen      = escapeHtml(occurredAt);
      // The layout fingerprint is the thing that makes an import bug fixable,
      // so it gets its own readable block rather than being buried in the JSON
      // blob and truncated at 500 chars. It is masked by construction.
      const extraObj   = (body.extra ?? null) as Record<string, unknown> | null;
      const diagnostics = typeof extraObj?.diagnostics === "string" ? extraObj.diagnostics : null;
      const eDiagnostics = diagnostics ? escapeHtml(diagnostics.slice(0, 6000)) : null;
      const ref        = typeof extraObj?.ref === "string" ? escapeHtml(extraObj.ref) : null;
      // body.extra is arbitrary JSON - serialise then escape the whole blob.
      const eExtra     = extraObj
        ? escapeHtml(JSON.stringify({ ...extraObj, diagnostics: undefined }).slice(0, 1500))
        : null;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: MAIL_FROM,
          to:   [ALERT_TO],
          subject:
            `Notho bug${ref ? ` [${ref}]` : ""}: ${area}` +
            (occurrence > 1 ? ` (${occurrence}x today)` : ""),
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:700px">
              <h2 style="color:#E03C31;margin:0 0 4px">A user hit a bug</h2>
              ${occurrence > 1 ? `<p style="margin:0 0 12px;font-size:13px;color:#b45309">Occurrence ${occurrence} of this same error in the last 24h.</p>` : ""}
              <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
                <tr><td style="padding:3px 0;color:#6b7280;width:110px"><b>User</b></td><td style="padding:3px 0">${eUser}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>When</b></td><td style="padding:3px 0">${eWhen} (SAST)</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>Area</b></td><td style="padding:3px 0">${eArea}</td></tr>
                ${ref ? `<tr><td style="padding:3px 0;color:#6b7280"><b>Reference</b></td><td style="padding:3px 0"><code>${ref}</code> - the user was shown this code</td></tr>` : ""}
                <tr><td style="padding:3px 0;color:#6b7280"><b>Message</b></td><td style="padding:3px 0">${eMessage}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>URL</b></td><td style="padding:3px 0">${eUrl}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>Device</b></td><td style="padding:3px 0;font-size:12px">${eUserAgent}</td></tr>
              </table>
              ${eExtra ? `<p style="margin:4px 0;font-size:13px"><b>Context:</b> <code style="font-size:12px">${eExtra}</code></p>` : ""}
              ${eDiagnostics ? `
                <h3 style="margin:20px 0 4px;font-size:15px">Statement layout fingerprint</h3>
                <p style="margin:0 0 8px;font-size:12px;color:#6b7280">
                  Column headings are the bank's own boilerplate, shown verbatim. Transaction
                  rows are masked - every letter is x, every digit is 9. No statement content
                  left the user's device. This should be enough to build a fixture and add the
                  layout without asking them for the file.
                </p>
                <pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:11px;line-height:1.45;overflow-x:auto;white-space:pre-wrap">${eDiagnostics}</pre>
              ` : ""}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
              <p style="font-size:13px;color:#6b7280">Reply to the user directly, or triage from the console:</p>
              <p><a href="https://www.notho.co.za/admin/bugs" style="color:#007A85;font-weight:700">Open bug console →</a></p>
              <p style="margin:12px 0 0;font-size:11px;color:#9ca3af">User token: ${eUserId}</p>
            </div>`,
        }),
      }).catch(() => { });
    }
  } catch {
    /* team alert is best-effort */
  }

  return NextResponse.json({ ok: true, id });
}
