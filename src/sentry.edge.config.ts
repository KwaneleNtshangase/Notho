import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions, sentryEnabled } from "@/lib/sentryOptions";

if (sentryEnabled) {
  Sentry.init(sentryBaseOptions);
}
