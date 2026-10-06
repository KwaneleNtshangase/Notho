"use client";

/**
 * UsageTracker
 *
 * Mounts the session heartbeat for the whole app and keeps it told about which
 * screen the user is on. Also identifies the learner to PostHog (user id only)
 * and records pageviews, including instant-tab switches that update the URL
 * after the pane is already visible.
 *
 * Renders nothing. Sits inside AppLayout rather than the root layout on
 * purpose: the root layout also wraps the marketing/legal pages, and counting
 * time on the privacy policy as app engagement would flatter the numbers we
 * plan to show funders.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import {
  startUsageTracking,
  setUsageRoute,
  resetUsageIdentity,
} from "@/lib/usageTracking";
import { supabase } from "@/lib/supabaseClient";
import { APP_TAB_EVENT } from "@/lib/appTabs";
import {
  identifyProperties,
  isPosthogLoaded,
  pageviewPath,
  posthogKey,
} from "@/lib/posthogClient";
import { analytics } from "@/lib/analytics";

function capturePage(path: string | null) {
  if (!path) return;
  if (!posthogKey()) return;
  try {
    if (!isPosthogLoaded(posthog)) return;
    posthog.capture("$pageview", { $current_url: path });
    analytics.pageViewed(path);
  } catch {
    /* ignore */
  }
}

function identifyUser(
  user: { id: string; user_metadata?: Record<string, unknown> } | null
) {
  if (!posthogKey()) return;
  try {
    if (!isPosthogLoaded(posthog)) return;
    if (!user) {
      posthog.reset();
      return;
    }
    const username =
      (typeof user.user_metadata?.username === "string"
        ? user.user_metadata.username
        : null) ??
      (typeof user.user_metadata?.notho_username === "string"
        ? user.user_metadata.notho_username
        : null);
    posthog.identify(
      user.id,
      identifyProperties({ userId: user.id, username, platform: "web" })
    );
  } catch {
    /* ignore */
  }
}

export function UsageTracker() {
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    const stop = startUsageTracking();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        resetUsageIdentity();
        identifyUser(session?.user ?? null);
      }
    });

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) identifyUser(data.user);
    });

    return () => {
      stop();
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setUsageRoute(pathname || "/");
    const path = pageviewPath(pathname);
    if (path && path !== lastPage.current) {
      lastPage.current = path;
      capturePage(path);
    }
  }, [pathname]);

  useEffect(() => {
    const onTab = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      const path = pageviewPath(href);
      if (path && path !== lastPage.current) {
        lastPage.current = path;
        setUsageRoute(path);
        capturePage(path);
      }
    };
    window.addEventListener(APP_TAB_EVENT, onTab);
    return () => window.removeEventListener(APP_TAB_EVENT, onTab);
  }, []);

  return null;
}
