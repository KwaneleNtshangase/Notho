/**
 * Lists questions where the correct answer is the SECOND longest option.
 *
 * This is the over-correction pattern: fixing "the longest option is right"
 * by making exactly one distractor longer just moves the tell to "the second
 * longest is right". The minimal repair is to trim that one long distractor
 * back below the correct answer, which returns the question to a normal
 * distribution without touching anything else.
 *
 *   node scripts/export-rank2.mjs            # summary
 *   node scripts/export-rank2.mjs --n=60     # print the worst 60
 *   node scripts/export-rank2.mjs --bank=concepts
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

const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split("=")[1] : d;
};
const N = Number(arg("n", 0));
const BANK = arg("bank", null);
const SKIP = Number(arg("skip", 0));

const rows = [];
function consider(step, id, bank) {
  if (!step || !Array.isArray(step.options) || typeof step.correct !== "number") return;
  const opts = step.options.map(String);
  if (opts.length < 2) return;
  const lens = opts.map((o) => o.length);
  const c = lens[step.correct];
  const desc = [...lens].sort((a, b) => b - a);
  // correct is 2nd longest, and exactly one option is strictly longer
  if (c !== desc[1] || desc[0] <= c) return;
  if (lens.filter((l) => l > c).length !== 1) return;
  const longIdx = lens.indexOf(desc[0]);
  rows.push({
    id,
    bank,
    stem: step.question ?? step.statement ?? "",
    opts,
    correct: step.correct,
    longIdx,
    gap: desc[0] - c,
  });
}

for (const [key, bank] of Object.entries(LESSON_BANKS))
  for (const slot of bank.slots ?? [])
    for (const v of slot.variants) consider(v.step, v.variantId, key.split("::")[0]);
for (const c of CONCEPTS)
  if (c.reviewCard?.options) consider({ ...c.reviewCard }, `concept:${c.id}`, "concepts");

const sel = (BANK ? rows.filter((r) => r.bank === BANK) : rows).sort((a, b) => b.gap - a.gap);
console.log(`Correct answer is 2nd longest with exactly one longer distractor: ${sel.length}\n`);

if (!N) {
  const byBank = {};
  for (const r of sel) byBank[r.bank] = (byBank[r.bank] ?? 0) + 1;
  Object.entries(byBank)
    .sort((a, b) => b[1] - a[1])
    .forEach(([b, n]) => console.log(`  ${String(n).padStart(4)}  ${b}`));
  console.log("\nRun with --n=60 to print them for repair.");
} else {
  for (const r of sel.slice(SKIP, SKIP + N)) {
    console.log(`@${r.id}  trim option ${r.longIdx} by >${r.gap}`);
    r.opts.forEach((o, i) =>
      console.log(`${i === r.correct ? "*" : i === r.longIdx ? ">" : " "}${i} (${String(o.length).padStart(3)}) ${o}`)
    );
    console.log("");
  }
}
