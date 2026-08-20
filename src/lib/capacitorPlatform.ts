// Dynamic import throughout this file is deliberate: @capacitor/core is only
// installed once store-launch/_tools/setup-capacitor.sh has been run, and the
// web bundle should never need it. Every caller gets `false` (i.e. "treat as
// web") until the native shell exists, rather than a build error.

/**
 * True when running inside the Capacitor native shell (the iOS or Android
 * app), false on the web (including mobile Safari/Chrome and the installed
 * PWA - neither of those go through Capacitor).
 */
export async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
