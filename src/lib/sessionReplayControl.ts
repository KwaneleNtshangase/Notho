import posthog from "posthog-js";
import { isPosthogLoaded, posthogKey } from "@/lib/posthogClient";

function clientReady(): boolean {
  return typeof window !== "undefined" && Boolean(posthogKey()) && isPosthogLoaded(posthog);
}

/** Stop the recorder in this turn. Safe to call when nothing is recording. */
export function stopSessionReplayNow(): void {
  if (!clientReady()) return;
  try {
    posthog.stopSessionRecording();
  } catch {
    /* analytics must not break the settings toggle */
  }
}

/**
 * Start one recording and ignore a project sample rate below 100%.
 * Our own gates (sign-in, opt-out, env, flag) have already passed.
 */
export function startSessionReplayNow(): void {
  if (!clientReady()) return;
  try {
    posthog.startSessionRecording({ sampling: true });
  } catch {
    /* ignore */
  }
}
