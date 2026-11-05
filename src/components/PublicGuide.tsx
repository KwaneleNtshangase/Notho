import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import {
  SITE_NAME,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const teal = "#007A85";

const wrap: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  minHeight: "100dvh",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const inner: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "40px 24px 80px",
};

const p: React.CSSProperties = {
  color: "#333333",
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
  background: "#f7f9fa",
  border: "1px solid #e8e8e8",
  borderRadius: 12,
  padding: "18px 20px",
  marginBottom: 12,
};

const cta: React.CSSProperties = {
  display: "inline-block",
  background: teal,
  color: "#ffffff",
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
    <main className="public-page" style={wrap}>
      <PublicHeader />
      <JsonLd data={webPageJsonLd({ path, title, description })} />
      <JsonLd data={faqJsonLd(faqs)} />
      <div style={inner}>
        <nav style={{ marginBottom: 28, fontSize: 14 }}>
          <Link href="/about" style={{ color: teal, fontWeight: 700 }}>
            <I18nText>{SITE_NAME}</I18nText>
          </Link>
          <span style={{ color: "#888", margin: "0 8px" }}>/</span>
          <span style={{ color: "#666" }}><I18nText>{title}</I18nText></span>
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
          <I18nText>{badge}</I18nText>
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 14px",
          }}
        >
          <I18nText>{title}</I18nText>
        </h1>
        <p style={{ ...p, fontSize: 17, color: "#4a4a4a" }}><I18nText>{lede}</I18nText></p>

        <div style={{ margin: "8px 0 32px" }}>
          <Link href="/learn" style={cta}><I18nText source={"Open Notho"} /></Link>
          <Link
            href="/about"
            style={{ ...cta, background: "transparent", border: `1px solid ${teal}` }}
          ><I18nText source={"What Notho is"} /></Link>
        </div>

        <I18nText>{children}</I18nText>

        <h2 style={h2}><I18nText source={"Questions people ask"} /></h2>
        {faqs.map((item) => (
          <div key={item.q} style={card}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#1a1a1a" }}>
              <I18nText>{item.q}</I18nText>
            </h3>
            <p style={{ ...p, margin: 0 }}><I18nText>{item.a}</I18nText></p>
          </div>
        ))}

      </div>
      <PublicFooter />
    </main>
  );
}

export const guideStyles = { p, h2, card, teal };
