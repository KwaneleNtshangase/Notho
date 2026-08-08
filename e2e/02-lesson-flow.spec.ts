/**
 * Test Suite 2: Lesson Flow (most critical user path)
 * Tests every step type, Continue button, completion, XP awarding.
 */
import { test, expect } from "@playwright/test";
import {
  signIn, goToTab, openFirstLesson, recoverIfOutOfHearts, atLessonSummary,
  answerCurrentQuestion, newAnswerMemory, describeAnswerMemory,
} from "./helpers";

/**
 * Iteration budget for the "drive a lesson to completion" loops.
 *
 * This is a backstop against a genuinely stuck step, not a length allowance.
 * Raising it does not make a lesson finishable: a wrong answer re-queues the
 * question (see answerCurrentQuestion in ./helpers), so a spec that answers
 * badly extends the lesson faster than it consumes it and no cap is ever large
 * enough. That was observed running past stepIndex 102 in one lesson at a cap
 * of 120. Answering correctly is what makes the loop terminate; this number
 * only decides how long a real deadlock takes to report.
 *
 * 120 clears the longest lesson in src/data (52 steps, one to two iterations
 * each) with room for the occasional re-queue.
 *
 * Deliberately not switched to a fixed short lesson: spec 2.10 asserts XP
 * increases, and replaying an already-completed lesson awards none.
 */
const LESSON_STEP_BUDGET = 120;

/**
 * These specs walk an entire lesson, so they are minutes, not seconds. The
 * global 90s in playwright.config.ts is right for everything else.
 *
 * Must exceed LESSON_STEP_BUDGET x worst-case iteration cost (~2s), otherwise
 * the test dies on the clock before the assertion below can run — and a bare
 * "Test timeout of 240000ms exceeded" tells you nothing about whether the loop
 * was converging. 360s leaves the budget room to be genuinely exhausted so the
 * describeAnswerMemory diagnostic is what you actually see.
 */
const LESSON_TEST_TIMEOUT_MS = 360_000;

