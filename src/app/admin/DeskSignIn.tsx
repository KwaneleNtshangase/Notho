"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

/**
 * Sign-in that lives on the desk itself.
 *
 * The learner app's AuthGate is intentionally not used here. Opening the
 * console should not dump an admin into onboarding, streaks, or the home tab.
 * After Google / magic-link, Supabase is told to return to this same URL.
 */

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OWNER_ADMIN_EMAIL } from "@/lib/admin";

export function deskReturnUrl(path = "/admin/analytics"): string {
  if (typeof window === "undefined") return `https://www.notho.co.za${path}`;
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}

export function DeskSignIn({
  onSignedIn,
  returnPath = "/admin/analytics",
}: {
  onSignedIn: () => void;
  returnPath?: string;
}) {
  const [email, setEmail] = useState(OWNER_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"password" | "magic" | "google" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const signInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("password");
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(null);
    if (error) {
      const lower = error.message.toLowerCase();
      setErr(
        lower.includes("invalid login") || lower.includes("invalid credentials")
          ? "Wrong email or password. If you usually use Google, tap that instead — or send a magic link."
          : error.message
      );
      return;
    }
    onSignedIn();
  };

  const sendMagic = async () => {
    setBusy("magic");
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: deskReturnUrl(returnPath),
        shouldCreateUser: false,
      },
    });
    setBusy(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg(
      `Link sent to ${email.trim()}. Open it in this browser — it comes straight back to the desk, not the app.`
    );
  };

  const google = async () => {
    setBusy("google");
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: deskReturnUrl(returnPath) },
    });
    if (error) {
      setBusy(null);
      setErr(error.message);
    }
  };

  return (
    <div className="nv-card" style={{ maxWidth: 460 }}>
      <h2 className="nv-card-title" style={{ marginBottom: 8 }}><I18nText source={"Sign in to the desk"} /></h2>
      <p className="nv-card-sub" style={{ marginBottom: 16 }}><I18nText source={"This is the operator console, not the learner app. Use the founder Gmail or any mailbox listed in ADMIN_EMAILS."} /></p>

      <button
        type="button"
        className="nv-btn"
        onClick={google}
        disabled={busy !== null}
        style={{ width: "100%", justifyContent: "center", marginBottom: 14 }}
      >
        <I18nText>{busy === "google" ? "Opening Google…" : "Continue with Google"}</I18nText>
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "4px 0 14px",
          color: "var(--muted)",
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <I18nText source={"or email"} /><span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form onSubmit={signInPassword} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)" }}><I18nText source={"Email"} /></span>
          <input
            className="nv-input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", minWidth: 0 }}
          />
        </label>
        <label style={{ display: "grid", gap: 5 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)" }}><I18nText source={"Password"} /></span>
          <I18nElement as="input"
            className="nv-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Only if this account has one"
            style={{ width: "100%", minWidth: 0 }}
          />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="submit"
            className="nv-btn primary"
            disabled={busy !== null || !password}
          >
            <I18nText>{busy === "password" ? "Signing in…" : "Sign in"}</I18nText>
          </button>
          <button
            type="button"
            className="nv-btn"
            onClick={sendMagic}
            disabled={busy !== null || !email.trim()}
          >
            <I18nText>{busy === "magic" ? "Sending…" : "Email me a link"}</I18nText>
          </button>
        </div>
      </form>

      {msg && (
        <p className="nv-note" style={{ marginTop: 14, marginBottom: 0 }}>
          <I18nText>{msg}</I18nText>
        </p>
      )}
      {err && (
        <p className="nv-error" style={{ marginTop: 14, marginBottom: 0 }}>
          <I18nText>{err}</I18nText>
        </p>
      )}
    </div>
  );
}
