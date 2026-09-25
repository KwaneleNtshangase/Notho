import { describe, expect, it } from "vitest";
import { SHAKE_FORCE, createShakeState, feedShake } from "../shakeDetect";

function spike(state: ReturnType<typeof createShakeState>, t: number, magnitude = SHAKE_FORCE + 4) {
  feedShake(state, { x: 0, y: 0, z: 0, t });
  return feedShake(state, { x: magnitude, y: 0, z: 0, t: t + 90 });
}

describe("feedShake", () => {
  it("does not fire on a single jolt", () => {
    const state = createShakeState();
    expect(spike(state, 0)).toBe(false);
  });

  it("fires after three jolts inside the window", () => {
    const state = createShakeState();
    expect(spike(state, 0)).toBe(false);
    expect(spike(state, 200)).toBe(false);
    expect(spike(state, 400)).toBe(true);
  });

  it("ignores a walk-level wobble", () => {
    const state = createShakeState();
    expect(spike(state, 0, 8)).toBe(false);
    expect(spike(state, 200, 8)).toBe(false);
    expect(spike(state, 400, 8)).toBe(false);
  });

  it("cools down so one shake does not reopen the sheet", () => {
    const state = createShakeState();
    spike(state, 0);
    spike(state, 200);
    expect(spike(state, 400)).toBe(true);
    expect(spike(state, 600)).toBe(false);
    expect(spike(state, 800)).toBe(false);
  });
});
