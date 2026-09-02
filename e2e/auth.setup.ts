import { test as setup } from "@playwright/test";
import { seedAuthenticatedSession, AUTH_STATE_PATH } from "./helpers";

/**
 * Create one trusted E2E-user session for the whole run and save it to disk.
 *
 * Why: every spec used to sign in per test via `beforeEach`. Across 41 tests,
 * three browser projects and up to two retries that is well over a hundred
 * POSTs to /auth/v1/token in a single run. Supabase rate-limits that endpoint
 * at roughly 30/hour per IP, and when the limit is hit the response comes back
 * without CORS headers — so the browser reports `TypeError: Failed to fetch`
 * and Playwright records status -1, which looks exactly like the app being
 * down. That is what took out twelve tests on the evening of 3 Aug, and it
 * would hit CI three times harder than it hit one laptop.
 *
 * This project runs first (see `dependencies` in playwright.config.ts) and every
 * other project starts from the saved storage state. The service credential
 * remains in Node; only the normal test user's session reaches the browser.
 *
 * 01-auth.spec.ts deliberately opts out: it is testing sign-in itself and needs
 * a clean, signed-out context.
 */
setup("authenticate once and cache the session", async ({ page }) => {
  await seedAuthenticatedSession(page);
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
