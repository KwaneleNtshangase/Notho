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
import { warmHeavyShell, warmBudget, whenIdle } from "@/lib/speculativeWarm";
import { CourseCardSkeleton, TransactionListSkeleton } from "@/components/Skeleton";

const LearnPage = dynamic(() => import("@/app/(app)/learn/page"), {
  ssr: false,
  loading: () => <TabSkeleton href="/learn" />,
});
const CalculatorPage = dynamic(() => import("@/app/(app)/calculator/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const BudgetPage = dynamic(() => import("@/app/(app)/budget/page"), {
  ssr: false,
  loading: () => <TabSkeleton href="/budget" />,
});
const QuestsPage = dynamic(() => import("@/app/(app)/quests/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});
const ProfilePage = dynamic(() => import("@/app/(app)/profile/page"), {
  ssr: false,
  loading: () => <TabSkeleton />,
});

function LearnTabSkeleton() {
  return (
    <div aria-busy="true" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <span className="sr-only">Loading</span>
      <div className="skeleton" style={{ height: 18, width: "36%", borderRadius: 6 }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BudgetTabSkeleton() {
  return (
    <div aria-busy="true" style={{ padding: "16px 0" }}>
      <span className="sr-only">Loading</span>
      <div style={{ padding: "0 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="skeleton" style={{ height: 18, width: 120, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 28, width: 64, borderRadius: 8 }} />
      </div>
      <TransactionListSkeleton rows={6} />
    </div>
  );
}

function GenericTabSkeleton() {
  return (
    <div aria-busy="true" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <span className="sr-only">Loading</span>
      <div className="skeleton" style={{ height: 18, width: "40%", borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 96, borderRadius: 16 }} />
      <div className="skeleton" style={{ height: 64, borderRadius: 16 }} />
    </div>
  );
}

function TabSkeleton({ href }: { href?: string }) {
  if (href === "/learn") return <LearnTabSkeleton />;
  if (href === "/budget") return <BudgetTabSkeleton />;
  return <GenericTabSkeleton />;
}

const PAGES: Record<AppTabHref, React.ComponentType> = {
  "/learn": LearnPage,
  "/calculator": CalculatorPage,
  "/budget": BudgetPage,
  "/quests": QuestsPage,
  "/profile": ProfilePage,
};

function markVisited(
  prev: Set<AppTabHref>,
  next: AppTabHref
): Set<AppTabHref> {
  if (prev.has(next)) return prev;
  const copy = new Set(prev);
  copy.add(next);
  return copy;
}

/**
 * Keep visited main tabs mounted so switching does not wait on a Vercel RSC
 * fetch or remount Calculator/Budget state. URL still updates in the background.
 */
export function PersistentAppTabs({ visible }: { visible: boolean }) {
  const pathname = usePathname() || "/learn";
  const [active, setActive] = useState<AppTabHref>(() => normalizeTabPath(pathname));
  const [visited, setVisited] = useState<Set<AppTabHref>>(
    () => new Set([normalizeTabPath(pathname)])
  );

  useEffect(() => {
    if (!isAppTabPath(pathname)) return;
    const next = normalizeTabPath(pathname);
    setActive(next);
    setVisited((prev) => markVisited(prev, next));
  }, [pathname]);

  useEffect(() => {
    const onTab = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      if (!href || !APP_TAB_HREFS.includes(href as AppTabHref)) return;
      const next = href as AppTabHref;
      setActive(next);
      setVisited((prev) => markVisited(prev, next));
    };
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  useEffect(() => {
    const warm = () => {
      void import("@/app/(app)/learn/page");
      void import("@/app/(app)/calculator/page");
      void import("@/app/(app)/budget/page");
      void import("@/app/(app)/quests/page");
      void import("@/app/(app)/profile/page");
      warmHeavyShell();
      warmBudget();
    };
    return whenIdle(warm, 900);
  }, []);

  return (
    <div style={visible ? undefined : { display: "none" }} aria-hidden={!visible}>
      {APP_TAB_HREFS.map((href) => {
        if (!visited.has(href)) return null;
        const Page = PAGES[href];
        const shown = visible && href === active;
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
    </div>
  );
}
