import { describe, expect, it } from "vitest";
import {
  AXIS_LOCK_PX,
  canSwipeBack,
  classifyGesture,
  courseIdFromPath,
  isTabRoot,
  normalizePathname,
  pullProgress,
  startedFromLeftEdge,
  swipeProgress,
} from "../appGestures";

describe("isTabRoot / canSwipeBack", () => {
  it("treats the five bottom-nav destinations (and /) as roots", () => {
    for (const path of ["/", "/learn", "/budget", "/calculator", "/quests", "/profile"]) {
      expect(isTabRoot(path)).toBe(true);
      expect(canSwipeBack(path)).toBe(false);
    }
  });

  it("allows swipe-back on nested screens", () => {
    for (const path of [
      "/course/money-basics",
      "/lesson/money-basics/l2",
      "/settings",
      "/leaderboard",
      "/re5-readiness",
    ]) {
      expect(canSwipeBack(path)).toBe(true);
    }
  });

  it("strips a trailing slash so /learn/ is still a tab root", () => {
    expect(normalizePathname("/learn/")).toBe("/learn");
    expect(isTabRoot("/learn/")).toBe(true);
  });
});

describe("classifyGesture", () => {
  const start = { startX: 12, startY: 80, currentX: 12, currentY: 80 };

  it("stays idle until the finger has moved enough to lock an axis", () => {
    expect(
      classifyGesture({
        ...start,
        currentX: 12 + AXIS_LOCK_PX - 1,
        currentY: 80,
        atScrollTop: true,
        fromLeftEdge: true,
      })
    ).toBe("none");
  });

  it("locks swipe-back for a rightward edge swipe", () => {
    expect(
      classifyGesture({
        ...start,
        currentX: 90,
        currentY: 84,
        atScrollTop: true,
        fromLeftEdge: true,
      })
    ).toBe("swipe-back");
  });

  it("does not steal a scroll that started away from the left edge", () => {
    expect(
      classifyGesture({
        startX: 120,
        startY: 80,
        currentX: 200,
        currentY: 84,
        atScrollTop: true,
        fromLeftEdge: false,
      })
    ).toBe("none");
  });

  it("locks pull-refresh for a downward pull at the top of the list", () => {
    expect(
      classifyGesture({
        startX: 160,
        startY: 20,
        currentX: 162,
        currentY: 110,
        atScrollTop: true,
        fromLeftEdge: false,
      })
    ).toBe("pull-refresh");
  });

  it("does not pull-to-refresh when the list is already scrolled", () => {
    expect(
      classifyGesture({
        startX: 160,
        startY: 20,
        currentX: 162,
        currentY: 110,
        atScrollTop: false,
        fromLeftEdge: false,
      })
    ).toBe("none");
  });
});

describe("progress helpers", () => {
  it("clamps swipe and pull progress to 0..1", () => {
    expect(swipeProgress(-10)).toBe(0);
    expect(swipeProgress(36, 72)).toBe(0.5);
    expect(swipeProgress(200, 72)).toBe(1);
    expect(pullProgress(0)).toBe(0);
    expect(pullProgress(68, 68)).toBe(1);
  });

  it("treats the left 28px as the back-gesture edge", () => {
    expect(startedFromLeftEdge(0)).toBe(true);
    expect(startedFromLeftEdge(28)).toBe(true);
    expect(startedFromLeftEdge(29)).toBe(false);
  });
});

describe("courseIdFromPath", () => {
  it("reads the course id from course and lesson URLs", () => {
    expect(courseIdFromPath("/course/money-basics")).toBe("money-basics");
    expect(courseIdFromPath("/lesson/money-basics/l2")).toBe("money-basics");
    expect(courseIdFromPath("/learn")).toBeNull();
  });
});
