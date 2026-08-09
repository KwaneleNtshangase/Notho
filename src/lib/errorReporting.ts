/**
 * Lightweight client-side error reporting. Sends uncaught errors (and any we
 * explicitly catch) to /api/errors/report, which records them so the team can
 * triage and, once fixed, notify the affected user.
 *
 * Best-effort and silent: reporting must never throw or disrupt the user.
 */

const seen = new Set<string>();
let installed = false;

import { isAutomatedUserAgent } from "./errorReportGuards";

/**
 * True when this looks like automation rather than a person.
 *
 * The user-agent patterns live in ./errorReportGuards so the client and the
 * /api/errors/report route share one definition with one test. They used to be
 * duplicated, and the copies were both wrong in the same way: vendor names were
 * matched as whole words, so `AhrefsBot` and `SemrushBot` slipped through —
 * in "AhrefsBot" the `s` is followed by `B`, so `\bahrefs\b` never matched and
 * neither did `\bbot\b`.
 *
 * The webdriver check stays here because it reads a browser API the server
 * cannot see.
 */
function looksAutomated(): boolean {
  if (typeof navigator === "undefined") return false;
  // Set by Puppeteer, Playwright, Selenium and friends.
  if ((navigator as { webdriver?: boolean }).webdriver === true) return true;
  return isAutomatedUserAgent(navigator.userAgent);
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
