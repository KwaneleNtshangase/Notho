import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import {
  DISAMBIGUATION,
  SITE_DESCRIPTION,
  canonical,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Notho",
  description: SITE_DESCRIPTION,
  alternates: { canonical: canonical("/about") },
  openGraph: {
    title: "Notho — financial literacy for South Africa",
    description: SITE_DESCRIPTION,
    url: canonical("/about"),
    type: "website",
  },
};

const teal = "#007A85";
const photo = "/about/kwanele.jpg";

export default function AboutPage() {
  return (
    <main
      style={{
        backgroundColor: "#0a0a0a",
        color: "#fff",
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

      {/* Hero */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "64px 24px 48px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              color: teal,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontSize: 13,
              margin: "0 0 12px",
            }}
          >
            <I18nText source={"About"} />
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.08,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            <I18nText source={"Notho is how South Africans learn money."} />
          </h1>
          <p
            style={{
              color: "#c8c8c8",
              fontSize: 18,
              lineHeight: 1.6,
              margin: "0 0 28px",
              maxWidth: 520,
            }}
          >
            <I18nText source={"Short lessons, real calculators in rand, and a budget that uses your own numbers. Not an FSP. Not advice. Just clearer money skills."} />
          </p>
          <Link
            href="/learn"
            style={{
              display: "inline-block",
              background: teal,
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: 12,
              fontSize: 16,
            }}
          >
            <I18nText source={"Start learning"} />
          </Link>
        </div>
        <img
          src={photo}
          alt="Kwanele Ntshangase"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid #1a1a1a",
            boxShadow: "0 8px 32px rgba(0,122,133,0.15)",
          }}
        />
      </section>

      {/* Mission */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 48px",
        }}
      >
        <p
          style={{
            color: "#a0a0a0",
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 680,
            margin: 0,
          }}
        >
          <I18nText>{SITE_DESCRIPTION}</I18nText>
        </p>
        <p
          style={{
            color: "#808080",
            fontSize: 14,
            lineHeight: 1.6,
            marginTop: 12,
          }}
        >
          <I18nText>{DISAMBIGUATION}</I18nText>
        </p>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 64px",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 24px",
          }}
        >
          <I18nText source={"What you can do"} />
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              href: "/financial-literacy",
              title: "Learn",
              body: "Short lessons on personal finance. Review the ideas until they stick.",
            },
            {
              href: "/investment-calculator",
              title: "Calculate",
              body: "Savings, TFSA, retirement annuity and living-annuity scenarios in rand.",
            },
            {
              href: "/budgeting",
              title: "Budget",
              body: "From your own numbers. Statement import is lookback only.",
            },
            {
              href: "/re5",
              title: "RE5 prep",
              body: "If you are studying the regulatory exam.",
            },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              style={{
                display: "block",
                background: "#141414",
                border: "1px solid #222",
                borderRadius: 16,
                padding: 24,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: teal }}>
                <I18nText source={f.title} />
              </h3>
              <p style={{ margin: 0, color: "#b0b0b0", fontSize: 15, lineHeight: 1.55 }}>
                <I18nText source={f.body} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* What we are not */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 64px",
        }}
      >
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 16,
            padding: "32px 28px",
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800 }}>
            <I18nText source={"What Notho is not"} />
          </h2>
          <p style={{ margin: 0, color: "#c0c0c0", fontSize: 16, lineHeight: 1.65 }}>
            <I18nText source={"Notho does not sell loans, does not log into your bank, and does not replace an FSCA-registered adviser. Cosmo answers literacy questions. It is not a human adviser and not a product salesperson."} />
          </p>
        </div>
      </section>

      {/* Founder */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 64px",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        <img
          src={photo}
          alt="Kwanele Ntshangase"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>
            <I18nText source={"Built by Kwanele Ntshangase"} />
          </h2>
          <p style={{ margin: 0, color: "#b0b0b0", fontSize: 16, lineHeight: 1.65 }}>
            <I18nText source={"Notho was founded by Kwanele Ntshangase. Previously called Fundi Finance (renamed July 2026)."} />
          </p>
        </div>
      </section>

      {/* Guides + footer */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <p style={{ color: "#808080", fontSize: 14, margin: "0 0 8px" }}>
          <I18nText source={"Guides"} />
        </p>
        <p style={{ margin: "0 0 32px" }}>
          <Link href="/personal-finance" style={{ color: teal, marginRight: 16 }}>
            <I18nText source={"Personal finance"} />
          </Link>
          <Link href="/investment-calculator" style={{ color: teal, marginRight: 16 }}>
            <I18nText source={"Investment calculator"} />
          </Link>
          <Link href="/budgeting" style={{ color: teal, marginRight: 16 }}>
            <I18nText source={"Budgeting"} />
          </Link>
          <Link href="/financial-literacy" style={{ color: teal, marginRight: 16 }}>
            <I18nText source={"Financial literacy"} />
          </Link>
          <Link href="/re5" style={{ color: teal }}>
            <I18nText source={"RE5 prep"} />
          </Link>
        </p>
        <p style={{ color: "#606060", fontSize: 13 }}>
          <I18nText source={"Founded by Kwanele Ntshangase. Contact hello@notho.co.za."} />
        </p>
      </section>
    </main>
  );
}
