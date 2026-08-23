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
 * From the next lesson, X → "Leave" did nothing at all.
 *
 * The mechanism, captured on a local dev server against main:
 *
 *   t+0.0s  tap "Done - Back to Course"  → still LessonView, button still live
 *   t+1.5s  summary appears               (finalize was awaiting the server)
 *   tap "Continue"
 *   t+0.3s  summary gone, LessonView BACK, "Done - Back to Course" live again,
 *           URL still /lesson/...          ← router.push is still in flight
 *   t+3.0s  URL finally /course/...
 *
 * ── Why these specs are written the way they are ──────────────────────────
 *
 * A test that clicks "Continue" and then waits for /course/... PASSES ON MAIN.
 * The navigation does land, eventually. The bug is not that the app never gets
 * there; it is that for ~300ms–3s (much longer on a phone on a slow link) the
 * app puts the finish button back under the learner's thumb, and a human taps
 * the button they can see. That re-enters finalize, cancels the exit, and
 * recomputes elapsed time from a start that never resets.
 *
 * So these specs do two things a patient robot would not:
 *
 *   1. They watch CONTINUOUSLY from the moment "Continue" is pressed, instead
 *      of sleeping until the URL settles. The completion surface reappearing at
 *      any point is the failure.
 *   2. One of them behaves like the actual user — taps whatever completion
 *      button is on screen — and asserts both that the app still gets out and
 *      that the clock did not grow.
 */

/** Any button that re-enters finalize. Either one restarts the loop. */
const COMPLETION_SURFACE = /Done - Back to Course|Next Lesson:/;

async function boot(page: Page) {
  await resetHearts(page);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
  const shell = page.locator(".app-container").first();
  try {
    // waitFor, not isVisible({ timeout }). Locator.isVisible() ignores a
    // timeout option and answers immediately, so the app gets no chance to
    // boot. (signIn() in helpers.ts has the same latent issue — its
    // "already authenticated" fast path is decided on the first paint.)
    await shell.waitFor({ state: "visible", timeout: 90_000 });
  } catch {
    await signIn(page);
  }
}

