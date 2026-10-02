import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OUTCOME_CHECKS,
  sinceJoining,
  summariseCheck,
  summariseJoining,
  type BudgetSpendRow,
  type JoinCall,
  type LessonDone,
  type OutcomeSummary,
} from "@/lib/outcomes/spendHabits";

export type OutcomesPayload = {
  generatedAt: string;
  checks: OutcomeSummary[];
  sinceJoining: OutcomeSummary;
  coverage: {
    budgetUsers: number;
    lessonUsers: number;
    classifiedNote: string;
  };
};

async function fetchAll<T>(
  admin: SupabaseClient,
  table: string,
  columns: string
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; from < 50_000; from += pageSize) {
    const { data, error } = await admin.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }
  return rows;
}

/** profiles is keyed by user_id, not id. Join dates live on auth.users. */
async function loadAccounts(admin: SupabaseClient): Promise<{ id: string; username: string | null; createdAt: string | null }[]> {
  const profiles = await fetchAll<{ user_id: string; username: string | null }>(
    admin,
    "profiles",
    "user_id, username"
  );
  const names = new Map(profiles.map((p) => [p.user_id, p.username]));
  const accounts: { id: string; username: string | null; createdAt: string | null }[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    for (const user of data.users) {
      accounts.push({
        id: user.id,
        username: names.get(user.id) ?? null,
        createdAt: user.created_at ?? null,
      });
    }
    if (data.users.length < 200) break;
  }
  return accounts;
}

export async function loadOutcomes(admin: SupabaseClient): Promise<OutcomesPayload> {
  const [lessons, entries, accounts] = await Promise.all([
    fetchAll<{ user_id: string; course_id: string; lesson_id: string; completed_at: string }>(
      admin,
      "lesson_results",
      "user_id, course_id, lesson_id, completed_at"
    ),
    fetchAll<{
      user_id: string;
      type: string;
      category: string;
      amount: number;
      entry_date: string;
      is_transfer: boolean | null;
    }>(admin, "budget_entries", "user_id, type, category, amount, entry_date, is_transfer"),
    loadAccounts(admin),
  ]);

  const done: LessonDone[] = lessons
    .filter((r) => r.user_id && r.course_id && r.lesson_id && r.completed_at)
    .map((r) => ({
      userId: r.user_id,
      courseId: r.course_id,
      lessonId: r.lesson_id,
      completedAt: r.completed_at,
    }));

  const byUser = new Map<string, BudgetSpendRow[]>();
  for (const row of entries) {
    if (!row.user_id || !row.entry_date) continue;
    const type = row.type === "income" ? "income" : "expense";
    const spend: BudgetSpendRow = {
      userId: row.user_id,
      type,
      category: row.category ?? "other",
      amount: Number(row.amount),
      entryDate: String(row.entry_date).slice(0, 10),
      isTransfer: Boolean(row.is_transfer),
    };
    const list = byUser.get(row.user_id) ?? [];
    list.push(spend);
    byUser.set(row.user_id, list);
  }

  const names = new Map(accounts.map((p) => [p.id, p.username]));
  const today = new Date().toISOString();
  const checks = OUTCOME_CHECKS.map((check) => summariseCheck(check, done, byUser, names, today));

  const joins: JoinCall[] = accounts
    .filter((p) => p.createdAt && byUser.has(p.id))
    .map((p) => sinceJoining(p.id, p.createdAt as string, byUser.get(p.id) ?? [], today, p.username));

  return {
    generatedAt: today,
    checks,
    sinceJoining: summariseJoining(joins),
    coverage: {
      budgetUsers: byUser.size,
      lessonUsers: new Set(done.map((d) => d.userId)).size,
      classifiedNote:
        "Wants are entertainment, shopping and travel. Needs are food, transport, housing, airtime, healthcare and education. Transfers, debt, savings and custom categories are not wants. Click a name for the person view.",
    },
  };
}
