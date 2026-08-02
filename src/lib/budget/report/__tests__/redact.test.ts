import { describe, it, expect } from "vitest";
import {
  isKnownBusiness,
  redactReportModel,
  countRedacted,
  redactionKey,
} from "../redact";
import type { ReportModel, MerchantInsight, RecurringCommitment, LargestTxn } from "../types";

/** Only the three lists redaction touches; everything else is irrelevant here. */
function modelOf(parts: {
  recurring?: Partial<RecurringCommitment>[];
  merchants?: Partial<MerchantInsight>[];
  largest?: Partial<LargestTxn>[];
}): ReportModel {
  return {
    recurringCommitments: (parts.recurring ?? []).map((r) => ({
      description: "", categoryName: "Other", group: "needs", typicalCents: 0,
      count: 3, totalCents: 0, monthsSeen: 3, ...r,
    })),
    topMerchants: (parts.merchants ?? []).map((m) => ({
      description: "", totalCents: 0, count: 1, categoryName: "Other", ...m,
    })),
    largestTransactions: (parts.largest ?? []).map((t) => ({
      description: "", category: "other", categoryName: "Other", cents: 0,
      date: "2026-07-01", ...t,
    })),
  } as unknown as ReportModel;
}

describe("isKnownBusiness", () => {
  it.each([
    "Checkers Sixty60", "Woolworths", "Pick n Pay", "Shoprite", "Vodacom",
    "Netflix", "DStv", "Eskom", "Uber", "Clicks", "Engen",
  ])("shows the known SA merchant %s", (name) => {
    expect(isKnownBusiness(name)).toBe(true);
  });

  it.each([
    "Kagiso Trading (Pty) Ltd", "Sizwe Holdings", "Ndlovu CC",
    "City of Cape Town", "Groote Schuur Hospital",
  ])("shows the registered entity %s", (name) => {
    expect(isKnownBusiness(name)).toBe(true);
  });

  it.each([
    "Mama Coka Imizamo", "Samke", "Thabo Nkosi", "Nomsa", "Sipho M",
  ])("hides the private individual %s", (name) => {
    expect(isKnownBusiness(name)).toBe(false);
  });

  it("hides a name ending in Group - a stokvel is often named exactly that", () => {
    expect(isKnownBusiness("Dalitso Group")).toBe(false);
  });

  it("hides names ending in Trust or Fund for the same reason", () => {
    expect(isKnownBusiness("Khumalo Family Trust")).toBe(false);
    expect(isKnownBusiness("Sibanda Fund")).toBe(false);
  });

  it("leaves non-identifying placeholders alone", () => {
    expect(isKnownBusiness("Unlabelled")).toBe(true);
    expect(isKnownBusiness("Cash")).toBe(true);
  });

  it("treats an empty name as unsafe", () => {
    expect(isKnownBusiness("")).toBe(false);
    expect(isKnownBusiness("   ")).toBe(false);
  });
});

describe("redactionKey", () => {
  it("matches the same counterparty across the two truncation lengths", () => {
    expect(redactionKey("Mama Coka Imizamo Trust Fu…")).toBe(
      redactionKey("mama coka imizamo trust fu")
    );
  });
});

