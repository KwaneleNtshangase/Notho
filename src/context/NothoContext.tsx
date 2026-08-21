"use client";

import React, { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNothoState as useNothoStateInternal } from "@/hooks/useNothoState";
import type { NothoState } from "@/hooks/useNothoState";
import type { Route } from "@/app/pageViews.types";
import {
  belongsToLocation,
  courseHref,
  exitHrefForLesson,
  lessonHref,
  lessonLocationFromPath,
} from "@/lib/lessonRoute";

type LessonState = NothoState["currentLessonState"];

/**
 * The value handed to consumers whenever the URL is not on the lesson that the
 * in-memory state describes. A module-level constant so its identity is stable
 * across renders — a fresh object here would invalidate every memo downstream.
 */
const NO_LESSON: LessonState = {
  courseId: null,
  lessonId: null,
  stepIndex: 0,
  steps: [],
  answers: {},
  correctCount: 0,
  mistakes: 0,
  masteredQids: [],
  mistakenQids: [],
};

export const NothoContext = createContext<
  (NothoState & { leaveLesson: (courseId?: string | null) => void }) | null
>(null);

export function NothoProvider({ children }: { children: React.ReactNode }) {
  const state = useNothoStateInternal();
  const router = useRouter();
  const pathname = usePathname();

  // ── The URL is the owner of "where am I" ────────────────────────────────
  //
  // Everything below reads from this. `route` in useNothoState is still
  // written (the onboarding reconcile and the notho-last-route persistence
  // both read it) but it is bookkeeping, not a second source of truth: no
  // component outside that hook consumes it, and nothing here branches on it.
  const lessonLocation = React.useMemo(
    () => lessonLocationFromPath(pathname),
    [pathname]
  );

  // ── Lesson state, scoped to the URL ─────────────────────────────────────
  //
  // Previously this was a free-floating global. router.push is async and
  // setState is not, so between "Continue" and the new page actually rendering
  // there was a window in which the lesson page re-rendered the lesson the user
  // had just finished — complete with its "Done - Back to Course" button. That
  // button re-entered finalize, which cancelled the exit and restarted the
  // clock: the reported bounce.
  //
  // Scoping it closes the window by construction. A lesson state that does not
  // belong to the lesson in the URL is not visible to anybody, so it cannot be
  // rendered, cannot be finalised, and cannot leak onto the course page or into
  // the next lesson.
  const currentLessonState = belongsToLocation(state.currentLessonState, lessonLocation)
    ? state.currentLessonState
    : NO_LESSON;

  // Same rule for the summary. A summary belongs to exactly one lesson; once
  // the URL is somewhere else it is history, not a screen. This is what stops a
  // stale full-screen summary overlay (zIndex 600) from covering the next
  // lesson and swallowing its exit controls.
  const lessonSummary = belongsToLocation(state.lessonSummary, lessonLocation)
    ? state.lessonSummary
    : null;

  // ── Drop lesson state when the URL leaves the lesson section ────────────
  //
  // Scoping already hides it; this releases it. Note the guard: clearing
  // unconditionally on every pathname change would re-render the whole tree on
  // every navigation. Mid-lesson resume is unaffected — that lives in the
  // "notho-lesson-progress" localStorage record, which is written by the save
  // effect in useNothoState and is not touched here.
  const rawLessonCourseId = state.currentLessonState.courseId;
  const rawSummaryCourseId = state.lessonSummary?.courseId ?? null;
  const setCurrentLessonStateRef = React.useRef(state.setCurrentLessonState);
  const setLessonSummaryRef = React.useRef(state.setLessonSummary);
  const setRouteRef = React.useRef(state.setRoute);
  setCurrentLessonStateRef.current = state.setCurrentLessonState;
  setLessonSummaryRef.current = state.setLessonSummary;
  setRouteRef.current = state.setRoute;

  React.useEffect(() => {
    if (lessonLocation) return; // still inside a lesson — nothing to release
    if (rawLessonCourseId !== null) setCurrentLessonStateRef.current(NO_LESSON);
    if (rawSummaryCourseId !== null) setLessonSummaryRef.current(null);
  }, [lessonLocation, rawLessonCourseId, rawSummaryCourseId]);

  // ── Navigation ──────────────────────────────────────────────────────────
  //
  // setRoute still mirrors into React state so the onboarding reconcile and the
  // last-route persistence keep working, but the navigation itself is the part
  // that matters: the pathname is what every screen decision is made from.
  const setRoute = React.useCallback(
    (newRouteAction: React.SetStateAction<Route>) => {
      const newRoute =
        typeof newRouteAction === "function"
          ? newRouteAction(state.route)
          : newRouteAction;

      state.setRoute(newRoute);

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
          if (newRoute.courseId) router.push(courseHref(newRoute.courseId));
          break;
        case "lesson":
          if (newRoute.courseId && newRoute.lessonId) {
            router.push(lessonHref(newRoute.courseId, newRoute.lessonId));
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

  /**
   * Leave the lesson, unconditionally.
   *
   * Three properties the old `setRoute({ name: "course" })` did not have:
   *
   *  - It takes the course from the URL first (see exitHrefForLesson), so it
   *    still lands correctly when in-memory lesson state is stale, empty, or
   *    mid-restore — exactly when the learner is most stuck.
   *  - It drops the lesson state and the summary FIRST, so nothing can
   *    re-render the lesson (or re-arm it from the mount effect) while the
   *    navigation is in flight.
   *  - It uses replace, not push. With push, Back from the course page dropped
   *    the learner straight back into the finished lesson's completion screen,
   *    which is the same trap by another door.
   */
  const leaveLesson = React.useCallback(
    (courseId?: string | null) => {
      const target = lessonLocation?.courseId || courseId || null;
      const href = exitHrefForLesson(pathname, courseId ?? null);
      setLessonSummaryRef.current(null);
      setCurrentLessonStateRef.current(NO_LESSON);
      setRouteRef.current(
        target ? { name: "course", courseId: target } : { name: "learn" }
      );
      router.replace(href);
    },
    [router, pathname, lessonLocation]
  );

  // Wrap startLesson so it uses Next.js routing after setting up lesson state.
  // The raw startLesson in useNothoState intentionally does NOT call setRoute
  // (it used to call the raw useState setter which was the navigation bug).
  const startLesson = React.useCallback(
    (courseId: string, lessonId: string): boolean => {
      const ok = state.startLesson(courseId, lessonId);
      if (ok) {
        state.setRoute({ name: "lesson", courseId, lessonId });
        router.push(lessonHref(courseId, lessonId));
      }
      return ok;
    },
    [router, state]
  );

  const value = React.useMemo(
    () => ({
      ...state,
      currentLessonState,
      lessonSummary,
      setRoute,
      startLesson,
      leaveLesson,
    }),
    [state, currentLessonState, lessonSummary, setRoute, startLesson, leaveLesson]
  );

  return <NothoContext.Provider value={value}>{children}</NothoContext.Provider>;
}

export function useNotho() {
  const context = useContext(NothoContext);
  if (!context) {
    throw new Error("useNotho must be used within a NothoProvider");
  }
  return context;
}
