/**
 * PostHog helpers. Email, name, phone, statement text and rand amounts never belong here.
 */
import type posthog from "posthog-js";

export const POSTHOG_PROXY_PATH = "/nk-in";
export const POSTHOG_UI_HOST = "https://us.posthog.com";
export const POSTHOG_INGEST_HOST = "https://us.i.posthog.com";

export function posthogKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  return key ? key : undefined;
}

export function isPosthogLoaded(client: typeof posthog): boolean {
  return Boolean((client as unknown as { __loaded?: boolean }).__loaded);
}

export function isDeskPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function pageviewPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const path = pathname.split("?")[0].split("#")[0];
  if (!path || isDeskPath(path) || path.startsWith("/api/") || path.startsWith("/monitoring")) return null;
  return path;
}

export function identifyProperties(input: {
  userId: string;
  username?: string | null;
  platform?: "web" | "ios" | "android" | "pwa";
}): Record<string, string> {
  const props: Record<string, string> = {};
  const username = input.username?.trim();
  if (username && username.length <= 40 && !username.includes("@")) props.username = username;
  if (input.platform) props.platform = input.platform;
  return props;
}
