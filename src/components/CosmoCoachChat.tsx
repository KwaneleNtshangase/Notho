"use client";
import { LocalizedRichText as I18nRich, LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

/**
 * Cosmo AI chat (Tier 2 client).
 *
 * Floating chat button (bottom-right) that opens a compact chat panel.
 * Gates on explicit opt-in consent (user_settings.coach_ai_consent), then
 * chats via POST /api/coach/chat. The newest page loads from coach_ai_logs
 * (RLS: read-own only; all writes happen server-side).
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { readCoachHistory, type HistoryCursor } from "@/lib/coach/history";
import { sastToday } from "@/lib/dates";
import { MessageSquare } from "@/components/icons/NothoIcons";

type ChatMsg = { role: "user" | "assistant"; content: string };

type ChatState =
  | { kind: "loading" }
  | { kind: "load-error" }
  | { kind: "consent" }
  | { kind: "chat" };

const INPUT_MAX = 500;
const HISTORY_PAGE_SIZE = 20;

export function CosmoCoachChat() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState>({ kind: "loading" });
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const sending = pendingMessage !== null;
  const pendingSend = useRef<Promise<void> | null>(null);
  const [earlierPage, setEarlierPage] = useState<{ userId: string; before: HistoryCursor } | null>(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const historyVersion = useRef(0);
  const scrollAnchor = useRef<{ height: number; top: number } | null>(null);
  const [allowance, setAllowance] = useState<{ day: string; left: number } | null>(null);
  const remaining = allowance?.day === sastToday() ? allowance.left : null;
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const version = historyVersion.current;

    async function load() {
      // A reopened panel must read after an in-flight exchange has been saved.
      if (pendingSend.current) await pendingSend.current;
      if (cancelled) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session unavailable");

      const [settingsRes, logsRes] = await Promise.all([
        supabase
          .from("user_settings")
          .select("coach_ai_consent")
          .eq("user_id", user.id)
          .maybeSingle(),
        readCoachHistory(supabase, user.id, HISTORY_PAGE_SIZE),
      ]);
      if (cancelled) return;

      if (settingsRes.error || logsRes.error) throw new Error("History unavailable");
      const consent = Boolean(settingsRes.data?.coach_ai_consent);
      setMessages(logsRes.messages);
      setEarlierPage(logsRes.before ? { userId: user.id, before: logsRes.before } : null);
      setState({ kind: consent ? "chat" : "consent" });
    }

    load().catch(() => { if (!cancelled) setState({ kind: "load-error" }); });
    return () => {
      cancelled = true;
      historyVersion.current = version + 1;
      scrollAnchor.current = null;
    };
  }, [open, loadAttempt]);

  async function loadEarlier() {
    if (!earlierPage || loadingEarlier) return;
    const version = historyVersion.current;
    setLoadingEarlier(true);
    setNotice(null);
    try {
      const page = await readCoachHistory(supabase, earlierPage.userId, HISTORY_PAGE_SIZE, { before: earlierPage.before });
      if (version !== historyVersion.current) return;
      if (page.error) throw page.error;
      const list = listRef.current;
      if (list) scrollAnchor.current = { height: list.scrollHeight, top: list.scrollTop };
      setMessages(current => [...page.messages, ...current]);
      setEarlierPage(page.before ? { userId: earlierPage.userId, before: page.before } : null);
    } catch {
      if (version === historyVersion.current) setNotice("Earlier messages could not be loaded. Please try again.");
    } finally {
      if (version === historyVersion.current) setLoadingEarlier(false);
    }
  }

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const anchor = scrollAnchor.current;
    list.scrollTop = anchor ? anchor.top + list.scrollHeight - anchor.height : list.scrollHeight;
    scrollAnchor.current = null;
  }, [messages, sending]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const block = (e: TouchEvent) => {
      const list = listRef.current;
      if (list && list.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", block, { passive: false });
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
      document.removeEventListener("touchmove", block);
    };
  }, [open]);

  async function setConsent(value: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, coach_ai_consent: value }, { onConflict: "user_id" });
    setState({ kind: value ? "chat" : "consent" });
  }

  function send() {
    const message = input.trim();
    if (!message || pendingSend.current) return;
    pendingSend.current = sendMessage(message).finally(() => { pendingSend.current = null; });
  }

  async function sendMessage(message: string) {
    setNotice(null);
    setPendingMessage(message);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("no-session");

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
        setAllowance({ day: sastToday(), left: 0 });
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
        const error = await res.json().catch(() => null);
        setNotice(error?.error === "history_save_failed"
          ? "Cosmo couldn't save this exchange. Please try sending your question again."
          : `Coach is unavailable right now (code ${res.status}), try again later.`);
        return;
      }

      const data = (await res.json()) as { reply: string; remaining: number };
      setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: data.reply }]);
      setInput("");
      setAllowance({ day: sastToday(), left: data.remaining });
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      setNotice(
        timedOut
          ? "That took too long to answer. Please try again in a moment."
          : "Coach is unavailable right now, try again later."
      );
    } finally {
      setPendingMessage(null);
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
        .notho-chat-backdrop {
          position: fixed;
          inset: 0;
          z-index: 61;
          background: rgba(0, 0, 0, 0.45);
          overscroll-behavior: none;
        }
        .notho-chat-panel {
          position: fixed;
          right: 0;
          left: 0;
          bottom: 0;
          z-index: 62;
          max-width: 440px;
          margin: 0 auto;
          border: 1.5px solid var(--color-border);
          border-radius: 16px 16px 0 0;
          background: var(--color-background, var(--color-surface, #fff));
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          padding: 14px 14px calc(14px + env(safe-area-inset-bottom, 0px));
          display: flex;
          flex-direction: column;
          max-height: min(78dvh, 640px);
        }
        @media (min-width: 768px) {
          .notho-chat-fab { right: 24px; bottom: 24px; }
          .notho-chat-panel { right: 24px; left: auto; bottom: 24px; width: 380px; border-radius: 16px; }
        }
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
          font-size: 16px;
          line-height: 1.3;
          padding: 10px 0;
          color: #111827 !important;
          touch-action: manipulation;
        }
        .notho-chat-input::placeholder { color: #9ca3af !important; }
        .notho-chat-input:disabled { opacity: 0.6; }
      `}</style>

      {!open && (
        <I18nElement as="button"
          type="button"
          className="notho-chat-fab"
          aria-label="Ask Cosmo"
          onClick={() => {
            setState({ kind: "loading" });
            setLoadingEarlier(false);
            if (!pendingSend.current) setNotice(null);
            setOpen(true);
          }}
        >
          <MessageSquare size={24} style={{ color: "#fff" }} />
        </I18nElement>
      )}

      {open && (
        <>
          <div
            className="notho-chat-backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <I18nElement as="div" className="notho-chat-panel" role="dialog" aria-modal="true" aria-label="Ask Cosmo, your money coach">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800 }}><I18nText source={"Cosmo"} /></span>
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
            ><I18nText source={"AI"} /></span>
            {state.kind === "chat" && remaining !== null && (
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}><I18nText source={"{value0} left today"} values={[remaining]} /></span>
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
                ><I18nText source={"Turn AI off"} /></button>
              )}
              <I18nElement as="button"
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, fontWeight: 700, color: "var(--color-text-secondary)",
                  width: 36, height: 36,
                }}
              >
                ✕
              </I18nElement>
            </span>
          </div>

          {state.kind === "loading" && (
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}><I18nText source={"Loading…"} /></p>
          )}

          {state.kind === "load-error" && (
            <div role="alert">
              <p><I18nText source={"Cosmo couldn't load your chat history."} /></p>
              <button type="button" onClick={() => { setState({ kind: "loading" }); setLoadAttempt(n => n + 1); }}>
                <I18nText source={"Try again"} />
              </button>
            </div>
          )}

          {state.kind === "consent" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: "0 0 8px" }}><I18nText source={"Cosmo is an AI assistant. Ask him questions about your budget."} /></p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px" }}><I18nRich source={"AI can get things wrong. Cosmo explains, it does not advise, and it is not a financial adviser.  <a0>How this works</a0>"} elements={[<a key="inline-0"
                  href="/privacy#ai-coach"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-primary)", fontWeight: 600 }}
                 />]} /></p>
              <button
                type="button"
                onClick={() => setConsent(true)}
                style={{
                  background: "var(--color-primary)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "9px 16px", fontSize: 16, fontWeight: 700,
                  cursor: "pointer",
                }}
              ><I18nText source={"Turn on AI coach"} /></button>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "8px 0 0" }}><I18nText source={"You can turn this off anytime."} /></p>
            </div>
          )}

          {state.kind === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div
                ref={listRef}
                style={{
                  height: "min(300px, 45vh)", overflowY: "auto", display: "flex",
                  flexDirection: "column", gap: 8, marginBottom: 10, WebkitOverflowScrolling: "touch",
                }}
              >
                {earlierPage && (
                  <button type="button" onClick={loadEarlier} disabled={loadingEarlier || sending}>
                    <I18nText source={loadingEarlier ? "Loading…" : "Load earlier messages"} />
                  </button>
                )}
                {messages.length === 0 && !sending && (
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}><I18nText source={"Ask about a category on this month's budget."} /></p>
                )}
                {(pendingMessage ? [...messages, { role: "user", content: pendingMessage }] : messages).map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      background: m.role === "user" ? "var(--color-primary)" : "var(--color-border)",
                      color: m.role === "user" ? "#fff" : "var(--color-text-primary)",
                      borderRadius: 12, padding: "8px 12px", fontSize: 15, lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <I18nElement as="div"
                    aria-label="Cosmo is typing"
                    style={{
                      alignSelf: "flex-start", background: "var(--color-border)",
                      borderRadius: 12, padding: "8px 12px", fontSize: 15,
                      color: "var(--color-text-secondary)",
                    }}
                  ><I18nText source={"Cosmo is typing…"} /></I18nElement>
                )}
              </div>

              {notice && (
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
                  <I18nText>{notice}</I18nText>
                </p>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="notho-chat-form"
              >
                <I18nElement as="input"
                  value={sending ? "" : input}
                  maxLength={INPUT_MAX}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your month"
                  disabled={sending || remaining === 0}
                  className="notho-chat-input"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  enterKeyHint="send"
                />
                <I18nElement as="button"
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
                </I18nElement>
              </form>

              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "8px 0 0" }}><I18nText source={"AI-generated. Cosmo can make mistakes - check anything important. Educational information, not financial advice."} /></p>
            </div>
          )}
          </I18nElement>
        </>
      )}
    </>
  );
}
