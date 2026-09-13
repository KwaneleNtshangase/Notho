"use client";

import { useEffect } from "react";
import { isNativeShell } from "@/lib/nativeShell";

/**
 * Inside the Notho native shell, "installing" the web app makes no sense -
 * the user already has it as a real app from the App Store / Play Store.
 * This suppresses the browser's own install nudge (the `beforeinstallprompt`
 * mini-infobar / omnibox icon) so it can never surface inside the WebView.
 *
 * Also pins the viewport so focusing a text field does not zoom the app
 * the way Safari does on the open web.
 */
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
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", suppressInstallPrompt);
      if (meta && previous) meta.setAttribute("content", previous);
    };
  }, []);

  return null;
}
