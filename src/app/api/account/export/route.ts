import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

/**
 * POPIA "right to access": lets a signed-in user download all the personal
 * data we hold about them as a single JSON file. Requires the user's own
 * session (Bearer token) and only ever returns that user's own records.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceSupabase();

  const safe = async (table: string, column = "user_id") => {
    try {
      const { data } = await admin.from(table).select("*").eq(column, user.id);
      return data ?? [];
    } catch {
      return [];
    }
  };

  const [profiles, progress] = await Promise.all([
    safe("profiles"),
    safe("user_progress"),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    note: "This is all the personal data Notho holds about your account.",
    account: { id: user.id, email: user.email ?? null, createdAt: user.created_at ?? null },
    profile: profiles?.[0] ?? null,
    progress: progress?.[0] ?? null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="notho-my-data.json"`,
      "Cache-Control": "no-store",
    },
  });
}
