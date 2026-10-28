import { delta } from "./lib";

/**
 * Below this sample size a percentage delta is theatre. Pulse hides ▲100%
 * until a window has enough people that one extra friend cannot double the
 * headline.
 */
export const EARLY_N = 30;

export function honestDelta(
  current: number,
  previous: number,
  sample = Math.max(current, previous)
): { pct: number | null; dir: "up" | "down" | "flat" } {
  if (sample < EARLY_N) return { pct: null, dir: "flat" };
  return delta(current, previous);
}
