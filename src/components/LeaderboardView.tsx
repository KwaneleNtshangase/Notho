"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCcw } from "@/components/icons/NothoIcons";
import { NothoTrophy } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { formatWithSpaces } from "@/lib/formatters";
import { sastWeekKey } from "@/lib/dates";
import {
  buildWeeklyRoster,
  scorerCount,
  type LeaderRow,
} from "@/lib/leaderboardRoster";

// ─── Helpers ──────────────────────────────────────────────────

export function getLeaderboardWeekKey(): string {
  return sastWeekKey();
}

/** Next Sunday 00:00 SAST - weekly XP resets when the new week starts (Sunday-anchored). */
function getWeekResetDate(): Date {
  const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
  const nowSAST = new Date(Date.now() + SAST_OFFSET_MS);
  let daysUntilSun = (7 - nowSAST.getUTCDay()) % 7;
  if (daysUntilSun === 0) daysUntilSun = 7;
  const resetSAST = new Date(nowSAST);
  resetSAST.setUTCDate(resetSAST.getUTCDate() + daysUntilSun);
  resetSAST.setUTCHours(0, 0, 0, 0);
  return new Date(resetSAST.getTime() - SAST_OFFSET_MS);
}

// ─── LeaderboardView ─────────────────────────────────────────────────

