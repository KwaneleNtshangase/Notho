/**
 * Answer-shape fixer — removes the "correct answer is obviously the longest" tell.
 *
 * Measured before this ran: 87.5% of correct options were uniquely the longest
 * (chance is 25%), and 55% were more than double the average distractor. You
 * could pick the answer without reading the question.
 *
 * The cause is consistent: the correct option carries its own justification
 * while the distractors stay bare.
 *
 *     ✗ "Lower, because your lower income slices are taxed at lower rates"
 *       "Higher" / "Exactly the same" / "Always zero"
 *
 * The justification belongs in the feedback, not the option. So this trims the
 * trailing explanatory clause off the CORRECT option only, and only when doing
 * so is provably safe:
 *
 *   - the clause is introduced by a known explanatory connector
 *   - the remainder is still >= 2 words and >= 8 characters
 *   - the remainder stays unique against the other options
 *   - the trim actually improves the length balance
 *
 * Anything it cannot fix safely is listed for manual work rather than mangled.
 *
 *   node scripts/fix-answer-shape.mjs --dry     # report only
 *   node scripts/fix-answer-shape.mjs           # apply
 *   node scripts/fix-answer-shape.mjs --todo    # list what still needs hands
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DRY = process.argv.includes("--dry");
const TODO = process.argv.includes("--todo");

/** Connectors that introduce a justification which belongs in feedback. */
const TAIL = [
  /,\s+(because|since|as)\s+.+$/i,
  /,\s+(so|so that)\s+.+$/i,
  /,\s+(and|but)\s+(it'?s|they'?re|this|that|you|which)\s+.+$/i,
  /,\s+which\s+.+$/i,
  /,\s+(meaning|leaving|giving|making|allowing)\s+.+$/i,
  /:\s+.+$/,
  /\s+\((?:e\.g\.|i\.e\.)?[^)]{12,}\)$/i,
  /,\s+not\s+the\s+.+$/i,
  /,\s+(rather|instead)\s+than\s+.+$/i,
  /,\s+(with|without)\s+.+$/i,
  /,\s+(then|before|after)\s+.+$/i,
];

/** A bare figure: "45%", "R200", "R3.5 million", "18%", "5 years". */
const FIGURE = /^(?:R\s?[\d][\d\s.,]*(?:\s?(?:million|billion|m|k))?|[\d][\d\s.,]*\s?%|[\d][\d\s.,]*(?:\s?(?:years?|months?|days?|weeks?|hours?))?)$/i;

/** Leading figure at the start of an option, possibly with "About"/"Roughly". */
const LEAD_FIGURE = /^((?:about|roughly|approximately|around|nearly|over|under)\s+)?(R\s?[\d][\d\s.,]*(?:\s?(?:million|billion|m|k))?|[\d][\d\s.,]*\s?%|[\d][\d\s.,]*)/i;

/**
 * Trim the correct option. `others` lets us apply rules that only make sense
 * relative to the shape of the distractors.
 */
function trimOption(text, others = []) {
  const t = text.trim();

  // RULE A — the distractors are bare figures, so the answer should be too.
  //   ✗ "About 18%, 40% inclusion at a 45% marginal rate"  vs  "45%" "40%" "20%"
  //   ✓ "About 18%"
  const figureDistractors = others.filter((o) => FIGURE.test(o.trim())).length;
  if (figureDistractors >= 2) {
    const m = t.match(LEAD_FIGURE);
    if (m && m[0].length < t.length) {
      const cut = m[0].trim().replace(/[,;:]$/, "");
      if (cut.length >= 2) return cut;
    }
  }

  // RULE B — a parenthetical the distractors don't have is a giveaway.
  //   ✗ "R177.12 (1% of the R17 712 cap)"  vs  "R200" "R100" "R400"
  if (/\([^)]{4,}\)/.test(t) && !others.some((o) => /\(/.test(o))) {
    const cut = t.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s{2,}/g, " ").trim().replace(/[,;:]$/, "");
    if (cut.length >= 3 && cut !== t) return cut;
  }

  // RULE C — trailing justification clause, which belongs in the feedback.
  for (const re of TAIL) {
    const cut = t.replace(re, "").trim().replace(/[,:;]$/, "");
    if (cut !== t && cut.split(/\s+/).length >= 2 && cut.length >= 8) return cut;
  }
  return null;
}

function stats(opts, correct) {
  const lens = opts.map((o) => o.length);
  const max = Math.max(...lens);
  const others = lens.filter((_, i) => i !== correct);
  const meanOther = others.reduce((a, b) => a + b, 0) / others.length;
  return {
    uniquelyLongest: lens[correct] === max && lens.filter((l) => l === max).length === 1,
    excessPct: Math.round(((lens[correct] - meanOther) / meanOther) * 100),
  };
}

const files = fs
  .readdirSync(path.join(ROOT, "src/data/banks"))
  .filter((f) => f.endsWith(".ts"))
  .map((f) => `src/data/banks/${f}`);

let examined = 0, fixed = 0, skipped = 0;
const todo = [];

for (const rel of files) {
  const abs = path.join(ROOT, rel);
  let src = fs.readFileSync(abs, "utf8");
  let touched = false;

  // Match: options: [ ... ], (optional whitespace/newlines) correct: N
  const RE = /options:\s*\[([\s\S]*?)\],?\s*\n?\s*correct:\s*(\d+)/g;

  src = src.replace(RE, (whole, body, correctStr) => {
    const correct = Number(correctStr);
    // pull the string literals in order
    const lits = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)];
    if (lits.length < 3 || correct >= lits.length) return whole;
    const opts = lits.map((m) => m[1]);
    examined++;

    const before = stats(opts, correct);
    if (!before.uniquelyLongest || before.excessPct < 40) return whole;

    const cut = trimOption(opts[correct], opts.filter((_, i) => i !== correct));
    if (!cut) {
      skipped++;
      todo.push({ rel, opts, correct, excess: before.excessPct });
      return whole;
    }
    // must stay distinct from the other options
    if (opts.some((o, i) => i !== correct && o.trim().toLowerCase() === cut.toLowerCase())) {
      skipped++;
      todo.push({ rel, opts, correct, excess: before.excessPct });
      return whole;
    }
    const after = stats(opts.map((o, i) => (i === correct ? cut : o)), correct);
    if (after.excessPct >= before.excessPct) {
      skipped++;
      todo.push({ rel, opts, correct, excess: before.excessPct });
      return whole;
    }

    fixed++;
    touched = true;
    // replace only that one literal inside this options block
    const target = lits[correct];
    const newBody =
      body.slice(0, target.index) +
      `"${cut}"` +
      body.slice(target.index + target[0].length);
    return whole.replace(body, newBody);
  });

  if (touched && !DRY) fs.writeFileSync(abs, src, "utf8");
}

console.log(`Option questions examined:      ${examined}`);
console.log(`Auto-trimmed (safe):            ${fixed}`);
console.log(`Left for manual rewrite:        ${skipped}`);

if (TODO) {
  console.log(`\n─── needs hands, worst 30 ───`);
  todo.sort((a, b) => b.excess - a.excess).slice(0, 30).forEach((t) => {
    console.log(`\n +${t.excess}%  ${t.rel}`);
    t.opts.forEach((o, i) => console.log(`   ${i === t.correct ? "✓" : " "} (${String(o.length).padStart(3)}) ${o.slice(0, 95)}`));
  });
}
if (DRY) console.log("\n(dry run — nothing written)");
