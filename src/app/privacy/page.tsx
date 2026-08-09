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
            Last updated: August 2026 &nbsp;·&nbsp; The Solution Org (Pty) Ltd
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
              <strong>Imported bank transactions</strong> - if you choose to
              upload a bank statement, the transaction rows we extract from it
              (date, amount, description, category). See Section 4a for how the
              file itself is handled.
            </li>
            <li>
              <strong>Coach conversations</strong> - the questions you ask
              Cosmo, our optional AI money coach, and its replies. Only stored
              if you switch Cosmo on. See Section 9.
            </li>
            <li>
              <strong>Notification subscriptions</strong> - if you opt in to
              push notifications. See Section 4b.
            </li>
            <li>
              <strong>Usage data</strong> - features you interact with,
              session timestamps, and device/browser type, collected for
              analytics and app improvement.
            </li>
            <li>
              <strong>Diagnostics</strong> - crash reports and error logs, so we
              can find and fix what breaks.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect payment card details, bank
            account numbers, banking login credentials, South African ID
            numbers, or your location.
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
            <li>
              <strong>Google (Gemini API)</strong> - powers Cosmo, our optional
              AI money coach. Cosmo is switched off until you turn it on. When
              you do, we send Google only an{" "}
              <strong>anonymised summary</strong> of your budget: category
              totals and monthly income. We never send your name, email,
              merchant names, transaction descriptions, or any other
              identifying detail. See Section 9 for the full explanation.
            </li>
            <li>
              <strong>PostHog</strong> - product analytics, so we can see which
              features are used and where the app breaks. Used for aggregate
              measurement only; we do not use it to track you across other apps
              or websites, and we do not run advertising.
            </li>
            <li>
              <strong>Resend</strong> - sends our transactional email (welcome
              messages, budget alerts, and replies to your requests). Receives
              your email address and the contents of that message only.
            </li>
          </ul>
          <p>
            These providers are contractually prohibited from using your data
            for their own purposes. We do not sell your personal information,
            we do not share it with advertisers, and we do not share it with
            any other third party except as required by South African law or a
            court order.
          </p>
        </Section>

        <Section title="4a. Bank statements you upload">
          <p>
            Notho never connects to your bank. We do not ask for your banking
            username, password, PIN, or one-time PIN, and we have no ability to
            log into your account or move money. The only way your transactions
            reach Notho is if <strong>you</strong> export a statement from your
            bank and upload it yourself.
          </p>
          <p>
            When you upload a statement, the file is read on our server{" "}
            <strong>in memory only</strong> in order to extract the transaction
            rows. The file itself is never written to disk and never stored.
            What we keep is the extracted transaction data - date, amount,
            description, and the category it was sorted into - saved against
            your account so your budget works across devices.
          </p>
          <p>
            You can delete any imported batch from within the Budget screen, or
            erase everything at once by deleting your account (Section 8).
          </p>
        </Section>

        <Section title="4b. Push notifications">
          <p>
            If you opt in to notifications, we store a{" "}
            <strong>push subscription</strong> for your device - an endpoint URL
            and the encryption keys your browser generates. This lets us send
            reminders about your streak, budget alerts, and new content. It
            contains no personal information and cannot be used to identify you
            outside the app.
          </p>
          <p>
            You can turn notifications off at any time in Settings, or in your
            browser or device settings. Doing so deletes the subscription.
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
            <strong>The fastest way - delete it yourself, instantly:</strong>
          </p>
          <ol style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>
              Open <strong>Settings</strong> in the app.
            </li>
            <li>
              Tap <strong>Delete account</strong> and confirm.
            </li>
            <li>
              Your account and every piece of data attached to it - budget
              entries, imported transactions, learning progress, XP, coach
              conversations, and notification subscriptions - are erased
              immediately. This cannot be undone.
            </li>
          </ol>
          <p>
            You can also <strong>export everything we hold on you</strong> from
            the same Settings screen before you delete, if you want a copy.
          </p>
          <p>
            <strong>Or request deletion by email:</strong>
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

        <Section title="9. Cosmo, our AI money coach" id="ai-coach">
          <p>
            Cosmo is an optional AI assistant inside Notho that answers
            questions about your own budget in plain language. It is powered by{" "}
            <strong>Google&apos;s Gemini</strong> model. Cosmo is{" "}
            <strong>switched off by default</strong> and sends nothing until you
            explicitly turn it on.
          </p>
          <p>
            <strong>What Cosmo is sent.</strong> Only an anonymised summary of
            your budget: totals per spending category, your monthly income
            figure, and the question you typed. That is all.
          </p>
          <p>
            <strong>What Cosmo is never sent.</strong> Your name, email address,
            user ID, merchant names, individual transaction descriptions,
            account numbers, or anything else that could identify you or where
            you shop.
          </p>
          <p>
            <strong>Limits and safeguards.</strong> Cosmo is restricted to
            financial education. It is instructed never to recommend or name
            specific financial products, providers, funds, shares, or
            cryptocurrencies, and to point you to a registered financial adviser
            for anything product-related. Usage is capped at 10 messages per day
            per person. Conversations are logged on our servers so we can review
            for abuse and improve safety, and they are deleted along with the
            rest of your data if you delete your account.
          </p>
          <p>
            <strong>AI makes mistakes.</strong> Cosmo can be wrong, and it is
            not a financial adviser. Treat its answers as a starting point for
            your own thinking, never as advice to act on. If a response looks
            wrong or inappropriate, please report it to{" "}
            <a href="mailto:support@notho.co.za" style={{ color: "#007A85" }}>
              support@notho.co.za
            </a>
            .
          </p>
          <p>
            You can withdraw consent at any time in Settings. Cosmo stops
            immediately, and no further data is sent to Google.
          </p>
        </Section>

        <Section title="10. Contact Us">
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
