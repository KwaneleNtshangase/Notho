"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  APPLE_NO_EMAIL_MESSAGE,
  appleSessionMissingEmail,
} from "@/lib/appleAuthEmail";

/** Refuses Apple sessions that arrived with no email and surfaces the reason
 *  on the sign-in screen. Hide My Email relay addresses still count as email. */
export function AppleAuthGuard() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const rejectIfMissingEmail = async (session: unknown) => {
      if (!appleSessionMissingEmail(session)) {
        return false;
      }
      await supabase.auth.signOut();
      if (mounted) setMessage(APPLE_NO_EMAIL_MESSAGE);
      return true;
    };

    void supabase.auth.getSession().then(({ data }) => {
      void rejectIfMissingEmail(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void rejectIfMissingEmail(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 80,
        maxWidth: 420,
        margin: "0 auto",
        background: "#FEF2F2",
        color: "#991B1B",
        border: "1px solid #FECACA",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 13,
        lineHeight: 1.45,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Apple sign-in needs an email</div>
      {message}
      <button
        type="button"
        onClick={() => setMessage(null)}
        style={{
          display: "block",
          marginTop: 8,
          background: "none",
          border: "none",
          color: "#991B1B",
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          fontSize: 13,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
