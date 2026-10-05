/**
 * Web Push sender used by the cron and the hello ping.
 * Native tokens (apns:/fcm:) go through FCM.
 */

import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "@/lib/push/subscribe";
import { sendNativePush } from "@/lib/push/nativeSend";

export type WebPushSub = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function vapidReady(): boolean {
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!priv) return false;
  webpush.setVapidDetails("mailto:kwanelebc031@gmail.com", VAPID_PUBLIC_KEY, priv);
  return true;
}

export async function sendWebPush(
  sub: WebPushSub,
  payload: { title: string; body: string; url: string }
): Promise<{ ok: boolean; status?: number }> {
  if (sub.endpoint.startsWith("apns:") || sub.endpoint.startsWith("fcm:")) {
    return sendNativePush(sub.endpoint, payload);
  }
  if (!vapidReady()) return { ok: false, status: 0 };
  if (!sub.endpoint) return { ok: false, status: 0 };
  try {
    const res = await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 86400, urgency: "high" }
    );
    return { ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode };
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    return { ok: false, status };
  }
}
