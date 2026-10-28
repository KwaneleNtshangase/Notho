/**
 * Shared test helpers for Notho E2E tests.
 * Credentials are set via environment variables so they never live in source.
 *
 * Usage:
 *   TEST_EMAIL=test@example.com TEST_PASSWORD=secret npx playwright test
 */
import { Page, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const TEST_EMAIL = process.env.TEST_EMAIL ?? "e2e-test@fundiapp.co.za";
// NOT a brand string. This is the password of an existing Supabase auth
// account (TEST_EMAIL). The rebrand deliberately left it alone: renaming the
// literal cannot rename the stored credential, it would just break E2E login
// wherever secrets.TEST_PASSWORD is unset. Rotate it in Supabase first if you
// ever want to change it.
export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "FundiE2E_Test#2026";
// Canonical host, with www. Bare notho.co.za 301s to www, and every redirect
// hop is charged against the splash-screen timeouts the specs below rely on.
export const BASE_URL =
  process.env.BASE_URL ?? "https://www.notho.co.za";

let testUserIdPromise: Promise<string> | null = null;

/**
 * Top up the shared test account through the trusted, ledgered grant RPC.
 * This runs in Playwright's Node process: the service credential is never sent
 * to the page, bundled into the app or exposed as a browser refill path.
 */
export async function resetServerHearts(): Promise<void> {
  const url = process.env.TEST_SUPABASE_URL;
  const serviceKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Server-authoritative heart setup requires TEST_SUPABASE_URL and " +
        "TEST_SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  testUserIdPromise ??= (async () => {
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1_000,
    });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === TEST_EMAIL.toLowerCase()
    );
    if (!user) throw new Error(`E2E account ${TEST_EMAIL} was not found`);
    return user.id;
  })();

  const userId = await testUserIdPromise;
  const { error } = await admin.rpc("grant_hearts", {
    p_user_id: userId,
    p_amount: 5,
    p_idempotency_key: randomUUID(),
    p_metadata: { source: "playwright_e2e" },
  });
  if (error) throw error;
}

/**
 * Remembers the correct option for each question, keyed by question text.
 * One per test — see answerCurrentQuestion for why this is necessary.
 */
export type AnswerMemory = {
  /** question -> the option text the app revealed as correct */
  answers: Map<string, string>;
  /** question -> how many times it has come up (a re-queue shows as >1) */
  seen: Map<string, number>;
  /** how many times a remembered answer was successfully replayed */
  replayed: number;
};
export const newAnswerMemory = (): AnswerMemory => ({
  answers: new Map(),
  seen: new Map(),
  replayed: 0,
});

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Answer the multiple-choice question on screen, correctly where possible.
 *
 * This exists because of one line in the lesson reducer:
 *
 *   steps: [...prev.steps, requeuedCopy(step)]      (lesson/[courseId]/[lessonId]/page.tsx)
 *
 * A wrong answer appends a re-queued copy of that question to the end of the
 * lesson. The specs used to answer by clicking the first option, which on a
 * four-option question is wrong about three times in four — so the lesson grew
 * faster than the test consumed it and the loop could never terminate. That is
 * not a budget problem and no iteration cap fixes it: stepIndex was observed
 * climbing past 102 inside a single lesson.
 *
 * The strategy: click an option, then read the `.option-button.correct` the app
 * reveals in its feedback, and remember it against the question. Because a
 * missed question is re-queued verbatim, the second encounter is answered
 * correctly. Each question is therefore missed at most once and the lesson
 * converges — without coupling these tests to the shape of src/data.
 *
 * This covers true/false as well as multiple choice: both render their answers
 * as `.option-button`, confirmed from a trace DOM snapshot —
 *
 *   <h2 class="step-title">True or False?</h2>
 *   <div class="step-content"><p>A smartphone can be a need and a want…</p></div>
 *   <button class="option-button …">True</button>
 *   <button class="option-button …">False</button>
 *
 * — which is also why the key below must include `.step-content`. Keying on
 * `.step-title` alone looks right for multiple choice, where the title *is* the
 * question, but every true/false step shares the title "True or False?": that
 * one string appeared 51 times in a single trace. All 51 questions collided on
 * one memory entry, so the answer learned from one was replayed onto the next,
 * which is worse than guessing — it is wrong every time after the first, and
 * each wrong answer re-queues.
 *
 * Returns false if there is no answerable question on screen, so callers can
 * fall through to the other step types.
 */
export async function answerCurrentQuestion(
  page: Page,
  memory: AnswerMemory
): Promise<boolean> {
  const opts = page.locator(".option-button:not([disabled])");
  if ((await opts.count()) === 0) return false;

  const textOf = async (sel: string) =>
    (await page.locator(sel).first().textContent().catch(() => null))?.trim() ?? "";

  // Title alone is not unique; content alone is not always present. Together
  // they identify the question.
  const question = [await textOf(".step-title"), await textOf(".step-content")]
    .filter(Boolean)
    .join(" :: ");

  memory.seen.set(question, (memory.seen.get(question) ?? 0) + 1);

  // Seen this one before (almost always because we got it wrong and it was
  // re-queued) — answer it right this time.
  const known = question ? memory.answers.get(question) : undefined;
  if (known) {
    const exact = opts.filter({ hasText: new RegExp(`^\\s*${escapeRegex(known)}\\s*$`) }).first();
    if ((await exact.count()) > 0) {
      await exact.click();
      memory.replayed++;
      return true;
    }
  }

  await opts.first().click();

  // Learn from the feedback. The app marks the right option regardless of
  // whether we picked it, so this works on both a hit and a miss.
  //
  // 1200ms, not 3000. This fires on every answer, and on the steps where no
  // `.correct` ever appears it waits out the full budget. At ~120 iterations a
  // 3s wait is six minutes of pure waiting — more than the entire test timeout,
  // which is what turned "budget exhausted" into "timed out at exactly 4.0m".
  // Feedback renders in well under a second when it renders at all.
  const correct = page.locator(".option-button.correct").first();
  await correct.waitFor({ state: "visible", timeout: 1_200 }).catch(() => {});
  const correctText = (await correct.textContent().catch(() => null))?.trim();
  if (question && correctText) memory.answers.set(question, correctText);

  return true;
}

