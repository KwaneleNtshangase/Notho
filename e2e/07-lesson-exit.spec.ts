import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  resetHearts,
  answerCurrentQuestion,
  atLessonSummary,
  recoverIfOutOfHearts,
  newAnswerMemory,
  describeAnswerMemory,
  BASE_URL,
} from "./helpers";

/**
 * Lesson exit — the P0 deadlock.
 *
 * Reported from production: finish a lesson, press "Done - Back to Course",
 * and instead of the course page you land back on a lesson-complete screen and
 * bounce between the two indefinitely while the elapsed-time counter climbs.
 * From the next lesson, the X → "Leave" did nothing at all.
 *
 * The mechanism, captured on a local dev server against main:
 *
 *   t+0.0s  tap "Done - Back to Course"   → still LessonView, button still live
 *   t+1.5s  summary appears               (finalize was awaiting the server)
 *   tap "Continue"
 *   t+0.3s  summary gone, LessonView BACK, "Done - Back to Course" live again,
 *           URL still /lesson/...          ← router.push is still in flight
 *   t+3.0s  URL finally /course/...
 *
 * The window at t+0.3s is the bug. Anyone who taps the button they can see
 * re-enters finalize, which cancels the exit and recomputes elapsed time from a
 * start that never resets. On a phone on a slow connection that window is
 * seconds long, which is why it reads as "stuck forever" rather than "a flicker".
 *
 * So these specs do not just assert the end state — they assert that the
 * completion surface never comes back, and that the URL STAYS on the course
 * page. A test that only checked the final URL would have passed on main.
 */

const COMPLETION_SURFACE = /Done - Back to Course|Next Lesson:/;

/** Boot the app. storageState from the setup project usually has us signed in
 *  already; fall back to the form when it does not. */
async function boot(page: Page) {
  await resetHearts(page);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
  const shell = page.locator(".app-container").first();
  try {
    // NOTE: waitFor, not isVisible({timeout}). Locator.isVisible() ignores a
    // timeout option and answers immediately, so the app gets no chance to boot.
    await shell.waitFor({ state: "visible", timeout: 90_000 });
  } catch {
    await signIn(page);
  }
}

/** Open the first course and return its URL. */
async function openFirstCourse(page: Page): Promise<string> {
  await page.locator(".course-card").first().waitFor({ state: "visible", timeout: 90_000 });
  await page.locator(".course-card").first().click();
  await page.locator(".lesson-node").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForURL(/\/course\//, { timeout: 30_000 });
  return new URL(page.url()).pathname;
}

/** Open a lesson node. `state` picks a never-completed lesson or a replay. */
async function openLesson(page: Page, state: "fresh" | "completed") {
  const locator =
    state === "fresh"
      ? page.locator(".lesson-node.playable:not(.completed)").first()
      : page.locator(".lesson-node.completed").first();
  await expect(
    locator,
    state === "fresh"
      ? "needs at least one uncompleted playable lesson in the first course"
      : "needs at least one completed lesson in the first course"
  ).toBeVisible({ timeout: 20_000 });
  await locator.click();
  await page.waitForURL(/\/lesson\//, { timeout: 30_000 });
}

/** Play the open lesson through to its completion surface. */
async function playToCompletion(page: Page) {
  const memory = newAnswerMemory();
  let i = 0;
  for (; i < 200; i++) {
    if (await recoverIfOutOfHearts(page)) continue;
    if (await atLessonSummary(page)) break;
    if (await page.locator("button", { hasText: COMPLETION_SURFACE }).first().isVisible().catch(() => false)) break;
    if (await answerCurrentQuestion(page, memory)) {
      await page.waitForTimeout(180);
      continue;
    }
    const cont = page
      .locator("main button", { hasText: /Continue|Check|I.ve done this|Done - I did it/i })
      .first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(180);
      continue;
    }
    const fill = page.locator('input[type="text"], input[type="number"]').first();
    if (await fill.isVisible().catch(() => false)) {
      await fill.fill("0");
      await page.locator("button", { hasText: /Check/i }).first().click();
      await page.waitForTimeout(180);
      continue;
    }
    break;
  }
  if (i >= 200) throw new Error(`lesson did not converge — ${describeAnswerMemory(memory)}`);
}

/**
 * Assert we are on the course page and STAY there.
 *
 * The staying is the point. On main the URL did eventually reach /course/...,
 * so a single assertion would have gone green while the user was still trapped.
 * Holding for several seconds catches a late re-render that puts the lesson
 * back, and the completion-surface check catches it even if the URL holds.
 */
async function expectSettledOnCourse(page: Page, coursePath: string, holdMs = 6000) {
  await page.waitForURL((u) => u.pathname === coursePath, { timeout: 30_000 });
  const deadline = Date.now() + holdMs;
  while (Date.now() < deadline) {
    expect(new URL(page.url()).pathname, "navigated away from the course page").toBe(coursePath);
    expect(
      await page.locator("button", { hasText: COMPLETION_SURFACE }).first().isVisible().catch(() => false),
      "a lesson completion surface came back on top of the course page"
    ).toBe(false);
    await page.waitForTimeout(500);
  }
}

/** Read the mm:ss on the summary's Time card. */
async function summaryTimeSeconds(page: Page): Promise<number | null> {
  const raw = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("div"));
    const el = els.find((e) => /^\d{2}:\d{2}$/.test((e.textContent ?? "").trim()));
    return el ? (el.textContent ?? "").trim() : null;
  });
  if (!raw) return null;
  const [m, s] = raw.split(":").map((n) => parseInt(n, 10));
  return m * 60 + s;
}

