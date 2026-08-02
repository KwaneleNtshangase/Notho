import { MAIL_FROM } from "@/lib/emails/sender";
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { isAdminEmail, isAdminUser } from "@/lib/admin";
import { buildRebrandAnnouncement } from "@/lib/emails/lifecycle";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Admin-only announcement broadcast.
 *
 * POST /api/admin/broadcast
 *   body: { dryRun?: boolean; confirm?: boolean; scheduledAt?: string }
 *
 * - dryRun (default true): returns the recipient count without sending.
 * - confirm: must be true for a real send.
 * - scheduledAt: ISO 8601. Defaults to 6 July 2026 08:00 SAST (06:00 UTC).
 *
 * Uses Resend's scheduled_at so delivery is handled by Resend at the set time.
 */

const DEFAULT_SCHEDULED_AT = "2026-07-22T06:00:00.000Z"; // 22 Jul 2026, 08:00 SAST (UTC+2)
const FROM = MAIL_FROM;
const SUBJECT = "Fundi Finance is now Notho";
const MAX_RECIPIENTS = 20000;
// Stable key for the current announcement's dedupe ledger. Start a genuinely new
// broadcast by bumping this together with SUBJECT so its ledger is separate.
const CAMPAIGN = "rebrand-notho";

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

/** Enumerate every confirmed auth user's email, de-duplicated. */
async function listAllEmails(admin: SupabaseClient): Promise<string[]> {
  const seen = new Set<string>();
  const perPage = 1000;
  for (let page = 1; page <= 200; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    for (const u of users) {
      const email = (u.email ?? "").trim().toLowerCase();
      if (!email) continue;
      // Only people who confirmed their address and aren't banned.
      if (!u.email_confirmed_at && !u.confirmed_at) continue;
      const banned = (u as { banned_until?: string | null }).banned_until;
      if (banned && new Date(banned).getTime() > Date.now()) continue;
      seen.add(email);
    }
    if (users.length < perPage) break;
  }
  return [...seen];
}

/**
 * Emails already sent for a campaign (dedupe ledger). Returns a lowercased Set,
 * or null if the ledger is unavailable (e.g. the migration hasn't been applied
 * yet) so the caller can proceed without crashing.
 */
async function loadSentSet(admin: SupabaseClient, campaign: string): Promise<Set<string> | null> {
  const { data, error } = await admin
    .from("broadcast_send_log")
    .select("email")
    .eq("campaign", campaign);
  if (error) return null;
  return new Set((data ?? []).map((r: { email: string }) => (r.email ?? "").trim().toLowerCase()));
}

/** Record successful sends in the dedupe ledger. Ignores anyone already logged. */
async function recordSent(admin: SupabaseClient, campaign: string, emails: string[]): Promise<void> {
  if (emails.length === 0) return;
  const rows = emails.map((email) => ({ campaign, email: email.trim().toLowerCase() }));
  await admin
    .from("broadcast_send_log")
    .upsert(rows, { onConflict: "campaign,email", ignoreDuplicates: true });
}



// Built once at module load. The bulk send has no per-recipient profile, so
// the greeting is the generic "Hi there" variant.
const REBRAND = buildRebrandAnnouncement();

async function scheduleOne(resendKey: string, to: string, scheduledAt?: string) {
  const payload: Record<string, unknown> = {
    from: FROM,
    to: [to],
    subject: scheduledAt ? SUBJECT : `[TEST] ${SUBJECT}`,
    html: REBRAND.html,
    text: REBRAND.text,
  };
  if (scheduledAt) payload.scheduled_at = scheduledAt;
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const detail = await resp.text();
    return { ok: false as const, detail: detail.slice(0, 200) };
  }
  return { ok: true as const };
}

