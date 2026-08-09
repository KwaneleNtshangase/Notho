"use client";

/**
 * UsageTracker
 *
 * Mounts the session heartbeat for the whole app and keeps it told about which
 * screen the user is on. Renders nothing.
 *
 * Sits inside AppLayout rather than the root layout on purpose: the root layout
 * also wraps the marketing/legal pages, and counting time on the privacy policy
 * as app engagement would flatter the numbers we plan to show funders.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  startUsageTracking,
  setUsageRoute,
  resetUsageIdentity,
} from "@/lib/usageTracking";
import { supabase } from "@/lib/supabaseClient";

export function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const stop = startUsageTracking();

    // Sign-in and sign-out both invalidate the cached user id. Without this a
    // shared device would attribute the second person's time to the first.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        resetUsageIdentity();
      }
    });

    return () => {
      stop();
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setUsageRoute(pathname || "/");
  }, [pathname]);

  return null;
}
