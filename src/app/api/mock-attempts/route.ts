import { localizedMockJson } from "@/server/localizeMock";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";
import {
  fetchOwnedMockAttempt,
  startOrResumeMockAttempt,
} from "@/lib/mockAttempts/server";
import { validateStartBody } from "@/lib/mockAttempts/validation";
import { buildRe5MockQuestionManifest } from "@/server/re5MockBank";
import {
  auditMockEvent,
  rejectRateLimited,
} from "@/server/mockAttemptSecurity";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return localizedMockJson(req, { error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return localizedMockJson(req, { error: "Invalid JSON body" }, 400);
  }
  const valid = validateStartBody(body);
  if (!valid.ok) return localizedMockJson(req, { error: valid.error }, 400);

  let admin;
  try {
    admin = createServiceSupabase();
    const limited = await rejectRateLimited(
      admin,
      req,
      user.id,
      "attempt_start"
    );
    if (limited) return limited;

    const questions = buildRe5MockQuestionManifest(
      valid.value.courseId,
      valid.value.lessonId
    );
    const attemptId = await startOrResumeMockAttempt(admin, {
      userId: user.id,
      courseId: valid.value.courseId,
      lessonId: valid.value.lessonId,
      newAttempt: valid.value.newAttempt,
      questions,
    });
    const attempt = await fetchOwnedMockAttempt(admin, user, attemptId);
    if (!attempt) throw new Error("Created attempt could not be read");
    await auditMockEvent(admin, req, {
      userId: user.id,
      attemptId,
      action: "attempt_start",
      outcome: "allowed",
      metadata: { status: attempt.status },
    });
    return localizedMockJson(req, { attempt });
  } catch (error) {
    console.error("[mock-attempts/start]", error);
    return localizedMockJson(req, { error: "The mock attempt could not be started" }, 503);
  }
}
