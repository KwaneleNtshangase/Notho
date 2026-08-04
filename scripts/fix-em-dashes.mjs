/**
 * Em-dash remover for user-visible content strings.
 *
 * An em dash is the loudest "written by a model" signal, and there were ~2,900
 * of them in src/data. Replacing them all with one substitute would just create
 * a new tell, so the fix varies by grammatical context:
 *
 *   paired dashes   X — Y — Z              ->  X (Y) Z   /   X, Y, Z
 *   affirmation     Right — you should...  ->  Right. You should...
 *   independent     ...vanish — their buying power shrinks
 *                                          ->  ...vanish. Their buying power shrinks
 *   appositive      one problem — transferring value
 *                                          ->  one problem: transferring value
 *   phrase / list   bartered — swapping a goat
 *                                          ->  bartered, swapping a goat
 *
 * The critical rule: never produce a comma splice. If the text after the dash
 * contains a finite verb it becomes its own sentence; only verbless fragments
 * get a comma or colon.
 *
 * Only rewrites inside double-quoted string literals, so code is never touched.
 *
 *   node scripts/fix-em-dashes.mjs --file src/data/banks/money-basics.ts --dry
 *   node scripts/fix-em-dashes.mjs --dry
 *   node scripts/fix-em-dashes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DRY = process.argv.includes("--dry");
const fileArg = process.argv.indexOf("--file");
const ONLY = fileArg > -1 ? process.argv[fileArg + 1] : null;

const CONJUNCTION = new Set([
  "and", "but", "so", "or", "yet", "because", "although", "though", "while",
  "which", "who", "whereas", "unless", "since", "if", "than", "plus", "not",
]);

/** Finite verbs / contractions that signal a full clause follows. */
const FINITE = new RegExp(
  "^(is|are|was|were|be|been|has|have|had|do|does|did|can|could|will|would|" +
  "shall|should|may|might|must|needs?|means?|gets?|makes?|costs?|pays?|takes?|" +
  "goes|comes?|works?|stays?|keeps?|leaves?|shows?|tells?|gives?|holds?|" +
  "shrinks?|grows?|falls?|rises?|drops?|counts?|applies|applys?|starts?|stops?|" +
  "buys?|sells?|owns?|earns?|loses?|wins?|helps?|hurts?|matters?|depends?|" +
  "happens?|remains?|becomes?|turns?|runs?|sits?|lands?|adds?|removes?|" +
  "wipes?|beats?|saves?|builds?|breaks?|clears?|covers?|carries|cuts?|" +
  "charges?|reduces?|raises?|lowers?|moves?|opens?|closes?|ends?|begins?|" +
  "protects?|prevents?|allows?|requires?|includes?|excludes?|treats?|" +
  "signals?|reads?|looks?|feels?|sounds?|seems?|tends?|exists?|arrives?)$"
);

const PRONOUN = new Set([
  "it", "they", "you", "we", "he", "she", "there", "that", "this", "these",
  "those", "i", "nobody", "anyone", "everyone", "nothing", "everything", "both",
  "most", "many", "some", "one", "neither", "either", "all", "none",
]);

const IMPERATIVE = new Set([
  "treat", "keep", "check", "use", "ask", "start", "stop", "get", "give", "make",
  "do", "dont", "never", "always", "look", "read", "write", "pay", "put", "take",
  "assume", "expect", "compare", "verify", "report", "decline", "refuse",
  "record", "avoid", "aim", "plan", "save", "spend", "budget", "call", "email",
  "note", "remember", "watch", "think", "consider", "choose", "pick", "move",
  "cancel", "update", "review", "escalate", "walk", "hang", "freeze",
]);

const norm = (w) => (w ?? "").toLowerCase().replace(/[^a-z]/g, "");

/**
 * Does the text after the dash stand alone as a sentence?
 * Contractions count: "their buying power shrinks", "it's that you...",
 * "that's what it means" are all independent.
 */
