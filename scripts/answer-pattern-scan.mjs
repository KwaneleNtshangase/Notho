/**
 * Answer-pattern scanner — finds EVERY shape-based tell that lets a user
 * pick the right answer without knowing the subject.
 *
 * Position is already neutralised at runtime by lessonShuffle.ts, so this
 * scanner deliberately ignores authored index and looks only at the text.
 *
 *   node scripts/answer-pattern-scan.mjs                # summary
 *   node scripts/answer-pattern-scan.mjs --list         # + offenders
 *   node scripts/answer-pattern-scan.mjs --pattern=hedge
 *   node scripts/answer-pattern-scan.mjs --json out.json
 *
 * Every pattern reports an OBSERVED rate against the CHANCE rate. A pattern
 * that fires on the correct answer at roughly chance carries no signal and is
 * harmless. One that fires well above chance is a giveaway.
 */
import { createJiti } from "jiti";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jiti = createJiti(import.meta.url, {
  alias: { "@": path.join(ROOT, "src") },
  interopDefault: true,
  fsCache: false,
});

const { LESSON_BANKS } = await jiti.import(path.join(ROOT, "src/data/banks/index.ts"));
const { CONCEPTS } = await jiti.import(path.join(ROOT, "src/data/concepts.ts"));

const LIST = process.argv.includes("--list");
const ONLY = (process.argv.find((a) => a.startsWith("--pattern=")) || "").split("=")[1];
const JSON_OUT = (process.argv.find((a) => a.startsWith("--json")) || "").split("=")[1];

// ───────────────────────────────────────────────────────────────────────────
// Detectors. Each returns true/false for a single option string.
// `all` and `idx` are available for context-sensitive rules.
// ───────────────────────────────────────────────────────────────────────────

