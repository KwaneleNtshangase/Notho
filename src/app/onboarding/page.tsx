"use client";

import React from "react";
import { OnboardingView } from "@/components/views/OnboardingView";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";
import { normalizeUsername, isUsernameAvailable, GOAL_COURSE_MAP } from "@/app/pageViews.types";
import { persistLocalOnboarding } from "@/lib/onboardingRequired";
import { CONTENT_DATA } from "@/data/content";
import { useNotho, NothoProvider } from "@/context/NothoContext";

function OnboardingContent() {
  const { setRoute, startLesson } = useNotho();

  const handleOnboardingComplete = async (payload: {
    goal?: string;
    goals?: string[];
    ageRange?: string;
    goalDescription?: string;
    username: string;
  }) => {
    const goals = (payload.goals?.length ? payload.goals : payload.goal ? [payload.goal] : [])
      .map((g) => g.trim())
      .filter(Boolean);
    const primaryGoal = goals[0];
    const username = normalizeUsername(payload.username);
    if (!username) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const available = await isUsernameAvailable(username, user.id);
      if (!available) return;
      const row: Record<string, unknown> = { user_id: user.id, username };
      if (primaryGoal) row.goal = primaryGoal;
      if (payload.goalDescription) row.goal_description = payload.goalDescription;
      if (payload.ageRange) row.age_range = payload.ageRange;

      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const metaName = ["full_name", "name", "display_name"]
        .map((k) => (typeof meta[k] === "string" ? (meta[k] as string).trim() : ""))
        .find((v) => v.length > 0);
      if (metaName) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!(existing as { full_name?: string } | null)?.full_name?.trim()) {
          row.full_name = metaName;
        }
      }

      await supabase.from("profiles").upsert(row, { onConflict: "user_id" });
      await supabase.from("user_progress").upsert({ user_id: user.id, display_name: username }, { onConflict: "user_id" });
    }

    persistLocalOnboarding({
      username,
      goal: primaryGoal,
      goals,
      goalDescription: payload.goalDescription,
    });
    if (payload.ageRange) localStorage.setItem("notho-age-range", payload.ageRange);

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          await fetch("/api/welcome-email", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        }
      } catch { /* non-blocking */ }
    })();

    if (primaryGoal) {
      const firstCourseId = GOAL_COURSE_MAP[primaryGoal]?.[0] ?? null;
      if (firstCourseId) {
        const goalCourse = CONTENT_DATA.courses.find((c) => c.id === firstCourseId);
        const firstLesson = goalCourse?.units?.[0]?.lessons?.[0];
        if (firstLesson) {
          startLesson(firstCourseId, firstLesson.id);
          return;
        }
      }
    }

    setRoute({ name: "learn" });
  };

  return <OnboardingView onComplete={handleOnboardingComplete} />;
}

export default function OnboardingPage() {
  return (
    <NothoProvider>
      <AuthGate>
        <OnboardingContent />
      </AuthGate>
    </NothoProvider>
  );
}
