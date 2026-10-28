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
const p: React.CSSProperties = {
  color: "#d0d0d0",
  fontSize: 16,
  lineHeight: 1.75,
  margin: "0 0 16px",
};

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
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ color: teal, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
          About
        </p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 800, margin: "8px 0 16px" }}>
          Notho is how South Africans learn money.
        </h1>
        <p style={p}>{SITE_DESCRIPTION}</p>
        <p style={p}>{DISAMBIGUATION}</p>

        <p>
          <Link
            href="/learn"
            style={{
              display: "inline-block",
              background: teal,
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 10,
              margin: "8px 12px 28px 0",
            }}
          >
            Start learning
          </Link>
        </p>

        <h2 style={{ color: teal, fontSize: 22, fontWeight: 800 }}>What you can do in Notho</h2>
        <ul style={{ color: "#d0d0d0", fontSize: 16, lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            <Link href="/financial-literacy" style={{ color: teal, fontWeight: 600 }}>Learn</Link> personal finance in short lessons, then review the ideas until they stick.
          </li>
          <li>
            <Link href="/investment-calculator" style={{ color: teal, fontWeight: 600 }}>Calculate</Link> savings, investments, TFSA, retirement annuity and living-annuity scenarios in rand.
          </li>
          <li>
            <Link href="/budgeting" style={{ color: teal, fontWeight: 600 }}>Budget</Link> from your own numbers, including statement import for lookback.
          </li>
          <li>Set money goals on the Goals tab when you are ready.</li>
          <li>
            <Link href="/re5" style={{ color: teal, fontWeight: 600 }}>Prepare for RE5</Link> if you are studying the regulatory exam.
          </li>
        </ul>

        <h2 style={{ color: teal, fontSize: 22, fontWeight: 800, marginTop: 32 }}>What Notho is not</h2>
        <p style={p}>
          Notho does not sell loans, does not log into your bank, and does not replace an FSCA-registered adviser.
          Cosmo answers literacy questions. It is not a human adviser and not a product salesperson.
        </p>

        <h2 style={{ color: teal, fontSize: 22, fontWeight: 800 }}>Guides</h2>
        <p style={p}>
          <Link href="/personal-finance" style={{ color: teal }}>Personal finance in South Africa</Link>
          {" \u00b7 "}
          <Link href="/investment-calculator" style={{ color: teal }}>Investment calculator</Link>
          {" \u00b7 "}
          <Link href="/budgeting" style={{ color: teal }}>Budgeting</Link>
          {" \u00b7 "}
          <Link href="/financial-literacy" style={{ color: teal }}>Financial literacy</Link>
          {" \u00b7 "}
          <Link href="/re5" style={{ color: teal }}>RE5 prep</Link>
        </p>

        <p style={{ color: "#808080", fontSize: 14, marginTop: 40 }}>
          Operated by The Solution Org (Pty) Ltd. Previously called Fundi Finance (renamed July 2026).
          Contact hello@notho.co.za.
        </p>
      </div>
    </main>
  );
}
