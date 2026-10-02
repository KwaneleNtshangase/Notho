import { deliverPush } from "@/lib/push/deliver";

/**
 * Cron send tail. Imported by the route so the attribution stamp lives in one place.
 * The route still decides who gets a message.
 */
export async function sendClaimedPush(
  admin: { from: (t: string) => any },
  userId: string,
  claimedId: string,
  msg: { key: string; title: string; body: string; url: string },
  subs: { endpoint: string; p256dh: string; auth: string }[]
): Promise<number> {
  return deliverPush(admin, userId, claimedId, msg, subs);
}
