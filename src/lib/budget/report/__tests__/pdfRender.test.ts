import { describe, expect, it } from "vitest";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { buildReport } from "../aggregate";
import { BudgetReportDocument } from "../pdf";
import type { BudgetEntryInput, BudgetTargetInput } from "../types";
import { extractText } from 'unpdf';
import fs from 'node:fs';

/**
 * Render smoke test: the report PDF must actually render from a rich,
 * multi-month model - guarding every model-shape change (new fields, new
 * insight branches) against a runtime crash inside @react-pdf.
 */

const FIXED_AT = "2026-06-30T10:00:00.000Z";

function richModel() {
  const entries: BudgetEntryInput[] = [];
  for (const m of ["2026-04", "2026-05", "2026-06"]) {
    entries.push({ type: "income", category: "salary", amount: 18000, entry_date: `${m}-25` });
    entries.push({ type: "income", category: "business", amount: 4000, entry_date: `${m}-15` });
    entries.push({ type: "expense", category: "housing", amount: 6000, entry_date: `${m}-01`, description: "Rent" });
    entries.push({ type: "expense", category: "food", amount: 3500, entry_date: `${m}-05`, description: "Checkers" });
    entries.push({ type: "expense", category: "transport", amount: 1800, entry_date: `${m}-08`, description: "Taxi fare" });
    entries.push({ type: "expense", category: "entertainment", amount: 450, entry_date: `${m}-03`, description: "DSTV Subscription" });
    entries.push({ type: "expense", category: "entertainment", amount: 199, entry_date: `${m}-04`, description: "Netflix" });
    entries.push({ type: "expense", category: "savings", amount: 3000, entry_date: `${m}-26`, description: "Stokvel contribution" });
    entries.push({ type: "expense", category: "debt", amount: 1200, entry_date: `${m}-02`, description: "Loan repayment" });
    entries.push({ type: "expense", category: "other", amount: 600, entry_date: `${m}-12` });
  }
  const targets: BudgetTargetInput[] = [
    { category: "food", monthly_limit: 4000, month_year: "2026-06" },
    { category: "transport", monthly_limit: 2000, month_year: "2026-06" },
  ];
  return buildReport(entries, targets, [], "2026-04-01", "2026-06-30", "Kwanele", FIXED_AT, {
    historyEntries: entries,
    historyStart: "2026-04-01",
  });
}

describe("BudgetReportDocument", () => {
  it("renders a valid multi-page PDF from a rich model", async () => {
    const model = richModel();
    // Sanity: the fixture exercises the new surfaces too.
    expect(model.behaviour.monthsAnalysed).toBe(3);
    expect(model.insights.actions.every((a) => a.id.length > 0)).toBe(true);

    const buffer = await renderToBuffer(
      React.createElement(BudgetReportDocument, { model }) as React.ReactElement<DocumentProps>
    );
    expect(buffer.length).toBeGreaterThan(10000);
    expect(Buffer.from(buffer.subarray(0, 5)).toString()).toBe("%PDF-");
    const pages = await extractText(new Uint8Array(buffer), { mergePages: false });
    expect(pages.text.every(page => page.trim().length > 20)).toBe(true);
  }, 30_000);
  it('retains Tshivenda diacritics and personal names in a translated PDF', async () => {
    const model = richModel();
    model.displayName = 'Hope';
    model.expenseCategories[0].categoryId = 'custom-savings-name';
    model.expenseCategories[0].categoryName = 'Travel';
    const words: Record<string, string> = { 'Budget report': 'Muvhigo wa mugaganyagwama', 'Income & transactions': 'Mbuelo na zwirengiselano', 'Financial health': 'Mutakalo wa zwa masheleni', 'Hope': 'SHOULD NOT REPLACE A NAME', 'Travel': 'SHOULD NOT REPLACE A CUSTOM CATEGORY', 'Every category': 'Tshigwada tshiṅwe na tshiṅwe' };
    const buffer = await renderToBuffer(React.createElement(BudgetReportDocument, { model, locale: 've', translate: (source: string) => words[source] ?? source }) as React.ReactElement<DocumentProps>);
    if (process.env.I18N_PDF_OUTPUT) fs.writeFileSync(process.env.I18N_PDF_OUTPUT, buffer);
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    expect(text.normalize('NFC')).toContain('Tshigwada tshiṅwe na tshiṅwe');
    expect(text).toContain('Hope');
    expect(text).not.toContain('SHOULD NOT REPLACE A NAME');
    expect(text).toContain('Travel');
    expect(text).not.toContain('SHOULD NOT REPLACE A CUSTOM CATEGORY');
  }, 30_000);
});
