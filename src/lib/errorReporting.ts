/**
 * Lightweight client-side error reporting. Sends uncaught errors (and any we
 * explicitly catch) to /api/errors/report, which records them so the team can
 * triage and, once fixed, notify the affected user.
 *
 * Best-effort and silent: reporting must never throw or disrupt the user.
 */

const seen = new Set<string>();
let installed = false;

/**
 * Declared crawlers and headless automation.
 *
 * Bots are not users, and reporting their errors is worse than useless: it
 * fills the inbox with failures nobody experienced, which is how real reports
 * get missed. Googlebot alone hit /learn and failed service-worker
 * registration three times in one morning.
 */
const BOT_UA =
  /\b(bot|crawler|spider|crawling|slurp|googlebot|bingbot|yandex|baidu|duckduckbot|facebookexternalhit|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petalbot|headless|phantomjs|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptimerobot|curl|wget|python-requests|axios|node-fetch)\b/i;

/**
 * A Chrome build number of exactly N.0.0.0.
 *
 * Real Chrome ships a specific build, like 109.0.5414.87. A user agent whose
 * version collapses to zeros is a simplified or spoofed string, which is what
 * scraping stacks and automation frameworks send by default. Not conclusive on
 * its own, but combined with "never signed in" it is reliable enough, and the
 * cost of being wrong is one missed report from an anonymous visitor.
 */
const SPOOFED_CHROME = /Chrome\/\d+\.0\.0\.0\b/;

/** True when this looks like automation rather than a person. */
function looksAutomated(): boolean {
  if (typeof navigator === "undefined") return false;
  // Set by Puppeteer, Playwright, Selenium and friends.
  if ((navigator as { webdriver?: boolean }).webdriver === true) return true;
  const ua = navigator.userAgent || "";
  if (BOT_UA.test(ua)) return true;
  if (SPOOFED_CHROME.test(ua)) return true;
  return false;
}

export async function reportClientError(
  area: string,
  error: unknown,
  extra?: Record<string, unknown>
): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    // Drop bot traffic before it reaches the inbox. Every occurrence now sends
    // an email, so a crawler looping over the site would bury the real reports
    // among failures no human ever saw.
    if (looksAutomated()) return;
    const err = error as { message?: string; stack?: string } | undefined;
    const message = (err?.message ?? String(error) ?? "Unknown error").slice(0, 500);
    if (!message || message === "null" || message === "undefined") return;

    // De-duplicate within a session so a repeating error doesn't spam.
    const sig = `${area}:${message}`;
    if (seen.has(sig)) return;
    seen.add(sig);

    let token: string | undefined;
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      /* not signed in / supabase unavailable - still report anonymously */
    }

    await fetch("/api/errors/report", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        area,
        message,
        stack: (err?.stack ?? "").slice(0, 2500),
        url: window.location.href,
        userAgent: navigator.userAgent,
        extra: extra ?? null,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never throw from the reporter */
  }
}

/** Install global handlers once (uncaught errors + unhandled promise rejections). */
export function installGlobalErrorReporting(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e: ErrorEvent) => {
    // Ignore benign ResizeObserver noise and cross-origin script errors.
    if (e.message && /ResizeObserver loop|Script error\.?$/.test(e.message)) return;
    void reportClientError("window.error", e.error ?? new Error(e.message), {
      filename: e.filename,
      line: e.lineno,
    });
  });

  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    const r = e.reason;
    void reportClientError("unhandledrejection", r instanceof Error ? r : new Error(String(r)));
  });
}
