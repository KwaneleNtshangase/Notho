"use client";

import { useEffect, useRef, useState } from "react";
import { createShakeState, feedShake } from "@/lib/shakeDetect";
import { REPORT_PROBLEM_EVENT, ReportProblemSheet, shakeReportEnabled, takeReportScreenshot } from "@/components/ReportProblemSheet";

type DeviceMotionPermission = {
  requestPermission?: () => Promise<PermissionState>;
};

async function hapticLight(): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* web */
  }
}

async function requestMotionIfNeeded(): Promise<void> {
  const MotionEvent = window.DeviceMotionEvent as unknown as DeviceMotionPermission | undefined;
  if (!MotionEvent || typeof MotionEvent.requestPermission !== "function") return;
  try {
    await MotionEvent.requestPermission();
  } catch {
    /* denied or unsupported */
  }
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), ms);
    work.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      }
    );
  });
}

/**
 * Shake opens Report a Problem.
 *
 * iOS WKWebView does not deliver DeviceMotionEvent, and @capgo/capacitor-shake
 * listens on UIWindow.motionEnded, which UIKit never calls while the web view
 * is first responder. The iOS shell therefore watches Core Motion and
 * dispatches `notho:shake` (see ShakeWatch in SceneDelegate.swift).
 * Android still uses the native plugin. The website keeps the web detector.
 * The sheet opens immediately — screenshot capture must not block it
 * (html-to-image can hang in WKWebView).
 */
export function ShakeToReport() {
  const [open, setOpen] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [via, setVia] = useState<"shake" | "settings">("shake");
  const openRef = useRef(false);
  const stateRef = useRef(createShakeState());
  const askedRef = useRef(false);

  openRef.current = open;

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (open) {
      root.classList.add("notho-overlay-open");
      body.classList.add("modal-open");
    } else {
      root.classList.remove("notho-overlay-open");
      body.classList.remove("modal-open");
    }
    return () => {
      root.classList.remove("notho-overlay-open");
      body.classList.remove("modal-open");
    };
  }, [open]);

  useEffect(() => {
    let removeNative: (() => void) | undefined;
    let cancelled = false;

    const openSheet = (source: "shake" | "settings") => {
      if (source === "shake" && !shakeReportEnabled()) return;
      if (openRef.current) return;
      openRef.current = true;
      setVia(source);
      setShot(null);
      setOpen(true);
      void hapticLight();
      void withTimeout(takeReportScreenshot(), 1800).then((image) => {
        if (!cancelled) setShot(image);
      });
    };

    const fire = () => openSheet("shake");

    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity ?? event.acceleration;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      if (feedShake(stateRef.current, { x: a.x, y: a.y, z: a.z, t: Date.now() })) fire();
    };

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { CapacitorShake } = await import("@capgo/capacitor-shake");
        const handle = await CapacitorShake.addListener("shake", fire);
        if (cancelled) {
          await handle.remove();
          return;
        }
        removeNative = () => {
          void handle.remove();
        };
      } catch {
        /* old binary has no plugin */
      }
    })();

    const onReport = () => openSheet("settings");
    const onFirstPointer = () => {
      if (askedRef.current) return;
      askedRef.current = true;
      void requestMotionIfNeeded();
    };

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("notho:shake", fire);
    window.addEventListener(REPORT_PROBLEM_EVENT, onReport);
    window.addEventListener("pointerdown", onFirstPointer, { passive: true });
    return () => {
      cancelled = true;
      removeNative?.();
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("notho:shake", fire);
      window.removeEventListener(REPORT_PROBLEM_EVENT, onReport);
      window.removeEventListener("pointerdown", onFirstPointer);
    };
  }, []);

  return <ReportProblemSheet open={open} onClose={() => { openRef.current = false; setOpen(false); }} screenshot={shot} via={via} />;
}
