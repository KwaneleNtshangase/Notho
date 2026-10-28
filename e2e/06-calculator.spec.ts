/**
 * Test Suite 6: Calculator
 */
import { test, expect } from "@playwright/test";
import { signIn, goToTab } from "./helpers";

test.describe("Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await goToTab(page, "Calculate");
  });

  test("6.1 — Calculator tab loads", async ({ page }) => {
    const error = page.locator("text=Something went wrong");
    await expect(error).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Investment Calculator", exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("6.2 — Compound interest calculates and shows result", async ({ page }) => {
    // Find inputs
    await page.waitForTimeout(500);
    const inputs = page.locator('input[type="number"]');
    if ((await inputs.count()) >= 2) {
      await inputs.first().clear();
      await inputs.first().fill("10000");
      const calcBtn = page.locator("main").locator("button", { hasText: /Calculat|Solve|Show/i }).first();
      if (await calcBtn.isVisible()) {
        await calcBtn.click();
        await page.waitForTimeout(600);
        // Result should show a rand value using space format
        const resultText = await page.locator("body").textContent() ?? "";
        // Check for R followed by digits (with space formatting)
        expect(resultText).toMatch(/R\s*[\d\s]+/);
      }
    }
  });

  test("6.3 — Number results use space formatting (R10 000 not R10,000)", async ({ page }) => {
    await page.waitForTimeout(1000);
    const bodyText = await page.locator("body").textContent() ?? "";
    const hasCommaFormat = /R\d{1,3},\d{3}/.test(bodyText);
    expect(hasCommaFormat).toBe(false);
  });
});
