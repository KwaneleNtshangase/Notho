"use client";

import { useEffect } from "react";
import { isNativeShell } from "@/lib/nativeShell";

/**
 * Inside the Notho native shell, "installing" the web app makes no sense -
 * the user already has it as a real app from the App Store / Play Store.
 * This suppresses the browser's own install nudge (the `beforeinstallprompt`
 * mini-infobar / omnibox icon) so it can never surface inside the WebView.
 *
 * There's no custom "add to home screen" banner component in this codebase
 * today (only the pwaInstallPromptShown/pwaInstalled analytics events in
 * lib/analytics.ts, which are dead code until one exists) - if one is added
 * later, gate its render on `!isNativeShell()` the same way.
 *
 * Renders nothing; mount once near the root layout, alongside
 * NativeAuthDeepLink.
 */
export function NativeShellGuards() {
  useEffect(() => {
    if (!isNativeShell()) return;

    const suppressInstallPrompt = (event: Event) => {
      event.preventDefault();
    };
    window.addEventListener("beforeinstallprompt", suppressInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", suppressInstallPrompt);
  }, []);

  return null;
}
