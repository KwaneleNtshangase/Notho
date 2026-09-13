import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function bearerFrom(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  // iOS WKWebView has dropped Authorization on some fetches. Duplicate header.
  const alt = req.headers.get("x-notho-access-token")?.trim();
  return alt || null;
}

/** Returns the authenticated Supabase user from a Bearer access token, or null. */
export async function getUserFromRequest(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const token = bearerFrom(req);
  if (!token) return null;

  const client = createClient(url, anonKey);
  const first = await client.auth.getUser(token);
  if (!first.error && first.data.user) return first.data.user;
  return null;
}
