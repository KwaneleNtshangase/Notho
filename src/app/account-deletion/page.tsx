import { LocalizedRichText as I18nRich, LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Delete Your Account | Notho",
  description:
    "How to delete your Notho account and all associated data, or export it first.",
};

/* ── Shared inline styles (matches privacy/terms/support conventions) ─ */

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
  background: "#f7f9fa",
  border: "1px solid #e8e8e8",
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
  color: "#333333",
  fontSize: 15,
  lineHeight: 1.75,
  margin: "0 0 12px",
};

const link: React.CSSProperties = { color: teal, fontWeight: 600 };

/* ── Page ─────────────────────────────────────────────────────────── */

export default function AccountDeletionPage() {
  return (
    <PublicHeader />
    <main style={wrap}>
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
          ><I18nText source={"Account"} /></div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 12px",
              color: "#1a1a1a",
            }}
          ><I18nText source={"Delete Your Account"} /></h1>
          <p style={{ color: "#555555", fontSize: 15, margin: 0 }}><I18nText source={"You can delete your Notho account and all associated data at any time. Here's how."} /></p>
        </div>

        {/* Self-service deletion */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Option 1 — Delete it yourself, instantly"} /></h2>
          <ol
            style={{
              paddingLeft: 20,
              margin: 0,
              color: "#333333",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li><I18nRich source={"Open <strong0>Settings</strong0>  in the app."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"Tap <strong0>Delete My Data</strong0>. We'll ask why you're leaving — this is <strong1>optional</strong1>; there is a <strong2>Skip</strong2>  button, and skipping does not delay or affect your deletion in any way."} elements={[<strong key="inline-0" />, <strong key="inline-1" />, <strong key="inline-2" />]} /></li>
            <li><I18nRich source={"Confirm. Your account and all data attached to it are erased immediately. <strong0>This cannot be undone.</strong0>"} elements={[<strong key="inline-0" />]} /></li>
          </ol>
        </div>

        {/* Export first */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Export your data first"} /></h2>
          <p style={p}><I18nRich source={"Before you delete, you can download everything we hold on you. Go to <strong0>Settings</strong0>  and tap  <strong1>Download my data</strong1>. You'll receive a JSON file with your learning progress, budget entries, imported transactions, and coach conversations."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></p>
        </div>

        {/* What gets deleted */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"What gets deleted"} /></h2>
          <p style={p}><I18nRich source={"When you delete your account, <strong0>all</strong0>  of the following are permanently removed:"} elements={[<strong key="inline-0" />]} /></p>
          <ul
            style={{
              paddingLeft: 20,
              margin: "0 0 12px",
              color: "#333333",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li><I18nText source={"Your account information (name, email, profile photo)"} /></li>
            <li><I18nText source={"Learning progress, XP, streaks, and quiz results"} /></li>
            <li><I18nText source={"Budget entries and financial goals"} /></li>
            <li><I18nText source={"Imported transactions (the categorised data extracted from your bank statements — raw statement files are never stored)"} /></li>
            <li><I18nText source={"Cosmo coach conversations"} /></li>
            <li><I18nText source={"Push notification subscriptions"} /></li>
          </ul>
          <p style={{ ...p, marginBottom: 0 }}>
            <I18nText source={"The only thing that is "} /><strong><I18nText source={"not"} /></strong> <I18nText source={" erased is anonymous exit feedback, if you chose to give any. It carries no name, email, or account identifier and cannot be traced back to you. See"} /><I18nText>{" "}</I18nText>
            <Link href="/privacy#data-deletion" style={link}><I18nText source={"Section 8 of the Privacy Policy"} /></Link><I18nText>{" "}</I18nText>
            <I18nText source={"for full details."} /></p>
        </div>

        {/* Email fallback */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Option 2 — Request deletion by email"} /></h2>
          <ol
            style={{
              paddingLeft: 20,
              margin: 0,
              color: "#333333",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li><I18nRich source={"Email  <a0>support@notho.co.za</a0>  with the subject line  <em1>“Data Deletion Request”</em1>  and the email address associated with your account."} elements={[<a key="inline-0" href="mailto:support@notho.co.za" style={link} />, <em key="inline-1" />]} /></li>
            <li><I18nText source={"We'll verify your identity and confirm receipt within 5 business days."} /></li>
            <li><I18nText source={"Your account and all personal data will be permanently deleted within 30 days of verification."} /></li>
          </ol>
        </div>

        {/* Facebook */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Signed in with Facebook?"} /></h2>
          <p style={{ ...p, marginBottom: 0 }}><I18nRich source={"You can also revoke access from  <strong0>Facebook Settings → Apps and Websites → Notho → Remove</strong0> . While our rename is completing, this may still appear as  <strong1>Fundi Finance</strong1>; both refer to the same app. To ensure full deletion from our servers, please also send the deletion email above."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></p>
        </div>

        {/* Apple */}
        <div style={card}>
          <h2 style={h2}><I18nText source={"Signed in with Apple?"} /></h2>
          <p style={{ ...p, marginBottom: 0 }}><I18nRich source={"Deleting your account in Notho removes your Notho account and data. You can also disconnect Notho from your Apple Account under  <strong0>Sign-In & Security → Sign in with Apple → Notho → Stop Using Sign in with Apple</strong0>  at  <a1>account.apple.com</a1> ."} elements={[<strong key="inline-0" />, <a key="inline-1" href="https://account.apple.com" style={link} />]} /></p>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #1e1e1e",
            color: "#777777",
            fontSize: 13,
          }}
        >
          <p><I18nRich source={"Questions?  <a0>support@notho.co.za</a0>"} elements={[<a key="inline-0" href="mailto:support@notho.co.za" style={{ color: teal }} />]} /></p>
          <p style={{ marginTop: 8 }}><I18nText source={"© {value0} Kwanele Ntshangase. All rights reserved."} values={[new Date().getFullYear()]} /></p>
        </div>
      </div>
    </main>
    <PublicFooter />
  );
}