function isIndependent(after) {
  const raw = after.trim().split(/\s+/).slice(0, 7);
  if (!raw.length) return false;
  const w0 = norm(raw[0]);
  if (CONJUNCTION.has(w0)) return false;
  // "to prevent double taxation" is an infinitive phrase, not a sentence.
  if (w0 === "to") return false;
  if (IMPERATIVE.has(w0)) return true;
  // contraction carries its own verb: it's / that's / they're / you'll
  if (/'(s|re|ll|ve|d|m|t)\b/i.test(raw[0])) return true;
  if (PRONOUN.has(w0)) {
    // pronoun + finite verb, or pronoun + adverb + finite verb
    for (let i = 1; i < Math.min(raw.length, 4); i++) {
      if (FINITE.test(norm(raw[i]))) return true;
    }
    return false;
  }
  // possessive or article opening: "their buying power shrinks", "the client may"
  for (let i = 1; i < raw.length; i++) {
    if (/'(s|re|ll|ve|d)\b/i.test(raw[i])) return true;
    if (FINITE.test(norm(raw[i]))) return true;
  }
  return false;
}

let tick = 0;
/** Vary the fragment joiner so a single substitute doesn't become the new tell. */
function joiner() {
  tick++;
  return tick % 3 === 0 ? ": " : ", ";
}

function fixSegment(text) {
  if (!text.includes("—")) return { out: text, n: 0 };
  let n = 0;
  let out = text;

  // 1. Paired em dashes used as brackets.
  out = out.replace(/ — ([^—]{3,90}?) — /g, (_m, inner) => {
    n += 2;
    return inner.includes(",") ? ` (${inner}) ` : `, ${inner}, `;
  });

  // 2. Opening affirmation in feedback: "Right — you should" -> "Right. You should"
  //    Skipped when a conjunction or infinitive follows, which would strand a
  //    fragment ("Right. And one at 18%..." / "Right. To prevent...").
  out = out.replace(/\b(Right|Correct|Exactly|Yes|No|True|False|Wrong|Close|Spot on) — ([a-z]\S*)/g,
    (_m, word, nextWord) => {
      n++;
      const w = norm(nextWord);
      if (CONJUNCTION.has(w) || w === "to") return `${word}, ${nextWord}`;
      return `${word}. ${nextWord.charAt(0).toUpperCase()}${nextWord.slice(1)}`;
    });

  // 3. Remaining single dashes, decided by what actually follows THIS dash.
  //    NOTE: the match is " — x", so offset+3 is the first char of the tail.
  //    Slice from there; do not re-prepend the captured character.
  out = out.replace(/ — (\S)/g, (_m, ch, offset) => {
    n++;
    const full = out.slice(offset + 3, offset + 3 + 110);
    if (CONJUNCTION.has(norm(full.split(/\s+/)[0]))) return `, ${ch}`;
    if (isIndependent(full)) return `. ${ch.toUpperCase()}`;
    return `${joiner()}${ch}`;
  });

  // 4. Any dash without surrounding spaces.
  out = out.replace(/\s*—\s*/g, () => {
    n++;
    return ", ";
  });

  // tidy
  out = out
    .replace(/,\s*,/g, ",")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/:\s*,/g, ":")
    .replace(/\s+([.,:;!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ");

  return { out, n };
}

function processSource(src) {
  let total = 0;
  const out = src.replace(/"((?:[^"\\]|\\.)*)"/g, (whole, body) => {
    if (!body.includes("—")) return whole;
    const { out: fixed, n } = fixSegment(body);
    total += n;
    return `"${fixed}"`;
  });
  return { out, total };
}

const targets = ONLY
  ? [ONLY]
  : [
      ...fs.readdirSync(path.join(ROOT, "src/data/banks")).filter((f) => f.endsWith(".ts")).map((f) => `src/data/banks/${f}`),
      "src/data/concepts.ts",
      "src/data/content-extra.ts",
      "src/data/content.ts",
      "src/data/content-applied.ts",
      "src/data/content-deep-batch.ts",
      "src/data/content-re5.ts",
      "src/data/content-reinforcement.ts",
      "src/data/content-level3.ts",
    ];

let grand = 0;
const changed = [];
for (const rel of targets) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const src = fs.readFileSync(abs, "utf8");
  const { out, total } = processSource(src);
  if (total > 0) {
    grand += total;
    changed.push([rel, total]);
    if (!DRY) fs.writeFileSync(abs, out, "utf8");
  }
}

changed.sort((a, b) => b[1] - a[1]);
changed.forEach(([f, n]) => console.log(`${String(n).padStart(5)}  ${f}`));
console.log(`\n${DRY ? "WOULD FIX" : "FIXED"}: ${grand} em dashes across ${changed.length} files`);
