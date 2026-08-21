// Dynamic import throughout this file is deliberate: @capacitor/haptics is
// only installed once store-launch/_tools/setup-capacitor.sh has been run,
// and the web bundle should never need it. Every call is a silent no-op
// until the native shell exists, rather than a build error - same pattern as
// isNativePlatform() in capacitorPlatform.ts. Haptics are also a no-op on
// devices with haptics disabled or unsupported, so callers never need to
// check availability first.

/** Light tactile confirmation - lesson completed. */
export async function hapticLessonComplete(): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* web, or plugin unavailable - no-op */
  }
}

/** Stronger "you achieved something" buzz - streak milestones. */
export async function hapticStreakMilestone(): Promise<void> {
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* web, or plugin unavailable - no-op */
  }
}

/**
 * Streak lengths (in days) worth a stronger celebration than the routine
 * per-lesson tap. Also fires every 100 days after the last listed one, for
 * streaks that run long past a year.
 */
export function isStreakMilestone(streak: number): boolean {
  const MILESTONES = new Set([3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365]);
  if (MILESTONES.has(streak)) return true;
  return streak > 365 && streak % 100 === 0;
}
