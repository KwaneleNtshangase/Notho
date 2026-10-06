"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import {
  POSTHOG_PROXY_PATH,
  POSTHOG_UI_HOST,
  isPosthogLoaded,
  posthogKey,
} from "@/lib/posthogClient";

/**
 * Starts PostHog once per tab when NEXT_PUBLIC_POSTHOG_KEY is set.
 * Without the key this is a no-op, so the branch can merge before the
 * PostHog project exists.
 *
 * Session replay stays off. Budget statements, Cosmo and profile fields
 * are on screen and must not leave the device as video.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = posthogKey();
    if (!key) return;
    if (isPosthogLoaded(posthog)) return;

    posthog.init(key, {
      api_host: POSTHOG_PROXY_PATH,
      ui_host: POSTHOG_UI_HOST,
      defaults: "2026-05-30",
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      disable_session_recording: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-private], .notho-private",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, []);

  return <>{children}</>;
}
