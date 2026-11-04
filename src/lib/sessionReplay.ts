/**
 * PostHog session replay policy for Notho.
 *
 * Recordings are for internal product use. They are mask-first: every input
 * and text node is masked, and images, canvas, and video are blocked. Network
 * bodies and headers are not recorded. Console logs are not recorded.
 *
 * Who gets recorded
 * - Signed-in learners only, and only after their saved choice is known.
 * - Signed-out pages never start a recording. A local or server opt-out calls
 *   stop and refuses to start.
 * - Default is on. A missing user_settings row means on.
 *
 * Kill switches (either one stops everyone)
 * - Hard env: POSTHOG_SESSION_REPLAY or NEXT_PUBLIC_POSTHOG_SESSION_REPLAY
 *   set to "off" / "false" / "0" / "disabled". The server variable is read on
 *   each request. The NEXT_PUBLIC one is baked in at build time.
 * - PostHog flag `session-replay-enabled`. An explicit false stops recording.
 *   If the flag is missing or the flags request fails, recording stays allowed
 *   because the env kill switch above still exists. Create the flag and set it
 *   to 0% (value false) to stop recording without a deploy. Deleting the flag
 *   does not stop recording.
 *
 * Sample rate is 1 (100%) in the SDK. Project settings must also have Session
 * Replay enabled, or PostHog will refuse to start the recorder.
 */

export const SESSION_REPLAY_FLAG = "session-replay-enabled";

/** How long to wait for flags before treating them as unavailable. */
export const REPLAY_FLAG_WAIT_MS = 4_000;

/** 100% of sessions that pass the gates above. */
export const SESSION_REPLAY_SAMPLE_RATE = 1;

export const SESSION_REPLAY_STORAGE_PREFIX = "notho-session-replay:";

/**
 * Blocked in the recording, not merely masked. Statement images, chart
 * canvases, and video must not leave the device.
 */
export const SESSION_REPLAY_BLOCK_SELECTOR = "img, image, picture, svg, canvas, video";

const KILL_VALUES = new Set(["0", "false", "off", "disabled", "no"]);

const BLOCKED_PERSON_KEYS = new Set([
  "email",
  "name",
  "fullname",
  "firstname",
  "lastname",
  "username",
  "phone",
  "telephone",
  "mobile",
]);

export const PERSON_PROPERTIES_TO_UNSET = [
  "email",
  "$email",
  "name",
  "$name",
  "username",
  "full_name",
  "fullName",
  "first_name",
  "firstName",
  "last_name",
  "lastName",
  "phone",
] as const;

export type ReplayChoice = "on" | "off";

export type ReplayFlag = "pending" | "on" | "off" | "unavailable";

export type ReplayDecisionInput = {
  signedIn: boolean;
  envKilled: boolean;
  localChoice: ReplayChoice | null;
  settingsSettled: boolean;
  serverChoice: ReplayChoice | null;
  serverFailed: boolean;
  flag: ReplayFlag;
  posthogReady: boolean;
  blockedSurface: boolean;
};

export type ReplayDecision = {
  record: boolean;
  /** Call stopSessionRecording now. Pending states hold instead. */
  stop: boolean;
  reason: string;
};

export function replayStorageKey(userId: string): string {
  return `${SESSION_REPLAY_STORAGE_PREFIX}${userId}`;
}

export function readReplayChoice(raw: string | null | undefined): ReplayChoice | null {
  if (raw == null) return null;
  const value = raw.trim().toLowerCase();
  if (value === "off" || value === "false" || value === "0") return "off";
  if (value === "on" || value === "true" || value === "1") return "on";
  return null;
}

export function readLocalReplayChoice(
  storage: Pick<Storage, "getItem">,
  userId: string
): ReplayChoice | null {
  try {
    return readReplayChoice(storage.getItem(replayStorageKey(userId)));
  } catch {
    return null;
  }
}

export function writeLocalReplayChoice(
  storage: Pick<Storage, "setItem">,
  userId: string,
  choice: ReplayChoice
): void {
  storage.setItem(replayStorageKey(userId), choice);
}

export function choiceFromServer(value: boolean | null | undefined): ReplayChoice {
  return value === false ? "off" : "on";
}

export function isReplayEnvKilled(env: Record<string, string | undefined>): boolean {
  for (const key of ["POSTHOG_SESSION_REPLAY", "NEXT_PUBLIC_POSTHOG_SESSION_REPLAY"]) {
    const raw = env[key];
    if (raw == null) continue;
    if (KILL_VALUES.has(raw.trim().toLowerCase())) return true;
  }
  return false;
}

