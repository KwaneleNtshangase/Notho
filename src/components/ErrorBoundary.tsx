"use client";

import React from "react";
import { AlertCircle } from "@/components/icons/NothoIcons";
import {
  isChunkLoadError,
  safeSessionStorage,
  shouldAutoReload,
} from "@/lib/chunkErrors";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null; recovering: boolean };

/** Longest we hold the reload back so the error report can leave the device. */
const REPORT_GRACE_MS = 1200;

/**
 * Catches any unhandled rendering error in the React tree and shows a
 * friendly fallback instead of Next.js's default crash screen. Users can
 * retry without losing their session or local progress.
 *
 * Chunk-load failures are handled separately - see `handleChunkLoadError`.
 *
 * This is intentionally a class component - React's error boundary API
 * still only works with componentDidCatch / getDerivedStateFromError.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  private reloadTimer: number | null = null;
  private reloading = false;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, recovering: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Kept pure: whether we can auto-recover depends on sessionStorage, and
    // React may call this more than once per error.
    return { hasError: true, error, recovering: false };
  }

  componentWillUnmount(): void {
    if (this.reloadTimer !== null) window.clearTimeout(this.reloadTimer);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (isChunkLoadError(error)) {
      this.handleChunkLoadError(error);
      return;
    }
    this.reportCrash(error, info);
  }

  /**
   * A chunk fetch failed, so the code for this screen never arrived. Nothing in
   * the tree is broken and retrying the render cannot help: it re-requests the
   * same missing chunk. Only a reload can fix it, so do that rather than
   * showing a crash screen and hoping the user picks the one button that works.
   *
   * Reported under its own area so these stay out of the crash inbox while
   * still being countable - a run of them means a deploy caught open tabs.
   */
  private handleChunkLoadError(error: Error): void {
    const report = this.report("chunk-load", error, {
      href: typeof window !== "undefined" ? window.location.href : undefined,
    });

    if (!shouldAutoReload(safeSessionStorage())) {
      // Already reloaded once for this and it came back, or we have no way to
      // guard against a loop. Fall through to the UI, which offers a reload.
      return;
    }

    this.setState({ recovering: true });

    // The report uses keepalive so it can outlive the page, but the auth-token
    // lookup in front of it is async. Reload as soon as the report settles, or
    // when the grace period runs out — whichever comes first, once only.
    const go = () => {
      if (this.reloading) return;
      this.reloading = true;
      if (this.reloadTimer !== null) {
        window.clearTimeout(this.reloadTimer);
        this.reloadTimer = null;
      }
      window.location.reload();
    };
    this.reloadTimer = window.setTimeout(go, REPORT_GRACE_MS);
    void report.then(go, go);
  }

  private report(
    area: string,
    error: Error,
    extra?: Record<string, unknown>
  ): Promise<void> {
    try {
      return import("@/lib/errorReporting")
        .then((m) => m.reportClientError(area, error, extra))
        .catch(() => {});
    } catch {
      return Promise.resolve();
    }
  }

  private reportCrash(error: Error, info: React.ErrorInfo): void {
    // Fire-and-forget - analytics is optional and must never throw.
    try {
      if (typeof window !== "undefined") {
        const w = window as unknown as {
          posthog?: { capture: (e: string, p: unknown) => void };
        };
        w.posthog?.capture?.("react_error_boundary", {
          message: error.message,
          stack: error.stack?.slice(0, 1500),
          componentStack: info.componentStack?.slice(0, 1500),
        });
      }
    } catch {
      /* ignore */
    }
    // Report to our own pipeline so the team is alerted and can notify the user.
    void this.report("app-crash", error, {
      componentStack: info.componentStack?.slice(0, 1000),
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, recovering: false });
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    // Reloading ourselves — a crash screen that vanishes on its own reads as a
    // second fault. Say what is happening and keep it quiet.
    if (this.state.recovering) {
      return (
        <main
          role="status"
          aria-live="polite"
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "var(--color-bg, #ffffff)",
            color: "var(--color-text-secondary, #6b7280)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 15,
            textAlign: "center",
          }}
        >
          Updating to the latest version&hellip;
        </main>
      );
    }

    const isChunk = isChunkLoadError(this.state.error);

    return (
      <main
        role="alert"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "var(--color-bg, #ffffff)",
          color: "var(--color-text-primary, #111827)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            padding: "32px 24px",
            borderRadius: 20,
            background: "var(--color-surface, #ffffff)",
            border: "1px solid var(--color-border, #e5e7eb)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          <AlertCircle
            size={48}
            aria-hidden
            style={{ color: "#6B7280", marginBottom: 12, display: "block", margin: "0 auto 12px" }}
          />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: "0 0 8px",
            }}
          >
            {isChunk ? "Notho needs a reload" : "Something went wrong"}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary, #6b7280)",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            {isChunk ? (
              <>
                Your progress is safe. Part of the app didn&apos;t finish
                downloading - usually a brief network drop, or a new version
                going live while you had Notho open. Reloading fixes it.
              </>
            ) : (
              <>
                Your progress is safe. We hit an unexpected hiccup on this screen
                - our team has been notified automatically and we&apos;re on it.
                Try again, and if it keeps happening you can also let us know via
                Send Feedback in your Profile.
              </>
            )}
          </p>
          {/*
            Order matters. "Try again" only re-renders the tree, which is a real
            fix for a transient render fault and no fix at all for a missing
            chunk - the same fetch just fails again. So on a chunk error, Reload
            is the primary action and Try again is not offered.
          */}
          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <button
              type="button"
              onClick={isChunk ? this.handleReload : this.handleRetry}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: "var(--color-primary, #007A85)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {isChunk ? "Reload Notho" : "Try again"}
            </button>
            {!isChunk && (
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--color-border, #e5e7eb)",
                  background: "transparent",
                  color: "var(--color-text-primary, #111827)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Reload the app
              </button>
            )}
          </div>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <pre
              style={{
                marginTop: 20,
                padding: 12,
                borderRadius: 8,
                background: "rgba(0,0,0,0.05)",
                color: "#ef4444",
                fontSize: 11,
                textAlign: "left",
                overflow: "auto",
                maxHeight: 160,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      </main>
    );
  }
}
