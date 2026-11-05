import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { readCoachHistory } from "../history";

describe("opening a long Cosmo conversation", () => {
  it("selects the latest page before displaying it oldest first", async () => {
    const logs = Array.from({ length: 12 }, (_, i) =>
      (["assistant", "user"] as const).map(role => ({
        id: `${i}-${role}`,
        role,
        content: `${role} ${i + 1}`,
        created_at: new Date(Date.UTC(2026, 10, i + 1)).toISOString(),
      })),
    ).flat();

    const client = createClient("http://localhost", "test-key", { global: {
      fetch: async (request) => {
        const query = new URL(String(request)).searchParams;
        expect(query.get("user_id")).toBe("eq.test-user");
        expect(query.get("order")).toBe("created_at.desc,role.asc,id.desc");
        const sorted = logs.toSorted((a, b) =>
          b.created_at.localeCompare(a.created_at) || a.role.localeCompare(b.role));
        return Response.json(sorted.slice(0, Number(query.get("limit"))));
      },
    } });
    const page = await readCoachHistory(client, "test-user", 20);
    expect(page.error).toBeNull();
    expect(page.messages.map(m => m.content)).toEqual(
      Array.from({ length: 10 }, (_, i) => [`user ${i + 3}`, `assistant ${i + 3}`]).flat(),
    );
    expect(page.before?.id).toBe("2-user");
  });
});
