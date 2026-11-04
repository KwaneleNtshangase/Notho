/**
 * Shared Sentry init for client, Node, and Edge.
 *
 * No DSN → callers skip Sentry.init, so nothing is sent. Production can
 * ship this before a Sentry project exists. Set NEXT_PUBLIC_SENTRY_DSN
 * (browser and server) or SENTRY_DSN (server fallback). Blank values count
 * as unset. Nothing in this file is a hardcoded DSN.
 *
 * Session Replay stays off. Budget statements, Cosmo threads and profile
 * fields are on screen, and POPIA does not want those in a third-party video.
 */
import type { BrowserOptions, ErrorEvent, EventHint } from "@sentry/nextjs";
import { sentryBeforeSend } from "./sentryFilter";

/** Public browser DSN, with a server-only fallback. Blank values count as unset. */
export function readSentryDsn(
  env: Record<string, string | undefined> = process.env
): string | undefined {
  const raw = env.NEXT_PUBLIC_SENTRY_DSN || env.SENTRY_DSN || "";
  const dsn = raw.trim();
  return dsn.length > 0 ? dsn : undefined;
}

const dsn = readSentryDsn();

const environment =
  process.env.VERCEL_ENV || process.env.NODE_ENV || "development";

const release =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID;

const tracesSampleRate =
  environment === "production" ? 0.05 : environment === "preview" ? 0.2 : 0;

function beforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
  return sentryBeforeSend(event, hint) as ErrorEvent | null;
}

/** False when neither DSN env var is set. Callers must skip Sentry.init. */
export const sentryEnabled = Boolean(dsn);

export const sentryBaseOptions: BrowserOptions = {
  dsn,
  environment,
  release,
  enabled: sentryEnabled,
  sendDefaultPii: false,
  tracesSampleRate,
  beforeSend,
  ignoreErrors: [
    "ResizeObserver loop",
    /^Script error\. ?$/,
    "Non-Error promise rejection captured",
  ],
};

export const sentryClientOptions = sentryBaseOptions;
