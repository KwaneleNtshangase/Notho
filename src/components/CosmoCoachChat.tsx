"use client";

/**
 * Cosmo AI chat (Tier 2 client).
 *
 * Floating chat button (bottom-right) that opens a compact chat panel.
 * Gates on explicit opt-in consent (user_settings.coach_ai_consent), then
 * chats via POST /api/coach/chat. History for today loads from coach_ai_logs
 * (RLS: read-own only; all writes happen server-side).
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ChatMsg = { role: "user" | "assistant"; content: string };

type ChatState =
  | { kind: "loading" }
  | { kind: "consent" }
  | { kind: "chat" };

const INPUT_MAX = 500;

export function CosmoCoachChat() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState>({ kind: "loading" });
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load consent + today's history when the panel first opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [settingsRes, logsRes] = await Promise.all([
        supabase
          .from("user_settings")
          .select("coach_ai_consent")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("coach_ai_logs")
          .select("role, content, created_at")
          .order("created_at", { ascending: true })
          .limit(20),
      ]);
      if (cancelled) return;

      const consent = Boolean(settingsRes.data?.coach_ai_consent);
      setMessages(
        ((logsRes.data ?? []) as { role: string; content: string }[])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as ChatMsg["role"], content: m.content }))
      );
      setState({ kind: consent ? "chat" : "consent" });
    }

    load();
    return () => { cancelled = true; };
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  async function setConsent(value: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, coach_ai_consent: value }, { onConflict: "user_id" });
    setState({ kind: value ? "chat" : "consent" });
  }

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setInput("");
    setNotice(null);
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: message }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("no-session");

      // Bound the wait so a slow model call can't leave the chat "typing"
      // indefinitely; abort after 45s and show a clean retry message.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000);
      let res: Response;
      try {
        res = await fetch("/api/coach/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 429) {
        setNotice("You've used today's 10 coach messages. More tomorrow!");
        setRemaining(0);
        return;
      }
      if (res.status === 403) {
        setState({ kind: "consent" });
        return;
      }
      if (res.status === 503) {
        setNotice("The AI coach isn't set up yet. Please check back soon.");
        return;
      }
      if (!res.ok) {
        setNotice(`Coach is unavailable right now (code ${res.status}), try again later.`);
        return;
      }

      const data = (await res.json()) as { reply: string; remaining: number };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      setRemaining(data.remaining);
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      setNotice(
        timedOut
          ? "That took too long to answer. Please try again in a moment."
          : "Coach is unavailable right now, try again later."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`
        .notho-chat-fab {
          position: fixed;
          right: 16px;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 92px);
          z-index: 60;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: var(--color-primary, #007A85);
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notho-chat-panel {
          position: fixed;
          right: 12px;
          left: 12px;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 92px);
          z-index: 61;
          max-width: 400px;
          margin-left: auto;
          border: 1.5px solid var(--color-border);
          border-radius: 16px;
          background: var(--color-background, var(--color-surface, #fff));
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          padding: 14px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .notho-chat-fab { right: 24px; bottom: 24px; }
          .notho-chat-panel { right: 24px; left: auto; bottom: 92px; width: 380px; }
        }
        /* Class-based with !important: globals.css paints inputs dark in dark
           mode (html.dark input) and strips borders globally, so inline styles
           are not enough to keep this pill white in both themes. */
        .notho-chat-form {
          display: flex;
          align-items: center;
          background: #fff !important;
          border: none;
          border-radius: 999px;
          padding: 4px 4px 4px 18px;
          min-width: 0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }
        .notho-chat-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent !important;
          font-size: 14px;
          padding: 9px 0;
          color: #111827 !important;
        }
        .notho-chat-input::placeholder { color: #9ca3af !important; }
        .notho-chat-input:disabled { opacity: 0.6; }
      `}</style>

      {!open && (
        <button
          type="button"
          className="notho-chat-fab"
          aria-label="Ask Cosmo about your money"
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}

      {open && (
        <div className="notho-chat-panel" role="dialog" aria-label="Ask Cosmo, your money coach">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>💬 Ask Cosmo</span>
            {/* Persistent "this is AI" marker. Apple and Google both require a
                user-facing disclosure wherever generative AI output appears,
                not only behind the one-time consent step. */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary)",
                borderRadius: 6,
                padding: "1px 5px",
              }}
            >
              AI
            </span>
            {state.kind === "chat" && remaining !== null && (
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                {remaining} left today
              </span>
            )}
            <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              {state.kind === "chat" && (
                <button
                  type="button"
                  onClick={() => setConsent(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)",
                    padding: 0,
                  }}
                >
                  Turn AI off
                </button>
              )}
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 700, color: "var(--color-text-secondary)",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </span>
          </div>

          {state.kind === "loading" && (
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>Loading…</p>
          )}

          {state.kind === "consent" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: "0 0 8px" }}>
                Cosmo is an <strong>AI assistant</strong>, powered by Google
                Gemini. Ask it questions about your month. Only anonymised
                category totals are shared with the AI. Your name,
                transactions, and account details are never shared.
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
                AI can get things wrong. Cosmo explains, it does not advise, and
                it is not a financial adviser.{" "}
                <a
                  href="/privacy#ai-coach"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-primary)", fontWeight: 600 }}
                >
                  How this works
                </a>
              </p>
              <button
                type="button"
                onClick={() => setConsent(true)}
                style={{
                  background: "var(--color-primary)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Turn on AI coach
              </button>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
                You can turn this off anytime.
              </p>
            </div>
          )}

          {state.kind === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div
                ref={listRef}
                style={{
                  height: "min(300px, 45vh)", overflowY: "auto", display: "flex",
                  flexDirection: "column", gap: 8, marginBottom: 10,
                }}
              >
                {messages.length === 0 && !sending && (
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
                    Try: &ldquo;Why is my food spend up this month?&rdquo;
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      background: m.role === "user" ? "var(--color-primary)" : "var(--color-border)",
                      color: m.role === "user" ? "#fff" : "var(--color-text-primary)",
                      borderRadius: 12, padding: "8px 12px", fontSize: 13, lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <div
                    aria-label="Cosmo is typing"
                    style={{
                      alignSelf: "flex-start", background: "var(--color-border)",
                      borderRadius: 12, padding: "8px 12px", fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Cosmo is typing…
                  </div>
                )}
              </div>

              {notice && (
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
                  {notice}
                </p>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="notho-chat-form"
              >
                <input
                  value={input}
                  maxLength={INPUT_MAX}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your month"
                  disabled={sending || remaining === 0}
                  className="notho-chat-input"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={sending || !input.trim() || remaining === 0}
                  style={{
                    width: 38, height: 38, flexShrink: 0, marginLeft: 8,
                    borderRadius: "50%", border: "none",
                    background: "var(--color-primary)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: sending || !input.trim() || remaining === 0 ? "default" : "pointer",
                    opacity: sending || !input.trim() || remaining === 0 ? 0.5 : 1,
                  }}
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>

              <p style={{ fontSize: 10, color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
                AI-generated. Cosmo can make mistakes - check anything
                important. Educational information, not financial advice.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
