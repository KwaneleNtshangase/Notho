"use client";

/**
 * The exit survey: reason picker, save offer, and the modal that wraps both for
 * the account-deletion flow.
 *
 * The pieces are split out because the same two questions get asked at three
 * different doors (delete account, unsubscribe from email, reply to the
 * win-back email) and the answers only stay comparable if the wording and the
 * codes are literally the same component.
 *
 * TWO RULES THIS FILE EXISTS TO ENFORCE
 *   1. Skip is always visible and always one click. Under POPIA you cannot make
 *      erasure conditional on answering a question, and beyond the law, a
 *      survey somebody had to fight through produces answers you should not
 *      trust anyway.
 *   2. The destructive action is never hidden behind the offer. "No thanks,
 *      delete my account" sits right next to the offer button at every step.
 */

import React, { useState } from "react";
import { AlertTriangle, X } from "@/components/icons/NothoIcons";
import {
  DETAIL_MAX,
  offerFor,
  reasonsFor,
  type ExitType,
  type OfferAction,
  type ReasonCode,
  type SaveOffer,
} from "@/lib/churn/reasons";

// ─── Reason picker ────────────────────────────────────────────────────────────

export function ReasonPicker({
  exitType,
  value,
  onChange,
  detail,
  onDetailChange,
}: {
  exitType: ExitType;
  value: ReasonCode | null;
  onChange: (r: ReasonCode) => void;
  detail: string;
  onDetailChange: (v: string) => void;
}) {
  const list = reasonsFor(exitType);
  const selected = list.find((r) => r.code === value) ?? null;

  return (
    <div>
      <div role="radiogroup" aria-label="Reason for leaving" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((r) => {
          const on = value === r.code;
          return (
            <button
              key={r.code}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(r.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid",
                borderColor: on ? "var(--color-primary)" : "var(--color-border)",
                background: on ? "var(--color-primary-light)" : "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: on ? 700 : 500,
                color: "var(--color-text-primary)",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: on ? "var(--color-primary)" : "var(--color-border)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)" }} />}
              </span>
              {r.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 14 }}>
          <label
            htmlFor="exit-detail"
            style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}
          >
            {selected.prompt} <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>(optional)</span>
          </label>
          <textarea
            id="exit-detail"
            value={detail}
            maxLength={DETAIL_MAX}
            onChange={(e) => onDetailChange(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text-primary)",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          {/* Said plainly, because this text is kept after the account is gone. */}
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 5, lineHeight: 1.5 }}>
            We keep this answer to improve Notho. Please don&apos;t include personal or banking details.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Save offer ───────────────────────────────────────────────────────────────

export function OfferCard({
  offer,
  onAccept,
  onDecline,
  declineLabel,
  busy,
}: {
  offer: SaveOffer;
  onAccept: () => void;
  onDecline: () => void;
  declineLabel: string;
  busy?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          background: "var(--color-primary-light)",
          border: "1px solid var(--color-primary)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-primary-dark)", marginBottom: 6 }}>
          {offer.title}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.55 }}>{offer.body}</div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onAccept}
        disabled={busy}
        style={{ width: "100%", marginBottom: 10, opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "One moment…" : offer.cta}
      </button>

      {/* The way out stays a plain, equal-weight button. Never a faint link. */}
      <button
        type="button"
        onClick={onDecline}
        disabled={busy}
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-text-primary)",
          fontWeight: 600,
          fontSize: 14,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {declineLabel}
      </button>
    </div>
  );
}

// ─── The account-deletion modal ───────────────────────────────────────────────

type Step = "reason" | "offer" | "confirm" | "saved";

