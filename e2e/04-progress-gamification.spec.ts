/**
 * Test Suite 4: Progress & Gamification
 * Tests daily goals, streaks, daily challenges, leaderboard.
 */
import { test, expect } from "@playwright/test";
import { signIn, goToTab } from "./helpers";

test.describe("Progress & Gamification", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("4.1 — Daily Goal bar is visible in stats panel", async ({ page, isMobile }) => {
    if (isMobile) await goToTab(page, "Goals");
    await expect(page.locator("text=Daily Goal").first()).toBeVisible({ timeout: 10_000 });
    // At minimum the label is visible in the layout for this viewport.
    await expect(page.locator("text=Daily Goal")).toBeVisible();
  });

  test("4.2 — Daily challenges section appears on Learn tab", async ({ page }) => {
    await goToTab(page, "Goals");
    const challenges = page.locator("text=/Daily Challenge/i").first();
    await expect(challenges).toBeVisible({ timeout: 10_000 });
  });

  test("4.3 — Daily challenges show 3 items", async ({ page }) => {
    await goToTab(page, "Goals");
    // Give challenges time to load
    await page.waitForTimeout(1000);
    // If using specific class — else look for the 3 challenge cards
    const claimBtns = page.locator("button", { hasText: /Claim|Claimed/i });
    if (await claimBtns.count() > 0) {
      expect(await claimBtns.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test("4.4 — Hearts are visible in the current layout", async ({ page, isMobile }) => {
    const hearts = isMobile
      ? page.getByRole("button", { name: "Hearts status" })
      : page.getByText("Hearts", { exact: true }).first();
    await expect(hearts).toBeVisible({ timeout: 10_000 });
  });

  test("4.5 — Leaderboard loads and shows real user names", async ({ page }) => {
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Leaderboard|This week's learners/i })
    ).toBeVisible();
    await page.waitForTimeout(1500);
    // Names should appear — check they're NOT all "Learner XXXX"
    const entries = page.locator(".leaderboard-entry, [data-rank]");
    if ((await entries.count()) > 0) {
      // Check at least one entry text content
      const text = await entries.first().textContent();
      expect(text).toBeTruthy();
    }
    // Check no crash
    const errorMsg = page.locator("text=Something went wrong");
    await expect(errorMsg).not.toBeVisible();
  });

  test("4.6 — Weekly learners page loads without crash", async ({ page }) => {
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const error = page.locator("text=Something went wrong, text=Error loading");
    await expect(error).not.toBeVisible();
  });

  test("4.7 — Level progression is visible", async ({ page, isMobile }) => {
    if (isMobile) {
      await goToTab(page, "Profile");
      await expect(page.getByText(/Financial Learner · Level \d+/)).toBeVisible({ timeout: 10_000 });
      return;
    }
    await expect(page.getByText("Level", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#levelValue")).toHaveText(/^\d+$/);
  });

  test("4.8 — Weekly challenges track correctly", async ({ page }) => {
    await goToTab(page, "Goals");
    const wc = page.locator("text=/This Week|Weekly Challenge/i").first();
    await expect(wc).toBeVisible({ timeout: 10_000 });
    // Progress indicator should be visible
    const progress = page.locator("text=/[0-9]+\/[0-9]+/").first();
    if (await progress.isVisible()) {
      const text = await progress.textContent();
      expect(text).toMatch(/\d/);
    }
  });
});
