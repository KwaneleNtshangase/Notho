import { supabase } from "@/lib/supabaseClient";
import {
  EXISTING_EMAIL_SIGNUP_MESSAGE,
  signupEmailAlreadyTaken,
} from "@/lib/signupEmailAlreadyTaken";

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
