"use client";

/**
 * /unsubscribe - the public exit page, reached only from an email footer.
 *
 * It serves both email doors, because they are the same conversation:
 *
 *   default   "Stop emailing me."          -> choose a level, then say why.
 *   ?ctx=inactive  "We noticed you stopped." -> say why, then take an offer.
 *
 * WHAT THIS PAGE REFUSES TO DO
 *   It does not require a login. Somebody who has stopped using Notho will not
 *   log in to turn emails off; they will hit "report spam", which damages the
 *   sending domain for every other user.
 *   It does not put the reason question before the unsubscribe. The thing they
 *   came to do happens first and is confirmed; the survey comes after, clearly
 *   optional. A survey standing between a person and an unsubscribe button is
 *   how you earn a spam complaint.
 *
 * WHY EVERY COLOUR HERE IS var(--u-*), NEVER A LITERAL HEX STRING
 *   This page is a public, unauthenticated door reached from an email client.
 *   It has nothing to do with whatever theme a signed-in visitor's app session
 *   left on <html> (html.dark), and it must not inherit it: globals.css carries
 *   blanket dark-mode rules (~line 1259) that force colour on bare div/span/p/
 *   label under html.dark, plus attribute-selector overrides that rewrite any
 *   inline style containing specific hardcoded hex strings (#111827, #4B5563,
 *   #6B7280, "#fff", etc). A hardcoded white card with hardcoded dark text is
 *   exactly the shape those rules target - the result, for a visitor whose app
 *   theme happens to be dark, is white text painted onto a card that stayed
 *   white: unreadable.
 *   Rather than editing globals.css (owned by another surface, and a public
 *   email-footer page has no business inheriting the signed-in app's theme
 *   rules anyway), this page defines its own small set of --u-* custom
 *   properties on its root element, pinned to fixed light-theme values, and
 *   references colour only via var(...). An inline style is never beaten by a
 *   non-!important external rule regardless of specificity, so this is safe
 *   independent of any hex-matching detail in globals.css - and there is no
 *   literal hex substring left in any `style` attribute for an attribute
 *   selector to find in the first place.
 *   The same block also re-pins --color-primary / --color-text-primary / etc,
 *   the tokens ExitSurvey's <ReasonPicker> reads, so the reason survey renders
 *   in the same fixed light theme as the rest of the page instead of following
 *   whatever the signed-in app's theme happened to be.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReasonPicker } from "@/components/churn/ExitSurvey";
import { offerFor, type ReasonCode } from "@/lib/churn/reasons";

type Choice = "weekly" | "pause30" | "product_only" | "all";

/**
 * The page's entire palette, pinned regardless of html.dark. Applied once, on
 * the outermost element, and referenced everywhere below via var(--u-*).
 *
 * The --color-* entries are not this page's own tokens - they are the ones
 * globals.css redefines under html.dark and that ExitSurvey's ReasonPicker
 * reads via var(). Re-declaring them here, on this subtree, overrides the
 * inherited (possibly dark) value for every descendant without touching
 * globals.css or ExitSurvey.tsx.
 */
const ISOLATED_THEME = {
  colorScheme: "light",
  "--u-bg": "#f4f5f7",
  "--u-card": "#ffffff",
  "--u-brand": "#007A85",
  "--u-brand-ink": "#B5E4E8",
  "--u-on-brand": "#ffffff",
  "--u-ink": "#111827",
  "--u-ink-2": "#4b5563",
  "--u-ink-3": "#6b7280",
  "--u-ink-4": "#9AA0A6",
  "--u-border": "#e5e7eb",
  "--u-border-2": "#d8dbe0",
  "--u-danger": "#E03C31",
  "--u-selected-bg": "#E6F4F5",
  "--u-offer-title": "#00636B",

  "--color-primary": "#007A85",
  "--color-primary-light": "#E6F4F5",
  "--color-text-primary": "#111827",
  "--color-text-secondary": "#6B7280",
  "--color-border": "transparent",
  "--color-bg": "#ffffff",
} as React.CSSProperties;

