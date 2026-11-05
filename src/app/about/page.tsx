import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
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
    <main
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

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <img
          src="/notho-logo.png"
          alt="Notho"
          style={{ height: 36, width: "auto", marginBottom: 40 }}
        />

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: navy,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          <I18nText source={"Notho is a South African app for learning money."} />
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.6, color: muted, margin: "0 0 28px" }}>
          <I18nText source={"Short lessons, calculators that work in rand, and a budget that uses your own numbers."} />
        </p>

        <Link
          href="/learn"
          style={{
            display: "inline-block",
            background: teal,
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
            padding: "12px 20px",
            borderRadius: 8,
            fontSize: 15,
          }}
        >
          <I18nText source={"Start learning"} />
        </Link>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, margin: "48px 0 16px" }}>
          <I18nText source={"What you can do"} />
        </h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {[
            { href: "/financial-literacy", title: "Learn", body: "Short lessons on personal finance. Review the ideas until they stick." },
            { href: "/investment-calculator", title: "Calculate", body: "Savings, TFSA, retirement annuity and living-annuity scenarios in rand." },
            { href: "/budgeting", title: "Budget", body: "From your own numbers. Statement import is lookback only." },
            { href: "/re5", title: "RE5 prep", body: "If you are studying the regulatory exam." },
          ].map((item) => (
            <li key={item.href} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
              <Link href={item.href} style={{ color: teal, fontWeight: 700, textDecoration: "none", fontSize: 16 }}>
                <I18nText source={item.title} />
              </Link>
              <p style={{ margin: "4px 0 0", color: muted, fontSize: 15, lineHeight: 1.55 }}>
                <I18nText source={item.body} />
              </p>
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, margin: "40px 0 12px" }}>
          <I18nText source={"What Notho is not"} />
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: muted, margin: 0 }}>
          <I18nText source={"Notho does not sell loans, does not log into your bank, and does not replace an FSCA-registered adviser. Cosmo answers questions about the lessons. It is not a human adviser."} />
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#666", marginTop: 40 }}>
          <I18nText source={"Founded by Kwanele Ntshangase. Previously called Fundi Finance (renamed July 2026)."} />
        </p>

        <p style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
          <Link href="/personal-finance" style={{ color: teal }}><I18nText source="Personal finance" /></Link>
          {" · "}
          <Link href="/investment-calculator" style={{ color: teal }}><I18nText source="Investment calculator" /></Link>
          {" · "}
          <Link href="/budgeting" style={{ color: teal }}><I18nText source="Budgeting" /></Link>
          {" · "}
          <Link href="/financial-literacy" style={{ color: teal }}><I18nText source="Financial literacy" /></Link>
          {" · "}
          <Link href="/re5" style={{ color: teal }}><I18nText source="RE5 prep" /></Link>
        </p>

        <p style={{ fontSize: 13, color: "#999", marginTop: 32 }}>
          <I18nText source={"Contact hello@notho.co.za."} />
        </p>
      </div>
    </main>
  );
}
