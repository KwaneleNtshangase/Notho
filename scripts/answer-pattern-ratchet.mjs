/**
 * Regression guard for answer-shape tells.
 *
 * Reads the thresholds in answer-pattern-budget.json and fails if any pattern
 * fires above its budget. The budget is a ratchet: when a run comes in under
 * budget you tighten the file, never loosen it.
 *
 *   node scripts/answer-pattern-ratchet.mjs
 *   node scripts/answer-pattern-ratchet.mjs --update   # rewrite budget to current
 *
 * "signal" is the observed rate divided by the rate you would expect if the
 * pattern had no relationship to correctness. 1.0 means the pattern tells a
 * guesser nothing, which is the goal.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const BUDGET = path.join(ROOT, "scripts/answer-pattern-budget.json");
const UPDATE = process.argv.includes("--update");
const TMP = path.join(ROOT, "work/.pattern-scan.json");

fs.mkdirSync(path.dirname(TMP), { recursive: true });
execFileSync(
  process.execPath,
  [path.join(ROOT, "scripts/answer-pattern-scan.mjs"), `--json=${TMP}`],
  { stdio: "pipe" }
);
const { summary, rows } = JSON.parse(fs.readFileSync(TMP, "utf8"));

const current = {};
for (const s of summary) if (s.signal != null) current[s.key] = Number(s.signal.toFixed(2));

// The headline number: the best score a learner could get by ranking options
// on length alone and always picking the same rank. 25% is chance. This is
// tracked as a percentage-point edge rather than a ratio, and it is the one
// that matters most: it prices in ties and catches over-correction, where
// killing "the longest is right" just creates "the 2nd longest is right".
{
  const N = rows.length;
  const strat = [0, 0, 0, 0];
  for (const r of rows) {
    const lens = r.opts.map((o) => o.length);
    const c = lens[r.correct];
    const desc = [...lens].sort((a, b) => b - a);
    for (let k = 0; k < 4; k++)
      if (desc[k] !== undefined && c === desc[k]) strat[k] += 1 / lens.filter((l) => l === desc[k]).length;
  }
  current.guesserEdge = Number(((Math.max(...strat) / N) * 100 - 25).toFixed(1));
}

if (UPDATE || !fs.existsSync(BUDGET)) {
  // Round up a little so trivial content edits don't trip the guard.
  const budget = {};
  for (const [k, v] of Object.entries(current))
    budget[k] = k === "guesserEdge" ? Number((v + 1.5).toFixed(1)) : Math.max(1.15, Number((v + 0.1).toFixed(2)));
  fs.writeFileSync(BUDGET, JSON.stringify({ maxSignal: budget }, null, 2) + "\n");
  console.log(`Wrote budget for ${Object.keys(budget).length} patterns to scripts/answer-pattern-budget.json`);
  console.log(JSON.stringify(budget, null, 2));
  process.exit(0);
}

const { maxSignal } = JSON.parse(fs.readFileSync(BUDGET, "utf8"));
const fails = [];
console.log("pattern                 signal   budget");
console.log("─".repeat(42));
for (const [k, limit] of Object.entries(maxSignal)) {
  const v = current[k];
  const ok = v == null || v <= limit;
  console.log(`${k.padEnd(22)} ${String(v ?? "-").padStart(6)}   ${String(limit).padStart(6)}  ${ok ? "" : "FAIL"}`);
  if (!ok) fails.push(`${k}: ${v} > ${limit}`);
}
console.log("");
if (fails.length) {
  console.log("Answer-shape tells regressed:");
  fails.forEach((f) => console.log("  " + f));
  console.log("\nA pattern climbed back above budget, which means new or edited");
  console.log("questions let a guesser pick the right answer from shape alone.");
  console.log("Run: node scripts/answer-pattern-scan.mjs --list --pattern=<name>");
  process.exit(1);
}
console.log("RESULT: PASS");
