/**
 * Shared Sentry init for client, Node, and Edge.
 *
 * No DSN → Sentry is a no-op. Production can ship this branch before the
 * Sentry project exists; flip it on by setting NEXT_PUBLIC_SENTRY_DSN.
 *
 * Session Replay stays off. Budget statements, Cosmo threads and profile
 * fields are on screen, and POPIA does not want those in a third-party video.
 */
import type { BrowserOptions } from "@sentry/nextjs";
import { sentryBeforeSend } from "./sentryFilter";

const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || undefined;

const environment =
  process.env.VERCEL_ENV || process.env.NODE_ENV || "development";

const release =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID;

const tracesSampleRate =
  environment === "production" ? 0.05 : environment === "preview" ? 0.2 : 0;

export const sentryBaseOptions: BrowserOptions = {
  dsn,
  environment,
  release,
  enabled: Boolean(dsn),
  sendDefaultPii: false,
  tracesSampleRate,
  beforeSend: sentryBeforeSend,
  ignoreErrors: [
    "ResizeObserver loop",
    /^Script error\. ?$/,
    "Non-Error promise rejection captured",
  ],
};

export const sentryClientOptions = sentryBaseOptions;