/** GET ?preview=1 returns the rendered email HTML (marketing copy, not sensitive). */
export async function GET(req: NextRequest) {
  const preview = new URL(req.url).searchParams.get("preview");
  if (!preview) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(REBRAND.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(req: NextRequest) {
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server credentials missing" }, { status: 500 });
  const user = await requireAdmin(req, admin);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    dryRun?: boolean;
    confirm?: boolean;
    scheduledAt?: string;
    test?: boolean;
    testEmail?: string;
    /** dryRun only: include the full recipient list in the response. */
    listAll?: boolean;
    /** Restrict the send to these addresses (e.g. retrying failures). */
    onlyTo?: string[];
  };

  // Test send: deliver a single copy immediately to the admin (or a given address).
  if (body.test) {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    const to = (body.testEmail || user.email || "").trim();
    if (!to) return NextResponse.json({ error: "No test address available" }, { status: 400 });
    const r = await scheduleOne(resendKey, to); // no scheduledAt = send now
    if (!r.ok) return NextResponse.json({ error: `Test send failed: ${r.detail}` }, { status: 500 });
    return NextResponse.json({ test: true, sentTo: to });
  }

  const dryRun = body.dryRun !== false; // default true; must explicitly pass false
  const scheduledAt = body.scheduledAt || DEFAULT_SCHEDULED_AT;

  let emails: string[];
  try {
    emails = await listAllEmails(admin);
  } catch (e) {
    return NextResponse.json({ error: `Failed to list users: ${(e as Error).message}` }, { status: 500 });
  }

  // Optional retry filter: only send to this subset of known users.
  if (Array.isArray(body.onlyTo) && body.onlyTo.length > 0) {
    const wanted = new Set(body.onlyTo.map((e) => e.trim().toLowerCase()));
    emails = emails.filter((e) => wanted.has(e));
  }

  // Dedupe ledger: never send the same campaign to anyone twice. Applies to the
  // full send AND the targeted retry. If the ledger is unavailable (migration
  // not applied yet) we proceed without dedupe rather than block sending.
  let alreadySent = 0;
  const sentSet = await loadSentSet(admin, CAMPAIGN);
  const ledgerAvailable = sentSet !== null;
  if (sentSet) {
    const before = emails.length;
    emails = emails.filter((e) => !sentSet.has(e));
    alreadySent = before - emails.length;
  }

  if (emails.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `Recipient count ${emails.length} exceeds safety cap ${MAX_RECIPIENTS}.` },
      { status: 400 }
    );
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      recipients: emails.length,
      alreadySent,
      ledgerAvailable,
      scheduledAt,
      sample: emails.slice(0, 5),
      ...(body.listAll ? { all: emails } : {}),
    });
  }

  if (!body.confirm) {
    return NextResponse.json({ error: "confirm:true required for a real send" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });

  // Never schedule in the past (Resend rejects it, and the default date may now
  // be historical). Fall back to near-immediate delivery.
  let effectiveScheduledAt = scheduledAt;
  if (new Date(effectiveScheduledAt).getTime() <= Date.now()) {
    effectiveScheduledAt = new Date(Date.now() + 60_000).toISOString();
  }

  let scheduled = 0;
  const sentOk: string[] = [];
  const errors: { to: string; detail: string }[] = [];
  // Resend allows 10 req/s; 4 parallel per 1.1s (~3.6/s) leaves ample headroom
  // for lifecycle/bug emails sharing the same key.
  const CHUNK = 4;
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map((to) => scheduleOne(resendKey, to, effectiveScheduledAt)));
    results.forEach((r, idx) => {
      if (r.ok) { scheduled++; sentOk.push(chunk[idx]); }
      else errors.push({ to: chunk[idx], detail: r.detail });
    });
    if (i + CHUNK < emails.length) await new Promise((res) => setTimeout(res, 1100));
  }

  // Log everyone we successfully queued so they can never be sent this campaign
  // again. Best-effort: a ledger write failure must not fail the send response.
  try {
    await recordSent(admin, CAMPAIGN, sentOk);
  } catch {
    /* ledger unavailable (e.g. migration not applied) - send already succeeded */
  }

  return NextResponse.json({
    dryRun: false,
    scheduledAt: effectiveScheduledAt,
    totalRecipients: emails.length,
    scheduled,
    failed: errors.length,
    alreadySkipped: alreadySent,
    ledgerAvailable,
    errors: errors.slice(0, 20),
  });
}
