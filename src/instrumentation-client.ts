import * as Sentry from "@sentry/nextjs";
import { installSignupEmailGuard } from "@/lib/handleEmailSignup";
import { sentryClientOptions, sentryEnabled } from "@/lib/sentryOptions";

if (sentryEnabled) {
  Sentry.init(sentryClientOptions);
}

installSignupEmailGuard();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
