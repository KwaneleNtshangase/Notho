/**
 * Synthetic multi-account statements. Amounts, names and balances are fake.
 * Cheque and savings share transfer pairs so the import preview builds the
 * inter-account block that only appears with more than one account.
 */

function csv(rows: string[][]): string {
  return ["Date,Amount,Balance,Description", ...rows.map((row) => row.join(","))].join("\n");
}

function money(n: number): string {
  return n.toFixed(2);
}

export function syntheticChequeStatement(): string {
  const rows: string[][] = [];
  let balance = 25000;
  for (let i = 0; i < 12; i++) {
    const day = String(i + 1).padStart(2, "0");
    const amount = -(800 + i * 50);
    balance += amount;
    rows.push([`2026-06-${day}`, money(amount), money(balance), "TRANSFER TO SAVINGS"]);
  }
  for (let i = 0; i < 18; i++) {
    const day = String((i % 27) + 1).padStart(2, "0");
    const amount = -(35 + i * 4);
    balance += amount;
    rows.push([`2026-06-${day}`, money(amount), money(balance), `WOOLWORTHS SANDTON ${i + 1}`]);
  }
  return csv(rows);
}

export function syntheticSavingsStatement(): string {
  const rows: string[][] = [];
  let balance = 4000;
  for (let i = 0; i < 12; i++) {
    const day = String(i + 1).padStart(2, "0");
    const amount = 800 + i * 50;
    balance += amount;
    rows.push([`2026-06-${day}`, money(amount), money(balance), "TRANSFER FROM CHEQUE"]);
  }
  for (let i = 0; i < 10; i++) {
    const day = String((i % 27) + 1).padStart(2, "0");
    const amount = -(20 + i);
    balance += amount;
    rows.push([`2026-06-${day}`, money(amount), money(balance), `TAKEALOT ORDER ${i + 1}`]);
  }
  return csv(rows);
}

/** A third account with no matching transfers, mixed into the same import. */
export function syntheticCreditStatement(): string {
  const rows: string[][] = [];
  let balance = -1200;
  for (let i = 0; i < 8; i++) {
    const day = String(i + 3).padStart(2, "0");
    const amount = -(90 + i * 15);
    balance += amount;
    rows.push([`2026-06-${day}`, money(amount), money(balance), `ENGEN FUEL ${i + 1}`]);
  }
  return csv(rows);
}
