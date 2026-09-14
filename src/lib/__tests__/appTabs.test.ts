import { describe, expect, it } from "vitest";
import {
  hrefForRouteName,
  isAppTabPath,
  normalizeTabPath,
  tabKeyFromHref,
  tabKeyFromPath,
} from "../appTabs";

describe("appTabs", () => {
  it("treats the five bottom-nav roots as tab paths", () => {
    expect(isAppTabPath("/")).toBe(true);
    expect(isAppTabPath("/learn")).toBe(true);
    expect(isAppTabPath("/calculator")).toBe(true);
    expect(isAppTabPath("/budget")).toBe(true);
    expect(isAppTabPath("/quests")).toBe(true);
    expect(isAppTabPath("/profile")).toBe(true);
  });

  it("does not treat stacked routes as main tabs", () => {
    expect(isAppTabPath("/course/investing-basics")).toBe(false);
    expect(isAppTabPath("/lesson/investing-basics/lesson-1")).toBe(false);
    expect(isAppTabPath("/settings")).toBe(false);
    expect(isAppTabPath("/leaderboard")).toBe(false);
  });

  it("normalises aliases onto a tab href", () => {
    expect(normalizeTabPath("/")).toBe("/learn");
    expect(normalizeTabPath("/learn")).toBe("/learn");
    expect(normalizeTabPath("/calculator")).toBe("/calculator");
    expect(normalizeTabPath("/profile")).toBe("/profile");
  });

  it("maps a path or href to the nav key used by the lens", () => {
    expect(tabKeyFromPath("/course/x")).toBe("learn");
    expect(tabKeyFromPath("/calculator")).toBe("calculator");
    expect(tabKeyFromPath("/quests")).toBe("quests");
    expect(tabKeyFromHref("/budget")).toBe("budget");
    expect(tabKeyFromHref("/leaderboard")).toBe(null);
  });

  it("maps route names used by setRoute", () => {
    expect(hrefForRouteName("learn")).toBe("/learn");
    expect(hrefForRouteName("quests")).toBe("/quests");
    expect(hrefForRouteName("lesson")).toBe(null);
  });
});
