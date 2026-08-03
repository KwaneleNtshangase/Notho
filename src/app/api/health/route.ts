import { NextResponse } from "next/server";

/**
 * Machine-readable health endpoint for external uptime monitors.
 *
 * Why this exists rather than pointing a monitor at "/": the homepage is a
 * server-rendered shell. It returns 200 with the right <title> even when the
 * app behind it is completely broken — Supabase down, env vars missing, the
 * client bundle failing to boot. A monitor watching "/" would have stayed green
 * through every one of those. This endpoint fails when the app cannot actually
 * serve a user.
 *
 * Contract, kept deliberately narrow so it is safe to expose unauthenticated:
 *   200 {"status":"ok",      ...}  every dependency reachable
 *   503 {"status":"degraded",...}  at least one dependency is not
 *
 * It reports only whether a dependency answered, never what it said. No row
 * counts, no schema, no env values, no error bodies from upstream — a public
 * endpoint that echoes internal errors is an information leak, and monitors
 * only need the status code anyway.
 */

// Never cache: a cached 200 is exactly the wrong answer during an outage.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Per-dependency budget. Comfortably under any monitor's own timeout. */
const CHECK_TIMEOUT_MS = 5_000;

type CheckResult = { ok: boolean; ms: number; detail?: string };

async function timed(fn: (signal: AbortSignal) => Promise<boolean>): Promise<CheckResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const ok = await fn(controller.signal);
    return { ok, ms: Date.now() - started };
  } catch (e) {
    // Generic labels only — see the note above about not echoing upstream errors.
    const detail =
      e instanceof Error && e.name === "AbortError"
        ? `timeout after ${CHECK_TIMEOUT_MS}ms`
        : "unreachable";
    return { ok: false, ms: Date.now() - started, detail };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Supabase auth settings: unauthenticated, cheap, and touches the service the
 * app cannot work without. A 200 here means DNS, TLS, the project and the anon
 * key are all good. Deliberately not a table read — that would need a service
 * key on a public route, and would fail for reasons (RLS, a dropped column)
 * that are not "the site is down".
 */
async function checkSupabase(signal: AbortSignal): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: anonKey },
    signal,
    cache: "no-store",
  });
  return res.ok;
}

/**
 * The env vars the app cannot boot without. Missing ones are the classic
 * silent failure: the build succeeds, the deploy succeeds, and every request
 * 500s. Presence only — values are never read into the response.
 */
function checkConfig(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];
  const missing = required.filter((k) => !process.env[k]);
  return {
    ok: missing.length === 0,
    ms: 0,
    detail: missing.length ? `missing: ${missing.join(", ")}` : undefined,
  };
}

export async function GET() {
  const startedAt = Date.now();

  const config = checkConfig();
  const supabase = await timed(checkSupabase);

  const checks = { config, supabase };
  const ok = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      // Lets you tell a stale deployment from a current one when comparing
      // what the monitor saw against what you think is live.
      deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      checkedAt: new Date().toISOString(),
      totalMs: Date.now() - startedAt,
      checks,
    },
    {
      // 503 rather than 500: this is "dependency unavailable, try later", which
      // is what it is, and what monitors and load balancers expect.
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

/** HEAD costs a monitor less and is all most of them need. */
export async function HEAD() {
  const res = await GET();
  return new NextResponse(null, { status: res.status, headers: res.headers });
}
