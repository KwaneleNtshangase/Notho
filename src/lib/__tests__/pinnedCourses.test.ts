import { describe, expect, it } from "vitest";
import {
  groupCourses,
  parsePinned,
  prunePinned,
  togglePinned,
} from "../pinnedCourses";

describe("parsePinned", () => {
  it("returns an empty list for null, empty, or malformed JSON", () => {
    expect(parsePinned(null)).toEqual([]);
    expect(parsePinned("")).toEqual([]);
    expect(parsePinned("{not json")).toEqual([]);
  });

  it("rejects non-array JSON rather than throwing", () => {
    expect(parsePinned('{"a":1}')).toEqual([]);
    expect(parsePinned('"money-basics"')).toEqual([]);
  });

  it("keeps order and drops duplicates, blanks, and non-strings", () => {
    expect(parsePinned('["taxes","money-basics","taxes",7,"","  ",null]')).toEqual([
      "taxes",
      "money-basics",
    ]);
  });

  it("trims surrounding whitespace", () => {
    expect(parsePinned('[" taxes "]')).toEqual(["taxes"]);
  });
});

describe("togglePinned", () => {
  it("appends a new pin to the end so earlier pins stay on top", () => {
    expect(togglePinned(["a", "b"], "c")).toEqual(["a", "b", "c"]);
  });

  it("removes an existing pin", () => {
    expect(togglePinned(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("does not mutate the input", () => {
    const input = ["a"];
    togglePinned(input, "b");
    expect(input).toEqual(["a"]);
  });

  it("ignores an empty course id", () => {
    expect(togglePinned(["a"], "")).toEqual(["a"]);
  });
});

describe("prunePinned", () => {
  it("drops pins for courses that no longer exist", () => {
    expect(prunePinned(["a", "gone", "b"], ["a", "b", "c"])).toEqual(["a", "b"]);
  });
});

describe("groupCourses", () => {
  type C = { id: string; done?: boolean; gated?: boolean };
  const group = (courses: C[], pinned: string[]) =>
    groupCourses(courses, {
      getId: (c) => c.id,
      isCompleted: (c) => Boolean(c.done),
      isAdvanced: (c) => Boolean(c.gated),
      pinned,
    });

  const courses: C[] = [
    { id: "basics" },
    { id: "budget", done: true },
    { id: "tax", gated: true },
    { id: "crypto", gated: true, done: true },
    { id: "debt" },
  ];

  it("splits into pinned / core / advanced / completed", () => {
    const g = group(courses, []);
    expect(g.pinned).toEqual([]);
    expect(g.core.map((c) => c.id)).toEqual(["basics", "debt"]);
    expect(g.advanced.map((c) => c.id)).toEqual(["tax"]);
    expect(g.completed.map((c) => c.id)).toEqual(["budget", "crypto"]);
  });

  it("pinning wins over completed and advanced", () => {
    const g = group(courses, ["budget", "tax"]);
    expect(g.pinned.map((c) => c.id)).toEqual(["budget", "tax"]);
    expect(g.completed.map((c) => c.id)).toEqual(["crypto"]);
    expect(g.advanced).toEqual([]);
    expect(g.core.map((c) => c.id)).toEqual(["basics", "debt"]);
  });

  it("orders the pinned section by pin order, not course order", () => {
    const g = group(courses, ["debt", "basics"]);
    expect(g.pinned.map((c) => c.id)).toEqual(["debt", "basics"]);
  });

  it("ignores pins for courses missing from the list (e.g. filtered by search)", () => {
    const g = group(courses, ["not-a-course", "debt"]);
    expect(g.pinned.map((c) => c.id)).toEqual(["debt"]);
  });

  it("never drops or duplicates a course across the four groups", () => {
    const g = group(courses, ["budget"]);
    const all = [...g.pinned, ...g.core, ...g.advanced, ...g.completed].map((c) => c.id);
    expect(all.slice().sort()).toEqual(courses.map((c) => c.id).slice().sort());
  });

  it("handles an empty course list", () => {
    const g = group([], ["a"]);
    expect(g).toEqual({ pinned: [], core: [], advanced: [], completed: [] });
  });
});
