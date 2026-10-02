import { kindFromKey, stampUrl } from "@/lib/push/stamp";
import { sendWebPush } from "@/lib/push/send";

export async function deliverPush(
  admin: { from: (t: string) => any },
  userId: string,
  id: string,
  msg: { key: string; title: string; body: string; url: string },
  subs: { endpoint: string; p256dh: string; auth: string }[]
): Promise<number> {
  const url = stampUrl(msg.url, id);
  await admin.from("push_notification_log").update({
    kind: kindFromKey(msg.key),
    title: msg.title,
    body: msg.body,
  }).eq("id", id);
  let delivered = 0;
  for (const sub of subs) {
    const result = await sendWebPush(sub, { title: msg.title, body: msg.body, url });
    if (result.ok) delivered++;
  }
  return delivered;
}
