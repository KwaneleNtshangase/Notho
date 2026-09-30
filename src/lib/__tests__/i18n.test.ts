import { describe, expect, it } from "vitest";
import { parseLocale } from "@/i18n/locales";
import { translate } from "@/i18n/messages";

describe("isiZulu chrome Beta",
  () => {
    it("falls back to English for unknown values", () => {
      expect(parseLocale("xh")).toBe("en");
      expect(parseLocale("zu")).toBe("zu");
    });

    it("uses frozen chrome strings", () => {
      expect(translate("zu", "nav.learn")).toBe("Funda");
      expect(translate("zu", "nav.budget")).toBe("Bhajethi");
      expect(translate("zu", "share.lessonDone")).toBe("Ngiqede isifundo saNotho.");
      expect(translate("zu", "settings.languageHint")).toBe(
        "Beta: amanye amagama aseseyi-English."
      );
      expect(translate("zu", "settings.languageZu")).toBe("isiZulu (Beta)");
    });

    it("uses frozen AuthGate chrome", () => {
      expect(translate("zu", "auth.login")).toBe("Ngena");
      expect(translate("zu", "auth.createAccount")).toBe("Vula i-akhawunti");
      expect(translate("zu", "auth.continueGoogle")).toBe("Vula i-akhawunti ngoGoogle");
      expect(translate("zu", "auth.continueFacebook")).toBe("Vula i-akhawunti ngoFacebook");
      expect(translate("zu", "auth.forgotPassword")).toBe("Ukhohlwe iphasiwedi?");
    });

    it("uses onboarding chrome", () => {
      expect(translate("zu", "onboarding.usernameTitle")).toBe("Khetha igama lokusebenza");
      expect(translate("zu", "onboarding.skip")).toBe("Yeqa okwamanje");
      expect(translate("zu", "onboarding.goal.debt-free")).toBe("Qeda isikweletu");
    });
  }
);
