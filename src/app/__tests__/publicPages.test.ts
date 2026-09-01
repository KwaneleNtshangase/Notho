import { describe, it, expect } from "vitest";

/* ─── robots.ts ──────────────────────────────────────────────────── */

describe("robots.ts", () => {
  it("exports a function that returns valid robots config", async () => {
    const mod = await import("../robots");
    const result = mod.default();

    expect(result).toHaveProperty("rules");
    expect(result).toHaveProperty("sitemap");

    // Sitemap points to production URL
    expect(result.sitemap).toBe("https://www.notho.co.za/sitemap.xml");

    // At least one rule exists
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules.length).toBeGreaterThan(0);

    // Private paths are disallowed
    const firstRule = rules[0];
    const disallowed = Array.isArray(firstRule.disallow)
      ? firstRule.disallow
      : [firstRule.disallow];
    expect(disallowed).toContain("/api/");
    expect(disallowed).toContain("/admin/");
    expect(disallowed).toContain("/settings");
    expect(disallowed).toContain("/onboarding");
  });
});

/* ─── sitemap.ts ─────────────────────────────────────────────────── */

describe("sitemap.ts", () => {
  it("exports a function that returns entries for all public pages", async () => {
    const mod = await import("../sitemap");
    const entries = mod.default();

    const urls = entries.map((e) => e.url);

    // All required public pages are listed
    const requiredPaths = [
      "/learn",
      "/privacy",
      "/terms",
      "/security",
      "/support",
      "/account-deletion",
    ];

    for (const path of requiredPaths) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }

    // Every entry has a url and lastModified
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.lastModified).toBeDefined();
    }
  });
});

/* ─── AuthGate bank-statement copy ───────────────────────────────── */

describe("AuthGate bank-statement copy", () => {
  it("does NOT contain the misleading 'never stored' phrasing", async () => {
    // Read the source file as text to verify the copy
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../../components/AuthGate.tsx"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    // The old misleading copy should no longer be present
    expect(content).not.toContain("processed in memory, never stored");

    // The corrected copy should be present
    expect(content).toContain(
      "statement files are processed in memory; categorised transactions are saved to your account"
    );
  });
});
