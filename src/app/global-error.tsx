"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { loadCatalog } from "@/i18n/catalog";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, localeTag, parseLocale, type Locale } from "@/i18n/locales";
import { localizeString } from "@/i18n/stringZu";

/**
 * Replaces the root layout when the App Router itself throws.
 * The in-tree ErrorBoundary cannot see this layer, so Sentry must.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // The root layout and its locale provider may both be unavailable here.
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    let active = true;
    try {
      const saved = parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
      void loadCatalog(saved).then(() => {
        if (active) setLocale(saved);
      }).catch(() => {});
    } catch { /* Restricted storage still allows recovery in English. */ }
    return () => { active = false; };
  }, []);

  return (
    <html lang={localeTag(locale)}>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#000000",
          color: "#f4f4f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main
          role="alert"
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            padding: "32px 24px",
            borderRadius: 20,
            background: "#111111",
            border: "1px solid #27272a",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
            {localizeString(locale, "Something went wrong")}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#a1a1aa",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            {localizeString(locale, "Your progress is safe. We have the error and will fix it. Reloading usually gets you back.")}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: "none",
              background: "#007A85",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {localizeString(locale, "Reload Notho")}
          </button>
        </main>
      </body>
    </html>
  );
}
