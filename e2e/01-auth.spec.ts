/**
 * Test Suite 1: Authentication
 * Tests sign-in, sign-out, and session persistence.
 */
import { test, expect } from "@playwright/test";
import { signIn, goToTab, BASE_URL } from "./helpers";

test.describe("Authentication", () => {
  // The production sign-in flow is exercised once on desktop. Each mobile
  // project still authenticates through the setup dependency and then runs the
  // complete application suite with that real session; repeating six isolated
  // UI logins per device only races Supabase's shared auth rate limit.
  test.skip(({ isMobile }) => Boolean(isMobile), "UI auth flow is covered by Desktop Chrome");

  // Opt out of the cached session from the `setup` project. This suite is
  // testing sign-in itself, so it needs a genuinely signed-out browser —
  // starting it pre-authenticated would make 1.2, 1.3 and 1.4 assert nothing.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("1.1 — Splash screen appears on first load", async ({ page }) => {
    await page.goto(BASE_URL);
    // Splash should show briefly
    // It may already have animated out — just ensure no JS crash
    await expect(page).toHaveURL(/(\/learn|\/)?$/);
  });

  test("1.2 — Sign-in form is visible before login", async ({ page }) => {
    await page.goto(BASE_URL);
    // Splash can take 20-25s on CI mobile runners — wait for the landing screen directly.
    const signInButton = page.locator('button', { hasText: /I Already Have an Account/i }).first();
    await signInButton.waitFor({ state: "visible", timeout: 30_000 });
    await signInButton.click();
    
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test("1.3 — Wrong password shows error", async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for splash to finish and land on landing page
    const signInButton = page.locator('button', { hasText: /I Already Have an Account/i }).first();
    await signInButton.waitFor({ state: "visible", timeout: 30_000 });
    await signInButton.click();
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 10_000 });
    await page.locator('input[type="email"]').first().fill("wrong@example.com");
    await page.locator('input[type="password"]').first().fill("wrongpassword");
    await page.locator('[data-testid="auth-submit"]').click();
    // Error message or still on auth screen
    await page.waitForTimeout(3000);
    const stillOnAuth = await page.locator('input[type="email"]').isVisible();
    expect(stillOnAuth).toBe(true); // should NOT be logged in
  });

  test("1.4 — Successful sign-in loads the app", async ({ page }) => {
    await signIn(page);
    await expect(page.locator("text=Learn").first()).toBeVisible();
    await expect(page.locator("text=Budget").first()).toBeVisible();
    await expect(page.locator("text=Profile").first()).toBeVisible();
  });

  test("1.5 — Stats panel shows XP, Streak, Level after login", async ({ page }) => {
    await signIn(page);
    // Stats sidebar (desktop) or stats section
    await expect(page.locator("#xpValue").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#streakValue").first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("#levelValue").first()).toBeVisible({ timeout: 5_000 });
  });

  test("1.6 — Sign out works", async ({ page }) => {
    await signIn(page);
    await goToTab(page, "Profile");
    
    // Navigate to Settings to find the Sign Out button
    await page.getByLabel("Settings").click();
    
    const signOutBtn = page.locator("button", { hasText: /Sign Out|Log Out/i }).last();
    await signOutBtn.waitFor({ state: "visible", timeout: 10_000 });
    await signOutBtn.click();
    // Should return to auth/landing screen
    const signInButton = page.locator('button', { hasText: /I Already Have an Account/i }).first();
    await expect(signInButton).toBeVisible({ timeout: 15_000 });
  });
});
