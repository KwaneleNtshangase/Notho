"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackModal } from "@/components/ProfileView";
import { createShakeState, feedShake } from "@/lib/shakeDetect";

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
 * Instagram-style shake → report.
 * Uses the web DeviceMotion API so Android WebView and PWA pick it up
 * without a new store binary. iOS Safari/WKWebView only after the OS
 * grants motion (requested on the first tap, no extra UI).
 */
export function ShakeToReport() {
  const [open, setOpen] = useState(false);
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
    const fire = () => {
      if (openRef.current || overlayOpen()) return;
      openRef.current = true;
      setOpen(true);
      void hapticLight();
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

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("notho:shake", onCustom);
    window.addEventListener("pointerdown", onFirstGesture, { passive: true });
    return () => {
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("notho:shake", onCustom);
      window.removeEventListener("pointerdown", onFirstGesture);
    };
  }, []);

  return <FeedbackModal open={open} onClose={() => setOpen(false)} />;
}
