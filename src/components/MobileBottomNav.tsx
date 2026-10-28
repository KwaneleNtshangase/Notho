"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Item = {
  key: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
  order: string;
};

const SWIPE_PX = 48;

export function MobileBottomNav({
  items,
  hidden = false,
}: {
  items: Item[];
  hidden?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const swipeRef = useRef<{ x: number; y: number; locked: "none" | "h" | "v" } | null>(null);
  const itemsRef = useRef(items);
  const [lens, setLens] = useState({ x: 0, y: 0, w: 48, h: 48, ready: false });

  itemsRef.current = items;

  const placeLens = () => {
    const rail = railRef.current;
    const active = items.find((item) => item.isActive);
    const btn = active ? btnRefs.current[active.key] : null;
    if (!rail || !btn) return;
    const railBox = rail.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    const size = Math.min(Math.max(btnBox.width - 4, 44), 56);
    setLens({
      x: btnBox.left - railBox.left + (btnBox.width - size) / 2,
      y: btnBox.top - railBox.top + (btnBox.height - size) / 2,
      w: size,
      h: size,
      ready: true,
    });
  };

  const activeKey = items.find((item) => item.isActive)?.key;

  useLayoutEffect(() => {
    placeLens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    const onResize = () => placeLens();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const goNeighbor = (dir: -1 | 1) => {
    const list = [...itemsRef.current].sort((a, b) => a.order.localeCompare(b.order));
    const index = list.findIndex((item) => item.isActive);
    if (index < 0) return;
    const next = list[index + dir];
    if (next) next.onClick();
  };

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
        onTouchStart={(event) => {
          if (event.touches.length !== 1) return;
          const t = event.touches[0];
          swipeRef.current = { x: t.clientX, y: t.clientY, locked: "none" };
        }}
        onTouchMove={(event) => {
          const start = swipeRef.current;
          if (!start || start.locked === "v") return;
          const t = event.touches[0];
          if (!t) return;
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (start.locked === "none") {
            if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
            start.locked = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
          }
          if (start.locked === "h" && event.cancelable) event.preventDefault();
        }}
        onTouchEnd={(event) => {
          const start = swipeRef.current;
          swipeRef.current = null;
          if (!start || start.locked === "v") return;
          const t = event.changedTouches[0];
          if (!t) return;
          const dx = t.clientX - start.x;
          if (Math.abs(dx) < SWIPE_PX) return;
          goNeighbor(dx < 0 ? 1 : -1);
        }}
        onTouchCancel={() => {
          swipeRef.current = null;
        }}
      >
        <div
          ref={railRef}
          className="nav-pill mx-auto flex max-w-[460px] flex-row items-stretch justify-between"
        >
          <span
            className="nav-lens"
            aria-hidden="true"
            style={{
              transform: `translate3d(${lens.x}px, ${lens.y}px, 0)`,
              width: lens.w,
              height: lens.h,
              opacity: lens.ready ? 1 : 0,
            }}
          />
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              ref={(node) => {
                btnRefs.current[item.key] = node;
              }}
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
