"use client";

/**
 * Face ID / Touch ID / fingerprint lock in front of a screen.
 *
 * Web-only visitors, and native visitors on a device with no biometric
 * hardware enrolled, pass straight through - this only ever gates the
 * native app, and only when there's actually something to verify with.
 * See store-launch/06-capacitor-setup.md, Blocker 2: this is one of the
 * native capabilities that makes the iOS submission more than a repackaged
 * website.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Fingerprint } from "lucide-react";
import { isNativePlatform } from "@/lib/capacitorPlatform";
import { biometricsAvailable, verifyBiometric } from "@/lib/biometricLock";

type GateState = "checking" | "skip" | "locked" | "unlocked";

export function BiometricGate({
  children,
  reason = "Unlock your budget",
}: {
  children: ReactNode;
  reason?: string;
}) {
  const [state, setState] = useState<GateState>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await isNativePlatform())) { if (!cancelled) setState("skip"); return; }
      const { available } = await biometricsAvailable();
      if (!cancelled) setState(available ? "locked" : "skip");
    })();
    return () => { cancelled = true; };
  }, []);

  const attemptUnlock = async () => {
    setBusy(true);
    setError(null);
    const result = await verifyBiometric(reason);
    setBusy(false);
    if (result.success) {
      setState("unlocked");
    } else if (!result.cancelled) {
      setError(result.error ?? "Couldn't verify it's you. Try again.");
    }
  };

  // Prompt automatically as soon as the gate is up - most users just want
  // Face ID to fire, not to tap a button first.
  useEffect(() => {
    if (state === "locked") void attemptUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state === "checking") return null;
  if (state === "skip" || state === "unlocked") return <>{children}</>;

  return (
    <div
      role="dialog"
      aria-label="Budget locked"
      style={{
        position: "fixed", inset: 0, zIndex: 700,
        background: "var(--color-bg, #fff)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 20px", textAlign: "center",
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "var(--color-surface, #F0FDF4)",
        border: "2px solid var(--color-primary, #007A85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <Fingerprint size={34} style={{ color: "var(--color-primary, #007A85)" }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 6 }}>
        Budget locked
      </div>
      <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 22, maxWidth: 280, lineHeight: 1.5 }}>
        Verify it&apos;s you to see your budget and transactions.
      </div>
      {error && (
        <div style={{ fontSize: 12.5, color: "#DE6B62", marginBottom: 14, maxWidth: 280 }}>{error}</div>
      )}
      <button
        type="button"
        onClick={attemptUnlock}
        disabled={busy}
        style={{
          padding: "11px 26px", borderRadius: 10, border: "none",
          background: "var(--color-primary, #007A85)", color: "#fff",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Verifying…" : "Unlock"}
      </button>
    </div>
  );
}
