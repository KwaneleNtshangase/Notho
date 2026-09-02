import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const migration = read(
  "supabase/migrations/20260901100000_server_authoritative_hearts.sql"
);
const hook = read("src/hooks/useNothoState.ts");
const e2eHelpers = read("e2e/helpers.ts");

describe("server-authoritative hearts", () => {
  it("uses a private balance projection and immutable account-scoped ledger", () => {
    expect(migration).toContain("CREATE TABLE public.heart_balances");
    expect(migration).toContain("CREATE TABLE public.heart_ledger");
    expect(migration).toContain("heart_ledger_user_idempotency_key");
    expect(migration).toContain("CREATE TRIGGER heart_ledger_is_immutable");
    expect(migration).toContain("Users read their own heart balance");
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.heart_balances\n" +
        "  FROM PUBLIC, anon, authenticated, service_role"
    );
  });

  it("allocates new and existing accounts without trusting legacy values", () => {
    expect(migration).toContain("CREATE TRIGGER create_initial_heart_balance_on_signup");
    expect(migration).toContain("'initial_allocation'");
    expect(migration).toContain("'migration_allocation'");
    expect(migration).toContain("FROM auth.users");
    expect(migration).not.toMatch(/SELECT[^;]+user_progress\.hearts/i);
  });

  it("exposes only authenticated spend/read and service-only grants", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.spend_heart");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.get_heart_balance");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.grant_hearts");
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.spend_heart(uuid) TO authenticated"
    );
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.grant_hearts(uuid, integer, uuid, jsonb)\n  TO service_role"
    );
    expect(migration).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.grant_hearts[^;]+authenticated/);
  });

  it("bounds zero-balance writes and preserves account deletion", () => {
    expect(migration).not.toContain("'no_balance_available'");
    expect(migration).toContain("delta = 0 AND reason = 'approved_purchase'");
    expect(migration).toMatch(
      /IF current_balance\.balance = 0 THEN\s+RETURN QUERY SELECT/
    );
    expect(migration).toContain("SELECT 1 FROM auth.users WHERE id = OLD.user_id");
    expect(migration).toContain("'actor_deleted' = 'true'");
  });

  it("removes inherited service-role table grants before exact grants", () => {
    expect(migration).toContain(
      "FROM PUBLIC, anon, authenticated, service_role"
    );
  });

  it("does not accept a browser balance or browser refill", () => {
    expect(hook).toContain('supabase.rpc("get_heart_balance")');
    expect(hook).toContain('supabase.rpc("spend_heart"');
    expect(hook).not.toContain('localStorage.setItem("notho-hearts"');
    expect(hook).not.toContain("syncHeartsToSupabase");
    expect(e2eHelpers).not.toContain('localStorage.setItem("notho-hearts"');
    expect(e2eHelpers).toContain('admin.rpc("grant_hearts"');
  });
});
