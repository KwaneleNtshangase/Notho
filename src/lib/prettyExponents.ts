/** Turn ASCII power notation (1.12)^15 into Unicode superscripts (1.12)¹⁵. */
const SUPER: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function prettyExponents(text: string): string {
  if (!text || !text.includes("^")) return text;
  return text.replace(
    /(\d+(?:\.\d+)?|\([^()]+\))\^(\d+)/g,
    (_m, base: string, exp: string) =>
      `${base}${[...exp].map((d) => SUPER[d] ?? d).join("")}`
  );
}
