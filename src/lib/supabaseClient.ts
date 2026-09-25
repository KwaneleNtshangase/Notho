import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const signInWithOAuth = supabase.auth.signInWithOAuth.bind(supabase.auth);
supabase.auth.signInWithOAuth = ((params, ...rest) => {
  if (params?.provider === "apple") {
    params = {
      ...params,
      options: {
        ...params.options,
        scopes: params.options?.scopes ?? "name email",
      },
    };
  }
  return signInWithOAuth(params, ...rest);
}) as typeof supabase.auth.signInWithOAuth;
