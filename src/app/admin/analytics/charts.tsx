"use client";

/**
 * Thin theming layer over recharts.
 *
 * Recharts wants literal colour strings, not CSS variables, so every chart here
 * reads the palette through usePalette() and re-renders when the theme flips.
 * The formatter helpers exist because recharts types its tooltip callbacks
 * against a union including undefined and arrays - accurate, but unusable at
 * every call site. The cast is absorbed once, here.
 */

import React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { usePalette, type Palette } from "./theme";

export function axis(p: Palette) {
  return { fontSize: 11, fill: p.muted } as const;
}

export function tooltipStyle(p: Palette) {
  return {
    contentStyle: {
      borderRadius: 12,
      border: `1px solid ${p.border}`,
      background: p.surface,
      color: p.ink,
      fontSize: 12.5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
    },
    labelStyle: { color: p.muted, fontWeight: 700, marginBottom: 4 },
    itemStyle: { color: p.ink },
    cursor: { fill: p.grid },
  };
}

type TooltipProps = React.ComponentProps<typeof Tooltip>;
export type RcFormatter = NonNullable<TooltipProps["formatter"]>;
export type RcLabelFormatter = NonNullable<TooltipProps["labelFormatter"]>;

/** Formats a tooltip value, optionally overriding the series name. */
export function valueFormatter(fn: (n: number) => string, forceName?: string): RcFormatter {
  return ((value: unknown, name: unknown) => [
    fn(Number(value ?? 0)),
    forceName ?? String(name ?? ""),
  ]) as RcFormatter;
}

/** Formats a tooltip's heading (the x-axis value). */
export function labelFormatter(fn: (s: string) => string): RcLabelFormatter {
  return ((label: unknown) => fn(String(label ?? ""))) as RcLabelFormatter;
}

export function Frame({ height, children }: { height: number; children: React.ReactElement }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}

/** Convenience: the themed <Tooltip/> with sensible defaults already applied. */
export function ThemedTooltip(props: Partial<TooltipProps>) {
  const p = usePalette();
  return <Tooltip {...tooltipStyle(p)} {...props} />;
}
