"use client";

import { useEffect } from "react";
import { applyTextScale, readTextScale } from "@/lib/textScale";

/** Apply OS text size on load and again when the app comes back to the foreground. */
export function TextScaleInit() {
  useEffect(() => {
    const apply = () => applyTextScale(readTextScale());
    apply();
    window.addEventListener("focus", apply);
    window.addEventListener("pageshow", apply);
    document.addEventListener("visibilitychange", apply);
    return () => {
      window.removeEventListener("focus", apply);
      window.removeEventListener("pageshow", apply);
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);
  return null;
}
