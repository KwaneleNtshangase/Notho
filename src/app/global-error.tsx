"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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

  return (
    <html lang="en">
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
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#a1a1aa",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Your progress is safe. We have the error and will fix it. Reloading
            usually gets you back.
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
            Reload Notho
          </button>
        </main>
      </body>
    </html>
  );
}
