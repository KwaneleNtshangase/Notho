import type { SupabaseClient } from "@supabase/supabase-js";

type CoachLog = {
  id: string;
  created_at: string;
  role: "user" | "assistant";
  content: string;
};

export type HistoryCursor = Pick<CoachLog, "id" | "created_at" | "role">;

export async function readCoachHistory(
  client: SupabaseClient,
  userId: string,
  limit: number,
  options: { before?: HistoryCursor; since?: string } = {},
) {
  // Both sides of an exchange share the database transaction timestamp.
  // Read the reply first when scanning backwards, then reverse for display.
  let query = client.from("coach_ai_logs")
    .select("id, created_at, role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("role", { ascending: true })
    .order("id", { ascending: false });
  if (options.since) query = query.gte("created_at", options.since);
  if (options.before) {
    const { created_at, role, id } = options.before;
    query = query.or([
      `created_at.lt."${created_at}"`,
      `and(created_at.eq."${created_at}",role.gt.${role})`,
      `and(created_at.eq."${created_at}",role.eq.${role},id.lt.${id})`,
    ].join(","));
  }
  const { data, error } = await query.limit(limit + 1).returns<CoachLog[]>();
  const rows = data ?? [];
  const messages = rows.slice(0, limit).reverse();
  return { messages, before: rows.length > limit ? messages[0] : null, error };
}
