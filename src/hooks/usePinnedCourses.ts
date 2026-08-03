"use client";

/**
 * usePinnedCourses
 *
 * Subscribes to the pinned-course store in `lib/pinnedCourses`, so every view
 * showing the course grid stays in sync — with other components in this tab
 * and with other tabs.
 *
 * useSyncExternalStore (rather than useState + useEffect) because the source
 * of truth is localStorage, which lives outside React. It also gives us the
 * correct server snapshot for free: nothing is pinned until hydration, so SSR
 * and the first client render agree.
 */

import { useCallback, useSyncExternalStore } from "react";
import {
  getPinnedServerSnapshot,
  getPinnedSnapshot,
  subscribePinnedCourses,
  toggleCoursePin,
} from "@/lib/pinnedCourses";

export function usePinnedCourses(): {
  pinned: readonly string[];
  isPinned: (courseId: string) => boolean;
  togglePin: (courseId: string) => void;
} {
  const pinned = useSyncExternalStore(
    subscribePinnedCourses,
    getPinnedSnapshot,
    getPinnedServerSnapshot
  );

  // Writes go through the store, which notifies subscribers — so this hook
  // never has to hold its own copy.
  const togglePin = useCallback((courseId: string) => {
    toggleCoursePin(courseId);
  }, []);

  const isPinned = useCallback(
    (courseId: string) => pinned.includes(courseId),
    [pinned]
  );

  return { pinned, isPinned, togglePin };
}
