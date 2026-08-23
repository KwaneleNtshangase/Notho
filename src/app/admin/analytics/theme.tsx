"use client";

/**
 * The dashboard's own design system.
 *
 * Deliberately one stylesheet rather than inline styles on every element. The
 * previous version styled everything inline, which rules out hover states,
 * media queries, keyframes and theming - all four of which this dashboard
 * needs. Everything here is scoped under .nv-root so it cannot leak into the
 * learner-facing app, which has its own theme variables.
 *
 * Colour comes from brand/BRAND.md. The dark theme is the default because this
 * is a screen you stare at late at night; the light theme is one click away and
 * is the one to use for screenshots in a funding deck.
 */

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Mode = "dark" | "light";

const STORAGE_KEY = "notho-admin-theme";

/**
 * The chosen theme lives in a tiny external store rather than in an effect.
 * Reading localStorage during render would break hydration, and reading it in
 * an effect means a synchronous setState on mount - a cascading render, and the
 * thing react-hooks/set-state-in-effect exists to stop. useSyncExternalStore is
 * the shape React provides for exactly this: a value that lives outside React
 * and differs between server and client.
 */
let current: Mode | null = null;
const listeners = new Set<() => void>();

function readMode(): Mode {
  if (current) return current;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    current = saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    current = "dark"; // private mode - the default is fine
  }
  return current;
}

