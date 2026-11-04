import { localizedMockJson } from "@/server/localizeMock";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import {
  fetchOwnedMockAttempt,
  mutateMockAttempt,
  statusForMockAttemptError,
} from "@/lib/mockAttempts/server";
import { validateMutationBody, validateUuid } from "@/lib/mockAttempts/validation";
import {
  auditMockEvent,
  rejectRateLimited,
} from "@/server/mockAttemptSecurity";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ attemptId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) return localizedMockJson(req, { error: "Unauthorized" }, 401);
  const { attemptId } = await context.params;
  if (!validateUuid(attemptId)) return localizedMockJson(req, { error: "Invalid attempt id" }, 400);

  try {
    const admin = createServiceSupabase();
    const limited = await rejectRateLimited(admin, req, user.id, "attempt_read");
    if (limited) return limited;
    const attempt = await fetchOwnedMockAttempt(admin, user, attemptId);
    if (!attempt) {
      await auditMockEvent(admin, req, {
        userId: user.id,
        action: "attempt_read",
        outcome: "denied",
      });
      return localizedMockJson(req, { error: "Attempt not found" }, 404);
    }
    await auditMockEvent(admin, req, {
      userId: user.id,
      attemptId,
      action: "attempt_read",
      outcome: "allowed",
      metadata: { status: attempt.status },
    });
    return localizedMockJson(req, { attempt });
  } catch (error) {
    console.error("[mock-attempts/read]", error);
    return localizedMockJson(req, { error: "Attempt could not be loaded" }, 503);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) return localizedMockJson(req, { error: "Unauthorized" }, 401);
  const { attemptId } = await context.params;
  if (!validateUuid(attemptId)) return localizedMockJson(req, { error: "Invalid attempt id" }, 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return localizedMockJson(req, { error: "Invalid JSON body" }, 400);
  }
  const valid = validateMutationBody(body);
  if (!valid.ok) return localizedMockJson(req, { error: valid.error }, 400);

  const admin = createServiceSupabase();
  try {
    const limited = await rejectRateLimited(admin, req, user.id, "attempt_mutate");
    if (limited) return limited;
    const active = await mutateMockAttempt(admin, user.id, attemptId, valid.value);
    const attempt = await fetchOwnedMockAttempt(admin, user, attemptId);
    if (!attempt) return localizedMockJson(req, { error: "Attempt not found" }, 404);
    await auditMockEvent(admin, req, {
      userId: user.id,
      attemptId,
      action: "attempt_mutate",
      outcome: active ? "allowed" : "denied",
      metadata: { action: valid.value.action, status: attempt.status },
    });
    if (!active) {
      return localizedMockJson(req,
        { error: "This attempt is no longer active", attempt },
        409
      );
    }
    return localizedMockJson(req, { attempt });
  } catch (error) {
    const status = statusForMockAttemptError(error);
    const attempt =
      status === 409
        ? await fetchOwnedMockAttempt(admin, user, attemptId).catch(() => null)
        : null;
    if (status === 500) console.error("[mock-attempts/mutate]", error);
    return localizedMockJson(req,
      {
        error:
          status === 404
            ? "Attempt not found"
            : status === 409
              ? "This attempt is no longer active"
              : status === 400
                ? "Invalid attempt update"
                : "Attempt could not be updated",
        ...(attempt ? { attempt } : {}),
      },
      status === 500 ? 503 : status
    );
  }
}