test.describe("Lesson Flow", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("2.1 — Course categories load with lesson nodes", async ({ page }) => {
    await goToTab(page, "Learn");
    const courseCards = page.locator(".course-card");
    await expect(courseCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await courseCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("2.2 — Opening a course scrolls to top (not bottom)", async ({ page }) => {
    await goToTab(page, "Learn");
    await page.locator(".course-card").first().click();
    await page.waitForTimeout(600);
    const scrollY = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
    expect(scrollY).toBeLessThan(200); // should be near top
  });

  test("2.3 — Lesson opens and shows step content", async ({ page }) => {
    const title = await openFirstLesson(page);
    expect(title).toBeTruthy();
    expect(title!.length).toBeGreaterThan(0);
  });

  test("2.4 — Progress bar advances with each step", async ({ page }) => {
    await openFirstLesson(page);
    const bar = page.locator(".lesson-progress, [role='progressbar'], progress");
    if (await bar.isVisible()) {
      const initial = await bar.getAttribute("style") ?? await bar.getAttribute("value");
      // Click Continue
      await page.locator("button", { hasText: "Continue" }).first().click();
      await page.waitForTimeout(500);
      const updated = await bar.getAttribute("style") ?? await bar.getAttribute("value");
      expect(updated).not.toEqual(initial);
    }
  });

  test("2.5 — MCQ: selecting correct answer highlights green", async ({ page }) => {
    await openFirstLesson(page);
    let safety = 0;
    while (safety < 20) {
      safety++;
      const options = page.locator(".option-button:not([disabled])");
      if ((await options.count()) > 0) {
        await options.first().click();
        await page.waitForTimeout(400);
        // Check for correct/incorrect class
        const hasCorrect = await page.locator(".option-button.correct").count() > 0;
        const hasIncorrect = await page.locator(".option-button.incorrect").count() > 0;
        expect(hasCorrect || hasIncorrect).toBe(true);
        break;
      }
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("button", { hasText: "Continue" }).first();
      if (await cont.isVisible()) await cont.click();
      await page.waitForTimeout(400);
    }
  });

  test("2.6 — True/False step: clicking True or False works", async ({ page }) => {
    await openFirstLesson(page);
    let safety = 0;
    while (safety < 20) {
      safety++;
      const trueBtn = page.locator("button", { hasText: "True" }).first();
      if (await trueBtn.isVisible() && !(await trueBtn.isDisabled())) {
        await trueBtn.click();
        await page.waitForTimeout(400);
        // Feedback should appear
        const feedback = page.locator(".option-button.correct, .option-button.incorrect");
        expect(await feedback.count()).toBeGreaterThan(0);
        break;
      }
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("button", { hasText: "Continue" }).first();
      if (await cont.isVisible()) await cont.click();
      await page.waitForTimeout(400);
    }
  });

  test("2.7 — Continue button works on every step type (no stuck steps)", async ({ page }) => {
    test.setTimeout(LESSON_TEST_TIMEOUT_MS);
    const answers = newAnswerMemory();
    await openFirstLesson(page);
    let steps = 0;
    let safety = 0;
    while (safety < LESSON_STEP_BUDGET) {
      safety++;
      // Out of hearts blocks the lesson entirely; refill and resume.
      if (await recoverIfOutOfHearts(page)) continue;
      await page.waitForTimeout(250);
      // Done?
      const backBtn = page.locator("button", { hasText: /Back to Course|Done.*Course/i }).first();
      if (await backBtn.isVisible()) break;

      // Answer MCQ
      await answerCurrentQuestion(page, answers);

      // True/False

      // Action check done
      const doneAct = page.locator("button", { hasText: /I.ve done this|Done - I did it/i }).first();
      if (await doneAct.isVisible()) { await doneAct.click(); await page.waitForTimeout(300); }

      // Fill blank
      const fillInput = page.locator('input[type="text"]').first();
      if (await fillInput.isVisible()) { await fillInput.fill("0"); await page.locator("button", { hasText: "Check" }).first().click(); await page.waitForTimeout(300); }

      // Continue/Finish
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("button", { hasText: /Continue|Finish/i }).first();
      if (await cont.isVisible()) { await cont.click(); steps++; await page.waitForTimeout(500); continue; }

      break;
    }
    // Should have advanced at least 1 step without getting stuck
    expect(safety, `lesson never finished within the step budget — ${describeAnswerMemory(answers)}`).toBeLessThan(LESSON_STEP_BUDGET);
    expect(steps).toBeGreaterThan(0);
  });

  test("2.8 — Lesson completion screen appears with XP info", async ({ page }) => {
    test.setTimeout(LESSON_TEST_TIMEOUT_MS);
    const answers = newAnswerMemory();
    await openFirstLesson(page);
    // Fast-forward through lesson
    let safety = 0;
    while (safety < LESSON_STEP_BUDGET) {
      safety++;
      // Out of hearts blocks the lesson entirely; refill and resume.
      if (await recoverIfOutOfHearts(page)) continue;
      await page.waitForTimeout(250);
      const done = page.locator("text=XP Earned").first();
      if (await done.isVisible()) break;
      await answerCurrentQuestion(page, answers);
      const doneAct = page.locator("button", { hasText: /I.ve done this|Done - I did it/i }).first();
      if (await doneAct.isVisible()) await doneAct.click();
      const fillInput = page.locator('input[type="text"]').first();
      if (await fillInput.isVisible()) { await fillInput.fill("0"); await page.locator("button", { hasText: "Check" }).first().click(); }
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("main button", { hasText: /Continue|Finish|Next Lesson|Calculate/i }).first();
      if (await cont.isVisible()) { await cont.click(); await page.waitForTimeout(350); continue; }
      await page.waitForTimeout(300);
    }
    // Completion screen should show
    const xpText = page.locator("text=XP").first();
    await expect(xpText).toBeVisible({ timeout: 5_000 });
    const backBtn = page.locator("button", { hasText: /Continue/i }).first();
    await expect(backBtn).toBeVisible({ timeout: 5_000 });
  });

  test("2.9 — Back to Course returns to course map", async ({ page }) => {
    test.setTimeout(LESSON_TEST_TIMEOUT_MS);
    const answers = newAnswerMemory();
    page.on("pageerror", err => console.log("PAGE ERROR:", err));
    page.on("console", msg => console.log("PAGE CONSOLE:", msg.text()));
    await openFirstLesson(page);
    // Complete the lesson quickly
    let safety = 0;
    while (safety < LESSON_STEP_BUDGET) {
      safety++;
      // Out of hearts blocks the lesson entirely; refill and resume.
      if (await recoverIfOutOfHearts(page)) continue;
      await page.waitForTimeout(250);
      const summaryVisible = await page.locator("text=XP Earned").isVisible();
      if (summaryVisible) {
        console.log(`[test] summary screen visible`);
        const contSummary = page.locator("button", { hasText: /^Continue$/i }).last();
        console.log(`[test] clicking contSummary`);
        await contSummary.click();
        break;
      }
      await answerCurrentQuestion(page, answers);
      const doneAct = page.locator("button", { hasText: /I.ve done this|Done - I did it/i }).first();
      if (await doneAct.isVisible()) { console.log(`[test] clicking doneAct`); await doneAct.click(); }
      const fillInput = page.locator('input[type="text"]').first();
      if (await fillInput.isVisible()) { console.log(`[test] fillInput`); await fillInput.fill("0"); await page.locator("button", { hasText: "Check" }).first().click(); }
      const backBtn = page.locator("button", { hasText: /Back to Course/i }).first();
      if (await backBtn.isVisible()) { console.log(`[test] clicking backBtn`); await backBtn.click(); await page.waitForTimeout(500); continue; }
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("main button", { hasText: /Continue|Finish|Next Lesson|Calculate/i }).first();
      if (await cont.isVisible()) { console.log(`[test] clicking cont`); await cont.click(); await page.waitForTimeout(500); continue; }
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(500);
    // Should be back on course map (lesson nodes visible)
    await expect(page.locator(".lesson-node, .back-button").first()).toBeVisible({ timeout: 5_000 });
  });

  test("2.10 — XP increases after completing a lesson", async ({ page }) => {
    test.setTimeout(LESSON_TEST_TIMEOUT_MS);
    const answers = newAnswerMemory();
    // Capture initial XP
    const xpEl = page.locator("#xpValue").first();
    const initialXP = parseInt((await xpEl.textContent() ?? "0").replace(/\D/g, ""), 10);

    await openFirstLesson(page);
    let safety = 0;
    while (safety < LESSON_STEP_BUDGET) {
      safety++;
      // Out of hearts blocks the lesson entirely; refill and resume.
      if (await recoverIfOutOfHearts(page)) continue;
      const summaryVisible = await page.locator("text=XP Earned").isVisible();
      if (summaryVisible) {
        const contSummary = page.locator("button", { hasText: /^Continue$/i }).last();
        await contSummary.click();
        break;
      }
      await answerCurrentQuestion(page, answers);
      const doneAct = page.locator("button", { hasText: /I.ve done this|Done - I did it/i }).first();
      if (await doneAct.isVisible()) await doneAct.click();
      const fillInput = page.locator('input[type="text"]').first();
      if (await fillInput.isVisible()) { await fillInput.fill("0"); await page.locator("button", { hasText: "Check" }).first().click(); }
      const backBtn = page.locator("button", { hasText: /Back to Course/i }).first();
      if (await backBtn.isVisible()) { await backBtn.click(); await page.waitForTimeout(500); continue; }
      // The summary's button is also labelled "Continue". Without this the
      // click below dismisses the completion screen we are waiting for.
      if (await atLessonSummary(page)) break;
      const cont = page.locator("main button", { hasText: /Continue|Finish|Next Lesson|Calculate/i }).first();
      if (await cont.isVisible()) { await cont.click(); await page.waitForTimeout(400); continue; }
      await page.waitForTimeout(300);
    }
    // The loop must actually have reached the summary. Without this the test
    // passes when the lesson was never completed at all.
    expect(safety, `lesson never reached the completion screen — ${describeAnswerMemory(answers)}`).toBeLessThan(LESSON_STEP_BUDGET);

    await goToTab(page, "Learn");
    await page.waitForTimeout(1000); // wait for XP animation

    const updatedXP = parseInt((await xpEl.textContent() ?? "0").replace(/\D/g, ""), 10);
    // Was `toBeGreaterThanOrEqual`, i.e. "XP should not decrease" — which is
    // true when nothing happens at all. The test is named "XP increases after
    // completing a lesson"; it has to fail when XP does not increase, otherwise
    // it is a green light that means nothing. It passed for days while hearts
    // were exhausted and no lesson was ever finished.
    expect(updatedXP, "completing a lesson should award XP").toBeGreaterThan(initialXP);
  });
});
