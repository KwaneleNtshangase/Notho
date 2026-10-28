"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ensurePushSubscription,
  isNativeShell,
  pushSupported,
  webNotificationPermission,
} from "@/lib/push/subscribe";
import { useNotho } from "@/context/NothoContext";

const DECIDED_KEY = "notho-notif-decided";
const OLD_SNOOZE = "notho-notif-prompt-snoozed-until";

export function NotificationOptIn() {
  const pathname = usePathname() || "/";
  const { userData } = useNotho();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const doneALesson = (userData?.totalCompleted ?? 0) > 0 || (userData?.lessonsToday ?? 0) > 0;
  const onQuietPath =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/lesson") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (onQuietPath) {
      setShow(false);
      return;
    }
    if (!pushSupported()) return;
    let cancelled = false;
    const t = setTimeout(() => {
      void (async () => {
        const permission = webNotificationPermission();
        if (permission === "granted") {
          await ensurePushSubscription(false).catch(() => {});
          return;
        }
        if (permission === "denied") return;
        // iOS/Android shell: Notification is missing. Capacitor permission is separate.
        if (permission === null) {
          if (!isNativeShell()) return;
          const existing = await ensurePushSubscription(false).catch(() => "unsupported" as const);
          if (existing === "subscribed" || existing === "denied" || existing === "unsupported") return;
        }
        if (!doneALesson || cancelled) return;
        try {
          if (localStorage.getItem(DECIDED_KEY) === "1") return;
        } catch {
          /* storage unavailable */
        }
        if (!cancelled) setShow(true);
      })();
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [doneALesson, onQuietPath]);

  const close = (remember: boolean) => {
    if (remember) {
      try {
        localStorage.setItem(DECIDED_KEY, "1");
        localStorage.removeItem(OLD_SNOOZE);
      } catch {
        /* storage unavailable */
      }
    }
    setShow(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      await ensurePushSubscription(true);
    } finally {
      setBusy(false);
      close(true);
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Reminders"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
        zIndex: 55,
        maxWidth: 400,
        margin: "0 auto",
        background: "var(--color-surface, #111)",
        border: "1.5px solid var(--color-border)",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
        Remind you for the next lesson?
      </div>
      <button
        type="button"
        onClick={() => close(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          padding: "8px 10px",
          flexShrink: 0,
        }}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy}
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          opacity: busy ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {busy ? "…" : "Remind me"}
      </button>
    </div>
  );
}
