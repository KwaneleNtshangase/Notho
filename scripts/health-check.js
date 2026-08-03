/**
 * Notho — Lightweight Health Check
 * =========================================
 * Runs without user credentials. Checks:
 *  1. The site loads (HTTP 200, no crash overlay)
 *  2. No console errors at load time
 *  3. Key UI elements are visible (tabs, logo, sign-in form)
 *  4. Response time is reported, and warned on — see SLOW_MS below
 *
 * Usage: node scripts/health-check.js
 * Env:   BASE_URL   (default: https://www.notho.co.za)
 *        SLOW_MS    (default: 8000 — warn threshold, does not fail the run)
 */

const { chromium } = require("@playwright/test");

// Canonical host, with www. Point this at the apex or at fundiapp.co.za and
// every run pays one or two 301s before the app starts loading — which used to
// blow the load-time budget below and fail the check for no real reason.
const BASE_URL = process.env.BASE_URL ?? "https://www.notho.co.za";
const TIMEOUT = 30_000;
const SLOW_MS = Number(process.env.SLOW_MS ?? 8000);

const checks = [];
let browser, page;

function pass(name) {
  checks.push({ name, status: "✅ PASS" });
  console.log(`  ✅  ${name}`);
}
function fail(name, detail = "") {
  checks.push({ name, status: "❌ FAIL", detail });
  console.error(`  ❌  ${name}${detail ? `: ${detail}` : ""}`);
}
/**
 * A signal worth seeing that must not page anyone at 03:00.
 * Counted and printed, but never affects the exit code.
 */
function warn(name, detail = "") {
  checks.push({ name, status: "⚠️  WARN", detail });
  console.warn(`  ⚠️   ${name}${detail ? `: ${detail}` : ""}`);
}

