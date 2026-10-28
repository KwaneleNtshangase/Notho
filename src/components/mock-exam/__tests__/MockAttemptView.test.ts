import { describe, expect, it } from "vitest";

import {
  formatMockTimer,
  isProtectedMockShortcut,
  mockQuestionStatus,
} from "@/components/mock-exam/MockAttemptView";

describe("mock-attempt presentation helpers", () => {
  it("distinguishes unseen, deliberately blank and answered questions", () => {
    expect(mockQuestionStatus({ viewed: false, answeredOptionId: null })).toBe(
      "unseen"
    );
    expect(mockQuestionStatus({ viewed: true, answeredOptionId: null })).toBe(
      "unanswered"
    );
    expect(
      mockQuestionStatus({
        viewed: true,
        answeredOptionId: "00000000-0000-4000-8000-000000000001",
      })
    ).toBe("answered");
  });

  it("formats and clamps the fixed timer", () => {
    expect(formatMockTimer(7_200)).toBe("02:00:00");
    expect(formatMockTimer(0)).toBe("00:00:00");
    expect(formatMockTimer(-1)).toBe("00:00:00");
  });

  it("blocks common transfer shortcuts only when modified", () => {
    expect(isProtectedMockShortcut({ key: "c", ctrlKey: true, metaKey: false })).toBe(
      true
    );
    expect(isProtectedMockShortcut({ key: "P", ctrlKey: false, metaKey: true })).toBe(
      true
    );
    expect(isProtectedMockShortcut({ key: "c", ctrlKey: false, metaKey: false })).toBe(
      false
    );
    expect(isProtectedMockShortcut({ key: "z", ctrlKey: true, metaKey: false })).toBe(
      false
    );
  });
});
