"use client";

/** Meta-style launch screen: static mark, no motion, no glow. */
export function AppSplash() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <img
        src="/notho-icon.png"
        alt="Notho"
        width={88}
        height={88}
        style={{ width: 88, height: 88, objectFit: "contain", display: "block" }}
      />
    </div>
  );
}
