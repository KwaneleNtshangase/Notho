"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotho } from "@/context/NothoContext";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
  NothoProfile,
} from "@/components/icons/NothoIcons";

function activeKeyFromPath(pathname: string): string {
  if (pathname.startsWith("/budget")) return "budget";
  if (pathname.startsWith("/calculator")) return "calculator";
  if (pathname.startsWith("/quests")) return "quests";
  if (pathname.startsWith("/profile") || pathname.startsWith("/leaderboard")) return "profile";
  return "learn";
}

export function DesktopSidebar() {
  const { setRoute } = useNotho();
  const pathname = usePathname() || "/";
  const active = activeKeyFromPath(pathname);

  const handleNav = (name: string) => {
    setRoute({ name: name as never });
  };

  const items = [
    { key: "learn", href: "/learn", label: "Learn", Icon: NothoLearn },
    { key: "calculator", href: "/calculator", label: "Calculate", Icon: NothoCalculate },
    { key: "budget", href: "/budget", label: "Budget", Icon: NothoBudget },
    { key: "quests", href: "/quests", label: "Goals", Icon: NothoGoals },
    { key: "profile", href: "/profile", label: "Profile", Icon: NothoProfile },
  ] as const;

  return (
    <nav className="sidebar" style={{ background: "var(--color-bg)", border: "none" }}>
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: 8,
      }}>
        <img
          className="logo-light"
          src="/notho-logo.png"
          alt="Notho"
          style={{ width: "100%", maxWidth: 190, height: "auto", objectFit: "contain", display: "block" }}
        />
        <img
          className="logo-dark"
          src="/notho-logo-on-dark.png"
          alt="Notho"
          style={{ width: "100%", maxWidth: 190, height: "auto", objectFit: "contain" }}
        />
      </div>
      <ul className="nav-menu">
        {items.map(({ key, href, label, Icon }) => (
          <li className="nav-item" key={key}>
            <Link
              href={href}
              prefetch
              className={`nav-link ${active === key ? "active" : ""}`}
              style={active !== key ? { color: "var(--nav-link-color)" } : {}}
              onClick={(e) => {
                e.preventDefault();
                handleNav(key);
              }}
            >
              <span className="nav-icon">
                <Icon size={20} className="text-current" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
