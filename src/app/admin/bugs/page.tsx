"use client";
import { localizeClientString } from "@/i18n/clientString";

import { LocalizedRichText as I18nRich, LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BugItem = {
  id: string;
  source: "auto" | "reported";
  area: string | null;
  subject: string | null;
  description: string | null;
  userEmail: string | null;
  createdAt: string;
  status: string;
  notifiedAt: string | null;
  note: string | null;
};

/** Admin control to send test copies of the lifecycle emails to yourself. */
function LifecycleTestPanel() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const KINDS: { key: string; label: string }[] = [
    { key: "welcome", label: "Welcome" },
    { key: "d1", label: "Day 1" },
    { key: "d7", label: "Day 7" },
    { key: "d14", label: "Day 14" },
    { key: "d30", label: "Day 30" },
  ];
  const send = async (kind: string) => {
    setBusy(kind); setMsg(null);
    const { data } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/email-test", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ kind }),
    });
    const out = await res.json().catch(() => ({}));
    setBusy(null);
    setMsg(res.ok ? `Sent the ${kind} email to ${out.sentTo}. Check your inbox.` : `Failed: ${out.error ?? res.status}`);
  };
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#F5FBF8", marginBottom: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: "#065f46" }}><I18nText source={"Lifecycle email tests"} /></div>
      <p style={{ fontSize: 13, color: "#374151", margin: "0 0 12px" }}><I18nText source={"Send a test copy of each lifecycle email to your own address to preview it. Subjects are prefixed with [TEST]."} /></p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {KINDS.map((k) => (
          <button key={k.key} type="button" onClick={() => send(k.key)} disabled={busy === k.key}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #007A85", background: "#fff", color: "#007A85", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: busy === k.key ? 0.6 : 1 }}>
            <I18nText>{busy === k.key ? "Sending…" : k.label}</I18nText>
          </button>
        ))}
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}><I18nText>{msg}</I18nText></div>}
    </div>
  );
}

