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

const outcomes = [
  { label: "Lesson", title: "Needs vs wants", detail: "A short lesson, then review." },
  { label: "Calculator", title: "TFSA in 10 years", detail: "Savings, TFSA, RA and living annuity." },
  { label: "Budget", title: "Needs 68% · Wants 32%", detail: "From your own numbers." },
];

const steps = [
  { n: "1", title: "Learn a short lesson", body: "One idea at a time. Review until it sticks." },
  { n: "2", title: "Try it in the calculator", body: "See what saving and investing looks like with TFSA, retirement annuity and living annuity." },
  { n: "3", title: "See it in your budget", body: "Put your own numbers next to what you just learned." },
];

const examples = [
  { title: "Payday", body: "You want to know what is a need and what is a want before the money is gone." },
  { title: "Saving for something", body: "You want to see what a monthly amount does over 5 or 10 years." },
  { title: "Studying for RE5", body: "You want practice for the regulatory exam, not another textbook." },
];

const features = [
  { href: "/financial-literacy", title: "Learn", body: "Short lessons, then review until it sticks." },
  { href: "/investment-calculator", title: "Calculate", body: "TFSA, retirement annuity, living annuity and savings." },
  { href: "/budgeting", title: "Budget", body: "A budget from your own numbers." },
  { href: "/re5", title: "RE5 prep", body: "For the regulatory exam." },
];

const stores = [
  { href: "https://apps.apple.com/app/notho/id6808142049", label: "App Store" },
  { href: "https://play.google.com/apps/testing/za.co.notho.app", label: "Google Play" },
  { href: "https://appgallery.huawei.com/app/C118850237", label: "AppGallery" },
];

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
      <style>{`
        .about-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 48px; align-items: center; }
        .about-founder { display: grid; grid-template-columns: 120px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 800px) {
          .about-hero { grid-template-columns: 1fr; gap: 28px; }
          .about-founder { grid-template-columns: 1fr; }
        }
      `}</style>

      <JsonLd
        data={webPageJsonLd({
          path: "/about",
          title: "About Notho",
          description: SITE_DESCRIPTION,
        })}
      />

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
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Link href="/about">
            <img src="/notho-logo.png" alt="Notho" style={{ height: 40, width: "auto" }} />
          </Link>
          <nav style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 14, flexWrap: "wrap" }}>
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

      <section
        className="about-hero"
        style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px 48px" }}
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
          <p style={{ margin: "20px 0 0", fontSize: 14, color: "#666" }}>
            {stores.map((s, i) => (
              <span key={s.href}>
                {i > 0 ? " · " : null}
                <a href={s.href} target="_blank" rel="noreferrer" style={{ color: teal, textDecoration: "none" }}>
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {outcomes.map((item) => (
            <div
              key={item.label}
              style={{
                background: "#f7f9fa",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: teal, letterSpacing: "0.04em" }}>
                <I18nText source={item.label} />
              </p>
              <p style={{ margin: "4px 0 2px", fontSize: 17, fontWeight: 700, color: navy }}>
                <I18nText source={item.title} />
              </p>
              <p style={{ margin: 0, fontSize: 14, color: muted }}>
                <I18nText source={item.detail} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 56px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 12px" }}>
          <I18nText source={"Why Notho exists"} />
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: muted, margin: "0 0 12px" }}>
          <I18nText source={"Most money advice online is written for somewhere else. The limits, products and rules are different here."} />
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: muted, margin: 0 }}>
          <I18nText source={"Notho is for people in South Africa who want to learn how money works, then try it with their own numbers. No loans. No bank login. Just lessons and tools."} />
        </p>
      </section>

      <section style={{ background: "#f7f9fa", padding: "56px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 24px" }}>
            <I18nText source={"How it works"} />
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {steps.map((step) => (
              <div key={step.n}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: teal }}>{step.n}</p>
                <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: ink }}>
                  <I18nText source={step.title} />
                </h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: muted }}>
                  <I18nText source={step.body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 20px" }}>
          <I18nText source={"Who it is for"} />
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {examples.map((item) => (
            <div
              key={item.title}
              style={{
                background: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: navy }}>
                <I18nText source={item.title} />
              </h3>
              <p style={{ margin: 0, color: muted, fontSize: 15, lineHeight: 1.55 }}>
                <I18nText source={item.body} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 24px 48px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 20px" }}>
          <I18nText source={"What you can do"} />
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                background: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: 20,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: teal }}>
                <I18nText source={item.title} />
              </h3>
              <p style={{ margin: 0, color: muted, fontSize: 15, lineHeight: 1.55 }}>
                <I18nText source={item.body} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: "#f7f9fa", padding: "56px 24px" }}>
        <div className="about-founder" style={{ maxWidth: 720, margin: "0 auto" }}>
          <img
            src="/about/kwanele.jpg"
            alt="Kwanele Ntshangase"
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12 }}
          />
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 10px" }}>
              <I18nText source={"Founded by Kwanele Ntshangase"} />
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: muted, margin: "0 0 12px" }}>
              <I18nText source={"I built Notho because the tools I wanted were not in one place. Lessons short enough to finish. Calculators that know TFSA and retirement annuity. A budget that uses your numbers."} />
            </p>
            <p style={{ fontSize: 15, color: "#666", margin: 0 }}>
              <I18nText source={"Previously called Fundi Finance. Renamed July 2026."} />
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 64px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, margin: "0 0 12px" }}>
          <I18nText source={"What Notho is not"} />
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: muted, maxWidth: 640, margin: 0 }}>
          <I18nText source={"Notho does not sell loans, does not log into your bank, and does not replace an FSCA-registered adviser. Cosmo answers questions about the lessons. It is not a human adviser."} />
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
