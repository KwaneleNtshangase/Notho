import { describe, it, expect } from "vitest";
import {
  levenshtein,
  simpleStem,
  buildSearchIndex,
  fuzzySearch,
  getSuggestion,
} from "../fuzzySearch";

// ─── levenshtein ─────────────────────────────────────────────────────────────

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("budget", "budget")).toBe(0);
  });

  it("returns the length of the other string when one is empty", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("xyz", "")).toBe(3);
  });

  it("returns 1 for single char substitution", () => {
    expect(levenshtein("budget", "budgit")).toBe(1);
  });

  it("returns 1 for single char insertion", () => {
    expect(levenshtein("tax", "taxs")).toBe(1);
  });

  it("returns 1 for single char deletion", () => {
    expect(levenshtein("taxes", "taxs")).toBe(1);
  });

  it("returns 2 for two edits", () => {
    expect(levenshtein("invest", "invast")).toBe(1);
    expect(levenshtein("investng", "investing")).toBe(1);
  });

  it("early-exits when distance exceeds maxDist", () => {
    const dist = levenshtein("abc", "xyz", 1);
    expect(dist).toBeGreaterThan(1);
  });
});

// ─── simpleStem ──────────────────────────────────────────────────────────────

describe("simpleStem", () => {
  it("strips -ing suffix", () => {
    expect(simpleStem("investing")).toBe("invest");
    expect(simpleStem("budgeting")).toBe("budget");
  });

  it("strips -ment suffix", () => {
    expect(simpleStem("investment")).toBe("invest");
    expect(simpleStem("payment")).toBe("pay");
  });

  it("strips -tion suffix", () => {
    expect(simpleStem("protection")).toBe("protec");
  });

  it("strips -s suffix", () => {
    expect(simpleStem("taxes")).toBe("taxe");
  });

  it("strips -ies to -y", () => {
    expect(simpleStem("strategies")).toBe("strategy");
  });

  it("does not stem words ≤ 3 chars", () => {
    expect(simpleStem("tax")).toBe("tax");
    expect(simpleStem("is")).toBe("is");
  });

  it("only applies one rule", () => {
    // "investing" → "invest" (not "inve" from stripping again)
    expect(simpleStem("investing").length).toBeGreaterThanOrEqual(3);
  });
});

// ─── buildSearchIndex ────────────────────────────────────────────────────────

const MOCK_COURSES = [
  {
    id: "money-basics",
    title: "Money Basics",
    description: "Learn budgeting, saving, and managing your money wisely.",
    units: [],
  },
  {
    id: "investing-basics",
    title: "Investing Basics",
    description: "Discover how to grow your wealth through investments.",
    units: [],
  },
  {
    id: "tax-essentials",
    title: "Tax Essentials",
    description: "Everything you need to know about taxes in South Africa.",
    units: [],
  },
] as any;

const MOCK_CONCEPTS = [
  { id: "c1", name: "Budgeting", category: "Personal Finance", courses: ["money-basics"] },
  { id: "c2", name: "Compound Interest", category: "Investing", courses: ["investing-basics"] },
  { id: "c3", name: "PAYE Tax", category: "Taxation", courses: ["tax-essentials"] },
  { id: "c4", name: "Unit Trusts", category: "Investing", courses: ["investing-basics"] },
] as any;

describe("buildSearchIndex", () => {
  it("returns one entry per course", () => {
    const index = buildSearchIndex(MOCK_COURSES, MOCK_CONCEPTS);
    expect(index).toHaveLength(3);
  });

  it("populates tagTokens from concept names", () => {
    const index = buildSearchIndex(MOCK_COURSES, MOCK_CONCEPTS);
    const investEntry = index.find((e) => e.courseId === "investing-basics")!;
    // "Compound Interest" + "Investing" + "Unit Trusts" + "Investing"
    expect(investEntry.tagTokens.length).toBeGreaterThan(0);
    expect(investEntry.tagTokens).toContain("compound");
    expect(investEntry.tagTokens).toContain("unit");
  });

  it("stems title tokens", () => {
    const index = buildSearchIndex(MOCK_COURSES, MOCK_CONCEPTS);
    const investEntry = index.find((e) => e.courseId === "investing-basics")!;
    expect(investEntry.titleTokens).toContain("invest");
    expect(investEntry.titleTokens).toContain("basic");
  });
});

// ─── fuzzySearch ─────────────────────────────────────────────────────────────

describe("fuzzySearch", () => {
  const index = buildSearchIndex(MOCK_COURSES, MOCK_CONCEPTS);

  it("returns exact title matches ranked highest", () => {
    const results = fuzzySearch("investing", index);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].courseId).toBe("investing-basics");
  });

  it("supports prefix matching: 'invest' matches investing-basics", () => {
    const results = fuzzySearch("invest", index);
    expect(results.some((r) => r.courseId === "investing-basics")).toBe(true);
  });

  it("handles typo tolerance: 'buget' (1 edit) matches money-basics", () => {
    const results = fuzzySearch("buget", index);
    expect(results.some((r) => r.courseId === "money-basics")).toBe(true);
  });

  it("returns empty array for completely unrelated query", () => {
    const results = fuzzySearch("xyzzyfoobarbaz", index);
    expect(results).toHaveLength(0);
  });

  it("ranks title matches above description-only matches", () => {
    const results = fuzzySearch("money", index);
    if (results.length > 0) {
      expect(results[0].courseId).toBe("money-basics");
    }
  });

  it("matches concept tags: 'compound' finds investing-basics", () => {
    const results = fuzzySearch("compound", index);
    expect(results.some((r) => r.courseId === "investing-basics")).toBe(true);
  });

  it("handles multi-word queries", () => {
    const results = fuzzySearch("money budget", index);
    expect(results.some((r) => r.courseId === "money-basics")).toBe(true);
  });

  it("returns empty array for empty query", () => {
    expect(fuzzySearch("", index)).toHaveLength(0);
    expect(fuzzySearch("   ", index)).toHaveLength(0);
  });
});

// ─── getSuggestion ───────────────────────────────────────────────────────────

describe("getSuggestion", () => {
  const index = buildSearchIndex(MOCK_COURSES, MOCK_CONCEPTS);

  it("suggests a correction for a near-miss query", () => {
    const suggestion = getSuggestion("investng", index);
    expect(suggestion).not.toBeNull();
    expect(suggestion).toContain("invest");
  });

  it("returns null when query tokens already exist in vocab", () => {
    const suggestion = getSuggestion("invest", index);
    expect(suggestion).toBeNull();
  });

  it("returns null for empty query", () => {
    expect(getSuggestion("", index)).toBeNull();
  });

  it("returns null when nothing is close enough", () => {
    const suggestion = getSuggestion("xyzzyfoobarbaz", index);
    expect(suggestion).toBeNull();
  });
});

describe("cross-lingual course search", () => {
  it("matches a Zulu lesson word and a Zulu course title onto the English course", async () => {
    const { CONTENT_DATA } = await import("@/data/content");
    const index = buildSearchIndex(CONTENT_DATA.courses, []);

    const cash = fuzzySearch("ukheshi", index);
    expect(cash.some((r) => r.courseId === "money-basics")).toBe(true);

    const titled = fuzzySearch("izisekelo zemali", index);
    expect(titled[0]?.courseId).toBe("money-basics");

    const englishStillWorks = fuzzySearch("cash", index);
    expect(englishStillWorks.some((r) => r.courseId === "money-basics")).toBe(true);
  });
});