async function run() {
  console.log(`\n🔍  Notho Health Check`);
  console.log(`    Target: ${BASE_URL}`);
  console.log(`    ${new Date().toISOString()}\n`);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "HealthCheckBot/1.0 (+NothoFinance)",
  });
  page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // ── 1. Page loads within time limit ────────────────────────────────────────
  const t0 = Date.now();
  try {
    const response = await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });
    const elapsed = Date.now() - t0;
    if (!response || response.status() >= 400) {
      fail("HTTP response OK", `Got status ${response?.status()}`);
    } else {
      pass(`HTTP ${response.status()} in ${elapsed}ms`);
    }

    // Report the redirect chain. If this is ever non-empty the target is not
    // canonical, and the extra hops are being charged to the timing below.
    const hops = [];
    for (let r = response?.request()?.redirectedFrom(); r; r = r.redirectedFrom()) {
      hops.unshift(r.url());
    }
    if (hops.length > 0) {
      warn(
        `Redirected ${hops.length}x before landing`,
        `${hops.join(" → ")} → ${page.url()}. Point BASE_URL at the final URL.`
      );
    } else {
      pass(`No redirects (landed directly on ${page.url()})`);
    }

    // Load time is a warning, not a failure. This check exists to tell you the
    // site is UP; a cold Vercel lambda on a shared CI runner is slow without
    // being broken, and failing on it means the alert that fires at 03:00 is
    // usually noise. Genuine unreachability is caught by the catch below and by
    // the status assertion above, both of which do fail.
    if (elapsed > SLOW_MS) {
      warn(`Page load slower than ${SLOW_MS}ms`, `Took ${elapsed}ms`);
    } else {
      pass(`Page load time acceptable (${elapsed}ms)`);
    }
  } catch (e) {
    fail("Page loads at all", e.message);
    return summarize();
  }

  // Wait for splash screen to finish and React to fully render (up to 10s)
  try {
    await page.waitForFunction(
      () => document.body?.innerText?.length > 50,
      { timeout: 10_000 }
    );
  } catch (_) {
    // continue even if timeout — subsequent checks will catch blank screen
  }

  // ── 2. No crash overlay / blank screen ────────────────────────────────────
  // The 20-char threshold this used to apply was below the length of the splash
  // screen's own copy ("Your financial journey starts here" is 34), so a stuck
  // splash counted as a rendered page. Kept only as a crude "not literally
  // blank" signal now — check 3 is what actually decides whether the app works.
  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  if (bodyText.trim().length < 20) {
    fail("Page renders content (not blank)", `Body text: "${bodyText.slice(0, 60)}"`);
  } else {
    pass("Page renders content");
  }

  const errorOverlay = await page.locator("text=Application error").count();
  if (errorOverlay > 0) {
    fail("No Next.js error overlay");
  } else {
    pass("No Next.js crash overlay");
  }

  // ── 3. The app actually booted ────────────────────────────────────────────
  //
  // This is the check the whole script exists for, so it is worth being blunt
  // about what it used to do. It polled for the sign-in form, and if that never
  // appeared it fell through to a "branding" test that passed whenever
  // document.title contained "notho". That title is server-rendered. It is
  // present on a completely dead app — Supabase down, bundle failing to boot,
  // React never mounting — so the check could not fail for the one condition it
  // was meant to detect. Every green run since was evidence of nothing.
  //
  // What follows requires proof that React mounted and rendered interactive
  // controls. Nothing here is satisfied by static HTML.
  const BOOT_DEADLINE_MS = 40_000; // generous: cold lambda + splash + hydration
  let bootedAs = null;
  const bootDeadline = Date.now() + BOOT_DEADLINE_MS;

  while (Date.now() < bootDeadline && !bootedAs) {
    // (a) Landing screen — the real entry point for a signed-out visitor.
    //     Matches the button e2e/01-auth.spec.ts drives.
    const landingBtn = page
      .locator("button", { hasText: /I Already Have an Account|Get Started/i })
      .first();
    if (await landingBtn.isVisible().catch(() => false)) {
      bootedAs = "landing screen (sign-in / get-started controls interactive)";
      break;
    }

    // (b) Auth form — if a previous step already opened it.
    if (
      (await page.locator('input[type="email"]').count()) > 0 &&
      (await page.locator('input[type="password"]').count()) > 0 &&
      (await page.locator('[data-testid="auth-submit"]').count()) > 0
    ) {
      bootedAs = "auth form (email + password + submit present)";
      break;
    }

    // (c) App shell — a live session. .app-container is rendered by
    //     src/app/(app)/layout.tsx, i.e. only once the client tree mounts.
    if (
      await page.locator(".app-container").first().isVisible().catch(() => false)
    ) {
      bootedAs = "app shell (authenticated session)";
      break;
    }

    await page.waitForTimeout(500);
  }

  const authOrShellFound = Boolean(bootedAs);

  if (authOrShellFound) {
    pass(`App booted — ${bootedAs}`);
  } else {
    // No soft pass. If React never rendered an interactive control within 40s,
    // a real user is staring at a splash screen that never resolves, and this
    // check must go red so the alert fires.
    const diagnostic = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      bodyChars: document.body?.innerText?.length ?? 0,
      buttons: document.querySelectorAll("button").length,
      inputs: document.querySelectorAll("input").length,
      // A Next.js app that hydrated always has this. Absent means the client
      // bundle never ran, which points at a chunk 404 or a boot-time throw.
      nextData: Boolean(document.querySelector("#__next, [data-nextjs-router]")),
      firstText: (document.body?.innerText ?? "").trim().slice(0, 120),
    }));
    fail(
      "App booted",
      `No interactive control after ${BOOT_DEADLINE_MS / 1000}s. ` +
        `url=${diagnostic.url} buttons=${diagnostic.buttons} inputs=${diagnostic.inputs} ` +
        `hydrated=${diagnostic.nextData} bodyChars=${diagnostic.bodyChars} ` +
        `text="${diagnostic.firstText}"`
    );
  }

  // ── 4. Branding present ────────────────────────────────────────────────────
  // Check several independent signals. The wordmark is rendered as an image in
  // the authenticated shell, so a visible-text-only assertion produces false
  // failures. Any one of these confirms we are looking at the Notho app.
  const branding = await page.evaluate(() => {
    const hit = (v) => typeof v === "string" && v.toLowerCase().includes("notho");
    const attr = (sel, name) =>
      Array.from(document.querySelectorAll(sel)).some((el) => hit(el.getAttribute(name)));
    return {
      title: hit(document.title),
      ogTitle: attr('meta[property="og:title"]', "content"),
      appName: attr('meta[name="application-name"]', "content"),
      imgAlt: attr("img", "alt"),
      ariaLabel: attr("[aria-label]", "aria-label"),
      visibleText: hit(document.body?.innerText ?? ""),
    };
  });

  const brandSignals = Object.entries(branding)
    .filter(([, ok]) => ok)
    .map(([k]) => k);

  if (brandSignals.length > 0) {
    pass(`'Notho' branding present (via ${brandSignals.join(", ")})`);
  } else {
    fail(
      "Branding check",
      "No 'Notho' reference in title, og:title, application-name, img alt, aria-label, or visible text"
    );
  }

  // ── 5. JS console errors ───────────────────────────────────────────────────
  //
  // The old filter list was wide enough to swallow the failures that matter.
  // "Failed to load resource" and "404" are exactly what a missing JS chunk
  // looks like; "Content Security Policy" is what a broken CSP looks like, and
  // that one takes the whole app down. Suppressing them meant this check could
  // only ever catch errors nobody cared about.
  //
  // Now: only genuinely optional, non-blocking subsystems are ignored, and each
  // entry says why. Anything not on this list fails the run.
  const IGNORED = [
    // Analytics. Blocked by ad blockers and privacy DNS constantly; the app is
    // fully functional without it.
    { match: /posthog/i, why: "analytics, non-blocking" },
    // Cosmetic.
    { match: /favicon/i, why: "icon only" },
    // Realtime is used for live leaderboard updates and reconnects on its own.
    // A dropped socket is not an outage.
    { match: /supabase\.co\/realtime|WebSocket/i, why: "realtime reconnects itself" },
    // Push requires an OS-level permission that headless CI never grants.
    { match: /Notification|PushManager|permission denied/i, why: "no push in headless CI" },
  ];

  const classified = consoleErrors.map((text) => ({
    text,
    ignored: IGNORED.find((r) => r.match.test(text)),
  }));
  const realErrors = classified.filter((c) => !c.ignored).map((c) => c.text);
  const suppressed = classified.filter((c) => c.ignored);

  if (suppressed.length > 0) {
    console.log(`      (${suppressed.length} known-benign console message(s) ignored)`);
  }

  if (realErrors.length === 0) {
    pass("No JavaScript console errors");
  } else {
    // Deduplicate: one broken chunk can log the same line dozens of times, and
    // a failure message that is 40 copies of one error is hard to read.
    const unique = [...new Set(realErrors)];
    fail(
      `No JS console errors (${realErrors.length} total, ${unique.length} unique)`,
      unique.slice(0, 5).join(" | ")
    );
  }

  // ── 6. Backend dependencies via /api/health ───────────────────────────────
  // Everything above tests the browser's view. This tests the server's, and
  // catches the case where the page renders perfectly but Supabase is
  // unreachable — the app looks fine and no user can sign in.
  try {
    const apiRes = await page.request.get(`${BASE_URL.replace(/\/$/, "")}/api/health`, {
      timeout: 15_000,
      failOnStatusCode: false,
    });
    const body = await apiRes.json().catch(() => null);

    if (apiRes.status() === 200 && body?.status === "ok") {
      const slow = Object.entries(body.checks ?? {})
        .filter(([, c]) => c?.ms > 2000)
        .map(([k, c]) => `${k} ${c.ms}ms`);
      pass(`Backend dependencies OK (${body.totalMs}ms)`);
      if (slow.length) warn("Backend dependency slow", slow.join(", "));
    } else if (apiRes.status() === 404) {
      // Deployed build predates the endpoint. Not a fault in the running app.
      warn("/api/health not deployed yet", "Endpoint returns 404 — deploy to enable this check");
    } else {
      const broken = Object.entries(body?.checks ?? {})
        .filter(([, c]) => !c?.ok)
        .map(([k, c]) => `${k}${c?.detail ? ` (${c.detail})` : ""}`);
      fail(
        "Backend dependencies OK",
        `HTTP ${apiRes.status()}${broken.length ? ` — failing: ${broken.join(", ")}` : ""}`
      );
    }
  } catch (e) {
    fail("Backend dependencies OK", `/api/health unreachable: ${e.message}`);
  }

  // ── 7. Screenshot ─────────────────────────────────────────────────────────
  await page.screenshot({ path: "health-check-screenshot.png", fullPage: false });
  pass("Screenshot captured (health-check-screenshot.png)");

  return summarize();
}

