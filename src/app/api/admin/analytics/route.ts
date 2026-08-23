/**
 * GET /api/admin/analytics?view=<view>&days=<n>
 *
 * Single admin-gated endpoint backing the whole dashboard. Every view maps to a
 * SECURITY DEFINER function in the database, so aggregation happens in Postgres
 * where it belongs - pulling raw rows into Node and reducing them there would
 * fall over the moment the event table gets real traffic.
 *
 * SECURITY - two independent gates, both must pass:
 *   1. This route resolves the caller from their Bearer token and checks
 *      profiles.is_admin (with ADMIN_EMAILS as a secondary fallback), matching
 *      the pattern already used by /api/admin/bugs.
 *   2. The RPCs themselves have EXECUTE revoked from anon and authenticated, so
 *      even a leaked anon key cannot reach them. Only service-role can.
 *
 * A missing service-role key returns 500 rather than falling back to the anon
 * client - failing closed is the whole point.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/apiAuth";
import { isAdminEmail, isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireAdmin(req: NextRequest, admin: SupabaseClient) {
  const user = await getUserFromRequest(req).catch(() => null);
  if (!user) return null;
  const dbAdmin = await isAdminUser(admin, user.id);
  const envAdmin = isAdminEmail(user.email);
  if (!dbAdmin && !envAdmin) return null;
  return user;
}

/** Whitelist of view → RPC. Anything not in here is rejected outright. */
const VIEWS: Record<string, string> = {
  overview: "admin_overview",
  daily: "admin_daily_activity",
  features: "admin_feature_usage",
  featureTime: "admin_feature_time",
  retention: "admin_retention",
  users: "admin_user_rows",
  user: "admin_user_detail",
  content: "admin_content_quality",
  concepts: "admin_concept_difficulty",
  courses: "admin_course_engagement",
  dropoff: "admin_dropoff",
  churn: "admin_churn_reasons",
  churnVerbatims: "admin_churn_verbatims",
  // Added by the analytics v2 migration. A view here that 500s with
  // "function does not exist" means that migration has not been applied yet.
  funnel: "admin_activation_funnel",
  segments: "admin_engagement_segments",
  matrix: "admin_retention_matrix",
  clock: "admin_activity_clock",
  atRisk: "admin_at_risk_users",
  featureLift: "admin_feature_lift",
  questions: "admin_question_offenders",
  growth: "admin_growth_accounting",
  streaks: "admin_streak_distribution",
};

function clampDays(raw: string | null, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), 1), 365);
}

function clampInt(raw: string | null, fallback: number, lo: number, hi: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), lo), hi);
}

export async function GET(req: NextRequest) {
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Analytics is not configured. SUPABASE_SERVICE_ROLE_KEY is missing." },
      { status: 500 }
    );
  }

  const user = await requireAdmin(req, admin);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "overview";
  const fn = VIEWS[view];
  if (!fn) {
    return NextResponse.json(
      { error: `Unknown view "${view}".`, allowed: Object.keys(VIEWS) },
      { status: 400 }
    );
  }

  const days = clampDays(url.searchParams.get("days"), 30);
  let args: Record<string, unknown> = { p_days: days };

  if (view === "retention" || view === "segments" || view === "streaks") {
    args = {};
  } else if (view === "users") {
    args = {
      p_search: (url.searchParams.get("search") ?? "").slice(0, 80) || null,
      p_limit: clampInt(url.searchParams.get("limit"), 100, 1, 500),
      p_offset: Math.max(Number(url.searchParams.get("offset") ?? 0), 0),
      p_sort: url.searchParams.get("sort") ?? "last_seen",
    };
  } else if (view === "user") {
    const id = url.searchParams.get("userId");
    // Validate shape before it reaches the RPC so a malformed id is a clean 400
    // rather than a Postgres cast error surfacing as a 500.
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "A valid userId is required." }, { status: 400 });
    }
    args = { p_user_id: id };
  } else if (view === "content") {
    args = { p_days: days, p_min_att: clampInt(url.searchParams.get("minAttempts"), 5, 1, 100) };
  } else if (view === "questions") {
    args = {
      p_days: days,
      p_min_att: clampInt(url.searchParams.get("minAttempts"), 4, 1, 100),
    };
  } else if (view === "churnVerbatims") {
    args = { p_days: days, p_limit: clampInt(url.searchParams.get("limit"), 100, 1, 500) };
  } else if (view === "matrix" || view === "growth") {
    args = { p_weeks: clampInt(url.searchParams.get("weeks"), 12, 2, 26) };
  } else if (view === "atRisk") {
    args = { p_limit: clampInt(url.searchParams.get("limit"), 50, 1, 300) };
  }

  const { data, error } = await admin.rpc(fn, args);

  if (error) {
    console.error(`[admin/analytics] ${view} failed:`, error.message);
    // The caller is already a verified admin, so hiding the cause from them
    // buys nothing and costs a debugging session - the previous version of this
    // route returned a bare 'Could not load "user"' for a missing column, which
    // took a database dump to diagnose. Admins see the real error; nobody else
    // can reach this line.
    const missingFn = /(does not exist|schema cache)/i.test(error.message ?? "");
    return NextResponse.json(
      {
        error: `Could not load "${view}".`,
        detail: error.message,
        code: error.code ?? null,
        hint: missingFn
          ? `The database function ${fn}() is missing. Apply the pending migrations in supabase/migrations (the newest is the admin analytics v2 one).`
          : "This is the raw Postgres error. It is shown because you are an admin.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { view, days, data, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
