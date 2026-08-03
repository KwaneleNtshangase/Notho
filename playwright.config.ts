import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // run sequentially so state builds correctly
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  // ── Timeout budget ────────────────────────────────────────────────────────
  //
  // These three numbers have to be read together, and until now they were not.
  //
  // `timeout` was never set, so it took Playwright's default of 30s — the same
  // value as expect/action/navigation below. That is incoherent: a single slow
  // assertion could consume the entire test budget, so the test was killed
  // before the assertion could report what it was waiting for. It is why CI
  // failures showed up as a bare "Process completed with exit code 1" with a
  // `page.waitForTimeout` stack, which tells you nothing about the app.
  //
  // It also failed tests that were merely long. The lesson-flow specs (2.8,
  // 2.9) poll up to 40 times with a 500ms sleep at the top of each iteration —
  // 20 seconds of pure waiting before a single click, locator query or
  // re-render is counted. Spec 2.10 completes a lesson the same way and passed
  // at 21.7s, i.e. already using 72% of a 30s budget on a fast local machine.
  // On a shared CI runner, and on Mobile Safari especially, 2.8 and 2.9 crossed
  // the line. The app was completing lessons correctly the whole time.
  //
  // So: give each test a budget several times its longest internal wait, and
  // keep expect below it so a failing assertion has room to fail *and* report.
  timeout: 90_000,
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
