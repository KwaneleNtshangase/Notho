"use client";

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
            <img src="/notho-icon-192.png" alt="Notho" />
          </div>
          <div>
            <h1 className="nv-h1">Notho backend</h1>
            <p className="nv-lockup">Learn · Grow · Build wealth</p>
            <p className="nv-sub">Operator tools. Sign in here — not in the learner app.</p>
          </div>
        </div>
      </header>

      {state === "checking" && <div className="nv-skel" style={{ height: 180 }} />}

      {state === "out" && <DeskSignIn onSignedIn={refresh} returnPath="/admin" />}

      {state === "in" && (
        <div className="nv-stack">
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--body)" }}>
            Signed in as <strong style={{ color: "var(--ink)" }}>{email}</strong>
          </p>
          <div className="nv-grid two">
            <Link href="/admin/analytics" className="nv-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h2 className="nv-card-title">Desk</h2>
              <p className="nv-card-sub" style={{ marginBottom: 0 }}>
                Live analytics. Pulse, growth, engagement, retention, content, churn, people.
              </p>
            </Link>
            <Link href="/admin/bugs" className="nv-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h2 className="nv-card-title">Bug console</h2>
              <p className="nv-card-sub" style={{ marginBottom: 0 }}>
                Crash inbox, lifecycle email tests, and broadcasts.
              </p>
            </Link>
          </div>
          <p className="nv-card-sub" style={{ margin: 0 }}>
            Google, a password, or a magic link all stay on /admin. They do not open Learn.
          </p>
          <button
            type="button"
            className="nv-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              setState("out");
            }}
            style={{ width: "fit-content" }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
