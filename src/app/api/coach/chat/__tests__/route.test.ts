import { NextRequest } from "next/server";
import { afterEach, expect, it, vi } from "vitest";
import { POST } from "../route";

vi.mock("@/lib/apiAuth", () => ({ getUserFromRequest: async () => ({ id: "test-user" }) }));

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it.each([true, false])("only acknowledges the exchange if the insert succeeds (saved: %s)", async (saved) => {
  vi.stubEnv("GEMINI_API_KEY", "fake");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "fake");
  const inserted: unknown[] = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", async (request: RequestInfo | URL, options: RequestInit = {}) => {
    const url = new URL(String(request));
    if (url.hostname === "generativelanguage.googleapis.com") {
      return Response.json({ candidates: [{ content: { parts: [{ text: "Reply" }] } }] });
    }
    if (url.pathname.endsWith("/user_settings")) return Response.json([{ coach_ai_consent: true }]);
    if (options.method === "HEAD") return new Response(null, { headers: { "content-range": "*/0" } });
    if (options.method === "POST" && url.pathname.endsWith("/coach_ai_logs")) {
      inserted.push(...JSON.parse(String(options.body)));
      return saved ? new Response(null, { status: 201 }) :
        Response.json({ code: "42501", message: "insert denied" }, { status: 403 });
    }
    return Response.json([]);
  });
  const response = await POST(new NextRequest("http://localhost/api/coach/chat", {
    method: "POST", body: JSON.stringify({ message: "Question" }),
  }));
  expect(inserted).toEqual([
    { user_id: "test-user", role: "user", content: "Question" },
    { user_id: "test-user", role: "assistant", content: "Reply" },
  ]);
  expect(response.status).toBe(saved ? 200 : 500);
  expect(await response.json()).toEqual(saved ? { reply: "Reply", remaining: 9 } : { error: "history_save_failed" });
});
