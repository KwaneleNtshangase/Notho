import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // run sequentially so state builds correctly
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  // Splash screen + Supabase auth can take 20-25s in CI on mobile browsers.
  // These globals cover every expect() / waitFor() / action without touching each test.
  expect: { timeout: 30_000 },
  use: {
    // Canonical host. fundiapp.co.za 301s here via vercel.json, and bare
    // notho.co.za redirects to www — starting at www avoids both hops.
    baseURL: process.env.BASE_URL ?? "https://www.notho.co.za",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    // Give Supabase calls + splash screen time to complete on slow CI runners
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari (iPhone 14)",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "Mobile Chrome (Pixel 7)",
      use: { ...devices["Pixel 7"] },
    },
  ],
  // Override to just run one browser during local dev
  // npx playwright test --project="Desktop Chrome"
});
