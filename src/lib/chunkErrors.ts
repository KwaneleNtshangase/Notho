/**
 * Detection and recovery policy for chunk-load failures.
 *
 * Next.js splits the app into hashed chunks and fetches them lazily during
 * client-side navigation. If one of those fetches fails, the router throws and
 * the whole tree unmounts into the error boundary — even though nothing in the
 * page's own code is wrong. The two ways it happens in production:
 *
 *   1. Version skew. A deploy lands while a tab is open. The in-memory runtime
 *      belongs to the old build; the RSC payload it navigates into belongs to
 *      the new one. One of the two references a chunk the other side no longer
 *      serves, and the fetch 404s.
 *   2. A dropped request. Mobile networks lose a request now and then, and a
 *      lazily-fetched chunk is just another request.
 *
 * Both are transient and both are fixed by a reload, which is why this file
 * exists: the boundary should do that itself instead of showing a crash screen
 * and asking the user to work out that "Try again" is the button that cannot
 * help them.
 */

/**
 * Chunk-load failures across the bundlers and browsers we serve.
 *
 * Turbopack (Next 16) says "Failed to load chunk X from module Y"; webpack says
 * "Loading chunk N failed" and tags the error `ChunkLoadError`. Safari and
 * Firefox phrase a failed `import()` differently again, and those arrive with no
 * useful `name`, so the message is all we have to go on.
 */
const CHUNK_ERROR_MESSAGE =
  /(failed to load chunk|loading chunk \S+ failed|loading css chunk|chunkloaderror|importing a module script failed|error loading dynamically imported module|failed to fetch dynamically imported module)/i;

/** True when this error is a failed chunk fetch rather than a real app bug. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: unknown; message?: unknown };
  if (typeof err.name === "string" && err.name === "ChunkLoadError") return true;
  const message = typeof err.message === "string" ? err.message : String(error);
  return CHUNK_ERROR_MESSAGE.test(message);
}

export const CHUNK_RELOAD_KEY = "notho:chunk-reload-at";

/**
 * How long an automatic reload suppresses the next one.
 *
 * The reload is only a fix when the failure was transient. If it wasn't — a
 * chunk genuinely missing from the deployment, say — reloading lands on the
 * same error, and without a cooldown the app would reload forever. Thirty
 * seconds is long enough that a second crash means the reload didn't work, and
 * short enough that a user who hits an unrelated chunk error later in the
 * session still gets the automatic recovery.
 */
export const CHUNK_RELOAD_COOLDOWN_MS = 30_000;

type ReloadStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Whether to reload now, recording the attempt so the next one is suppressed.
 *
 * Returns false when storage is unavailable (Safari private browsing throws on
 * write) — without somewhere to record the attempt there is no loop guard, and
 * showing the fallback UI is the safe failure.
 */
export function shouldAutoReload(
  storage: ReloadStorage | null | undefined,
  now: number = Date.now()
): boolean {
  if (!storage) return false;
  try {
    const last = Number(storage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Number.isFinite(last) && last > 0 && now - last < CHUNK_RELOAD_COOLDOWN_MS) {
      return false;
    }
    storage.setItem(CHUNK_RELOAD_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

/** sessionStorage if reachable, else null. Access alone throws in some browsers. */
export function safeSessionStorage(): ReloadStorage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}
