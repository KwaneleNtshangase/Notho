/**
 * PostHog helpers that stay importable from tests and from the browser.
 *
 * The SDK itself is only initialised in PostHogProvider. Everything here is
 * about *how* we talk to it: first-party proxy path, which screens count as a
 * pageview, and which person properties are allowed under POPIA.
 *
 * Email, name, phone, statement text and rand amounts never belong here.
 */

import type posthog from "posthog-js";

/** Same-origin ingest path. Deliberately not /analytics or /posthog. */
export const POSTHOG_PROXY_PATH = "/nk-in";

export const POSTHOG_UI_HOST = "https://us.posthog.com";
export const POSTHOG_INGEST_HOST = "https://us.i.posthog.com";
export const POSTHOG_ASSETS_HOST = "https://us-assets.i.posthog.com";

export function posthogKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  return key ? key : undefined;
}

/**
 * Browser traffic goes through the Next rewrite so ad blockers and the
 * Capacitor WebView hit notho.co.za instead of posthog.com. Server-side
 * capture (if we add it later) talks to the ingest host directly.
 */
export function resolvePosthogApiHost(): string {
  const override = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (typeof window !== "undefined") {
    return POSTHOG_PROXY_PATH;
  }
  return override || POSTHOG_INGEST_HOST;
}

export function isPosthogLoaded(client: typeof posthog): boolean {
  return Boolean((client as unknown as { __loaded?: boolean }).__loaded);
}

export function isDeskPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Path we send as a pageview. Desk, APIs and auth-callback noise stay out so
 * operator clicks do not look like learner traffic.
 */
export function pageviewPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const path = pathname.split("?")[0].split("#")[0];
  if (!path) return null;
  if (isDeskPath(path)) return null;
  if (path.startsWith("/api/")) return null;
  if (path.startsWith("/monitoring")) return null;
  return path;
}

export type IdentifyInput = {
  userId: string;
  username?: string | null;
  platform?: "web" | "ios" | "android" | "pwa";
};

/** Person properties we are willing to attach. Never email. */
export function identifyProperties(input: IdentifyInput): Record<string, string> {
  const props: Record<string, string> = {};
  const username = input.username?.trim();
  if (username && username.length <= 40 && !username.includes("@")) {
    props.username = username;
  }
  if (input.platform) props.platform = input.platform;
  return props;
}

export function isPosthogReady(): boolean {
  return Boolean(posthogKey());
}
