# Native wrapper — setup, and the three things that will bite you

`capacitor.config.ts` is already written and sitting in your repo root. This file covers what to run, and the three real blockers I found while reading your codebase. Read the blockers first — two of them will break the app in ways that are hard to diagnose after the fact.

---

## Blocker 1 — Google OAuth does not work inside a webview

**This will break sign-in for most of your users if you ship without fixing it.**

Google blocks OAuth inside embedded webviews. A Capacitor shell is an embedded webview, so "Continue with Google" will fail with `403: disallowed_useragent`. Facebook applies similar restrictions.

**The fix:** open the OAuth flow in the system browser (SFSafariViewController on iOS, Chrome Custom Tabs on Android) and come back via a deep link.

```bash
npm install @capacitor/browser @capacitor/app
```

Then, where you start OAuth, branch on native:

```ts
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const isNative = Capacitor.isNativePlatform();

const { data } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: isNative
      ? "za.co.notho.app://auth/callback"
      : `${window.location.origin}/auth/callback`,
    skipBrowserRedirect: isNative,
  },
});

if (isNative && data?.url) {
  await Browser.open({ url: data.url });
}
```

And handle the return in your root layout:

```ts
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

App.addListener("appUrlOpen", async ({ url }) => {
  if (url.includes("auth/callback")) {
    const code = new URL(url).searchParams.get("code");
    if (code) await supabase.auth.exchangeCodeForSession(code);
    await Browser.close();
  }
});
```

**Also required:**
- Add `za.co.notho.app://auth/callback` to Supabase → Authentication → URL Configuration → Redirect URLs.
- Add the same to Google Cloud Console → Credentials → Authorised redirect URIs.
- iOS: register the `za.co.notho.app` URL scheme in `Info.plist`.
- Android: add the intent filter in `AndroidManifest.xml`.

---

## Blocker 2 — Apple guideline 4.2, Minimum Functionality

Apple rejects apps that are a repackaged website with no native value. A pure `server.url` shell is exactly that shape, and this is the most likely reason your first iOS submission comes back.

Google Play is far more relaxed here. **This is an iOS problem specifically.**

**The fix is to ship real native capability.** You need at least two or three of these, and Notho is well suited to all of them:

| Capability | Plugin | Why it fits Notho |
|---|---|---|
| **Native push** | `@capacitor/push-notifications` | You already have streak reminders and budget alerts. Also required — see Blocker 3. |
| **Biometric lock** | `capacitor-native-biometric` | Face ID / fingerprint before the budget screen. Strong, obvious native value for a money app. |
| **Native file picker** | `@capacitor/filesystem` | Picking a bank statement from Files or Drive is genuinely better natively. |
| **Share sheet** | `@capacitor/share` | Sharing the monthly PDF report. |
| **Haptics** | `@capacitor/haptics` | Lesson completion, streak milestones. Cheap to add. |
| **Offline lessons** | `@capacitor/preferences` | Cache lesson content so learning works without data. Real value in SA. |

Biometric lock plus native push plus offline lessons is a comfortable pass. Mention all of them explicitly in App Review Notes.

---

## Blocker 3 — Web push does not work on iOS inside a webview

Your current push setup uses **VAPID web push** (`VAPID_PUBLIC_KEY`, `src/lib/push/subscribe.ts`). That works in Safari and on Android, but **not inside an iOS WKWebView**. Push will silently do nothing on iPhone.

**The fix:** use native push on iOS via APNs.

```bash
npm install @capacitor/push-notifications
```

You will need:
- An **APNs key** from the Apple Developer portal (Certificates, Identifiers & Profiles → Keys).
- A **Firebase project** with FCM for Android, and `google-services.json` in `android/app/`.
- A branch in your subscription logic: native platforms register through `PushNotifications`, web keeps the existing VAPID path.
- A second column (or table) to store native device tokens alongside your existing `push_subscriptions` rows, since the token format differs.

Budget a day for this. It is the largest piece of genuine work in the whole launch.

---

## Setup — run this on your Mac

```bash
cd ~/Developer/notho
bash store-launch/_tools/setup-capacitor.sh
```

That script installs Capacitor, scaffolds `ios/` and `android/`, and copies the generated icons into both native projects. It is safe to re-run.

### Then, per platform

**iOS** (requires macOS + Xcode 16+):
```bash
npx cap open ios
```
- Set the Team under Signing & Capabilities.
- Add the Push Notifications capability.
- Confirm Deployment Target is iOS 16.0 or higher.
- Product → Archive → Distribute App → App Store Connect.

**Android** (Android Studio):
```bash
npx cap open android
```
- Confirm `targetSdk 36` in `android/app/build.gradle` — mandatory as of 31 Aug 2026.
- Build → Generate Signed App Bundle → release.
- **Back up the keystore.** Losing it means you can never update this package name again.

---

## Server-side change you will want

Both shells append a custom user agent (`NothoApp/iOS`, `NothoApp/Android`). Use it to hide anything that makes no sense in the app — the "add to home screen" prompt, install banners, web-only footers:

```ts
const isNativeShell = /NothoApp\/(iOS|Android)/.test(navigator.userAgent);
```

---

## Honest timeline

| Work | Effort |
|---|---|
| Capacitor scaffold + config | Half a day |
| OAuth deep-link fix (Blocker 1) | 1 day |
| Native push (Blocker 3) | 1 day |
| Biometric lock + haptics + share (Blocker 2) | 1 day |
| Device testing on real hardware | 1–2 days |
| **Total before you can submit** | **~1 working week** |

The store paperwork is done and waiting. This engineering week is what actually stands between you and submission.
