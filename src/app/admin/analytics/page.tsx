"use client";

/**
 * /admin/analytics - Notho Desk.
 *
 * Live by design: every panel re-queries Postgres on load, on the refresh
 * cadence below, and whenever the tab regains focus. Nothing here is a stale
 * nightly export.
 *
 * Access: the API route is the real gate (it checks profiles.is_admin against a
 * service-role client, and the RPCs themselves are revoked from authenticated).
 * The check on this page is a courtesy so a non-admin sees one clear message
 * instead of seven broken panels.
 *
 * Sign-in happens here. Do not send operators through the learner AuthGate.
 *
 * The tab order is deliberate. Pulse first because it answers "what should I do
 * today"; the rest are the evidence, arranged in the order a product question
 * usually travels - are people arriving, do they engage, do they come back, is
 * the content right, why do they leave, and finally who exactly are they.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { fetchView } from "./lib";
import { ThemeProvider, useTheme } from "./theme";
import { Btn, Card, ErrorNote, Segmented, Skeleton } from "./ui";
import { PulsePanel } from "./pulseDesk";
import { GrowthPanel } from "./panelsGrowth";
import { EngagementPanel } from "./panelsEngagement";
import { RetentionPanel } from "./panelsRetention";
import { ContentPanel } from "./panelsContent";
import { ChurnPanel } from "./panelsChurn";
import { PeoplePanel } from "./panelsPeople";
import { DeskSignIn } from "../DeskSignIn";

type Tab = "pulse" | "growth" | "engagement" | "retention" | "content" | "churn" | "people";

const TABS: { value: Tab; label: string; blurb: string }[] = [
  { value: "pulse", label: "Pulse", blurb: "What to do today. Counts first. Percentages only when the sample can carry them." },
  { value: "growth", label: "Growth", blurb: "Who is arriving, and how many of them become real users." },
  { value: "engagement", label: "Engagement", blurb: "Which parts of Notho earn their place, and when people show up." },
  { value: "retention", label: "Retention", blurb: "Do they come back, and who is about to stop?" },
  { value: "content", label: "Content", blurb: "Which lessons and questions to rewrite, and which to leave alone." },
  { value: "churn", label: "Churn", blurb: "Why the ones who left, left - in their own words." },
  { value: "people", label: "People", blurb: "Every account, searchable, with a full drill-down." },
];

const WINDOWS = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "365", label: "1y" },
];

const REFRESH_MS = 60_000;

const DESK_CSS = `
.nv-title { align-items: stretch; }
.nv-mark {
  align-self: stretch;
  aspect-ratio: 1 / 1;
  width: auto;
  height: auto;
  border-radius: 14px;
  background: transparent !important;
  box-shadow: none !important;
  overflow: hidden;
  padding: 0;
}
.nv-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.nv-lockup {
  margin: 4px 0 0;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--teal);
}
.nv-tab[aria-selected="true"] {
  color: #04121B;
  background: var(--teal);
  box-shadow: 0 6px 18px rgba(46,217,206,0.28);
}
.nv-root[data-mode="light"] .nv-tab[aria-selected="true"] {
  color: #FFFFFF;
  background: var(--teal-deep);
}
`;

export default function AdminAnalyticsPage() {
  return (
    <ThemeProvider>
      <style dangerouslySetInnerHTML={{ __html: DESK_CSS }} />
      <Dashboard />
    </ThemeProvider>
  );
}

function Dashboard() {
  const { mode, toggle } = useTheme();
  const [tab, setTab] = useState<Tab>("pulse");
  const [days, setDays] = useState("30");
  const [nonce, setNonce] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [auto, setAuto] = useState(true);
  const [openUser, setOpenUser] = useState<string | null>(null);

  const [gate, setGate] = useState<"checking" | "ok" | "denied" | "signed-out">("checking");
  const [gateError, setGateError] = useState<string | null>(null);
  const [who, setWho] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setNonce((n) => n + 1);
    setLastRefresh(new Date());
  }, []);

  const checkGate = useCallback(async () => {
    setGateError(null);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setWho(null);
      setGate("signed-out");
      return;
    }
    setWho(data.session.user.email ?? null);
    try {
      await fetchView("overview", { days: 1 });
      setGate("ok");
      setLastRefresh(new Date());
    } catch (e) {
      const msg = (e as Error).message;
      setGateError(msg);
      setGate(msg.includes("admin-only") ? "denied" : "ok");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await checkGate();
      if (cancelled) return;
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        checkGate();
      }
      if (event === "SIGNED_OUT") {
        setWho(null);
        setGate("signed-out");
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [checkGate]);

  useEffect(() => {
    if (!auto || gate !== "ok") return;
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [auto, gate, refresh]);

  useEffect(() => {
    if (gate !== "ok") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [gate, refresh]);

  const jump = useCallback((next: string) => {
    if (TABS.some((t) => t.value === next)) {
      setTab(next as Tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const openUserFromAnywhere = useCallback((id: string) => {
    setOpenUser(id);
    setTab("people");
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setWho(null);
    setGate("signed-out");
  }, []);

  const active = useMemo(() => TABS.find((t) => t.value === tab)!,[tab]);
  const numDays = Number(days);

  return (
    <div className="nv-shell">
      <header className="nv-head">
        <div className="nv-title">
          <div className="nv-mark">
            <img src="/notho-icon-192.png" alt="Notho" />
          </div>
          <div>
            <h1 className="nv-h1">Notho Desk</h1>
            <p className="nv-lockup">Learn · Grow · Build wealth</p>
            <p className="nv-sub">Live from the database. Updates on its own.</p>
          </div>
        </div>

        <div className="nv-actions">
          <Link href="/admin" className="nv-btn" style={{ textDecoration: "none" }}>
            Backend
          </Link>
          {gate === "ok" && (
            <>
              <Link href="/admin/bugs" className="nv-btn" style={{ textDecoration: "none" }}>
                Bugs
              </Link>
              <label className="nv-live">
                <input
                  type="checkbox"
                  checked={auto}
                  onChange={(e) => setAuto(e.target.checked)}
                  style={{ accentColor: "var(--teal)" }}
                />
                <span className={`nv-pulse ${auto ? "" : "off"}`} />
                {auto ? "Live" : "Paused"}
                {lastRefresh && (
                  <span>
                    {" · "}
                    {lastRefresh.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </label>
              <Btn onClick={refresh}>Refresh</Btn>
            </>
          )}
          <Btn
            onClick={toggle}
            title="Dark is the working console. Light is the export theme for screenshots and decks."
          >
            {mode === "dark" ? "Export theme" : "Console theme"}
          </Btn>
          {gate === "ok" && (
            <Btn onClick={signOut} title={who ?? "Sign out"}>
              Sign out
            </Btn>
          )}
        </div>
      </header>

      {gate === "checking" && <Skeleton height={260} />}

      {gate === "signed-out" && (
        <DeskSignIn onSignedIn={checkGate} returnPath="/admin/analytics" />
      )}

      {gate === "denied" && (
        <Card>
          <ErrorNote
            message={
              gateError ??
              "This dashboard is admin-only and your account is not an admin. Ask an existing admin to set is_admin on your profile."
            }
          />
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn onClick={signOut}>Use a different account</Btn>
          </div>
        </Card>
      )}

      {gate === "ok" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <nav className="nv-nav" role="tablist" aria-label="Dashboard sections">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={tab === t.value}
                  className="nv-tab"
                  onClick={() => setTab(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab !== "people" && (
              <Segmented options={WINDOWS} value={days} onChange={setDays} label="Time window" />
            )}
          </div>

          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px" }}>{active.blurb}</p>

          <div role="tabpanel" aria-label={active.label}>
            {tab === "pulse" && <PulsePanel days={numDays} nonce={nonce} onJump={jump} />}
            {tab === "growth" && <GrowthPanel days={numDays} nonce={nonce} />}
            {tab === "engagement" && <EngagementPanel days={numDays} nonce={nonce} />}
            {tab === "retention" && (
              <RetentionPanel days={numDays} nonce={nonce} onOpenUser={openUserFromAnywhere} />
            )}
            {tab === "content" && <ContentPanel days={numDays} nonce={nonce} />}
            {tab === "churn" && <ChurnPanel days={numDays} nonce={nonce} />}
            {tab === "people" && (
              <PeoplePanel nonce={nonce} openUser={openUser} onOpenUser={setOpenUser} />
            )}
          </div>

          <p className="nv-foot">
            This page shows personal data and is restricted to admins. Under POPIA, only view what
            you need for a legitimate product purpose, and prefer the aggregate tabs over the
            per-user drill-down when preparing anything you will share outside the team. Time
            buckets are South African time; &ldquo;active&rdquo; means a tracked session, a question
            answered, or any recorded feature event.
          </p>
        </>
      )}
    </div>
  );
}
