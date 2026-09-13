"use client";

import type { ReactNode } from "react";

type Item = {
  key: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
  order: string;
};

export function MobileBottomNav({
  items,
  hidden = false,
}: {
  items: Item[];
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <>
      <style>{`
        html.notho-overlay-open .bottom-nav { display: none !important; }
      `}</style>
      <nav
        className="bottom-nav fixed left-0 right-0 z-[200] md:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 10px)",
          paddingLeft: 12,
          paddingRight: 12,
        }}
        aria-label="Bottom navigation"
      >
        <div className="nav-pill mx-auto flex max-w-[460px] flex-row items-stretch justify-between">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={["nav-pill-btn", item.order].join(" ")}
              data-active={item.isActive ? "true" : "false"}
              aria-current={item.isActive ? "page" : undefined}
              onClick={item.onClick}
            >
              <span className="nav-ico" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-lbl">{item.label === "Quests" ? "Goals" : item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
