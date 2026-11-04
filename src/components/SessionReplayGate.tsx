"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useNotho } from "@/context/NothoContext";
import { useSessionReplayEnvKilled, POSTHOG_READY_EVENT } from "@/components/PostHogProvider";
import { isDeskPath, isPosthogLoaded, posthogKey } from "@/lib/posthogClient";
import { supabase } from "@/lib/supabaseClient";
import {
  REPLAY_FLAG_WAIT_MS,
  SESSION_REPLAY_FLAG,
  decideSessionReplay,
  flagAfterWait,
  interpretReplayFlag,
  type ReplayFlag,
} from "@/lib/sessionReplay";
import { startSessionReplayNow, stopSessionReplayNow } from "@/lib/sessionReplayControl";

/**
 * Starts a masked recording only after the signed-in learner's saved choice
 * is known and every kill switch allows it. Unmounting (sign-out, leaving
 * the app shell) stops the recorder.
 */
export function SessionReplayGate() {
  const pathname = usePathname() || "/";
  const { userId, userSettings } = useNotho();
  const envKilled = useSessionReplayEnvKilled();
  const [posthogReady, setPosthogReady] = useState(() => Boolean(posthogKey()) && isPosthogLoaded(posthog));
  const [flag, setFlag] = useState<ReplayFlag>("pending");

  useEffect(() => {
    if (posthogReady) return;
    const mark = () => {
      if (posthogKey() && isPosthogLoaded(posthog)) setPosthogReady(true);
    };
    mark();
    window.addEventListener(POSTHOG_READY_EVENT, mark);
    return () => window.removeEventListener(POSTHOG_READY_EVENT, mark);
  }, [posthogReady]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") stopSessionReplayNow();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!posthogReady) return;
    let cancelled = false;
    const apply = (_flags: string[], _variants: Record<string, string | boolean>, context?: { errorsLoading?: boolean }) => {
      if (cancelled) return;
      const value = posthog.isFeatureEnabled(SESSION_REPLAY_FLAG, { send_event: false });
      setFlag(interpretReplayFlag({
        value,
        errorsLoading: Boolean(context?.errorsLoading),
      }));
    };
    const unsubscribe = posthog.onFeatureFlags(apply);
    const timer = window.setTimeout(() => {
      if (!cancelled) setFlag((current) => flagAfterWait(current));
    }, REPLAY_FLAG_WAIT_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [posthogReady]);

  useEffect(() => {
    const decision = decideSessionReplay({
      signedIn: Boolean(userId),
      envKilled,
      localChoice: userSettings.replayLocalChoice,
      settingsSettled: userSettings.replaySettled,
      serverChoice: userSettings.replayServerChoice,
      serverFailed: userSettings.replayServerFailed,
      flag,
      posthogReady,
      blockedSurface: isDeskPath(pathname),
    });
    // Stop on every non-record decision, including "still waiting". stop is a
    // no-op when nothing is recording, and it closes the gap when the signed-in
    // user changes before the next choice has loaded.
    if (decision.record) startSessionReplayNow();
    else stopSessionReplayNow();
  }, [
    userId,
    envKilled,
    userSettings.replayLocalChoice,
    userSettings.replaySettled,
    userSettings.replayServerChoice,
    userSettings.replayServerFailed,
    flag,
    posthogReady,
    pathname,
  ]);

  useEffect(() => () => stopSessionReplayNow(), []);

  return null;
}
