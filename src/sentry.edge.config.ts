import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentryOptions";

Sentry.init(sentryBaseOptions);
