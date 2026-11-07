import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BudgetImportPanel, type BudgetImportPreviewSeed } from "@/components/BudgetImportPanel";
import { detectTransferPairs } from "../transfers";
import { parseCsvStatement } from "../parsers/csv";
import type { PreviewTxn } from "../types";
import {
  syntheticChequeStatement,
  syntheticCreditStatement,
  syntheticSavingsStatement,
} from "./syntheticStatements";

function previewFromCsv(fileName: string, accountLabel: string, csv: string): {
  meta: BudgetImportPreviewSeed["metas"][number];
  rows: PreviewTxn[];
} {
  const parsed = parseCsvStatement(csv);
  const rows: PreviewTxn[] = parsed.transactions.map((txn, index) => ({
    ...txn,
    id: `preview-${fileName}-${index}`,
    accountLabel,
    sourceFileName: fileName,
    dedupeHash: `${fileName}-${index}`,
    categorisation: {
      category: txn.amountZAR < 0 ? "other" : "other-income",
      type: txn.amountZAR < 0 ? "expense" : "income",
      confidence: 0.5,
      source: "uncategorised",
    },
  }));
  return {
    meta: {
      fileName,
      accountLabel,
      bankHint: parsed.bankHint,
      fileType: parsed.fileType,
      reconciliation: parsed.reconciliation,
    },
    rows,
  };
}

function seedFor(parts: ReturnType<typeof previewFromCsv>[]): BudgetImportPreviewSeed {
  return {
    metas: parts.map((part) => part.meta),
    rows: parts.flatMap((part) => part.rows),
  };
}

function renderPreview(seed: BudgetImportPreviewSeed): string {
  return renderToStaticMarkup(
    React.createElement(BudgetImportPanel, {
      onImported: () => {},
      previewSeed: seed,
    })
  );
}

function between(html: string, startMarker: string, endMarker: string): string {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return html.slice(start, end);
}

describe("statement import preview scroll structure", () => {
  const cheque = previewFromCsv("synthetic-cheque.csv", "Cheque", syntheticChequeStatement());
  const savings = previewFromCsv("synthetic-savings.csv", "Savings", syntheticSavingsStatement());
  const credit = previewFromCsv("synthetic-credit.csv", "Credit", syntheticCreditStatement());

  it("parses the synthetic statements into distinct accounts and transfer pairs", () => {
    expect(cheque.rows.length).toBeGreaterThan(20);
    expect(savings.rows.length).toBeGreaterThan(15);
    expect(credit.rows.length).toBeGreaterThan(5);
    const pairs = detectTransferPairs([...cheque.rows, ...savings.rows, ...credit.rows]);
    expect(pairs.length).toBe(12);
    expect(new Set(pairs.flatMap((pair) => [pair.debitAccount, pair.creditAccount]))).toEqual(
      new Set(["Cheque", "Savings"])
    );
  });

  it("keeps multi-account transfers, banners and rows in the scrollport and actions outside it", () => {
    const html = renderPreview(seedFor([cheque, savings, credit]));
    const scroll = between(html, "data-import-scroll", "data-import-actions");
    expect(scroll).toContain("overflow:auto");
    expect(scroll).toContain("synthetic-cheque.csv");
    expect(scroll).toContain("synthetic-savings.csv");
    expect(scroll).toContain("synthetic-credit.csv");
    expect(scroll).toContain("These look like transfers between your own accounts");
    expect(scroll).toContain("Cheque");
    expect(scroll).toContain("Savings");
    expect(scroll).toContain("Credit");
    expect(scroll).not.toContain(">Back<");

    const actions = html.slice(html.indexOf("data-import-actions"));
    expect(actions).toContain(">Back<");
    expect(actions).toContain("Import ");
    expect(actions).not.toContain("data-import-scroll");
  });

  it("still renders a single statement inside the same scrollport without a transfer block", () => {
    const html = renderPreview(seedFor([cheque]));
    const scroll = between(html, "data-import-scroll", "data-import-actions");
    expect(scroll).toContain("synthetic-cheque.csv");
    expect(scroll).toContain("WOOLWORTHS SANDTON 1");
    expect(scroll).not.toContain("These look like transfers between your own accounts");
    const actions = html.slice(html.indexOf("data-import-actions"));
    expect(actions).toContain(">Back<");
    expect(actions).toContain("Import ");
  });
});
