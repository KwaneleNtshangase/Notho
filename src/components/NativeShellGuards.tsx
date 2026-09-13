"use client";

import { useEffect } from "react";
import { isNativeShell } from "@/lib/nativeShell";

export function NativeShellGuards() {
  useEffect(() => {
    if (!isNativeShell()) return;

    const suppressInstallPrompt = (event: Event) => {
      event.preventDefault();
    };
    window.addEventListener("beforeinstallprompt", suppressInstallPrompt);

    const meta = document.querySelector('meta[name="viewport"]');
    const previous = meta?.getAttribute("content") ?? "";
    meta?.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content"
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", suppressInstallPrompt);
      if (meta && previous) meta.setAttribute("content", previous);
    };
  }, []);

  return null;
}
