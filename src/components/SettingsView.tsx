"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { UserData } from "@/app/pageViews.types";
import {
  ArrowLeft,
  Bell,
  Bug,
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  MessageSquare,
  Shield,
  Target,
  Trash2,
  Zap,
} from "@/components/icons/NothoIcons";
import { LegalPage, FeedbackModal } from "@/components/ProfileView";
import { ExitSurveyModal } from "@/components/churn/ExitSurvey";
import { isAdminEmail } from "@/lib/admin";

function SettingsAccountSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setName(data.user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    const updates: Record<string, unknown> = {};
    if (name.trim()) updates.data = { full_name: name.trim() };
    if (newPassword.trim().length >= 6) updates.password = newPassword.trim();
    if (Object.keys(updates).length === 0) { setSaving(false); setMsg("Nothing to update."); return; }
    const { error } = await supabase.auth.updateUser(updates as any);
    if (error) { setMsg(error.message); } else {
      setMsg("Saved!");
      if (name.trim()) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await supabase.from("profiles").upsert({ user_id: data.user.id, full_name: name.trim() }, { onConflict: "user_id" });
        }
      }
      setNewPassword("");
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border)",
    fontSize: 14, width: "100%", boxSizing: "border-box",
    background: "var(--color-bg)", color: "var(--color-text-primary)",
  };

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "var(--color-text-primary)" }}>Edit Details</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input type="text" placeholder="Full name" value={name}
          onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Email (cannot be changed here)" value={email}
          disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
        <div style={{ position: "relative" }}>
          <input type={showPw ? "text" : "password"} placeholder="New password (min 6 chars)"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 52 }} />
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 12 }}>
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        {msg && <p style={{ fontSize: 13, color: msg === "Saved!" ? "var(--color-primary)" : "var(--error-red)", margin: 0 }}>{msg}</p>}
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

import { ensurePushSubscription, disablePush } from "@/lib/push/subscribe";

