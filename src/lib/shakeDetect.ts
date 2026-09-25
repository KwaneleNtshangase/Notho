/**
 * Device-motion shake detector.
 *
 * Tuned for a deliberate phone shake (Instagram-style), not a tap or a walk.
 * Pure functions so the threshold can be unit-tested without sensors.
 */

export const SHAKE_FORCE = 22;
export const SHAKE_SAMPLE_MS = 80;
export const SHAKE_WINDOW_MS = 900;
export const SHAKE_HITS = 3;
export const SHAKE_COOLDOWN_MS = 2500;

export type ShakeSample = {
  x: number;
  y: number;
  z: number;
  t: number;
};

export type ShakeState = {
  last: ShakeSample | null;
  hits: number[];
  lastFire: number;
};

export function createShakeState(): ShakeState {
  return { last: null, hits: [], lastFire: 0 };
}

function force(a: ShakeSample, b: ShakeSample): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

/** Feed one accelerometer reading. Returns true when a shake just fired. */
export function feedShake(state: ShakeState, sample: ShakeSample): boolean {
  const prev = state.last;
  if (!prev) {
    state.last = sample;
    return false;
  }
  if (sample.t - prev.t < SHAKE_SAMPLE_MS) return false;

  const hit = force(sample, prev) >= SHAKE_FORCE;
  state.last = sample;
  if (!hit) return false;

  state.hits.push(sample.t);
  const cutoff = sample.t - SHAKE_WINDOW_MS;
  state.hits = state.hits.filter((t) => t >= cutoff);

  if (state.hits.length < SHAKE_HITS) return false;
  if (sample.t - state.lastFire < SHAKE_COOLDOWN_MS) return false;

  state.hits = [];
  state.lastFire = sample.t;
  return true;
}
