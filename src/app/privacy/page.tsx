import { LocalizedRichText as I18nRich, LocalizedText as I18nText } from "@/i18n/LocalizedText";
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
          ><I18nText source={"Legal"} /></div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 12px",
              color: "#ffffff",
            }}
          ><I18nText source={"Privacy Policy"} /></h1>
          <p style={{ color: "#a0a0a0", fontSize: "15px", margin: 0 }}><I18nText source={"Last updated: November 2026  ·  The Solution Org (Pty) Ltd"} /></p>
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
          ><I18nText source={"Important notice"} /></div>
          <p style={{ margin: "0 0 10px", lineHeight: 1.65, color: "#e0e0e0", fontSize: 14 }}><I18nRich source={"Notho is a <strong0>financial-literacy education</strong0>  platform. It is <strong1>not a licensed financial services provider (FSP)</strong1>  under the South African Financial Advisory and Intermediary Services Act (FAIS Act, 2002) and it does not render financial, investment, tax, or legal advice as defined in that Act."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></p>
          <p style={{ margin: 0, lineHeight: 1.65, color: "#b8b8b8", fontSize: 13 }}><I18nRich source={"Lessons, calculators, budgets, and projections are illustrative and generic. For advice specific to your personal circumstances, consult an FSCA-registered financial adviser. You can verify any adviser's licence at  <a0>fsca.co.za</a0> ."} elements={[<a key="inline-0"
              href="https://www.fsca.co.za"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007A85" }}
             />]} /></p>
        </div>

        <Section title="1. Introduction">
          <p><I18nRich source={"Notho (“we”, “our”, or “us”) is a South African personal-finance learning app available at  <a0>notho.co.za</a0> . We are committed to protecting your personal information in accordance with the Protection of Personal Information Act, 2013 (POPIA) and applicable data-protection regulations."} elements={[<a key="inline-0" href="https://notho.co.za" style={{ color: "#007A85" }} />]} /></p>
          <p><I18nText source={"This Privacy Policy explains what personal information we collect, why we collect it, how we use it, and what rights you have. By using Notho you agree to the practices described here."} /></p>
          <p><I18nRich source={"<strong0>Notho was previously called Fundi Finance.</strong0>  Only the name has changed. The app is operated by the same company, The Solution Org (Pty) Ltd, and this policy continues to apply to information collected under the former name. Nothing about how we handle your data changed with the rename."} elements={[<strong key="inline-0" />]} /></p>
        </Section>

        <Section title="2. Information We Collect">
          <p><I18nText source={"We collect the following categories of information:"} /></p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nRich source={"<strong0>Account information</strong0>  - your email address and, where the provider makes them available, your name and profile photo if you sign in with Apple, Google, or Facebook. Apple lets you use a private relay email address instead of sharing your personal address with us."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Learning progress</strong0>  - lessons completed, XP earned, streaks, quiz answers, and in-app challenge data."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Financial inputs</strong0>  - expense logs, budget figures, and financial goals you enter voluntarily within the app."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Imported bank transactions</strong0>  - if you choose to upload a bank statement, the transaction rows we extract from it (date, amount, description, category). See Section 4a for how the file itself is handled."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Coach conversations</strong0>  - the questions you ask Cosmo, our optional AI money coach, and its replies. Only stored if you switch Cosmo on. See Section 9."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Notification subscriptions</strong0>  - if you opt in to push notifications. See Section 4b."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Usage data</strong0>  - features you interact with, session timestamps, and device/browser type, collected for analytics and app improvement."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Diagnostics</strong0>  - crash reports and error logs, so we can find and fix what breaks."} elements={[<strong key="inline-0" />]} /></li>
          </ul>
          <p><I18nRich source={"We do <strong0>not</strong0>  collect payment card details, bank account numbers, banking login credentials, South African ID numbers, or your location."} elements={[<strong key="inline-0" />]} /></p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p><I18nText source={"Your information is used to:"} /></p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nText source={"Provide, personalise, and sync your learning experience across devices."} /></li>
            <li><I18nText source={"Calculate and display your XP and streaks."} /></li>
            <li><I18nText source={"Send optional in-app notifications about your progress or new content."} /></li>
            <li><I18nText source={"Improve app features through anonymised, aggregated analytics."} /></li>
            <li><I18nText source={"Comply with legal obligations under South African law."} /></li>
          </ul>
          <p><I18nRich source={"We do <strong0>not</strong0>  sell your personal information to third parties or use it to serve advertisements."} elements={[<strong key="inline-0" />]} /></p>
        </Section>

        <Section title="4. Data Sharing">
          <p><I18nText source={"We share your data only with trusted service providers necessary to operate the app:"} /></p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nRich source={"<strong0>Supabase</strong0>  - our database and authentication provider, hosting data on servers in the European Union under GDPR-compliant terms."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Vercel</strong0>  - our web-hosting provider, for serving the app."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Apple, Google & Meta (Facebook)</strong0>  - solely for OAuth sign-in; we receive only the account profile data you authorise during the login flow. Apple may provide a private relay email address instead of your personal address."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Google (Gemini API)</strong0>  - powers Cosmo, our optional AI money coach. Cosmo is switched off until you turn it on. When you do, we send Google only an  <strong1>anonymised summary</strong1>  of your budget: category totals and monthly income. We never send your name, email, merchant names, transaction descriptions, or any other identifying detail. See Section 9 for the full explanation."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></li>
            <li><I18nRich source={"<strong0>PostHog</strong0>  - product analytics and, for signed-in learners who have not turned it off, masked session recordings. Used so we can see which features are used and where the app breaks. We do not use it to track you across other apps or websites, and we do not run advertising. See Section 6a."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Resend</strong0>  - sends our transactional email (welcome messages, budget alerts, and replies to your requests). Receives your email address and the contents of that message only."} elements={[<strong key="inline-0" />]} /></li>
          </ul>
          <p><I18nText source={"These providers are contractually prohibited from using your data for their own purposes. We do not sell your personal information, we do not share it with advertisers, and we do not share it with any other third party except as required by South African law or a court order."} /></p>
        </Section>

        <Section title="4a. Bank statements you upload">
          <p><I18nRich source={"Notho never connects to your bank. We do not ask for your banking username, password, PIN, or one-time PIN, and we have no ability to log into your account or move money. The only way your transactions reach Notho is if <strong0>you</strong0>  export a statement from your bank and upload it yourself."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"When you upload a statement, the file is read on our server  <strong0>in memory only</strong0>  in order to extract the transaction rows. The file itself is never written to disk and never stored. What we keep is the extracted transaction data - date, amount, description, and the category it was sorted into - saved against your account so your budget works across devices."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nText source={"You can delete any imported batch from within the Budget screen, or erase everything at once by deleting your account (Section 8)."} /></p>
        </Section>

        <Section title="4b. Push notifications">
          <p><I18nRich source={"If you opt in to notifications, we store a  <strong0>push subscription</strong0>  for your device - an endpoint URL and the encryption keys your browser generates. This lets us send reminders about your streak, budget alerts, and new content. It contains no personal information and cannot be used to identify you outside the app."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nText source={"You can turn notifications off at any time in Settings, or in your browser or device settings. Doing so deletes the subscription."} /></p>
        </Section>

        <Section title="5. Data Retention">
          <p><I18nText source={"We retain your account and learning data for as long as your account is active. If you request deletion (see Section 7), we will remove your personal information from our systems within 30 days, except where retention is required by law."} /></p>
          <p><I18nText source={"Anonymised, aggregated analytics data (with no link to you personally) may be retained indefinitely for product-improvement purposes."} /></p>
          <p><I18nRich source={"<strong0>Exit feedback.</strong0>  If you choose to tell us why you are leaving - when you delete your account, unsubscribe from our emails, or reply to a “what happened?” email - we keep that answer after your account is gone. This is the only way we can learn what to fix, since by definition we can no longer ask you."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"What we keep is deliberately anonymous: the reason you selected, any comment you chose to write, and general context such as how many days you had been signed up and how many lessons you had finished. It is  <strong0>not linked to your name, email address, or account</strong0>  - your account identifier is replaced with a one-way code that cannot be reversed to identify you. Answering is always optional, and you can skip the question entirely without it affecting your deletion request in any way. If you wrote a comment and would like it removed, email  <a1>privacy@notho.co.za</a1> ."} elements={[<strong key="inline-0" />, <a key="inline-1" href="mailto:privacy@notho.co.za" style={{ color: "#049DA7" }} />]} /></p>
        </Section>

        <Section title="6. Cookies, sessions, and where your data lives">
          <p><I18nRich source={"Your <strong0>learning progress</strong0>  (lessons completed, XP, streaks, quiz results, challenges, and budget entries you save) is stored securely in our database and linked to your account when you are signed in, so it can sync across devices."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"We place a few small <strong0>first-party cookies</strong0>  on your device for non-sensitive preferences only - for example dark mode, whether you have finished the first-time onboarding flow, and whether you dismissed the “add to home screen” prompt. These values are not used to identify you beyond the app experience."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nText source={"Some in-app toggles (such as sound effects) apply for your current browser session only and are not written to persistent storage on your device."} /></p>
          <p><I18nRich source={"We do <strong0>not</strong0>  store your account progress, scores, or other sensitive personal data in your browser's  <strong1>local storage</strong1>  or <strong2>session storage</strong2>  APIs. Session cookies are used where needed for authentication. We do not use advertising or tracking cookies."} elements={[<strong key="inline-0" />, <strong key="inline-1" />, <strong key="inline-2" />]} /></p>
        </Section>

        <Section title="6a. Session recordings" id="session-recording">
          <p><I18nText source={"Signed-in sessions are recorded by default to improve Notho. You can turn session recording off anytime in Settings. Recordings are masked: text, inputs, images, and video are hidden, and we do not record network request or response bodies, headers, or console logs. Recordings are for our own product work. We never sell them, or any personal information."} /></p>
        </Section>

        <Section title="7. Your Rights">
          <p><I18nText source={"Under POPIA and applicable law, you have the right to:"} /></p>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nRich source={"<strong0>Access</strong0>  - request a copy of the personal information we hold about you."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Correct</strong0>  - ask us to fix inaccurate or incomplete information."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Delete</strong0>  - request that we delete your personal information (see Section 8 below for Facebook data-deletion instructions)."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Object</strong0>  - object to the processing of your data in certain circumstances."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"<strong0>Portability</strong0>  - receive your data in a machine-readable format."} elements={[<strong key="inline-0" />]} /></li>
          </ul>
          <p><I18nRich source={"To exercise any of these rights, contact us at  <a0>support@notho.co.za</a0> . We will respond within 30 days."} elements={[<a key="inline-0"
              href="mailto:support@notho.co.za"
              style={{ color: "#007A85" }}
             />]} /></p>
        </Section>

        <Section title="8. Data Deletion" id="data-deletion">
          <p><I18nText source={"You can request complete deletion of your Notho account and all associated personal data at any time."} /></p>
          <p><I18nRich source={"<strong0>The fastest way - delete it yourself, instantly:</strong0>"} elements={[<strong key="inline-0" />]} /></p>
          <ol style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nRich source={"Open <strong0>Settings</strong0>  in the app."} elements={[<strong key="inline-0" />]} /></li>
            <li><I18nRich source={"Tap <strong0>Delete My Data</strong0>. We will ask why you are leaving - this is <strong1>optional</strong1>, there is a  <strong2>Skip</strong2>  button, and skipping does not delay or affect your deletion in any way."} elements={[<strong key="inline-0" />, <strong key="inline-1" />, <strong key="inline-2" />]} /></li>
            <li><I18nText source={"Confirm. Your account and every piece of data attached to it - budget entries, imported transactions, learning progress, XP, coach conversations, and notification subscriptions - are erased immediately. This cannot be undone."} /></li>
          </ol>
          <p><I18nRich source={"You can also <strong0>export everything we hold on you</strong0>  from the same Settings screen before you delete, if you want a copy."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"<strong0>Or request deletion by email:</strong0>"} elements={[<strong key="inline-0" />]} /></p>
          <ol style={{ paddingLeft: "20px", lineHeight: 1.8 }}>
            <li><I18nRich source={"Email  <a0>support@notho.co.za</a0>  with the subject line <em1>“Data Deletion Request”</em1>  and the email address associated with your account."} elements={[<a key="inline-0"
                href="mailto:support@notho.co.za"
                style={{ color: "#007A85" }}
               />, <em key="inline-1" />]} /></li>
            <li><I18nText source={"We will verify your identity and confirm receipt within 5 business days."} /></li>
            <li><I18nText source={"Your account and all personal data will be permanently deleted from our systems within 30 days of verification."} /></li>
          </ol>
          <p><I18nRich source={"If you signed in with Facebook, you may also initiate deletion directly via the Facebook platform: go to  <strong0>Facebook Settings → Apps and Websites → Notho → Remove</strong0> . While our rename is completing, this may still be listed as  <strong1>Fundi Finance</strong1>; both refer to the same app. This will revoke our access token. To ensure full deletion of your data from our servers, please also send us the deletion email above."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></p>
          <p><I18nText source={"After deletion you will lose all learning progress, XP, and account history permanently. This action cannot be undone."} /></p>
          <p><I18nRich source={"The one thing that is not erased is the anonymous exit feedback described in <strong0>Section 5</strong0>, if you chose to give any. It carries no name, email address, or account identifier, so it cannot be traced back to you or used to rebuild your account."} elements={[<strong key="inline-0" />]} /></p>
        </Section>

        <Section title="9. Cosmo, our AI money coach" id="ai-coach">
          <p><I18nRich source={"Cosmo is an optional AI assistant inside Notho that answers questions about your own budget in plain language. It is powered by  <strong0>Google's Gemini</strong0>  model. Cosmo is  <strong1>switched off by default</strong1>  and sends nothing until you explicitly turn it on."} elements={[<strong key="inline-0" />, <strong key="inline-1" />]} /></p>
          <p><I18nRich source={"<strong0>What Cosmo is sent.</strong0>  Only an anonymised summary of your budget: totals per spending category, your monthly income figure, and the question you typed. That is all."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"<strong0>What Cosmo is never sent.</strong0>  Your name, email address, user ID, merchant names, individual transaction descriptions, account numbers, or anything else that could identify you or where you shop."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"<strong0>Limits and safeguards.</strong0>  Cosmo is restricted to financial education. It is instructed never to recommend or name specific financial products, providers, funds, shares, or cryptocurrencies, and to point you to a registered financial adviser for anything product-related. Usage is capped at 10 messages per day per person. Conversations are logged on our servers so we can review for abuse and improve safety, and they are deleted along with the rest of your data if you delete your account."} elements={[<strong key="inline-0" />]} /></p>
          <p><I18nRich source={"<strong0>AI makes mistakes.</strong0>  Cosmo can be wrong, and it is not a financial adviser. Treat its answers as a starting point for your own thinking, never as advice to act on. If a response looks wrong or inappropriate, please report it to  <a1>support@notho.co.za</a1> ."} elements={[<strong key="inline-0" />, <a key="inline-1" href="mailto:support@notho.co.za" style={{ color: "#007A85" }} />]} /></p>
          <p><I18nText source={"You can withdraw consent at any time in Settings. Cosmo stops immediately, and no further data is sent to Google."} /></p>
        </Section>

        <Section title="10. Contact Us">
          <p><I18nText source={"If you have questions about this Privacy Policy or our data practices, please contact us:"} /></p>
          <address
            style={{
              fontStyle: "normal",
              lineHeight: 1.8,
              color: "#c0c0c0",
            }}
          >
            <I18nText source={"The Solution Org (Pty) Ltd"} /><br />
            <I18nText source={"South Africa"} /><br />
            <a
              href="mailto:support@notho.co.za"
              style={{ color: "#007A85" }}
            ><I18nText source={"support@notho.co.za"} /></a>
            <br />
            <a href="https://notho.co.za" style={{ color: "#007A85" }}><I18nText source={"notho.co.za"} /></a>
          </address>
          <p style={{ marginTop: "16px" }}><I18nRich source={"If you are not satisfied with our response, you may lodge a complaint with the  <strong0>Information Regulator of South Africa</strong0>  at  <a1>inforegulator.org.za</a1> ."} elements={[<strong key="inline-0" />, <a key="inline-1"
              href="https://inforegulator.org.za"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007A85" }}
             />]} /></p>
        </Section>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e1e1e",
            color: "#505050",
            fontSize: "13px",
          }}
        ><I18nText source={"© {value0} The Solution Org (Pty) Ltd. All rights reserved."} values={[new Date().getFullYear()]} /></div>
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
        <I18nText>{title}</I18nText>
      </h2>
      <div
        style={{
          color: "#d0d0d0",
          fontSize: "15px",
          lineHeight: 1.75,
        }}
      >
        <I18nText>{children}</I18nText>
      </div>
    </section>
  );
}
