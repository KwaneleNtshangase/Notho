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

export function MobileBottomNav({
  items,
  hidden = false,
}: {
  items: Item[];
  hidden?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lens, setLens] = useState({ x: 0, y: 0, w: 52, h: 52, ready: false });
  const [press, setPress] = useState<{ x: number; y: number; key: string } | null>(null);

  const placeLens = () => {
    const rail = railRef.current;
    const active = items.find((item) => item.isActive);
    const btn = active ? btnRefs.current[active.key] : null;
    if (!rail || !btn) return;
    const railBox = rail.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    const size = Math.min(btnBox.width + 10, 64);
    setLens({
      x: btnBox.left - railBox.left + (btnBox.width - size) / 2,
      y: btnBox.top - railBox.top + (btnBox.height - size) / 2,
      w: size,
      h: size,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    placeLens();
    // items identity changes every render from the parent; key off active tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.find((item) => item.isActive)?.key]);

  useEffect(() => {
    const onResize = () => placeLens();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.find((item) => item.isActive)?.key]);

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
          {press ? (
            <span
              className="nav-press-lens"
              aria-hidden="true"
              style={{ left: press.x, top: press.y }}
            />
          ) : null}
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
              onPointerDown={(event) => {
                const rail = railRef.current;
                if (!rail) return;
                const box = rail.getBoundingClientRect();
                setPress({
                  x: event.clientX - box.left,
                  y: event.clientY - box.top,
                  key: item.key,
                });
              }}
              onPointerUp={() => {
                window.setTimeout(() => setPress(null), 280);
              }}
              onPointerCancel={() => setPress(null)}
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
