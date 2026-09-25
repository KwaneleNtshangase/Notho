/**
 * Shared web-push subscription helpers.
 */

import { supabase } from "@/lib/supabaseClient";

export const VAPID_PUBLIC_KEY =
  "BFfb98U0f0zXJaGdF9Tx7Sm7WkgGztyMxM701qNeJyMbOKJiKfGiPYov0CLCiihusSIOtbSTs-h_Z5JdOrBXiF0";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export type EnsureResult = "subscribed" | "unsupported" | "denied" | "dismissed";

export async function ensurePushSubscription(interactive: boolean): Promise<EnsureResult> {
  if (!pushSupported()) return "unsupported";

  if (Notification.permission === "denied") return "denied";
  if (Notification.permission !== "granted") {
    if (!interactive) return "dismissed";
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return permission === "denied" ? "denied" : "dismissed";
  }

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const key = sub.getKey("p256dh");
  const auth = sub.getKey("auth");
  if (key && auth) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
          auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
        },
        { onConflict: "user_id,endpoint" }
      );
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (token) {
          await fetch("/api/push/hello", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch {
        /* ping is best-effort */
      }
    }
  }
  return "subscribed";
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", sub.endpoint);
  }
  await sub.unsubscribe();
}
