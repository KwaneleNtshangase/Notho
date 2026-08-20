"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isNativePlatform } from "@/lib/capacitorPlatform";

// Google and Facebook refuse to complete OAuth inside an embedded webview
// (Google returns 403: disallowed_useragent), so on native platforms
// AuthGate hands the OAuth URL to the system browser via @capacitor/browser
// instead of letting it open inside the app's own webview. See
// handleOAuthSignIn in AuthGate.tsx.
//
// On the web, Supabase's `detectSessionInUrl` finishes the flow automatically
// because the redirect lands back on a normal page with the auth code in the
// query string. On native, the redirect target is a custom URL scheme
// (za.co.notho.app://auth/callback) which the OS hands to the app as an
// `appUrlOpen` event instead - nothing "loads a page", so nothing calls
// exchangeCodeForSession on its own. This component is what does that.
//
// Renders nothing; it only exists to register the listener for the lifetime
// of the app. Mount once, near the root layout.
export function NativeAuthDeepLink() {
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      if (!(await isNativePlatform())) return;

      const [{ App }, { Browser }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/browser"),
      ]);

      if (cancelled) return;

      const handle = await App.addListener(
        "appUrlOpen",
        async ({ url }: { url: string }) => {
          if (!url.includes("auth/callback")) return;

          const code = new URL(url).searchParams.get("code");
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              // eslint-disable-next-line no-console
              console.error("Native OAuth callback failed:", error.message);
            }
          }

          // Closes the system browser tab/sheet that OAuth ran in, returning
          // the user to the app.
          await Browser.close();
        }
      );

      removeListener = () => handle.remove();
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  return null;
}