/** Admin control to schedule the "budget statement import" announcement to all users. */
function BroadcastPanel() {
  const [status, setStatus] = useState<"idle" | "checking" | "ready" | "sending" | "done" | "error">("idle");
  const [count, setCount] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const authToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const check = async () => {
    setStatus("checking"); setMsg(null);
    const t = await authToken();
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ dryRun: true }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); setMsg(out.error ?? `Error ${res.status}`); return; }
    setCount(out.recipients ?? 0);
    setScheduledAt(out.scheduledAt ?? null);
    setStatus("ready");
  };

  const sendTest = async () => {
    setMsg("Sending test…");
    const t = await authToken();
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ test: true }),
    });
    const out = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Test sent to ${out.sentTo}. Check your inbox.` : `Test failed: ${out.error ?? res.status}`);
  };

  const send = async () => {
    if (!window.confirm(localizeClientString(`Schedule the budget announcement to ${count} users, delivered ${prettyDate(scheduledAt)}?\n\nThis cannot be undone from here (only cancelled per-email in Resend).`))) return;
    setStatus("sending"); setMsg(null);
    const t = await authToken();
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ dryRun: false, confirm: true }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); setMsg(out.error ?? `Error ${res.status}`); return; }
    setStatus("done");
    setMsg(`Scheduled ${out.scheduled}/${out.totalRecipients} emails for ${prettyDate(out.scheduledAt)}${out.failed ? ` · ${out.failed} failed` : ""}.`);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#F5FBF8", marginBottom: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: "#065f46" }}><I18nText source={"Budget announcement broadcast"} /></div>
      <p style={{ fontSize: 13, color: "#374151", margin: "0 0 12px" }}><I18nText source={"Schedules the \"import your bank statement\" announcement to every confirmed user, sent from hello@notho.co.za. Delivery is queued in Resend for the set time."} /></p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <a href="/api/admin/broadcast?preview=1" target="_blank" rel="noopener noreferrer"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 13, textDecoration: "none" }}><I18nText source={"Preview email"} /></a>
        <button type="button" onClick={sendTest}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><I18nText source={"Send test to me"} /></button>
        {status !== "done" && (
          <button type="button" onClick={check} disabled={status === "checking" || status === "sending"}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #007A85", background: "#fff", color: "#007A85", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <I18nText>{status === "checking" ? "Checking…" : "Check recipients"}</I18nText>
          </button>
        )}
        {status === "ready" && count != null && (
          <>
            <span style={{ fontSize: 13, color: "#374151" }}><I18nText source={"{value0} recipients · delivers {value1}"} values={[count, prettyDate(scheduledAt)]} /></span>
            <button type="button" onClick={send}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#007A85", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><I18nText source={"Schedule send"} /></button>
          </>
        )}
        {status === "sending" && <span style={{ fontSize: 13, color: "#374151" }}><I18nText source={"Scheduling…"} /></span>}
        {status === "done" && <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}><I18nText>{msg}</I18nText></span>}
        {status === "error" && <span style={{ fontSize: 13, color: "#E03C31", fontWeight: 700 }}><I18nText>{msg}</I18nText></span>}
      </div>
      {msg && (status === "idle" || status === "ready" || status === "checking") && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}><I18nText>{msg}</I18nText></div>
      )}
    </div>
  );
}

/** Normalise a blob of pasted addresses into a clean, de-duplicated list. */
function parseEmails(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,;]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.includes("@"))
    )
  );
}

/**
 * Admin control to finish a partial broadcast: sends the announcement immediately
 * to every confirmed user who is NOT in the pasted "already received" list.
 * Guarantees no duplicates (excludes who already got it) and no omissions
 * (targets the full confirmed-user list minus that set).
 */
function RetryUnsentPanel() {
  const [alreadySent, setAlreadySent] = useState("");
  const [remaining, setRemaining] = useState<string[] | null>(null);
  const [unknownPasted, setUnknownPasted] = useState<string[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<
    "idle" | "previewing" | "ready" | "sending" | "done" | "error"
  >("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const authToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const preview = async () => {
    setStatus("previewing"); setMsg(null); setRemaining(null);
    const t = await authToken();
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ dryRun: true, listAll: true }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); setMsg(out.error ?? `Error ${res.status}`); return; }
    const all: string[] = out.all ?? [];
    const sentSet = new Set(parseEmails(alreadySent));
    const rem = all.filter((e) => !sentSet.has(e));
    const unknown = [...sentSet].filter((e) => !all.includes(e));
    setTotal(all.length);
    setRemaining(rem);
    setUnknownPasted(unknown);
    setStatus("ready");
  };

  const sendNow = async () => {
    if (!remaining || remaining.length === 0) return;
    if (!window.confirm(
      localizeClientString(`Send the announcement immediately to ${remaining.length} user(s) who haven't received it yet?\n\nThey will receive it within about a minute. This cannot be undone.`)
    )) return;
    setStatus("sending"); setMsg(null);
    const t = await authToken();
    // A near-future scheduled_at delivers almost immediately AND keeps the real
    // (non-[TEST]) subject line, which the route only uses when scheduledAt is set.
    const scheduledAt = new Date(Date.now() + 30_000).toISOString();
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ dryRun: false, confirm: true, onlyTo: remaining, scheduledAt }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); setMsg(out.error ?? `Error ${res.status}`); return; }
    setStatus("done");
    setMsg(
      `Sent to ${out.scheduled}/${out.totalRecipients} user(s)${out.failed ? ` · ${out.failed} failed` : ""}. Delivering now.`
    );
  };

  const box: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#FFF7ED", marginBottom: 20 };
  const btn = (primary?: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: 8, border: primary ? "none" : "1px solid #C2410C",
    background: primary ? "#C2410C" : "#fff", color: primary ? "#fff" : "#C2410C",
    fontWeight: 700, fontSize: 13, cursor: "pointer",
  });

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: "#9A3412" }}><I18nText source={"Finish a partial broadcast (retry unsent)"} /></div>
      <p style={{ fontSize: 13, color: "#374151", margin: "0 0 10px" }}><I18nRich source={"Paste the addresses that <b0>already received</b0>  the announcement (copy them from Resend). This sends immediately to every confirmed user who is <b1>not</b1>  in that list, so no one is emailed twice."} elements={[<b key="inline-0" />, <b key="inline-1" />]} /></p>
      <textarea
        value={alreadySent}
        onChange={(e) => { setAlreadySent(e.target.value); setStatus("idle"); setRemaining(null); }}
        placeholder={"already-received addresses, one per line or comma-separated\n(e.g. from Resend > Emails)"}
        rows={5}
        style={{ width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "ui-monospace, Menlo, monospace", marginBottom: 10 }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button type="button" onClick={preview} disabled={status === "previewing" || status === "sending"} style={btn(false)}>
          <I18nText>{status === "previewing" ? "Checking…" : "Preview who's left"}</I18nText>
        </button>
        {status === "ready" && remaining && (
          <>
            <span style={{ fontSize: 13, color: "#374151" }}>
              <I18nText>{parseEmails(alreadySent).length}</I18nText> <I18nText source={" already sent · "} /><b><I18nText>{remaining.length}</I18nText></b> <I18nText source={" still to send"} /><I18nText>{total != null ? ` (of ${total} confirmed)` : ""}</I18nText>
            </span>
            {remaining.length > 0 && (
              <button type="button" onClick={sendNow} style={btn(true)}><I18nText source={"Send now to {value0}"} values={[remaining.length]} /></button>
            )}
          </>
        )}
        {status === "sending" && <span style={{ fontSize: 13, color: "#374151" }}><I18nText source={"Sending…"} /></span>}
        {status === "done" && <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}><I18nText>{msg}</I18nText></span>}
        {status === "error" && <span style={{ fontSize: 13, color: "#E03C31", fontWeight: 700 }}><I18nText>{msg}</I18nText></span>}
      </div>
      {status === "ready" && remaining && (
        <div style={{ marginTop: 12 }}>
          {remaining.length === 0 ? (
            <div style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}><I18nText source={"Everyone has already received it. Nothing to send. ✓"} /></div>
          ) : (
            <div style={{ fontSize: 12.5, color: "#374151" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}><I18nText source={"Will send to:"} /></div>
              <div style={{ maxHeight: 180, overflow: "auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, Menlo, monospace" }}>
                <I18nText>{remaining.join("\n")}</I18nText>
              </div>
            </div>
          )}
          {unknownPasted.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#9A3412" }}><I18nText source={"Note: {value0} pasted address(es) don't match any confirmed user (ignored): {value1}"} values={[unknownPasted.length, unknownPasted.join(", ")]} /></div>
          )}
        </div>
      )}
    </div>
  );
}