export function interpretReplayFlag(input: {
  value: boolean | string | undefined | null;
  errorsLoading: boolean;
}): Exclude<ReplayFlag, "pending"> {
  if (input.value === false || input.value === "false") return "off";
  if (input.value === true || input.value === "true") return "on";
  if (input.errorsLoading || input.value == null) return "unavailable";
  return "unavailable";
}

export function flagAfterWait(current: ReplayFlag): ReplayFlag {
  return current === "pending" ? "unavailable" : current;
}

/**
 * Turning recording off must stop the recorder in the same turn, before the
 * settings write returns.
 */
export function replayToggleStopsImmediately(nextEnabled: boolean): boolean {
  return nextEnabled === false;
}

export function decideSessionReplay(input: ReplayDecisionInput): ReplayDecision {
  const stop = (reason: string): ReplayDecision => ({ record: false, stop: true, reason });
  const hold = (reason: string): ReplayDecision => ({ record: false, stop: false, reason });
  const start = (reason: string): ReplayDecision => ({ record: true, stop: false, reason });

  if (!input.signedIn) return stop("signed-out");
  if (input.blockedSurface) return stop("blocked-surface");
  if (input.envKilled) return stop("env-kill-switch");
  if (input.localChoice === "off") return stop("local-opt-out");
  if (!input.settingsSettled) return hold("settings-pending");
  if (input.serverChoice === "off") return stop("server-opt-out");
  if (!input.serverFailed && input.serverChoice !== "on") return hold("settings-pending");
  if (!input.posthogReady) return hold("posthog-not-ready");
  if (input.flag === "pending") return hold("flag-pending");
  if (input.flag === "off") return stop("flag-off");
  return start(input.flag === "on" ? "record" : "record-flag-unavailable");
}

function normalisePersonKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isBlockedPersonKey(key: string): boolean {
  return BLOCKED_PERSON_KEYS.has(normalisePersonKey(key));
}

/**
 * Drop email, name, and username from any property bag, including the $set
 * objects PostHog attaches to identify calls. Email-shaped strings on other
 * keys are dropped too.
 */
export function scrubPersonProperties(
  properties: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!properties) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isBlockedPersonKey(key)) continue;
    if (key === "$set" || key === "$set_once") {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        out[key] = scrubPersonProperties(value as Record<string, unknown>);
      }
      continue;
    }
    if (typeof value === "string" && value.includes("@")) continue;
    out[key] = value;
  }
  return out;
}

export function identifyProperties(input: {
  userId?: string;
  username?: string | null;
  email?: string | null;
  name?: string | null;
  platform?: "web" | "ios" | "android" | "pwa";
}): Record<string, string> {
  const scrubbed = scrubPersonProperties({
    platform: input.platform,
    username: input.username,
    email: input.email,
    name: input.name,
  });
  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(scrubbed)) {
    if (typeof value === "string" && value.length > 0 && value.length <= 40) props[key] = value;
  }
  return props;
}

export function sanitizePosthogProperties(
  properties: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  return scrubPersonProperties(properties);
}

/** Query strings can carry tokens, emails, or amounts. Keep the path only. */
export function stripReplayUrl(raw: string): string {
  const withoutHash = raw.split("#")[0] ?? raw;
  const queryAt = withoutHash.indexOf("?");
  return queryAt === -1 ? withoutHash : withoutHash.slice(0, queryAt);
}

export type ReplayNetworkRequest = {
  name?: string;
  url?: string;
  requestHeaders?: unknown;
  responseHeaders?: unknown;
  requestBody?: unknown;
  responseBody?: unknown;
};

/**
 * Last line of defence if a project setting turns payload capture on.
 * Headers and bodies are removed. The URL query string is removed.
 */
export function scrubReplayNetworkRequest<T extends ReplayNetworkRequest>(request: T): T {
  const next = { ...request };
  delete next.requestHeaders;
  delete next.responseHeaders;
  next.requestBody = null;
  next.responseBody = null;
  if (typeof next.name === "string") next.name = stripReplayUrl(next.name);
  if (typeof next.url === "string") next.url = stripReplayUrl(next.url);
  return next;
}

export function maskReplayText(text: string): string {
  if (text.trim().length === 0) return text;
  return "*".repeat(Math.min(text.length, 12));
}

export const sessionRecordingConfig = {
  maskAllInputs: true,
  maskTextSelector: "*",
  maskTextFn: maskReplayText,
  maskInputFn: maskReplayText,
  blockSelector: SESSION_REPLAY_BLOCK_SELECTOR,
  recordHeaders: false,
  recordBody: false,
  sampleRate: SESSION_REPLAY_SAMPLE_RATE,
  captureCanvas: { recordCanvas: false },
  maskCapturedNetworkRequestFn: scrubReplayNetworkRequest,
} as const;
