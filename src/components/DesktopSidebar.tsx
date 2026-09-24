"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNotho } from "@/context/NothoContext";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
  NothoProfile,
} from "@/components/icons/NothoIcons";
import {
  APP_TAB_EVENT,
  tabKeyFromHref,
  tabKeyFromPath,
  type AppTabKey,
} from "@/lib/appTabs";

export function DesktopSidebar() {
  const { setRoute } = useNotho();
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
    { key: "learn" as const, label: "Learn", Icon: NothoLearn },
    { key: "calculator" as const, label: "Calculate", Icon: NothoCalculate },
    { key: "budget" as const, label: "Budget", Icon: NothoBudget },
    { key: "quests" as const, label: "Goals", Icon: NothoGoals },
    { key: "profile" as const, label: "Profile", Icon: NothoProfile },
  ];

  return (
    <nav className="sidebar" style={{ background: "var(--color-bg)", border: "none" }}>
      <div style={{
        padding: "16px 14px 12px",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: 8,
      }}>
        <img
          className="logo-light"
          src="/notho-logo.png"
          alt="Notho"
          style={{ width: "100%", maxWidth: 132, height: "auto", objectFit: "contain", display: "block" }}
        />
        <img
          className="logo-dark"
          src="/notho-logo-on-dark.png"
          alt="Notho"
          style={{ width: "100%", maxWidth: 132, height: "auto", objectFit: "contain" }}
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
                <Icon size={20} className="text-current" />
              </span>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
