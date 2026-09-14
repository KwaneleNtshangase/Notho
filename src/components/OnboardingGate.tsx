"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  isOnboardingComplete,
  readLocalOnboarding,
} from "@/lib/onboardingRequired";

/**
 * Signed-in users cannot use the app until they have a unique username and
 * at least one money goal. Local "notho-onboarded" alone is not enough —
 * older accounts could skip the goal step.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const local = readLocalOnboarding();
      if (isOnboardingComplete(local)) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, goal")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      const identity = {
        username: profile?.username || local.username,
        goal: profile?.goal || local.goal,
      };

      if (isOnboardingComplete(identity)) {
        if (typeof window !== "undefined") {
          if (identity.username) {
            window.localStorage.setItem("notho-username", identity.username);
          }
          if (identity.goal) {
            window.localStorage.setItem("notho-user-goal", identity.goal);
          }
          window.localStorage.setItem("notho-onboarded", "true");
        }
        if (!cancelled) setReady(true);
        return;
      }

      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }
      if (!cancelled) setReady(true);
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready && pathname !== "/onboarding") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        Setting up your profile…
      </div>
    );
  }

  return <>{children}</>;
}