test.describe("7 — lesson exit", () => {
  test("7.1 — finishing a lesson and pressing Done - Back to Course lands on the course page and stays", async ({
    page,
  }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");
    const lessonPath = new URL(page.url()).pathname;

    await playToCompletion(page);

    await page.locator("button", { hasText: /Done - Back to Course/ }).first().click();

    // The summary is the only thing that may appear next. On main the finish
    // button stayed live through the await instead.
    await expect(page.getByText("XP Earned")).toBeVisible({ timeout: 30_000 });
    expect(new URL(page.url()).pathname, "still on the lesson while the summary is up").toBe(lessonPath);

    await page.locator("button", { hasText: /^\s*Continue\s*$/ }).first().click();
    await expectSettledOnCourse(page, coursePath);
  });

  test("7.2 — the lesson clock stops at finalise and does not climb on the summary", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    await openFirstCourse(page);
    await openLesson(page, "fresh");
    await playToCompletion(page);

    await page.locator("button", { hasText: /Done - Back to Course/ }).first().click();
    await expect(page.getByText("XP Earned")).toBeVisible({ timeout: 30_000 });

    const first = await summaryTimeSeconds(page);
    expect(first, "summary should show a mm:ss time").not.toBeNull();
    await page.waitForTimeout(6000);
    const second = await summaryTimeSeconds(page);
    expect(second, "the elapsed-time counter kept climbing on the summary screen").toBe(first);
  });

  test("7.3 — replaying an already-completed lesson exits to the course page", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "completed");
    await playToCompletion(page);

    await page.locator("button", { hasText: /Done - Back to Course/ }).first().click();
    await expect(page.getByText("XP Earned")).toBeVisible({ timeout: 30_000 });
    await page.locator("button", { hasText: /^\s*Continue\s*$/ }).first().click();

    await expectSettledOnCourse(page, coursePath);
  });

  test("7.4 — exiting mid-lesson via X then Leave lands on the course page", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");

    // Get a few steps in, so there is real in-memory lesson state and a saved
    // mid-lesson record to be stale about.
    const memory = newAnswerMemory();
    for (let i = 0; i < 4; i++) {
      if (await answerCurrentQuestion(page, memory)) {
        await page.waitForTimeout(200);
        continue;
      }
      const cont = page.locator("main button", { hasText: /Continue/i }).first();
      if (await cont.isVisible().catch(() => false)) {
        await cont.click();
        await page.waitForTimeout(200);
      }
    }

    await page.getByRole("button", { name: "Exit lesson" }).click();
    await expect(page.getByText("Leave?")).toBeVisible({ timeout: 10_000 });
    await page.locator("button", { hasText: /^\s*Leave\s*$/ }).first().click();

    await expectSettledOnCourse(page, coursePath);
  });

  test("7.5 — the back arrow then Leave also lands on the course page", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");

    await page.getByRole("button", { name: "Back to course" }).click();
    await expect(page.getByText("Leave?")).toBeVisible({ timeout: 10_000 });
    await page.locator("button", { hasText: /^\s*Leave\s*$/ }).first().click();

    await expectSettledOnCourse(page, coursePath);
  });
});
