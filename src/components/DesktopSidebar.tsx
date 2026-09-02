"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useNotho } from "@/context/NothoContext";
import {
  NothoLearn,
  NothoCalculate,
  NothoBudget,
  NothoGoals,
  NothoProfile,
} from "@/components/icons/NothoIcons";

/** Which nav item should be highlighted, derived from the real URL. */
function activeKeyFromPath(pathname: string): string {
  if (pathname.startsWith("/budget")) return "budget";
  if (pathname.startsWith("/calculator")) return "calculator";
  if (pathname.startsWith("/quests")) return "quests";
  if (pathname.startsWith("/profile") || pathname.startsWith("/leaderboard")) return "profile";
  // learn, course, lesson and the root all live under "Learn"
  return "learn";
}

export function DesktopSidebar() {
  const { setRoute } = useNotho();
  const pathname = usePathname() || "/";
  const active = activeKeyFromPath(pathname);

  const handleNav = (name: string) => {
    setRoute({ name: name as never });
  };

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
        <li className="nav-item">
          <button
            className={`nav-link ${active ==="learn" ? "active" : ""}`}
            style={active !=="learn" ? { color: "var(--nav-link-color)" } : {}}
            onClick={() => handleNav("learn")}
          >
            <span className="nav-icon">
              <NothoLearn size={20} className="text-current" />
            </span>
            Learn
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${active ==="calculator" ? "active" : ""}`}
            style={active !=="calculator" ? { color: "var(--nav-link-color)" } : {}}
            onClick={() => handleNav("calculator")}
          >
            <span className="nav-icon">
              <NothoCalculate size={20} className="text-current" />
            </span>
            Calculate
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${active ==="budget" ? "active" : ""}`}
            style={active !=="budget" ? { color: "var(--nav-link-color)" } : {}}
            onClick={() => handleNav("budget")}
          >
            <span className="nav-icon">
              <NothoBudget size={20} className="text-current" />
            </span>
            Budget
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${active ==="quests" ? "active" : ""}`}
            style={active !=="quests" ? { color: "var(--nav-link-color)" } : {}}
            onClick={() => handleNav("quests")}
          >
            <span className="nav-icon">
              <NothoGoals size={20} className="text-current" />
            </span>
            Goals
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${active ==="profile" ? "active" : ""}`}
            style={active !=="profile" ? { color: "var(--nav-link-color)" } : {}}
            onClick={() => handleNav("profile")}
          >
            <span className="nav-icon">
              <NothoProfile size={20} className="text-current" />
            </span>
            Profile
          </button>
        </li>
      </ul>
    </nav>
  );
}
