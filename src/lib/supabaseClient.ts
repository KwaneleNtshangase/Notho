import { createClient } from "@supabase/supabase-js";
import {
  EXISTING_EMAIL_SIGNUP_MESSAGE,
  signupEmailAlreadyTaken,
} from "@/lib/signupEmailAlreadyTaken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
  );
}

const client = createClient(supabaseUrl, supabaseAnonKey);
const originalSignUp = client.auth.signUp.bind(client.auth);

client.auth.signUp = (async (credentials, options) => {
  const result = await originalSignUp(credentials, options);
  if (signupEmailAlreadyTaken(result.error?.message, result.data?.user)) {
    return {
      data: { user: null, session: null },
      error: {
        name: result.error?.name || "AuthApiError",
        message: EXISTING_EMAIL_SIGNUP_MESSAGE,
        status: result.error && "status" in result.error ? (result.error as { status?: number }).status : 422,
      },
    } as typeof result;
  }
  return result;
}) as typeof client.auth.signUp;

export const supabase = client;
