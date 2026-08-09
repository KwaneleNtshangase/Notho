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
};

function clampDays(raw: string | null, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), 1), 365);
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

  if (view === "retention") {
    args = {};
  } else if (view === "users") {
    args = {
      p_search: (url.searchParams.get("search") ?? "").slice(0, 80) || null,
      p_limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 100), 1), 500),
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
    args = { p_days: days, p_min_att: 5 };
  } else if (view === "churnVerbatims") {
    args = { p_days: days, p_limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 100), 1), 500) };
  }

  const { data, error } = await admin.rpc(fn, args);

  if (error) {
    // The message can name internal objects, so it is logged rather than
    // returned. The admin still gets enough to know which panel broke.
    console.error(`[admin/analytics] ${view} failed:`, error.message);
    return NextResponse.json(
      {
        error: `Could not load "${view}".`,
        hint: "If this is the first load, the analytics migration may not have been applied yet.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { view, days, data, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