const ABSOLUTES = /\b(always|never|all|none|only|every|must|cannot|can't|impossible|guaranteed?|zero|no one|nobody|everyone|any time|entirely|completely|totally|100%)\b/i;
const HEDGES = /\b(usually|generally|typically|often|may|might|can|could|tends? to|in most cases|normally|commonly|about|around|approximately|roughly|depends?|likely|some|partly|broadly)\b/i;
const JUSTIFIERS = /\b(because|since|so that|which means|meaning|so you|in order to|as it|therefore|thus|to ensure|so the)\b/i;
const CONNECTIVES = /(,\s|;|\band\b|\bor\b|\bbut\b|\bwhile\b|\bwhereas\b|\bunless\b|\bif\b)/i;
const FLIPPANT = /^(it'?s correct|correct|nothing|it isn'?t|none of these|no|yes|it doesn'?t|nothing happens|it'?s fine|it'?s wrong|wrong|true|false|n\/a|nothing at all|it depends)\.?$/i;
const CATCHALL = /\b(all|none|both)\s+of\s+the\s+(above|these|options)\b/i;
const NUMERIC = /\d/;

/**
 * Content words in the option that also appear in the question stem.
 * "Word repeat" is a classic tell: the correct option echoes the stem.
 */
const STOPWORDS = new Set(
  ("a an the of to in on for is are was were be been being and or but not you your it its" +
    " that this these those which what who whom when where why how do does did with as at by from" +
    " if then than they them their he she his her we us our i me my will would shall should can could" +
    " may might must has have had s t re ll ve").split(/\s+/)
);
const contentWords = (s) =>
  new Set(
    String(s ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9\s%]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );

function stemEcho(opt, stem) {
  const o = contentWords(opt);
  const q = contentWords(stem);
  let hits = 0;
  for (const w of o) if (q.has(w)) hits++;
  return hits;
}

/** Crude grammatical shape: how an option opens. Used for parallelism. */
function shapeOf(s) {
  const t = String(s ?? "").trim();
  if (!t) return "empty";
  if (/^[R$€£]?\s?[\d,. ]+%?$/.test(t)) return "bare-number";
  if (/^(about|around|roughly|approximately)\b/i.test(t)) return "approx";
  if (/^(at|in|on|by|for|to|from|with|under|over|within|after|before)\b/i.test(t)) return "prep";
  if (/^(the|a|an)\b/i.test(t)) return "noun-det";
  if (/^(it|they|you|he|she|we)\b/i.test(t)) return "pronoun";
  if (/^\w+ing\b/i.test(t)) return "gerund";
  if (/^(is|are|was|were|has|have|does|do|can|will|must|should)\b/i.test(t)) return "aux";
  if (/^[A-Z]{2,}/.test(t)) return "acronym";
  return "other";
}

const PATTERNS = {
  length: {
    label: "Longest option",
    why: "Correct answer is uniquely the longest string.",
    fn: (opts, i) => {
      const lens = opts.map((o) => o.length);
      const max = Math.max(...lens);
      return lens[i] === max && lens.filter((l) => l === max).length === 1;
    },
    perQuestion: true,
  },
  words: {
    label: "Most words",
    why: "Correct answer has uniquely the most words.",
    fn: (opts, i) => {
      const w = opts.map((o) => o.trim().split(/\s+/).length);
      const max = Math.max(...w);
      return w[i] === max && w.filter((x) => x === max).length === 1;
    },
    perQuestion: true,
  },
  hedge: {
    label: "Hedged language",
    why: "Correct answer hedges (usually/generally/may) where distractors don't.",
    fn: (opts, i) => HEDGES.test(opts[i]) && !opts.some((o, j) => j !== i && HEDGES.test(o)),
    perQuestion: true,
  },
  absolute: {
    label: "Absolutes in distractors only",
    why: "Distractors carry always/never/only and the correct answer never does, so absolutes = eliminate.",
    fn: (opts, i) =>
      !ABSOLUTES.test(opts[i]) && opts.filter((o, j) => j !== i && ABSOLUTES.test(o)).length >= 2,
    perQuestion: true,
  },
  justifier: {
    label: "Carries its own justification",
    why: "Only the correct answer explains itself (because/so/which means).",
    fn: (opts, i) => JUSTIFIERS.test(opts[i]) && !opts.some((o, j) => j !== i && JUSTIFIERS.test(o)),
    perQuestion: true,
  },
  connective: {
    label: "Only compound option",
    why: "Correct answer is the only one with a comma or conjunction, so it looks more complete.",
    fn: (opts, i) => CONNECTIVES.test(opts[i]) && !opts.some((o, j) => j !== i && CONNECTIVES.test(o)),
    perQuestion: true,
  },
  flippant: {
    label: "Flippant distractors",
    why: "Distractors are dismissive one-worders (It's correct / Nothing / It isn't), trivially eliminated.",
    fn: (opts, i) => !FLIPPANT.test(opts[i]) && opts.some((o, j) => j !== i && FLIPPANT.test(o)),
    perQuestion: true,
  },
  echo: {
    label: "Echoes the question stem",
    why: "Correct answer repeats the most content words from the stem.",
    needsStem: true,
    fn: (opts, i, stem) => {
      if (!stem) return false;
      const scores = opts.map((o) => stemEcho(o, stem));
      const max = Math.max(...scores);
      return max >= 2 && scores[i] === max && scores.filter((s) => s === max).length === 1;
    },
    perQuestion: true,
  },
  parallel: {
    label: "Odd one out by grammar",
    why: "Correct answer has a different grammatical shape from all three distractors.",
    fn: (opts, i) => {
      const shapes = opts.map(shapeOf);
      const others = shapes.filter((_, j) => j !== i);
      return new Set(others).size === 1 && others[0] !== shapes[i];
    },
    perQuestion: true,
  },
  specific: {
    label: "Only option with a figure",
    why: "Correct answer is the only one carrying a number, so it reads as the researched one.",
    fn: (opts, i) => NUMERIC.test(opts[i]) && !opts.some((o, j) => j !== i && NUMERIC.test(o)),
    perQuestion: true,
  },
  catchall: {
    label: "All/none of the above",
    why: "Catch-all option present; when it exists it is usually correct.",
    fn: (opts, i) => opts.some((o) => CATCHALL.test(o)),
    perQuestion: false,
  },
};

// ───────────────────────────────────────────────────────────────────────────
// Walk content
// ───────────────────────────────────────────────────────────────────────────
const rows = [];

function record(step, where, bank) {
  if (!step || !Array.isArray(step.options) || typeof step.correct !== "number") return;
  const opts = step.options.map((o) => String(o ?? ""));
  if (opts.length < 2 || step.correct < 0 || step.correct >= opts.length) return;
  const stem = step.question ?? step.statement ?? step.prompt ?? "";
  const hits = {};
  for (const [key, p] of Object.entries(PATTERNS)) {
    hits[key] = p.needsStem ? p.fn(opts, step.correct, stem) : p.fn(opts, step.correct);
  }
  rows.push({ where, bank, stem, opts, correct: step.correct, n: opts.length, hits });
}

for (const [key, bank] of Object.entries(LESSON_BANKS)) {
  for (const slot of bank.slots ?? []) {
    for (const v of slot.variants) record(v.step, `${key} ${v.variantId}`, key);
  }
}
for (const c of CONCEPTS) {
  if (c.reviewCard?.options)
    record(
      { options: c.reviewCard.options, correct: c.reviewCard.correct, question: c.reviewCard.question },
      `concept:${c.id}`,
      "concepts"
    );
}

// ───────────────────────────────────────────────────────────────────────────
// Report
// ───────────────────────────────────────────────────────────────────────────
const N = rows.length;
const pct = (n, d) => `${((n / d) * 100).toFixed(1)}%`;

console.log(`\nOption questions scanned: ${N}\n`);
console.log("Pattern                          fires   rate     chance   signal");
console.log("─".repeat(72));

const summary = [];
for (const [key, p] of Object.entries(PATTERNS)) {
  if (ONLY && ONLY !== key) continue;
  const fired = rows.filter((r) => r.hits[key]);
  // chance = mean 1/n over the questions where the pattern could fire at all
  const chance = p.perQuestion
    ? rows.reduce((a, r) => a + 1 / r.n, 0) / N
    : null;
  const rate = fired.length / N;
  const signal = chance === null ? null : rate / chance;
  summary.push({ key, label: p.label, fired: fired.length, rate, chance, signal, why: p.why });
  const sig =
    signal === null
      ? "n/a"
      : signal >= 2
        ? `${signal.toFixed(1)}x  ‼️`
        : signal >= 1.4
          ? `${signal.toFixed(1)}x  ⚠️`
          : `${signal.toFixed(1)}x  ok`;
  console.log(
    `${p.label.padEnd(32)} ${String(fired.length).padStart(5)}  ${pct(fired.length, N).padStart(6)}  ` +
      `${(chance === null ? "-" : pct(chance, 1)).padStart(7)}  ${sig}`
  );
}
console.log("─".repeat(72));
console.log("signal = observed rate / rate expected by chance. 1.0x means no tell.\n");

// ── length rank of the correct answer ───────────────────────────────────────
// The cleanest single measure. If length carries no information, the correct
// answer is equally likely to be the longest, 2nd, 3rd or shortest option.
// Watch both ends: over-correcting until the answer is always SHORTEST just
// swaps one tell for its mirror image.
const rank = {};
for (const r of rows) {
  const lens = r.opts.map((o) => o.length);
  const desc = [...lens].sort((a, b) => b - a);
  const k = desc.indexOf(lens[r.correct]) + 1;
  rank[k] = (rank[k] ?? 0) + 1;
}
console.log("Length rank of the correct answer (chance = 25% each):");
for (const k of Object.keys(rank).sort())
  console.log(`  ${k === "1" ? "longest " : k === "4" ? "shortest" : `rank ${k}  `}  ${String(rank[k]).padStart(4)}  ${pct(rank[k], N)}`);
console.log("");

// ── the real test: can a guesser beat chance using length alone? ────────────
// For each rank k, the score a learner would get by always picking the k-th
// longest option, splitting ties at random. This is the honest measure,
// because it prices in ties, which the rank table above hides.
//
// It also catches over-correction: fixing "the longest one is right" by always
// making one distractor longer just moves the tell to "the 2nd longest is right".
const strategy = [0, 0, 0, 0];
for (const r of rows) {
  const lens = r.opts.map((o) => o.length);
  const correctLen = lens[r.correct];
  const desc = [...lens].sort((a, b) => b - a);
  for (let k = 0; k < 4; k++) {
    if (desc[k] === undefined) continue;
    if (correctLen === desc[k]) strategy[k] += 1 / lens.filter((l) => l === desc[k]).length;
  }
}
const labels = ["always pick longest", "always pick 2nd longest", "always pick 3rd longest", "always pick shortest"];
const best = Math.max(...strategy) / N;
console.log("Guesser score using length alone (chance = 25.0%):");
labels.forEach((l, i) => {
  const v = (strategy[i] / N) * 100;
  console.log(`  ${l.padEnd(24)} ${v.toFixed(1)}%${v >= 30 ? "  <- exploitable" : ""}`);
});
console.log(`  BEST STRATEGY            ${(best * 100).toFixed(1)}%   edge over chance: ${(best * 100 - 25).toFixed(1)} points\n`);

// Composite: how many questions carry at least one strong tell
const STRONG = ["length", "words", "justifier", "connective", "flippant", "parallel", "hedge", "echo", "specific", "absolute"];
const dirty = rows.filter((r) => STRONG.some((k) => r.hits[k]));
const veryDirty = rows.filter((r) => STRONG.filter((k) => r.hits[k]).length >= 2);
console.log(`Questions with >=1 tell:  ${dirty.length}  (${pct(dirty.length, N)})`);
console.log(`Questions with >=2 tells: ${veryDirty.length}  (${pct(veryDirty.length, N)})`);
console.log(`Clean questions:          ${N - dirty.length}  (${pct(N - dirty.length, N)})\n`);

// Per-bank breakdown of dirtiness
const byBank = {};
for (const r of rows) {
  const b = (byBank[r.bank] ??= { n: 0, dirty: 0 });
  b.n++;
  if (STRONG.some((k) => r.hits[k])) b.dirty++;
}
console.log("Worst banks:");
Object.entries(byBank)
  .map(([b, v]) => ({ b, ...v, p: v.dirty / v.n }))
  .sort((a, x) => x.p - a.p || x.n - a.n)
  .slice(0, 12)
  .forEach((v) => console.log(`  ${pct(v.dirty, v.n).padStart(6)}  ${String(v.dirty).padStart(4)}/${String(v.n).padEnd(4)}  ${v.b}`));
console.log("");

if (LIST) {
  const target = ONLY ? [ONLY] : STRONG;
  const offenders = rows
    .filter((r) => target.some((k) => r.hits[k]))
    .sort((a, b) => target.filter((k) => b.hits[k]).length - target.filter((k) => a.hits[k]).length)
    .slice(0, 40);
  console.log(`─── ${offenders.length} offenders ───`);
  for (const r of offenders) {
    const tags = target.filter((k) => r.hits[k]).join(", ");
    console.log(`\n[${tags}]  ${r.where}`);
    console.log(`  Q: ${r.stem.slice(0, 110)}`);
    r.opts.forEach((o, i) =>
      console.log(`   ${i === r.correct ? "✓" : " "} (${String(o.length).padStart(3)}) ${o.slice(0, 100)}`)
    );
  }
  console.log("");
}

if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify({ summary, rows }, null, 2));
  console.log(`Wrote ${JSON_OUT}\n`);
}
