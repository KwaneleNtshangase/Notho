export type NativeAuthCallback = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  errorDescription: string | null;
};

/**
 * Supabase can complete OAuth using either PKCE (`?code=...`) or the
 * implicit flow (`#access_token=...&refresh_token=...`). Capacitor delivers
 * the entire deep link to appUrlOpen, so native auth must understand both.
 */
export function parseNativeAuthCallback(url: string): NativeAuthCallback {
  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const get = (key: string) => query.get(key) ?? fragment.get(key);

  return {
    code: get("code"),
    accessToken: get("access_token"),
    refreshToken: get("refresh_token"),
    errorDescription: get("error_description") ?? get("error"),
  };
}
