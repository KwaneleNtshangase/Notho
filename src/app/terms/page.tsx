import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Notho",
  description: "Terms of Service for Notho - read before using the app.",
};

export default function TermsPage() {
  return (
    <main
      style={{
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        minHeight: "100dvh",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-block",
              background: "#007A85",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              padding: "5px 12px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            Legal
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: "0 0 12px",
              color: "#ffffff",
            }}
          >
            Terms of Service
          </h1>
          <p style={{ color: "#a0a0a0", fontSize: "15px", margin: 0 }}>
            Last updated: July 2026 &nbsp;&middot;&nbsp; The Solution Org (Pty) Ltd
          </p>
        </div>

        {/* Important Notice */}
        <div
          style={{
            background: "rgba(239,179,67,0.08)",
            border: "1px solid rgba(239,179,67,0.35)",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              color: "#EFB343",
              marginBottom: "10px",
            }}
          >
            Important Notice
          </div>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#d0d0d0",
              margin: 0,
            }}
          >
            Notho is a{" "}
            <strong style={{ color: "#ffffff" }}>
              financial-literacy education
            </strong>{" "}
            platform. It is{" "}
            <strong style={{ color: "#ffffff" }}>
              not a licensed financial services provider (FSP)
            </strong>{" "}
            under the South African Financial Advisory and Intermediary Services
            Act (FAIS Act, 2002) and it does not render financial, investment,
            tax, or legal advice as defined in that Act.
          </p>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#a0a0a0",
              margin: "12px 0 0",
            }}
          >
            Lessons, calculators, budgets, and projections are illustrative and
            generic. For advice specific to your personal circumstances, consult
            an FSCA-registered financial adviser. You can verify any adviser&apos;s
            licence at{" "}
            <a
              href="https://fsca.co.za"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007A85" }}
            >
              fsca.co.za
            </a>
            .
          </p>
        </div>

        {/* Sections */}
        {[
          { title: "1. Acceptance of Terms", body: "By accessing or using Notho (\"Service\"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. We may update these terms and will notify you of material changes via the app." },
          { title: "1a. Change of Name", body: "Notho was previously called Fundi Finance. The name and branding changed in July 2026. The Service is operated by the same company, The Solution Org (Pty) Ltd, and these Terms continue in force for accounts created under the former name. No other term was altered by the rename, and your account, progress and any agreement you accepted as a Fundi Finance user remain valid and unchanged." },
          { title: "2. Description of Service", body: "Notho is a financial literacy app that provides educational content, budgeting tools, and gamified learning experiences. It is designed for general financial education purposes only and does not constitute financial advice." },
          { title: "3. Not Financial Advice", body: "Nothing in the Notho app, including lessons, calculator results, or investment projections, constitutes personalised financial, investment, tax, or legal advice. Always consult a qualified financial advisor before making financial decisions." },
          { title: "4. Acceptable Use", body: "You may use the Service only for lawful purposes. You agree not to: share your account credentials; attempt to reverse-engineer or scrape the app; upload harmful or offensive content; impersonate other users or misrepresent your identity on the leaderboard." },
          { title: "5. Intellectual Property", body: "All content in the app - including lessons, graphics, the Notho name and logo, and the former Fundi Finance name and logo - is owned by or licensed to The Solution Org (Pty) Ltd. You may not reproduce, distribute, or create derivative works from any app content without our written permission." },
          { title: "6. User-Generated Content", body: "Any display names, profile information, or content you submit to the Service grants us a licence to display it within the app. You retain ownership of your content but are responsible for ensuring it does not violate these terms." },
          { title: "7. Account Termination", body: "We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or any other reason at our discretion. You may delete your account at any time by contacting privacy@notho.co.za." },
          { title: "8. Limitation of Liability", body: "To the fullest extent permitted by law, The Solution Org (Pty) Ltd and its team shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability for any claim shall not exceed any amount you have paid to us in the preceding 12 months." },
          { title: "9. Governing Law", body: "These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts." },
          { title: "10. Contact", body: "For any questions about these Terms, contact us at legal@notho.co.za." },
        ].map((s) => (
          <Section key={s.title} title={s.title}>
            <p>{s.body}</p>
          </Section>
        ))}

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e1e1e",
            color: "#505050",
            fontSize: "13px",
          }}
        >
          &copy; {new Date().getFullYear()} The Solution Org (Pty) Ltd. All rights
          reserved.
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "36px" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "#007A85",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: "15px",
          lineHeight: 1.8,
          color: "#c0c0c0",
        }}
      >
        {children}
      </div>
    </section>
  );
}
