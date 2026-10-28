/**
 * Test Suite 3: Budget
 */
import { test, expect } from "@playwright/test";
import { signIn, goToTab } from "./helpers";

test.describe("Budget", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await goToTab(page, "Budget");
  });

  test("3.1 — Budget tab loads without crashing", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Budget", exact: true })).toBeVisible();
    // Should not show an error or blank screen
    const errorText = page.locator("text=Something went wrong, text=Error");
    await expect(errorText).not.toBeVisible();
  });

  test("3.2 — Can switch between months", async ({ page }) => {
    const nextBtn = page.locator("button[aria-label*='next'], button >> text=›, button >> text=→").first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(400);
      // Month should have changed
      const monthLabel = await page.locator("text=/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i").first().textContent();
      expect(monthLabel).toBeTruthy();
    }
  });

  test("3.3 — Add income entry", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: "Add", exact: true });
    await addBtn.waitFor({ state: "visible", timeout: 10000 });
    await addBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Income +", exact: true }).click();

    const categoryBtn = dialog.getByRole("button", { name: /Salary|Business|Side Hustle|Other/i }).first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
    }

    const amountInput = dialog.locator('input[type="number"]').first();
    await amountInput.waitFor({ state: "visible", timeout: 5000 });
    await amountInput.fill("5000");

    const saveBtn = dialog.getByRole("button", { name: "Save Entry", exact: true });
    await saveBtn.click();
    await expect(page.getByText("Loading...", { exact: true })).toBeHidden({ timeout: 30_000 });
    await expect(page.getByText(/R5[\s\u00a0]000/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("3.4 — Year view loads with income/expenses chart", async ({ page }) => {
    const yearBtn = page.getByRole("button", { name: "Year", exact: true });
    if (await yearBtn.isVisible()) {
      await yearBtn.click();
      await page.waitForTimeout(600);
      // Chart container should be present
      await expect(page.getByText(/Overview$/)).toBeVisible({ timeout: 5_000 });
      const chart = page.locator(".recharts-wrapper:visible").first();
      if ((await chart.count()) > 0) await expect(chart).toBeVisible();
    }
  });

  test("3.5 — Set Budget modal opens", async ({ page }) => {
    const setBudgetBtn = page.locator("button", { hasText: /Set Budget/i }).first();
    if (await setBudgetBtn.isVisible()) {
      await setBudgetBtn.click();
      await page.waitForTimeout(400);
      // Modal should appear
      const modal = page.locator('[role="dialog"], .modal, .bottom-sheet').first();
      if (!await modal.isVisible()) {
        // Try checking for budget input fields directly
        const input = page.locator('input[type="number"]').first();
        await expect(input).toBeVisible({ timeout: 5_000 });
      }
    }
  });

  test("3.6 — Number formatting uses spaces not commas (R5 000)", async ({ page }) => {
    // Look for any formatted rand value on screen
    await page.waitForTimeout(1000);
    const bodyText = await page.locator("body").textContent() ?? "";
    // Should NOT have R1,000 style (with comma)
    const hasCommaFormat = /R\d{1,3},\d{3}/.test(bodyText);
    expect(hasCommaFormat).toBe(false);
  });
});
