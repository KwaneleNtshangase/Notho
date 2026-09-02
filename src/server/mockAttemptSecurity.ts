import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type MockAuditAction =
  | "attempt_start"
  | "attempt_read"
  | "attempt_mutate"
  | "attempt_submit"
  | "explanation_read";

export const MOCK_RATE_LIMITS: Record<
  MockAuditAction,
  { max: number; windowSeconds: number }
> = {
  attempt_start: { max: 20, windowSeconds: 60 * 60 },
  attempt_read: { max: 500, windowSeconds: 2 * 60 * 60 },
  attempt_mutate: { max: 1_000, windowSeconds: 2 * 60 * 60 },
  attempt_submit: { max: 30, windowSeconds: 10 * 60 },
  explanation_read: { max: 100, windowSeconds: 10 * 60 },
};

export const MOCK_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export function mockJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: MOCK_RESPONSE_HEADERS,
  });
}

function requestFingerprint(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const source = forwarded || req.headers.get("x-real-ip");
  const salt = process.env.MOCK_AUDIT_HASH_SECRET;
  if (!source || !salt) return null;
  return createHash("sha256").update(`${salt}:${source}`).digest("hex");
}

export function learnerWatermark(user: Pick<User, "id" | "email">, attemptId: string) {
  const learner = user.email?.trim() || `Learner ${user.id.slice(0, 8)}`;
  return `${learner} · attempt ${attemptId.slice(0, 8)}`;
}

/** One stable UUID per account/action/fixed window bounds rejected-request rows. */
export function rateLimitAuditRequestId(
  userId: string,
  action: MockAuditAction,
  bucket: number
): string {
  const hex = createHash("sha256")
    .update(`mock-rate-limit:${userId}:${action}:${bucket}`)
    .digest("hex")
    .slice(0, 32)
    .split("");
  hex[12] = "4";
  hex[16] = "8";
  return [
    hex.slice(0, 8).join(""),
    hex.slice(8, 12).join(""),
    hex.slice(12, 16).join(""),
    hex.slice(16, 20).join(""),
    hex.slice(20, 32).join(""),
  ].join("-");
}

export async function auditMockEvent(
  admin: SupabaseClient,
  req: NextRequest,
  input: {
    userId: string;
    attemptId?: string | null;
    action: MockAuditAction;
    outcome: "allowed" | "denied" | "rate_limited" | "invalid" | "failed";
    metadata?: Record<string, unknown>;
    requestId?: string;
  }
): Promise<void> {
  const { error } = await admin.from("mock_exam_audit_log").upsert(
    {
      request_id: input.requestId ?? randomUUID(),
      user_id: input.userId,
      attempt_id: input.attemptId ?? null,
      action: input.action,
      outcome: input.outcome,
      ip_hash: requestFingerprint(req),
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      metadata: input.metadata ?? {},
    },
    { onConflict: "request_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}

/** Durable, account-scoped rolling check. Audit storage failure fails closed. */
export async function mockRateLimitExceeded(
  admin: SupabaseClient,
  userId: string,
  action: MockAuditAction
): Promise<boolean> {
  const limit = MOCK_RATE_LIMITS[action];
  const since = new Date(Date.now() - limit.windowSeconds * 1000).toISOString();
  const { count, error } = await admin
    .from("mock_exam_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("occurred_at", since);
  return Boolean(error) || (count ?? 0) >= limit.max;
}

export async function rejectRateLimited(
  admin: SupabaseClient,
  req: NextRequest,
  userId: string,
  action: MockAuditAction
): Promise<ReturnType<typeof mockJson> | null> {
  if (!(await mockRateLimitExceeded(admin, userId, action))) return null;
  const limit = MOCK_RATE_LIMITS[action];
  const bucket = Math.floor(Date.now() / (limit.windowSeconds * 1_000));
  await auditMockEvent(admin, req, {
    userId,
    action,
    outcome: "rate_limited",
    requestId: rateLimitAuditRequestId(userId, action, bucket),
    metadata: { bucket, windowSeconds: limit.windowSeconds },
  });
  return mockJson({ error: "Too many mock-exam requests. Try again later." }, 429);
}
