"use client";

import React from "react";

export type CosmoExpression = "default" | "thinking" | "sad" | "celebrating";

/** Kept so existing call sites compile. Renders nothing — Cosmo is a name
 *  inside Budget, not a mascot on lesson complete. */
export function CosmoCharacter({
  expression = "default",
}: {
  expression?: CosmoExpression;
  size?: number;
  style?: React.CSSProperties;
}) {
  void expression;
  return null;
}