function writeMode(next: Mode) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const ThemeCtx = createContext<{ mode: Mode; toggle: () => void }>({
  mode: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readMode, () => "dark" as Mode);
  const toggle = useCallback(() => writeMode(readMode() === "dark" ? "light" : "dark"), []);

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      <div className="nv-root" data-mode={mode}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

/**
 * Chart colours, read from the DOM so the charts follow the theme toggle.
 * Recharts needs real colour strings, not var(--x), for gradients and fills.
 */
export function usePalette() {
  const { mode } = useTheme();
  return mode === "dark" ? DARK : LIGHT;
}

export type Palette = {
  teal: string; gold: string; blue: string; purple: string; green: string;
  red: string; pink: string; ink: string; body: string; muted: string;
  grid: string; surface: string; border: string; series: string[];
};

export const DARK: Palette = {
  teal: "#2ED9CE",
  gold: "#F5B942",
  blue: "#5B8CFF",
  purple: "#A78BFA",
  green: "#34D99B",
  red: "#FF6B63",
  pink: "#F472B6",
  ink: "#EAF1FF",
  body: "#AFBDD8",
  muted: "#7A88A6",
  grid: "rgba(140,170,255,0.10)",
  surface: "#0E1526",
  border: "rgba(140,170,255,0.16)",
  series: ["#2ED9CE", "#F5B942", "#5B8CFF", "#A78BFA", "#34D99B", "#FF6B63", "#F472B6"],
};

export const LIGHT: Palette = {
  teal: "#049DA7",
  gold: "#C98A12",
  blue: "#083088",
  purple: "#6D46E8",
  green: "#0E9F6E",
  red: "#D93B31",
  pink: "#DB2777",
  ink: "#0B1B3A",
  body: "#3C4A63",
  muted: "#6B7A94",
  grid: "rgba(11,27,58,0.10)",
  surface: "#FFFFFF",
  border: "#E2E8F2",
  series: ["#049DA7", "#C98A12", "#083088", "#6D46E8", "#0E9F6E", "#D93B31", "#DB2777"],
};

const CSS = `
.nv-root {
  --teal:#2ED9CE; --teal-deep:#049DA7; --gold:#F5B942; --blue:#5B8CFF;
  --purple:#A78BFA; --green:#34D99B; --red:#FF6B63; --pink:#F472B6;

  --bg:#05080F;
  --bg-tint-a:rgba(4,157,167,0.16);
  --bg-tint-b:rgba(8,48,136,0.30);
  --panel:rgba(16,23,42,0.72);
  --panel-solid:#0E1526;
  --panel-2:rgba(255,255,255,0.035);
  --raise:rgba(255,255,255,0.06);
  --border:rgba(140,170,255,0.16);
  --border-strong:rgba(140,170,255,0.30);
  --ink:#EAF1FF; --body:#AFBDD8; --muted:#7A88A6;
  --shadow:0 18px 44px rgba(0,0,0,0.45);
  --glow:0 0 0 1px rgba(46,217,206,0.30), 0 0 28px rgba(46,217,206,0.16);

  color-scheme: dark;
  min-height:100vh;
  background:
    radial-gradient(1100px 620px at 12% -8%, var(--bg-tint-a), transparent 60%),
    radial-gradient(900px 560px at 92% 0%, var(--bg-tint-b), transparent 62%),
    var(--bg);
  color:var(--body);
  font-family:var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  -webkit-font-smoothing:antialiased;
}
.nv-root[data-mode="light"] {
  --teal:#049DA7; --teal-deep:#00707A; --gold:#C98A12; --blue:#083088;
  --purple:#6D46E8; --green:#0E9F6E; --red:#D93B31; --pink:#DB2777;
  --bg:#F4F7FC;
  --bg-tint-a:rgba(4,157,167,0.10);
  --bg-tint-b:rgba(8,48,136,0.08);
  --panel:#FFFFFF;
  --panel-solid:#FFFFFF;
  --panel-2:#F7FAFD;
  --raise:rgba(8,48,136,0.04);
  --border:#E2E8F2;
  --border-strong:#CBD6E8;
  --ink:#0B1B3A; --body:#3C4A63; --muted:#6B7A94;
  --shadow:0 10px 30px rgba(11,27,58,0.08);
  --glow:0 0 0 1px rgba(4,157,167,0.25), 0 0 20px rgba(4,157,167,0.10);
  color-scheme: light;
}

.nv-root *, .nv-root *::before, .nv-root *::after { box-sizing:border-box; }

/* ── Layout ──────────────────────────────────────────────────────────────── */
.nv-shell { max-width:1440px; margin:0 auto; padding:22px 20px 72px; }
.nv-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; flex-wrap:wrap; margin-bottom:20px; }
.nv-title { display:flex; align-items:center; gap:13px; }
.nv-mark {
  width:40px; height:40px; border-radius:13px; display:grid; place-items:center;
  background:linear-gradient(140deg, var(--teal), var(--blue));
  color:#04121B; font-weight:900; font-size:19px; letter-spacing:-0.5px;
  box-shadow:var(--glow); flex:none;
}
.nv-h1 { margin:0; font-size:21px; font-weight:800; color:var(--ink); letter-spacing:-0.35px; line-height:1.15; }
.nv-sub { margin:3px 0 0; font-size:12.5px; color:var(--muted); }
.nv-actions { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }

/* ── Navigation ──────────────────────────────────────────────────────────── */
.nv-nav {
  display:flex; gap:4px; padding:5px; border-radius:15px; overflow-x:auto;
  background:var(--panel-2); border:1px solid var(--border);
  backdrop-filter:blur(14px); scrollbar-width:none;
}
.nv-nav::-webkit-scrollbar { display:none; }
.nv-tab {
  appearance:none; border:none; cursor:pointer; white-space:nowrap;
  display:inline-flex; align-items:center; gap:7px;
  padding:9px 15px; border-radius:11px; font-size:13px; font-weight:700;
  background:transparent; color:var(--muted); transition:color .18s, background .18s, box-shadow .18s;
}
.nv-tab:hover { color:var(--ink); background:var(--raise); }
.nv-tab[aria-selected="true"] {
  color:#04121B; background:linear-gradient(140deg, var(--teal), #57C7FF);
  box-shadow:0 6px 18px rgba(46,217,206,0.28);
}
.nv-root[data-mode="light"] .nv-tab[aria-selected="true"] { color:#FFFFFF; background:linear-gradient(140deg, var(--teal), var(--blue)); }

/* ── Cards ───────────────────────────────────────────────────────────────── */
.nv-card {
  background:var(--panel); border:1px solid var(--border); border-radius:18px;
  padding:20px; backdrop-filter:blur(16px); box-shadow:var(--shadow);
  position:relative; overflow:hidden;
}
.nv-card.pad-sm { padding:15px; }
.nv-card.flush { padding:0; }
.nv-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:6px; }
.nv-card-title { margin:0; font-size:15.5px; font-weight:800; color:var(--ink); letter-spacing:-0.2px; }
.nv-card-sub { margin:6px 0 16px; font-size:12.8px; line-height:1.6; color:var(--muted); max-width:74ch; }
.nv-grid { display:grid; gap:16px; }
.nv-grid.two { grid-template-columns:repeat(auto-fit, minmax(330px, 1fr)); }
.nv-grid.three { grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); }
.nv-stack { display:flex; flex-direction:column; gap:16px; }

/* ── Stat tiles ──────────────────────────────────────────────────────────── */
.nv-stats { display:grid; gap:13px; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); }
.nv-stat {
  position:relative; padding:16px 16px 14px; border-radius:16px; overflow:hidden;
  background:var(--panel); border:1px solid var(--border); box-shadow:var(--shadow);
  transition:transform .18s ease, border-color .18s ease;
}
.nv-stat:hover { transform:translateY(-2px); border-color:var(--border-strong); }
.nv-stat::after {
  content:""; position:absolute; inset:0 0 auto 0; height:2px;
  background:linear-gradient(90deg, var(--accent, var(--teal)), transparent);
  opacity:.85;
}
.nv-stat-label { font-size:10.5px; font-weight:800; letter-spacing:.85px; text-transform:uppercase; color:var(--muted); }
.nv-stat-value { display:flex; align-items:baseline; gap:9px; margin-top:9px; flex-wrap:wrap; }
.nv-stat-num { font-size:28px; font-weight:800; line-height:1; color:var(--accent, var(--ink)); font-variant-numeric:tabular-nums; letter-spacing:-0.9px; }
.nv-stat-unit { font-size:13px; font-weight:700; color:var(--muted); }
.nv-stat-hint { margin-top:9px; font-size:11.5px; line-height:1.5; color:var(--muted); }
.nv-spark { margin-top:10px; height:34px; }

.nv-delta { display:inline-flex; align-items:center; gap:3px; font-size:12px; font-weight:800; padding:2px 7px; border-radius:999px; }
.nv-delta.up { color:var(--green); background:color-mix(in srgb, var(--green) 14%, transparent); }
.nv-delta.down { color:var(--red); background:color-mix(in srgb, var(--red) 14%, transparent); }
.nv-delta.flat { color:var(--muted); background:var(--raise); }

/* ── Tags ────────────────────────────────────────────────────────────────── */
.nv-tag {
  display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px;
  font-size:11px; font-weight:800; letter-spacing:.2px; white-space:nowrap;
  border:1px solid transparent;
}
.nv-tag.good { color:var(--green); background:color-mix(in srgb, var(--green) 13%, transparent); border-color:color-mix(in srgb, var(--green) 30%, transparent); }
.nv-tag.warn { color:var(--gold); background:color-mix(in srgb, var(--gold) 13%, transparent); border-color:color-mix(in srgb, var(--gold) 30%, transparent); }
.nv-tag.bad  { color:var(--red); background:color-mix(in srgb, var(--red) 13%, transparent); border-color:color-mix(in srgb, var(--red) 30%, transparent); }
.nv-tag.info { color:var(--blue); background:color-mix(in srgb, var(--blue) 13%, transparent); border-color:color-mix(in srgb, var(--blue) 30%, transparent); }
.nv-tag.neutral { color:var(--body); background:var(--raise); border-color:var(--border); }

/* ── Buttons & inputs ────────────────────────────────────────────────────── */
.nv-btn {
  appearance:none; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
  padding:8px 13px; border-radius:11px; font-size:12.5px; font-weight:700;
  background:var(--panel-2); color:var(--body); border:1px solid var(--border);
  transition:all .16s ease; white-space:nowrap;
}
.nv-btn:hover { color:var(--ink); border-color:var(--border-strong); background:var(--raise); }
.nv-btn:disabled { opacity:.45; cursor:not-allowed; }
.nv-btn.primary { background:linear-gradient(140deg, var(--teal), #3D9BFF); color:#04121B; border-color:transparent; box-shadow:0 6px 18px rgba(46,217,206,0.25); }
.nv-root[data-mode="light"] .nv-btn.primary { color:#fff; background:linear-gradient(140deg, var(--teal), var(--blue)); }
.nv-btn.icon { padding:8px 10px; }

.nv-seg { display:inline-flex; padding:3px; gap:2px; border-radius:12px; background:var(--panel-2); border:1px solid var(--border); }
.nv-seg button {
  appearance:none; border:none; cursor:pointer; padding:6px 12px; border-radius:9px;
  font-size:12px; font-weight:700; background:transparent; color:var(--muted); transition:all .16s;
}
.nv-seg button:hover { color:var(--ink); }
.nv-seg button[aria-pressed="true"] { background:var(--raise); color:var(--ink); box-shadow:inset 0 0 0 1px var(--border-strong); }

.nv-input {
  padding:8px 12px; border-radius:11px; font-size:13px; min-width:210px;
  background:var(--panel-2); border:1px solid var(--border); color:var(--ink); outline:none;
  transition:border-color .16s, box-shadow .16s;
}
.nv-input::placeholder { color:var(--muted); }
.nv-input:focus { border-color:var(--teal); box-shadow:0 0 0 3px color-mix(in srgb, var(--teal) 18%, transparent); }

.nv-live { display:inline-flex; align-items:center; gap:8px; font-size:11.5px; color:var(--muted); cursor:pointer; user-select:none; }
.nv-pulse { width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 0 0 color-mix(in srgb, var(--green) 60%, transparent); animation:nv-pulse 2.4s infinite; }
.nv-pulse.off { background:var(--muted); animation:none; box-shadow:none; }
@keyframes nv-pulse {
  0% { box-shadow:0 0 0 0 color-mix(in srgb, var(--green) 55%, transparent); }
  70% { box-shadow:0 0 0 7px transparent; }
  100% { box-shadow:0 0 0 0 transparent; }
}

/* ── Table ───────────────────────────────────────────────────────────────── */
.nv-table-wrap { overflow-x:auto; border-radius:14px; border:1px solid var(--border); }
.nv-table { width:100%; border-collapse:collapse; font-size:13px; }
.nv-table th {
  position:sticky; top:0; z-index:1; text-align:left; padding:10px 13px;
  font-size:10.5px; font-weight:800; letter-spacing:.7px; text-transform:uppercase;
  color:var(--muted); background:var(--panel-solid); border-bottom:1px solid var(--border);
  white-space:nowrap; user-select:none;
}
.nv-table th.num { text-align:right; }
.nv-table th.sortable { cursor:pointer; }
.nv-table th.sortable:hover { color:var(--ink); }
.nv-table th.active { color:var(--teal); }
.nv-table td { padding:11px 13px; border-bottom:1px solid var(--border); color:var(--body); vertical-align:middle; }
.nv-table td.num { text-align:right; font-variant-numeric:tabular-nums; }
.nv-table tbody tr { transition:background .14s; }
.nv-table tbody tr:last-child td { border-bottom:none; }
.nv-table tbody tr.clickable { cursor:pointer; }
.nv-table tbody tr.clickable:hover { background:var(--raise); }
.nv-strong { color:var(--ink); font-weight:700; }

/* ── Insight cards ───────────────────────────────────────────────────────── */
.nv-insight {
  display:flex; gap:13px; padding:15px 16px; border-radius:15px;
  background:var(--panel-2); border:1px solid var(--border);
  transition:border-color .18s, transform .18s;
}
.nv-insight:hover { border-color:var(--border-strong); transform:translateX(2px); }
.nv-insight-rail { width:3px; border-radius:3px; flex:none; background:var(--tone, var(--teal)); }
.nv-insight-title { margin:0 0 5px; font-size:14px; font-weight:800; color:var(--ink); line-height:1.35; }
.nv-insight-body { margin:0; font-size:12.6px; line-height:1.62; color:var(--body); }
.nv-insight-do { margin:9px 0 0; font-size:12.6px; line-height:1.6; color:var(--ink); }
.nv-insight-do b { color:var(--tone, var(--teal)); }
.nv-insight-jump {
  margin-top:10px; appearance:none; border:none; background:none; cursor:pointer; padding:0;
  font-size:12px; font-weight:800; color:var(--tone, var(--teal));
}
.nv-insight-jump:hover { text-decoration:underline; }

/* ── Misc ────────────────────────────────────────────────────────────────── */
.nv-note {
  padding:12px 14px; border-radius:13px; font-size:12.4px; line-height:1.62; color:var(--body);
  background:color-mix(in srgb, var(--teal) 8%, transparent);
  border:1px solid color-mix(in srgb, var(--teal) 22%, transparent);
}
.nv-error {
  padding:14px 16px; border-radius:13px; font-size:13px; line-height:1.6;
  color:var(--red); background:color-mix(in srgb, var(--red) 10%, transparent);
  border:1px solid color-mix(in srgb, var(--red) 28%, transparent);
}
.nv-error code { display:block; margin-top:7px; font-size:11.5px; color:var(--body); word-break:break-word; }
.nv-empty {
  padding:34px 20px; text-align:center; border-radius:14px;
  border:1px dashed var(--border-strong); background:var(--panel-2);
}
.nv-empty-t { font-size:14px; font-weight:700; color:var(--ink); margin-bottom:6px; }
.nv-empty-d { font-size:12.5px; color:var(--muted); max-width:46ch; margin:0 auto; line-height:1.6; }

.nv-skel { border-radius:12px; background:linear-gradient(90deg, var(--panel-2) 0%, var(--raise) 50%, var(--panel-2) 100%); background-size:600px 100%; animation:nv-shimmer 1.5s ease-in-out infinite; }
@keyframes nv-shimmer { 0% { background-position:-300px 0; } 100% { background-position:300px 0; } }

.nv-bar-track { height:7px; border-radius:999px; background:var(--raise); overflow:hidden; }
.nv-bar-fill { height:100%; border-radius:999px; transition:width .5s cubic-bezier(.22,1,.36,1); }

.nv-kv { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:11px 0; border-bottom:1px solid var(--border); }
.nv-kv:last-child { border-bottom:none; }
.nv-kv-l { font-size:13px; font-weight:700; color:var(--body); }
.nv-kv-d { font-size:11.5px; color:var(--muted); margin-top:2px; }
.nv-kv-v { font-size:18px; font-weight:800; color:var(--ink); font-variant-numeric:tabular-nums; }

/* Cohort / clock heatmaps */
.nv-heat { display:grid; gap:3px; }
.nv-heat-cell { aspect-ratio:1; border-radius:5px; display:grid; place-items:center; font-size:9.5px; font-weight:700; transition:transform .12s; }
.nv-heat-cell:hover { transform:scale(1.14); z-index:2; }
.nv-axis { font-size:10px; color:var(--muted); font-weight:700; letter-spacing:.4px; }

/* Funnel */
.nv-funnel-row { display:flex; align-items:center; gap:14px; padding:9px 0; }
.nv-funnel-label { width:190px; flex:none; font-size:12.8px; font-weight:700; color:var(--ink); }
.nv-funnel-bar { flex:1; height:34px; border-radius:9px; background:var(--raise); position:relative; overflow:hidden; }
.nv-funnel-fill { height:100%; border-radius:9px; display:flex; align-items:center; padding:0 11px; font-size:12px; font-weight:800; color:#04121B; transition:width .6s cubic-bezier(.22,1,.36,1); }
.nv-funnel-drop { width:96px; flex:none; text-align:right; font-size:12px; font-weight:800; }

/* Drawer */
.nv-scrim { position:fixed; inset:0; background:rgba(3,7,18,0.62); backdrop-filter:blur(3px); z-index:1000; display:flex; justify-content:flex-end; animation:nv-fade .18s ease; }
.nv-drawer {
  width:min(680px,100%); height:100%; overflow-y:auto; padding:22px;
  background:var(--bg); border-left:1px solid var(--border); box-shadow:-20px 0 60px rgba(0,0,0,0.5);
  animation:nv-slide .26s cubic-bezier(.22,1,.36,1);
}
@keyframes nv-fade { from { opacity:0; } to { opacity:1; } }
@keyframes nv-slide { from { transform:translateX(28px); opacity:.4; } to { transform:none; opacity:1; } }

.nv-rise { animation:nv-rise .34s cubic-bezier(.22,1,.36,1) both; }
@keyframes nv-rise { from { opacity:0; transform:translateY(9px); } to { opacity:1; transform:none; } }

.nv-legend { display:flex; flex-wrap:wrap; gap:14px; margin-top:12px; font-size:11.5px; color:var(--muted); }
.nv-legend i { width:9px; height:9px; border-radius:3px; display:inline-block; margin-right:6px; }

.nv-foot { margin-top:30px; font-size:11.5px; line-height:1.65; color:var(--muted); max-width:78ch; }

@media (prefers-reduced-motion: reduce) {
  .nv-root *, .nv-root *::before, .nv-root *::after {
    animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important;
  }
}
@media (max-width: 640px) {
  .nv-shell { padding:16px 13px 60px; }
  .nv-funnel-label { width:120px; font-size:11.5px; }
  .nv-funnel-drop { width:60px; font-size:11px; }
  .nv-stat-num { font-size:24px; }
}
`;
