import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete Your Account | Notho",
  description:
    "How to delete your Notho account and all associated data, or export it first.",
};

/* ── Shared inline styles (matches privacy/terms/support conventions) ─ */

const bg = "#0a0a0a";
const teal = "#007A85";

const wrap: React.CSSProperties = {
  backgroundColor: bg,
  color: "#ffffff",
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

export default function AccountDeletionPage() {
  return (
    <main style={wrap}>
      <div style={inner}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
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
            Account
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 12px",
              color: "#ffffff",
            }}
          >
            Delete Your Account
          </h1>
          <p style={{ color: "#a0a0a0", fontSize: 15, margin: 0 }}>
            You can delete your Notho account and all associated data at any
            time. Here&apos;s how.
          </p>
        </div>

        {/* Self-service deletion */}
        <div style={card}>
          <h2 style={h2}>Option 1 — Delete it yourself, instantly</h2>
          <ol
            style={{
              paddingLeft: 20,
              margin: 0,
              color: "#d0d0d0",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li>
              Open <strong>Settings</strong> in the app.
            </li>
            <li>
              Tap <strong>Delete My Data</strong>. We&apos;ll ask why
              you&apos;re leaving — this is <strong>optional</strong>; there is
              a <strong>Skip</strong> button, and skipping does not delay or
              affect your deletion in any way.
            </li>
            <li>
              Confirm. Your account and all data attached to it are erased
              immediately. <strong>This cannot be undone.</strong>
            </li>
          </ol>
        </div>

        {/* Export first */}
        <div style={card}>
          <h2 style={h2}>Export your data first</h2>
          <p style={p}>
            Before you delete, you can download everything we hold on you.
            Go to <strong>Settings</strong> and tap{" "}
            <strong>Download my data</strong>. You&apos;ll receive a JSON file
            with your learning progress, budget entries, imported transactions,
            and coach conversations.
          </p>
        </div>

        {/* What gets deleted */}
        <div style={card}>
          <h2 style={h2}>What gets deleted</h2>
          <p style={p}>
            When you delete your account, <strong>all</strong> of the following
            are permanently removed:
          </p>
          <ul
            style={{
              paddingLeft: 20,
              margin: "0 0 12px",
              color: "#d0d0d0",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li>Your account information (name, email, profile photo)</li>
            <li>Learning progress, XP, streaks, and quiz results</li>
            <li>Budget entries and financial goals</li>
            <li>
              Imported transactions (the categorised data extracted from your
              bank statements — raw statement files are never stored)
            </li>
            <li>Cosmo coach conversations</li>
            <li>Push notification subscriptions</li>
          </ul>
          <p style={{ ...p, marginBottom: 0 }}>
            The only thing that is <strong>not</strong> erased is anonymous exit
            feedback, if you chose to give any. It carries no name, email, or
            account identifier and cannot be traced back to you. See{" "}
            <Link href="/privacy#data-deletion" style={link}>
              Section 8 of the Privacy Policy
            </Link>{" "}
            for full details.
          </p>
        </div>

        {/* Email fallback */}
        <div style={card}>
          <h2 style={h2}>Option 2 — Request deletion by email</h2>
          <ol
            style={{
              paddingLeft: 20,
              margin: 0,
              color: "#d0d0d0",
              fontSize: 15,
              lineHeight: 1.9,
            }}
          >
            <li>
              Email{" "}
              <a href="mailto:support@notho.co.za" style={link}>
                support@notho.co.za
              </a>{" "}
              with the subject line{" "}
              <em>&ldquo;Data Deletion Request&rdquo;</em> and the email address
              associated with your account.
            </li>
            <li>
              We&apos;ll verify your identity and confirm receipt within
              5&nbsp;business&nbsp;days.
            </li>
            <li>
              Your account and all personal data will be permanently deleted
              within 30&nbsp;days of verification.
            </li>
          </ol>
        </div>

        {/* Facebook */}
        <div style={card}>
          <h2 style={h2}>Signed in with Facebook?</h2>
          <p style={{ ...p, marginBottom: 0 }}>
            You can also revoke access from{" "}
            <strong>
              Facebook Settings &rarr; Apps and Websites &rarr; Notho &rarr;
              Remove
            </strong>
            . While our rename is completing, this may still appear as{" "}
            <strong>Fundi Finance</strong>; both refer to the same app. To
            ensure full deletion from our servers, please also send the
            deletion email above.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #1e1e1e",
            color: "#505050",
            fontSize: 13,
          }}
        >
          <p>
            Questions?{" "}
            <a href="mailto:support@notho.co.za" style={{ color: teal }}>
              support@notho.co.za
            </a>
          </p>
          <p style={{ marginTop: 8 }}>
            &copy; {new Date().getFullYear()} The Solution Org (Pty) Ltd. All
            rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
