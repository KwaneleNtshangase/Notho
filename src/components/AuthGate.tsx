"use client";

import React, { useState, useEffect } from "react";
import { Mail, KeyRound, AlertTriangle, ClipboardCopy, CheckCircle, NothoLearn, NothoBudget, NothoCalculate } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { isNativePlatform } from "@/lib/capacitorPlatform";

// Google OAuth is blocked only in LinkedIn's in-app browser.
// All other in-app browsers (Instagram, Facebook, WhatsApp, etc.) either use
// SFSafariViewController or handle the redirect acceptably.
// Facebook OAuth works everywhere - no restrictions.
function isLinkedInBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return /\[LinkedInApp\]/i.test(window.navigator.userAgent);
}

// Disposable / obviously-fake email domains to block at signup
const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "sharklasers.com","guerrillamailblock.com","grr.la","guerrillamail.info",
  "spam4.me","trashmail.com","trashmail.net","trashmail.me","trashmail.at",
  "trashmail.io","trashmail.org","yopmail.com","yopmail.fr","cool.fr.nf",
  "jetable.fr.nf","nospam.ze.tc","nomail.xl.cx","mega.zik.dj","speed.1s.fr",
  "courriel.fr.nf","moncourrier.fr.nf","monemail.fr.nf","monmail.fr.nf",
  "dispostable.com","fakeinbox.com","throwam.com","maildrop.cc",
  "throwaway.email","tempmail.com","temp-mail.org","temp-mail.io",
  "getnada.com","mailnesia.com","mailnull.com","spamgourmet.com",
  "spamgourmet.net","spamgourmet.org","spamdecoy.net","spamspot.com",
  "spamfree24.org","spamfree24.de","spamfree24.info","spamfree24.com",
  "emailondeck.com","getairmail.com","fakemailgenerator.com",
  "10minutemail.com","10minutemail.net","10minemail.com",
  "tempr.email","discard.email","spamwc.de","rcpt.at","spam.la",
  "boun.cr","filzmail.com","spamgob.com","spam.su","spamthisplease.com",
]);

function isBlockedEmailDomain(emailAddr: string): boolean {
  const parts = emailAddr.toLowerCase().trim().split("@");
  if (parts.length !== 2) return false;
  return BLOCKED_EMAIL_DOMAINS.has(parts[1]);
}

