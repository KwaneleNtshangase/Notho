"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isNativePlatform } from "@/lib/capacitorPlatform";
import { parseNativeAuthCallback } from "@/lib/nativeAuthCallback";

// OAuth providers must not complete authentication inside an embedded webview
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
// The same listener also handles Universal Links / App Links (https://www.notho.co.za/...).
// When the OS opens the app for a lesson (or other app path), we navigate the WebView there.
// Renders nothing; it only exists to register the listener for the lifetime of the app.
// Mount once, near the root layout.

const APP_HOSTS = new Set(["www.notho.co.za", "notho.co.za"]);

function isAppHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && APP_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

async function handleAuthUrl(url: string, Browser: { close: () => Promise<void> }) {
  const callback = parseNativeAuthCallback(url);
  let authError: Error | null = null;

  if (callback.errorDescription) {
    authError = new Error(callback.errorDescription);
  } else if (callback.accessToken && callback.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    authError = error;
  } else if (callback.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(callback.code);
    authError = error;
  } else {
    authError = new Error("The sign-in callback did not contain a session.");
  }

  if (authError) {
    console.error("Native OAuth callback failed:", authError.message);
  }

  // Closes the system browser tab/sheet that OAuth ran in, returning the user to the app.
  await Browser.close();
}

function navigateToDeepLink(url: string) {
  // The native shell loads the live site. Pointing the WebView at the deep-link
  // URL lands the user on the same lesson (or page) the browser would have shown.
  if (typeof window === "undefined") return;
  if (window.location.href === url) return;
  window.location.assign(url);
}

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

      const onUrl = async (url: string | undefined) => {
        if (!url) return;
        if (url.includes("auth/callback")) {
          await handleAuthUrl(url, Browser);
          return;
        }
        if (isAppHttpsUrl(url)) {
          navigateToDeepLink(url);
        }
      };

      // Cold start: the OS may have launched the app with a Universal/App Link.
      try {
        const launch = await App.getLaunchUrl();
        if (launch?.url) await onUrl(launch.url);
      } catch {
        // getLaunchUrl is optional; ignore if the platform has nothing.
      }

      const handle = await App.addListener(
        "appUrlOpen",
        async ({ url }: { url: string }) => {
          await onUrl(url);
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
