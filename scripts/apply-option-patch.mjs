/**
 * Applies option rewrites to src/data/banks/*.ts and src/data/concepts.ts.
 *
 * Input is a JSONL patch file, one object per line:
 *
 *   { "id": "re5-pur-wd-mcq",          // variantId, or "concept:<id>"
 *     "options": ["...", "...", "...", "..."],
 *     "correct": 2,                     // index into the NEW options array
 *     "feedbackCorrect": "...",         // optional, replaces feedback.correct
 *     "feedbackIncorrect": "...",       // optional
 *     "note": "..." }                   // optional, ignored by the patcher
 *
 * Why not a regex: variants are formatted inconsistently (some single-line,
 * some spread over 20 lines), and option strings contain braces, brackets,
 * apostrophes and escaped quotes. So this walks the source with a
 * string-aware scanner: it finds the variant's anchor, then the next
 * `options:` array, and matches brackets while ignoring anything inside a
 * string literal.
 *
 *   node scripts/apply-option-patch.mjs patches/batch-01.jsonl --dry
 *   node scripts/apply-option-patch.mjs patches/batch-01.jsonl
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DRY = process.argv.includes("--dry");
const patchFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (!patchFiles.length) {
  console.error("usage: node scripts/apply-option-patch.mjs <patch.jsonl> [...] [--dry]");
  process.exit(1);
}

// ── load patches ────────────────────────────────────────────────────────────
const patches = new Map();
for (const pf of patchFiles) {
  const abs = path.isAbsolute(pf) ? pf : path.join(ROOT, pf);
  const lines = fs.readFileSync(abs, "utf8").split("\n");
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith("//")) return;
    let p;
    try {
      p = JSON.parse(t);
    } catch (e) {
      throw new Error(`${pf}:${i + 1} is not valid JSON: ${e.message}`);
    }
    if (!p.id) throw new Error(`${pf}:${i + 1} has no id`);
    if (!Array.isArray(p.options) || p.options.length < 2)
      throw new Error(`${pf}:${i + 1} (${p.id}) needs an options array`);
    if (typeof p.correct !== "number" || p.correct < 0 || p.correct >= p.options.length)
      throw new Error(`${pf}:${i + 1} (${p.id}) correct index out of range`);
    if (new Set(p.options.map((o) => o.trim().toLowerCase())).size !== p.options.length)
      throw new Error(`${pf}:${i + 1} (${p.id}) has duplicate options`);
    if (patches.has(p.id)) throw new Error(`duplicate patch for ${p.id}`);
    patches.set(p.id, { ...p, from: `${pf}:${i + 1}` });
  });
}
console.log(`Loaded ${patches.size} patches from ${patchFiles.length} file(s).`);

// ── string-aware scanning helpers ───────────────────────────────────────────
/** Advance past a string literal starting at src[i] (a quote char). */
function skipString(src, i) {
  const q = src[i];
  i++;
  while (i < src.length) {
    if (src[i] === "\\") i += 2;
    else if (src[i] === q) return i + 1;
    else i++;
  }
  throw new Error("unterminated string literal");
}

/**
 * From `start`, find the next occurrence of `needle` that is NOT inside a
 * string literal or a comment.
 */
function findCode(src, needle, start, limit = src.length) {
  let i = start;
  while (i < limit) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i);
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? limit : nl;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i);
      i = end === -1 ? limit : end + 2;
      continue;
    }
    if (src.startsWith(needle, i)) return i;
    i++;
  }
  return -1;
}

/** Given index of `[`, return index just past the matching `]`. */
function matchBracket(src, open) {
  const pairs = { "[": "]", "{": "}", "(": ")" };
  const close = pairs[src[open]];
  let depth = 0;
  let i = open;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i);
      continue;
    }
    if (c === src[open]) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return i + 1;
    }
    i++;
  }
  throw new Error("unbalanced bracket");
}

/**
 * Read the string elements of an array literal spanning [open, close).
 * Handles single, double and backtick quoting and escaped characters, which
 * a blind quote-swap into JSON.parse does not (apostrophes break it).
 */
function parseStringArray(src, open, close) {
  const out = [];
  let i = open + 1;
  while (i < close - 1) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = skipString(src, i);
      const raw = src.slice(i, end);
      const body = raw.slice(1, -1);
      out.push(
        body.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (m, g) => {
          if (g[0] === "u" || g[0] === "x")
            return String.fromCodePoint(parseInt(g.slice(1), 16));
          return { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" }[g] ?? g;
        })
      );
      i = end;
      continue;
    }
    i++;
  }
  return out;
}

/** Serialise a string as a TS double-quoted literal. */
const lit = (s) => JSON.stringify(String(s));

/** Indentation of the line containing index i. */
function indentAt(src, i) {
  const ls = src.lastIndexOf("\n", i) + 1;
  const m = /^[ \t]*/.exec(src.slice(ls, i));
  return m ? m[0] : "";
}

/**
 * Render an options array, matching the surrounding style: inline if the
 * original was inline and the result is short, otherwise one per line.
 */
function renderOptions(options, wasInline, indent) {
  const inline = `[${options.map(lit).join(", ")}]`;
  if (wasInline && inline.length <= 200) return inline;
  const pad = indent + "  ";
  return `[\n${options.map((o) => pad + lit(o)).join(",\n")},\n${indent}]`;
}

// ── patch one file ──────────────────────────────────────────────────────────
const applied = new Set();
const report = [];

