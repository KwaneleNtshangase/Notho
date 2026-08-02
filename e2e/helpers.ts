/**
 * Shared test helpers for Notho E2E tests.
 * Credentials are set via environment variables so they never live in source.
 *
 * Usage:
 *   TEST_EMAIL=test@example.com TEST_PASSWORD=secret npx playwright test
 */
import { Page, expect } from "@playwright/test";

export const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e-test@fundiapp.co.za";
// NOT a brand string. This is the password of an existing Supabase auth
// account (TEST_EMAIL). The rebrand deliberately left it alone: renaming the
// literal cannot rename the stored credential, it would just break E2E login
// wherever secrets.TEST_PASSWORD is unset. Rotate it in Supabase first if you
// ever want to change it.
export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "FundiE2E_Test#2026";
export const BASE_URL =
  process.env.BASE_URL ?? "https://notho.co.za";

/** Sign in with email/password, wait for the app shell to appear */
export async function signIn(page: Page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  // Splash animation can take 20-25s on slow CI runners — wait for the landing page or form directly.
  const signInButton = page.locator('button', { hasText: /I Already Have an Account/i }).first();
  // Try to wait for the landing screen button; if visible, click it.
  try {
    await signInButton.waitFor({ state: "visible", timeout: 15_000 });
    await signInButton.click();
  } catch (e) {
    // If button doesn't appear, maybe we're already on the signin form.
  }

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  await emailInput.fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  // Click the primary sign-in/up submit button (has data-testid="auth-submit")
  await page.locator('[data-testid="auth-submit"]').click();
  // Wait for app container — means auth succeeded and app loaded
  await expect(page.locator(".app-container").first()).toBeVisible({
    timeout: 20_000,
  });
}

export type NavTab =
  | "Learn"
  | "Calculate"
  | "Budget"
  | "Leaderboard"
  | "Profile"
  | "Goals";

/**
 * Tab labels that have been renamed in the app. Keeping the old name working
 * means a rename doesn't silently break every spec that references it.
 */
const TAB_ALIASES: Record<string, NavTab> = {
  Progress: "Leaderboard",
  Quests: "Goals",
};

/** Navigate to a specific tab using the bottom nav / sidebar */
export async function goToTab(page: Page, tab: NavTab | keyof typeof TAB_ALIASES) {
  const target = TAB_ALIASES[tab] ?? (tab as NavTab);

  // Prefer an exact accessible-name match so "Learn" doesn't match "Learn more",
  // and so the assertion survives icon/label restyling.
  const byRole = page.getByRole("button", { name: target, exact: true }).first();
  const byLink = page.getByRole("link", { name: target, exact: true }).first();
  const byText = page.getByText(target, { exact: true }).first();

  for (const locator of [byRole, byLink, byText]) {
    if ((await locator.count()) > 0) {
      await locator.click({ timeout: 10_000 });
      await page.waitForTimeout(300);
      return;
    }
  }

  throw new Error(
    `goToTab: no nav control found for "${target}"` +
      (TAB_ALIASES[tab] ? ` (aliased from "${tab}")` : "") +
      `. Nav labels may have changed — check MobileBottomNav/DesktopSidebar.`
  );
}

/** Open the first available (non-locked) lesson and return its title */
export async function openFirstLesson(page: Page): Promise<string> {
  await goToTab(page, "Learn");
  // Click first course card
  await page.locator(".course-card").first().click();
  // Wait for the course page to load (compilation in dev mode can take time)
  await page.locator(".lesson-node").first().waitFor({ state: "visible", timeout: 15_000 });
  
  // Prefer an uncompleted playable lesson
  let lesson = page.locator(".lesson-node.playable:not(.completed)").first();
  if (await lesson.count() === 0) {
    // Fall back to any playable/completed lesson
    lesson = page.locator(".lesson-node.playable, .lesson-node.completed").first();
  }
  
  await lesson.click();
  // Wait for lesson page to load
  await page.locator(".step-title, .question-text").first().waitFor({ state: "visible", timeout: 15_000 });
  const title = await page.locator(".step-title, .question-text").first().textContent();
  return title ?? "unknown";
}

/** Advance through all steps of an open lesson, answering MCQs with the first option */
export async function completeLesson(page: Page) {
  let safety = 0;
  while (safety < 40) {
    safety++;
    // Check if we're on a completion screen
    const done = page.locator("text=Back to Course, text=Lesson Complete!, text=Perfect Lesson!, text=XP Earned").first();
    if (await done.isVisible()) break;

    // MCQ — click first option
    const options = page.locator(".option-button:not([disabled])");
    if ((await options.count()) > 0) {
      await options.first().click();
      await page.waitForTimeout(400);
    }

    // True/False
    const truBtn = page.locator("button", { hasText: "True" }).first();
    if (await truBtn.isVisible() && !(await truBtn.isDisabled())) {
      await truBtn.click();
      await page.waitForTimeout(400);
    }

    // Continue / Finish / Next / Calculate
    const continueBtn = page
    .locator("main button", { hasText: /Continue|Finish|Next Lesson|Calculate/i })
    .first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(600);
      continue;
    }

    // action-check: click "I've done this"
    const doneBtn = page.locator("button", { hasText: /I.ve done this|Done/i }).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(400);
      continue;
    }

    // Fill blank
    const fillInput = page.locator('input[type="text"]').first();
    if (await fillInput.isVisible()) {
      await fillInput.fill("0");
      await page.locator("button", { hasText: "Check" }).first().click();
      await page.waitForTimeout(400);
      continue;
    }

    // If nothing found, break to avoid infinite loop
    break;
  }
}
