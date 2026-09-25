"use client";

import { useEffect } from "react";
import { isNativeShell } from "@/lib/nativeShell";

function currentIsDark(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("light")) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyChrome(dark: boolean) {
  const color = dark ? "#000000" : "#ffffff";
  const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", color);
    document.head.appendChild(meta);
  } else {
    for (const meta of metas) meta.setAttribute("content", color);
  }

  let status = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!status) {
    status = document.createElement("meta");
    status.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    document.head.appendChild(status);
  }
  status.setAttribute("content", dark ? "black-translucent" : "default");

  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  document.documentElement.style.setProperty("--notho-canvas", color);
}

export function NativeShellGuards() {
  useEffect(() => {
    const sync = () => applyChrome(currentIsDark());
    sync();

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener("change", sync);
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (!isNativeShell()) {
      return () => {
        mq?.removeEventListener("change", sync);
        obs.disconnect();
      };
    }

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
      mq?.removeEventListener("change", sync);
      obs.disconnect();
    };
  }, []);

  return null;
}
