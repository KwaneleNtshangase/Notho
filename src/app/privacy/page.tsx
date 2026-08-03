import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Notho",
  description: "Privacy Policy for Notho - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
              backgroundColor: "#007A85",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "16px",
            }}
          >
            Legal
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
            Privacy Policy
          </h1>
          <p style={{ color: "#a0a0a0", fontSize: "15px", margin: 0 }}>
            Last updated: July 2026 &nbsp;·&nbsp; The Solution Org (Pty) Ltd
          </p>
        </div>

        {/* Non-FSP / "not financial advice" disclosure - surfaced at the
            top so users see it before any other legal content. */}
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
              fontSize: 12,
              fontWeight: 700,
              color: "#EFB343",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Important notice
          </div>
          <p style={{ margin: "0 0 10px", lineHeight: 1.65, color: "#e0e0e0", fontSize: 14 }}>
            Notho is a <strong>financial-literacy education</strong>{" "}
            platform. It is <strong>not a licensed financial services provider (FSP)</strong>{" "}
            under the South African Financial Advisory and Intermediary Services
            Act (FAIS Act, 2002) and it does not render financial, investment,
            tax, or legal advice as defined in that Act.
          </p>
          <p style={{ margin: 0, lineHeight: 1.65, color: "#b8b8b8", fontSize: 13 }}>
            Lessons, calculators, budgets, and projections are illustrative and
            generic. For advice specific to your personal circumstances, consult
            an FSCA-registered financial adviser. You can verify any adviser&apos;s
            licence at{" "}
            <a
              href="https://www.fsca.co.za"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007A85" }}
            >
              fsca.co.za
            </a>
            .
          </p>
        </div>

        <Section title="1. Introduction">
          <p>
            Notho (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a
            South African personal-finance learning app available at{" "}
            <a href="https://notho.co.za" style={{ color: "#007A85" }}>
              notho.co.za
            </a>
            . We are committed to protecting your personal information in
            accordance with the Protection of Personal Information Act, 2013
            (POPIA) and applicable data-protection regulations.
          </p>
          <p>
            This Privacy Policy explains what personal information we collect,
            why we collect it, how we use it, and what rights you have. By
            using Notho you agree to the practices described here.
          </p>
          <p>
            <strong>Notho was previously called Fundi Finance.</strong> Only the
            name has changed. The app is operated by the same company, The
            Solution Org (Pty) Ltd, and this policy continues to apply to
            information collected under the former name. Nothing about how we
            handle your data changed with the rename.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of information:</p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>
              <strong>Account information</strong> - your name, email address,
              and profile photo if you sign in with Google or Facebook.
            </li>
            <li>
              <strong>Learning progress</strong> - lessons completed, XP
              earned, streaks, quiz answers, and in-app challenge data.
            </li>
            <li>
              <strong>Financial inputs</strong> - expense logs, budget figures,
              and financial goals you enter voluntarily within the app.
            </li>
            <li>
              <strong>Usage data</strong> - features you interact with,
              session timestamps, and device/browser type, collected for
              analytics and app improvement.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect payment card details, bank
            account numbers, or South African ID numbers.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>Your information is used to:</p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>Provide, personalise, and sync your learning experience across devices.</li>
            <li>Calculate and display your XP, streaks, and leaderboard ranking.</li>
            <li>Send optional in-app notifications about your progress or new content.</li>
            <li>Improve app features through anonymised, aggregated analytics.</li>
            <li>Comply with legal obligations under South African law.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal information to third
            parties or use it to serve advertisements.
          </p>
        </Section>

        <Section title="4. Data Sharing">
          <p>
            We share your data only with trusted service providers necessary to
            operate the app:
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>
              <strong>Supabase</strong> - our database and authentication
              provider, hosting data on servers in the European Union under
              GDPR-compliant terms.
            </li>
            <li>
              <strong>Vercel</strong> - our web-hosting provider, for
              serving the app.
            </li>
            <li>
              <strong>Google &amp; Meta (Facebook)</strong> - solely for
              OAuth sign-in; we receive only the account profile data you
              authorise during the login flow.
            </li>
          </ul>
          <p>
            These providers are contractually prohibited from using your data
            for their own purposes. We do not share data with any other third
            party except as required by South African law or a court order.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your account and learning data for as long as your
            account is active. If you request deletion (see Section 7), we
            will remove your personal information from our systems within
            30 days, except where retention is required by law.
          </p>
          <p>
            Anonymised, aggregated analytics data (with no link to you
            personally) may be retained indefinitely for product-improvement
            purposes.
          </p>
        </Section>

        <Section title="6. Cookies, sessions, and where your data lives">
          <p>
            Your <strong>learning progress</strong> (lessons completed, XP,
            streaks, quiz results, challenges, and budget entries you save) is
            stored securely in our database and linked to your account when you
            are signed in, so it can sync across devices.
          </p>
          <p>
            We place a few small <strong>first-party cookies</strong> on your
            device for non-sensitive preferences only - for example dark mode,
            whether you have finished the first-time onboarding flow, and
            whether you dismissed the &ldquo;add to home screen&rdquo; prompt. These
            values are not used to identify you beyond the app experience.
          </p>
          <p>
            Some in-app toggles (such as sound effects) apply for your current
            browser session only and are not written to persistent storage on
            your device.
          </p>
          <p>
            We do <strong>not</strong> store your account progress, scores, or
            other sensitive personal data in your browser&apos;s{" "}
            <strong>local storage</strong> or <strong>session storage</strong>{" "}
            APIs. Session cookies are used where needed for authentication. We
            do not use advertising or tracking cookies.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            Under POPIA and applicable law, you have the right to:
          </p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>
              <strong>Access</strong> - request a copy of the personal
              information we hold about you.
            </li>
            <li>
              <strong>Correct</strong> - ask us to fix inaccurate or
              incomplete information.
            </li>
            <li>
              <strong>Delete</strong> - request that we delete your personal
              information (see Section 8 below for Facebook data-deletion
              instructions).
            </li>
            <li>
              <strong>Object</strong> - object to the processing of your
              data in certain circumstances.
            </li>
            <li>
              <strong>Portability</strong> - receive your data in a
              machine-readable format.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:support@notho.co.za"
              style={{ color: "#007A85" }}
            >
              support@notho.co.za
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="8. Data Deletion" id="data-deletion">
          <p>
            You can request complete deletion of your Notho account and
            all associated personal data at any time.
          </p>
          <p>
            <strong>How to delete your data:</strong>
          </p>
          <ol style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>
              Email{" "}
              <a
                href="mailto:support@notho.co.za"
                style={{ color: "#007A85" }}
              >
                support@notho.co.za
              </a>{" "}
              with the subject line <em>&ldquo;Data Deletion Request&rdquo;</em> and the
              email address associated with your account.
            </li>
            <li>
              We will verify your identity and confirm receipt within
              5 business days.
            </li>
            <li>
              Your account and all personal data will be permanently deleted
              from our systems within 30 days of verification.
            </li>
          </ol>
          <p>
            If you signed in with Facebook, you may also initiate deletion
            directly via the Facebook platform: go to{" "}
            <strong>
              Facebook Settings &rarr; Apps and Websites &rarr; Notho
              &rarr; Remove
            </strong>
            . While our rename is completing, this may still be listed as{" "}
            <strong>Fundi Finance</strong>; both refer to the same app. This
            will revoke our access token. To ensure full deletion of your data
            from our servers, please also send us the deletion email above.
          </p>
          <p>
            After deletion you will lose all learning progress, XP, and
            account history permanently. This action cannot be undone.
          </p>
        </Section>

        <Section title="9. Contact Us">
          <p>
            If you have questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <address
            style={{
              fontStyle: "normal",
              lineHeight: 1.8,
              color: "#c0c0c0",
            }}
          >
            The Solution Org (Pty) Ltd
            <br />
            South Africa
            <br />
            <a
              href="mailto:support@notho.co.za"
              style={{ color: "#007A85" }}
            >
              support@notho.co.za
            </a>
            <br />
            <a href="https://notho.co.za" style={{ color: "#007A85" }}>
              notho.co.za
            </a>
          </address>
          <p style={{ marginTop: "16px" }}>
            If you are not satisfied with our response, you may lodge a
            complaint with the{" "}
            <strong>Information Regulator of South Africa</strong> at{" "}
            <a
              href="https://inforegulator.org.za"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007A85" }}
            >
              inforegulator.org.za
            </a>
            .
          </p>
        </Section>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e1e1e",
            color: "#505050",
            fontSize: "13px",
          }}
        >
          &copy; {new Date().getFullYear()} The Solution Org (Pty) Ltd. All rights reserved.
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ marginBottom: "36px", scrollMarginTop: "80px" }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#007A85",
          marginBottom: "12px",
          marginTop: 0,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "#d0d0d0",
          fontSize: "15px",
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </section>
  );
}