export function SettingsView({
  userData,
  setDailyGoal,
  resetProgress,
  userSettings,
  onSignOut,
  onDeleteAccount,
  onDownloadData,
}: {
  userData: UserData;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;
  userSettings: ReturnType<typeof useUserSettings>;
  onSignOut?: () => void;
  onDeleteAccount?: (exitId?: string | null) => Promise<void>;
  onDownloadData?: () => void;
}) {
  const [showLegalPage, setShowLegalPage] = useState<"faq" | "privacy" | "terms" | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsAdmin(isAdminEmail(data.user?.email))).catch(() => {});
  }, []);

  // Read initial values from Supabase-backed settings (with localStorage fallback)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(userSettings.settings.soundEnabled);
  const [selectedGoal, setSelectedGoal] = useState<number>(userSettings.settings.dailyGoal);

  // Sync when remote settings load
  useEffect(() => {
    if (userSettings.loaded) {
      setSoundEnabled(userSettings.settings.soundEnabled);
      setSelectedGoal(userSettings.settings.dailyGoal);
    }
  }, [userSettings.loaded, userSettings.settings.soundEnabled, userSettings.settings.dailyGoal]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Check current push subscription status on mount
  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setPushEnabled(!!sub);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await disablePush();
        setPushEnabled(false);
      } else {
        const result = await ensurePushSubscription(true);
        setPushEnabled(result === "subscribed");
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    }
    setPushLoading(false);
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    // Persist to Supabase + localStorage via hook
    void userSettings.setSoundEnabled(next);
  };

  const handleGoal = (g: number) => {
    setSelectedGoal(g);
    setDailyGoal(g);
    // Persist to Supabase + localStorage via hook
    void userSettings.setDailyGoal(g);
  };

  const Row = ({ icon, label, sub, children }: { icon: React.ReactNode; label: string; sub?: string; children?: React.ReactNode }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "var(--color-primary)" }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  if (showLegalPage) {
    return <LegalPage page={showLegalPage} onBack={() => setShowLegalPage(null)} onFeedback={() => { setShowLegalPage(null); setFeedbackOpen(true); }} />;
  }

  return (
    <main >
      <h2 className="text-gray-900 dark:text-gray-100" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Settings</h2>

      {/* ── Learning ── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 8 }}>Learning</div>

      {/* Sound toggle */}
      <Row icon={<Zap size={18} />} label="Sound effects" sub="Plays on correct / incorrect answers">
        <button
          role="switch"
          aria-checked={soundEnabled}
          onClick={handleSoundToggle}
          style={{
            width: 48, height: 28, borderRadius: 14,
            background: soundEnabled ? "var(--color-primary)" : "var(--color-border)",
            border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: soundEnabled ? 23 : 3, width: 22, height: 22,
            borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }} />
        </button>
      </Row>

      {/* Push notifications toggle */}
      {"serviceWorker" in (typeof navigator !== "undefined" ? navigator : {}) && (
        <Row icon={<Bell size={18} />} label="Push notifications" sub="Daily lesson reminders & budget alerts">
          <button
            role="switch"
            aria-checked={pushEnabled}
            onClick={handlePushToggle}
            disabled={pushLoading}
            style={{
              width: 48, height: 28, borderRadius: 14,
              background: pushEnabled ? "var(--color-primary)" : "var(--color-border)",
              border: "none", cursor: pushLoading ? "wait" : "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
              opacity: pushLoading ? 0.6 : 1,
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: pushEnabled ? 23 : 3, width: 22, height: 22,
              borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }} />
          </button>
        </Row>
      )}

      {/* Dark mode now follows system preference automatically */}

      {/* Daily goal */}
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ color: "var(--color-primary)" }}><Target size={18} /></span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Daily XP Goal</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>How much XP you aim to earn per day</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[25, 50, 100, 200].map((g) => (
            <button
              key={g}
              onClick={() => handleGoal(g)}
              style={{
                padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid",
                borderColor: selectedGoal === g ? "var(--color-primary)" : "var(--color-border)",
                background: selectedGoal === g ? "var(--color-primary)" : "transparent",
                color: selectedGoal === g ? "white" : "var(--color-text-secondary)",
                transition: "all 0.15s",
              }}
            >{g} XP</button>
          ))}
        </div>
      </div>

      {/* ── Account ── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "20px 0 8px" }}>Account</div>
      <SettingsAccountSection />

      {/* ── Support ── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "20px 0 8px" }}>Support</div>
      <a href="https://wealthwithkwanele.co.za" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <Row icon={<Shield size={18} />} label="Help and consultations" sub="Book or enquire via the official site">
          <ArrowLeft size={16} style={{ transform: "rotate(180deg)", color: "var(--color-text-secondary)" }} />
        </Row>
      </a>

      {/* ── Admin (only visible to allowlisted team accounts) ── */}
      {isAdmin && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "20px 0 8px" }}>Admin</div>
          <a href="/admin/bugs" style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <Bug size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Bug console</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Triage reported &amp; auto-captured bugs · notify users when fixed</div>
                </div>
                <ChevronRight size={14} style={{ color: "var(--color-text-secondary)" }} />
              </div>
            </div>
          </a>
        </>
      )}

      {/* ── Help & Legal ── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "20px 0 8px" }}>Help &amp; Legal</div>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
        {[
          { label: "FAQ & Help", icon: <HelpCircle size={16} />, action: () => setShowLegalPage("faq") },
          { label: "Privacy Policy", icon: <Shield size={16} />, action: () => setShowLegalPage("privacy") },
          { label: "Terms of Service", icon: <FileText size={16} />, action: () => setShowLegalPage("terms") },
          { label: "Send Feedback", icon: <MessageSquare size={16} />, action: () => setFeedbackOpen(true) },
        ].map((item, i, arr) => (
          <button key={item.label} type="button" onClick={item.action}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none", cursor: "pointer", textAlign: "left" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{item.label}</span>
            <ChevronRight size={14} style={{ color: "var(--color-text-secondary)" }} />
          </button>
        ))}
      </div>

      {/* ── Account & Data ── */}
      {onDeleteAccount && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", margin: "20px 0 8px" }}>Account &amp; Data</div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
            {onDownloadData && (
              <button type="button" onClick={onDownloadData}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left" }}>
                <FileText size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Download My Data</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Export your progress as a JSON file (POPIA right to access)</div>
                </div>
              </button>
            )}
            <button type="button" onClick={() => setShowDeleteModal(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <Trash2 size={16} style={{ color: "var(--color-danger)", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-danger)" }}>Delete My Data</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Permanently removes all your account data</div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Sign out */}
      {onSignOut && (
        <button type="button" onClick={onSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer", padding: "8px 0", marginTop: 4, marginBottom: 32 }}>
          <LogOut size={18} />
          Sign Out
        </button>
      )}

      {/*
        Delete flow. The bare confirm dialog that used to live here is now the
        last of three steps inside ExitSurveyModal: ask why, offer the relevant
        alternative, then confirm. Skip is on the first step, so nobody is made
        to answer to get out.
      */}
      <ExitSurveyModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteAccount={async (exitId) => { if (onDeleteAccount) await onDeleteAccount(exitId); }}
        getAccessToken={async () => (await supabase.auth.getSession()).data.session?.access_token ?? null}
      />

      {/* Feedback modal */}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </main>
  );
}
