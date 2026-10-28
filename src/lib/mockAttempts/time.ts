export type ServerTimeSample = {
  remainingSeconds: number;
  /** performance.now() captured when the server value was received. */
  receivedAtMonotonicMs: number;
};

/** Advances a server sample without trusting the device wall clock. */
export function remainingFromServerSample(
  sample: ServerTimeSample,
  monotonicNowMs: number
): number {
  const elapsed = Math.max(
    0,
    Math.floor((monotonicNowMs - sample.receivedAtMonotonicMs) / 1000)
  );
  return Math.max(0, Math.floor(sample.remainingSeconds) - elapsed);
}

export function formatMockRemaining(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}
