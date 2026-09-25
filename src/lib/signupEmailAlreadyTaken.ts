export const EXISTING_EMAIL_SIGNUP_MESSAGE =
  "An account with this email already exists. Sign in, or use Forgot password if you need to reset it.";

export function signupEmailAlreadyTaken(
  errorMessage: string | undefined,
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  const msg = (errorMessage || "").toLowerCase();
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already") ||
    msg.includes("email address is already")
  ) {
    return true;
  }
  // Supabase email-confirm projects often return 200 with an empty identities
  // array instead of an error, to avoid leaking whether the inbox exists.
  if (user && Array.isArray(user.identities) && user.identities.length === 0) {
    return true;
  }
  return false;
}
