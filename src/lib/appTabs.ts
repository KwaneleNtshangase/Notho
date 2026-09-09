import type { Route } from "@/app/pageViews.types";

/** Bottom-nav / sidebar destinations. Switching these should feel native. */
export const APP_TAB_HREFS = [
  "/learn",
  "/calculator",
  "/budget",
  "/quests",
  "/profile",
] as const;

export type AppTabHref = (typeof APP_TAB_HREFS)[number];

export const APP_TAB_EVENT = "notho:tab";

export function hrefForRouteName(name: Route["name"]): string | null {
  switch (name) {
    case "learn":
      return "/learn";
    case "calculator":
      return "/calculator";
    case "budget":
      return "/budget";
    case "quests":
      return "/quests";
    case "profile":
      return "/profile";
    case "leaderboard":
      return "/leaderboard";
    case "settings":
      return "/settings";
    default:
      return null;
  }
}

export function isAppTabPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "") return true;
  return APP_TAB_HREFS.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}

export function normalizeTabPath(pathname: string): AppTabHref {
  if (pathname.startsWith("/calculator")) return "/calculator";
  if (pathname.startsWith("/budget")) return "/budget";
  if (pathname.startsWith("/quests")) return "/quests";
  if (pathname.startsWith("/profile")) return "/profile";
  return "/learn";
}

export function announceTab(href: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_TAB_EVENT, { detail: href }));
}
