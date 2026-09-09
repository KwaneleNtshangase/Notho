"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  APP_TAB_EVENT,
  APP_TAB_HREFS,
  isAppTabPath,
  normalizeTabPath,
  type AppTabHref,
} from "@/lib/appTabs";

const LearnPage = dynamic(() => import("@/app/(app)/learn/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const CalculatorPage = dynamic(() => import("@/app/(app)/calculator/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const BudgetPage = dynamic(() => import("@/app/(app)/budget/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const QuestsPage = dynamic(() => import("@/app/(app)/quests/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const ProfilePage = dynamic(() => import("@/app/(app)/profile/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});

function TabSkeleton() {
  return (
    <div
      aria-hidden
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ height: 18, width: "40%", borderRadius: 8, background: "var(--color-border)", opacity: 0.5 }} />
      <div style={{ height: 120, borderRadius: 16, background: "var(--color-border)", opacity: 0.35 }} />
      <div style={{ height: 80, borderRadius: 16, background: "var(--color-border)", opacity: 0.25 }} />
    </div>
  );
}

const PAGES: Record<AppTabHref, React.ComponentType> = {
  "/learn": LearnPage,
  "/calculator": CalculatorPage,
  "/budget": BudgetPage,
  "/quests": QuestsPage,
  "/profile": ProfilePage,
};

/**
 * Keep visited main tabs mounted so switching does not wait on a Vercel RSC
 * fetch or remount Calculator/Budget state. URL still updates in the background.
 */
export function PersistentAppTabs() {
  const pathname = usePathname() || "/learn";
  const [active, setActive] = useState<AppTabHref>(() => normalizeTabPath(pathname));
  const [visited, setVisited] = useState<Set<AppTabHref>>(
    () => new Set([normalizeTabPath(pathname)])
  );

  useEffect(() => {
    if (!isAppTabPath(pathname)) return;
    const next = normalizeTabPath(pathname);
    setActive(next);
    setVisited((prev) => {
      if (prev.has(next)) return prev;
      const copy = new Set(prev);
      copy.add(next);
      return copy;
    });
  }, [pathname]);

  useEffect(() => {
    const onTab = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      if (!href || !APP_TAB_HREFS.includes(href as AppTabHref)) return;
      const next = href as AppTabHref;
      setActive(next);
      setVisited((prev) => {
        if (prev.has(next)) return prev;
        const copy = new Set(prev);
        copy.add(next);
        return copy;
      });
    };
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  if (!isAppTabPath(pathname) && !visited.has(active)) return null;

  return (
    <>
      {APP_TAB_HREFS.map((href) => {
        if (!visited.has(href)) return null;
        const Page = PAGES[href];
        const shown = href === active && isAppTabPath(pathname);
        return (
          <div
            key={href}
            hidden={!shown}
            style={shown ? undefined : { display: "none" }}
            aria-hidden={!shown}
          >
            <Page />
          </div>
        );
      })}
    </>
  );
}
