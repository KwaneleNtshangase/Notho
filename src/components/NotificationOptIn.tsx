"use client";

/**
 * Ask once, after the first real lesson — not on launch, not in Settings.
 * Settings remains an off switch only.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ensurePushSubscription, pushSupported } from "@/lib/push/subscribe";
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
    pathname.startsWith("/lesson/") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (!pushSupported()) return;
    if (Notification.permission === "granted") {
      void ensurePushSubscription(false).catch(() => {});
      return;
    }
    if (Notification.permission === "denied") return;
    if (!doneALesson || onQuietPath) return;
    try {
      if (localStorage.getItem(DECIDED_KEY) === "1") return;
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
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
      aria-label="Lesson reminders"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
        zIndex: 55,
        maxWidth: 440,
        margin: "0 auto",
        background: "var(--color-surface, #111)",
        border: "1.5px solid var(--color-border)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>
        Want a tap when it's time for the next lesson?
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 6, lineHeight: 1.45 }}>
        One reminder a day, after you've already started. Off whenever you like.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
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
            padding: "10px 12px",
          }}
        >
          Not now
        </button>
        <button
          type="button"
          onClick={() => void enable()}
          disabled={busy}
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "One sec…" : "Yes, remind me"}
        </button>
      </div>
    </div>
  );
}
