"use client";

import { useEffect } from "react";

/**
 * Catch the errors nothing else catches.
 *
 * `reportClientError` was already wired into ErrorBoundary, BudgetPlanner,
 * BudgetImportPanel, useProfileHandlers and the service worker — five places.
 * Everything else was invisible: a rejected Supabase promise, a throw inside an
 * event handler, an error in a hook that unmounts before the boundary sees it.
 * React error boundaries only catch errors thrown during render, so the entire
 * async surface of the app reported nothing at all.
 *
 * These two listeners are the backstop. `error` fires for uncaught synchronous
 * throws anywhere on the page; `unhandledrejection` fires for any promise that
 * rejects with no catch — which in this app means most Supabase failures.
 *
 * Why this matters more than more tests: a synthetic suite only finds bugs
 * someone thought to script. This finds the ones real users hit, on real
 * devices and real networks, including the ones nobody would have imagined.
 *
 * Bot filtering, rate limiting and truncation already live in
 * reportClientError, so nothing extra is needed here.
 */
export function GlobalErrorListeners() {
  useEffect(() => {
    // Imported lazily so the reporting module (and its deps) stay out of the
    // initial bundle — this component mounts on every page.
    const report = (area: string, error: unknown, extra?: Record<string, unknown>) => {
      import("@/lib/errorReporting")
        .then((m) => m.reportClientError(area, error, extra))
        .catch(() => {
          /* reporting must never itself throw */
        });
    };

    const onError = (event: ErrorEvent) => {
      report("window-error", event.error ?? new Error(event.message), {
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        href: window.location.href,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      // A rejection reason is often not an Error — it can be a string, a
      // Response, or a Supabase error object. Normalise so the report always
      // has a message worth reading.
      const reason = event.reason;
      const error =
        reason instanceof Error
          ? reason
          : new Error(
              typeof reason === "string" ? reason : safeStringify(reason)
            );
      report("unhandled-rejection", error, { href: window.location.href });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)?.slice(0, 500) ?? "Unknown rejection";
  } catch {
    return "Unserialisable rejection";
  }
}
