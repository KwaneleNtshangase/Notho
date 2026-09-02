/**
 * Notho — Lightweight Health Check
 * =========================================
 * Runs without user credentials. Checks:
 *  1. The site loads (HTTP 200, no crash overlay)
 *  2. No console errors at load time
 *  3. Key UI elements are visible (landing controls or app shell)
 *  4. Response time is reported, and warned on — see SLOW_MS below
 *  5. /api/health says config + Supabase are reachable
 *
 * Usage: node scripts/health-check.js
 * Env:   BASE_URL   (default: https://www.notho.co.za/learn)
 *        SLOW_MS    (default: 8000 — warn threshold, does not fail the run)
 */

const { chromium } = require("@playwright/test");

// Signed-out visitors are redirected / → /learn. Hitting the apex used to
// destroy the Playwright execution context mid-evaluate and fail a live site.
const BASE_URL = process.env.BASE_URL ?? "https://www.notho.co.za/learn";
const ORIGIN = (() => {
  try {
    return new URL(BASE_URL).origin;
  } catch {
    return "https://www.notho.co.za";
  }
})();
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
function warn(name, detail = "") {
  checks.push({ name, status: "⚠️  WARN", detail });
  console.warn(`  ⚠️   ${name}${detail ? `: ${detail}` : ""}`);
}

function isExpectedHomeToLearn(fromUrl, toUrl) {
  try {
    const from = new URL(fromUrl);
    const to = new URL(toUrl);
    return (
      from.origin === to.origin &&
      (from.pathname === "/" || from.pathname === "") &&
      to.pathname.replace(/\/$/, "") === "/learn"
    );
  } catch {
    return false;
  }
}

async function safeEvaluate(page, fn) {
  for (let i = 0; i < 4; i++) {
    try {
      return await page.evaluate(fn);
    } catch (e) {
      const msg = String(e?.message ?? e);
      if (!/Execution context was destroyed|navigation/i.test(msg) || i === 3) {
        throw e;
      }
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForTimeout(250);
    }
  }
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

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const t0 = Date.now();
  try {
    const response = await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    const elapsed = Date.now() - t0;
    if (!response || response.status() >= 400) {
      fail("HTTP response OK", `Got status ${response?.status()}`);
    } else {
      pass(`HTTP ${response.status()} in ${elapsed}ms`);
    }

    const hops = [];
    for (let r = response?.request()?.redirectedFrom(); r; r = r.redirectedFrom()) {
      hops.unshift(r.url());
    }
    const landed = page.url();
    if (hops.length === 0) {
      pass(`No extra hops (landed on ${landed})`);
    } else if (hops.length === 1 && isExpectedHomeToLearn(hops[0], landed)) {
      pass(`Expected / → /learn redirect (${hops[0]} → ${landed})`);
    } else {
      warn(
        `Redirected ${hops.length}x before landing`,
        `${hops.join(" → ")} → ${landed}. Point BASE_URL at the final URL.`
      );
    }

    if (elapsed > SLOW_MS) {
      warn(`Page load slower than ${SLOW_MS}ms`, `Took ${elapsed}ms`);
    } else {
      pass(`Page load time acceptable (${elapsed}ms)`);
    }
  } catch (e) {
    fail("Page loads at all", e.message);
    return summarize();
  }

  try {
    await page.waitForFunction(
      () => document.body?.innerText?.length > 50,
      { timeout: 10_000 }
    );
  } catch (_) {
    // subsequent checks will catch a blank screen
  }

  let bodyText = "";
  try {
    bodyText = await page.locator("body").innerText({ timeout: 10_000 });
  } catch (e) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    bodyText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
    if (!bodyText) {
      fail("Page renders content (not blank)", String(e.message ?? e));
    }
  }
  if (bodyText && bodyText.trim().length < 20) {
    fail("Page renders content (not blank)", `Body text: "${bodyText.slice(0, 60)}"`);
  } else if (bodyText) {
    pass("Page renders content");
  }

  const errorOverlay = await page.locator("text=Application error").count();
  if (errorOverlay > 0) {
    fail("No Next.js error overlay");
  } else {
    pass("No Next.js crash overlay");
  }

  const BOOT_DEADLINE_MS = 40_000;
  let bootedAs = null;
  const bootDeadline = Date.now() + BOOT_DEADLINE_MS;

  while (Date.now() < bootDeadline && !bootedAs) {
    const landingBtn = page
      .locator("button", { hasText: /I Already Have an Account|Get Started/i })
      .first();
    if (await landingBtn.isVisible().catch(() => false)) {
      bootedAs = "landing screen (sign-in / get-started controls interactive)";
      break;
    }

    if (
      (await page.locator('input[type="email"]').count()) > 0 &&
      (await page.locator('input[type="password"]').count()) > 0 &&
      (await page.locator('[data-testid="auth-submit"]').count()) > 0
    ) {
      bootedAs = "auth form (email + password + submit present)";
      break;
    }

    if (
      await page.locator(".app-container").first().isVisible().catch(() => false)
    ) {
      bootedAs = "app shell (authenticated session)";
      break;
    }

    await page.waitForTimeout(500);
  }

  if (bootedAs) {
    pass(`App booted — ${bootedAs}`);
  } else {
    let diagnostic = {
      url: page.url(),
      title: "",
      bodyChars: 0,
      buttons: 0,
      inputs: 0,
      nextData: false,
      firstText: "",
    };
    try {
      diagnostic = await safeEvaluate(page, () => ({
        url: window.location.href,
        title: document.title,
        bodyChars: document.body?.innerText?.length ?? 0,
        buttons: document.querySelectorAll("button").length,
        inputs: document.querySelectorAll("input").length,
        nextData: Boolean(document.querySelector("#__next, [data-nextjs-router]")),
        firstText: (document.body?.innerText ?? "").trim().slice(0, 120),
      }));
    } catch (e) {
      diagnostic.firstText = String(e.message ?? e);
    }
    fail(
      "App booted",
      `No interactive control after ${BOOT_DEADLINE_MS / 1000}s. ` +
        `url=${diagnostic.url} buttons=${diagnostic.buttons} inputs=${diagnostic.inputs} ` +
        `hydrated=${diagnostic.nextData} bodyChars=${diagnostic.bodyChars} ` +
        `text="${diagnostic.firstText}"`
    );
  }

  const branding = await safeEvaluate(page, () => {
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
  }).catch(() => null);

  if (!branding) {
    fail("Branding check", "Could not read page after navigation settled");
  } else {
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
  }

  const IGNORED = [
    { match: /posthog/i, why: "analytics, non-blocking" },
    { match: /favicon/i, why: "icon only" },
    { match: /supabase\.co\/realtime|WebSocket/i, why: "realtime reconnects itself" },
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
    const unique = [...new Set(realErrors)];
    fail(
      `No JS console errors (${realErrors.length} total, ${unique.length} unique)`,
      unique.slice(0, 5).join(" | ")
    );
  }

  try {
    const apiRes = await page.request.get(`${ORIGIN}/api/health`, {
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

  await page.screenshot({ path: "health-check-screenshot.png", fullPage: false });
  pass("Screenshot captured (health-check-screenshot.png)");

  return summarize();
}

function summarize() {
  const failed = checks.filter((c) => c.status.startsWith("❌"));
  const warned = checks.filter((c) => c.status.startsWith("⚠"));
  const passed = checks.length - failed.length - warned.length;

  console.log(`\n── Summary ─────────────────────────────────────────────────`);
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
    browser?.close();
    process.exit(1);
  })
  .then((ok) => {
    browser?.close();
    process.exit(ok ? 0 : 1);
  });