const primaryBtn: React.CSSProperties = {
  width: "100%", padding: "13px", borderRadius: 12, border: "none",
  background: "var(--u-brand)", color: "var(--u-on-brand)", fontWeight: 700, fontSize: 15, cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  width: "100%", padding: "11px", borderRadius: 12, border: "1px solid var(--u-border-2)",
  background: "transparent", color: "var(--u-ink)", fontWeight: 600, fontSize: 14, cursor: "pointer",
};

/**
 * The branded page frame. Declared at module scope, not inside the component:
 * a component created during render is a brand-new type on every render, so
 * React unmounts and remounts its whole subtree - which here would blow away
 * whatever the person had typed in the comment box on each keystroke.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ ...ISOLATED_THEME, minHeight: "100dvh", background: "var(--u-bg)", padding: "40px 16px", fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ background: "var(--u-brand)", borderRadius: "16px 16px 0 0", padding: "22px 26px", display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/notho-icon-white.png" width={36} height={36} alt="" style={{ display: "block" }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--u-on-brand)", lineHeight: 1.2 }}>Notho</div>
            <div style={{ fontSize: 11, color: "var(--u-brand-ink)", letterSpacing: "0.04em", paddingTop: 2 }}>Master Your Money</div>
          </div>
        </div>
        <div style={{ background: "var(--u-card)", borderRadius: "0 0 16px 16px", padding: "28px 26px 30px", color: "var(--u-ink)", lineHeight: 1.6 }}>
          {children}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--u-ink-4)", marginTop: 16 }}>
          Notho · Educational content only, not financial advice.
        </p>
      </div>
    </main>
  );
}

const CHOICES: { value: Choice; title: string; body: string }[] = [
  {
    value: "weekly",
    title: "Just less often",
    body: "One summary email a week instead of the daily nudges.",
  },
  {
    value: "pause30",
    title: "Pause for 30 days",
    body: "Nothing at all for a month, then back to normal.",
  },
  {
    value: "product_only",
    title: "Only important updates",
    body: "No lesson reminders. We'll still tell you about big changes.",
  },
  {
    value: "all",
    title: "Stop all emails",
    body: "You'll still get account emails like password resets.",
  },
];

export default function UnsubscribeClient() {
  const params = useSearchParams();
  const token = params.get("t");
  const inactive = params.get("ctx") === "inactive";
  // The win-back email links straight to a reason, so one tap in the inbox
  // already answers the question and the page just confirms it.
  const prefilled = params.get("r");

  const [firstName, setFirstName] = useState("");
  // A missing token is knowable at first render, so it is initial state rather
  // than something an effect discovers and then re-renders to announce.
  const [loading, setLoading] = useState(Boolean(token));
  const [invalid, setInvalid] = useState(!token);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [choice, setChoice] = useState<Choice>("all");
  const [applied, setApplied] = useState<Choice | null>(null);

  // Likewise the reason: the win-back email puts it in the URL, so it is known
  // before the first paint and seeds the state directly.
  const [reason, setReason] = useState<ReasonCode | null>((prefilled as ReasonCode) ?? null);
  const [detail, setDetail] = useState("");
  const [reasonSent, setReasonSent] = useState(false);
  const [exitId, setExitId] = useState<string | null>(null);
  const [offerTaken, setOfferTaken] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/unsubscribe?t=${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (!res.ok) { setInvalid(true); return; }
        const body = await res.json();
        if (!cancelled) setFirstName(body.firstName ?? "");
      } catch {
        if (!cancelled) setInvalid(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const apply = async (c: Choice) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, choice: c }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "That didn't save. Please try again.");
      }
      setApplied(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't save. Please try again.");
    }
    setBusy(false);
  };

  const sendReason = useCallback(async (skipped: boolean) => {
    setBusy(true);
    try {
      const res = await fetch("/api/exit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          exitType: inactive ? "inactive_survey" : "email_unsubscribe",
          reason: skipped ? null : reason,
          detail: skipped ? null : detail,
          skipped,
        }),
      });
      const b = await res.json().catch(() => ({}));
      setExitId(b.id ?? null);
    } catch { /* never block on analytics */ }
    // Tell the founder why, same door as everything else here: best-effort,
    // fire-and-forget, and never something that can slow this down or fail
    // the person's exit. This is a separate request from the one above on
    // purpose - the founder alert for the unsubscribe itself already went out
    // when the choice was applied, and most people skip this survey, so most
    // unsubscribes only ever get that first email.
    if (!skipped && reason && token) {
      fetch("/api/unsubscribe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason, detail }),
      }).catch(() => { /* best effort */ });
    }
    setReasonSent(true);
    setBusy(false);
  }, [token, inactive, reason, detail]);

  const offer = offerFor(inactive ? "inactive_survey" : "email_unsubscribe", reason);

  const takeOffer = async () => {
    if (!offer) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/exit-feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, id: exitId, action: offer.action }),
      });
      if (!res.ok) throw new Error("That didn't work. Please try again.");
      if (offer.action === "goto_basics" || offer.action === "goto_advanced") {
        window.location.href = "https://www.notho.co.za";
        return;
      }
      setOfferTaken(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work.");
    }
    setBusy(false);
  };

  if (loading) return <Shell><p style={{ color: "var(--u-ink-3)", margin: 0 }}>Loading…</p></Shell>;

  if (invalid) {
    return (
      <Shell>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>This link isn&apos;t valid</h1>
        <p style={{ color: "var(--u-ink-2)", margin: "0 0 18px" }}>
          It may have been cut short by your email app. You can change email settings inside Notho under
          Settings, or email us and we&apos;ll do it for you.
        </p>
        <a href="mailto:support@notho.co.za" style={{ ...primaryBtn, display: "block", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
          Email support@notho.co.za
        </a>
      </Shell>
    );
  }

  const greeting = firstName ? `${firstName}, ` : "";

  // ── The win-back path: reason first, no unsubscribe unless they ask ────────
  if (inactive && !reasonSent) {
    return (
      <Shell>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}>
          {firstName ? `${firstName}, what happened?` : "What happened?"}
        </h1>
        <p style={{ color: "var(--u-ink-2)", margin: "0 0 20px" }}>
          You stopped using Notho a few weeks ago. No pressure to come back — we just want to know what
          got in the way, so it doesn&apos;t get in the next person&apos;s way too.
        </p>
        <ReasonPicker exitType="inactive_survey" value={reason} onChange={setReason} detail={detail} onDetailChange={setDetail} />
        <div style={{ marginTop: 20 }}>
          <button type="button" disabled={!reason || busy} onClick={() => sendReason(false)}
            style={{ ...primaryBtn, opacity: !reason || busy ? 0.5 : 1, marginBottom: 10 }}>
            {busy ? "Sending…" : "Send"}
          </button>
          <button type="button" disabled={busy} onClick={() => apply("all")} style={ghostBtn}>
            Just stop emailing me
          </button>
        </div>
      </Shell>
    );
  }

  // ── Confirmation after any successful change ───────────────────────────────
  if (applied) {
    const line: Record<Choice, string> = {
      weekly: "You'll get one email a week from now on.",
      pause30: "All emails are paused for 30 days.",
      product_only: "Lesson reminders are off. We'll only email about important updates.",
      all: "You're unsubscribed. You won't get any more emails from Notho, apart from account ones like password resets.",
    };
    return (
      <Shell>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}>Done{firstName ? `, ${firstName}` : ""}.</h1>
        <p style={{ color: "var(--u-ink-2)", margin: "0 0 22px" }}>{line[applied]}</p>

        {!reasonSent ? (
          <>
            <div style={{ borderTop: "1px solid var(--u-border)", paddingTop: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                Would you tell us why? <span style={{ fontWeight: 500, color: "var(--u-ink-3)" }}>Optional</span>
              </h2>
              <p style={{ color: "var(--u-ink-3)", fontSize: 13.5, margin: "0 0 16px" }}>
                Your setting is already saved. This is just so we know what to fix.
              </p>
              <ReasonPicker exitType="email_unsubscribe" value={reason} onChange={setReason} detail={detail} onDetailChange={setDetail} />
              <div style={{ marginTop: 18 }}>
                <button type="button" disabled={!reason || busy} onClick={() => sendReason(false)}
                  style={{ ...primaryBtn, opacity: !reason || busy ? 0.5 : 1, marginBottom: 10 }}>
                  {busy ? "Sending…" : "Send"}
                </button>
                <button type="button" disabled={busy} onClick={() => sendReason(true)} style={ghostBtn}>
                  No thanks
                </button>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: "var(--u-ink-2)", margin: 0 }}>Thanks — that&apos;s genuinely useful.</p>
        )}

        {applied === "all" && (
          <p style={{ fontSize: 12.5, color: "var(--u-ink-3)", marginTop: 22, borderTop: "1px solid var(--u-border)", paddingTop: 16 }}>
            Changed your mind?{" "}
            <button type="button" onClick={() => apply("resubscribe" as Choice)}
              style={{ background: "none", border: "none", padding: 0, color: "var(--u-brand)", fontWeight: 700, cursor: "pointer", fontSize: 12.5, textDecoration: "underline" }}>
              Turn emails back on
            </button>
          </p>
        )}
      </Shell>
    );
  }

  // ── After the win-back reason: the matching offer ──────────────────────────
  if (inactive && reasonSent) {
    return (
      <Shell>
        {offerTaken ? (
          <>
            <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}>Sorted.</h1>
            <p style={{ color: "var(--u-ink-2)", margin: "0 0 22px" }}>
              That&apos;s changed. Your account and progress are exactly where you left them.
            </p>
            <a href="https://www.notho.co.za" style={{ ...primaryBtn, display: "block", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
              Open Notho
            </a>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}>Thank you.</h1>
            <p style={{ color: "var(--u-ink-2)", margin: "0 0 20px" }}>
              That goes straight to the person who decides what we build next.
            </p>
            {error && <p style={{ color: "var(--u-danger)", fontSize: 13.5, margin: "0 0 14px" }}>{error}</p>}
            {offer && (
              <div style={{ background: "var(--u-selected-bg)", border: "1px solid var(--u-brand)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--u-offer-title)", marginBottom: 6 }}>{offer.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--u-ink)", lineHeight: 1.55 }}>{offer.body}</div>
              </div>
            )}
            {offer && (
              <button type="button" onClick={takeOffer} disabled={busy} style={{ ...primaryBtn, marginBottom: 10, opacity: busy ? 0.6 : 1 }}>
                {busy ? "One moment…" : offer.cta}
              </button>
            )}
            <button type="button" onClick={() => apply("all")} disabled={busy} style={ghostBtn}>
              Stop emailing me
            </button>
          </>
        )}
      </Shell>
    );
  }

  // ── Default: the unsubscribe choice ────────────────────────────────────────
  return (
    <Shell>
      <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}>
        {greeting}how often should we email you?
      </h1>
      <p style={{ color: "var(--u-ink-2)", margin: "0 0 20px" }}>
        Pick whatever suits. You can change it again any time from this same link.
      </p>

      {error && <p style={{ color: "var(--u-danger)", fontSize: 13.5, margin: "0 0 14px" }}>{error}</p>}

      <div role="radiogroup" aria-label="Email frequency" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {CHOICES.map((c) => {
          const on = choice === c.value;
          return (
            <button key={c.value} type="button" role="radio" aria-checked={on} onClick={() => setChoice(c.value)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 11, width: "100%", textAlign: "left",
                padding: "13px 15px", borderRadius: 12, border: "1.5px solid",
                borderColor: on ? "var(--u-brand)" : "var(--u-border)", background: on ? "var(--u-selected-bg)" : "transparent",
                cursor: "pointer", color: "var(--u-ink)",
              }}>
              <span aria-hidden style={{
                width: 18, height: 18, flexShrink: 0, marginTop: 2, borderRadius: "50%",
                border: "2px solid", borderColor: on ? "var(--u-brand)" : "var(--u-border-2)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--u-brand)" }} />}
              </span>
              <span>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{c.title}</span>
                <span style={{ display: "block", fontSize: 13, color: "var(--u-ink-3)", marginTop: 2 }}>{c.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => apply(choice)} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}>
        {busy ? "Saving…" : "Save my choice"}
      </button>
    </Shell>
  );
}
