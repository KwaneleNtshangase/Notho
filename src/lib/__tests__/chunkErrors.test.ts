import { describe, expect, it } from "vitest";
import {
  CHUNK_RELOAD_COOLDOWN_MS,
  CHUNK_RELOAD_KEY,
  isChunkLoadError,
  shouldAutoReload,
} from "@/lib/chunkErrors";

/** Minimal in-memory stand-in for sessionStorage. */
function memoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    read: (k: string) => map.get(k) ?? null,
  };
}

describe("isChunkLoadError", () => {
  it("matches the Turbopack message we saw in production", () => {
    // Verbatim from the 2026-08-03 report: /course/re5-exam-prep on iOS Safari.
    const err = new Error(
      "Failed to load chunk /_next/static/chunks/0ug8ois07ra15.js from module 64893"
    );
    expect(isChunkLoadError(err)).toBe(true);
  });

  it("matches webpack's message and its error name", () => {
    expect(isChunkLoadError(new Error("Loading chunk 472 failed."))).toBe(true);
    const named = new Error("something opaque");
    named.name = "ChunkLoadError";
    expect(isChunkLoadError(named)).toBe(true);
  });

  it("matches CSS chunk failures", () => {
    expect(isChunkLoadError(new Error("Loading CSS chunk 12 failed."))).toBe(true);
  });

  it("matches how Safari and Firefox phrase a failed dynamic import", () => {
    expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
    expect(
      isChunkLoadError(new Error("error loading dynamically imported module"))
    ).toBe(true);
    expect(
      isChunkLoadError(new Error("Failed to fetch dynamically imported module: /x.js"))
    ).toBe(true);
  });

  it("leaves real application errors alone", () => {
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError(new TypeError("x is not a function"))).toBe(false);
    // A lesson that happens to talk about chunking must not be swallowed.
    expect(isChunkLoadError(new Error("chunk size must be positive"))).toBe(false);
  });

  it("survives non-Error throws", () => {
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError("Failed to load chunk 3")).toBe(true);
    expect(isChunkLoadError({ message: 42 })).toBe(false);
  });
});

describe("shouldAutoReload", () => {
  it("allows the first reload and records when it happened", () => {
    const s = memoryStorage();
    expect(shouldAutoReload(s, 1_000_000)).toBe(true);
    expect(s.read(CHUNK_RELOAD_KEY)).toBe("1000000");
  });

  it("suppresses a second reload inside the cooldown", () => {
    const s = memoryStorage();
    const t0 = 1_000_000;
    expect(shouldAutoReload(s, t0)).toBe(true);
    expect(shouldAutoReload(s, t0 + 1)).toBe(false);
    expect(shouldAutoReload(s, t0 + CHUNK_RELOAD_COOLDOWN_MS - 1)).toBe(false);
  });

  it("allows another reload once the cooldown has elapsed", () => {
    const s = memoryStorage();
    const t0 = 1_000_000;
    shouldAutoReload(s, t0);
    expect(shouldAutoReload(s, t0 + CHUNK_RELOAD_COOLDOWN_MS)).toBe(true);
  });

  it("refuses when storage is unavailable, so the fallback UI shows instead", () => {
    expect(shouldAutoReload(null)).toBe(false);
    expect(shouldAutoReload(undefined)).toBe(false);
  });

  it("refuses when storage throws, rather than reloading without a loop guard", () => {
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {},
    };
    expect(shouldAutoReload(throwing)).toBe(false);
  });

  it("treats a corrupt stored value as no previous attempt", () => {
    const s = memoryStorage({ [CHUNK_RELOAD_KEY]: "not-a-number" });
    expect(shouldAutoReload(s, 1_000_000)).toBe(true);
  });
});
