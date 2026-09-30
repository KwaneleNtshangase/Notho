import { describe, expect, it } from "vitest";
import { parseLocale } from "@/i18n/locales";
import { translate } from "@/i18n/messages";
import { localizeContent } from "@/i18n/contentZu";

describe("isiZulu chrome Beta", () => {
  it("falls back to English for unknown values", () => {
    expect(parseLocale("xh")).toBe("en");
    expect(parseLocale("zu")).toBe("zu");
  });

  it("uses Yeqa okwamanje for skip", () => {
    expect(translate("zu", "common.skip")).toBe("Yeqa okwamanje");
    expect(translate("zu", "onboarding.skip")).toBe("Yeqa okwamanje");
  });

  it("localises Money Basics titles and leaves unknown lessons in English", () => {
    expect(localizeContent("zu", "course.money-basics", "Money Basics")).toBe("Izisekelo Zemali");
    expect(localizeContent("zu", "lesson.money-basics.lesson-1", "What is Money?")).toBe("Yini imali?");
    expect(localizeContent("zu", "lesson.investing-basics.lesson-2", "x")).toBe("Inzalo eyinhlanganisela");
    expect(localizeContent("zu", "lesson.re5-exam-prep.foo", "RE5 item")).toBe("RE5 item");
    expect(localizeContent("en", "course.money-basics", "Money Basics")).toBe("Money Basics");
  });
});
