/** Minus signs banks actually emit: hyphen, Unicode minus, en/em dash. */
const MINUS = /^[-−–—]\s*/;
/** Currency prefix, with or without a space: "R1 234.56", "R 1,234.56", "ZAR 50.00". */
const CURRENCY_PREFIX = /^(?:zar|r)\s*/i;

export function parseAmountToken(raw: string): number | null {
  let s = raw.trim();
  if (!s || /^[-−–—]$/.test(s)) return null;

  const paren = s.match(/^\((.+)\)$/);
  let negative = false;
  if (paren) {
    negative = true;
    s = paren[1].trim();
  }

  if (MINUS.test(s)) {
    negative = true;
    s = s.replace(MINUS, "");
  }
  const hadCurrency = CURRENCY_PREFIX.test(s);
  if (hadCurrency) s = s.replace(CURRENCY_PREFIX, "");
  if (MINUS.test(s)) {
    negative = true;
    s = s.replace(MINUS, "");
  }

  s = s.replace(/\s/g, "").replace(/,/g, "");
  if (/^[\d.]+[-−–—]$/.test(s)) {
    negative = true;
    s = s.replace(/[-−–—]$/, "");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  if (hadCurrency && !/\.\d{2}$/.test(s)) return null;

  const n = Math.round(parseFloat(s) * 100) / 100;
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}