function summarize() {
  const failed = checks.filter((c) => c.status.startsWith("❌"));
  const warned = checks.filter((c) => c.status.startsWith("⚠️"));
  const passed = checks.length - failed.length - warned.length;

  console.log(`\n── Summary ─────────────────────────────────────────`);
  console.log(`   Total checks : ${checks.length}`);
  console.log(`   Passed       : ${passed}`);
  console.log(`   Warnings     : ${warned.length}`);
  console.log(`   Failed       : ${failed.length}`);

  if (warned.length > 0) {
    console.log(`\n   Warnings (do not fail the run):`);
    warned.forEach((c) => console.log(`     • ${c.name}: ${c.detail ?? ""}`));
  }
  if (failed.length > 0) {
    console.log(`\n   Failed checks:`);
    failed.forEach((c) => console.log(`     • ${c.name}: ${c.detail ?? ""}`));
    console.log("");
    return false;
  }
  console.log(
    warned.length > 0
      ? `\n   ✅ Site is healthy (${warned.length} warning${warned.length === 1 ? "" : "s"}).\n`
      : `\n   🎉 All checks passed!\n`
  );
  return true;
}

run()
  .catch((e) => {
    console.error("Unexpected error:", e);
    // Close the browser here too. Without this an unexpected throw leaves a
    // chromium process holding the runner open until the job timeout.
    browser?.close();
    process.exit(1);
  })
  .then((ok) => {
    browser?.close();
    process.exit(ok ? 0 : 1);
  });
