/**
 * Proposes trims for correct answers that carry their own justification.
 *
 * The dominant shape in the banks is a correct option built as
 * "<answer><separator><why it is the answer>", while the distractors are bare.
 * Cutting at the separator usually leaves a complete answer AND kills the
 * length tell, because the justification was most of the excess.
 *
 * This script only PROPOSES. Nothing is applied. Every proposal is graded so a
 * reviewer can approve the safe bulk quickly and hand-write the rest:
 *
 *   safe    head is a full clause, still unique against the distractors,
 *           and the trim removes the "longest" tell outright
 *   check   trim works but the head is short, cryptic, or close to a distractor
 *   no-fix  trimming does not remove the tell, so the distractors need rewriting
 *
 *   node scripts/propose-trims.mjs                    # summary
 *   node scripts/propose-trims.mjs --grade=safe --list
 *   node scripts/propose-trims.mjs --grade=safe --emit=patches/trims.jsonl
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
const GRADE = arg("grade", null);
const EMIT = arg("emit", null);
const LIST = process.argv.includes("--list");

// Separators that introduce a justification rather than part of the answer.
const SEPARATORS = [
  /,\s+(?:because|since|so|which|meaning|as|it|they|you|this|that|and you|and it|and they|where|when|leaving|giving|making|keeping|letting|allowing)\b/i,
  /;\s+/,
  /\s+[-–]\s+/,
  /\.\s+(?=[A-Z])/,
];

/**
 * Words that cannot end a trimmed answer: they demand a complement, so
 * cutting after them leaves a fragment ("The rate on your next").
 */
const DANGLING =
  /\b(the|a|an|your|his|her|their|its|our|my|of|to|in|on|for|with|at|by|from|into|over|under|and|or|but|next|last|first|same|other|more|less|most|least|each|every|both|either|neither|such|very|only|just|about|per|than|that|which|who|is|are|was|were|be|been|has|have|had|will|would|can|could|may|might|must|should)$/i;

const words = (s) => s.trim().split(/\s+/).length;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

function proposeTrim(answer) {
  let best = null;
  for (const re of SEPARATORS) {
    const m = re.exec(answer);
    if (!m) continue;
    const head = answer.slice(0, m.index).replace(/[\s,;:.\-–(]+$/, "").trim();
    if (words(head) < 2) continue;
    if (head.length < 12) continue;
    if (DANGLING.test(head)) continue;
    // An unbalanced bracket means the cut landed inside a parenthetical.
    if ((head.match(/\(/g) ?? []).length !== (head.match(/\)/g) ?? []).length) continue;
    // Prefer the cut that keeps the most meaning while removing the most bulk.
    if (!best || head.length > best.head.length) best = { head, cut: answer.slice(m.index).trim() };
  }
  return best;
}

const rows = [];
function consider(step, id, where, bank) {
  if (!step || !Array.isArray(step.options) || typeof step.correct !== "number") return;
  const opts = step.options.map(String);
  if (opts.length < 2) return;
  const lens = opts.map((o) => o.length);
  const max = Math.max(...lens);
  const isLongest = lens[step.correct] === max && lens.filter((l) => l === max).length === 1;
  if (!isLongest) return;

  const answer = opts[step.correct];
  const t = proposeTrim(answer);
  if (!t) {
    rows.push({ id, where, bank, grade: "no-trim", opts, correct: step.correct, stem: step.question ?? step.statement ?? "" });
    return;
  }

  const after = opts.map((o, i) => (i === step.correct ? t.head : o));
  const aLens = after.map((o) => o.length);
  const aMax = Math.max(...aLens);
  const stillLongest = aLens[step.correct] === aMax && aLens.filter((l) => l === aMax).length === 1;

  // Is the trimmed answer still clearly distinct from every distractor?
  const collides = after.some((o, i) => i !== step.correct && norm(o) === norm(t.head));
  const nearCollide = after.some(
    (o, i) => i !== step.correct && (norm(o).includes(norm(t.head)) || norm(t.head).includes(norm(o)))
  );

  let grade;
  if (collides) grade = "collides";
  else if (stillLongest) grade = "no-fix";
  else if (nearCollide || words(t.head) < 3) grade = "check";
  else grade = "safe";

  rows.push({
    id,
    where,
    bank,
    grade,
    stem: step.question ?? step.statement ?? "",
    opts,
    correct: step.correct,
    head: t.head,
    cut: t.cut,
    after,
    feedback: step.feedback ?? null,
  });
}

for (const [key, bank] of Object.entries(LESSON_BANKS))
  for (const slot of bank.slots ?? [])
    for (const v of slot.variants) consider(v.step, v.variantId, key, key.split("::")[0]);
for (const c of CONCEPTS)
  if (c.reviewCard?.options)
    consider({ ...c.reviewCard }, `concept:${c.id}`, `concept:${c.id}`, "concepts");

const tally = {};
for (const r of rows) tally[r.grade] = (tally[r.grade] ?? 0) + 1;
console.log(`Questions with the length tell: ${rows.length}`);
console.log("Trim triage:");
for (const [g, n] of Object.entries(tally).sort((a, b) => b[1] - a[1]))
  console.log(`  ${g.padEnd(10)} ${String(n).padStart(4)}`);
console.log("");

const sel = GRADE ? rows.filter((r) => r.grade === GRADE) : rows;

if (LIST) {
  for (const r of sel.slice(0, 60)) {
    console.log(`@${r.id}  [${r.grade}]`);
    console.log(`Q ${r.stem.slice(0, 110)}`);
    console.log(`  was: ${r.opts[r.correct]}`);
    if (r.head) console.log(`  new: ${r.head}`);
    if (r.cut) console.log(`  cut: ${r.cut}`);
    r.opts.forEach((o, i) => {
      if (i !== r.correct) console.log(`   x   (${String(o.length).padStart(3)}) ${o}`);
    });
    console.log("");
  }
}

if (EMIT) {
  const out = sel
    .filter((r) => r.head)
    .map((r) =>
      JSON.stringify({
        id: r.id,
        rewritesAnswer: true,
        correct: r.correct,
        options: r.after,
        note: `trim: ${r.cut}`,
      })
    )
    .join("\n");
  fs.mkdirSync(path.dirname(path.join(ROOT, EMIT)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, EMIT), out + "\n");
  console.log(`Wrote ${sel.filter((r) => r.head).length} proposals to ${EMIT}`);
}
