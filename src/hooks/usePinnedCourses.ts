"use client";

/**
 * usePinnedCourses
 *
 * Subscribes to the pinned-course store in `lib/pinnedCourses`, so every view
 * showing the course grid stays in sync — with other components in this tab,
 * with other tabs, and (since the cross-device work) with the user's other
 * devices via `user_progress.pinned_courses`.
 *
 * useSyncExternalStore (rather than useState + useEffect) because the source
 * of truth for RENDERING is localStorage, which lives outside React. It also
 * gives us the correct server snapshot for free: nothing is pinned until
 * hydration, so SSR and the first client render agree.
 *
 * Offline-first, in that order, always:
 *   1. toggle applies to the store + localStorage synchronously;
 *   2. the write is appended to the durable queue in localStorage;
 *   3. only then is the network touched, and never awaited by the UI.
 * A pin made in a tunnel is a pin; it reaches the account when signal does.
 *
 * The hook resolves the signed-in user itself rather than taking it as an
 * argument, so no call site has to change.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getPinnedServerSnapshot,
  getPinnedSnapshot,
  hydratePinnedCourses,
  markPinsAdopted,
  needsPinAdoption,
  readPinnedRecord,
  subscribePinnedCourses,
  toggleCoursePin,
} from "@/lib/pinnedCourses";
import { mergePinned, type PinnedCourses } from "@/lib/sync/mergeRules";
import {
  enqueueCrossDeviceWrite,
  flushCrossDeviceQueue,
} from "@/lib/sync/crossDeviceQueue";

/** Don't re-pull on every focus event while the user tabs around. */
const REFRESH_MIN_MS = 15_000;

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

  const [userId, setUserId] = useState<string | null>(null);
  const lastPullRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const pull = useCallback(async (uid: string) => {
    lastPullRef.current = Date.now();

    // Anything queued from a previous session goes up before we read, so the
    // row we read already includes it.
    const flushed = await flushCrossDeviceQueue(uid);
    if (flushed?.pins) {
      hydratePinnedCourses(flushed.pins);
      markPinsAdopted();
      return;
    }

    const { data } = await supabase
      .from("user_progress")
      .select("pinned_courses")
      .eq("user_id", uid)
      .maybeSingle();

    const server = ((data as { pinned_courses?: PinnedCourses | null } | null)
      ?.pinned_courses ?? null) as PinnedCourses | null;
    const local = readPinnedRecord();

    // One-time rollout adoption: this device has pins that have only ever
    // lived in localStorage. Union them into the account rather than letting
    // last-write-wins decide whether they survive. Non-destructive, exactly
    // like the fundi->notho key migration in lib/storageMigration.ts.
    if (needsPinAdoption() && local.ids.length > 0) {
      enqueueCrossDeviceWrite(uid, {
        pins: { ids: local.ids, updatedAt: new Date().toISOString(), adopt: true },
      });
      const res = await flushCrossDeviceQueue(uid);
      if (res?.pins) {
        hydratePinnedCourses(res.pins);
        markPinsAdopted();
      }
      return;
    }

    const merged = mergePinned(server, local);
    hydratePinnedCourses(merged);
    markPinsAdopted();

    // Local was ahead of the server (a queued write lost to a wiped cache, or
    // a pre-sync build). Push it, don't silently drop it.
    if (server && merged.updatedAt !== server.updatedAt) {
      enqueueCrossDeviceWrite(uid, { pins: merged });
      const res = await flushCrossDeviceQueue(uid);
      if (res?.pins) hydratePinnedCourses(res.pins);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void pull(userId).catch(() => undefined);

    // A device left open on the Learn tab should pick up a pin made on the
    // phone, so re-pull when the app comes back to the foreground or online.
    const maybeRefresh = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (Date.now() - lastPullRef.current < REFRESH_MIN_MS) return;
      void pull(userId).catch(() => undefined);
    };
    window.addEventListener("focus", maybeRefresh);
    window.addEventListener("online", maybeRefresh);
    document.addEventListener("visibilitychange", maybeRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", maybeRefresh);
      window.removeEventListener("online", maybeRefresh);
      document.removeEventListener("visibilitychange", maybeRefresh);
    };
  }, [userId, pull]);

  const togglePin = useCallback(
    (courseId: string) => {
      // 1. Local, synchronous — the UI never waits for the network.
      const record = toggleCoursePin(courseId);
      if (!userId) return;
      // 2. Durable queue, before any network call, so an app kill can't lose it.
      enqueueCrossDeviceWrite(userId, { pins: record });
      // 3. Opportunistic flush. Failure just leaves it queued for next time.
      void flushCrossDeviceQueue(userId).then((res) => {
        if (res?.pins) {
          hydratePinnedCourses(res.pins);
          markPinsAdopted();
        }
      });
    },
    [userId]
  );

  const isPinned = useCallback(
    (courseId: string) => pinned.includes(courseId),
    [pinned]
  );

  return { pinned, isPinned, togglePin };
}
