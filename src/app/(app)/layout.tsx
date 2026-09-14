"use client";

import React, { useEffect, useState } from "react";
import { NothoProvider, useNotho } from "@/context/NothoContext";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
  NothoProfile,
} from "@/components/icons/NothoIcons";
import { usePathname } from "next/navigation";
import { StatsPanel } from "@/components/StatsPanel";
import { NothoTopBar } from "@/components/NothoTopBar";
import { PersistentAppTabs } from "@/components/PersistentAppTabs";
import {
  APP_TAB_EVENT,
  isAppTabPath,
  tabKeyFromHref,
  tabKeyFromPath,
  type AppTabKey,
} from "@/lib/appTabs";
import "../gestures.css";
import "../nav-glass.css";
import { AuthGate } from "@/components/AuthGate";
import { OnboardingGate } from "@/components/OnboardingGate";
import { NotificationOptIn } from "@/components/NotificationOptIn";
import { StreakRepairBanner } from "@/components/StreakRepairBanner";
import { UsageTracker } from "@/components/UsageTracker";
import { AppGestures } from "@/components/AppGestures";

function AppNavigation() {
  const { setRoute } = useNotho();
  const pathname = usePathname() || "/";
  const pathKey = tabKeyFromPath(pathname);
  const [pendingKey, setPendingKey] = useState<AppTabKey | null>(null);
  const activeKey = pendingKey ?? pathKey;

  useEffect(() => {
    if (pendingKey && pendingKey === pathKey) setPendingKey(null);
  }, [pathKey, pendingKey]);

  useEffect(() => {
    const onTab = (event: Event) => {
      const key = tabKeyFromHref((event as CustomEvent<string>).detail);
      if (key) setPendingKey(key);
    };
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  const handleNav = (name: AppTabKey) => {
    setPendingKey(name);
    setRoute({ name: name as never });
  };

  return (
    <MobileBottomNav
      items={[
        {
          key: "learn",
          label: "Learn",
          icon: <NothoLearn size={24} className="text-current" />,
          isActive: activeKey === "learn",
          onClick: () => handleNav("learn"),
          order: "order-1",
        },
        {
          key: "calculator",
          label: "Calculate",
          icon: <NothoCalculate size={24} className="text-current" />,
          isActive: activeKey === "calculator",
          onClick: () => handleNav("calculator"),
          order: "order-2",
        },
        {
          key: "budget",
          label: "Budget",
          icon: <NothoBudget size={24} className="text-current" />,
          isActive: activeKey === "budget",
          onClick: () => handleNav("budget"),
          order: "order-3",
        },
        {
          key: "quests",
          label: "Goals",
          icon: <NothoGoals size={24} className="text-current" />,
          isActive: activeKey === "quests",
          onClick: () => handleNav("quests"),
          order: "order-4",
        },
        {
          key: "profile",
          label: "Profile",
          icon: <NothoProfile size={24} className="text-current" />,
          isActive: activeKey === "profile",
          onClick: () => handleNav("profile"),
          order: "order-5",
        },
      ]}
    />
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isMockExam = /^\/lesson\/re5-exam-prep\/re5-mock-[ab](?:\/|$)/.test(
    pathname
  );
  const pathIsTab = isAppTabPath(pathname);
  const [showTabs, setShowTabs] = useState(pathIsTab);

  useEffect(() => {
    setShowTabs(isAppTabPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onTab = () => setShowTabs(true);
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  return (
    <NothoProvider>
      <AuthGate>
        <OnboardingGate>
          <div className="app-container">
            {!isMockExam && <DesktopSidebar />}
            <div
              className={`main-content ${isMockExam ? "mock-main-content" : ""} ${(pathname === "/learn" || pathname === "/") ? "main-with-stats" : ""}`}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {!isMockExam && <MobileTopBarWrapper />}
              <div style={{ paddingBottom: isMockExam ? 0 : "70px", flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!isMockExam && <PersistentAppTabs visible={showTabs} />}
                {!showTabs && children}
              </div>
            </div>
            {(pathname === "/learn" || pathname === "/") && (
              <StatsPanelWrapper />
            )}
          </div>
          {!isMockExam && <AppNavigation />}
          {!isMockExam && <NotificationOptIn />}
          {!isMockExam && <StreakRepairBanner />}
          <UsageTracker />
          <AppGestures />
        </OnboardingGate>
      </AuthGate>
    </NothoProvider>
  );
}

function MobileTopBarWrapper() {
  const { userData, hearts, maxHearts, heartsRegenInfo, freezeCount, buyStreakFreeze, useFreeze } = useNotho();
  if (!userData) return null;
  return (
    <div className="mobile-top-bar">
      <NothoTopBar
        streak={userData.streak}
        xp={userData.xp}
        hearts={hearts}
        maxHearts={maxHearts}
        heartsRegenInfo={heartsRegenInfo}
        freezeCount={freezeCount}
        onBuyFreeze={() => buyStreakFreeze()}
        onUseFreeze={async () => { await useFreeze(); }}
        freezeUsedToday={userData.lessonsToday > 0 && freezeCount > 0}
        lessonsToday={userData.lessonsToday}
      />
    </div>
  );
}

function StatsPanelWrapper() {
  const { userData, hearts, maxHearts, freezeCount, buyStreakFreeze, useFreeze } = useNotho();

  if (!userData) return null;

  const handleBuyFreeze = () => buyStreakFreeze();
  const handleUseFreeze = () => useFreeze();
  const freezeUsedToday = userData.lessonsToday > 0 && freezeCount > 0;

  return (
    <StatsPanel
      userData={userData}
      hearts={hearts}
      maxHearts={maxHearts}
      freezeCount={freezeCount}
      onBuyFreeze={handleBuyFreeze}
      onUseFreeze={handleUseFreeze}
      freezeUsedToday={freezeUsedToday}
    />
  );
}
