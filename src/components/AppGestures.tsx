"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNotho } from "@/context/NothoContext";
import {
  EDGE_START_PX,
  PULL_COMMIT_PX,
  SWIPE_COMMIT_PX,
  canSwipeBack,
  classifyGesture,
  courseIdFromPath,
  pullProgress,
  startedFromLeftEdge,
  swipeProgress,
} from "@/lib/appGestures";
import {
  COURSE_FOCUS_KEY,
  applyScroll,
  captureScroll,
  hasMeaningfulScroll,
  readScroll,
  writeScroll,
} from "@/lib/scrollMemory";

type Finger = {
  id: number;
  startX: number;
  startY: number;
  fromLeftEdge: boolean;
  atScrollTop: boolean;
  kind: "none" | "swipe-back" | "pull-refresh";
};

function isAtScrollTop(): boolean {
  const main = document.querySelector(".main-content");
  const mainTop = main instanceof HTMLElement ? main.scrollTop : 0;
  const windowTop = window.scrollY || document.documentElement.scrollTop || 0;
  return windowTop <= 1 && mainTop <= 1;
}

function modalOpen(): boolean {
  return document.body.classList.contains("modal-open");
}

async function haptic(kind: "light" | "medium"): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({
      style: kind === "medium" ? ImpactStyle.Medium : ImpactStyle.Light,
    });
  } catch {
    /* web, or plugin unavailable */
  }
}

export function AppGestures() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { refreshProgress, setRoute } = useNotho();

  const pathRef = useRef(pathname);
  const seenPathRef = useRef(pathname);
  const refreshRef = useRef(refreshProgress);
  const setRouteRef = useRef(setRoute);
  const routerRef = useRef(router);
  const fingerRef = useRef<Finger | null>(null);
  const refreshingRef = useRef(false);
  const restoreTimerRef = useRef<number | null>(null);

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [swipe, setSwipe] = useState(0);

  pathRef.current = pathname;
  refreshRef.current = refreshProgress;
  setRouteRef.current = setRoute;
  routerRef.current = router;

  useEffect(() => {
    const previous = seenPathRef.current;
    if (previous && previous !== pathname) {
      writeScroll(previous, captureScroll());
    }
    seenPathRef.current = pathname;

    const focusing =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(COURSE_FOCUS_KEY) &&
      pathname.startsWith("/course/");
    if (focusing) return;

    const saved = readScroll(pathname);
    if (!hasMeaningfulScroll(saved) || !saved) return;

    if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
    const apply = () => applyScroll(saved);
    apply();
    restoreTimerRef.current = window.setTimeout(apply, 50);

    return () => {
      if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const persist = () => {
      ticking = false;
      writeScroll(pathRef.current, captureScroll());
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(persist);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const main = document.querySelector(".main-content");
    main?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      main?.removeEventListener("scroll", onScroll);
      writeScroll(pathRef.current, captureScroll());
    };
  }, [pathname]);

  const goBack = () => {
    const path = pathRef.current;
    if (!canSwipeBack(path)) return;
    if (typeof window !== "undefined" && window.history.length > 1) {
      routerRef.current.back();
      return;
    }
    const courseId = courseIdFromPath(path);
    if (courseId && path.startsWith("/lesson/")) {
      setRouteRef.current({ name: "course", courseId });
      return;
    }
    setRouteRef.current({ name: "learn" });
  };

  const runRefresh = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setPull(1);
    void haptic("medium");
    try {
      await refreshRef.current();
      routerRef.current.refresh();
    } catch {
      /* progress.refresh already swallows network errors */
    } finally {
      window.setTimeout(() => {
        refreshingRef.current = false;
        setRefreshing(false);
        setPull(0);
      }, 280);
    }
  };

  useEffect(() => {
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (modalOpen()) return;
      const t = event.touches[0];
      fingerRef.current = {
        id: t.identifier,
        startX: t.clientX,
        startY: t.clientY,
        fromLeftEdge: startedFromLeftEdge(t.clientX, EDGE_START_PX),
        atScrollTop: isAtScrollTop(),
        kind: "none",
      };
    };

    const onMove = (event: TouchEvent) => {
      const finger = fingerRef.current;
      if (!finger) return;
      const t = Array.from(event.touches).find((x) => x.identifier === finger.id);
      if (!t) return;

      if (finger.kind === "none") {
        finger.kind = classifyGesture({
          startX: finger.startX,
          startY: finger.startY,
          currentX: t.clientX,
          currentY: t.clientY,
          atScrollTop: finger.atScrollTop,
          fromLeftEdge: finger.fromLeftEdge,
        });
        if (finger.kind === "swipe-back" && !canSwipeBack(pathRef.current)) {
          finger.kind = "none";
          fingerRef.current = null;
          return;
        }
      }

      if (finger.kind === "swipe-back") {
        const dx = t.clientX - finger.startX;
        setSwipe(swipeProgress(dx, SWIPE_COMMIT_PX));
        if (event.cancelable) event.preventDefault();
        return;
      }

      if (finger.kind === "pull-refresh") {
        if (refreshingRef.current) return;
        const dy = t.clientY - finger.startY;
        setPull(pullProgress(dy, PULL_COMMIT_PX));
        if (event.cancelable) event.preventDefault();
      }
    };

    const finish = (event: TouchEvent) => {
      const finger = fingerRef.current;
      if (!finger) return;
      const t =
        Array.from(event.changedTouches).find((x) => x.identifier === finger.id) ??
        null;
      const x = t?.clientX ?? finger.startX;
      const y = t?.clientY ?? finger.startY;
      const kind = finger.kind;
      fingerRef.current = null;

      if (kind === "swipe-back") {
        const progress = swipeProgress(x - finger.startX, SWIPE_COMMIT_PX);
        setSwipe(0);
        if (progress >= 1) {
          void haptic("light");
          goBack();
        }
        return;
      }

      if (kind === "pull-refresh") {
        const progress = pullProgress(y - finger.startY, PULL_COMMIT_PX);
        if (progress >= 1) {
          void runRefresh();
        } else {
          setPull(0);
        }
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", finish, { passive: true });
    document.addEventListener("touchcancel", finish, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", finish);
      document.removeEventListener("touchcancel", finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let remove: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        if (cancelled) return;
        const handle = await App.addListener("backButton", () => {
          if (modalOpen()) return;
          if (canSwipeBack(pathRef.current)) {
            goBack();
            return;
          }
          void App.minimizeApp();
        });
        remove = () => handle.remove();
      } catch {
        /* web */
      }
    })();
    return () => {
      cancelled = true;
      remove?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pullVisible = pull > 0.02 || refreshing;
  const swipeVisible = swipe > 0.02;

  return (
    <>
      <div
        className="ptr-indicator"
        aria-hidden={!pullVisible}
        data-refreshing={refreshing ? "true" : "false"}
        style={{
          opacity: pullVisible ? Math.max(pull, refreshing ? 1 : 0) : 0,
          transform: `translate(-50%, ${Math.round(Math.min(pull, 1) * 18)}px)`,
        }}
      >
        <span className="ptr-spinner" />
        <span className="ptr-label">{refreshing ? "Refreshing" : "Release to refresh"}</span>
      </div>
      <div
        className="app-swipe-back"
        aria-hidden={!swipeVisible}
        style={{
          opacity: swipeVisible ? Math.min(0.28, swipe * 0.28) : 0,
        }}
      />
    </>
  );
}
