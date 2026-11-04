"use client";
import { LocalizedText as I18nText } from "@/i18n/LocalizedText";

import posthog from "posthog-js";
import { createContext, useContext, useEffect } from "react";
import { POSTHOG_PROXY_PATH, POSTHOG_UI_HOST, isPosthogLoaded, posthogKey } from "@/lib/posthogClient";
import { isReplayEnvKilled, sanitizePosthogProperties, sessionRecordingConfig } from "@/lib/sessionReplay";

const ReplayEnvContext = createContext(false);

export function useSessionReplayEnvKilled(): boolean {
  const fromServer = useContext(ReplayEnvContext);
  return (
    fromServer ||
    isReplayEnvKilled({
      NEXT_PUBLIC_POSTHOG_SESSION_REPLAY: process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY,
    })
  );
}

export const POSTHOG_READY_EVENT = "notho-posthog-ready";

/**
 * Recording stays off until SessionReplayGate calls startSessionRecording.
 * Signed-out pages therefore never record, even though PostHog itself loads
 * here for product analytics.
 */
export function PostHogProvider({
  children,
  replayKilled = false,
}: {
  children: React.ReactNode;
  replayKilled?: boolean;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = posthogKey();
    if (!key || isPosthogLoaded(posthog)) {
      if (key && isPosthogLoaded(posthog)) {
        window.dispatchEvent(new Event(POSTHOG_READY_EVENT));
      }
      return;
    }
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
      enable_recording_console_log: false,
      property_denylist: ["email", "$email", "name", "$name", "username", "full_name", "phone"],
      sanitize_properties: (properties) => sanitizePosthogProperties(properties),
      session_recording: sessionRecordingConfig,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
        window.dispatchEvent(new Event(POSTHOG_READY_EVENT));
      },
    });
  }, []);
  return (
    <ReplayEnvContext.Provider value={replayKilled}>
      <I18nText>{children}</I18nText>
    </ReplayEnvContext.Provider>
  );
}
