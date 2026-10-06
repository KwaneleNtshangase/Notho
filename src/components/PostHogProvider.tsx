"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import { POSTHOG_PROXY_PATH, POSTHOG_UI_HOST, isPosthogLoaded, posthogKey } from "@/lib/posthogClient";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = posthogKey();
    if (!key || isPosthogLoaded(posthog)) return;
    posthog.init(key, {
      api_host: POSTHOG_PROXY_PATH,
      ui_host: POSTHOG_UI_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      disable_session_recording: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      session_recording: { maskAllInputs: true, maskTextSelector: "[data-private], .notho-private" },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, []);
  return <>{children}</>;
}
