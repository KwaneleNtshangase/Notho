import { describe, expect, it } from "vitest";
import { translate } from "@/i18n/messages";
import { localizeContent } from "@/i18n/contentZu";
import { localizeString } from "@/i18n/stringZu";

describe("isiZulu corrections", () => {
  it("uses preferred chrome", () => {
    expect(translate("zu", "common.next")).toBe("Okulandelayo");
    expect(translate("zu", "common.skip")).toBe("Yeqa okwamanje");
    expect(translate("zu", "lesson.backToCourse")).toBe("Buyela kwikhosi");
  });

  it("uses preferred shopping title and money lesson copy", () => {
    expect(localizeContent("zu", "unit.money-basics.unit-2", "Smart Shopping")).toBe(
      "Ukuthenga okuhlakaniphile"
    );
    expect(localizeString("zu", "Money is More Than Cash")).toBe("Imali akuyona nje ukheshi");
    expect(localizeString("zu", "Not translated yet")).toBe("Not translated yet");
  });
});
