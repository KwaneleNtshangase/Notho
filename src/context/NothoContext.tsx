"use client";

import React, { createContext, useContext, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useNothoState as useNothoStateInternal } from "@/hooks/useNothoState";
import type { NothoState } from "@/hooks/useNothoState";
import type { Route } from "@/app/pageViews.types";
import { RE5_COURSE_ID, isRe5MockExam } from "@/lib/results/re5";
import { APP_TAB_HREFS, announceTab, hrefForRouteName } from "@/lib/appTabs";
import { registerRoutePrefetch, warmHeavyShell, whenIdle } from "@/lib/speculativeWarm";

export const NothoContext = createContext<NothoState | null>(null);

function warm(router: { prefetch: (href: string) => void }, href: string) {
  try {
    router.prefetch(href);
  } catch {
    /* prefetch is best-effort */
  }
}

export function NothoProvider({ children }: { children: React.ReactNode }) {
  const state = useNothoStateInternal();
  const router = useRouter();

  React.useEffect(() => {
    registerRoutePrefetch((href) => warm(router, href));
    for (const href of APP_TAB_HREFS) {
      warm(router, href);
    }
    return whenIdle(() => {
      warm(router, "/settings");
      warm(router, "/re5-readiness");
      warmHeavyShell();
    }, 1200);
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

      const go = (href: string, tab = false) => {
        warm(router, href);
        startTransition(() => {
          router.push(href, { scroll: !tab });
        });
      };

      switch (newRoute.name) {
        case "learn":
          go("/learn", true);
          break;
        case "budget":
          go("/budget", true);
          break;
        case "quests":
          go("/quests", true);
          break;
        case "calculator":
          go("/calculator", true);
          break;
        case "profile":
          go("/profile", true);
          break;
        case "leaderboard":
          go("/leaderboard");
          break;
        case "settings":
          go("/settings");
          break;
        case "course":
          if (newRoute.courseId) go(`/course/${newRoute.courseId}`);
          break;
        case "lesson":
          if (newRoute.courseId && newRoute.lessonId) {
            warm(router, `/course/${newRoute.courseId}`);
            go(`/lesson/${newRoute.courseId}/${newRoute.lessonId}`);
          }
          break;
        case "onboarding":
          go("/onboarding");
          break;
        default:
          go("/learn", true);
          break;
      }
    },
    [router, state]
  );

  const startLesson = React.useCallback(
    (courseId: string, lessonId: string): boolean => {
      warm(router, `/lesson/${courseId}/${lessonId}`);
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
