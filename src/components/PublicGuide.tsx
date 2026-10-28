import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_NAME,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const teal = "#007A85";

const wrap: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  minHeight: "100dvh",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const inner: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "40px 24px 80px",
};

const p: React.CSSProperties = {
  color: "#d0d0d0",
  fontSize: 16,
  lineHeight: 1.75,
  margin: "0 0 16px",
};

const h2: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: teal,
  margin: "36px 0 12px",
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "18px 20px",
  marginBottom: 12,
};

const cta: React.CSSProperties = {
  display: "inline-block",
  background: teal,
  color: "#fff",
  fontWeight: 700,
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: 10,
  marginRight: 12,
  marginTop: 8,
};

export function PublicGuide({
  badge,
  title,
  path,
  description,
  lede,
  children,
  faqs,
}: {
  badge: string;
  title: string;
  path: string;
  description: string;
  lede: string;
  children: React.ReactNode;
  faqs: { q: string; a: string }[];
}) {
  return (
    <main style={wrap}>
      <JsonLd data={webPageJsonLd({ path, title, description })} />
      <JsonLd data={faqJsonLd(faqs)} />
      <div style={inner}>
        <nav style={{ marginBottom: 28, fontSize: 14 }}>
          <Link href="/about" style={{ color: teal, fontWeight: 700 }}>
            {SITE_NAME}
          </Link>
          <span style={{ color: "#666", margin: "0 8px" }}>/</span>
          <span style={{ color: "#a0a0a0" }}>{title}</span>
        </nav>

        <div
          style={{
            display: "inline-block",
            backgroundColor: teal,
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          {badge}
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 14px",
          }}
        >
          {title}
        </h1>
        <p style={{ ...p, fontSize: 17, color: "#c8c8c8" }}>{lede}</p>

        <div style={{ margin: "8px 0 32px" }}>
          <Link href="/learn" style={cta}>
            Open Notho
          </Link>
          <Link
            href="/about"
            style={{ ...cta, background: "transparent", border: `1px solid ${teal}` }}
          >
            What Notho is
          </Link>
        </div>

        {children}

        <h2 style={h2}>Questions people ask</h2>
        {faqs.map((item) => (
          <div key={item.q} style={card}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#fff" }}>
              {item.q}
            </h3>
            <p style={{ ...p, margin: 0 }}>{item.a}</p>
          </div>
        ))}

        <p
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #1e1e1e",
            color: "#808080",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Notho is financial-literacy education from {SITE_NAME}. Lessons,
          calculators and budgets are illustrative. Notho is not an FSP and does
          not give personal financial advice. Operated by The Solution Org
          (Pty) Ltd, Durban, South Africa.
        </p>
      </div>
    </main>
  );
}

export const guideStyles = { p, h2, card, teal };
