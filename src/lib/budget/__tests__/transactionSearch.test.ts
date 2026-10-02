import { describe, expect, it } from "vitest";
import {
  budgetEntrySearchOrs,
  entryMatchesQuery,
  parseAmountQuery,
  sanitiseTxnQuery,
} from "../transactionSearch";

describe("budgetEntrySearchOrs", () => {
  it("matches a reference across description, account, and category", () => {
    expect(budgetEntrySearchOrs("RF8BPO")).toEqual([
      'description.ilike."%RF8BPO%",account_label.ilike."%RF8BPO%",category.ilike."%RF8BPO%"',
    ]);
  });

  it("ANDs tokens so an employer name can be split", () => {
    const ors = budgetEntrySearchOrs("acme payroll");
    expect(ors).toHaveLength(2);
    expect(ors?.[0]).toContain('description.ilike."%acme%"');
    expect(ors?.[1]).toContain('description.ilike."%payroll%"');
  });

  it("drops filter metacharacters from a pasted reference", () => {
    expect(sanitiseTxnQuery("PAY,FROM (ACME).")).toBe("PAY FROM ACME");
    expect(budgetEntrySearchOrs("RF,8BPO")).toEqual([
      'description.ilike."%RF%",account_label.ilike."%RF%",category.ilike."%RF%"',
      'description.ilike."%8BPO%",account_label.ilike."%8BPO%",category.ilike."%8BPO%"',
    ]);
  });

  it("treats a rand amount as an amount match", () => {
    expect(parseAmountQuery("R12,500.50")).toBe(12500.5);
    expect(budgetEntrySearchOrs("12500")).toEqual([
      'description.ilike."%12500%",account_label.ilike."%12500%",category.ilike."%12500%",amount.eq.12500',
    ]);
  });

  it("ignores a one-character query", () => {
    expect(budgetEntrySearchOrs("a")).toBeNull();
  });
});

describe("entryMatchesQuery", () => {
  const salary = {
    description: "ACME PTY LTD SALARY PAYMENT FR REF 88421",
    category: "salary",
    account_label: "FNB Cheque",
    amount: 25000,
    type: "income" as const,
  };

  it("finds an employer across the statement line", () => {
    expect(entryMatchesQuery(salary, "acme")).toBe(true);
    expect(entryMatchesQuery(salary, "88421")).toBe(true);
    expect(entryMatchesQuery(salary, "checkers")).toBe(false);
  });

  it("matches a category label even when the statement line does not say it", () => {
    expect(entryMatchesQuery(
      { description: "IBT FROM 621234", category: "salary", amount: 18000 },
      "salary",
      "Salary",
    )).toBe(true);
  });

  it("matches an exact amount", () => {
    expect(entryMatchesQuery(salary, "R25,000")).toBe(true);
    expect(entryMatchesQuery(salary, "R1,000")).toBe(false);
  });
});