function prettyDate(iso: string | null): string {
  if (!iso) return "the scheduled time";
  try {
    return new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" }) + " SAST";
  } catch { return iso; }
}

const STATUSES = ["new", "investigating", "fixed", "wont_fix"] as const;
const STATUS_LABEL: Record<string, string> = {
  new: "New", investigating: "Investigating", fixed: "Fixed", wont_fix: "Won't fix",
};

export default function AdminBugsPage() {
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [items, setItems] = useState<BugItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: string; note: string; notify: boolean }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }, []);

  const load = useCallback(async () => {
    const t = await token();
    if (!t) { setState("forbidden"); return; }
    const res = await fetch("/api/admin/bugs", { headers: { Authorization: `Bearer ${t}` } });
    if (res.status === 403) { setState("forbidden"); return; }
    if (!res.ok) { setState("error"); return; }
    const data = await res.json();
    setItems(data.items ?? []);
    setState("ready");
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const draftFor = (it: BugItem) => drafts[it.id] ?? { status: it.status, note: it.note ?? "", notify: false };
  const setDraft = (id: string, patch: Partial<{ status: string; note: string; notify: boolean }>) =>
    setDrafts((p) => ({ ...p, [id]: { ...(p[id] ?? { status: "new", note: "", notify: false }), ...patch } }));

  const save = async (it: BugItem) => {
    const d = draftFor(it);
    setBusy(it.id);
    const t = await token();
    const res = await fetch("/api/admin/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ id: it.id, status: d.status, note: d.note, notify: d.notify }),
    });
    const out = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) {
      const msg = d.notify
        ? (out.emailResult === "sent" ? "Saved · user emailed ✓"
          : out.emailResult === "no-email-on-file" ? "Saved · no email on file for this user"
          : `Saved · email failed (${out.emailResult})${out.emailDetail ? `: ${out.emailDetail}` : ""}`)
        : "Saved";
      setToast(msg);
      setTimeout(() => setToast(null), out.emailResult && out.emailResult !== "sent" ? 12000 : 4000);
      load();
    } else {
      setToast(`Error: ${out.error ?? res.status}`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const wrap: React.CSSProperties = { maxWidth: 820, margin: "0 auto", padding: "24px 16px 80px" };

  if (state === "loading") return <main style={wrap}><p style={{ color: "#6b7280" }}><I18nText source={"Loading…"} /></p></main>;
  if (state === "forbidden") return (
    <main style={wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}><I18nText source={"Bug console"} /></h1>
      <p style={{ color: "#6b7280" }}><I18nText source={"You don't have access to this page. Sign in with an admin account (set "} /><code>ADMIN_EMAILS</code> <I18nText source={" in Vercel)."} /></p>
    </main>
  );
  if (state === "error") return <main style={wrap}><p style={{ color: "#E03C31" }}><I18nText source={"Couldn't load bugs. Try again."} /></p></main>;

  const open = items.filter((i) => i.status !== "fixed" && i.status !== "wont_fix");

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}><I18nText source={"Bug console"} /></h1>
        <button type="button" onClick={load} style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><I18nText source={"Refresh"} /></button>
      </div>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}><I18nText source={"{value0} open · {value1} total. Auto-captured crashes and user-reported bugs. Tick \"Email this user\" when you want to tell them it's fixed."} values={[open.length, items.length]} /></p>

      <LifecycleTestPanel />
      <BroadcastPanel />
      <RetryUnsentPanel />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it) => {
          const d = draftFor(it);
          return (
            <div key={it.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: it.source === "auto" ? "#FEF3C7" : "#DBEAFE", color: it.source === "auto" ? "#92400E" : "#1E40AF" }}>
                  <I18nText>{it.source === "auto" ? "Auto-captured" : "User reported"}</I18nText>
                </span>
                {it.area && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#F3F4F6", color: "#374151" }}><I18nText>{it.area}</I18nText></span>}
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: it.status === "fixed" ? "#DCFCE7" : it.status === "wont_fix" ? "#F3F4F6" : "#Fee2e2", color: it.status === "fixed" ? "#166534" : "#374151" }}>
                  <I18nText>{STATUS_LABEL[it.status] ?? it.status}</I18nText>
                </span>
                {it.notifiedAt && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}><I18nText source={"✓ user emailed"} /></span>}
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}><I18nText>{new Date(it.createdAt).toLocaleString("en-ZA")}</I18nText></span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}><I18nText>{it.subject ?? "(no subject)"}</I18nText></div>
              <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 8 }}>
                {it.userEmail ? <><I18nText source={"From "} /><b><I18nText>{it.userEmail}</I18nText></b></> : "Anonymous user"}
              </div>
              <details style={{ marginBottom: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "#007A85", fontWeight: 700 }}><I18nText source={"Details"} /></summary>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, background: "#f9fafb", borderRadius: 8, padding: 12, marginTop: 8, color: "#374151" }}>{it.description}</pre>
              </details>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <select value={d.status} onChange={(e) => setDraft(it.id, { status: e.target.value })}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontWeight: 600 }}>
                  {STATUSES.map((s) => <I18nElement as="option" key={s} value={s}>{STATUS_LABEL[s]}</I18nElement>)}
                </select>
                <I18nElement as="input" type="text" placeholder="What was fixed (optional, goes in the email)" value={d.note}
                  onChange={(e) => setDraft(it.id, { note: e.target.value })}
                  style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: it.userEmail ? "pointer" : "not-allowed", color: it.userEmail ? "#111827" : "#9ca3af" }}>
                  <input type="checkbox" disabled={!it.userEmail} checked={d.notify} onChange={(e) => setDraft(it.id, { notify: e.target.checked })} />
                  <I18nText source={"Email this user"} /></label>
                <button type="button" disabled={busy === it.id} onClick={() => save(it)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#007A85", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: busy === it.id ? 0.6 : 1 }}>
                  <I18nText>{busy === it.id ? "Saving…" : d.notify ? "Save & email" : "Save"}</I18nText>
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p style={{ color: "#6b7280" }}><I18nText source={"No bugs captured yet. 🎉"} /></p>}
      </div>

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", background: "#111827", color: "#fff", padding: "10px 18px", borderRadius: 999, fontWeight: 700, fontSize: 14, zIndex: 100 }}><I18nText>{toast}</I18nText></div>
      )}
    </main>
  );
}
