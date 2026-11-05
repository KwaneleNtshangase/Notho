import { LocalizedRichText as I18nRich, LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Support | Notho",
  description:
    "Get help with Notho — contact us, find answers, or manage your account.",
};

/* ── Shared inline styles (matches privacy/terms page conventions) ─── */

const bg = "#ffffff";
const teal = "#007A85";

const wrap: React.CSSProperties = {
  backgroundColor: bg,
  color: "#1a1a1a",
  minHeight: "100dvh",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  padding: 0,
  margin: 0,
};

const inner: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 24px 80px",
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "20px 22px",
  marginBottom: 16,
};

const h2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: teal,
  marginBottom: 12,
  marginTop: 0,
};

const p: React.CSSProperties = {
  color: "#d0d0d0",
  fontSize: 15,
  lineHeight: 1.75,
  margin: "0 0 12px",
};

const link: React.CSSProperties = { color: teal, fontWeight: 600 };

/* ── Page ─────────────────────────────────────────────────────────── */

export default function SupportPage() {
  return (
    <>
    <PublicHeader />
    <main className="public-page" style={wrap}>
      <div style={inner}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: teal,
              color: "#1a1a1a",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 20,
              marginBottom: 16,
            }}
          ><I18nText source={"Help"} /></div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 12px",
              color: "#1a1a1a",
            }}
          ><I18nText source={"Support"} /></h1>
          <p style={{ color: "#a0a0a0", fontSize: 15, margin: 0 }}><I18nText source={"We're here to help. Most questions are answered in the pages below, but if not — email us and we'll get back to you."} /></p>
        </div>

        {/* Contact card */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Contact us"} /></h2>
          <p style={p}><I18nRich source={"Email  <a0>support@notho.co.za</a0>  and we'll respond within 2 business days."} elements={[<a key="inline-0" href="mailto:support@notho.co.za" style={link} />]} /></p>
          <p style={{ ...p, marginBottom: 0 }}><I18nText source={"Please include the email address linked to your Notho account so we can find you quickly."} /></p>
        </div>

        {/* Quick links */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Before you email"} /></h2>
          <p style={p}><I18nText source={"These pages cover the most common questions:"} /></p>
          <ul
            style={{
              paddingLeft: 20,
              margin: 0,
              color: "#d0d0d0",
              fontSize: 15,
              lineHeight: 2,
            }}
          >
            <li>
              <Link href="/privacy" style={link}><I18nText source={"Privacy Policy"} /></Link><I18nText>{" "}</I18nText>
              <I18nText source={"— what data we collect and how we use it"} /></li>
            <li>
              <Link href="/terms" style={link}><I18nText source={"Terms of Service"} /></Link><I18nText>{" "}</I18nText>
              <I18nText source={"— rules of the road"} /></li>
            <li>
              <Link href="/security" style={link}><I18nText source={"Your Data & Security"} /></Link><I18nText>{" "}</I18nText>
              <I18nText source={"— how we protect your information"} /></li>
            <li>
              <Link href="/account-deletion" style={link}><I18nText source={"Delete Your Account"} /></Link><I18nText>{" "}</I18nText>
              <I18nText source={"— how to erase your data"} /></li>
          </ul>
        </div>

        {/* Entity info */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #1e1e1e",
            color: "#505050",
            fontSize: 13,
          }}
        >
          <address style={{ fontStyle: "normal", lineHeight: 1.8 }}>
            <I18nText source={"Kwanele Ntshangase"} /><br />
            <I18nText source={"South Africa"} /><br />
            <a
              href="mailto:support@notho.co.za"
              style={{ color: teal }}
            ><I18nText source={"support@notho.co.za"} /></a>
          </address>
          <p style={{ marginTop: 16 }}><I18nText source={"© {value0} Kwanele Ntshangase. All rights reserved."} values={[new Date().getFullYear()]} /></p>
        </div>
      </div>
    </main>
    <PublicFooter />
    </>
  );
}
