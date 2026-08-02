import { MAIL_FROM } from "@/lib/emails/sender";
import { NextResponse } from "next/server";

/** Disabled in production - diagnostic email test only for local development. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const ADDRESSES = [
    "support@fundiapp.co.za",
    "hello@fundiapp.co.za",
  ];

  const results: { to: string; ok: boolean; status?: number }[] = [];

  for (const to of ADDRESSES) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [to],
        subject: `[Notho Test] Delivery check → ${to}`,
        html: `<p>Test email to ${to}</p>`,
      }),
    });
    results.push({ to, ok: res.ok, status: res.status });
  }

  return NextResponse.json({ ok: true, results });
}