function patchFile(relPath, anchorFor) {
  const abs = path.join(ROOT, relPath);
  let src = fs.readFileSync(abs, "utf8");
  const original = src;
  let count = 0;

  // Apply from the end of the file backwards so earlier offsets stay valid.
  const jobs = [];
  for (const [id, p] of patches) {
    const spec = anchorFor(id);
    if (!spec) continue;
    const { anchor, skip = 0 } = typeof spec === "string" ? { anchor: spec } : spec;
    const at = src.indexOf(anchor);
    if (at === -1) continue;
    if (src.indexOf(anchor, at + 1) !== -1)
      throw new Error(`anchor ${anchor} appears more than once in ${relPath}`);
    jobs.push({ id, p, at, skip });
  }
  jobs.sort((a, b) => b.at - a.at);

  for (const { id, p, at, skip } of jobs) {
    // `skip` steps over earlier variants that share the same anchor, which is
    // how the mock-exam helper S(n, concept, v1, v2) packs two questions into
    // one call with template-literal variantIds.
    let optKey = findCode(src, "options:", at);
    for (let s = 0; s < skip && optKey !== -1; s++) optKey = findCode(src, "options:", optKey + 8);
    if (optKey === -1) throw new Error(`no options: after ${id} in ${relPath}`);
    const open = findCode(src, "[", optKey);
    const close = matchBracket(src, open);

    const oldOptions = parseStringArray(src, open, close);

    const corrKey = findCode(src, "correct:", close);
    if (corrKey === -1) throw new Error(`no correct: after options for ${id}`);
    const corrMatch = /^correct:\s*(\d+)/.exec(src.slice(corrKey));
    if (!corrMatch) throw new Error(`could not read correct index for ${id}`);
    const oldCorrect = Number(corrMatch[1]);

    // Safety: the previously-correct answer must still be present unless the
    // patch explicitly acknowledges rewriting it.
    const oldAnswer = oldOptions[oldCorrect];
    const newAnswer = p.options[p.correct];
    if (oldAnswer !== newAnswer && !p.rewritesAnswer) {
      report.push({
        id,
        kind: "answer-text-changed",
        old: oldAnswer,
        new: newAnswer,
      });
    }

    const wasInline = !src.slice(open, close).includes("\n");
    const indent = indentAt(src, optKey);
    const rendered = renderOptions(p.options, wasInline, indent);

    // Replace `correct:` first (it sits after options, so its offset is
    // unaffected by an edit made later at a lower offset).
    src =
      src.slice(0, corrKey) +
      `correct: ${p.correct}` +
      src.slice(corrKey + corrMatch[0].length);
    src = src.slice(0, open) + rendered + src.slice(close);

    // Optional feedback replacement.
    for (const [field, key] of [
      ["feedbackCorrect", "correct"],
      ["feedbackIncorrect", "incorrect"],
    ]) {
      if (p[field] == null) continue;
      const fbKey = findCode(src, "feedback:", at);
      if (fbKey === -1) throw new Error(`no feedback: for ${id}`);
      const fbOpen = findCode(src, "{", fbKey);
      const fbClose = matchBracket(src, fbOpen);
      const kAt = findCode(src, `${key}:`, fbOpen, fbClose);
      if (kAt === -1) throw new Error(`no feedback.${key} for ${id}`);
      const sQ = findCode(src, '"', kAt, fbClose);
      const sEnd = skipString(src, sQ);
      src = src.slice(0, sQ) + lit(p[field]) + src.slice(sEnd);
    }

    applied.add(id);
    count++;
  }

  if (count && !DRY && src !== original) fs.writeFileSync(abs, src, "utf8");
  if (count) console.log(`  ${DRY ? "would patch" : "patched"} ${String(count).padStart(4)}  ${relPath}`);
  return count;
}

// ── run ─────────────────────────────────────────────────────────────────────
/** `r5a-q11-v2` -> the 2nd question inside the `S(11, ...)` call. */
const MOCK = /^r5([ab])-q(\d+)-v(\d+)$/;

let total = 0;
const bankDir = path.join(ROOT, "src/data/banks");
for (const f of fs.readdirSync(bankDir).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  total += patchFile(path.join("src/data/banks", f), (id) => {
    if (id.startsWith("concept:")) return null;
    const m = MOCK.exec(id);
    if (m) {
      // Only look inside the matching mock file, so an r5a id can't hit r5b.
      if (!f.startsWith(`re5-mock-${m[1]}`)) return null;
      return { anchor: `S(${m[2]}, `, skip: Number(m[3]) - 1 };
    }
    return `variantId: "${id}"`;
  });
}
total += patchFile("src/data/concepts.ts", (id) =>
  id.startsWith("concept:") ? `id: "${id.slice(8)}"` : null
);

const missed = [...patches.keys()].filter((id) => !applied.has(id));
console.log(`\n${DRY ? "Would apply" : "Applied"}: ${total}/${patches.size}`);
if (missed.length) {
  console.log(`\nNOT FOUND (${missed.length}):`);
  missed.forEach((id) => console.log(`  ${id}  <- ${patches.get(id).from}`));
  process.exitCode = 1;
}
if (report.length) {
  console.log(`\nAnswer text changed without rewritesAnswer flag (${report.length}):`);
  report.slice(0, 20).forEach((r) => {
    console.log(`  ${r.id}\n    old: ${r.old}\n    new: ${r.new}`);
  });
  process.exitCode = 1;
}
