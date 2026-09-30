import * as Sentry from "@sentry/nextjs";
import { installSignupEmailGuard } from "@/lib/handleEmailSignup";
import { sentryClientOptions } from "@/lib/sentryOptions";

Sentry.init(sentryClientOptions);

installSignupEmailGuard();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
