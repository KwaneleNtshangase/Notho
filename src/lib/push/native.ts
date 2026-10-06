import { supabase } from "@/lib/supabaseClient";

async function saveToken(endpoint: string) {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return;
  await fetch("/api/push/register", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
  await fetch("/api/push/hello", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** iOS/Android device token. No-op in the browser. */
export async function ensureNativePush(interactive: boolean): Promise<"subscribed" | "unsupported" | "denied" | "dismissed" | null> {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted") {
      if (!interactive) return "dismissed";
      perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return "denied";
    }
    const platform = cap.getPlatform?.() === "ios" ? "apns" : "fcm";
    await PushNotifications.removeAllListeners();
    await PushNotifications.addListener("registration", (token) => {
      void saveToken(`${platform}:${token.value}`);
    });
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const url = (action.notification.data?.url as string) || "/learn";
      if (url.startsWith("/")) window.location.assign(url);
    });
    await PushNotifications.register();
    return "subscribed";
  } catch {
    return "unsupported";
  }
}
