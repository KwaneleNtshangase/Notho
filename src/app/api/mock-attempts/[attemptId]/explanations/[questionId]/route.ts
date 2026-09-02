import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { fetchOwnedMockExplanation } from "@/lib/mockAttempts/server";
import { validateUuid } from "@/lib/mockAttempts/validation";
import {
  auditMockEvent,
  mockJson,
  rejectRateLimited,
} from "@/server/mockAttemptSecurity";

export const runtime = "nodejs";
type RouteContext = {
  params: Promise<{ attemptId: string; questionId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getUserFromRequest(req);
  if (!user) return mockJson({ error: "Unauthorized" }, 401);
  const { attemptId, questionId } = await context.params;
  if (!validateUuid(attemptId) || !validateUuid(questionId)) {
    return mockJson({ error: "Invalid explanation id" }, 400);
  }

  try {
    const admin = createServiceSupabase();
    const limited = await rejectRateLimited(
      admin,
      req,
      user.id,
      "explanation_read"
    );
    if (limited) return limited;
    const explanation = await fetchOwnedMockExplanation(
      admin,
      user.id,
      attemptId,
      questionId
    );
    if (!explanation) {
      await auditMockEvent(admin, req, {
        userId: user.id,
        action: "explanation_read",
        outcome: "denied",
      });
      return mockJson({ error: "Explanation not found" }, 404);
    }
    await auditMockEvent(admin, req, {
      userId: user.id,
      attemptId,
      action: "explanation_read",
      outcome: "allowed",
      metadata: { questionId },
    });
    return mockJson({ questionId, explanation });
  } catch (error) {
    console.error("[mock-attempts/explanation]", error);
    return mockJson({ error: "Explanation unavailable" }, 503);
  }
}
