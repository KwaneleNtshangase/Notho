import { describe, expect, it } from "vitest";

import {
  formatMockRemaining,
  remainingFromServerSample,
} from "@/lib/mockAttempts/time";

describe("mock-attempt timer", () => {
  it("advances a server sample from monotonic elapsed time", () => {
    const sample = { remainingSeconds: 7_200, receivedAtMonotonicMs: 10_000 };

    expect(remainingFromServerSample(sample, 10_999)).toBe(7_200);
    expect(remainingFromServerSample(sample, 12_100)).toBe(7_198);
  });

  it("never adds time for a backwards sample and clamps at zero", () => {
    const sample = { remainingSeconds: 2, receivedAtMonotonicMs: 10_000 };

    expect(remainingFromServerSample(sample, 5_000)).toBe(2);
    expect(remainingFromServerSample(sample, 20_000)).toBe(0);
  });

  it("formats the two-hour paper as an unambiguous clock", () => {
    expect(formatMockRemaining(7_200)).toBe("02:00:00");
    expect(formatMockRemaining(65)).toBe("00:01:05");
    expect(formatMockRemaining(-10)).toBe("00:00:00");
  });
});