/**
 * Why the loop stopped, in a form you can act on.
 *
 * Every failure so far has said "budget exhausted" or "timed out", neither of
 * which distinguishes "the memory is not converging" from "this lesson is
 * genuinely long" from "one step is stuck". These three numbers do:
 *
 *   - distinct questions with answers learned, vs questions seen
 *   - how many times an answer was successfully replayed
 *   - the questions seen most often (a question seen 5+ times is not converging)
 */
export function describeAnswerMemory(memory: AnswerMemory): string {
  const repeats = [...memory.seen.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([q, n]) => `${n}x "${q.slice(0, 60)}…"`);

  return [
    `questions seen: ${memory.seen.size}`,
    `answers learned: ${memory.answers.size}`,
    `answers replayed: ${memory.replayed}`,
    repeats.length ? `most repeated: ${repeats.join(" | ")}` : "no question seen twice",
  ].join(" · ");
}

/**
 * Is the lesson-completion summary currently on screen?
 *
 * This must be checked immediately before any "Continue" click, not just once
 * per loop iteration. LessonSummaryView's only button is labelled "Continue",
 * which is the same label the loops use to advance a step. So a loop that
 * clicks an answer and then a Continue in the same iteration will: answer the
 * final question, watch the app render the summary, and then dismiss it with
 * the very next click — all before the top-of-loop check runs again.
 *
 * The result is a lesson-completion test that never observes a lesson
 * completing. It chains straight into the next lesson and keeps going until the
 * iteration budget runs out, which is how stepIndex reached 102 across roughly
 * 25 consecutive lessons.
 */
export async function atLessonSummary(page: Page): Promise<boolean> {
  return page
    .locator("text=XP Earned")
    .first()
    .isVisible()
    .catch(() => false);
}

/**
 * If the lesson has been replaced by the out-of-hearts gate, ask the trusted
 * server fixture for a ledgered grant and resume.
 *
 * The recovery uses the app's own durable lesson-resume guarantee; no answer,
 * completion or browser balance is forged.
 *
 * Returns true if it recovered, so the caller can spend a loop iteration on it.
 */
export async function recoverIfOutOfHearts(page: Page): Promise<boolean> {
  const gate = page.locator("text=You're out of hearts").first();
  if (!(await gate.isVisible().catch(() => false))) return false;

  await resetServerHearts();
  await page.reload({ waitUntil: "domcontentloaded" });
  // Wait for the lesson to re-render rather than sleeping a fixed amount.
  await page
    .locator(".option-button, button:has-text('Continue')")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});
  return true;
}

/** Where auth.setup.ts caches the signed-in session. Gitignored. */
export const AUTH_STATE_PATH = "e2e/.auth/user.json";

/**
 * Create the shared browser session through Supabase's trusted admin API.
 *
 * The service credential remains in Playwright's Node process. Only the
 * ordinary E2E user's short-lived session is installed in browser storage.
 * This keeps setup independent of password-endpoint rate limits while the
 * desktop auth specs continue to exercise the real sign-in UI.
 */
export async function seedAuthenticatedSession(page: Page): Promise<void> {
  const url = process.env.TEST_SUPABASE_URL;
  const serviceKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Trusted E2E session setup requires TEST_SUPABASE_URL and " +
        "TEST_SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: TEST_EMAIL,
  });
  if (linkError) throw linkError;

  const { data: verification, error: verificationError } = await admin.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "magiclink",
  });
  if (verificationError) throw verificationError;
  if (!verification.session) throw new Error("Supabase did not return an E2E session");

  const projectRef = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  await page.addInitScript(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key: storageKey, session: verification.session }
  );

  await resetServerHearts();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page.locator(".app-container").first()).toBeVisible({ timeout: 30_000 });
}

/**
 * Sign in with email/password, wait for the app shell to appear.
 *
 * Now session-aware. With storageState restored by the setup project the app is
 * already signed in on first paint, so this returns immediately instead of
 * driving the login form again. That keeps every existing `await signIn(page)`
 * call working untouched across all seven spec files while collapsing ~123
 * sign-ins per run down to one.
 */
export async function signIn(page: Page) {
  await resetServerHearts();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Already authenticated via cached storageState? Nothing to do.
  const shell = page.locator(".app-container").first();
  if (await shell.isVisible({ timeout: 8_000 }).catch(() => false)) return;
  // Splash animation can take 20-25s on slow CI runners — wait for the landing page or form directly.
  const signInButton = page.locator('button', { hasText: /I Already Have an Account/i }).first();
  // Try to wait for the landing screen button; if visible, click it.
  try {
    await signInButton.waitFor({ state: "visible", timeout: 15_000 });
    await signInButton.click();
  } catch {
    // The authenticated shell may have finished loading while we waited for a
    // landing-page control that never appears for signed-in users.
    if (await shell.isVisible().catch(() => false)) return;
  }

  const emailInput = page.locator('input[type="email"]').first();
  try {
    await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  } catch (error) {
    // Re-check the authenticated state before treating a missing form as a
    // failure. Mobile WebKit can finish hydration after the first shell wait.
    if (await shell.isVisible().catch(() => false)) return;
    throw error;
  }
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
