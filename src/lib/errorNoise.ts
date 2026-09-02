/**
 * Classify client error reports so the inbox only gets things a person can act on.
 *
 * The public /api/errors/report endpoint emails every stored row. That is the
 * right default for a real crash. It is the wrong default for:
 *
 *   - Service worker registration aborted because the tab navigated or React
 *     Strict Mode remounted the registrar. Chrome surfaces this as
 *     DOMException AbortError / "Operation has been aborted".
 *   - A hashed Next chunk that 404'd after a deploy while a tab was still on
 *     the previous build. ErrorBoundary already reloads the page.
 *   - Generic "network error" / "Failed to fetch" unhandledrejections from a
 *     dropped mobile radio.
 *
 * Those still happen. They are not product defects. Treating them as bugs
 * trains the founder to ignore the inbox.
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

/** Stable-ish id so repeats of the same fault group together. */
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

  if (area === "sw-registration" && (ABORT_MESSAGE.test(text) || SW_REJECTED.test(text))) {
    return {
      classification: "noise",
      severity: "P4",
      fingerprint,
      reason:
        "Browser aborted or rejected service-worker registration (navigation, remount, or unsupported context). Not a product defect.",
    };
  }

  if (area === "chunk-load") {
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

/** How many transient hits in 24h before we treat the wave as worth an email. */
export const TRANSIENT_EMAIL_THRESHOLD = 8;

/** Pull a short client label out of a UA string for the alert email. */
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