/** Open the first course; returns its pathname. */
async function openFirstCourse(page: Page): Promise<string> {
  await page.locator(".course-card").first().waitFor({ state: "visible", timeout: 90_000 });
  await page.locator(".course-card").first().click();
  await page.locator(".lesson-node").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForURL(/\/course\//, { timeout: 30_000 });
  return new URL(page.url()).pathname;
}

async function openLesson(page: Page, which: "fresh" | "completed") {
  const node =
    which === "fresh"
      ? page.locator(".lesson-node.playable:not(.completed)").first()
      : page.locator(".lesson-node.completed").first();
  await expect(
    node,
    which === "fresh"
      ? "this spec needs an uncompleted playable lesson in the first course"
      : "this spec needs a completed lesson in the first course"
  ).toBeVisible({ timeout: 20_000 });
  await node.click();
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

const completionButton = (page: Page) =>
  page.locator("button", { hasText: COMPLETION_SURFACE }).first();

/**
 * Watch every 100ms until the URL settles on `coursePath`.
 *
 * Returns the first moment (ms since the call) at which a lesson completion
 * button was visible, or null if one never was. This is the assertion that
 * separates main from the fix: main puts the button back while the navigation
 * is in flight, the fix never renders LessonView again once a lesson is
 * finalised.
 */
async function watchExit(
  page: Page,
  coursePath: string,
  timeoutMs = 30_000
): Promise<{ surfaceReturnedAtMs: number | null; arrivedMs: number | null }> {
  const started = Date.now();
  let surfaceReturnedAtMs: number | null = null;
  while (Date.now() - started < timeoutMs) {
    const path = new URL(page.url()).pathname;
    if (path !== coursePath && surfaceReturnedAtMs === null) {
      if (await completionButton(page).isVisible().catch(() => false)) {
        surfaceReturnedAtMs = Date.now() - started;
      }
    }
    if (path === coursePath) return { surfaceReturnedAtMs, arrivedMs: Date.now() - started };
    await page.waitForTimeout(100);
  }
  return { surfaceReturnedAtMs, arrivedMs: null };
}

/** Having arrived, confirm we are not bounced back out again. */
async function expectStaysOnCourse(page: Page, coursePath: string, holdMs = 5000) {
  const deadline = Date.now() + holdMs;
  while (Date.now() < deadline) {
    expect(new URL(page.url()).pathname, "navigated away from the course page").toBe(coursePath);
    expect(
      await completionButton(page).isVisible().catch(() => false),
      "a lesson completion surface reappeared on top of the course page"
    ).toBe(false);
    await page.waitForTimeout(400);
  }
}

/** Read the mm:ss on the summary's Time card as seconds. */
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

/** Finish the lesson and wait for the summary. */
async function pressDoneAndAwaitSummary(page: Page) {
  await page.locator("button", { hasText: /Done - Back to Course/ }).first().click();
  await expect(page.getByText("XP Earned")).toBeVisible({ timeout: 30_000 });
}

test.describe("7 — lesson exit", () => {
  test("7.1 — Done - Back to Course lands on the course page, and the finish button never comes back", async ({
    page,
  }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");
    const lessonPath = new URL(page.url()).pathname;

    await playToCompletion(page);
    await pressDoneAndAwaitSummary(page);
    expect(new URL(page.url()).pathname, "still on the lesson while the summary is up").toBe(lessonPath);

    await page.locator("button", { hasText: /^\s*Continue\s*$/ }).first().click();
    const { surfaceReturnedAtMs, arrivedMs } = await watchExit(page, coursePath);

    expect(
      surfaceReturnedAtMs,
      `the lesson completion surface came back ${surfaceReturnedAtMs}ms after Continue, ` +
        `while the navigation to ${coursePath} was still in flight — this is the deadlock: ` +
        `tapping the button that is on screen re-enters finalize and cancels the exit`
    ).toBeNull();
    expect(arrivedMs, `never reached ${coursePath}`).not.toBeNull();

    await expectStaysOnCourse(page, coursePath);
  });

  /**
   * The other half of the mechanism: the window DURING finalize.
   *
   * finalize awaits completeLesson → /api/progress/sync-streak. On localhost
   * that is ~1s and easy to miss; on a phone on a bad link it is the several
   * seconds the bug report describes. So this spec creates that condition
   * deterministically by holding the request open for four seconds, which is
   * both the honest reproduction and what makes the assertions stable.
   *
   * Two things must then hold, and neither did on main:
   *  - the lesson's finish button must not still be sitting there live and
   *    apparently unresponsive, inviting the tap that restarts the loop;
   *  - the reported time must be the time spent on the LESSON, not the lesson
   *    plus however long the server took (and, after that, plus however long
   *    the summary sat on screen).
   */
  test("7.2 — while finalize is in flight the finish button is gone and the clock is already stopped", async ({
    page,
  }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);

    const HOLD_MS = 4000;
    await page.route("**/api/progress/sync-streak", async (route) => {
      await new Promise((r) => setTimeout(r, HOLD_MS));
      await route.continue();
    });

    await openLesson(page, "fresh");
    const lessonOpenedAt = Date.now();
    await playToCompletion(page);

    const tappedAt = Date.now();
    const expectedSeconds = Math.round((tappedAt - lessonOpenedAt) / 1000);
    await page.locator("button", { hasText: /Done - Back to Course/ }).first().click();

    // Poll across the held request. The finish button must be gone the whole
    // time — on main it stayed live for the full four seconds while
    // isFinalizingRef silently swallowed every tap.
    let stillLiveAtMs: number | null = null;
    const until = Date.now() + HOLD_MS - 500;
    while (Date.now() < until) {
      if (await completionButton(page).isVisible().catch(() => false)) {
        stillLiveAtMs = Date.now() - tappedAt;
        break;
      }
      await page.waitForTimeout(100);
    }
    expect(
      stillLiveAtMs,
      `the lesson finish button was still live ${stillLiveAtMs}ms into a ${HOLD_MS}ms finalize. ` +
        `A guard that silently swallows the tap is what invites the second tap.`
    ).toBeNull();

    await expect(page.getByText("XP Earned")).toBeVisible({ timeout: 30_000 });

    const reported = await summaryTimeSeconds(page);
    expect(reported, "the summary should show a mm:ss time").not.toBeNull();
    expect(
      reported as number,
      `the summary reported ${reported}s for a lesson that took about ${expectedSeconds}s. ` +
        `The clock must stop when the lesson is finalised, not keep running through ` +
        `the ${HOLD_MS}ms server round trip.`
    ).toBeLessThanOrEqual(expectedSeconds + 2);

    // And it must not keep moving while the summary is on screen.
    await page.waitForTimeout(5000);
    expect(await summaryTimeSeconds(page), "the clock kept climbing on the summary screen").toBe(
      reported
    );

    await page.locator("button", { hasText: /^\s*Continue\s*$/ }).first().click();
    const { arrivedMs } = await watchExit(page, coursePath);
    expect(arrivedMs, `stuck inside the lesson — never reached ${coursePath}`).not.toBeNull();
    await expectStaysOnCourse(page, coursePath);
  });

  test("7.3 — replaying an already-completed lesson exits cleanly too", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "completed");

    await playToCompletion(page);
    await pressDoneAndAwaitSummary(page);
    await page.locator("button", { hasText: /^\s*Continue\s*$/ }).first().click();

    const { surfaceReturnedAtMs, arrivedMs } = await watchExit(page, coursePath);
    expect(
      surfaceReturnedAtMs,
      `the completion surface came back ${surfaceReturnedAtMs}ms after Continue on the replay path`
    ).toBeNull();
    expect(arrivedMs, `never reached ${coursePath}`).not.toBeNull();
    await expectStaysOnCourse(page, coursePath);
  });

  test("7.4 — exiting mid-lesson via X then Leave lands on the course page", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");

    // Get a few steps in, so there is real in-memory lesson state and a saved
    // mid-lesson record for the exit to be stale about.
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

    const { arrivedMs } = await watchExit(page, coursePath);
    expect(arrivedMs, "Leave did nothing — still inside the lesson").not.toBeNull();
    await expectStaysOnCourse(page, coursePath);
  });

  test("7.5 — the back arrow then Leave also lands on the course page", async ({ page }) => {
    test.setTimeout(400_000);
    await boot(page);
    const coursePath = await openFirstCourse(page);
    await openLesson(page, "fresh");

    await page.getByRole("button", { name: "Back to course" }).click();
    await expect(page.getByText("Leave?")).toBeVisible({ timeout: 10_000 });
    await page.locator("button", { hasText: /^\s*Leave\s*$/ }).first().click();

    const { arrivedMs } = await watchExit(page, coursePath);
    expect(arrivedMs, "Leave did nothing — still inside the lesson").not.toBeNull();
    await expectStaysOnCourse(page, coursePath);
  });
});
