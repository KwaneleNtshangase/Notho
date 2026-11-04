"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Renders `children` on `document.body` after the component has mounted.
 *
 * Full-screen review/practice UI used to live under `.main-content`, which
 * uses `overflow-x: clip` (and other ancestors use transform / z-index).
 * Those create a containing block, so `position: fixed` was clipped or painted
 * under the shell. Portaling after mount keeps the first server render empty,
 * which matches the client hydration render.
 */
export function BodyPortal({
  children,
  onEscape,
  label = "Review session",
}: {
  children: ReactNode;
  onEscape?: () => void;
  label?: string;
}) {
  // False during SSR and the hydration render, true on the client after that.
  // Avoids a hydration mismatch and keeps the portal off document.body until mount.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const body = document.body;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const mains = Array.from(document.querySelectorAll<HTMLElement>(".main-content"));
    const previousMainOverflow = mains.map((el) => el.style.overflow);

    root.classList.add("notho-overlay-open", "notho-review-open");
    body.classList.add("modal-open");
    mains.forEach((el) => {
      el.style.overflow = "hidden";
    });

    const container = containerRef.current;
    const focusFirstIfStillOnDialog = () => {
      if (!container) return;
      const active = document.activeElement;
      const userMovedInside =
        active instanceof Node && active !== container && container.contains(active);
      if (userMovedInside) return;
      const first = container.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? container).focus({ preventScroll: true });
    };
    focusFirstIfStillOnDialog();
    const focusObserver = new MutationObserver(focusFirstIfStillOnDialog);
    if (container) focusObserver.observe(container, { childList: true, subtree: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && container.contains(active);
      if (event.shiftKey && (!inside || active === firstEl)) {
        event.preventDefault();
        lastEl.focus({ preventScroll: true });
      } else if (!event.shiftKey && (!inside || active === lastEl)) {
        event.preventDefault();
        firstEl.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      focusObserver.disconnect();
      document.removeEventListener("keydown", onKey);
      root.classList.remove("notho-overlay-open", "notho-review-open");
      body.classList.remove("modal-open");
      mains.forEach((el, index) => {
        el.style.overflow = previousMainOverflow[index] ?? "";
      });
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      data-review-session=""
      className="review-session-portal"
    >
      {children}
    </div>,
    document.body
  );
}
