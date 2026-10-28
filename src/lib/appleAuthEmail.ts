/** Apple OAuth can mint a session with no email (user declined share / Hide My Email
 *  never arrived / subsequent sign-in omitted the claim). Notho accounts need an
 *  email, so those sessions are refused. Hide My Email relay addresses are emails
 *  and are accepted — Apple does not let apps remove that choice from their sheet. */

export const APPLE_NO_EMAIL_MESSAGE =
  "Apple did not share an email address. On the Apple screen choose Share My Email or Hide My Email — signing in with no email is not supported. Or use Google, Facebook, or email.";

type IdentityLike = {
  provider?: string | null;
  identity_data?: { email?: string | null } | null;
};

type UserLike = {
  email?: string | null;
  user_metadata?: { email?: string | null } | null;
  app_metadata?: { provider?: string | null; providers?: string[] | null } | null;
  identities?: IdentityLike[] | null;
};

type SessionLike = {
  user?: UserLike | null;
} | null;

function looksLikeEmail(value: unknown): value is string {
  return typeof value === "string" && value.includes("@") && value.trim().length > 3;
}

export function isAppleAuthUser(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.provider === "apple") return true;
  if (user.app_metadata?.providers?.includes("apple")) return true;
  return (user.identities ?? []).some((identity) => identity.provider === "apple");
}

export function sessionHasUsableEmail(session: SessionLike): boolean {
  const user = session?.user;
  if (!user) return false;
  if (looksLikeEmail(user.email)) return true;
  if (looksLikeEmail(user.user_metadata?.email)) return true;
  return (user.identities ?? []).some((identity) =>
    looksLikeEmail(identity.identity_data?.email),
  );
}

export function appleSessionMissingEmail(session: unknown): boolean {
  if (!session || typeof session !== "object") return false;
  const typed = session as SessionLike;
  if (!typed?.user) return false;
  return isAppleAuthUser(typed.user) && !sessionHasUsableEmail(typed);
}
