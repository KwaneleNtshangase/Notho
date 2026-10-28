"use client";

/**
 * PEOPLE - every account, searchable, with the drill-down drawer.
 *
 * The drawer was the one panel that never worked: it returned
 * 'Could not load "user"' for every row, because the RPC behind it selected
 * user_progress columns that exist in the local schema but not in production.
 * Fixed in the analytics v2 migration; the drawer now also shows per-course
 * accuracy and a combined minutes/answers timeline, which is what makes a
 * single user's story readable rather than just a list of totals.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, ComposedChart, XAxis, YAxis } from "recharts";
import {
  ago,
  displayName,
  downloadCsv,
  featureLabel,
  fetchView,
  fmt,
  fmtMinutes,
  fmtPct,
  shortDate,
  type SegmentRow,
  type UserDetail,
  type UserRow,
} from "./lib";
import { usePalette } from "./theme";
import {
  Btn,
  Card,
  DataTable,
  Empty,
  ErrorNote,
  Gate,
  KV,
  Panel,
  Skeleton,
  Stat,
  StatGrid,
  Tag,
  useView,
  type Column,
} from "./ui";
import { Frame, ThemedTooltip, axis, labelFormatter } from "./charts";

export function PeoplePanel({
  nonce,
  openUser,
  onOpenUser,
}: {
  nonce: number;
  openUser: string | null;
  onOpenUser: (id: string | null) => void;
}) {
  const p = usePalette();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState("last_seen");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const u = useView<UserRow[]>("users", { search: debounced, sort, limit: 200 }, nonce);
  const segments = useView<SegmentRow[]>("segments", {}, nonce);
  const rows = useMemo(() => u.data ?? [], [u.data]);

  const summary = useMemo(() => {
    const active = rows.filter((r) => (r.days_since_seen ?? 999) <= 7).length;
    const streaks = rows.filter((r) => r.streak >= 3).length;
    const minutes = rows.reduce((a, r) => a + (r.total_minutes ?? 0), 0);
    return { active, streaks, minutes };
  }, [rows]);

  const columns: Column<UserRow>[] = [
    {
      key: "who",
      label: "User",
      render: (r) => (
        <div>
          <div className="nv-strong">{displayName(r)}</div>
          <div style={{ fontSize: 11.5, color: p.muted }}>{r.email}</div>
        </div>
      ),
    },
    { key: "lessons", label: "Lessons", numeric: true, sortKey: "lessons", render: (r) => fmt(r.lessons_done) },
    { key: "minutes", label: "Time in app", numeric: true, sortKey: "minutes", render: (r) => fmtMinutes(r.total_minutes) },
    { key: "sessions", label: "Visits", numeric: true, render: (r) => fmt(r.sessions) },
    { key: "features", label: "Features", numeric: true, render: (r) => fmt(r.features_used) },
    { key: "xp", label: "XP", numeric: true, sortKey: "xp", render: (r) => fmt(r.xp) },
    {
      key: "streak",
      label: "Streak",
      numeric: true,
      sortKey: "streak",
      render: (r) => (r.streak > 0 ? `${r.streak} 🔥` : "—"),
    },
    { key: "accuracy", label: "Accuracy", numeric: true, render: (r) => fmtPct(r.accuracy_pct) },
    {
      key: "seen",
      label: "Last seen",
      sortKey: "last_seen",
      render: (r) => (
        <Tag
          tone={
            r.days_since_seen == null
              ? "neutral"
              : r.days_since_seen <= 2
              ? "good"
              : r.days_since_seen <= 14
              ? "warn"
              : "bad"
          }
        >
          {ago(r.last_seen)}
        </Tag>
      ),
    },
    { key: "joined", label: "Joined", sortKey: "signup", render: (r) => <span style={{ color: p.muted }}>{ago(r.signed_up)}</span> },
  ];

  return (
    <div className="nv-stack">
      <StatGrid>
        <Stat label="Listed" value={fmt(rows.length)} accent={p.blue} hint="Accounts matching the current search." />
        <Stat label="Active this week" value={fmt(summary.active)} accent={p.teal} hint="Seen in the last 7 days." />
        <Stat label="On a streak" value={fmt(summary.streaks)} accent={p.gold} hint="Three days or more." />
        <Stat
          label="Time invested"
          value={fmtMinutes(summary.minutes)}
          accent={p.purple}
          hint="Total active minutes across the listed accounts."
        />
      </StatGrid>

      <Panel
        title="Everyone"
        subtitle="Click any row for the full profile. Search by email, username or name; sort by any column with arrows."
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              className="nv-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              aria-label="Search users"
            />
            {rows.length > 0 && <Btn onClick={() => downloadCsv("users", rows)}>Export CSV</Btn>}
          </div>
        }
      >
        <Gate loading={u.loading && !u.data} error={u.error} skeleton={340}>
          <DataTable
            columns={columns}
            rows={rows}
            activeSort={sort}
            onSort={setSort}
            onRowClick={(r) => onOpenUser(r.user_id)}
            emptyLabel={debounced ? `No users match "${debounced}".` : "No users yet."}
            maxHeight={620}
          />
          {rows.length >= 200 && (
            <p style={{ fontSize: 12, color: p.muted, marginTop: 12 }}>
              Showing the first 200. Use search to narrow it down.
            </p>
          )}
        </Gate>
      </Panel>

      <Panel
        title="Segments, and what each one needs"
        subtitle="The same accounts, grouped by how recently and how deeply they use Notho. Each row is a different job."
      >
        <Gate
          loading={segments.loading && !segments.data}
          error={segments.error}
          empty={(segments.data ?? []).length === 0}
          emptyTitle="No accounts yet"
          skeleton={200}
        >
          {(segments.data ?? []).map((x, i) => (
            <div
              key={x.segment}
              style={{
                display: "flex",
                gap: 13,
                alignItems: "flex-start",
                padding: "13px 0",
                borderBottom: `1px solid ${p.border}`,
              }}
            >
              <i
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  marginTop: 5,
                  background: p.series[i % p.series.length],
                  flex: "none",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: p.ink }}>{x.label}</div>
                <div style={{ fontSize: 12, color: p.muted, marginTop: 3, lineHeight: 1.55 }}>{x.action}</div>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: p.ink }}>{fmt(x.users)}</div>
                <div style={{ fontSize: 11, color: p.muted }}>
                  {fmtPct(x.pct)} · {x.avg_lessons ?? 0} lessons avg
                </div>
              </div>
            </div>
          ))}
        </Gate>
      </Panel>

      {openUser && <UserDrawer userId={openUser} onClose={() => onOpenUser(null)} />}
    </div>
  );
}

// ── Drill-down drawer ────────────────────────────────────────────────────────

export function UserDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const p = usePalette();
  // One piece of state, keyed by the user it belongs to. Switching users shows
  // the loader rather than the previous person's numbers, and the old error
  // clears itself - without a synchronous setState in the effect body, which
  // would cause a cascading render on every open.
  const [state, setState] = useState<{ id: string; data?: UserDetail; error?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchView<UserDetail>("user", { userId })
      .then((data) => {
        if (!cancelled) setState({ id: userId, data });
      })
      .catch((e: Error) => {
        if (!cancelled) setState({ id: userId, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Escape closes the drawer - it covers the table, so there must be a way out
  // that does not require finding the button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cur = state?.id === userId ? state : null;
  const d = cur?.data ?? null;
  const err = cur?.error ?? null;

  return (
    <div className="nv-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label="User detail">
      <div className="nv-drawer" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 800, color: p.ink, margin: 0 }}>User detail</h2>
          <Btn onClick={onClose}>Close</Btn>
        </div>

        {err ? (
          <ErrorNote message={err} />
        ) : !d ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height={120} />
            <Skeleton height={90} />
            <Skeleton height={200} />
          </div>
        ) : !d.profile ? (
          <Empty title="That account no longer exists" detail="It was probably deleted since the table was loaded." />
        ) : (
          <UserDetailBody d={d} />
        )}
      </div>
    </div>
  );
}

function UserDetailBody({ d }: { d: UserDetail }) {
  const p = usePalette();
  const name =
    d.profile?.username || d.profile?.fullName || d.profile?.email?.split("@")[0] || "Unknown";
  const timeline = d.dailyMinutes ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card className="pad-sm">
        <div style={{ fontSize: 19, fontWeight: 800, color: p.ink }}>{name}</div>
        <div style={{ fontSize: 13, color: p.body, marginTop: 3 }}>{d.profile?.email}</div>
        <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
          {d.profile?.isAdmin && <Tag tone="warn">Admin</Tag>}
          {d.daysSinceSeen != null && (
            <Tag tone={d.daysSinceSeen <= 2 ? "good" : d.daysSinceSeen <= 14 ? "warn" : "bad"}>
              {d.daysSinceSeen <= 0 ? "Active today" : `Quiet ${d.daysSinceSeen} days`}
            </Tag>
          )}
          {d.profile?.goal && <Tag>Goal: {d.profile.goal}</Tag>}
          {d.profile?.ageRange && <Tag>Age {d.profile.ageRange}</Tag>}
          {d.usage?.usesPwa && <Tag tone="good">Installed as app</Tag>}
          {(d.usage?.devices ?? []).map((dev) => (
            <Tag key={dev}>{dev}</Tag>
          ))}
        </div>
        <div style={{ fontSize: 12, color: p.muted, marginTop: 12 }}>
          Joined {ago(d.profile?.signedUp)} · Last seen{" "}
          {ago(d.lastActive ?? d.usage?.lastSeen ?? d.profile?.lastSignIn)}
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        <Stat label="Lessons" value={fmt(d.progress?.lessonsDone ?? 0)} accent={p.teal} />
        <Stat label="Time in app" value={fmtMinutes(d.usage?.totalMinutes ?? 0)} accent={p.purple} />
        <Stat label="Visits" value={fmt(d.usage?.sessions ?? 0)} accent={p.blue} />
        <Stat label="XP" value={fmt(d.progress?.xp ?? 0)} accent={p.gold} />
        <Stat label="Streak" value={`${d.progress?.streak ?? 0}`} unit="days" accent={p.red} />
        <Stat label="First-try" value={fmtPct(d.accuracy?.firstTryPct)} accent={p.green} />
      </div>

      {timeline.length > 0 && (
        <Card className="pad-sm">
          <h3 style={{ fontSize: 14, fontWeight: 800, color: p.ink, margin: "0 0 12px" }}>
            Last 60 days
          </h3>
          <Frame height={170}>
            <ComposedChart data={timeline} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={shortDate}
                tick={axis(p)}
                tickLine={false}
                axisLine={false}
                minTickGap={22}
              />
              <YAxis tick={axis(p)} tickLine={false} axisLine={false} />
              <ThemedTooltip labelFormatter={labelFormatter(shortDate)} />
              <Bar dataKey="minutes" name="Minutes" fill={p.teal} radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Line type="monotone" dataKey="answers" name="Answers" stroke={p.gold} strokeWidth={2} dot={false} />
            </ComposedChart>
          </Frame>
          <div style={{ fontSize: 11.5, color: p.muted, marginTop: 8, lineHeight: 1.5 }}>
            Answers without minutes means the session heartbeat missed that visit - the person was
            there, the timer was not.
          </div>
        </Card>
      )}

      {(d.courses ?? []).length > 0 && (
        <Card className="pad-sm">
          <h3 style={{ fontSize: 14, fontWeight: 800, color: p.ink, margin: "0 0 4px" }}>
            How they are coping, by course
          </h3>
          <div style={{ fontSize: 11.5, color: p.muted, marginBottom: 10 }}>
            First-try accuracy per course. A low number in one course and a high one in another says
            the course is hard, not the learner.
          </div>
          {d.courses.map((c) => (
            <KV
              key={c.courseId}
              label={c.courseId}
              detail={`${c.lessons} lessons · ${c.attempts} answers · last ${ago(c.lastSeen)}`}
              value={fmtPct(c.firstTryPct)}
              accent={
                c.firstTryPct == null ? p.muted : c.firstTryPct < 45 ? p.red : c.firstTryPct > 95 ? p.gold : p.green
              }
            />
          ))}
        </Card>
      )}

      <Card className="pad-sm">
        <h3 style={{ fontSize: 14, fontWeight: 800, color: p.ink, margin: "0 0 10px" }}>
          Features they use
        </h3>
        {(d.features ?? []).length === 0 ? (
          <Empty title="No feature activity recorded" />
        ) : (
          <div>
            <Frame height={Math.max(120, d.features.length * 34)}>
              <BarChart
                data={d.features}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={p.grid} horizontal={false} />
                <XAxis type="number" tick={axis(p)} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tickFormatter={featureLabel}
                  tick={{ ...axis(p), fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={112}
                />
                <ThemedTooltip labelFormatter={labelFormatter(featureLabel)} />
                <Bar dataKey="events" name="Uses" fill={p.teal} radius={[0, 5, 5, 0]} maxBarSize={18} />
              </BarChart>
            </Frame>
          </div>
        )}
      </Card>

      <Card className="pad-sm">
        <h3 style={{ fontSize: 14, fontWeight: 800, color: p.ink, margin: "0 0 10px" }}>
          Recent activity
        </h3>
        {(d.recentEvents ?? []).length === 0 ? (
          <Empty title="No recent events" />
        ) : (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {d.recentEvents.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: `1px solid ${p.border}`,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: p.body }}>
                  {e.event.replace(/_/g, " ")}
                  {e.props?.lessonId ? (
                    <span style={{ color: p.muted }}> · {String(e.props.lessonId)}</span>
                  ) : null}
                </span>
                <span style={{ color: p.muted, whiteSpace: "nowrap" }}>{ago(e.at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
