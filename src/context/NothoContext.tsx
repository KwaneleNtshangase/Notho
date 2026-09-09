"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useNothoState as useNothoStateInternal } from "@/hooks/useNothoState";
import type { NothoState } from "@/hooks/useNothoState";
import type { Route } from "@/app/pageViews.types";
import { RE5_COURSE_ID, isRe5MockExam } from "@/lib/results/re5";
import { APP_TAB_HREFS, announceTab, hrefForRouteName } from "@/lib/appTabs";

export const NothoContext = createContext<NothoState | null>(null);

export function NothoProvider({ children }: { children: React.ReactNode }) {
  const state = useNothoStateInternal();
  const router = useRouter();

  React.useEffect(() => {
    for (const href of APP_TAB_HREFS) {
      try {
        router.prefetch(href);
      } catch {
        /* prefetch is best-effort */
      }
    }
  }, [router]);

  const setRoute = React.useCallback(
    (newRouteAction: React.SetStateAction<Route>) => {
      const newRoute =
        typeof newRouteAction === "function"
          ? newRouteAction(state.route)
          : newRouteAction;

      state.setRoute(newRoute);

      const tabHref = hrefForRouteName(newRoute.name);
      if (tabHref && (APP_TAB_HREFS as readonly string[]).includes(tabHref)) {
        announceTab(tabHref);
      }

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

  const startLesson = React.useCallback(
    (courseId: string, lessonId: string): boolean => {
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
