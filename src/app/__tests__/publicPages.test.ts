import { describe, it, expect } from "vitest";
import { PUBLIC_PATHS, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

describe("robots.ts", () => {
  it("exports a function that returns valid robots config", async () => {
    const mod = await import("../robots");
    const result = mod.default();

    expect(result).toHaveProperty("rules");
    expect(result).toHaveProperty("sitemap");
    expect(result.sitemap).toBe("https://www.notho.co.za/sitemap.xml");

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules.length).toBeGreaterThan(0);

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

describe("sitemap.ts", () => {
  it("exports a function that returns entries for all public pages", async () => {
    const mod = await import("../sitemap");
    const entries = mod.default();
    const urls = entries.map((e) => e.url);

    const requiredPaths = [
      "/about",
      "/personal-finance",
      "/investment-calculator",
      "/budgeting",
      "/financial-literacy",
      "/re5",
      "/learn",
      "/privacy",
      "/terms",
      "/security",
      "/support",
      "/account-deletion",
    ];

    for (const path of requiredPaths) {
      expect(urls.some((u) => u === `${SITE_URL}${path}` || u.endsWith(path))).toBe(true);
    }

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.lastModified).toBeDefined();
    }
  });
});

describe("seo copy", () => {
  it("keeps the public path list and description stable enough to cite", () => {
    expect(PUBLIC_PATHS).toContain("/about");
    expect(PUBLIC_PATHS).toContain("/investment-calculator");
    expect(SITE_DESCRIPTION.toLowerCase()).toContain("south african");
    expect(SITE_DESCRIPTION.toLowerCase()).toContain("not an fsp");
  });
});

describe("bank-statement copy", () => {
  it("does NOT contain the misleading 'never stored' phrasing", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../../components/BudgetImportPanel.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).not.toContain("processed in memory, never stored");
    expect(content).not.toContain("never stored");
    expect(content).toContain("We read it in memory and do not keep the file.");
  });
});

describe("Sign in with Apple configuration", () => {
  it("keeps the Apple OAuth option and iOS entitlement in source control", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const authGate = fs.readFileSync(
      path.resolve(__dirname, "../../components/AuthGate.tsx"),
      "utf-8"
    );
    const entitlements = fs.readFileSync(
      path.resolve(__dirname, "../../../ios/App/App/App.entitlements"),
      "utf-8"
    );

    expect(authGate).toContain('handleOAuthSignIn("apple")');
    expect(authGate).toContain('data-testid="apple-oauth"');
    expect(authGate).toContain("Continue with Apple");
    expect(entitlements).toContain("com.apple.developer.applesignin");
    expect(entitlements).toContain("<string>Default</string>");
  });
});
