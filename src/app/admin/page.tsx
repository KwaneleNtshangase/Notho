"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

/**
 * /admin — operator hub.
 *
 * One place to land, sign in, and jump to the desk or the bug console
 * without walking through the learner app.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ThemeProvider } from "./analytics/theme";
import { DeskSignIn } from "./DeskSignIn";

export default function AdminHomePage() {
  return (
    <ThemeProvider>
      <Hub />
    </ThemeProvider>
  );
}

function Hub() {
  const [state, setState] = useState<"checking" | "out" | "in">("checking");
  const [email, setEmail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setEmail(null);
      setState("out");
      return;
    }
    setEmail(data.session.user.email ?? null);
    setState("in");
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  return (
    <div className="nv-shell" style={{ maxWidth: 820 }}>
      <header className="nv-head">
        <div className="nv-title">
          <div className="nv-mark">
            <I18nElement as="img" src="/notho-icon-192.png" alt="Notho" />
          </div>
          <div>
            <h1 className="nv-h1"><I18nText source={"Notho backend"} /></h1>
            <p className="nv-lockup"><I18nText source={"Learn · Grow · Build wealth"} /></p>
            <p className="nv-sub"><I18nText source={"Operator tools. Sign in here — not in the learner app."} /></p>
          </div>
        </div>
      </header>

      {state === "checking" && <div className="nv-skel" style={{ height: 180 }} />}

      {state === "out" && <DeskSignIn onSignedIn={refresh} returnPath="/admin" />}

      {state === "in" && (
        <div className="nv-stack">
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--body)" }}>
            <I18nText source={"Signed in as "} /><strong style={{ color: "var(--ink)" }}><I18nText>{email}</I18nText></strong>
          </p>
          <div className="nv-grid two">
            <Link href="/admin/analytics" className="nv-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h2 className="nv-card-title"><I18nText source={"Desk"} /></h2>
              <p className="nv-card-sub" style={{ marginBottom: 0 }}><I18nText source={"Live analytics. Pulse, growth, engagement, retention, content, churn, people."} /></p>
            </Link>
            <Link href="/admin/bugs" className="nv-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h2 className="nv-card-title"><I18nText source={"Bug console"} /></h2>
              <p className="nv-card-sub" style={{ marginBottom: 0 }}><I18nText source={"Crash inbox, lifecycle email tests, and broadcasts."} /></p>
            </Link>
          </div>
          <p className="nv-card-sub" style={{ margin: 0 }}><I18nText source={"Google, a password, or a magic link all stay on /admin. They do not open Learn."} /></p>
          <button
            type="button"
            className="nv-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              setState("out");
            }}
            style={{ width: "fit-content" }}
          ><I18nText source={"Sign out"} /></button>
        </div>
      )}
    </div>
  );
}
