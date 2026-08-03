"use client";

import React from "react";
import { OnboardingView } from "@/components/views/OnboardingView";
import { supabase } from "@/lib/supabaseClient";
import { normalizeUsername, isUsernameAvailable, GOAL_COURSE_MAP } from "@/app/pageViews.types";
import { CONTENT_DATA, Lesson } from "@/data/content";
import { useNotho, NothoProvider } from "@/context/NothoContext";
import { useRouter } from "next/navigation";

function OnboardingContent() {
  const { setRoute, startLesson } = useNotho();
  const router = useRouter();

  const handleOnboardingComplete = async (payload: { goal?: string; ageRange?: string; goalDescription?: string; username: string }) => {
    localStorage.setItem("notho-onboarded", "true");
    if (payload.goal) localStorage.setItem("notho-user-goal", payload.goal);
    if (payload.goalDescription) localStorage.setItem("notho-goal-description", payload.goalDescription);
    if (payload.ageRange) localStorage.setItem("notho-age-range", payload.ageRange);
    localStorage.setItem("notho-username", payload.username);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const username = normalizeUsername(payload.username);
      const available = await isUsernameAvailable(username, user.id);
      if (!available) return;
      const row: Record<string, unknown> = { user_id: user.id };
      if (payload.goal) row.goal = payload.goal;
      if (payload.goalDescription) row.goal_description = payload.goalDescription;
      if (payload.ageRange) row.age_range = payload.ageRange;
      row.username = username;

      // Copy the name from signup metadata into the profile.
      //
      // Signup writes the name to auth.users metadata only (email signup via
      // options.data, OAuth via the provider). Nothing ever copied it into
      // `profiles`, so profiles.full_name stayed empty unless the person later
      // opened Profile or Settings and pressed save - which almost nobody does.
      //
      // Everything that greets someone by name reads profiles.full_name: the
      // welcome and milestone emails, the budget report, the leaderboard's
      // first-name fallback. They were all falling back to a username or
      // "there" for users whose name we knew perfectly well.
      //
      // Only fill a blank - never clobber a name the user typed themselves.
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

      if (row.goal ?? row.age_range ?? row.goal_description ?? row.username) {
        await supabase.from("profiles").upsert(row, { onConflict: "user_id" });
      }
      await supabase.from("user_progress").upsert({ user_id: user.id, display_name: username }, { onConflict: "user_id" });
    }
    
    // Fire welcome email (non-blocking) via the app's own route
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          await fetch("/api/welcome-email", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        }
      } catch { /* non-blocking */ }
    })();
    
    // Auto-launch the first lesson of the user's goal course
    const firstCourseId = payload.goal ? (GOAL_COURSE_MAP[payload.goal]?.[0] ?? null) : null;
    if (firstCourseId) {
      const goalCourse = CONTENT_DATA.courses.find((c) => c.id === firstCourseId);
      const firstLesson = goalCourse?.units?.[0]?.lessons?.[0];
      if (firstLesson) {
        startLesson(firstCourseId, firstLesson.id);
        return;
      }
    }
    
    setRoute({ name: "learn" });
  };

  return <OnboardingView onComplete={handleOnboardingComplete} />;
}

export default function OnboardingPage() {
  return (
    <NothoProvider>
      <OnboardingContent />
    </NothoProvider>
  );
}
