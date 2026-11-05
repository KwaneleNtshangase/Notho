// Dynamic import throughout this file is deliberate: @capacitor/core is only
// installed once store-launch/_tools/setup-capacitor.sh has been run, and the
// web bundle should never need it. Every caller gets `false` (i.e. "treat as
// web") until the native shell exists, rather than a build error.

type NativePlatformId = "ios" | "android" | "web";

/**
 * The native shell exposes its bridge before any JS import, and Capacitor
 * appends NothoApp/iOS or NothoApp/Android to the user agent. Reading those
 * is synchronous, so a click handler can branch without awaiting a dynamic
 * import (that await drops the user gesture on Safari and in Android WebViews).
 */
function bridgePlatform(): NativePlatformId | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    androidBridge?: unknown;
    webkit?: { messageHandlers?: { bridge?: unknown } };
  };
  if (win.androidBridge) return "android";
  if (win.webkit?.messageHandlers?.bridge) return "ios";
  return null;
}

function userAgentPlatform(): NativePlatformId | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/NothoApp\/iOS/.test(ua)) return "ios";
  if (/NothoApp\/Android/.test(ua)) return "android";
  return null;
}

/** ios, android (including the Huawei shell), or web. Never waits. */
export function nativePlatformSync(): NativePlatformId {
  return bridgePlatform() ?? userAgentPlatform() ?? "web";
}

/** True only in the iPhone/iPad app. Android, Huawei, web, and desktop stay false. */
export function isIosNativeSync(): boolean {
  return nativePlatformSync() === "ios";
}

/**
 * True when running inside the Capacitor native shell (the iOS or Android
 * app), false on the web (including mobile Safari/Chrome and the installed
 * PWA - neither of those go through Capacitor).
 */
export async function isNativePlatform(): Promise<boolean> {
  if (nativePlatformSync() !== "web") return true;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True only in the iPhone/iPad app. Android, Huawei, web, and desktop stay false. */
export async function isIosNative(): Promise<boolean> {
  if (isIosNativeSync()) return true;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
}
