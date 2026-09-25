"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  hasValidUsername,
  isOnboardingComplete,
  readLocalOnboarding,
} from "@/lib/onboardingRequired";

/**
 * Signed-in users cannot use the app without a unique username.
 * First-time accounts also need at least one money goal.
 * Returning accounts that already used the app can skip the goal.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const local = readLocalOnboarding();
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

      const createdAt = Date.parse(data.session.user.created_at || "");
      const accountIsOld =
        Number.isFinite(createdAt) && Date.now() - createdAt > 60 * 60 * 1000;
      const returning = Boolean(
        local.onboarded || profile?.username || profile?.goal || accountIsOld,
      );
      const complete = isOnboardingComplete(identity, {
        requireGoal: !returning,
      });

      if (complete && hasValidUsername(identity)) {
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
        const qs = returning ? "?returning=1" : "";
        router.replace(`/onboarding${qs}`);
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
