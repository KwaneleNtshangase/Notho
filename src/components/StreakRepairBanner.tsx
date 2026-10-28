"use client";

/**
 * Streak repair offer: shows when the user's streak broke in the last 48h
 * (last activity 2-3 SAST days ago, streak was 3+) and they can afford the
 * 200 XP repair. One tap calls the repair_streak() RPC, which stamps
 * yesterday so today's lesson continues the streak.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sastToday } from "@/lib/dates";

const COST = 200;
const DISMISS_KEY = "notho-streak-repair-dismissed";

function daysAgo(sastDay: string, n: number): string {
  const d = new Date(`${sastDay}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

type Offer = { streak: number; xp: number };

export function StreakRepairBanner() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("user_progress")
        .select("streak, xp, last_activity_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !p) return;

      const today = sastToday();
      const last = String(p.last_activity_date ?? "");
      const streak = Number(p.streak ?? 0);
      const xp = Number(p.xp ?? 0);

      const brokeRecently = last === daysAgo(today, 2) || last === daysAgo(today, 3);
      if (streak < 3 || !brokeRecently || xp < COST) return;

      try {
        // One offer per break: dismissal is keyed to the break date.
        if (localStorage.getItem(DISMISS_KEY) === last) return;
      } catch { /* storage unavailable */ }

      const t = setTimeout(() => { if (!cancelled) setOffer({ streak, xp }); }, 800);
      return () => clearTimeout(t);
    }

    void check();
    return () => { cancelled = true; };
  }, []);

  const dismiss = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase
          .from("user_progress")
          .select("last_activity_date")
          .eq("user_id", user.id)
          .maybeSingle();
        localStorage.setItem(DISMISS_KEY, String(p?.last_activity_date ?? ""));
      }
    } catch { /* best effort */ }
    setOffer(null);
  };

  const repair = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("repair_streak");
      const result = data as { ok?: boolean } | null;
      if (!error && result?.ok) {
        setDone(true);
        // Give the user a beat to read the confirmation, then refresh
        // so streak/XP surfaces everywhere pick up the new state.
        setTimeout(() => window.location.reload(), 2500);
      } else {
        setOffer(null);
      }
    } catch {
      setOffer(null);
    } finally {
      setBusy(false);
    }
  };

  if (!offer) return null;

  return (
    <div
      role="dialog"
      aria-label="Restore your streak"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        top: 12,
        zIndex: 70,
        maxWidth: 460,
        margin: "0 auto",
        background: "var(--color-surface, #fff)",
        border: "2px solid #EFB343",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
      }}
    >
      {done ? (
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>
          Streak restored. Do a lesson today or it drops again.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>
            Your {offer.streak}-day streak broke.
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "4px 0 10px" }}>
            Restore it for {COST} XP (you have {Math.floor(offer.xp)}). This offer expires soon.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={repair}
              disabled={busy}
              style={{
                background: "var(--color-primary)", color: "#fff", border: "none",
                borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Restoring…" : `Restore for ${COST} XP`}
            </button>
            <button
              type="button"
              onClick={dismiss}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)",
              }}
            >
              Let it go
            </button>
          </div>
        </>
      )}
    </div>
  );
}
