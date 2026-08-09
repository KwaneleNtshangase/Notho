/**
 * usageTracking.ts
 *
 * Mirrors what PostHog sees into our own Postgres, so the admin dashboard can
 * answer "how long was this person in the app" and "which features did they
 * touch" per-user, live, without depending on PostHog's API or its retention
 * window. PostHog stays exactly as it is - this is a second sink, not a
 * replacement.
 *
 * Two things are recorded:
 *
 *   1. SESSION TIME - a heartbeat every 30s while the tab is visible AND the
 *      user has interacted recently. We deliberately measure ACTIVE time, not
 *      wall-clock: a tab left open overnight would otherwise report 9 hours of
 *      "engagement" and quietly poison every average on the dashboard.
 *
 *   2. FEATURE EVENTS - every analytics event, tagged with the product area it
 *      belongs to, buffered and flushed in batches so we never add a network
 *      round-trip to a user action.
 *
 * Everything here is fire-and-forget. A tracking failure must never surface to
 * a learner or block a lesson, so all paths swallow their errors.
 */

import { supabase } from "@/lib/supabaseClient";

// ── Tuning ───────────────────────────────────────────────────────────────────

/** How often we send a heartbeat while the user is active. */
const HEARTBEAT_MS = 30_000;
/** No interaction for this long and we stop counting time. */
const IDLE_MS = 60_000;
/** Gap after which we consider it a brand new session rather than a resume. */
const SESSION_GAP_MS = 30 * 60_000;
/** Feature events are flushed on this cadence... */
const FLUSH_MS = 5_000;
/** ...or as soon as this many pile up, whichever comes first. */
const FLUSH_AT = 15;
/** Hard cap on the buffer so a runaway loop can't eat memory. */
const MAX_BUFFER = 200;

const SESSION_KEY = "notho-usage-session";
const SESSION_TS_KEY = "notho-usage-session-ts";

// ── Event → feature area mapping ─────────────────────────────────────────────
// The dashboard groups by these, so keep the set small and stable. Adding a new
// analytics event without adding it here is harmless: inferFeature falls back
// to a prefix match, then to "other".

const FEATURE_BY_EVENT: Record<string, string> = {
  // Learn
  lesson_started: "learn",
  lesson_completed: "learn",
  lesson_abandoned: "learn",
  lesson_step_viewed: "learn",
  lesson_rated: "learn",
  wrong_answer: "learn",
  course_opened: "learn",
  course_completed: "learn",

  // Gamification
  badge_earned: "gamification",
  streak_updated: "gamification",
  streak_freeze_used: "gamification",
  streak_freeze_exhausted: "gamification",
  streak_broken: "gamification",
  weekly_challenge_completed: "gamification",
  daily_challenge_claimed: "gamification",

  // Budget
  budget_entry_added: "budget",
  budget_opened_post_lesson: "budget",
  savings_goal_set: "budget",
  expense_logged: "budget",

  // Calculator
  calculator_solve_mode_used: "calculator",
  calculator_result_shared: "calculator",

  // Investor profile quiz
  investor_quiz_completed: "quiz",

  // Growth / sharing
  share_triggered: "sharing",
  share_card_generated: "sharing",
  advisor_cta_shown: "advisor",
  advisor_cta_clicked: "advisor",

  // Onboarding + acquisition
  onboarding_started: "onboarding",
  onboarding_goal_selected: "onboarding",
  onboarding_profile_completed: "onboarding",
  signup_completed: "onboarding",

  // Monetisation
  paywall_shown: "monetisation",
  paywall_cta_clicked: "monetisation",
  checkout_started: "monetisation",
  subscription_converted: "monetisation",
  subscription_cancelled: "monetisation",

  // PWA install funnel
  pwa_install_prompt_shown: "pwa",
  pwa_installed: "pwa",
  pwa_install_dismissed: "pwa",

  // Retention instrumentation
  first_lesson_completed: "retention",
  retention_ping: "retention",
  content_impact_survey: "feedback",
};

