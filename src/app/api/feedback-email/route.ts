import { MAIL_FROM } from "@/lib/emails/sender";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const sessionUser = await getUserFromRequest(req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const body = await req.json() as {
    subject?: string;
    description?: string;
    issueType?: string;
    userEmail?: string;
    feedbackId?: string;
  };

  const { subject, description, issueType, userEmail, feedbackId } = body;

  // Helper: write diagnostic info back to the feedback row so we can query it
  const logStatus = async (status: Record<string, unknown>) => {
    if (!feedbackId || !supabaseUrl || !serviceKey) return;
    try {
      const admin = createClient(supabaseUrl, serviceKey);
      await admin.from("feedback").update({ email_status: status }).eq("id", feedbackId);
    } catch { /* best-effort */ }
  };

  if (!resendKey) {
    await logStatus({ error: "RESEND_API_KEY not set in Vercel env vars", skipped: true });
    console.warn("[feedback-email] RESEND_API_KEY is not set.");
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!subject || !description) {
    await logStatus({ error: "Missing subject or description" });
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const typeLabel: Record<string, string> = {
    bug: "Bug Report",
    feature: "Feature Request",
    "lesson-content": "Lesson Content Issue",
    account: "Account Issue",
    other: "Other",
  };
  const typeDisplay = typeLabel[issueType ?? ""] ?? issueType ?? "Unknown";

  let resendStatus: number | null = null;
  let resendBody: unknown = null;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [process.env.ALERT_EMAIL || "kwanelebc031@gmail.com"],
        subject: `[${typeDisplay}] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px">
            <h2 style="color:#007A85">New Feedback from Notho</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;font-weight:700;width:140px;color:#6b7280">Type</td>
                <td style="padding:8px 0">${typeDisplay}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:700;color:#6b7280">From</td>
                <td style="padding:8px 0">${userEmail ?? "Anonymous"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:700;color:#6b7280">Subject</td>
                <td style="padding:8px 0">${subject}</td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
            <h3 style="font-size:14px;color:#374151;margin-bottom:8px">Description</h3>
            <p style="background:#f9fafb;border-radius:8px;padding:14px;white-space:pre-wrap;font-size:14px">${description}</p>
            <p style="font-size:12px;color:#9ca3af;margin-top:24px">Sent from Notho app feedback form</p>
          </div>
        `,
      }),
    });

    resendStatus = response.status;
    resendBody = await response.json().catch(() => null);

    // Always log so we can see the result in Vercel runtime logs
    console.log("[feedback-email] Resend response:", JSON.stringify({ resendStatus, resendBody }));

    if (!response.ok) {
      console.error("[feedback-email] Resend error:", resendStatus, resendBody);
      await logStatus({ resendStatus, resendBody, ok: false });
      return NextResponse.json({ ok: true, emailError: resendBody });
    }

    await logStatus({ resendStatus, resendBody, ok: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[feedback-email] fetch threw:", msg);
    await logStatus({ fetchError: msg, ok: false });
    return NextResponse.json({ ok: true, fetchError: msg });
  }
}