export function LeaderboardView({
  xp,
  weeklyXp,
  currentUserId,
}: {
  xp: number;
  weeklyXp?: number;
  currentUserId?: string;
}) {
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [needsUsername, setNeedsUsername] = useState(false);
  const router = useRouter();

  // Countdown to Sunday midnight SAST (new weekly XP period)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const reset = getWeekResetDate();
      const diff = reset.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft("Resetting…"); return; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(days > 0 ? `${days}d ${hrs}h` : `${hrs}h ${mins}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const myId = user?.id ?? currentUserId ?? null;
        const currentWeekKey = getLeaderboardWeekKey();

        // Prompt the user to pick a username if they haven't yet (their own
        // profile row is readable under the own-row RLS policy).
        if (myId) {
          const { data: myProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("user_id", myId)
            .maybeSingle();
          setNeedsUsername(!String(myProfile?.username ?? "").trim());
        }

        // Privacy-safe roster via SECURITY DEFINER RPC (audit H3): returns
        // user_id, username, xp, weekly_xp, week_key only - never full_name
        // or age_range - and is restricted to authenticated callers.
        const { data: rpcRows, error: rpcError } = await supabase.rpc("get_leaderboard");

        if (rpcError) {
          setLoadError(true);
          setLoading(false);
          return;
        }

        setLeaders(
          buildWeeklyRoster(rpcRows ?? [], {
            myId,
            currentWeekKey,
            localWeeklyXp: weeklyXp,
          })
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [xp, weeklyXp, currentUserId, retryCount]);

  const myRank = leaders.find((l) => l.isYou);
  const myIndex = leaders.findIndex((l) => l.isYou);
  const aheadOfMe = myIndex > 0 ? leaders[myIndex - 1] : null;
  const xpToNext = aheadOfMe && myRank ? aheadOfMe.xp - myRank.xp : null;

  const scorers = scorerCount(leaders);
  const showPodium = scorers >= 3 && leaders.length >= 3;
  const listRows = showPodium ? leaders.slice(3) : leaders;
  const quietTitle = scorers < 10;

  return (
    <main >
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{quietTitle ? "This week's learners" : "Leaderboard"}</h2>
          {timeLeft && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", background: "var(--color-border)", borderRadius: 20, padding: "4px 12px", marginBottom: 4 }}>
              <RefreshCcw size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />Resets in {timeLeft}
            </div>
          )}
        </div>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 12, fontSize: 14 }}>
          Weekly XP among people who learned this week. Resets every Sunday.
        </p>

        {/* Username prompt - shown until the user picks a handle */}
        {needsUsername && !loading && (
          <div style={{
            background: "rgba(239,179,67,0.08)",
            border: "1.5px solid var(--color-accent, #EFB343)",
            borderRadius: 14, padding: "12px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
              Pick a username to choose how you appear on the leaderboard
            </div>
            <button
              onClick={() => router.push("/profile")}
              style={{
                background: "var(--color-primary)", color: "#fff", border: "none",
                borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Choose username
            </button>
          </div>
        )}

        {/* Your rank summary card */}
        {myRank && !loading && (
          <div style={{
            background: "linear-gradient(135deg, rgba(0,122,133,0.1) 0%, rgba(239,179,67,0.06) 100%)",
            border: "2px solid var(--color-primary)",
            borderRadius: 16, padding: "16px 18px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)", marginBottom: 4 }}>
                  Your Rank
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "var(--color-text-primary)", lineHeight: 1 }}>
                  #{myRank.rank}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginTop: 4 }}>
                  {formatWithSpaces(myRank.xp)} XP this week
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  {formatWithSpaces(myRank.totalXp)} total XP
                </div>
              </div>
              {xpToNext !== null && xpToNext > 0 && aheadOfMe && aheadOfMe.xp > 0 && (
                <div style={{
                  background: "var(--color-surface)", borderRadius: 12, padding: "10px 14px",
                  border: "1px solid var(--color-border)", textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-secondary)", letterSpacing: "0.06em", marginBottom: 2 }}>
                    To pass {aheadOfMe.name}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#EFB343" }}>
                    {formatWithSpaces(xpToNext)} XP
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    ≈ {Math.ceil(xpToNext / 60)} lessons away
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>Loading leaderboard...</div>
            <div style={{ width: "100%", height: 6, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "var(--color-primary)", borderRadius: 3, animation: "slide-right 1.2s ease-in-out infinite" }} />
            </div>
          </div>
        ) : loadError ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <AlertTriangle size={40} style={{ color: "var(--color-secondary)" }} aria-hidden />
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Could not load leaderboard</div>
            <div style={{ color: "var(--color-text-secondary)", marginBottom: 16, fontSize: 14 }}>Check your connection and try again.</div>
            <button className="btn btn-primary" onClick={() => setRetryCount(n => n + 1)}>Retry</button>
          </div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>
            No players yet. Be the first to earn XP!
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {showPodium && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 10, marginBottom: 24 }}>
                {/* 2nd place */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", margin: "0 auto 6px",
                    background: "#C0C0C0", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 900, color: "white",
                    border: leaders[1].isYou ? "3px solid var(--color-primary)" : "3px solid #C0C0C0",
                  }}>{leaders[1].name[0].toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{leaders[1].name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>{formatWithSpaces(leaders[1].xp)} XP</div>
                  <div style={{ background: "#C0C0C0", borderRadius: "8px 8px 0 0", height: 60, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "white" }}>2</span>
                  </div>
                </div>
                {/* 1st place */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                    <NothoTrophy size={20} style={{ color: "#EFB343" }} />
                  </div>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%", margin: "0 auto 6px",
                    background: "#EFB343", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 900, color: "white",
                    border: leaders[0].isYou ? "3px solid var(--color-primary)" : "3px solid #EFB343",
                    boxShadow: "0 4px 16px rgba(239,179,67,0.35)",
                  }}>{leaders[0].name[0].toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)" }}>{leaders[0].name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#EFB343" }}>{formatWithSpaces(leaders[0].xp)} XP</div>
                  <div style={{ background: "#EFB343", borderRadius: "8px 8px 0 0", height: 80, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: "white" }}>1</span>
                  </div>
                </div>
                {/* 3rd place */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", margin: "0 auto 6px",
                    background: "#CD7F32", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: "white",
                    border: leaders[2].isYou ? "3px solid var(--color-primary)" : "3px solid #CD7F32",
                  }}>{leaders[2].name[0].toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{leaders[2].name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#CD7F32" }}>{formatWithSpaces(leaders[2].xp)} XP</div>
                  <div style={{ background: "#CD7F32", borderRadius: "8px 8px 0 0", height: 44, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "white" }}>3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div style={{
              background: "var(--color-surface)", color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)", borderRadius: 16, overflow: "hidden",
            }}>
              {listRows.map((leader) => {
                const prevLeader = leaders[leader.rank - 2];
                return (
                  <div
                    key={leader.id}
                    className="leaderboard-row"
                    data-rank={leader.rank}
                    style={{
                      ...(leader.isYou ? { background: "rgba(0,122,133,0.08)", borderLeft: "4px solid var(--color-primary)" } : {}),
                      display: "flex", alignItems: "center", padding: "12px 16px",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{
                      width: 32, textAlign: "center", fontSize: 14, fontWeight: 800,
                      color: leader.isYou ? "var(--color-primary)" : "var(--color-text-secondary)",
                      flexShrink: 0,
                    }}>
                      {leader.rank}
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", marginLeft: 10, marginRight: 12,
                      background: leader.isYou ? "var(--color-primary)" : "#eee",
                      color: leader.isYou ? "white" : "#555",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800, flexShrink: 0,
                    }}>
                      {leader.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        {leader.name}
                        {leader.isYou && (
                          <span style={{ fontSize: 10, background: "var(--color-primary)", color: "white", borderRadius: 999, padding: "2px 8px", fontWeight: 700 }}>You</span>
                        )}
                      </div>
                      {leader.isYou && prevLeader && prevLeader.xp > leader.xp && (
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                          {formatWithSpaces(prevLeader.xp - leader.xp)} XP to #{leader.rank - 1}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <div style={{
                        fontWeight: 800, fontSize: 14,
                        color: leader.isYou ? "var(--color-primary)" : "var(--color-text-secondary)",
                      }}>
                        {formatWithSpaces(leader.xp)} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push("/learn")}
            >
              Continue a lesson
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
