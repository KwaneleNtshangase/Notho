import { defineConfig, devices } from "@playwright/test";

/** Gesture checks for the share handoff. No production login. */
export default defineConfig({
  testDir: ".",
  testMatch: "share-gesture.spec.ts",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { headless: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], browserName: "chromium" } },
    // iPhone and Pixel are Chromium with those devices' viewport and user agent.
    // This is not WebKit and not a device.
    { name: "iphone-web", use: { ...devices["iPhone 14"], browserName: "chromium" } },
    { name: "pixel-web", use: { ...devices["Pixel 7"], browserName: "chromium" } },
  ],
});
