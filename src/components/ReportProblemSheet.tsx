"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, X } from "@/components/icons/NothoIcons";

export const SHAKE_PREF_KEY = "notho.shakeReport";

export function shakeReportEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(SHAKE_PREF_KEY) !== "off";
}

const TYPES = [
  { value: "other", label: "General feedback" },
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "lesson-content", label: "Lesson content issue" },
  { value: "account", label: "Account issue" },
];

type Attachment = { name: string; dataUrl: string };

async function captureScreen(): Promise<string | null> {
  try {
    const { toJpeg } = await import("html-to-image");
    const node = document.querySelector(".app-container") ?? document.body;
    if (!(node instanceof HTMLElement)) return null;
    return await toJpeg(node, {
      quality: 0.7,
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor: "#0a0a0a",
      filter: (el) => !(el instanceof HTMLElement && el.dataset.shakeSheet === "true"),
    });
  } catch {
    return null;
  }
}

export function ReportProblemSheet({
  open,
  onClose,
  screenshot,
}: {
  open: boolean;
  onClose: () => void;
  screenshot: string | null;
}) {
  const [issueType, setIssueType] = useState("other");
  const [description, setDescription] = useState("");
  const [wantReply, setWantReply] = useState(false);
  const [includeShot, setIncludeShot] = useState(true);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSent(false);
    setDescription("");
    setIssueType("other");
    setWantReply(false);
    setIncludeShot(true);
    setFiles([]);
  }, [open]);

  if (!open) return null;

  const canSubmit = description.trim().length > 0 && !sending;

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const next: Attachment[] = [];
    for (const file of Array.from(list).slice(0, 3)) {
      if (file.size > 1_500_000) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      next.push({ name: file.name, dataUrl });
    }
    setFiles((prev) => [...prev, ...next].slice(0, 3));
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      const feedbackId = crypto.randomUUID();
      const typeLabel = TYPES.find((t) => t.value === issueType)?.label ?? "General feedback";
      const subject = `${typeLabel} from shake`;
      await supabase.from("feedback").insert({
        id: feedbackId,
        user_id: user?.id ?? null,
        subject,
        description: description.trim(),
        issue_type: issueType,
      });
      const token = session?.access_token;
      await fetch("/api/feedback-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          description: [
            description.trim(),
            wantReply ? "Reply requested." : "No reply requested.",
            includeShot && screenshot ? "Screenshot included below." : "Screenshot not included.",
            files.length ? `Attachments: ${files.map((f) => f.name).join(", ")}` : "",
            `Page: ${window.location.pathname}`,
          ].filter(Boolean).join("\n"),
          issueType,
          userEmail: user?.email ?? null,
          feedbackId,
          screenshot: includeShot ? screenshot : null,
        }),
      });
      setSent(true);
    } catch {
      setSent(true);
    }
    setSending(false);
  };

  return (
    <div
      data-shake-sheet="true"
      style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Report a Problem"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#111214",
          color: "#f4f4f5",
          borderRadius: "22px 22px 0 0",
          padding: "14px 16px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button type="button" aria-label="Close" onClick={onClose} style={iconBtn}>
            <X size={18} />
          </button>
          <div style={{ flex: 1, textAlign: "center", fontWeight: 750, fontSize: 17 }}>Report a Problem</div>
          <button type="button" onClick={submit} disabled={!canSubmit} style={{ ...pill, opacity: canSubmit ? 1 : 0.45 }}>
            {sending ? "..." : "Submit"}
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "36px 12px" }}>
            <CheckCircle2 size={42} style={{ color: "#3DDC97", margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Sent</div>
            <p style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 18 }}>Thanks. We have the report from this screen.</p>
            <button type="button" onClick={onClose} style={{ ...pill, width: "100%" }}>Close</button>
          </div>
        ) : (
          <>
            <div style={card}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⌁</span>
                <div>
                  <div style={{ fontWeight: 750, fontSize: 15 }}>Shake to Report</div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.4, marginTop: 2 }}>
                    Shake your phone to report issues. You can turn it off in Settings.
                  </div>
                </div>
              </div>
            </div>

            <label style={{ ...card, display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={{ color: "#a1a1aa" }}>◌</span>
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)} style={selectStyle}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your issue..."
              rows={6}
              style={{ ...card, width: "100%", marginTop: 10, resize: "none", minHeight: 140, boxSizing: "border-box" }}
            />

            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ fontSize: 15 }}>Get a response from our support team</span>
              <Toggle on={wantReply} onClick={() => setWantReply((v) => !v)} />
            </div>

            <div style={{ marginTop: 16, color: "#a1a1aa", fontSize: 13 }}>Attachments</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => fileRef.current?.click()} style={addBtn} aria-label="Add attachment">+</button>
              {files.map((f) => (
                <div key={f.name} style={{ ...addBtn, fontSize: 11, padding: 8, overflow: "hidden" }}>{f.name}</div>
              ))}
              <input ref={fileRef} type="file" accept="image/*,.pdf" hidden multiple onChange={(e) => void addFiles(e.target.files)} />
            </div>

            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>⌖ Include screenshot</span>
              <Toggle on={includeShot} onClick={() => setIncludeShot((v) => !v)} active />
            </div>
            {includeShot && screenshot && (
              <img src={screenshot} alt="Screenshot of the screen you shook from" style={{ width: "100%", borderRadius: 16, marginTop: 10, border: "1px solid #2a2a2e" }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export async function takeReportScreenshot(): Promise<string | null> {
  return captureScreen();
}

export function ShakeReportSetting() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const read = () => setOn(shakeReportEnabled());
    read();
    window.addEventListener("notho:shake-pref", read);
    return () => window.removeEventListener("notho:shake-pref", read);
  }, []);
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Shake to report</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Shake the phone to open Report a Problem</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => {
          const next = !on;
          localStorage.setItem(SHAKE_PREF_KEY, next ? "on" : "off");
          setOn(next);
          window.dispatchEvent(new Event("notho:shake-pref"));
        }}
        style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: on ? "var(--color-primary)" : "var(--color-border)", position: "relative", cursor: "pointer", flexShrink: 0 }}
      >
        <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function Toggle({ on, onClick, active }: { on: boolean; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: on ? (active ? "#3DDC97" : "#3a3a3c") : "#3a3a3c", position: "relative", cursor: "pointer", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
    </button>
  );
}

const card: React.CSSProperties = {
  background: "#1c1c1e",
  border: "1px solid #2a2a2e",
  borderRadius: 16,
  padding: "14px 14px",
  color: "#f4f4f5",
  fontSize: 15,
};
const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 18, border: "none", background: "#2a2a2e", color: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
const pill: React.CSSProperties = {
  border: "none", background: "#2a2a2e", color: "#f4f4f5", borderRadius: 18, padding: "8px 14px", fontWeight: 700, cursor: "pointer",
};
const selectStyle: React.CSSProperties = {
  flex: 1, background: "transparent", color: "#f4f4f5", border: "none", fontSize: 15, outline: "none",
};
const addBtn: React.CSSProperties = {
  width: 84, height: 84, borderRadius: 16, border: "1px solid #2a2a2e", background: "#1c1c1e", color: "#f4f4f5", fontSize: 28, cursor: "pointer",
};
