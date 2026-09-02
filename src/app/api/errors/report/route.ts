import { MAIL_FROM, ALERT_TO } from "@/lib/emails/sender";
import { nameFromAuthMetadata } from "@/lib/emails/lifecycle";
import { createHash } from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { escapeHtml, isAutomatedUserAgent } from "@/lib/errorReportGuards";
import {
  classifyClientError,
  summariseUserAgent,
  TRANSIENT_EMAIL_THRESHOLD,
} from "@/lib/errorNoise";

/** Extract the real client IP from Vercel / proxy forwarding headers. */
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const MAX_BODY_BYTES = 16_384;
const RL_WINDOW_MS   = 10 * 60 * 1000;
const RL_MAX_PER_IP  = 20;

export async function POST(req: NextRequest) {
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
  const classified = classifyClientError(area, message);

  // Client filters noise too. Repeat the check here because this endpoint is
  // public and an old client can still POST the Chrome abort string.
  if (classified.classification === "noise") {
    return NextResponse.json({ ok: true, skipped: "benign-noise" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ ok: true, skipped: true });

  const admin = createClient(supabaseUrl, serviceKey);

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

  const reportedUa = String(body.userAgent ?? "");
  if (isAutomatedUserAgent(reportedUa)) {
    return NextResponse.json({ ok: true, skipped: "automated-client" });
  }

  const user = await getUserFromRequest(req).catch(() => null);

  const userIdentifier = user?.email
    ? createHash('sha256').update(user.email).digest('hex').substring(0, 12)
    : "anonymous";

  let userName = "";
  if (user?.id) {
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name, username")
      .eq("user_id", user.id)
      .maybeSingle();
    userName = (prof?.full_name || prof?.username || "").trim();
  }
  if (!userName && user) userName = nameFromAuthMetadata(user.user_metadata);
  const userLabel = user?.email
    ? `${userName || "(no name set)"} <${user.email}>`
    : "Not signed in";

  const occurredAt = new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const clientLabel = summariseUserAgent(reportedUa);
  const subject = `[Auto] ${classified.severity} ${area}: ${message}`.slice(0, 200);
  const description = [
    `Severity: ${classified.severity}`,
    `Class: ${classified.classification}`,
    `Fingerprint: ${classified.fingerprint}`,
    `Area: ${area}`,
    `When: ${occurredAt} (SAST)`,
    `User: ${userLabel}`,
    `Client: ${clientLabel}`,
    `URL: ${body.url ?? "-"}`,
    `Device: ${body.userAgent ?? "-"}`,
    `Triage: ${classified.reason}`,
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
      auto:           true,
      area,
      url:            body.url      ?? null,
      userAgent:      body.userAgent ?? null,
      userEmail:      user?.email   ?? null,
      client_ip:      ip,
      status:         classified.classification === "transient" ? "transient" : "new",
      severity:       classified.severity,
      classification: classified.classification,
      fingerprint:    classified.fingerprint,
    },
  });
  if (insertErr) return NextResponse.json({ ok: false }, { status: 500 });

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("subject", subject)
      .gte("created_at", since);

    const occurrence = count ?? 1;
    const shouldEmail =
      classified.classification === "actionable" ||
      occurrence >= TRANSIENT_EMAIL_THRESHOLD;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && shouldEmail) {
      const eArea      = escapeHtml(area);
      const eMessage   = escapeHtml(message);
      const eUrl       = escapeHtml((body.url       ?? "-").toString());
      const eUserAgent = escapeHtml(reportedUa);
      const eClient    = escapeHtml(clientLabel);
      const eUserId    = escapeHtml(userIdentifier);
      const eUser      = escapeHtml(userLabel);
      const eWhen      = escapeHtml(occurredAt);
      const eSev       = escapeHtml(classified.severity);
      const eClass     = escapeHtml(classified.classification);
      const ePrint     = escapeHtml(classified.fingerprint);
      const eReason    = escapeHtml(classified.reason);
      const extraObj   = (body.extra ?? null) as Record<string, unknown> | null;
      const diagnostics = typeof extraObj?.diagnostics === "string" ? extraObj.diagnostics : null;
      const eDiagnostics = diagnostics ? escapeHtml(diagnostics.slice(0, 6000)) : null;
      const ref        = typeof extraObj?.ref === "string" ? escapeHtml(extraObj.ref) : null;
      const stack      = typeof body.stack === "string" ? body.stack.slice(0, 2500) : "";
      const eStack     = stack ? escapeHtml(stack) : null;
      const eExtra     = extraObj
        ? escapeHtml(JSON.stringify({ ...extraObj, diagnostics: undefined }).slice(0, 1500))
        : null;
      const sevColor = classified.severity === "P1" ? "#E03C31" : classified.severity === "P2" ? "#b45309" : "#007A85";

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: MAIL_FROM,
          to:   [ALERT_TO],
          subject:
            `Notho ${classified.severity}${ref ? ` [${ref}]` : ""}: ${area}` +
            (occurrence > 1 ? ` (${occurrence}x/24h)` : ""),
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:700px">
              <p style="margin:0 0 8px">
                <span style="display:inline-block;background:${sevColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:.04em;padding:3px 8px;border-radius:999px">${eSev}</span>
                <span style="display:inline-block;margin-left:6px;background:#f3f4f6;color:#374151;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px">${eClass}</span>
              </p>
              <h2 style="color:${sevColor};margin:0 0 4px">${classified.classification === "actionable" ? "Actionable client error" : "Repeated transient error"}</h2>
              ${occurrence > 1 ? `<p style="margin:0 0 12px;font-size:13px;color:#b45309">Occurrence ${occurrence} of this fingerprint in the last 24h.</p>` : ""}
              <p style="margin:0 0 12px;font-size:13px;color:#4b5563">${eReason}</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
                <tr><td style="padding:3px 0;color:#6b7280;width:120px"><b>User</b></td><td style="padding:3px 0">${eUser}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>When</b></td><td style="padding:3px 0">${eWhen} (SAST)</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>Area</b></td><td style="padding:3px 0">${eArea}</td></tr>
                ${ref ? `<tr><td style="padding:3px 0;color:#6b7280"><b>Reference</b></td><td style="padding:3px 0"><code>${ref}</code> — shown to the user</td></tr>` : ""}
                <tr><td style="padding:3px 0;color:#6b7280"><b>Message</b></td><td style="padding:3px 0">${eMessage}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>URL</b></td><td style="padding:3px 0">${eUrl}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>Client</b></td><td style="padding:3px 0">${eClient}</td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>Fingerprint</b></td><td style="padding:3px 0;font-size:12px"><code>${ePrint}</code></td></tr>
                <tr><td style="padding:3px 0;color:#6b7280"><b>UA</b></td><td style="padding:3px 0;font-size:12px">${eUserAgent}</td></tr>
              </table>
              ${eExtra ? `<p style="margin:4px 0;font-size:13px"><b>Context:</b> <code style="font-size:12px">${eExtra}</code></p>` : ""}
              ${eStack ? `<pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:11px;line-height:1.45;overflow-x:auto;white-space:pre-wrap">${eStack}</pre>` : ""}
              ${eDiagnostics ? `
                <h3 style="margin:20px 0 4px;font-size:15px">Statement layout fingerprint</h3>
                <p style="margin:0 0 8px;font-size:12px;color:#6b7280">
                  Column headings are the bank's own boilerplate, shown verbatim. Transaction
                  rows are masked. No statement content left the user's device.
                </p>
                <pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:11px;line-height:1.45;overflow-x:auto;white-space:pre-wrap">${eDiagnostics}</pre>
              ` : ""}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
              <p style="font-size:13px;color:#6b7280">Reply to the user if we have an address. Otherwise triage in the console.</p>
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
