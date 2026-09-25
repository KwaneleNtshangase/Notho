/**
 * Web Push sender used by the cron and the hello ping.
 *
 * The old Edge Function posted a raw JSON body to the push endpoint.
 * Browsers require RFC 8291 encryption — those sends were silently dropped.
 */

import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "@/lib/push/subscribe";

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
  if (!vapidReady()) return { ok: false, status: 0 };
  if (!sub.endpoint || sub.endpoint.startsWith("fcm:")) return { ok: false, status: 0 };
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
