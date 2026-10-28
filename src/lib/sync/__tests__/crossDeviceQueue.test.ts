import { beforeEach, describe, expect, it, vi } from "vitest";

// The queue talks to Supabase through RPCs. Replace the client with a stub so
// the test can drive the offline/online transition deliberately.
const rpc = vi.fn();
vi.mock("@/lib/supabaseClient", () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...a) } }));

import {
  clearQueue,
  enqueueCrossDeviceWrite,
  flushCrossDeviceQueue,
  readQueue,
} from "../crossDeviceQueue";
import type { LessonResume, PinnedCourses } from "../mergeRules";

// ── Minimal localStorage, the way the Capacitor WebView provides one ────────
class MemoryStorage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

const USER = "user-1";
const iso = (ms: number) => new Date(ms).toISOString();

beforeEach(() => {
  const storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
  rpc.mockReset();
});

const resume = (over: Partial<LessonResume> = {}): LessonResume => ({
  courseId: "money-basics",
  lessonId: "l1",
  stepIndex: 2,
  answers: {},
  correctCount: 1,
  mistakes: 0,
  masteredQids: [1],
  mistakenQids: [],
  savedAt: 1_000,
  ...over,
});

describe("durable queue", () => {
  it("writes to localStorage BEFORE any network call, so an app kill can't lose it", () => {
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["taxes"], updatedAt: iso(1000) } });
    expect(rpc).not.toHaveBeenCalled();
    expect(readQueue(USER)?.pins?.ids).toEqual(["taxes"]);
  });

  it("collapses repeated offline writes using the same rule the server applies", () => {
    // Three pins toggled in a tunnel. The queue must not grow unboundedly and
    // must not send a stale intermediate list — pins are LWW, so the newest
    // wins and the queue holds exactly one payload.
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["a"], updatedAt: iso(1000) } });
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["a", "b"], updatedAt: iso(2000) } });
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["b"], updatedAt: iso(3000) } });

    const q = readQueue(USER)!;
    expect(q.pins).toMatchObject({ ids: ["b"], updatedAt: iso(3000) });
  });

  it("keeps the never-go-backwards rule when two resume writes collapse", () => {
    enqueueCrossDeviceWrite(USER, { resume: resume({ stepIndex: 7, savedAt: 1_000 }) });
    enqueueCrossDeviceWrite(USER, { resume: resume({ stepIndex: 3, savedAt: 2_000 }) });
    const queued = readQueue(USER)!.resume as LessonResume;
    expect(queued.stepIndex).toBe(7);
    expect(queued.savedAt).toBe(2_000);
  });

  it("carries the adoption flag through a collapse", () => {
    // Losing `adopt` when two writes fold together would silently turn the
    // one-time rollout union back into a race.
    enqueueCrossDeviceWrite(USER, {
      pins: { ids: ["a"], updatedAt: iso(1000), adopt: true },
    });
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["a", "b"], updatedAt: iso(2000) } });
    expect(readQueue(USER)!.pins!.adopt).toBe(true);
  });

  it("keeps the largest review session queued for the day", () => {
    enqueueCrossDeviceWrite(USER, {
      reviewClaim: { day: "2026-08-21", cards: 3, correct: 2, weekKey: "notho-week-2026-08-16" },
    });
    enqueueCrossDeviceWrite(USER, {
      reviewClaim: { day: "2026-08-21", cards: 7, correct: 5, weekKey: "notho-week-2026-08-16" },
    });
    expect(readQueue(USER)!.reviewClaim).toMatchObject({ cards: 7, correct: 5 });
  });
});

describe("OFFLINE THEN RECONNECT", () => {
  it("replays every queued write once and adopts the server's answer", async () => {
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["taxes"], updatedAt: iso(2000) } });
    enqueueCrossDeviceWrite(USER, { resume: resume({ stepIndex: 4, savedAt: 2_000 }) });

    rpc.mockImplementation((fn: string) => {
      if (fn === "merge_pinned_courses") {
        return Promise.resolve({ data: { ids: ["taxes"], updatedAt: iso(2000) }, error: null });
      }
      return Promise.resolve({ data: { ok: true, resume: resume({ stepIndex: 4 }) }, error: null });
    });

    const res = await flushCrossDeviceQueue(USER);

    expect(rpc).toHaveBeenCalledTimes(2);
    expect((res!.pins as PinnedCourses).ids).toEqual(["taxes"]);
    // Queue is drained — a second flush must not re-send anything.
    expect(readQueue(USER)).toBeNull();
    await flushCrossDeviceQueue(USER);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("re-queues a payload whose RPC failed, and only that one", async () => {
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["taxes"], updatedAt: iso(2000) } });
    enqueueCrossDeviceWrite(USER, { resume: resume({ savedAt: 2_000 }) });

    rpc.mockImplementation((fn: string) =>
      fn === "merge_pinned_courses"
        ? Promise.resolve({ data: null, error: { message: "offline" } })
        : Promise.resolve({ data: { ok: true, resume: resume() }, error: null })
    );

    await flushCrossDeviceQueue(USER);

    const q = readQueue(USER)!;
    expect(q.pins?.ids).toEqual(["taxes"]); // still pending
    expect(q.resume).toBeUndefined();       // already delivered
  });

  it("merges a write made DURING a failed flush with the re-queued one", async () => {
    enqueueCrossDeviceWrite(USER, { pins: { ids: ["a"], updatedAt: iso(1000) } });
    rpc.mockImplementation(() => {
      // The user toggles another pin while the request is in flight.
      enqueueCrossDeviceWrite(USER, { pins: { ids: ["a", "b"], updatedAt: iso(5000) } });
      return Promise.resolve({ data: null, error: { message: "offline" } });
    });

    await flushCrossDeviceQueue(USER);

    // The newer in-flight edit must not be clobbered by the re-queued older one.
    expect(readQueue(USER)!.pins).toMatchObject({ ids: ["a", "b"], updatedAt: iso(5000) });
  });

  it("never sends the local-only steps array over the wire", async () => {
    enqueueCrossDeviceWrite(USER, {
      resume: { ...resume(), steps: [{ big: "payload" }, { big: "payload" }] },
    });
    rpc.mockResolvedValue({ data: { ok: true, resume: resume() }, error: null });

    await flushCrossDeviceQueue(USER);

    const sent = rpc.mock.calls[0][1] as { p_resume: Record<string, unknown> };
    expect(sent.p_resume.steps).toBeUndefined();
    expect(sent.p_resume.stepIndex).toBe(2);
  });

  it("reports an already-claimed review rather than paying twice", async () => {
    // The phone claimed today's review while this device was offline. When the
    // queued claim finally lands, the server rejects it and the caller learns
    // it has to re-read rather than keep its optimistic XP.
    enqueueCrossDeviceWrite(USER, {
      reviewClaim: { day: "2026-08-21", cards: 6, correct: 4, weekKey: "notho-week-2026-08-16" },
    });
    rpc.mockResolvedValue({ data: { ok: false, reason: "already_claimed" }, error: null });

    const res = await flushCrossDeviceQueue(USER);
    expect(res!.reviewClaimed).toEqual({ ok: false, alreadyClaimed: true, xpGranted: 0 });
    expect(readQueue(USER)).toBeNull();
  });

  it("does nothing at all when there is nothing queued", async () => {
    clearQueue(USER);
    expect(await flushCrossDeviceQueue(USER)).toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });
});
