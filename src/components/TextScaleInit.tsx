"use client";

import { useEffect } from "react";
import { applyTextScale, readTextScale } from "@/lib/textScale";

/** Re-applies the saved scale after hydration (covers client navigations). */
export function TextScaleInit() {
  useEffect(() => {
    applyTextScale(readTextScale());
  }, []);
  return null;
}