describe("redactReportModel", () => {
  it("replaces a person with their category and a letter", () => {
    const out = redactReportModel(
      modelOf({ merchants: [{ description: "Mama Coka", categoryName: "Housing/Rent" }] })
    );
    expect(out.topMerchants[0].description).toBe("Housing/Rent · person A");
  });

  it("leaves a known business untouched", () => {
    const out = redactReportModel(
      modelOf({ merchants: [{ description: "Checkers Sixty60", categoryName: "Food & Groceries" }] })
    );
    expect(out.topMerchants[0].description).toBe("Checkers Sixty60");
  });

  it("gives the same person the same letter across all three lists", () => {
    const out = redactReportModel(
      modelOf({
        recurring: [{ description: "Mama Coka", categoryName: "Housing/Rent" }],
        merchants: [{ description: "Mama Coka", categoryName: "Housing/Rent" }],
        largest: [{ description: "Mama Coka", categoryName: "Housing/Rent" }],
      })
    );
    expect(out.recurringCommitments[0].description).toBe("Housing/Rent · person A");
    expect(out.topMerchants[0].description).toBe("Housing/Rent · person A");
    expect(out.largestTransactions[0].description).toBe("Housing/Rent · person A");
  });

  it("keeps two different people distinguishable", () => {
    const out = redactReportModel(
      modelOf({
        merchants: [
          { description: "Mama Coka", categoryName: "Housing/Rent" },
          { description: "Samke", categoryName: "Housing/Rent" },
        ],
      })
    );
    expect(out.topMerchants[0].description).toBe("Housing/Rent · person A");
    expect(out.topMerchants[1].description).toBe("Housing/Rent · person B");
  });

  it("labels an uncategorised counterparty without saying Other", () => {
    const out = redactReportModel(
      modelOf({ merchants: [{ description: "Samke", categoryName: "Other" }] })
    );
    expect(out.topMerchants[0].description).toBe("Uncategorised · person A");
  });

  it("never invents a category when aggregate could not agree on one", () => {
    // Aggregate sends "" for a merchant whose transactions span categories.
    // Saying "Uncategorised" is correct; naming any single category would be
    // relabelling the user's own categorisation inside a shared document.
    const out = redactReportModel(
      modelOf({ merchants: [{ description: "Samke", categoryName: "" }] })
    );
    expect(out.topMerchants[0].description).toBe("Uncategorised · person A");
  });

  it("uses the exact category the user assigned, verbatim", () => {
    const out = redactReportModel(
      modelOf({ merchants: [{ description: "Samke", categoryName: "Housing/Rent" }] })
    );
    expect(out.topMerchants[0].description).toContain("Housing/Rent");
    expect(out.topMerchants[0].description).not.toContain("Food");
  });

  it("never alters any amount, count or date", () => {
    const model = modelOf({
      merchants: [{ description: "Samke", totalCents: 220000, count: 4 }],
      largest: [{ description: "Nomsa", cents: 450000, date: "2026-07-14" }],
    });
    const out = redactReportModel(model);
    expect(out.topMerchants[0].totalCents).toBe(220000);
    expect(out.topMerchants[0].count).toBe(4);
    expect(out.largestTransactions[0].cents).toBe(450000);
    expect(out.largestTransactions[0].date).toBe("2026-07-14");
  });

  it("does not mutate the model it was given", () => {
    const model = modelOf({ merchants: [{ description: "Samke" }] });
    redactReportModel(model);
    expect(model.topMerchants[0].description).toBe("Samke");
  });

  it("is deterministic - two runs produce identical output", () => {
    const model = modelOf({
      merchants: [{ description: "Samke" }, { description: "Nomsa" }, { description: "Checkers" }],
    });
    const a = redactReportModel(model).topMerchants.map((m) => m.description);
    const b = redactReportModel(model).topMerchants.map((m) => m.description);
    expect(a).toEqual(b);
  });

  it("rolls past Z into AA rather than repeating a letter", () => {
    const merchants = Array.from({ length: 28 }, (_, i) => ({ description: `Person Number ${i}` }));
    const out = redactReportModel(modelOf({ merchants }));
    const labels = out.topMerchants.map((m) => m.description);
    expect(labels[25]).toContain("person Z");
    expect(labels[26]).toContain("person AA");
    expect(labels[27]).toContain("person AB");
    expect(new Set(labels).size).toBe(28);
  });
});

describe("countRedacted", () => {
  it("counts distinct people, not rows", () => {
    const model = modelOf({
      recurring: [{ description: "Mama Coka" }],
      merchants: [{ description: "Mama Coka" }, { description: "Samke" }, { description: "Woolworths" }],
      largest: [{ description: "Samke" }],
    });
    expect(countRedacted(model)).toBe(2);
  });

  it("is zero when every counterparty is a business", () => {
    const model = modelOf({ merchants: [{ description: "Woolworths" }, { description: "Vodacom" }] });
    expect(countRedacted(model)).toBe(0);
  });
});
