"use client";

import { useEffect, useRef, useState } from "react";
import { createShakeState, feedShake } from "@/lib/shakeDetect";
import { ReportProblemSheet, shakeReportEnabled, takeReportScreenshot } from "@/components/ReportProblemSheet";

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
 * Native shells use @capgo/capacitor-shake. The sheet opens immediately —
 * screenshot capture must not block it (html-to-image can hang in WKWebView).
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
      if (openRef.current) return;
      openRef.current = true;
      setShot(null);
      setOpen(true);
      void hapticLight();
      void withTimeout(takeReportScreenshot(), 1800).then((image) => {
        if (!cancelled) setShot(image);
      });
    };

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

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("notho:shake", fire);
    window.addEventListener("pointerdown", () => {
      if (askedRef.current) return;
      askedRef.current = true;
      void requestMotionIfNeeded();
    }, { passive: true });
    return () => {
      cancelled = true;
      removeNative?.();
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("notho:shake", fire);
    };
  }, []);

  return <ReportProblemSheet open={open} onClose={() => { openRef.current = false; setOpen(false); }} screenshot={shot} />;
}
