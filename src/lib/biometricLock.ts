// Dynamic import throughout this file is deliberate: the biometric plugin is
// only installed once the one-off `npm install @capgo/capacitor-native-biometric`
// documented alongside this dependency in package.json has been run, and the
// web bundle should never need it. Every caller gets "unavailable" /
// "not verified" until then, rather than a build error - same pattern as
// isNativePlatform() in capacitorPlatform.ts.
//
// Package choice: the task asked for "capacitor-native-biometric", but that
// package (epicshaggy/capacitor-native-biometric) only supports Capacitor 3
// and 4 and is unmaintained - it does not work with this app's Capacitor 8.
// @capgo/capacitor-native-biometric is an actively maintained fork that
// tracks Capacitor's major version (its 8.x tracks Capacitor 8) and keeps
// the exact same `NativeBiometric` import name and method signatures, so
// this is a drop-in swap, not a different API.

export type BiometricAvailability = {
  available: boolean;
  biometryType?: string;
};

export type BiometricVerifyResult = {
  success: boolean;
  /** Set when verification failed for a real reason worth showing the user. */
  error?: string;
  /** True when the user backed out (cancel/fallback) rather than failing auth. */
  cancelled?: boolean;
};

export async function biometricsAvailable(): Promise<BiometricAvailability> {
  try {
    const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
    const result = await NativeBiometric.isAvailable();
    return { available: result.isAvailable, biometryType: String(result.biometryType) };
  } catch {
    return { available: false };
  }
}

/** Error codes the plugin uses for "the user chose not to", not a failure. */
const CANCEL_CODES = new Set([15, 16, 17]); // SYSTEM_CANCEL, USER_CANCEL, USER_FALLBACK

export async function verifyBiometric(reason: string): Promise<BiometricVerifyResult> {
  try {
    const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
    await NativeBiometric.verifyIdentity({
      reason,
      title: "Unlock Notho",
      subtitle: "Budget & transactions",
      negativeButtonText: "Cancel",
      useFallback: true,
    });
    return { success: true };
  } catch (err) {
    const code = (err as { code?: number } | undefined)?.code;
    const cancelled = code !== undefined && CANCEL_CODES.has(code);
    const message = (err as { message?: string } | undefined)?.message ?? "Authentication failed";
    return { success: false, error: cancelled ? undefined : message, cancelled };
  }
}
