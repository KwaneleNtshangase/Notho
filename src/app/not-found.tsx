import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import Link from "next/link";
import Image from "next/image";

// Branded 404 - replaces Next's bare black default so lost visitors
// (mistyped URLs, stale links) always have a way back into the app.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
      }}
    >
      <Image
        src="/notho-logo.png"
        alt="Notho"
        width={120}
        height={120}
        priority
      />
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}><I18nText source={"Page not found"} /></h1>
      <p style={{ maxWidth: 420, color: "var(--color-text-secondary)", margin: 0 }}><I18nText source={"The page you're looking for doesn't exist or may have moved. Your learning path is still right where you left it."} /></p>
      <Link
        href="/learn"
        style={{
          display: "inline-block",
          marginTop: 8,
          padding: "12px 28px",
          borderRadius: 12,
          background: "var(--color-primary)",
          color: "#fff",
          fontWeight: 700,
          textDecoration: "none",
        }}
      ><I18nText source={"Back to Notho"} /></Link>
    </div>
  );
}
