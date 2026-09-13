"use client";

import { useEffect, useState } from "react";
import {
  persistTextScale,
  readTextScale,
  TEXT_SCALE_LABEL,
  TEXT_SCALES,
  type TextScale,
} from "@/lib/textScale";

export function TextSizeControl() {
  const [textScale, setTextScale] = useState<TextScale>("system");

  useEffect(() => {
    setTextScale(readTextScale());
  }, []);

  const handleTextScale = (next: TextScale) => {
    setTextScale(next);
    persistTextScale(next);
  };

  return (
    <div style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: 16, width: 18, textAlign: "center" }}>Aa</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Text size</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            System follows iPhone Display &amp; Text Size and Per-App Settings
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TEXT_SCALES.map((scale) => (
          <button
            key={scale}
            type="button"
            onClick={() => handleTextScale(scale)}
            aria-pressed={textScale === scale}
            style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "1.5px solid",
              borderColor: textScale === scale ? "var(--color-primary)" : "var(--color-border)",
              background: textScale === scale ? "var(--color-primary)" : "transparent",
              color: textScale === scale ? "white" : "var(--color-text-secondary)",
              transition: "all 0.15s",
            }}
          >{TEXT_SCALE_LABEL[scale]}</button>
        ))}
      </div>
    </div>
  );
}
