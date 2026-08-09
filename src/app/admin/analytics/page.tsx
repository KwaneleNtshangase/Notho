"use client";

/**
 * /admin/analytics
 *
 * The product dashboard: who uses Notho, for how long, which features they
 * reach for, whether they come back, and which lessons are landing.
 *
 * Live by design - every panel re-queries Postgres on load and on the refresh
 * cadence below, so nothing here is a stale nightly export.
 *
 * Access: the API route is the real gate (it checks profiles.is_admin against a
 * service-role client). The check on this page is a courtesy so a non-admin
 * sees a clear message instead of five broken panels.
 */

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { C, fetchView } from "./lib";
import { Button, Card, ErrorNote, Loading, SegmentedControl } from "./components";
import {
  ChurnPanel,
  ContentPanel,
  FeaturesPanel,
  OverviewPanel,
  RetentionPanel,
  UsersPanel,
} from "./panels";

type Tab = "overview" | "features" | "retention" | "churn" | "content" | "users";

const TABS: { value: Tab; label: string; blurb: string }[] = [
  { value: "overview", label: "Overview", blurb: "The headline numbers — users, time, growth." },
  { value: "features", label: "Features", blurb: "Which parts of the app people actually use." },
  { value: "retention", label: "Retention", blurb: "Do they come back, and where do they give up?" },
  // Sits next to Retention on purpose: that tab shows how many left, this one
  // shows why. Reading either alone is how you end up guessing.
  { value: "churn", label: "Churn", blurb: "Why the ones who left, left — in their own words." },
  { value: "content", label: "Content", blurb: "Which lessons are too hard, too easy, or just right." },
  { value: "users", label: "Users", blurb: "Every user, searchable, with a full drill-down." },
];

const WINDOWS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
];

/** Auto-refresh cadence. Frequent enough to feel live, gentle on the database. */
const REFRESH_MS = 60_000;

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState("30");
  const [nonce, setNonce] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [auto, setAuto] = useState(true);

  const [gate, setGate] = useState<"checking" | "ok" | "denied" | "signed-out">("checking");
  const [gateError, setGateError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setNonce((n) => n + 1);
    setLastRefresh(new Date());
  }, []);

  // One cheap probe up front, so an unauthorised visitor gets one clear message
  // rather than the same error repeated across every panel.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setGate("signed-out");
        return;
      }
      try {
        await fetchView("overview", { days: 1 });
        if (!cancelled) {
          setGate("ok");
          setLastRefresh(new Date());
        }
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message;
        setGateError(msg);
        setGate(msg.includes("admin-only") ? "denied" : "ok");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!auto || gate !== "ok") return;
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [auto, gate, refresh]);

  // Refreshing the moment the tab regains focus means the numbers are current
  // the instant you look at them, not up to a minute stale.
  useEffect(() => {
    if (gate !== "ok") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [gate, refresh]);

  if (gate === "checking") {
    return (
      <Shell>
        <Loading label="Checking your access…" />
      </Shell>
    );
  }

  if (gate === "signed-out") {
    return (
      <Shell>
        <Card>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: C.ink, margin: "0 0 8px" }}>
            Please sign in
          </h2>
          <p style={{ fontSize: 14, color: C.body, margin: 0, lineHeight: 1.6 }}>
            This dashboard is admin-only. Sign in with your admin account and come back to
            this page.
          </p>
        </Card>
      </Shell>
    );
  }

  if (gate === "denied") {
    return (
      <Shell>
        <ErrorNote
          message={
            gateError ??
            "This dashboard is admin-only and your account is not an admin. Ask an existing admin to set is_admin on your profile."
          }
        />
      </Shell>
    );
  }

  const numDays = Number(days);
  const activeTab = TABS.find((t) => t.value === tab)!;

  return (
    <Shell>
      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <SegmentedControl
          options={TABS.map((t) => ({ value: t.value, label: t.label }))}
          value={tab}
          onChange={setTab}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {tab !== "users" && tab !== "content" && (
            <SegmentedControl options={WINDOWS} value={days} onChange={setDays} />
          )}
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <p style={{ fontSize: 13.5, color: C.muted, margin: 0 }}>{activeTab.blurb}</p>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            color: C.muted,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: auto ? C.green : C.muted,
                display: "inline-block",
              }}
            />
            Live
            {lastRefresh && (
              <span>
                · updated{" "}
                {lastRefresh.toLocaleTimeString("en-ZA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </span>
        </label>
      </div>

      {tab === "overview" && <OverviewPanel days={numDays} nonce={nonce} />}
      {tab === "features" && <FeaturesPanel days={numDays} nonce={nonce} />}
      {tab === "retention" && <RetentionPanel days={numDays} nonce={nonce} />}
      {tab === "churn" && <ChurnPanel days={numDays} nonce={nonce} />}
      {tab === "content" && <ContentPanel nonce={nonce} />}
      {tab === "users" && <UsersPanel nonce={nonce} />}

      <p
        style={{
          fontSize: 11.5,
          color: C.muted,
          marginTop: 28,
          lineHeight: 1.6,
          maxWidth: 720,
        }}
      >
        This page shows personal data and is restricted to admins. Under POPIA, only view what
        you need for a legitimate product purpose, and prefer the aggregate tabs over the
        per-user drill-down when preparing anything you will share outside the team.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>
            Notho product dashboard
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.55 }}>
            Live data straight from your database. Every panel updates on its own — no exports,
            no waiting.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