export function ExitSurveyModal({
  open,
  onClose,
  onDeleteAccount,
  getAccessToken,
}: {
  open: boolean;
  onClose: () => void;
  /** Runs the irreversible delete. Receives the exit_feedback id to close out. */
  onDeleteAccount: (exitId?: string | null) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [detail, setDetail] = useState("");
  const [exitId, setExitId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAction, setSavedAction] = useState<OfferAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const offer = offerFor("account_deletion", reason);

  const reset = () => {
    setStep("reason");
    setReason(null);
    setDetail("");
    setExitId(null);
    setError(null);
    setSavedAction(null);
  };

  const close = () => {
    if (busy || deleting) return;
    reset();
    onClose();
  };

  /** Record the answer, then move on. Never blocks the exit if it fails. */
  const submitReason = async (skipped: boolean) => {
    setBusy(true);
    setError(null);
    let id: string | null = null;
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/exit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          exitType: "account_deletion",
          reason: skipped ? null : reason,
          detail: skipped ? null : detail,
          skipped,
        }),
      });
      const body = await res.json().catch(() => ({}));
      id = (body as { id?: string | null }).id ?? null;
      setExitId(id);
    } catch {
      // Deliberately swallowed. Somebody trying to leave must not be held up
      // by our analytics being down.
    }
    setBusy(false);
    setStep(!skipped && offer ? "offer" : "confirm");
  };

  const acceptOffer = async () => {
    if (!offer) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/exit-feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: exitId, action: offer.action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "That didn't work. Please try again.");
      }
      // Navigation offers leave the modal entirely; the rest confirm in place.
      if (offer.action === "goto_basics" || offer.action === "goto_advanced") {
        window.location.href = "/learn";
        return;
      }
      setSavedAction(offer.action);
      setStep("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work. Please try again.");
    }
    setBusy(false);
  };

  const runDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteAccount(exitId);
    } finally {
      setDeleting(false);
    }
  };

  const panel: React.CSSProperties = {
    background: "var(--color-surface)",
    borderRadius: 20,
    padding: "24px 22px 22px",
    width: "100%",
    maxWidth: 420,
    maxHeight: "88vh",
    overflowY: "auto",
  };

  const ghostBtn: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "transparent",
    color: "var(--color-text-primary)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        {/* ── Step 1: why ── */}
        {step === "reason" && (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "var(--color-text-primary)" }}>
                Before you go
              </div>
              <button type="button" onClick={close} aria-label="Close"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 0 }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "0 0 18px" }}>
              What made you decide to delete your account? One answer, and it genuinely shapes what we build next.
            </p>

            <ReasonPicker
              exitType="account_deletion"
              value={reason}
              onChange={setReason}
              detail={detail}
              onDetailChange={setDetail}
            />

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!reason || busy}
                onClick={() => submitReason(false)}
                style={{ width: "100%", marginBottom: 10, opacity: !reason || busy ? 0.5 : 1 }}
              >
                {busy ? "Saving…" : "Continue"}
              </button>
              {/* Rule 1: always one click out, always visible without scrolling past the offer. */}
              <button type="button" disabled={busy} onClick={() => submitReason(true)} style={ghostBtn}>
                Skip and continue to delete
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: the alternative ── */}
        {step === "offer" && offer && (
          <>
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 6 }}>
              One option before you do
            </div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "0 0 18px" }}>
              Based on what you said. If it isn&apos;t what you want, carry on and we&apos;ll delete everything.
            </p>
            {error && <p style={{ fontSize: 13, color: "var(--color-danger)", margin: "0 0 12px" }}>{error}</p>}
            <OfferCard
              offer={offer}
              onAccept={acceptOffer}
              onDecline={() => setStep("confirm")}
              declineLabel="No thanks, delete my account"
              busy={busy}
            />
          </>
        )}

        {/* ── Step 2b: they took the offer ── */}
        {step === "saved" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8 }}>
              Done.
            </div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              {savedAction === "email_weekly" && "You'll get one email a week from now on. Your account is untouched."}
              {savedAction === "email_pause_30" && "All emails are paused for 30 days. Your account is untouched."}
              {savedAction === "email_off_keep" && "Emails are off. Your account, XP and streak are exactly as they were."}
              {savedAction === "delete_budget" &&
                "Your imported statements, transactions and budgets are deleted. Your learning progress is still here."}
              {savedAction === "report_bug" &&
                "Thanks. Use Send Feedback in Settings to add anything else and we'll come back to you."}
            </p>
            <button type="button" className="btn btn-primary" onClick={close} style={{ width: "100%", marginBottom: 10 }}>
              Close
            </button>
            {/* Still leaving is still allowed, without starting over. */}
            <button type="button" onClick={() => setStep("confirm")} style={ghostBtn}>
              I still want to delete my account
            </button>
          </div>
        )}

        {/* ── Step 3: the point of no return ── */}
        {step === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <AlertTriangle size={40} style={{ color: "#E03C31", display: "block", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--color-text-primary)" }}>
              Delete All My Data?
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              This permanently deletes your account, XP, progress, and all personal data from Notho. This cannot be undone.
            </p>
            <button
              type="button"
              disabled={deleting}
              onClick={runDelete}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "#E03C31",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.6 : 1,
                marginBottom: 10,
              }}
            >
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </button>
            <button type="button" disabled={deleting} onClick={close} style={ghostBtn}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
