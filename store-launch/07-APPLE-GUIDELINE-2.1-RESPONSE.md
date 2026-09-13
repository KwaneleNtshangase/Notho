# Apple Guideline 2.1 response — Notho 1.0

Use this for the September 2026 “Information Needed — New App Submission” request.

Before replying:

1. Upload one compiled video whose footage was recorded on the physical iPhone 13 Pro Max running iOS 26.5.2.
2. Use the recording checklist below and begin with a cold launch from the Home Screen.
3. In Xcode, archive and upload the corrected build after the launch-screen change. Use the next available build number (expected: 4); Xcode Cloud is not currently configured for this app.
4. Put the same six answers in **App Review Information → Notes** so they remain available on future submissions.
5. Confirm that the demo credentials still work immediately before resubmitting.

## Response to paste in Resolution Center

Hello App Review Team,

Thank you for your message. We have tested the app on a supported physical device and have provided all requested information below. A physical-device screen recording demonstrating the typical flow is attached to this reply.

**1. Physical-device screen recording**

Attached is a recording captured on an iPhone 13 Pro Max running iOS 26.5.2. It begins with a cold launch and demonstrates sign-in, the Learn experience and lesson completion, budgeting and transaction analysis, statement import using sample data, report generation and the iOS share sheet, the optional Cosmo AI education feature and its consent screen, Settings, data export, and the account-deletion flow.

Notho has no purchases or subscriptions and no public user-generated content. The recording also shows the Face ID prompt used to protect the Budget area. The app does not request location, contacts, camera, microphone, photo-library, or App Tracking Transparency access.

Tested device and operating system:

- Physical iPhone 13 Pro Max — iOS 26.5.2

**2. Purpose and target audience**

Notho is a financial-literacy education and personal budgeting app for South Africans aged 13 and older. It helps users learn practical money concepts in short interactive lessons, understand their spending by importing their own bank statements, build a budget, generate plain-language reports, and ask an optional AI education assistant questions about aggregate budget categories.

The app addresses the lack of locally relevant financial education by using South African terminology, rands, local banking formats, and South African examples. Notho does not provide financial, investment, tax, or legal advice; recommend financial products; execute transactions; connect to bank accounts; or request banking credentials.

**3. Setup and access instructions**

No special hardware, VPN, organization membership, or regional configuration is required. Internet access is required for authentication and synchronization.

Demo account:

- Email: hello@notho.co.za
- Password: Nomandla13

The demo account contains completed lessons and sample budget/transaction data so all major features can be reviewed without uploading a personal bank statement.

Suggested review path:

1. Launch Notho and choose email sign-in.
2. Sign in with the demo credentials above.
3. Open **Learn**, select a lesson, and complete its interactive questions.
4. Open **Budget**. If Face ID is available, authenticate when prompted. Review the preloaded transactions, categories, and budget totals.
5. In Budget, choose **Import statement** to view the PDF/CSV/OFX/QFX import flow. A real statement is not required because the demo data is already loaded.
6. Choose **View report** and use its share action to open the native iOS share sheet.
7. While in Budget, tap **Ask Cosmo**. The feature is optional and off by default; accept the clearly labelled AI consent screen before sending a message.
8. Open **Profile → Settings** to view privacy controls, export data, notification settings, and **Delete My Data**. Account deletion includes an optional exit survey and a final confirmation before permanent deletion.

Sign in with Apple, Google, and Facebook are optional alternatives to email sign-in. On iOS, these flows open the provider authorization page in the system browser and return to the app through its registered callback.

**4. External services, tools, and platforms**

- **Supabase:** email and OAuth authentication, PostgreSQL data storage, synchronization, and server-side functions.
- **Apple Sign in with Apple:** optional authentication.
- **Google OAuth:** optional authentication.
- **Meta/Facebook Login:** optional authentication.
- **Google Gemini:** optional Cosmo AI financial-education assistant. It is off by default and requires explicit consent. Only the user’s message and anonymized aggregate budget context are sent; bank statement files, account numbers, merchant-level transaction descriptions, names, and email addresses are not sent to Gemini.
- **Vercel:** hosts Notho’s application and server-side API routes.
- **PostHog:** product analytics used to understand feature usage and improve the app; it is not used for cross-app tracking or advertising.
- **Resend:** transactional and account-related email delivery.
- **Capacitor and Apple iOS frameworks:** the native shell and local bridges for Face ID/Touch ID, Files access, the native share sheet, and haptics.

Notho has no advertising network, payment processor, in-app purchase provider, bank-data aggregator, or bank-account connection.

**5. Regional differences**

The app’s functionality is consistent in every territory where it is available; it does not use geofencing or location-based feature restrictions. Its educational content and examples are intentionally designed for South Africa and use rands, South African terminology, and local regulatory context. Statement parsing is optimized for common South African bank formats, with a general parser for other supported PDF, CSV, OFX, and QFX files. These are content and format differences, not restrictions on access.

**6. Regulated industry and protected third-party material**

Notho provides general financial education and personal budgeting tools only. The Solution Org (Pty) Ltd is not a financial services provider, and the app does not provide individualized financial advice, recommend or sell financial products, execute transactions, hold customer funds, connect to bank accounts, or request banking credentials. This limitation is disclosed in the app, App Store description, Terms, and Privacy Policy. Therefore, no financial-services authorization is required for the functionality provided.

The app’s educational lessons, interface, illustrations, and branding are original or properly licensed. References to banks, regulators, and common financial products are factual educational references only; Notho does not claim affiliation with those organizations and does not reproduce protected bank statements, logos, or paid third-party content in the app.

Support: support@notho.co.za

Kind regards,
Kwanele Ntshangase
The Solution Org (Pty) Ltd

## Physical-device recording checklist

Keep the video concise but complete (roughly 4–7 minutes). It may be assembled from multiple physical-device recordings, but submit it as one file. Use short title cards or clean cuts between sections, keep actions in their original order within each demonstrated flow, and do not omit error states or edit the footage in a way that could misrepresent the app. Do not mix in simulator footage.

- Start from the iPhone Home Screen and cold-launch Notho.
- Show the corrected startup: no Capacitor logo; the first logo shown is Notho.
- Show the welcome screen and complete registration with a temporary review-only account.
- Open Profile → Settings and complete **Delete My Data** for that temporary account, including the final confirmation.
- Return to the welcome screen and sign in with the persistent review demo account.
- Complete one short lesson and show the haptic/native interaction where practical.
- Open Budget and show the Face ID request and successful unlock.
- Show existing demo transactions and the statement-import picker/preview flow.
- Choose **View report**, use its share action to open the native iOS share sheet, and cancel without sharing externally.
- In Budget, tap **Ask Cosmo**, show that it is labelled as AI, show the consent step, and ask one harmless education question.
- Open Profile → Settings and show export, privacy, notifications, and Delete My Data without deleting the persistent review account.
- Do not expose a real bank statement, personal transaction data, email inbox, notification content, or any unrelated app.

## Resubmission notes

- This rejection requests information; it does not identify a crash or a substantive policy breach.
- Because the launch storyboard was corrected after build 3, upload and select a new build rather than resubmitting build 3.
- Keep the demo account active, populated, and exempt from expiring credentials for the entire review.
- Make all backend services available to App Review.
- If iPad remains in the supported device family, complete and record a separate physical-iPad smoke test when a device is available, then add its exact model and iPadOS version under answer 1.
