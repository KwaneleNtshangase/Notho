import { supabase } from "@/lib/supabaseClient";
import {
  EXISTING_EMAIL_SIGNUP_MESSAGE,
  signupEmailAlreadyTaken,
} from "@/lib/signupEmailAlreadyTaken";

let guardInstalled = false;

/** Rewrite existing-email signup results so AuthGate can show a clear error. */
export function installSignupEmailGuard(): void {
  if (guardInstalled) return;
  guardInstalled = true;
  const originalSignUp = supabase.auth.signUp.bind(supabase.auth);
  type SignUpFn = typeof supabase.auth.signUp;
  supabase.auth.signUp = (async (...args: Parameters<SignUpFn>) => {
    const result = await originalSignUp(...args);
    if (signupEmailAlreadyTaken(result.error?.message, result.data?.user)) {
      return {
        data: { user: null, session: null },
        error: {
          name: result.error?.name || "AuthApiError",
          message: EXISTING_EMAIL_SIGNUP_MESSAGE,
          status: 422,
        },
      } as Awaited<ReturnType<SignUpFn>>;
    }
    return result;
  }) as SignUpFn;
}

export async function signUpWithExistingEmailCheck(input: {
  email: string;
  password: string;
  fullName: string;
  age: number;
}): Promise<
  | { kind: "exists"; message: string }
  | { kind: "error"; message: string }
  | { kind: "verify"; email: string }
  | { kind: "ok" }
> {
  const email = input.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { full_name: input.fullName, age: input.age } },
  });
  if (signupEmailAlreadyTaken(error?.message, data?.user)) {
    return { kind: "exists", message: EXISTING_EMAIL_SIGNUP_MESSAGE };
  }
  if (error) return { kind: "error", message: error.message };
  if (data.user && !data.session) return { kind: "verify", email };
  if (data.user) {
    await supabase.from("profiles").upsert({
      user_id: data.user.id,
      full_name: input.fullName,
      age: input.age,
    }, { onConflict: "user_id" });
  }
  return { kind: "ok" };
}
