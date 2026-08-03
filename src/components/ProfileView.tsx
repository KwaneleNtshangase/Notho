"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { sastOffset } from "@/lib/dates";
import {
  COURSE_BADGES,
  getInvestorProfile,
  INVESTOR_PROFILE_STYLES,
  INVESTOR_QUIZ_QUESTIONS,
} from "@/data/gamificationExtras";
import type { Course, Unit, Lesson } from "@/data/content";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart2,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Flag,
  Flame,
  GraduationCap,
  Hash,
  Heart,
  HelpCircle,
  HomeIcon as HomeIconImported,
  Landmark,
  LogOut,
  MessageSquare,
  PenLine,
  Shield,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Wallet,
  X,
  Zap,
} from "@/components/icons/NothoIcons";
// Lucide's "Home" export is aliased below
import { Home as HomeIcon } from "@/components/icons/NothoIcons";
import {
  GOAL_OPTIONS,
  ONBOARDING_GOAL_OPTIONS,
  CalcInputs,
  calcGrowth,
  formatWithSpaces,
  formatRand,
  UserData,
} from "@/lib/viewHelpers";

// ─── Recommended Reading ──────────────────────────────────────────────────────

const RECOMMENDED_READING_BOOKS: {
  title: string;
  author: string;
  lesson: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}[] = [
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", lesson: "Assets vs liabilities. Buy assets that put money in your pocket, not liabilities.", color: "#EFB343", Icon: Wallet },
  { title: "The Richest Man in Babylon", author: "George S. Clason", lesson: "Pay yourself first. Save at least 10% of everything you earn, always.", color: "#007A85", Icon: Landmark },
  { title: "The Psychology of Money", author: "Morgan Housel", lesson: "Wealth is what you don't spend. Humility, patience and saving beats genius.", color: "#3B7DD8", Icon: Brain },
  { title: "The Millionaire Next Door", author: "Thomas J. Stanley", lesson: "Most millionaires live frugally in modest homes and drive ordinary cars.", color: "#7C4DFF", Icon: Hash },
  { title: "Think and Grow Rich", author: "Napoleon Hill", lesson: "A burning desire + a definite plan + persistent action builds lasting wealth.", color: "#E03C31", Icon: TrendingUp },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const NOTHO_FAQ = [
  {
    section: "Using Notho",
    items: [
      { q: "What is a streak?", a: "A streak counts how many days in a row you've completed at least one lesson. Streaks help build a daily learning habit - miss a day and your streak resets to zero." },
      { q: "How does the XP system work?", a: "You earn XP (experience points) by completing lessons, getting correct answers, and claiming daily challenges. XP increases your level and your position on the leaderboard." },
      { q: "What are Daily Challenges?", a: "Every day, three challenges appear on your home screen. Complete the required action first (e.g. finish a lesson, log an expense), then tap Claim to receive bonus XP. Challenges reset at midnight." },
      { q: "What are Leaderboards?", a: "Leaderboards rank all Notho users by XP. Your position updates in real time as you and others complete lessons. Use it to track your progress relative to other learners." },
    ],
  },
  {
    section: "Account & Data",
    items: [
      { q: "How do I change my name?", a: "Go to Profile, tap Edit Profile, update your first and last name, then tap Save." },
      { q: "How do I delete my account?", a: "Email us at privacy@notho.co.za with subject 'Account Deletion Request'. We'll process it within 7 working days and permanently delete all your data." },
      { q: "What data does Notho collect?", a: "We collect the email address you register with, your learning progress (lessons completed, XP, streaks), and anonymised budget data for benchmarking. See our Privacy Policy for full details." },
      { q: "Is my budget data shared?", a: "Budget data is aggregated and anonymised before being used for the community benchmarking feature. Individual entries are never shared with other users. We require at least 3 users in a category before showing any comparison." },
    ],
  },
  {
    section: "Still unsure?",
    items: [
      { q: "How do I contact support?", a: "Use the Send Feedback button at the bottom of your Profile. We'll get back to you within 2 business days." },
    ],
  },
];

function normalizeUsername(value: string): string {
  // Trim only - allow caps, spaces, symbols
  return value.trim();
}

function validateUsername(value: string): string | null {
  if (!value || !value.trim()) return "Username is required.";
  if (value.trim().length < 2) return "Username must be at least 2 characters.";
  if (value.length > 50) return "Username must be 50 characters or less.";
  // Disallow control characters only (null bytes, newlines, etc.)
  if (/[\x00-\x1F\x7F]/.test(value)) return "Username contains invalid characters.";
  return null;
}

async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;
  // SECURITY DEFINER RPC - avoids needing SELECT access to other users' profiles.
  const { data, error } = await supabase.rpc("username_taken", {
    p_username: normalized,
    p_exclude_user: excludeUserId ?? null,
  });
  if (error) return false;
  return data === false;
}

