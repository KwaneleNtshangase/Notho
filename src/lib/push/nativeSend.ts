/**
 * Android tokens go through FCM. iPhone tokens are Apple device tokens, so they
 * go straight to APNs when APNS_AUTH_KEY, APNS_KEY_ID and APNS_TEAM_ID are set.
 */

import crypto from "crypto";

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(): Promise<string | null> {
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${sign.sign(key).toString("base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) return null;
  const json = await res.json() as { access_token?: string };
  return json.access_token ?? null;
}

async function sendApns(token: string, payload: { title: string; body: string; url: string }) {
  const key = process.env.APNS_AUTH_KEY?.replace(/\\n/g, "\n");
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  if (!key || !keyId || !teamId) return { ok: false, status: 0 };
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claim = b64url(JSON.stringify({ iss: teamId, iat: now }));
  const sign = crypto.createSign("SHA256");
  sign.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${sign.sign({ key, dsaEncoding: "ieee-p1363" }).toString("base64url")}`;
  const res = await fetch(`https://api.push.apple.com/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": "za.co.notho.app",
      "apns-push-type": "alert",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      aps: { alert: { title: payload.title, body: payload.body }, sound: "default" },
      url: payload.url,
    }),
  });
  return { ok: res.ok, status: res.status };
}

export async function sendNativePush(
  endpoint: string,
  payload: { title: string; body: string; url: string }
): Promise<{ ok: boolean; status?: number }> {
  const token = endpoint.replace(/^(apns:|fcm:)/, "");
  if (endpoint.startsWith("apns:")) return sendApns(token, payload);

  const project = process.env.FIREBASE_PROJECT_ID;
  if (!project) return { ok: false, status: 0 };
  const access = await accessToken();
  if (!access) return { ok: false, status: 0 };
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${project}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: payload.title, body: payload.body },
        data: { url: payload.url },
        android: { priority: "HIGH" },
      },
    }),
  });
  return { ok: res.ok, status: res.status };
}
