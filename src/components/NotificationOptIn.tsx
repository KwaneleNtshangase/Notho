"use client";

/**
 * Notifications "on by default", the browser-legal way:
 *  - Permission already granted → silently (re)subscribe on load. Covers new
 *    devices and expired subscriptions with zero UI.
 *  - Permission never asked → show a soft banner to every signed-in user.
 *    One tap fires the real browser prompt (user gesture, so iOS Safari
 *    accepts it). "Later" snoozes the banner for 14 days.
 *  - Permission denied → stay silent (the browser blocks re-asking anyway).
 * Users can switch off anytime in Settings (existing toggle).
 */

import { useEffect, useState } from "react";
import { ensurePushSubscription, pushSupported } from "@/lib/push/subscribe";

const SNOOZE_KEY = "notho-notif-prompt-snoozed-until";
const SNOOZE_DAYS = 14;

export function NotificationOptIn() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;

    if (Notification.permission === "granted") {
      // Auto: keep every granted device subscribed without asking anything.
      void ensurePushSubscription(false).catch(() => {});
      return;
    }
    if (Notification.permission === "denied") return;

    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
      if (Date.now() < until) return;
    } catch { /* storage unavailable */ }

    // Let the app settle before asking (also keeps setState async in effects).
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    } catch { /* storage unavailable */ }
    setShow(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      await ensurePushSubscription(true);
    } finally {
      setBusy(false);
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
        zIndex: 55,
        maxWidth: 440,
        margin: "0 auto",
        background: "var(--color-surface, #fff)",
        border: "1.5px solid var(--color-border)",
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>
          Streak reminder
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
          Optional reminder before a streak drops, and when a budget category runs hot.
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
        <button
          type="button"
          onClick={snooze}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)",
            padding: "8px 10px",
          }}
        >
          Later
        </button>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          style={{
            background: "var(--color-primary)", color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Turning on…" : "Turn on"}
        </button>
      </div>
    </div>
  );
}