// ─── FeedbackModal ────────────────────────────────────────────────────────────

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      // Generate id client-side so we can pass it to the email route for logging
      const feedbackId = crypto.randomUUID();
      // 1. Save to Supabase for records
      await supabase.from("feedback").insert({
        id: feedbackId,
        user_id: user?.id ?? null,
        subject,
        description,
        issue_type: issueType,
      });
      // 2. Send email to support@notho.co.za via Resend
      const token = session?.access_token;
      await fetch("/api/feedback-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          description,
          issueType,
          userEmail: user?.email ?? null,
          feedbackId,
        }),
      });
      setSent(true);
    } catch { /* ignore - DB insert is the source of truth */ }
    setSending(false);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Send Feedback</div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
            <X size={22} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={48} style={{ color: "var(--color-primary)", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Thank you!</div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20 }}>Your feedback helps us improve Notho.</p>
            <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Subject *</label>
              <input
                required value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your feedback"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Description *</label>
              <textarea
                required value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue or suggestion in detail..."
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", resize: "none", boxSizing: "border-box" as const }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Type of feedback *</label>
              <select
                required value={issueType} onChange={(e) => setIssueType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: issueType ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
              >
                <option value="">Please select one...</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="lesson-content">Lesson content issue</option>
                <option value="account">Account issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={sending}>
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── LegalPage ────────────────────────────────────────────────────────────────

export function LegalPage({ page, onBack, onFeedback }: { page: "privacy" | "terms" | "faq"; onBack: () => void; onFeedback: () => void }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const titles = { privacy: "Privacy Policy", terms: "Terms of Service", faq: "FAQ & Help" };

  return (
    <main style={{ paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 20px" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-primary)", display: "flex" }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{titles[page]}</div>
      </div>

      {page === "faq" && (
        <div>
          {NOTHO_FAQ.map((section) => (
            <div key={section.section} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 10 }}>{section.section}</div>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
                {section.items.map((item, i) => {
                  const key = section.section + i;
                  const isOpen = openFaq === key;
                  return (
                    <div key={key} style={{ borderBottom: i < section.items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{item.q}</span>
                        <ChevronRight size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                      </button>
                      {isOpen && (
                        <div style={{ padding: "0 16px 14px", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{item.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 20, marginTop: 8, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Still unsure about something?</div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Our team is happy to help. Send us a message and we'll respond within 2 business days.</p>
            <button
              type="button"
              onClick={onFeedback}
              className="btn btn-primary"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", fontSize: 15, fontWeight: 700 }}
            >
              <MessageSquare size={18} />
              Send Feedback
            </button>
          </div>
        </div>
      )}

      {page === "privacy" && (
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)" }}>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 20 }}>Last revised: 5 April 2026</p>
          {[
            { title: "1. General", body: "Notho (\"we\", \"us\") cares about your personal information. This Privacy Policy explains how we collect, use, and protect it when you use the Notho app and related services. By using the service, you agree to the practices described here." },
            { title: "2. Information We Collect", body: "We collect: (a) your email address and display name when you register; (b) your learning progress including lessons completed, XP earned, and streaks; (c) budget entries you create - these are stored securely and only accessible to you; (d) anonymised, aggregated budget data for the community benchmarking feature; (e) app usage data such as which lessons you viewed and how long you spent." },
            { title: "3. How We Use Your Information", body: "We use your information to provide and improve the service, personalise your learning experience, display your progress on the leaderboard (which you can disable by not setting a public display name), detect and fix bugs, and send you progress-related reminders (which you can opt out of in your device notification settings)." },
            { title: "4. Sharing Your Information", body: "We do not sell your personal information. We may share it with trusted service providers (Supabase for database hosting, PostHog for anonymised analytics) who are contractually bound to protect it. Budget data is only used in aggregate form with a minimum of 3 users before any comparison is shown." },
            { title: "5. Your Rights", body: "You have the right to: access the personal data we hold about you; correct inaccurate information; request deletion of your account and associated data; object to certain processing; export your data. To exercise any of these rights, email privacy@notho.co.za." },
            { title: "6. Data Retention", body: "We retain your data for as long as your account is active. When you delete your account, we delete your personal data within 30 days, except where retention is required by law." },
            { title: "7. Children", body: "Notho is not directed at children under the age of 13. We do not knowingly collect data from children. If we become aware that a child has provided personal information, we will delete it promptly." },
            { title: "8. Cookies & Analytics", body: "We use analytics tools (PostHog) to understand how users engage with the app. Data collected is anonymised and used only to improve the product. We do not use third-party advertising cookies." },
            { title: "9. Contact", body: "For all privacy enquiries, contact our team at privacy@notho.co.za." },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{s.title}</div>
              <p style={{ color: "var(--color-text-secondary)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {page === "terms" && (
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)" }}>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 20 }}>Last revised: 5 April 2026</p>
          {[
            { title: "1. Acceptance of Terms", body: "By accessing or using Notho (\"Service\"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. We may update these terms and will notify you of material changes via the app." },
            { title: "2. Description of Service", body: "Notho is a financial literacy app that provides educational content, budgeting tools, and gamified learning experiences. It is designed for general financial education purposes only and does not constitute financial advice." },
            { title: "3. Not Financial Advice", body: "Nothing in the Notho app, including lessons, calculator results, or investment projections, constitutes personalised financial, investment, tax, or legal advice. Always consult a qualified financial advisor before making financial decisions." },
            { title: "4. Acceptable Use", body: "You may use the Service only for lawful purposes. You agree not to: share your account credentials; attempt to reverse-engineer or scrape the app; upload harmful or offensive content; impersonate other users or misrepresent your identity on the leaderboard." },
            { title: "5. Intellectual Property", body: "All content in the app - including lessons, graphics, and the Notho name and logo - is owned by or licensed to Notho. You may not reproduce, distribute, or create derivative works from any app content without our written permission." },
            { title: "6. User-Generated Content", body: "Any display names, profile information, or content you submit to the Service grants us a licence to display it within the app. You retain ownership of your content but are responsible for ensuring it does not violate these terms." },
            { title: "7. Account Termination", body: "We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or any other reason at our discretion. You may delete your account at any time by contacting privacy@notho.co.za." },
            { title: "8. Limitation of Liability", body: "To the fullest extent permitted by law, Notho and its team shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability for any claim shall not exceed any amount you have paid to us in the preceding 12 months." },
            { title: "9. Governing Law", body: "These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts." },
            { title: "10. Contact", body: "For any questions about these Terms, contact us at legal@notho.co.za." },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{s.title}</div>
              <p style={{ color: "var(--color-text-secondary)" }}>{s.body}</p>
            </div>
          ))}
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 20, marginTop: 16, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>Questions about these terms? We're happy to help.</p>
            <button type="button" className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={onFeedback}>
              <MessageSquare size={16} /> Contact Us
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

export function ProfileView({
  userData,
  onSignOut,
  onDeleteAccount,
  onDownloadData,
  currentUser,
  dailyGoal,
  setDailyGoal,
  courseBadgeIds,
  courses = [],
  completedLessons = new Set(),
  calcSaved: calcSavedProp = null,
  onClearCalcSaved,
  onGoToSettings,
  perfectLessons: perfectLessonsProp,
}: {
  userData: UserData;
  onSignOut: () => void;
  onDeleteAccount?: () => Promise<void>;
  onDownloadData?: () => Promise<void>;
  currentUser: any;
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
  courseBadgeIds: string[];
  courses?: Course[];
  completedLessons?: Set<string>;
  /** Saved calculator projection from Supabase (cross-device) */
  calcSaved?: CalcInputs | null;
  /** Callback to clear saved projection in Supabase */
  onClearCalcSaved?: () => void;
  /** Navigate to the Settings page */
  onGoToSettings?: () => void;
  /** Server-backed lifetime perfect-lesson count (cross-device) */
  perfectLessons?: number;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<null | {
    name: string; desc: string; icon: React.ReactNode;
  }>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editAge, setEditAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [investorQuizOpen, setInvestorQuizOpen] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScores, setQuizScores] = useState<number[]>([]);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [investorProfileLabel, setInvestorProfileLabel] = useState<string | null>(null);
  const [profileGoal, setProfileGoal] = useState<string | null>(null);
  const [profileGoalDescription, setProfileGoalDescription] = useState<string>("");
  const [savedProjection, setSavedProjection] = useState<CalcInputs | null>(null);
  const [projectionFinalValue, setProjectionFinalValue] = useState<number | null>(null);
  const [showProfileGoalEdit, setShowProfileGoalEdit] = useState(false);
  const [profileGoalEditId, setProfileGoalEditId] = useState<string>("");
  const [profileGoalEditDesc, setProfileGoalEditDesc] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfileGoal(localStorage.getItem("notho-user-goal"));
    setProfileGoalDescription(localStorage.getItem("notho-goal-description") ?? "");
    // Prefer Supabase-backed calcSaved prop; fall back to localStorage cache
    const calcSource = calcSavedProp ?? (() => {
      try {
        const raw = localStorage.getItem("notho-calc-saved");
        return raw ? JSON.parse(raw) as CalcInputs : null;
      } catch { return null; }
    })();
    if (calcSource) {
      setSavedProjection(calcSource);
      const growth = calcGrowth(calcSource);
      if (growth.length > 0) setProjectionFinalValue(growth[growth.length - 1].value);
    }
  }, [calcSavedProp]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      setProfileEmail(user.email ?? "");
      const meta = user.user_metadata;
      const fullName = meta?.full_name ?? "";
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, age, investor_profile, username")
        .eq("user_id", user.id)
        .maybeSingle();
      const row = prof as { full_name?: string; age?: number | null; investor_profile?: string | null; username?: string | null } | null;
      if (row?.age != null) setEditAge(String(row.age));
      if (row?.investor_profile) {
        setInvestorProfileLabel(row.investor_profile);
        // Write-back to localStorage so a new device doesn't flash "Take quiz"
        // while the Supabase fetch is in-flight on the next visit.
        try {
          const existing = JSON.parse(localStorage.getItem("notho-investor-profile") ?? "{}");
          localStorage.setItem(
            "notho-investor-profile",
            JSON.stringify({ ...existing, profile: row.investor_profile })
          );
        } catch { /* ignore */ }
      }
      if (row?.username) setEditUsername(String(row.username));
      const nameFromProfile = row?.full_name?.trim();
      const display = nameFromProfile || fullName;
      const isMissing =
        !display ||
        display.includes("@") ||
        display === user.email?.split("@")[0];
      if (!isMissing) {
        setProfileName(display);
        const parts = display.split(" ");
        setEditFirstName(parts[0] ?? "");
        setEditLastName(parts.slice(1).join(" ") ?? "");
      } else {
        setNeedsProfileUpdate(true);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("notho-investor-profile");
      if (raw) {
        const j = JSON.parse(raw) as { profile?: string };
        if (j.profile) setInvestorProfileLabel(j.profile);
      }
    } catch { /* ignore */ }
  }, []);

  const showQuizResult = investorQuizOpen && quizIdx >= INVESTOR_QUIZ_QUESTIONS.length;
  useEffect(() => {
    if (showQuizResult) analytics.advisorCtaShown("investor_quiz");
  }, [showQuizResult]);

  const handleSaveProfile = async () => {
    const firstName = editFirstName.trim();
    const lastName = editLastName.trim();
    const username = normalizeUsername(editUsername);
    const ageTrim = editAge.trim();
    const ageNum = ageTrim === "" ? null : parseInt(ageTrim, 10);
    if (!firstName) { setSaveError("Please enter your first name."); return; }
    if (!lastName) { setSaveError("Please enter your last name."); return; }
    const usernameFormatError = validateUsername(username);
    if (usernameFormatError) { setSaveError(usernameFormatError); return; }
    if (ageTrim !== "" && (ageNum === null || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120)) {
      setSaveError("Please enter a valid age (13-120) or leave blank.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const fullName = firstName + " " + lastName;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not signed in");
      const available = await isUsernameAvailable(username, user.id);
      if (!available) throw new Error("That username is already taken.");
      const metaPayload: Record<string, unknown> = { full_name: fullName };
      if (ageNum != null) metaPayload.age = ageNum;
      const { error: updateError } = await supabase.auth.updateUser({ data: metaPayload });
      if (updateError) throw updateError;
      await supabase.from("profiles").upsert({ user_id: user.id, full_name: fullName, age: ageNum, username }, { onConflict: "user_id" });
      await supabase.from("user_progress").upsert({ user_id: user.id, display_name: username }, { onConflict: "user_id" });
      setProfileName(fullName);
      setEditUsername(username);
      setNeedsProfileUpdate(false);
      setEditingProfile(false);
      setSaveToast("Profile saved.");
      setTimeout(() => setSaveToast(null), 2500);
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profileName || "Learner";
  const initials = displayName
    .split(" ").map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "FL";

  const tc = userData.totalCompleted;
  const str = userData.streak;
  const xpv = userData.xp;
  // Server-backed count (survives new devices / cache clears / app updates).
  // Legacy localStorage fallback covers the brief window before adoption.
  const perfectLessons =
    perfectLessonsProp ??
    (typeof window !== "undefined"
      ? parseInt(localStorage.getItem("notho-perfect-lessons") ?? "0", 10)
      : 0);

  const BADGE_DEFS = [
    { id: "lesson-1-badge",   name: "First Step",        desc: "Completed your first lesson",      icon: <CheckCircle2 size={22} className="text-current" />, earned: tc >= 1 },
    { id: "lesson-5-badge",   name: "Getting Going",     desc: "Completed 5 lessons",              icon: <BookOpen size={22} className="text-current" />,    earned: tc >= 5 },
    { id: "lesson-10-badge",  name: "On a Roll",         desc: "Completed 10 lessons",             icon: <TrendingUp size={22} className="text-current" />,  earned: tc >= 10 },
    { id: "lesson-25-badge",  name: "Dedicated",         desc: "Completed 25 lessons",             icon: <Target size={22} className="text-current" />,      earned: tc >= 25 },
    { id: "lesson-50-badge",  name: "Half Century",      desc: "Completed 50 lessons",             icon: <Trophy size={22} className="text-current" />,      earned: tc >= 50 },
    { id: "lesson-100-badge", name: "Centurion",         desc: "Completed 100 lessons",            icon: <Trophy size={22} className="text-current" />,      earned: tc >= 100 },
    { id: "streak-3-badge",   name: "3 Day Streak",      desc: "Learned 3 days in a row",          icon: <Flame size={22} className="text-current" />,       earned: str >= 3 },
    { id: "streak-7-badge",   name: "Week Warrior",      desc: "7-day learning streak",            icon: <Flame size={22} className="text-current" />,       earned: str >= 7 },
    { id: "streak-14-badge",  name: "Two Weeks Strong",  desc: "14-day learning streak",           icon: <Zap size={22} className="text-current" />,         earned: str >= 14 },
    { id: "streak-30-badge",  name: "Monthly Habit",     desc: "30-day learning streak",           icon: <Zap size={22} className="text-current" />,         earned: str >= 30 },
    { id: "streak-60-badge",  name: "Unstoppable",       desc: "60-day learning streak",           icon: <Trophy size={22} className="text-current" />,      earned: str >= 60 },
    { id: "streak-100-badge", name: "Legendary",         desc: "100-day learning streak",          icon: <Trophy size={22} className="text-current" />,      earned: str >= 100 },
    { id: "xp-100-badge",     name: "First 100",         desc: "Earned 100 XP",                    icon: <Zap size={22} className="text-current" />,         earned: xpv >= 100 },
    { id: "xp-500-badge",     name: "XP Builder",        desc: "Earned 500 XP",                    icon: <Zap size={22} className="text-current" />,         earned: xpv >= 500 },
    { id: "xp-1000-badge",    name: "Knowledge Is Power", desc: "Earned 1 000 XP",                icon: <Brain size={22} className="text-current" />,       earned: xpv >= 1000 },
    { id: "xp-5000-badge",    name: "Finance Pro",       desc: "Earned 5 000 XP",                  icon: <Wallet size={22} className="text-current" />,      earned: xpv >= 5000 },
    { id: "perfect-1-badge",  name: "Flawless",          desc: "Got a perfect score on a lesson",  icon: <CheckCircle2 size={22} className="text-current" />, earned: perfectLessons >= 1 },
    { id: "perfect-5-badge",  name: "Sharp Mind",        desc: "5 perfect lesson scores",          icon: <Brain size={22} className="text-current" />,       earned: perfectLessons >= 5 },
    { id: "perfect-10-badge", name: "Untouchable",       desc: "10 perfect lesson scores",         icon: <Trophy size={22} className="text-current" />,      earned: perfectLessons >= 10 },
  ];

  const earnedProgressBadges = BADGE_DEFS.filter((b) => b.earned);
  const earnedCourseBadgeItems = courseBadgeIds
    .map((bid) => Object.values(COURSE_BADGES).find((b) => b.id === bid))
    .filter((b): b is (typeof COURSE_BADGES)[string] => Boolean(b))
    .map((b) => ({
      id: b.id,
      name: b.name,
      desc: b.description,
      icon: <Trophy size={22} style={{ color: b.color }} aria-hidden />,
    }));
  const earnedBadges = [...earnedProgressBadges, ...earnedCourseBadgeItems];

  const [showMore, setShowMore] = React.useState(false);
  const [showAllBadges, setShowAllBadges] = React.useState(false);
  const [showLegalPage, setShowLegalPage] = React.useState<null | "privacy" | "terms" | "faq">(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  if (showLegalPage) {
    return <LegalPage page={showLegalPage} onBack={() => setShowLegalPage(null)} onFeedback={() => { setShowLegalPage(null); setFeedbackOpen(true); }} />;
  }

  return (
    <main >
      {/* Page header with gear icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>Profile</h2>
        {onGoToSettings && (
          <button
            type="button"
            onClick={onGoToSettings}
            aria-label="Settings"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: 12,
              background: "var(--color-surface)", border: "1px solid var(--color-border)",
              cursor: "pointer", color: "var(--color-text-secondary)",
              transition: "background 0.15s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 16px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", marginBottom: 12,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 900, color: "white",
          boxShadow: "0 4px 16px rgba(0,122,133,0.25)",
        }}>{initials}</div>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>{displayName.split(" ")[0]}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Financial Learner · Level {userData.level}</div>
        {profileEmail && (
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>{profileEmail}</div>
        )}
        {investorProfileLabel && (() => {
          const st = INVESTOR_PROFILE_STYLES[investorProfileLabel] ?? INVESTOR_PROFILE_STYLES["Moderate"];
          return (
            <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${st.bg} ${st.darkBg} ${st.color}`}>
              <Award size={16} className="shrink-0" aria-hidden />
              <span>{investorProfileLabel} Investor</span>
            </div>
          );
        })()}
      </div>

      {/* My Goal card */}
      {profileGoal && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14 }}>
              <Target size={16} style={{ color: "var(--color-primary)" }} aria-hidden />
              My Goal
            </div>
            <button
              onClick={() => { setProfileGoalEditId(profileGoal ?? ""); setProfileGoalEditDesc(profileGoalDescription ?? ""); setShowProfileGoalEdit(true); }}
              style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--color-primary)" }}
            >Edit</button>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: profileGoalDescription ? 4 : 0 }}>
            {GOAL_OPTIONS.find((g) => g.id === profileGoal)?.label ?? profileGoal}
          </p>
          {profileGoalDescription && (
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{profileGoalDescription}</p>
          )}
          {!profileGoalDescription && (
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>Tap Edit to describe your goal in more detail.</p>
          )}
        </div>
      )}

      {/* Profile goal edit modal */}
      {showProfileGoalEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Edit My Goal</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {ONBOARDING_GOAL_OPTIONS.map((g) => {
                const sel = profileGoalEditId === g.id;
                return (
                  <button key={g.id} onClick={() => setProfileGoalEditId(g.id)} style={{
                    padding: "12px 10px", borderRadius: 12, border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: sel ? "var(--color-primary-light, #E6F4EF)" : "var(--color-surface)",
                    color: sel ? "var(--color-primary)" : "var(--color-text-primary)",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <g.Icon size={16} />
                    {g.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={profileGoalEditDesc}
              onChange={(e) => setProfileGoalEditDesc(e.target.value)}
              placeholder={profileGoalEditId === "other" ? "Describe your goal (required)..." : "Add detail about your goal (optional)..."}
              rows={3}
              style={{ width: "100%", borderRadius: 10, border: "1.5px solid var(--color-border)", padding: "10px 12px", fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", resize: "none", boxSizing: "border-box", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowProfileGoalEdit(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-primary)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button
                disabled={!profileGoalEditId || (profileGoalEditId === "other" && !profileGoalEditDesc.trim())}
                onClick={async () => {
                  const desc = profileGoalEditDesc.trim();
                  localStorage.setItem("notho-user-goal", profileGoalEditId);
                  if (desc) localStorage.setItem("notho-goal-description", desc);
                  else localStorage.removeItem("notho-goal-description");
                  setProfileGoal(profileGoalEditId);
                  setProfileGoalDescription(desc);
                  setShowProfileGoalEdit(false);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from("profiles").upsert({ user_id: user.id, goal: profileGoalEditId, goal_description: desc || null }, { onConflict: "user_id" });
                  }
                }}
                style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "var(--color-primary)", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: (!profileGoalEditId || (profileGoalEditId === "other" && !profileGoalEditDesc.trim())) ? 0.5 : 1 }}
              >Save Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Savings Projection card */}
      {savedProjection && projectionFinalValue !== null && (
        <div style={{ background: "linear-gradient(135deg, rgba(0,122,133,0.07) 0%, rgba(239,179,67,0.05) 100%)", border: "1px solid rgba(0,122,133,0.2)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
            <TrendingUp size={16} style={{ color: "var(--color-primary)" }} aria-hidden />
            My Savings Projection
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            {savedProjection.frequency === "once-off"
              ? `R${formatWithSpaces(savedProjection.principal)} once-off`
              : `R${formatWithSpaces(savedProjection.monthly)}/month`}
            {" · "}{savedProjection.rate}% return{" · "}{savedProjection.years} years
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: "var(--color-surface)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border)", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Projected Value</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--color-primary)" }}>{formatRand(projectionFinalValue)}</div>
            </div>
            <div style={{ flex: 1, background: "var(--color-surface)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border)", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Time Horizon</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--color-text-primary)" }}>{savedProjection.years} yrs</div>
            </div>
          </div>
          <button type="button" onClick={() => { localStorage.removeItem("notho-calc-saved"); setSavedProjection(null); setProjectionFinalValue(null); onClearCalcSaved?.(); }}
            style={{ marginTop: 12, width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid rgba(220,38,38,0.35)", background: "rgba(220,38,38,0.06)", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Trash2 size={14} /> Remove Projection
          </button>
        </div>
      )}

      {needsProfileUpdate && !editingProfile && (
        <div style={{ background: "var(--color-primary-light, #E8F5EE)", border: "1.5px solid var(--color-primary)", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "var(--color-primary)" }}>Complete your profile</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>Add your name so we can personalise your experience and show you on the leaderboard.</div>
          <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setEditingProfile(true); if (!editFirstName && profileName) { const parts = profileName.split(" "); setEditFirstName(parts[0] ?? ""); setEditLastName(parts.slice(1).join(" ") ?? ""); } }}>Add details</button>
        </div>
      )}

      {/* Stat row */}
      <div style={{ display: "flex", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, marginBottom: 16, overflow: "hidden" }}>
        {[
          { label: "XP", value: formatWithSpaces(userData.xp), color: "var(--color-primary)" },
          { label: "Level", value: userData.level, color: "var(--color-text-primary)" },
          { label: "Streak", value: userData.streak, color: "#EFB343" },
          { label: "Lessons", value: userData.totalCompleted, color: "var(--color-text-primary)" },
        ].map((stat, i, arr) => (
          <div key={stat.label} style={{ flex: 1, textAlign: "center", padding: "14px 8px", borderRight: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {saveToast && (
        <div style={{ background: "rgba(0,122,133,0.12)", border: "1px solid var(--color-primary)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>{saveToast}</div>
      )}

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-secondary" onClick={() => { setEditingProfile(true); const parts = profileName.split(" "); setEditFirstName(parts[0] ?? ""); setEditLastName(parts.slice(1).join(" ") ?? ""); }}>
          Edit Profile
        </button>
      </div>

      {editingProfile && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Profile details</div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Account email</label>
            <input
              type="email"
              value={profileEmail}
              readOnly
              aria-readonly="true"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 13,
                background: "var(--color-bg)",
                color: "var(--color-text-secondary)",
                opacity: 0.85,
                boxSizing: "border-box" as const,
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 8 }}>
            <input type="text" placeholder="First name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, boxSizing: "border-box" }} />
            <input type="text" placeholder="Last name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Username (leaderboard name)</label>
            <input
              type="text"
              autoCorrect="off"
              spellCheck={false}
              placeholder="e.g. FirstName_2026"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, boxSizing: "border-box" as const }}
            />
          </div>
          <input type="number" placeholder="Age (optional)" value={editAge} min={13} max={120} onChange={(e) => setEditAge(e.target.value.replace(/\D/g, ""))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" as const }} />
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Daily XP goal</label>
            <select value={dailyGoal} onChange={(e) => { const v = parseInt(e.target.value, 10); setDailyGoal(v); }}
              style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }}>
              {[25, 50, 100, 150, 200].map((g) => (<option key={g} value={g}>{g} XP / day</option>))}
            </select>
          </div>
          {saveError && <p style={{ color: "var(--error-red)", fontSize: 12 }}>{saveError}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} onClick={handleSaveProfile}>{saving ? "Saving..." : "Save"}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingProfile(false); setSaveError(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Investor Profile card */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <div style={{ fontWeight: 800 }}>Investor Profile</div>
          {investorProfileLabel && (() => {
            const st = INVESTOR_PROFILE_STYLES[investorProfileLabel] ?? INVESTOR_PROFILE_STYLES["Moderate"];
            return (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.darkBg} ${st.color}`}>
                <Award size={14} className="shrink-0" aria-hidden />
                {investorProfileLabel}
              </span>
            );
          })()}
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10 }}>
          {investorProfileLabel ? `Your style: ${investorProfileLabel}` : "Take a 10-question quiz to see how you think about risk and investing."}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => { setInvestorQuizOpen(true); setQuizIdx(0); setQuizScores([]); setQuizSelected(null); }}>
          {investorProfileLabel ? "Retake Quiz" : "Take Quiz"}
        </button>
      </div>

      {/* Investor quiz modal */}
      {investorQuizOpen && (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            {quizIdx >= INVESTOR_QUIZ_QUESTIONS.length ? (() => {
              const total = quizScores.reduce((a, b) => a + b, 0);
              const res = getInvestorProfile(total);
              return (
                <div>
                  <div className="flex justify-center mb-2"><Award size={56} style={{ color: res.color }} aria-hidden /></div>
                  <h2 className="text-xl font-black text-center text-gray-900 dark:text-white">{res.profile} Investor</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{res.description}</p>
                  <p className="text-xs font-semibold mt-3 text-gray-700 dark:text-gray-200">{res.allocation}</p>
                  <ul className="text-sm mt-2 list-disc pl-5 text-gray-700 dark:text-gray-200">
                    {res.products.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <div className="flex flex-col gap-2 mt-6">
                    <button type="button" className="btn btn-primary w-full" onClick={async () => {
                      analytics.investorQuizCompleted(res.profile, total);
                      const payload = { profile: res.profile, total, savedAt: Date.now() };
                      localStorage.setItem("notho-investor-profile", JSON.stringify(payload));
                      setInvestorProfileLabel(res.profile);
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from("profiles").upsert({ user_id: user.id, investor_profile: res.profile } as Record<string, unknown>, { onConflict: "user_id" });
                      }
                      setInvestorQuizOpen(false);
                      setSaveToast("Investor profile saved.");
                      setTimeout(() => setSaveToast(null), 2500);
                    }}>Save to Profile</button>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => { setQuizIdx(0); setQuizScores([]); setQuizSelected(null); }}>Retake Quiz</button>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setInvestorQuizOpen(false)}>Close</button>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-200 mb-1">Built for your profile</p>
                    <p className="text-green-100 text-sm mb-4 leading-relaxed">As a {res.profile} investor, here&apos;s what a portfolio could look like for you.</p>
                    <button type="button" onClick={() => { analytics.advisorCtaClicked("investor_quiz"); window.open("https://wealthwithkwanele.co.za", "_blank", "noopener,noreferrer"); }}
                      className="block w-full py-3 bg-white text-green-800 rounded-xl font-bold text-center hover:bg-green-50 transition-colors">
                      Get Your {res.profile} Investment Plan
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Question {quizIdx + 1} of {INVESTOR_QUIZ_QUESTIONS.length}</div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                  <div className="h-2 bg-green-600 rounded-full transition-all" style={{ width: `${((quizIdx + 1) / INVESTOR_QUIZ_QUESTIONS.length) * 100}%` }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{INVESTOR_QUIZ_QUESTIONS[quizIdx].question}</h3>
                <div className="flex flex-col gap-2">
                  {INVESTOR_QUIZ_QUESTIONS[quizIdx].options.map((opt, oi) => (
                    <button key={oi} type="button"
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-colors text-gray-900 dark:text-gray-100 ${quizSelected === oi ? "border-green-600 bg-green-50 dark:bg-green-900/30 dark:border-green-500" : "border-gray-200 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-500"}`}
                      onClick={() => setQuizSelected(oi)}>{opt.text}</button>
                  ))}
                </div>
                <button type="button" className="btn btn-primary w-full mt-4" disabled={quizSelected === null} onClick={() => {
                  const oi = quizSelected;
                  if (oi === null) return;
                  const opt = INVESTOR_QUIZ_QUESTIONS[quizIdx].options[oi];
                  setQuizScores((prev) => [...prev, opt.score]);
                  setQuizIdx((i) => i + 1);
                  setQuizSelected(null);
                }}>Next</button>
                <button type="button" className="mt-3 w-full text-sm text-gray-500 dark:text-gray-400" onClick={() => setInvestorQuizOpen(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advisor CTA */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 to-green-900 p-5 text-white">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-green-100/90">Available</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-green-100">Turn what you&apos;ve learned into a real plan. Book a free session to map out your money goals.</p>
        <button type="button" onClick={() => { analytics.advisorCtaClicked("profile_cta"); window.open("https://wealthwithkwanele.co.za", "_blank", "noopener,noreferrer"); }}
          className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-green-800 transition-colors hover:bg-green-50">
          Get Your Free Money Plan
        </button>
      </div>

      {/* Earned badges */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Trophy size={18} style={{ color: "var(--color-primary)" }} aria-hidden />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>Your Badges</span>
        </div>
        {earnedBadges.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, textAlign: "center", padding: "16px 0" }}>Complete lessons to earn your first badge!</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {(showAllBadges ? earnedBadges : earnedBadges.slice(-3).reverse()).map((badge) => (
                <button key={badge.id} onClick={() => setSelectedBadge({ name: badge.name, desc: badge.desc, icon: badge.icon })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: 14, padding: "14px 8px", cursor: "pointer", transition: "transform 0.15s", color: "var(--color-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  <span style={{ color: "var(--color-primary)" }}>{badge.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: "var(--color-text-primary)" }}>{badge.name}</span>
                </button>
              ))}
            </div>
            {earnedBadges.length > 3 && (
              <button type="button" onClick={() => setShowAllBadges((v) => !v)}
                style={{ marginTop: 10, width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {showAllBadges ? "Show less" : `View all ${earnedBadges.length} badges`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Weekly XP Chart */}
      {(() => {
        const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
        // Recharts SVG does not resolve CSS variables - use explicit hex colours
        const primaryColor = isDark ? "#20D3CF" : "#007A85";
        const pastColor = isDark ? "#2A4749" : "#C6E4E8";
        const axisColor = isDark ? "#8B949E" : "#6B7280";
        const tooltipBg = isDark ? "#161B22" : "#ffffff";
        const tooltipBorder = isDark ? "#30363D" : "#D1E7EA";
        const tooltipText = isDark ? "#ffffff" : "#111827";

        // Build Mon–Sun week using SAST dates so keys match stored XP
        const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
        const todaySAST = new Date(Date.now() + SAST_OFFSET_MS);
        const dayOfWeek = todaySAST.getUTCDay(); // 0=Sun in SAST-shifted time
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weekData = weekDays.map((name, i) => {
          const targetDay = i + 1 === 7 ? 0 : i + 1;
          const diff = targetDay - dayOfWeek;
          const shifted = new Date(todaySAST.getTime() + diff * 86_400_000);
          const y = shifted.getUTCFullYear();
          const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
          const d = String(shifted.getUTCDate()).padStart(2, "0");
          const sastIso = `${y}-${m}-${d}`;
          const xp = typeof window !== "undefined" ? parseInt(localStorage.getItem(`notho-daily-xp-${sastIso}`) ?? "0", 10) : 0;
          const isFuture = diff > 0;
          return { name, xp, isToday: diff === 0, isFuture };
        });

        const weekTotal = weekData.reduce((s, d) => s + d.xp, 0);
        const maxXp = Math.max(...weekData.map((d) => d.xp), 50); // min scale of 50 so empty week looks right

        return (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart2 size={18} style={{ color: primaryColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>This Week&apos;s XP</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: primaryColor }}>{weekTotal} XP</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="25%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, maxXp]}
                  tickCount={4}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
                  formatter={(value: any) => [`${value} XP`, ""]}
                  contentStyle={{ borderRadius: 10, fontSize: 12, border: `1px solid ${tooltipBorder}`, background: tooltipBg, color: tooltipText, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  labelStyle={{ color: tooltipText, fontWeight: 700, marginBottom: 2 }}
                  itemStyle={{ color: primaryColor, fontWeight: 700 }}
                />
                <Bar dataKey="xp" radius={[6, 6, 2, 2]} maxBarSize={40}>
                  {weekData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isFuture ? (isDark ? "#1e2d27" : "#e8f4ef") : entry.isToday ? primaryColor : pastColor}
                      opacity={entry.isFuture ? 0.5 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Personal Bests */}
      {(() => {
        // Server-backed (longest_streak, raised via GREATEST in sync-streak).
        // The old device-local merge leaked the previous account's best on
        // shared devices — the DB value is the single source of truth now.
        const longestStreak = Math.max(userData.longestStreak ?? 0, userData.streak);
        let bestDayXP = 0;
        if (typeof window !== "undefined") {
          for (let i = 0; i < 365; i++) {
            const key = `notho-daily-xp-${sastOffset(-i)}`;
            const v = parseInt(localStorage.getItem(key) ?? "0", 10);
            if (v > bestDayXP) bestDayXP = v;
          }
        }
        return (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Award size={18} style={{ color: "#EFB343" }} />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>Personal Bests</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Longest Streak", value: `${longestStreak}d`, icon: <Flame size={20} style={{ color: "#EFB343" }} /> },
                { label: "Best Day XP", value: `${formatWithSpaces(bestDayXP)}`, icon: <Zap size={20} style={{ color: "var(--color-primary)" }} /> },
                { label: "Total Lessons", value: String(userData.totalCompleted), icon: <BookOpen size={20} style={{ color: "var(--color-primary)" }} /> },
              ].map((pb) => (
                <div key={pb.label} style={{ textAlign: "center", padding: "12px 6px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                  <div style={{ marginBottom: 6 }}>{pb.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-text-primary)" }}>{pb.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", marginTop: 2 }}>{pb.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* More (collapsible) */}
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowMore((v) => !v)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>More</span>
          <ChevronRight size={18} style={{ color: "var(--color-text-secondary)", transform: showMore ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        {showMore && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {courses.length > 0 && (
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>Topic Mastery</span>
                </div>
                {courses.map((course) => {
                  const totalLessons = course.units.reduce((s: number, u: Unit) => s + u.lessons.length, 0);
                  const completedCount = course.units.reduce(
                    (s: number, u: Unit) => s + u.lessons.filter((l: Lesson) => completedLessons.has(`${course.id}:${l.id}`)).length, 0
                  );
                  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
                  return (
                    <div key={course.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{course.title}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: pct === 100 ? "#007A85" : "var(--color-text-secondary)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 4, background: "var(--color-border)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: pct === 100 ? "#007A85" : "var(--color-primary)", width: `${pct}%`, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{completedCount}/{totalLessons} lessons</div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>Recommended Reading</span>
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {RECOMMENDED_READING_BOOKS.map((book) => {
                  const BookIcon = book.Icon;
                  return (
                    <div key={book.title} style={{ minWidth: 170, background: "var(--color-bg)", border: `1.5px solid ${book.color}40`, borderRadius: 14, padding: "12px 12px 10px", flexShrink: 0, borderTop: `4px solid ${book.color}` }}>
                      <div style={{ marginBottom: 6, color: book.color }}><BookIcon size={24} /></div>
                      <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 2, color: "var(--color-text-primary)" }}>{book.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>{book.author}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{book.lesson}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <a href="https://www.wealthwithkwanele.co.za/#resources" target="_blank" rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", boxSizing: "border-box" as const }}>
              <ExternalLink size={16} aria-hidden />
              Free Financial Guides
            </a>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div onClick={() => !deleting && setShowDeleteModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--color-surface)", borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, textAlign: "center" }}>
            <AlertTriangle size={40} style={{ color: "#E03C31", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--color-text-primary)" }}>Delete All My Data?</div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              This permanently deletes your account, XP, progress, and all personal data from Notho. This cannot be undone.
            </p>
            <button type="button" disabled={deleting} onClick={async () => { setDeleting(true); try { if (onDeleteAccount) await onDeleteAccount(); } finally { setDeleting(false); } }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#E03C31", color: "#fff", fontWeight: 700, fontSize: 15, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1, marginBottom: 10 }}>
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </button>
            <button type="button" disabled={deleting} onClick={() => setShowDeleteModal(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-primary)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Badge detail modal */}
      {selectedBadge && (
        <div onClick={() => setSelectedBadge(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--color-surface)", borderRadius: "20px 20px 14px 14px", padding: "28px 24px 24px", width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ color: "var(--color-primary)", marginBottom: 8, display: "flex", justifyContent: "center" }}>{selectedBadge.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: "var(--color-text-primary)" }}>{selectedBadge.name}</div>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 16, fontSize: 14 }}>{selectedBadge.desc}</p>
            <button className="btn btn-primary" onClick={() => setSelectedBadge(null)}>Got it</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfileView;
