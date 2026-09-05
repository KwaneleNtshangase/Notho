"use client";

import React from "react";

export type CosmoExpression = "default" | "thinking" | "sad" | "celebrating";

/** Letter mark for the Cosmo coach. Not a person. Expression is kept so
 *  existing call sites compile; the mark does not change face. */
export function CosmoCharacter({
  expression = "default",
  size = 100,
  style: extraStyle = {},
}: {
  expression?: CosmoExpression;
  size?: number;
  style?: React.CSSProperties;
}) {
  void expression;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label="Cosmo"
      role="img"
      style={{ display: "block", flexShrink: 0, ...extraStyle }}
    >
      <circle cx="32" cy="32" r="32" fill="#007A85" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="34"
        fontWeight="700"
        letterSpacing="-0.04em"
      >
        C
      </text>
    </svg>
  );
}
