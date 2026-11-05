"use client";
import { LocalizedText as I18nText } from "@/i18n/LocalizedText";

import React, { useEffect, useState } from "react";
import { NothoProvider, useNotho } from "@/context/NothoContext";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
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
import { SessionReplayGate } from "@/components/SessionReplayGate";
import { AppGestures } from "@/components/AppGestures";
import { ShakeToReport } from "@/components/ShakeToReport";
import { NavProfileMark, ProfilePhotoBoot, warmProfileAvatar } from "@/components/navProfilePhoto";
import { useLocale } from "@/i18n/LocaleProvider";

function AppNavigation({ hidden = false }: { hidden?: boolean }) {
  const { setRoute } = useNotho();
  const { t } = useLocale();
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
      hidden={hidden}
      items={[
        {
          key: "learn",
          label: t("nav.learn"),
          icon: <NothoLearn size={24} className="text-current" />,
          isActive: activeKey === "learn",
          onClick: () => handleNav("learn"),
          order: "order-1",
        },
        {
          key: "calculator",
          label: t("nav.calculate"),
          icon: <NothoCalculate size={24} className="text-current" />,
          isActive: activeKey === "calculator",
          onClick: () => handleNav("calculator"),
          order: "order-2",
        },
        {
          key: "budget",
          label: t("nav.budget"),
          icon: <NothoBudget size={24} className="text-current" />,
          isActive: activeKey === "budget",
          onClick: () => handleNav("budget"),
          order: "order-3",
        },
        {
          key: "quests",
          label: t("nav.goals"),
          icon: <NothoGoals size={24} className="text-current" />,
          isActive: activeKey === "quests",
          onClick: () => handleNav("quests"),
          order: "order-4",
        },
        {
          key: "profile",
          label: t("nav.profile"),
          icon: <NavProfileMark size={24} />,
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
  const isReview = pathname === "/review" || pathname.startsWith("/review/");
  const [showTabs, setShowTabs] = useState(pathIsTab);
  const tabsVisible = !isReview && showTabs;

  useEffect(() => {
    setShowTabs(isAppTabPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onTab = () => setShowTabs(true);
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  useEffect(() => {
    warmProfileAvatar();
  }, []);

  return (
    <NothoProvider>
      <AuthGate>
        <OnboardingGate>
          <ProfilePhotoBoot />
          <div className="app-container">
            {!isMockExam && <DesktopSidebar />}
            <div
              className={`main-content ${isMockExam ? "mock-main-content" : ""} ${isReview ? "review-main-content" : ""} ${(pathname === "/learn" || pathname === "/") ? "main-with-stats" : ""}`}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {!isMockExam && <MobileTopBarWrapper />}
              <div
                className={isReview ? "review-stage" : undefined}
                style={{ paddingBottom: isMockExam || isReview ? 0 : "70px", flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
              >
                {!isMockExam && <PersistentAppTabs visible={tabsVisible} />}
                <I18nText>{!tabsVisible && children}</I18nText>
              </div>
            </div>
            {(pathname === "/learn" || pathname === "/") && (
              <StatsPanelWrapper />
            )}
          </div>
          {!isMockExam && <AppNavigation hidden={isReview} />}
          {!isMockExam && <NotificationOptIn />}
          {!isMockExam && <StreakRepairBanner />}
          <UsageTracker />
          <SessionReplayGate />
          <AppGestures />
          <ShakeToReport />
        </OnboardingGate>
      </AuthGate>
    </NothoProvider>
  );
}

function MobileTopBarWrapper() {
  const { userData, hearts, maxHearts, heartsRegenInfo, freezeCount, buyStreakFreeze, userId } = useNotho();
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
        lessonsToday={userData.lessonsToday}
        lastActivityDate={userData.lastActivityDate}
        signedIn={Boolean(userId)}
      />
    </div>
  );
}

function StatsPanelWrapper() {
  const { userData, hearts, maxHearts, freezeCount, buyStreakFreeze, userId } = useNotho();

  if (!userData) return null;

  return (
    <StatsPanel
      userData={userData}
      hearts={hearts}
      maxHearts={maxHearts}
      freezeCount={freezeCount}
      onBuyFreeze={() => buyStreakFreeze()}
      signedIn={Boolean(userId)}
    />
  );
}
