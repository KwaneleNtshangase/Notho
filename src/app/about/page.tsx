import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicFooter } from "@/components/PublicFooter";
import { OpenNothoButton } from "@/components/OpenNothoButton";
import {
  SITE_DESCRIPTION,
  canonical,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Notho",
  description: SITE_DESCRIPTION,
  alternates: { canonical: canonical("/about") },
  openGraph: {
    title: "About Notho",
    description: SITE_DESCRIPTION,
    url: canonical("/about"),
    type: "website",
  },
};

const navy = "#0D368D";
const teal = "#007A85";
const ink = "#1a1a1a";
const muted = "#4a4a4a";

export default function AboutPage() {
  return (
    <div
      className="public-page"
      style={{
        backgroundColor: "#ffffff",
        color: ink,
        minHeight: "100dvh",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <JsonLd
        data={webPageJsonLd({
          path: "/about",
          title: "About Notho",
          description: SITE_DESCRIPTION,
        })}
      />

      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #eee",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/about">
            <img src="/notho-logo.png" alt="Notho" style={{ height: 40, width: "auto" }} />
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
            <Link href="/financial-literacy" style={{ color: ink, textDecoration: "none" }}>Learn</Link>
            <Link href="/investment-calculator" style={{ color: ink, textDecoration: "none" }}>Calculate</Link>
            <Link href="/budgeting" style={{ color: ink, textDecoration: "none" }}>Budget</Link>
            <OpenNothoButton
              style={{
                background: teal,
                color: "#fff",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 6,
                fontWeight: 700,
              }}
            />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "80px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.1,
              color: navy,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            <I18nText source={"Learn personal finance in South Africa."} />
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: muted, margin: "0 0 28px", maxWidth: 480 }}>
            <I18nText source={"Short lessons, calculators, and a budget that uses your own numbers."} />
          </p>
          <OpenNothoButton
            label="Start learning"
            style={{
              display: "inline-block",
              background: teal,
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: 8,
              fontSize: 16,
            }}
          />
        </div>
        <div
          style={{
            background: "#f4f7f8",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <img src="/notho-icon-192.png" alt="" style={{ width: 96, height: 96, marginBottom: 16 }} />
          <p style={{ margin: 0, color: muted, fontSize: 15 }}>
            <I18nText source={"Lessons, calculators and a budget in one app."} />
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#f7f9fa", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: navy, margin: "0 0 32px" }}>
            <I18nText source={"What you can do"} />
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {[
              { href: "/financial-literacy", title: "Learn", body: "Short lessons on personal finance. Review the ideas until they stick." },
              { href: "/investment-calculator", title: "Calculate", body: "Savings, TFSA, retirement annuity and living-annuity scenarios." },
              { href: "/budgeting", title: "Budget", body: "From your own numbers. Statement import is lookback only." },
              { href: "/re5", title: "RE5 prep", body: "If you are studying the regulatory exam." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 12,
                  padding: 24,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: teal }}>
                  <I18nText source={item.title} />
                </h3>
                <p style={{ margin: 0, color: muted, fontSize: 15, lineHeight: 1.55 }}>
                  <I18nText source={item.body} />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: navy, margin: "0 0 16px" }}>
          <I18nText source={"What Notho is not"} />
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: muted, maxWidth: 640, margin: 0 }}>
          <I18nText source={"Notho does not sell loans, does not log into your bank, and does not replace an FSCA-registered adviser. Cosmo answers questions about the lessons. It is not a human adviser."} />
        </p>
        <p style={{ fontSize: 15, color: "#666", marginTop: 32 }}>
          <I18nText source={"Founded by Kwanele Ntshangase. Previously called Fundi Finance (renamed July 2026)."} />
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
