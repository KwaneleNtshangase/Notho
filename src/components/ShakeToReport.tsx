"use client";

import { useEffect, useRef, useState } from "react";
import { createShakeState, feedShake } from "@/lib/shakeDetect";
import { ReportProblemSheet, shakeReportEnabled, takeReportScreenshot } from "@/components/ReportProblemSheet";

type DeviceMotionPermission = {
  requestPermission?: () => Promise<PermissionState>;
};

function overlayOpen(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("notho-overlay-open") ||
    document.body.classList.contains("modal-open")
  );
}

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
    /* denied or unsupported — shake stays off on this session */
  }
}

/**
 * Shake opens Send Feedback.
 * Native shells use @capgo/capacitor-shake (Core Motion / SensorManager),
 * because WKWebView often never delivers DeviceMotionEvent.
 * The website and PWA keep the web detector.
 */
export function ShakeToReport() {
  const [open, setOpen] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
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

    const fire = () => {
      if (!shakeReportEnabled()) return;
      if (openRef.current || overlayOpen()) return;
      openRef.current = true;
      void (async () => {
        const image = await takeReportScreenshot();
        setShot(image);
        setOpen(true);
        void hapticLight();
      })();
    };

    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity ?? event.acceleration;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      if (feedShake(stateRef.current, { x: a.x, y: a.y, z: a.z, t: Date.now() })) {
        fire();
      }
    };

    const onCustom = () => fire();

    const onFirstGesture = () => {
      if (askedRef.current) return;
      askedRef.current = true;
      void requestMotionIfNeeded();
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
        /* plugin missing until the next store binary — web path still runs */
      }
    })();

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("notho:shake", onCustom);
    window.addEventListener("pointerdown", onFirstGesture, { passive: true });
    return () => {
      cancelled = true;
      removeNative?.();
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("notho:shake", onCustom);
      window.removeEventListener("pointerdown", onFirstGesture);
    };
  }, []);

  return <ReportProblemSheet open={open} onClose={() => setOpen(false)} screenshot={shot} />;
}
