import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import {
  fetchOwnedMockAttempt,
  statusForMockAttemptError,
  submitMockAttempt,
} from "@/lib/mockAttempts/server";
import { validateUuid } from "@/lib/mockAttempts/validation";
import {
  auditMockEvent,
  mockJson,
  rejectRateLimited,
} from "@/server/mockAttemptSecurity";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ attemptId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) return mockJson({ error: "Unauthorized" }, 401);
  const { attemptId } = await context.params;
  if (!validateUuid(attemptId)) return mockJson({ error: "Invalid attempt id" }, 400);

  const admin = createServiceSupabase();
  try {
    const limited = await rejectRateLimited(admin, req, user.id, "attempt_submit");
    if (limited) return limited;
    await submitMockAttempt(admin, user.id, attemptId);
    const attempt = await fetchOwnedMockAttempt(admin, user, attemptId);
    if (!attempt) return mockJson({ error: "Attempt not found" }, 404);
    await auditMockEvent(admin, req, {
      userId: user.id,
      attemptId,
      action: "attempt_submit",
      outcome: "allowed",
      metadata: { reason: attempt.result?.submissionReason ?? null },
    });
    return mockJson({ attempt });
  } catch (error) {
    const status = statusForMockAttemptError(error);
    const attempt =
      status === 409
        ? await fetchOwnedMockAttempt(admin, user, attemptId).catch(() => null)
        : null;
    if (status === 500) console.error("[mock-attempts/submit]", error);
    return mockJson(
      {
        error:
          status === 409
            ? "View every question before submitting"
            : status === 404
              ? "Attempt not found"
              : "Attempt could not be submitted",
        ...(attempt ? { attempt } : {}),
      },
      status === 500 ? 503 : status
    );
  }
}