function isValidEmailFormat(emailAddr: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailAddr.trim());
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<unknown | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [splashMinElapsed, setSplashMinElapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [inWebView, setInWebView] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [oauthBlocked, setOauthBlocked] = useState(false);

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setError("Please enter your email."); return; }
    setError(null);
    const { error: e } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    if (e) { setError(e.message); return; }
    setForgotSent(true);
  };

  useEffect(() => {
    // Keep the splash just long enough to avoid a flash of unstyled logo.
    // Returning users on slow SA mobile networks shouldn't wait on branding -
    // the previous 1500ms minimum added 1.1s+ of pure dead time per load.
    const t = setTimeout(() => setSplashMinElapsed(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setInWebView(isLinkedInBrowser());
  }, []);

  useEffect(() => {
    let mounted = true;
    // Safety net: force sessionLoading=false after 8s so the splash never
    // hangs indefinitely in CI / slow network environments.
    const sessionTimeout = setTimeout(() => {
      if (mounted) setSessionLoading(false);
    }, 4_000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        clearTimeout(sessionTimeout);
        setSession(data.session ?? null);
        setSessionLoading(false);
      })
      .catch(() => {
        if (mounted) {
          clearTimeout(sessionTimeout);
          setSessionLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    if (!isValidEmailFormat(email)) { setError("Please enter a valid email address."); return; }
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) {
      if (e.message.toLowerCase().includes("email not confirmed") ||
          e.message.toLowerCase().includes("not confirmed")) {
        setVerificationEmail(email);
        setAwaitingVerification(true);
      } else {
        setError("Incorrect email or password. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    const { error: e } = await supabase.auth.resend({ type: "signup", email: verificationEmail });
    if (e) setError(e.message);
    else setError(null);
  };

  // Facebook works everywhere - no restrictions.
  // Google is blocked only inside LinkedIn's in-app browser; everywhere else it works.
  //
  // On native (the Capacitor iOS/Android shell) both providers are blocked
  // regardless - Google and Facebook both refuse to complete OAuth inside any
  // embedded webview, and a Capacitor app IS an embedded webview from their
  // point of view. So on native we never let the flow open inside the app's
  // own webview: skipBrowserRedirect hands us the auth URL instead of
  // navigating to it, and we open that URL in the system browser
  // (SFSafariViewController on iOS, Chrome Custom Tabs on Android) via
  // @capacitor/browser. Supabase then redirects back to the
  // za.co.notho.app://auth/callback custom scheme, which NativeAuthDeepLink
  // (mounted in the root layout) picks up and exchanges for a session - see
  // that file for why this needs a separate listener instead of the web
  // flow's automatic detectSessionInUrl.
  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    const native = await isNativePlatform();

    if (provider === "google" && inWebView && !native) {
      setOauthBlocked(true);
      return;
    }

    const redirectTo = native
      ? "za.co.notho.app://auth/callback"
      : typeof window !== "undefined" ? window.location.origin : undefined;

    const { data, error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: native },
    });

    if (e) {
      setError(e.message);
      return;
    }

    if (native && data?.url) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: data.url });
    }
  };

  const handleSignUp = async () => {
    setError(null);
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    if (!lastName.trim()) { setError("Please enter your last name."); return; }
    if (!isValidEmailFormat(email)) { setError("Please enter a valid email address."); return; }
    if (isBlockedEmailDomain(email)) {
      setError("Please sign up with a real email address. Temporary or disposable emails are not allowed.");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError("Please enter a valid age (13+).");
      return;
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    const fullName = firstName.trim() + " " + lastName.trim();
    const { data, error: e } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName, age: ageNum } },
    });
    if (e) { setError(e.message); return; }
    // If Supabase email confirmation is enabled, user.identities will be present
    // but session will be null - show verify screen
    if (data.user && !data.session) {
      setVerificationEmail(email.trim().toLowerCase());
      setAwaitingVerification(true);
      return;
    }
    // Auto-confirmed (email confirm disabled) - write profile immediately
    if (data.user) {
      await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: fullName,
        age: ageNum,
      }, { onConflict: "user_id" });
    }
  };

  if (sessionLoading || !splashMinElapsed) {
    return (
      <>
        <style>{`
          @keyframes splashFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes splashLogoReveal {
            0%   { opacity: 0; transform: scale(0.85); filter: drop-shadow(0 0 0px rgba(34,197,94,0)); }
            60%  { opacity: 1; transform: scale(1.04); filter: drop-shadow(0 0 32px rgba(34,197,94,0.7)); }
            100% { opacity: 1; transform: scale(1);    filter: drop-shadow(0 0 18px rgba(34,197,94,0.4)); }
          }
          @keyframes splashLogoFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
          }
          @keyframes splashDividerIn {
            from { opacity: 0; transform: scaleX(0); }
            to   { opacity: 1; transform: scaleX(1); }
          }
          @keyframes splashGlowPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50%       { opacity: 0.85; transform: scale(1.15); }
          }
          .splash-logo-wrap {
            animation: splashLogoReveal 0.9s cubic-bezier(0.22,1,0.36,1) both,
                       splashLogoFloat 3.5s 1.1s ease-in-out infinite;
          }
          .splash-divider{ animation: splashDividerIn 0.45s 0.95s ease-out both; }
          .splash-tagline{ animation: splashFadeUp 0.5s 1.05s ease-out both; }
          .splash-bg-glow{ animation: splashGlowPulse 3s 0.5s ease-in-out infinite; }
        `}</style>
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#ffffff",
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle ambient glow */}
          <div className="splash-bg-glow" style={{
            position: "absolute", width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(1,160,170,0.10) 0%, rgba(1,160,170,0.04) 50%, transparent 72%)",
            pointerEvents: "none",
          }} />

          {/* The N mark, large. Uses the square icon (not the wide wordmark):
              the wordmark is navy, and in dark mode the splash background flips
              to a dark surface, leaving a navy-on-dark logo that reads as dim.
              The icon's teal + gold carry on both light and dark. */}
          <div className="splash-logo-wrap" style={{ position: "relative", zIndex: 1 }}>
            <img
              src="/notho-icon.png"
              alt="Notho"
              style={{ width: 168, height: 168, objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      </>
    );
  }

  const inputStyle = {
    padding: 12, borderRadius: 8,
    border: "1px solid var(--border-light)", fontSize: 14, width: "100%",
    boxSizing: "border-box" as const,
  };

  if (!session) {
    // ── Welcome / landing screen ─────────────────────────────────────────────
    if (mode === "landing") {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "space-between",
          background: "#ffffff", padding: "0 28px",
        }}>
          {/* Spacer top */}
          <div style={{ flex: "0 0 auto", height: 0 }} />

          {/* Hero */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            paddingTop: 56, paddingBottom: 40, gap: 0,
          }}>
            {/* Full lockup, large. Mode-aware so it stays crisp if the landing
                background flips to dark. Wide aspect (not a 200x200 square that
                rendered it tiny). */}
            <img
              className="logo-light"
              src="/notho-logo.png"
              alt="Notho"
              style={{ width: "min(340px, 78vw)", height: "auto", objectFit: "contain", marginBottom: 32 }}
            />
            <img
              className="logo-dark"
              src="/notho-logo-on-dark.png"
              alt="Notho"
              style={{ width: "min(340px, 78vw)", height: "auto", objectFit: "contain", marginBottom: 32 }}
            />
            <p style={{
              fontSize: 15, color: "#374151", textAlign: "center",
              lineHeight: 1.55, maxWidth: 300, margin: "0 0 22px", fontWeight: 500,
            }}>
              Money lessons written for South Africa. Payslips, debit orders, SARS, TFSAs.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 340, width: "100%" }}>
              {[
                { Icon: NothoLearn, text: "Short lessons on how money actually works here." },
                { Icon: NothoBudget, text: "Import a statement. We read it in memory and do not keep the file." },
                { Icon: NothoCalculate, text: "Calculators and a budget you can check against real numbers." },
              ].map((f) => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "6px 4px",
                }}>
                  <f.Icon size={20} style={{ color: "#007A85", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.45, textAlign: "left" }}>{f.text}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", margin: "10px 0 0" }}>
                Free. Education only, not advice.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div style={{
            width: "100%", maxWidth: 400, paddingBottom: 48,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <button
              onClick={() => setMode("signup")}
              style={{
                width: "100%", padding: "17px", fontSize: 16, fontWeight: 700,
                background: "#007A85", color: "#ffffff", border: "none",
                borderRadius: 14, cursor: "pointer", letterSpacing: 0.4,
              }}
            >
              Create an account
            </button>
            <button
              onClick={() => setMode("signin")}
              style={{
                width: "100%", padding: "16px", fontSize: 15, fontWeight: 600,
                background: "transparent", border: "2px solid #D1FAE5",
                borderRadius: 14, cursor: "pointer", color: "#007A85",
                letterSpacing: 0.2,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      );
    }

    // ── Email verification pending screen ────────────────────────────────────
    if (awaitingVerification) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-gray)]" style={{ padding: 16 }}>
          <div style={{ background: "var(--color-surface)", padding: 32, borderRadius: 20, border: "1px solid var(--color-border)", maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary-light, #E6F4EF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={32} style={{ color: "var(--color-primary)" }} aria-hidden />
              </div>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--color-text-primary)" }}>
              Check your email
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 6, lineHeight: 1.6 }}>
              We sent a verification link to
            </p>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--color-primary)", marginBottom: 20 }}>
              {verificationEmail}
            </p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Click the link in that email to activate your account. Check your spam folder if you don&apos;t see it.
            </p>
            {error && <p style={{ color: "var(--error-red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              className="btn btn-primary" style={{ width: "100%", marginBottom: 10 }}
              onClick={handleResendVerification}
            >
              Resend verification email
            </button>
            <button
              onClick={() => { setAwaitingVerification(false); setMode("signin"); setError(null); }}
              style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      );
    }

    // Forgot password screen
    if (forgotMode) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-gray)]" style={{ padding: 16 }}>
          <div style={{ background: "white", padding: 28, borderRadius: 20, border: "2px solid var(--border-light)", maxWidth: 420, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <KeyRound size={48} style={{ color: "var(--color-primary)" }} aria-hidden />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Reset your password</h2>
              <p style={{ color: "#888", fontSize: 14 }}>We&apos;ll send you a reset link</p>
            </div>
            {forgotSent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <Mail size={48} style={{ color: "var(--color-primary)" }} aria-hidden />
                </div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Email sent!</p>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
                  Check your inbox for a password reset link.
                </p>
                <button className="btn btn-primary" style={{ width: "100%" }}
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder="Your email address" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border-light)", fontSize: 14, width: "100%", boxSizing: "border-box" as const }} />
                {error && <p style={{ color: "var(--error-red)", fontSize: 13, margin: 0 }}>{error}</p>}
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleForgotPassword}>
                  Send Reset Link
                </button>
                <button onClick={() => { setForgotMode(false); setError(null); }}
                  style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, textAlign: "center" }}>
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center" style={{ padding: 16, background: "linear-gradient(160deg, #06232a 0%, #0a3a44 100%)" }}>
        <div style={{ background: "white", padding: 28, borderRadius: 20, border: "none", maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.28)", overflow: "hidden", position: "relative" }}>
          {/* brand accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--color-primary)", borderRadius: "20px 20px 0 0" }} />
          {/* Icon + wordmark. Was the full wordmark logo (which already reads
              "NOTHO") next to an <h1>Notho</h1>, i.e. "NOTHO Notho". The square
              icon carries the mark; the text carries the name. */}
          {/* The mark IS the N, so the word beside it is OTHO — together they
              read NOTHO, matching the logo lockup. Tight gap so it reads as one
              word, not "N  OTHO". */}
          <div className="flex items-center justify-center" style={{ gap: 3, marginBottom: 20, marginTop: 8 }}>
            <img src="/notho-icon.png" alt="Notho" width={40} height={40} style={{ objectFit: "contain" }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.02em", margin: 0 }}>OTHO</h1>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 10, padding: 3, marginBottom: 20 }}>
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: mode === m ? "white" : "transparent",
                  color: mode === m ? "var(--color-primary)" : "#888",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}>
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* ── Copy-link banner: only shown for browsers that block Google OAuth ── */}
          {(inWebView || oauthBlocked) && (
            <div style={{
              background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: 12,
              padding: "14px 16px", marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <AlertTriangle size={18} style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", margin: "0 0 3px" }}>
                    Google sign-in is blocked in LinkedIn
                  </p>
                  <p style={{ fontSize: 12, color: "#78350F", margin: 0, lineHeight: 1.55 }}>
                    LinkedIn&apos;s browser blocks Google. Use Facebook, email, or copy the link and open it in Chrome or Safari.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "https://notho.co.za";
                  const doCopy = () => {
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 3000);
                  };
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(doCopy).catch(() => {
                      const el = document.createElement("textarea");
                      el.value = url;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand("copy");
                      document.body.removeChild(el);
                      doCopy();
                    });
                  } else {
                    const el = document.createElement("textarea");
                    el.value = url;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand("copy");
                    document.body.removeChild(el);
                    doCopy();
                  }
                }}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "none",
                  background: linkCopied ? "#16A34A" : "#D97706",
                  color: "white", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s",
                }}
              >
                {linkCopied
                  ? <><CheckCircle size={16} /> Link copied &mdash; paste in Chrome or Safari</>
                  : <><ClipboardCopy size={16} /> Copy link to open in your browser</>
                }
              </button>
              <p style={{ fontSize: 11, color: "#92400E", margin: "8px 0 0", textAlign: "center", opacity: 0.7 }}>
                Or sign in with email and password below
              </p>
            </div>
          )}

          {/* ── Social sign-in buttons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => handleOAuthSignIn("google")}
              style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
                color: "var(--color-text-primary)", fontWeight: 600, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuthSignIn("facebook")}
              style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
                color: "var(--color-text-primary)", fontWeight: 600, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.886v2.288h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "signup" && (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" placeholder="First name" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <input type="text" placeholder="Last name" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
                <input type="number" placeholder="Age" value={age} min={13} max={120}
                  inputMode="numeric"
                  onKeyDown={(e) => { if (["e","E","+","-","."].includes(e.key)) e.preventDefault(); }}
                  onChange={(e) => setAge(e.target.value.replace(/D/g, ""))} style={inputStyle} />
              </>
            )}
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#888", fontSize: 13, fontWeight: 600, padding: "2px 4px",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p style={{ color: "var(--error-red)", fontSize: 13, margin: 0 }}>{error}</p>}
            <button
              data-testid="auth-submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 4 }}
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
            {mode === "signin" && (
              <div style={{ textAlign: "center" }}>
                <button onClick={() => { setForgotMode(true); setError(null); }}
                  style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13 }}>
                  Forgot password?
                </button>
                <p style={{ fontSize: 13, color: "#888", margin: "8px 0 0" }}>
                  New here?{" "}
                  <button onClick={() => setMode("signup")}
                    style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    Create a free account
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
