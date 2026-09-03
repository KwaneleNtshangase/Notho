import { afterEach, describe, expect, it } from "vitest";
import {
  COURSE_FOCUS_KEY,
  SCROLL_STORAGE_PREFIX,
  consumeCourseFocus,
  hasMeaningfulScroll,
  markCourseFocus,
  readScroll,
  scrollStorageKey,
  writeScroll,
} from "../scrollMemory";

afterEach(() => {
  try {
    sessionStorage.clear();
  } catch {
    /* jsdom always has it */
  }
});

describe("scrollStorageKey", () => {
  it("namespaces by pathname so Learn and a course do not share a snapshot", () => {
    expect(scrollStorageKey("/learn")).toBe(`${SCROLL_STORAGE_PREFIX}/learn`);
    expect(scrollStorageKey("/course/money-basics")).toBe(
      `${SCROLL_STORAGE_PREFIX}/course/money-basics`
    );
  });
});

describe("writeScroll / readScroll", () => {
  it("round-trips a snapshot", () => {
    writeScroll("/learn", { windowY: 420, mainY: 16 });
    expect(readScroll("/learn")).toEqual({ windowY: 420, mainY: 16 });
  });

  it("does not leak one path's scroll onto another", () => {
    writeScroll("/learn", { windowY: 200, mainY: 0 });
    expect(readScroll("/course/money-basics")).toBeNull();
  });

  it("returns null for missing or garbage values", () => {
    expect(readScroll("/learn")).toBeNull();
    sessionStorage.setItem(scrollStorageKey("/learn"), "not-json");
    expect(readScroll("/learn")).toBeNull();
    sessionStorage.setItem(scrollStorageKey("/learn"), '{"windowY":"x"}');
    expect(readScroll("/learn")).toBeNull();
  });

  it("clamps negatives so a restore cannot hide the top of the page", () => {
    writeScroll("/learn", { windowY: -40, mainY: -8 });
    expect(readScroll("/learn")).toEqual({ windowY: 0, mainY: 0 });
  });
});

describe("hasMeaningfulScroll", () => {
  it("treats a missing or near-zero snapshot as no memory", () => {
    expect(hasMeaningfulScroll(null)).toBe(false);
    expect(hasMeaningfulScroll({ windowY: 0, mainY: 0 })).toBe(false);
    expect(hasMeaningfulScroll({ windowY: 4, mainY: 3 })).toBe(false);
  });

  it("treats a real offset as memory worth restoring", () => {
    expect(hasMeaningfulScroll({ windowY: 9, mainY: 0 })).toBe(true);
    expect(hasMeaningfulScroll({ windowY: 0, mainY: 80 })).toBe(true);
  });
});

describe("course focus flag", () => {
  it("is consumed once, and only for the course that set it", () => {
    markCourseFocus("money-basics");
    expect(sessionStorage.getItem(COURSE_FOCUS_KEY)).toBe("money-basics");
    expect(consumeCourseFocus("taxes")).toBe(false);
    expect(consumeCourseFocus("money-basics")).toBe(true);
    expect(consumeCourseFocus("money-basics")).toBe(false);
  });
});
