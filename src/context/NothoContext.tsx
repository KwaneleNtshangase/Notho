"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useNothoState as useNothoStateInternal } from "@/hooks/useNothoState";
import type { NothoState } from "@/hooks/useNothoState";
import type { Route } from "@/app/pageViews.types";
import { RE5_COURSE_ID, isRe5MockExam } from "@/lib/results/re5";

export const NothoContext = createContext<NothoState | null>(null);

export function NothoProvider({ children }: { children: React.ReactNode }) {
  const state = useNothoStateInternal();
  const router = useRouter();
  
  // Intercept setRoute to use Next.js routing instead of just updating local state
  const setRoute = React.useCallback(
    (newRouteAction: React.SetStateAction<Route>) => {
      // Evaluate if it's a function update
      const newRoute =
        typeof newRouteAction === "function"
          ? newRouteAction(state.route)
          : newRouteAction;

      // Ensure the actual state gets updated so components re-render if they rely on it
      state.setRoute(newRoute);

      // Perform router navigation based on the route
      switch (newRoute.name) {
        case "learn":
          router.push("/learn");
          break;
        case "budget":
          router.push("/budget");
          break;
        case "quests":
          router.push("/quests");
          break;
        case "calculator":
          router.push("/calculator");
          break;
        case "profile":
          router.push("/profile");
          break;
        case "leaderboard":
          router.push("/leaderboard");
          break;
        case "settings":
          router.push("/settings");
          break;
        case "course":
          if (newRoute.courseId) router.push(`/course/${newRoute.courseId}`);
          break;
        case "lesson":
          if (newRoute.courseId && newRoute.lessonId) {
            router.push(`/lesson/${newRoute.courseId}/${newRoute.lessonId}`);
          }
          break;
        case "onboarding":
          router.push("/onboarding");
          break;
        default:
          router.push("/learn");
          break;
      }
    },
    [router, state]
  );

  // Wrap startLesson so it uses Next.js routing after setting up lesson state.
  // The raw startLesson in useNothoState intentionally does NOT call setRoute
  // (it used to call the raw useState setter which was the navigation bug).
  // This wrapper handles both state update and router.push on success.
  const startLesson = React.useCallback(
    (courseId: string, lessonId: string): boolean => {
      // Secure RE5 mocks are created only after the dedicated page reaches the
      // authenticated server API. They deliberately have no client lesson
      // steps to initialise here.
      if (courseId === RE5_COURSE_ID && isRe5MockExam(lessonId)) {
        state.setRoute({ name: "lesson", courseId, lessonId });
        router.push(`/lesson/${courseId}/${lessonId}`);
        return true;
      }
      const ok = state.startLesson(courseId, lessonId);
      if (ok) {
        state.setRoute({ name: "lesson", courseId, lessonId });
        router.push(`/lesson/${courseId}/${lessonId}`);
      }
      return ok;
    },
    [router, state]
  );

  const value = React.useMemo(() => ({
    ...state,
    setRoute,
    startLesson,
  }), [state, setRoute, startLesson]);

  return (
    <NothoContext.Provider value={value}>
      {children}
    </NothoContext.Provider>
  );
}

export function useNotho() {
  const context = useContext(NothoContext);
  if (!context) {
    throw new Error("useNotho must be used within a NothoProvider");
  }
  return context;
}
