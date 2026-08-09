/**
 * Compact printer for an offender batch, for rewriting work.
 *
 *   node scripts/show-batch.mjs 001            # by batch number
 *   node scripts/show-batch.mjs 001 --from=20  # skip the first 20
 *   node scripts/show-batch.mjs 001 --n=25     # only 25 items
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "work/offenders");
const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? Number(a.split("=")[1]) : d;
};

const key = process.argv[2];
const file = fs.readdirSync(DIR).find((f) => f.startsWith(key));
if (!file) {
  console.error(`no batch starting ${key}. available:`);
  fs.readdirSync(DIR).forEach((f) => console.error("  " + f));
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
const from = arg("from", 0);
const n = arg("n", rows.length);
const slice = rows.slice(from, from + n);

console.log(`### ${file}  [${from}..${from + slice.length - 1}] of ${rows.length}\n`);
for (const r of slice) {
  console.log(`@${r.id}  ${r.type}  tells=${r.tells.join("+")}  target~${r.targetLen}c/${r.targetWords}w`);
  console.log(`Q ${r.stem}`);
  r.options.forEach((o, i) => console.log(`${i === r.correct ? "*" : " "}${i} (${String(o.length).padStart(3)}) ${o}`));
  if (r.feedback?.correct) console.log(`F+ ${r.feedback.correct}`);
  console.log("");
}
