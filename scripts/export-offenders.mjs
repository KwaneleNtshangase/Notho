/**
 * Exports questions carrying a shape tell into batch files for rewriting.
 *
 *   node scripts/export-offenders.mjs                 # writes work/offenders/*.json
 *   node scripts/export-offenders.mjs --bank=taxes
 *   node scripts/export-offenders.mjs --size=40
 *
 * Batches are grouped by bank so a reviewer keeps subject context, and
 * ordered worst-first inside each batch.
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

const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split("=")[1] : d;
};
const SIZE = Number(arg("size", 45));
const BANK = arg("bank", null);
const OUT = path.join(ROOT, "work/offenders");

const CONNECTIVES = /(,\s|;|\band\b|\bor\b|\bbut\b|\bwhile\b|\bwhereas\b|\bunless\b|\bif\b)/i;

const rows = [];
function add(step, id, where, bankKey, group) {
  if (!step || !Array.isArray(step.options) || typeof step.correct !== "number") return;
  const opts = step.options.map(String);
  if (opts.length < 2) return;
  const lens = opts.map((o) => o.length);
  const words = opts.map((o) => o.trim().split(/\s+/).length);
  const max = Math.max(...lens);
  const others = lens.filter((_, i) => i !== step.correct);
  const wOthers = words.filter((_, i) => i !== step.correct);
  const meanOther = others.reduce((a, b) => a + b, 0) / others.length;

  const longest = lens[step.correct] === max && lens.filter((l) => l === max).length === 1;
  const mostWords =
    words[step.correct] === Math.max(...words) &&
    words.filter((w) => w === Math.max(...words)).length === 1;
  const onlyCompound =
    CONNECTIVES.test(opts[step.correct]) &&
    !opts.some((o, j) => j !== step.correct && CONNECTIVES.test(o));

  if (!longest && !mostWords && !onlyCompound) return;

  rows.push({
    id,
    bank: bankKey,
    group,
    where,
    type: step.type ?? "review",
    stem: step.question ?? step.statement ?? step.prompt ?? "",
    options: opts,
    correct: step.correct,
    feedback: step.feedback ?? null,
    tells: [longest && "longest", mostWords && "most-words", onlyCompound && "compound"].filter(Boolean),
    lens,
    gap: lens[step.correct] - Math.max(...others),
    excessPct: Math.round(((lens[step.correct] - meanOther) / meanOther) * 100),
    targetLen: Math.round((lens.reduce((a, b) => a + b, 0)) / lens.length),
    targetWords: Math.round(words.reduce((a, b) => a + b, 0) / words.length),
    meanDistractorWords: Math.round(wOthers.reduce((a, b) => a + b, 0) / wOthers.length),
  });
}

for (const [key, bank] of Object.entries(LESSON_BANKS)) {
  const bankFile = key.split("::")[0];
  for (const slot of bank.slots ?? [])
    for (const v of slot.variants) add(v.step, v.variantId, key, bankFile, slot.conceptId ?? "");
}
for (const c of CONCEPTS) {
  if (c.reviewCard?.options)
    add(
      { ...c.reviewCard, type: "review" },
      `concept:${c.id}`,
      `concept:${c.id}`,
      "concepts",
      c.id
    );
}

const filtered = BANK ? rows.filter((r) => r.bank === BANK) : rows;
filtered.sort((a, b) => a.bank.localeCompare(b.bank) || b.gap - a.gap);

// The workspace mount refuses unlink, so stale batches are blanked rather
// than deleted. A file left over from a previous run becomes an empty array.
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith(".json")) fs.writeFileSync(path.join(OUT, f), "[]");
}

const byBank = {};
for (const r of filtered) (byBank[r.bank] ??= []).push(r);

let n = 0;
const index = [];
for (const [bank, items] of Object.entries(byBank)) {
  for (let i = 0; i < items.length; i += SIZE) {
    const chunk = items.slice(i, i + SIZE);
    const name = `${String(++n).padStart(3, "0")}-${bank}-${Math.floor(i / SIZE) + 1}.json`;
    fs.writeFileSync(path.join(OUT, name), JSON.stringify(chunk, null, 2));
    index.push({ file: name, bank, count: chunk.length });
  }
}
fs.writeFileSync(
  path.join(OUT, "_index.json"),
  JSON.stringify({ total: filtered.length, batches: index }, null, 2)
);

console.log(`${filtered.length} offenders -> ${index.length} batches in work/offenders/`);
const tally = {};
for (const r of filtered) for (const t of r.tells) tally[t] = (tally[t] ?? 0) + 1;
console.log("tells:", tally);
console.log("\nbatches:");
index.forEach((b) => console.log(`  ${b.file.padEnd(42)} ${String(b.count).padStart(3)}`));
