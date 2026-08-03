"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Public "Your data & security" page. Explains how we handle data (plain
 * language, POPIA-aligned) and gives signed-in users the two data-subject
 * rights: download everything we hold, and delete their account for good.
 */
export default function SecurityPage() {
  const [busy, setBusy] = useState<null | "export" | "delete">(null);
  const [msg, setMsg] = useState<string | null>(null);

  const token = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const downloadData = async () => {
    setMsg(null);
    const t = await token();
    if (!t) { setMsg("Please sign in first, then come back to download your data."); return; }
    setBusy("export");
    try {
      const res = await fetch("/api/account/export", { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) { setMsg("Something went wrong. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notho-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    setMsg(null);
    const t = await token();
    if (!t) { setMsg("Please sign in first."); return; }
    if (!window.confirm("Delete your Notho account and all your data? This cannot be undone.")) return;
    if (!window.confirm("Last check: this permanently removes your lessons, progress and budget data. Continue?")) return;
    setBusy("delete");
    try {
      const res = await fetch("/api/account/delete", { method: "POST", headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) { setMsg("We couldn't delete the account. Please contact hello@notho.co.za."); return; }
      await supabase.auth.signOut();
      window.location.href = "/";
    } finally {
      setBusy(null);
    }
  };

  const wrap: React.CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", color: "var(--color-text-primary)", lineHeight: 1.65 };
  const card: React.CSSProperties = { background: "var(--color-surface)", borderRadius: 16, padding: "20px 22px", marginBottom: 16 };
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 800, margin: "0 0 8px" };
  const p: React.CSSProperties = { fontSize: 14.5, color: "var(--color-text-secondary)", margin: "0 0 8px" };
  const btn: React.CSSProperties = { padding: "12px 18px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14.5, cursor: "pointer" };

  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Your data & security</h1>
      <p style={{ ...p, marginBottom: 24 }}>
        Notho is built to help you learn about money, and to keep your information safe while you do.
      </p>

      <div style={card}>
        <h2 style={h2}>How we protect your data</h2>
        <p style={p}>Everything travels over encrypted HTTPS, and your data is encrypted at rest by our database provider.</p>
        <p style={p}>Row-level security means each person can only ever see their own records, never anyone else's.</p>
        <p style={{ ...p, marginBottom: 0 }}>When you import a bank statement, we use it to build your budget. We do not sell your data or share it for advertising.</p>
      </div>

      <div style={card}>
        <h2 style={h2}>Not financial advice</h2>
        <p style={{ ...p, marginBottom: 0 }}>
          Notho is educational only. It is not financial, investment, tax or legal advice. For decisions about your money, speak to a licensed advisor.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>Your rights</h2>
        <p style={p}>Under POPIA you can access the data we hold about you and ask us to delete it. You can do both right here.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <button type="button" onClick={downloadData} disabled={busy !== null}
            style={{ ...btn, background: "var(--color-primary)", color: "#fff", opacity: busy === "export" ? 0.6 : 1 }}>
            {busy === "export" ? "Preparing…" : "Download my data"}
          </button>
          <button type="button" onClick={deleteAccount} disabled={busy !== null}
            style={{ ...btn, background: "transparent", color: "#E03C31", boxShadow: "inset 0 0 0 1.5px #E03C31", opacity: busy === "delete" ? 0.6 : 1 }}>
            {busy === "delete" ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        {msg && <p style={{ ...p, marginTop: 12, marginBottom: 0, color: "var(--color-text-primary)" }}>{msg}</p>}
      </div>

      <p style={{ ...p, textAlign: "center", marginTop: 8 }}>
        Questions? <a href="mailto:hello@notho.co.za" style={{ color: "var(--color-primary)", fontWeight: 700 }}>hello@notho.co.za</a>
      </p>
    </main>
  );
}
