/**
 * AI-tells scanner — measures how "written by a machine" the app reads.
 *
 * Two separate problems, measured separately:
 *
 *   1. STYLE TELLS   — em dashes, stock LLM phrasing, rule-of-three padding.
 *   2. ANSWER TELLS  — the correct option being guessable from shape alone:
 *                      longer than every distractor, or more descriptive.
 *
 * Scope: everything a user can actually read — bank variants (what renders in
 * lessons), concept review cards, and DAILY_FACTS_365.
 *
 *   node scripts/ai-tells-scan.mjs            # summary
 *   node scripts/ai-tells-scan.mjs --list     # + worst offenders
 */
import { createJiti } from "jiti";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jiti = createJiti(import.meta.url, {
  alias: { "@": path.join(ROOT, "src") },
  interopDefault: true,
  fsCache: false,
});

const { LESSON_BANKS } = await jiti.import(path.join(ROOT, "src/data/banks/index.ts"));
const { CONCEPTS } = await jiti.import(path.join(ROOT, "src/data/concepts.ts"));
const { DAILY_FACTS_365 } = await jiti.import(path.join(ROOT, "src/data/content-extra.ts"));

const LIST = process.argv.includes("--list");

// ── 1. STYLE TELLS ───────────────────────────────────────────────────────────
const PHRASES = [
  [/\bdelve\b/i, "delve"],
  [/\bdive into\b/i, "dive into"],
  [/\bit'?s worth noting\b/i, "it's worth noting"],
  [/\bit'?s important to (note|remember)\b/i, "it's important to note"],
  [/\bin today'?s .{0,20}world\b/i, "in today's ... world"],
  [/\bfast-paced\b/i, "fast-paced"],
  [/\bnavigate the\b/i, "navigate the"],
  [/\bunlock (your|the)\b/i, "unlock your/the"],
  [/\bempower(s|ing)? you\b/i, "empowers you"],
  [/\bjourney\b/i, "journey"],
  [/\blandscape\b/i, "landscape"],
  [/\brealm\b/i, "realm"],
  [/\bcrucial\b/i, "crucial"],
  [/\bvital\b/i, "vital"],
  [/\brobust\b/i, "robust"],
  [/\bseamless\b/i, "seamless"],
  [/\bleverage\b/i, "leverage (verb)"],
  [/\bfoster(s|ing)?\b/i, "foster"],
  [/\bmoreover\b/i, "moreover"],
  [/\bfurthermore\b/i, "furthermore"],
  [/\badditionally,/i, "additionally,"],
  [/\bin conclusion\b/i, "in conclusion"],
  [/\bsimply put\b/i, "simply put"],
  [/\bat the end of the day\b/i, "at the end of the day"],
  [/\bgame[- ]chang(er|ing)\b/i, "game-changer"],
  [/\bcornerstone\b/i, "cornerstone"],
  [/\bwhen it comes to\b/i, "when it comes to"],
  [/\bnot only .{1,40} but also\b/i, "not only ... but also"],
  [/\bthe key (is|to)\b/i, "the key is/to"],
  [/\bremember:/i, "Remember:"],
  [/\bthat said,/i, "that said,"],
  [/\bultimately,/i, "ultimately,"],
];

const style = { emDash: [], enDash: [], phrases: {}, total: 0 };

function scanText(text, where) {
  if (!text || typeof text !== "string") return;
  style.total++;
  if (text.includes("—")) style.emDash.push({ where, text });
  if (/\s–\s/.test(text)) style.enDash.push({ where, text });
  for (const [re, label] of PHRASES) {
    if (re.test(text)) (style.phrases[label] ??= []).push({ where, text });
  }
}

// ── 2. ANSWER TELLS ──────────────────────────────────────────────────────────
const answers = [];

function scanOptions(step, where) {
  if (!step || !Array.isArray(step.options) || typeof step.correct !== "number") return;
  const opts = step.options.map((o) => String(o ?? ""));
  const lens = opts.map((o) => o.length);
  const words = opts.map((o) => o.trim().split(/\s+/).length);
  const max = Math.max(...lens);
  const correctLen = lens[step.correct];
  const others = lens.filter((_, i) => i !== step.correct);
  const meanOther = others.reduce((a, b) => a + b, 0) / others.length;

  answers.push({
    where,
    uniquelyLongest: correctLen === max && lens.filter((l) => l === max).length === 1,
    // how much longer the correct answer is than the average distractor
    excessPct: Math.round(((correctLen - meanOther) / meanOther) * 100),
    // spread across all options: low = uniform = good
    spreadPct: Math.round(((max - Math.min(...lens)) / Math.min(...lens)) * 100),
    correctWords: words[step.correct],
    meanOtherWords: others.length ? (words.filter((_, i) => i !== step.correct).reduce((a, b) => a + b, 0) / (words.length - 1)) : 0,
    // "more descriptive": correct option contains a qualifier the others lack
    hasQualifier: /\bbecause\b|\bso that\b|\bwhich\b|, and\b|\bunless\b|\bwhile\b|\bwhereas\b/i.test(opts[step.correct]) &&
      !opts.some((o, i) => i !== step.correct && /\bbecause\b|\bso that\b|\bwhich\b|, and\b|\bunless\b|\bwhile\b|\bwhereas\b/i.test(o)),
    opts,
    correct: step.correct,
  });
}

// ── walk everything user-visible ─────────────────────────────────────────────
for (const [key, bank] of Object.entries(LESSON_BANKS)) {
  for (const item of bank.layout ?? []) {
    if (item && item.type === "info") {
      scanText(item.title, `${key} [info title]`);
      scanText(item.content, `${key} [info body]`);
    }
  }
  for (const slot of bank.slots ?? []) {
    for (const v of slot.variants) {
      const s = v.step;
      const w = `${key} ${v.variantId}`;
      scanText(s.question, w);
      scanText(s.statement, w);
      scanText(s.prompt, w);
      scanText(s.title, w);
      scanText(s.feedback?.correct, w + " [fb+]");
      scanText(s.feedback?.incorrect, w + " [fb-]");
      (s.options ?? []).forEach((o) => scanText(o, w + " [opt]"));
      scanOptions(s, w);
    }
  }
}
for (const c of CONCEPTS) {
  scanText(c.reviewCard?.question, `concept:${c.id}`);
  scanText(c.reviewCard?.explanation, `concept:${c.id} [expl]`);
  (c.reviewCard?.options ?? []).forEach((o) => scanText(o, `concept:${c.id} [opt]`));
  if (c.reviewCard) scanOptions({ options: c.reviewCard.options, correct: c.reviewCard.correct }, `concept:${c.id}`);
}
(DAILY_FACTS_365 ?? []).forEach((f, i) => scanText(f, `DAILY_FACTS_365[${i}]`));

// ── report ───────────────────────────────────────────────────────────────────
const pct = (n, d) => `${((n / d) * 100).toFixed(1)}%`;

console.log("═══ STYLE TELLS ═══");
console.log(`Text fields scanned:        ${style.total}`);
console.log(`Em dashes (—):              ${style.emDash.length}   <- the big giveaway`);
console.log(`Spaced en dashes ( – ):     ${style.enDash.length}`);
const phraseHits = Object.entries(style.phrases).sort((a, b) => b[1].length - a[1].length);
console.log(`Stock-phrase hits:          ${phraseHits.reduce((a, [, v]) => a + v.length, 0)}`);
phraseHits.slice(0, 15).forEach(([label, hits]) => console.log(`   ${String(hits.length).padStart(4)}  ${label}`));

console.log("\n═══ ANSWER TELLS ═══");
const n = answers.length;
const longest = answers.filter((a) => a.uniquelyLongest).length;
const big = answers.filter((a) => a.uniquelyLongest && a.excessPct >= 40).length;
const huge = answers.filter((a) => a.uniquelyLongest && a.excessPct >= 100).length;
const qualifier = answers.filter((a) => a.hasQualifier).length;
console.log(`Option questions:                    ${n}`);
console.log(`Correct answer is uniquely longest:  ${longest}  (${pct(longest, n)})   <- chance is 25%`);
console.log(`  ...and >=40% longer than average:  ${big}  (${pct(big, n)})`);
console.log(`  ...and >=100% longer:              ${huge}  (${pct(huge, n)})`);
console.log(`Correct answer alone has a qualifier: ${qualifier}  (${pct(qualifier, n)})`);
const avgSpread = answers.reduce((a, x) => a + x.spreadPct, 0) / n;
console.log(`Avg length spread across options:    ${avgSpread.toFixed(0)}%   (lower = more uniform)`);

if (LIST) {
  console.log("\n─── worst 25 answer-shape offenders ───");
  answers
    .filter((a) => a.uniquelyLongest)
    .sort((a, b) => b.excessPct - a.excessPct)
    .slice(0, 25)
    .forEach((a) => {
      console.log(`\n +${a.excessPct}%  ${a.where}`);
      a.opts.forEach((o, i) => console.log(`   ${i === a.correct ? "✓" : " "} (${String(o.length).padStart(3)}) ${o.slice(0, 90)}`));
    });
  console.log("\n─── em dash sample (first 15) ───");
  style.emDash.slice(0, 15).forEach((h) => console.log(`  ${h.where}\n    ${h.text.slice(0, 130)}`));
}

console.log("");
