// Notho — Service Worker
// Push notifications + offline caching. Bump SW_VERSION when caching strategy changes.

const SW_VERSION = "6";
const STATIC_CACHE = `notho-static-${SW_VERSION}`;
const RUNTIME_CACHE = `notho-runtime-${SW_VERSION}`;
const CACHE_PREFIX = "notho-";
// The rebrand changed CACHE_PREFIX from "fundi-" to "notho-". The activate
// handler purges by prefix, so without this every existing user keeps a dead
// fundi-static-4 / fundi-runtime-4 pair forever. Not a correctness problem
// (the new worker never reads them) but it is orphaned storage on every
// installed client, and browsers evict per-origin under pressure.
// Safe to delete this line once installs have turned over.
const LEGACY_CACHE_PREFIXES = ["fundi-"];

// Offline fallbacks only — do NOT pre-cache "/" (stale app shell after deploy).
const PRECACHE = ["/manifest.json", "/notho-logo.png", "/notho-icon-192.png", "/favicon.ico"];

// Hashed chunks are immutable, so the only reason an entry leaves this cache is
// to stop it growing forever: every deploy mints new filenames and the old ones
// are dead weight. Keep a generous ceiling — the whole app is well under this,
// so in practice we only ever evict previous builds.
const STATIC_CACHE_MAX_ENTRIES = 240;

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

async function purgeNavigationEntries(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(
    keys.filter((r) => isNavigationRequest(r)).map((r) => cache.delete(r))
  );
}

// ── Install: pre-cache static assets (not HTML) ───────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {
        // Continue if offline at install time
      })
    )
  );
  // Wait for user confirmation via SKIP_WAITING — do not skipWaiting here.
});

// ── Activate: purge old caches + stale HTML, then claim clients ─────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
      const owned = (n) =>
        n.startsWith(CACHE_PREFIX) ||
        LEGACY_CACHE_PREFIXES.some((p) => n.startsWith(p));
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => owned(n) && !keep.has(n)).map((n) => caches.delete(n))
      );
      await purgeNavigationEntries(RUNTIME_CACHE);
      await self.clients.claim();
    })()
  );
});

// ── Client-triggered activation of a waiting worker ───────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetch, retrying once after a short pause.
 *
 * Only worth doing for immutable assets, where a repeat request is free of
 * side effects. Covers the common mobile case: the radio drops one request
 * during a handover and the next one succeeds immediately.
 */
async function fetchWithRetry(request, attempts = 2, delayMs = 300) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(request);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

/**
 * Evict the oldest entries once the static cache exceeds its ceiling.
 * cache.keys() resolves in insertion order, so the front of the list is the
 * least recently added — in practice, the previous deploy's chunks.
 */
async function trimStaticCache(cache) {
  try {
    const keys = await cache.keys();
    const excess = keys.length - STATIC_CACHE_MAX_ENTRIES;
    if (excess <= 0) return;
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
  } catch {
    // Eviction is housekeeping — never let it break a response.
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.url.includes("supabase.co")) return;

  const url = new URL(request.url);

  // Hashed build assets: cache-first (filename changes each deploy).
  //
  // These are lazily-loaded route chunks, so a failure here does not degrade
  // gracefully — it unmounts the React tree into the error boundary. On a phone
  // a single dropped request is enough. Hence the retry, and hence never
  // letting respondWith see a rejection: an unhandled rejection surfaces as an
  // opaque network error, where a real Response lets the boundary recognise a
  // chunk failure and reload itself.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetchWithRetry(request);
          if (response.ok) {
            await cache.put(request, response.clone());
            void trimStaticCache(cache);
          }
          return response;
        } catch {
          return new Response("", {
            status: 504,
            statusText: "Asset unavailable",
          });
        }
      })
    );
    return;
  }

  // App shell / HTML: network-first, bypass HTTP cache, offline fallback only.
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(
            new Request(request, { cache: "no-store" })
          );
          if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, response.clone());
          }
          return response;
        } catch {
          const cached =
            (await caches.match(request)) || (await caches.match("/"));
          if (cached) return cached;
          return Response.error();
        }
      })()
    );
    return;
  }

  // Other assets: stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then(async (response) => {
          if (response.ok) {
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "Notho", body: "You have a new notification!", url: "/" };
  try {
    data = event.data ? event.data.json() : data;
  } catch {
    data.body = event.data ? event.data.text() : data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/notho-logo.png",
      badge: "/notho-logo.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
      actions: data.actions || [],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
