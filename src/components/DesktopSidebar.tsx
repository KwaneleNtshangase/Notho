"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNotho } from "@/context/NothoContext";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
} from "@/components/icons/NothoIcons";
import { NavProfileMark } from "@/components/ProfileAvatar";
import {
  APP_TAB_EVENT,
  tabKeyFromHref,
  tabKeyFromPath,
  type AppTabKey,
} from "@/lib/appTabs";
import { useLocale } from "@/i18n/LocaleProvider";

export function DesktopSidebar() {
  const { setRoute } = useNotho();
  const { t } = useLocale();
  const pathname = usePathname() || "/";
  const pathKey = tabKeyFromPath(pathname);
  const [pendingKey, setPendingKey] = useState<AppTabKey | null>(null);
  const active = pendingKey ?? pathKey;

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

  const items = [
    { key: "learn" as const, label: t("nav.learn"), Icon: NothoLearn },
    { key: "calculator" as const, label: t("nav.calculate"), Icon: NothoCalculate },
    { key: "budget" as const, label: t("nav.budget"), Icon: NothoBudget },
    { key: "quests" as const, label: t("nav.goals"), Icon: NothoGoals },
    { key: "profile" as const, label: t("nav.profile"), Icon: null },
  ];

  const lockupStyle = {
    width: "100%",
    height: "auto",
    objectFit: "contain" as const,
  };

  return (
    <nav className="sidebar" style={{ background: "var(--color-bg)", border: "none" }}>
      <div style={{
        padding: "20px 16px 8px",
        marginBottom: 4,
      }}>
        {/* Theme CSS swaps these. Do not set display inline — it beats html.dark .logo-light. */}
        <img
          className="logo-light"
          src="/notho-logo.png"
          alt="Notho"
          style={lockupStyle}
        />
        <img
          className="logo-dark"
          src="/notho-logo-on-dark.png"
          alt=""
          style={lockupStyle}
        />
      </div>
      <ul className="nav-menu">
        {items.map(({ key, label, Icon }) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link ${active === key ? "active" : ""}`}
              style={active !== key ? { color: "var(--nav-link-color)" } : {}}
              onClick={() => handleNav(key)}
            >
              <span className="nav-icon">
                {key === "profile" ? <NavProfileMark size={20} /> : Icon ? <Icon size={20} className="text-current" /> : null}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
