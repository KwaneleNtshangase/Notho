import { describe, expect, it } from "vitest";
import { buildDedupeHash, assignDedupeHashes } from "../dedupe";
import { detectTransferPairs, applyTransferPairs } from "../transfers";
import type { PreviewTxn } from "../types";

function previewTxn(partial: Partial<PreviewTxn> & Pick<PreviewTxn, "id" | "amountZAR" | "date">): PreviewTxn {
  return {
    description: partial.description ?? "Test",
    rawMerchant: partial.rawMerchant ?? partial.description ?? "Test",
    lineIndex: 0,
    dedupeHash: partial.dedupeHash ?? "hash",
    categorisation: partial.categorisation ?? {
      category: "other",
      type: partial.amountZAR < 0 ? "expense" : "income",
      confidence: 0.5,
      source: "uncategorised",
    },
    ...partial,
  };
}

describe("detectTransferPairs", () => {
  it("flags matching debit/credit across two banks", () => {
    const rows: PreviewTxn[] = [
      previewTxn({
        id: "d1",
        amountZAR: -5000,
        date: "2026-06-10",
        description: "Transfer to savings",
        accountLabel: "FNB",
      }),
      previewTxn({
        id: "c1",
        amountZAR: 5000,
        date: "2026-06-11",
        description: "Transfer from FNB",
        accountLabel: "Capitec",
      }),
    ];
    const pairs = detectTransferPairs(rows);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].debitId).toBe("d1");
    expect(pairs[0].creditId).toBe("c1");
  });

  it("does not flag non-matching amounts", () => {
    const rows: PreviewTxn[] = [
      previewTxn({ id: "d1", amountZAR: -5000, date: "2026-06-10", accountLabel: "FNB" }),
      previewTxn({ id: "c1", amountZAR: 3000, date: "2026-06-10", accountLabel: "Capitec" }),
    ];
    expect(detectTransferPairs(rows)).toHaveLength(0);
  });

  it("does not flag same-bank pairs", () => {
    const rows: PreviewTxn[] = [
      previewTxn({ id: "d1", amountZAR: -100, date: "2026-06-10", accountLabel: "FNB" }),
      previewTxn({ id: "c1", amountZAR: 100, date: "2026-06-10", accountLabel: "FNB" }),
    ];
    expect(detectTransferPairs(rows)).toHaveLength(0);
  });

  it("does not flag dates more than 3 days apart", () => {
    const rows: PreviewTxn[] = [
      previewTxn({ id: "d1", amountZAR: -1000, date: "2026-06-01", accountLabel: "FNB", description: "transfer" }),
      previewTxn({ id: "c1", amountZAR: 1000, date: "2026-06-10", accountLabel: "Capitec", description: "transfer" }),
    ];
    expect(detectTransferPairs(rows)).toHaveLength(0);
  });

  it("does not pair an international fee with unrelated interest", () => {
    const rows: PreviewTxn[] = [
      previewTxn({
        id: "d1",
        amountZAR: -4.88,
        date: "2026-08-31",
        accountLabel: "Standard Bank",
        description: "#INTERNATIONAL TXN FEE",
      }),
      previewTxn({
        id: "c1",
        amountZAR: 5.47,
        date: "2026-08-31",
        accountLabel: "Capitec",
        description: "Interest Received",
      }),
    ];
    expect(detectTransferPairs(rows)).toHaveLength(0);
  });

  it("does not pair two small same-day amounts with no transfer wording", () => {
    const rows: PreviewTxn[] = [
      previewTxn({
        id: "d1",
        amountZAR: -100,
        date: "2026-08-24",
        accountLabel: "Standard Bank",
        description: "WOOLWORTHS CAPE",
      }),
      previewTxn({
        id: "c1",
        amountZAR: 100,
        date: "2026-08-24",
        accountLabel: "Capitec",
        description: "Payment Received: Ukuthula Sithole",
      }),
    ];
    expect(detectTransferPairs(rows)).toHaveLength(0);
  });
});

describe("applyTransferPairs", () => {
  it("marks confirmed pairs as isTransfer", () => {
    const rows: PreviewTxn[] = [
      previewTxn({ id: "d1", amountZAR: -500, date: "2026-06-01", accountLabel: "A" }),
      previewTxn({ id: "c1", amountZAR: 500, date: "2026-06-01", accountLabel: "B" }),
    ];
    const pairs = detectTransferPairs(
      rows.map((r) => ({ ...r, description: "transfer payment to account" }))
    );
    const updated = applyTransferPairs(rows, pairs, new Set(pairs[0] ? [pairs[0].pairId] : []));
    expect(updated.find((r) => r.id === "d1")?.isTransfer).toBe(true);
    expect(updated.find((r) => r.id === "c1")?.isTransfer).toBe(true);
  });
});

describe("dedupe with account labels", () => {
  it("distinct banks produce distinct hashes", () => {
    const base = {
      date: "2026-06-01",
      description: "TRANSFER",
      amountZAR: -500,
      rawMerchant: "TRANSFER",
      lineIndex: 0,
    };
    const fnb = buildDedupeHash({ ...base, accountLabel: "FNB" }, 1);
    const cap = buildDedupeHash({ ...base, accountLabel: "Capitec" }, 1);
    expect(fnb).not.toBe(cap);
  });

  it("multi-file merge assigns unique hashes per account", () => {
    const txns = [
      { date: "2026-06-01", description: "SHOP", amountZAR: -100, rawMerchant: "SHOP", lineIndex: 0, accountLabel: "FNB" },
      { date: "2026-06-01", description: "SHOP", amountZAR: -100, rawMerchant: "SHOP", lineIndex: 0, accountLabel: "Capitec" },
    ];
    const hashes = assignDedupeHashes(txns);
    expect(hashes[0]).not.toBe(hashes[1]);
  });
});
