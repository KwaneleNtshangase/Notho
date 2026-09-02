/**
 * Classify client error reports so the inbox only gets things a person can act on.
 */

export type ErrorClass = "noise" | "transient" | "actionable";
export type ErrorSeverity = "P1" | "P2" | "P3" | "P4";

export type ClassifiedError = {
  classification: ErrorClass;
  severity: ErrorSeverity;
  fingerprint: string;
  reason: string;
};

const ABORT_MESSAGE =
  /operation has been aborted|the operation was aborted|aborterror|registration aborted/i;

const NETWORK_BLIP =
  /^(a )?network error occurred\.?$|^failed to fetch$|^load failed$|^the internet connection appears to be offline\.?$|^networkerror when attempting to fetch resource\.?$/i;

const SW_REJECTED = /^rejected$/i;

const SW_LIFECYCLE =
  /failed to (update|register) a serviceworker|script \S+ load failed|sw\.js load failed/i;

const LOCK_STEAL = /lock broken by another request with the ['‘]steal['’] option/i;

const CHUNK_MESSAGE =
  /(failed to load chunk|loading chunk \S+ failed|chunkloaderror|failed to fetch dynamically imported module|importing a module script failed)/i;

export function errorFingerprint(area: string, message: string): string {
  const normalised = message
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "<url>")
    .replace(/\/_next\/static\/chunks\/\S+/g, "/_next/static/chunks/<chunk>")
    .replace(/dpl_[a-z0-9]+/gi, "<dpl>")
    .replace(/\bfrom module \d+\b/g, "from module <n>")
    .replace(/\d{2,}/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return `${area}:${normalised}`;
}

export function classifyClientError(area: string, message: string): ClassifiedError {
  const fingerprint = errorFingerprint(area, message);
  const text = message.trim();

  if (
    area === "sw-registration" &&
    (ABORT_MESSAGE.test(text) || SW_REJECTED.test(text) || SW_LIFECYCLE.test(text))
  ) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason:
        "Browser aborted or rejected service-worker registration (navigation, remount, bot, or unsupported context). Not a product defect.",
    };
  }

  if (SW_LIFECYCLE.test(text) || /serviceworker for scope/i.test(text)) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason: "Service-worker update/load failed. Next visit retries. Not a product defect.",
    };
  }

  if (LOCK_STEAL.test(text)) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason: "Supabase auth lock stolen by another tab. Harmless multi-tab race.",
    };
  }

  if (area === "chunk-load" || CHUNK_MESSAGE.test(text)) {
    return {
      classification: "transient",
      severity: "P3",
      fingerprint,
      reason:
        "Hashed chunk missed after a deploy or a dropped request. ErrorBoundary auto-reloads. Page the inbox only if this keeps firing after the new build is live.",
    };
  }

  if (area === "unhandledrejection" && NETWORK_BLIP.test(text)) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason: "Generic network blip with no stack that points at Notho code.",
    };
  }

  if (ABORT_MESSAGE.test(text)) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason: "DOM operation aborted because the document unloaded.",
    };
  }

  const high =
    area === "app-crash" ||
    area.startsWith("import-") ||
    area === "window.error";

  return {
    classification: "actionable",
    severity: high ? "P1" : "P2",
    fingerprint,
    reason: "Looks like application code, not a browser lifecycle event.",
  };
}

export function isBenignClientNoise(area: string, message: string): boolean {
  return classifyClientError(area, message).classification === "noise";
}

export const TRANSIENT_EMAIL_THRESHOLD = 8;

export function summariseUserAgent(ua: string): string {
  if (!ua) return "unknown client";
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  const safari = ua.match(/Version\/([\d.]+).*Safari/);
  const ios = ua.match(/iPhone OS ([\d_]+)/);
  const android = ua.match(/Android ([\d.]+)/);
  const win = /Windows NT/.test(ua);
  const mac = /Mac OS X/.test(ua);

  const browser = chrome
    ? `Chrome ${chrome[1]}`
    : safari
      ? `Safari ${safari[1]}`
      : "browser";
  const os = ios
    ? `iOS ${ios[1].replace(/_/g, ".")}`
    : android
      ? `Android ${android[1]}`
      : win
        ? "Windows"
        : mac
          ? "macOS"
          : "unknown OS";
  return `${browser} on ${os}`;
}
