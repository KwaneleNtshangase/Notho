/**
 * Drop the same noise the Desk inbox already ignores, then stamp the
 * classification so issues group the way /api/errors/report groups them.
 */
import { classifyClientError } from "./errorNoise";
import { isAutomatedUserAgent } from "./errorReportGuards";

type Primitive = string | number | boolean | null | undefined;

export type SentryLikeEvent = {
  message?: string;
  exception?: { values?: Array<{ value?: string; type?: string }> };
  tags?: Record<string, Primitive>;
  request?: { headers?: Record<string, string | undefined> };
  fingerprint?: string[];
};

type SentryLikeHint = {
  originalException?: unknown;
};

function eventMessage(event: SentryLikeEvent, hint: SentryLikeHint): string {
  const raw = hint.originalException;
  if (raw instanceof Error) return raw.message || raw.name;
  if (typeof raw === "string") return raw;
  const fromException = event.exception?.values?.[0]?.value;
  if (fromException) return fromException;
  return event.message ?? "";
}

function inferArea(message: string): string {
  if (/serviceworker|sw\.js/i.test(message)) return "sw-registration";
  if (
    /failed to load chunk|chunkloaderror|dynamically imported module|importing a module script failed/i.test(
      message
    )
  ) {
    return "chunk-load";
  }
  return "window.error";
}

export function sentryBeforeSend(
  event: SentryLikeEvent,
  hint: SentryLikeHint
): SentryLikeEvent | null {
  const headers = event.request?.headers ?? {};
  const ua = headers["User-Agent"] || headers["user-agent"] || "";
  if (isAutomatedUserAgent(ua)) return null;

  const message = eventMessage(event, hint);
  if (!message) return event;

  const taggedArea = event.tags?.["notho.area"];
  const area = typeof taggedArea === "string" ? taggedArea : inferArea(message);
  const classified = classifyClientError(area, message);

  if (classified.classification === "noise") return null;

  event.tags = {
    ...(event.tags ?? {}),
    "notho.area": area,
    "notho.classification": classified.classification,
    "notho.severity": classified.severity,
  };
  event.fingerprint = [classified.fingerprint];
  return event;
}
