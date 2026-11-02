"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import { useState } from "react";
import { NothoFreeze } from "@/components/icons/NothoIcons";
import {
  STREAK_FREEZE_MAX,
  freezeBuyBlock,
  freezeBuyLabel,
  freezeStatusLine,
  type FreezePurchase,
} from "@/lib/streakFreeze";

export function StreakFreezeChip({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  const equipped = count > 0;
  return (
    <I18nElement as="button"
      type="button"
      onClick={onClick}
      className="streak-freeze-chip"
      aria-label={`${count} of ${STREAK_FREEZE_MAX} streak freezes equipped`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: equipped ? "rgba(59,130,246,0.12)" : "transparent",
        border: equipped ? "1px solid rgba(59,130,246,0.35)" : "1px solid var(--color-border)",
        borderRadius: 999,
        padding: "3px 8px 3px 6px",
        cursor: "pointer",
        color: equipped ? "#3B82F6" : "var(--color-text-secondary)",
      }}
    >
      <NothoFreeze size={16} style={{ color: equipped ? "#3B82F6" : "var(--color-text-secondary)" }} />
      <span style={{ fontWeight: 800, fontSize: 13, lineHeight: 1 }}><I18nText>{count}</I18nText>/<I18nText>{STREAK_FREEZE_MAX}</I18nText></span>
    </I18nElement>
  );
}

export function StreakFreezeBody({
  freezeCount,
  xp,
  lessonsToday,
  streak,
  signedIn = true,
  onBuy,
  compact = false,
}: {
  freezeCount: number;
  xp: number;
  lessonsToday: number;
  streak: number;
  signedIn?: boolean;
  onBuy?: () => Promise<FreezePurchase> | FreezePurchase;
  compact?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const block = freezeBuyBlock(freezeCount, xp, signedIn);
  const status = freezeStatusLine({ freezeCount, lessonsToday, streak });

  const buy = async () => {
    if (!onBuy || block !== "ok" || pending) return;
    setPending(true);
    setNote(null);
    try {
      const result = await onBuy();
      if (!result.ok) setNote(freezeBuyLabel(result.reason ?? "save_failed"));
      else setNote("Equipped. It applies on its own if you miss a day.");
    } catch {
      setNote("Could not save. Try again");
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={{ textAlign: compact ? "left" : "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: compact ? "flex-start" : "center", gap: 8, marginBottom: 8 }}>
        <NothoFreeze size={compact ? 22 : 28} style={{ color: freezeCount > 0 ? "#3B82F6" : "var(--color-text-secondary)" }} />
        <span style={{ fontWeight: 800, fontSize: compact ? 16 : 18, color: freezeCount > 0 ? "#3B82F6" : "var(--color-text-secondary)" }}><I18nText source={"{value0}/{value1} equipped"} values={[freezeCount, STREAK_FREEZE_MAX]} /></span>
      </div>
      <p style={{ fontSize: 13, color: lessonsToday > 0 ? "#22C55E" : "var(--color-text-secondary)", margin: "0 0 8px", lineHeight: 1.45, fontWeight: lessonsToday > 0 ? 700 : 500 }}>
        <I18nText>{status}</I18nText>
      </p>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.45 }}><I18nText source={"One freeze covers one missed day and does not add a day. Miss more days than you have equipped and the streak breaks. The freezes stay."} /></p>
      {onBuy && (
        <button
          type="button"
          className="streak-freeze-btn"
          onClick={() => void buy()}
          disabled={block !== "ok" || pending}
          style={{ marginTop: 0 }}
        >
          <I18nText>{pending ? "Equipping…" : freezeBuyLabel(block)}</I18nText>
        </button>
      )}
      {note && (
        <p style={{ fontSize: 12, margin: "8px 0 0", color: note.startsWith("Equipped") ? "#22C55E" : "#E03C31" }}><I18nText>{note}</I18nText></p>
      )}
    </div>
  );
}