/** Prefix fallbacks, checked in order, for events not listed above. */
const FEATURE_BY_PREFIX: [string, string][] = [
  ["lesson_", "learn"],
  ["course_", "learn"],
  ["budget_", "budget"],
  ["calculator_", "calculator"],
  ["coach_", "coach"],
  ["streak_", "gamification"],
  ["badge_", "gamification"],
  ["challenge_", "gamification"],
  ["onboarding_", "onboarding"],
  ["paywall_", "monetisation"],
  ["subscription_", "monetisation"],
  ["pwa_", "pwa"],
  ["share_", "sharing"],
];

export function inferFeature(event: string): string {
  const direct = FEATURE_BY_EVENT[event];
  if (direct) return direct;
  for (const [prefix, feature] of FEATURE_BY_PREFIX) {
    if (event.startsWith(prefix)) return feature;
  }
  if (event === "page_viewed") return "navigation";
  return "other";
}

// ── Props sanitising ─────────────────────────────────────────────────────────
// Guards against two failure modes: a huge payload bloating the table, and
// personal or financial detail leaking into an analytics store it has no
// business being in. Amounts are bucketed rather than dropped so the shape of
// the data survives without the values.

const SENSITIVE_KEYS = new Set([
  "email",
  "name",
  "fullname",
  "phone",
  "message",
  "text",
  "content",
  "description",
  "note",
  "answer",
  "password",
  "token",
]);

const AMOUNT_KEYS = new Set([
  "amount",
  "savingsamount",
  "principal",
  "monthly",
  "pricezar",
  "balance",
  "income",
]);

/** Buckets a rand value so we keep the distribution without the exact figure. */
function bucketAmount(n: number): string {
  const v = Math.abs(n);
  if (v === 0) return "0";
  if (v < 500) return "<500";
  if (v < 2_000) return "500-2k";
  if (v < 10_000) return "2k-10k";
  if (v < 50_000) return "10k-50k";
  if (v < 250_000) return "50k-250k";
  return "250k+";
}

export function sanitiseProps(
  props?: Record<string, unknown>
): Record<string, unknown> {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [key, value] of Object.entries(props)) {
    if (count >= 20) break;
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower)) continue;
    if (value == null) continue;

    if (typeof value === "number") {
      out[key] = AMOUNT_KEYS.has(lower) ? bucketAmount(value) : value;
    } else if (typeof value === "boolean") {
      out[key] = value;
    } else if (typeof value === "string") {
      out[key] = value.slice(0, 120);
    } else {
      continue;
    }
    count++;
  }
  return out;
}

// ── Session identity ─────────────────────────────────────────────────────────

function deviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua) || (w >= 768 && w < 1024)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua) || w < 768) return "mobile";
  return "desktop";
}

function isPwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Older Safari. Not cryptographically strong, but this is only a bucket key
    // and the server stamps the real user id regardless.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * Returns the current session id, starting a fresh one if there was no session
 * or the last one went quiet for longer than SESSION_GAP_MS. Stored in
 * sessionStorage so a page reload continues the same session but a new tab
 * starts its own.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const ts = Number(sessionStorage.getItem(SESSION_TS_KEY) ?? 0);
    if (existing && Date.now() - ts < SESSION_GAP_MS) {
      sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
      return existing;
    }
    const fresh = newId();
    sessionStorage.setItem(SESSION_KEY, fresh);
    sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
    return fresh;
  } catch {
    return newId();
  }
}

// ── Feature event buffer ─────────────────────────────────────────────────────

type BufferedEvent = {
  session_id: string;
  feature: string;
  event: string;
  props: Record<string, unknown>;
  occurred_at: string;
};

let buffer: BufferedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let cachedUserId: string | null = null;
let userIdChecked = false;

async function currentUserId(): Promise<string | null> {
  if (userIdChecked) return cachedUserId;
  try {
    const { data } = await supabase.auth.getUser();
    cachedUserId = data.user?.id ?? null;
  } catch {
    cachedUserId = null;
  }
  userIdChecked = true;
  return cachedUserId;
}

/** Called on sign-in/sign-out so we don't attribute events to a stale user. */
export function resetUsageIdentity(): void {
  cachedUserId = null;
  userIdChecked = false;
  buffer = [];
}

async function flush(useBeacon = false): Promise<void> {
  if (buffer.length === 0) return;
  const batch = buffer;
  buffer = [];

  const userId = await currentUserId();
  if (!userId) return; // Signed-out traffic stays in PostHog only.

  const rows = batch.map((e) => ({ ...e, user_id: userId }));

  // On pagehide the tab is being torn down and a normal fetch gets cancelled,
  // losing the tail of the session. `keepalive` tells the browser to finish the
  // request anyway. sendBeacon would also survive, but it cannot set an
  // Authorization header - and putting a JWT in the query string would leak it
  // into every proxy and access log between here and Supabase.
  if (useBeacon) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (url && key && token) {
        await fetch(`${url}/rest/v1/feature_events`, {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: key,
            Authorization: `Bearer ${token}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(rows),
        });
        return;
      }
    } catch {
      /* fall through to the normal path */
    }
  }

  try {
    await supabase.from("feature_events").insert(rows);
  } catch {
    /* dropped on purpose - analytics must never break the app */
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_MS);
}

/**
 * Records one feature event. Called automatically for every analytics event
 * via the mirror in src/lib/analytics.ts, so you rarely need to call it directly.
 */
export function recordFeatureEvent(
  event: string,
  props?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    if (buffer.length >= MAX_BUFFER) return;
    buffer.push({
      session_id: getSessionId(),
      feature: inferFeature(event),
      event,
      props: sanitiseProps(props),
      occurred_at: new Date().toISOString(),
    });
    if (buffer.length >= FLUSH_AT) void flush();
    else scheduleFlush();
  } catch {
    /* ignore */
  }
}

// ── Session heartbeat ────────────────────────────────────────────────────────

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let lastInteraction = Date.now();
let lastBeat = Date.now();
let currentRoute = "/";
let started = false;

function markInteraction(): void {
  lastInteraction = Date.now();
}

async function beat(force = false): Promise<void> {
  try {
    if (typeof document === "undefined") return;

    const now = Date.now();
    const visible = document.visibilityState === "visible";
    const active = now - lastInteraction < IDLE_MS;

    // Seconds since the last beat, but never more than one interval's worth -
    // a laptop waking from sleep would otherwise bank hours in one call. The
    // server clamps this again at 120s; this is the client-side half.
    const elapsed = Math.min(
      Math.round((now - lastBeat) / 1000),
      Math.round(HEARTBEAT_MS / 1000) * 2
    );
    lastBeat = now;

    if (!force && (!visible || !active)) return;
    if (elapsed <= 0) return;

    const userId = await currentUserId();
    if (!userId) return;

    await supabase.rpc("record_session_heartbeat", {
      p_session_id: getSessionId(),
      p_seconds: elapsed,
      p_route: currentRoute,
      p_device: deviceType(),
      p_is_pwa: isPwa(),
    });
  } catch {
    /* ignore */
  }
}

/** Tells the tracker which screen the user is on, for time-per-feature. */
export function setUsageRoute(route: string): void {
  currentRoute = route || "/";
}

/**
 * Starts session tracking. Idempotent - safe to call from a component that
 * remounts. Returns a teardown function.
 */
export function startUsageTracking(): () => void {
  if (typeof window === "undefined" || started) return () => {};
  started = true;

  lastInteraction = Date.now();
  lastBeat = Date.now();

  const events: (keyof WindowEventMap)[] = [
    "pointerdown",
    "keydown",
    "scroll",
    "touchstart",
    "mousemove",
  ];
  events.forEach((e) =>
    window.addEventListener(e, markInteraction, { passive: true })
  );

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      // Reset the clock on return so backgrounded time isn't back-credited.
      lastBeat = Date.now();
      lastInteraction = Date.now();
    } else {
      void beat(true);
      void flush();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onHide = () => {
    void beat(true);
    void flush(true);
  };
  window.addEventListener("pagehide", onHide);

  // Open the session immediately so a user who bounces in 10 seconds still
  // appears in the numbers.
  void beat(true);
  heartbeatTimer = setInterval(() => void beat(), HEARTBEAT_MS);

  return () => {
    started = false;
    events.forEach((e) => window.removeEventListener(e, markInteraction));
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onHide);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    void flush();
  };
}
