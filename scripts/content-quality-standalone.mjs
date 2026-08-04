/**
 * Standalone port of src/data/__tests__/contentQuality.test.ts
 *
 * Vitest cannot run in every environment (it OOMs / bus-errors on constrained
 * machines). This reproduces EVERY assertion in that test file, using the same
 * collect() logic and the same ratchet thresholds, so the guarantees can be
 * checked anywhere Node runs.
 *
 * It is a safety net, not a replacement — run the real suite when you can.
 *
 *   node scripts/content-quality-standalone.mjs
 *
 * Exit code 1 if any assertion fails.
 */
import { createJiti } from "jiti";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jiti = createJiti(import.meta.url, {
  alias: { "@": path.join(ROOT, "src") },
  interopDefault: true,
  fsCache: false,
});

const { CONTENT_DATA } = await jiti.import(path.join(ROOT, "src/data/content.ts"));
const { LESSON_BANKS } = await jiti.import(path.join(ROOT, "src/data/banks/index.ts"));
const { CONCEPTS } = await jiti.import(path.join(ROOT, "src/data/concepts.ts"));

const failures = [];
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failures.push(`${name}${detail ? " — " + detail : ""}`);
}

// ── collect(): mirrors the test file exactly (LEGACY lesson.steps only) ──────
const optionQs = [];
let tfTrue = 0;
let tfTotal = 0;
const lessonIds = [];
for (const course of CONTENT_DATA.courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      lessonIds.push(`${course.id}:${lesson.id}`);
      for (const s of lesson.steps ?? []) {
        if ((s.type === "mcq" || s.type === "scenario") && Array.isArray(s.options) && typeof s.correct === "number") {
          optionQs.push({ course: course.id, lesson: lesson.id, options: s.options, correct: s.correct });
        }
        if (s.type === "true-false") {
          tfTotal++;
          if (s.correct === true) tfTrue++;
        }
      }
    }
  }
}

function lengthStats(q) {
  const lens = q.options.map((o) => (o ?? "").length);
  const max = Math.max(...lens);
  const uniquelyLongest = lens[q.correct] === max && lens.filter((l) => l === max).length === 1;
  const sorted = [...lens].sort((a, b) => b - a);
  const marginPct = sorted[1] ? Math.round((100 * (sorted[0] - sorted[1])) / sorted[1]) : 0;
  return { uniquelyLongest, marginPct };
}

const QT = new Set(["mcq", "scenario", "true-false", "fill-blank"]);
function lessonQuestionCount(lesson) {
  if (Array.isArray(lesson.layout) && Array.isArray(lesson.slots) && lesson.slots.length > 0) {
    let n = 0;
    for (const item of lesson.layout) {
      if (item && typeof item === "object" && "slot" in item) n++;
      else if (item && QT.has(item.type)) n++;
    }
    return n;
  }
  return (lesson.steps ?? []).filter((s) => QT.has(s.type)).length;
}

// ── describe("content quality — answer patterns") ────────────────────────────

const badIdx = optionQs.filter((q) => q.correct < 0 || q.correct >= q.options.length);
check("valid correct index on every option question", badIdx.length === 0, `${badIdx.length} bad`);

const MAX_MARGIN_PCT = 100;
const flagrantOffenders = optionQs
  .map((q) => ({ q, s: lengthStats(q) }))
  .filter(({ s }) => s.uniquelyLongest && s.marginPct >= MAX_MARGIN_PCT);
check(
  "no correct answer dwarfs its distractors (>=100% margin)",
  flagrantOffenders.length === 0,
  flagrantOffenders.slice(0, 5).map(({ q, s }) => `${q.course}/${q.lesson} (+${s.marginPct}%)`).join(", ")
);

const MAX_LONGEST_RATE = 0.73;
const longest = optionQs.filter((q) => lengthStats(q).uniquelyLongest).length;
const longestRate = longest / optionQs.length;
check(
  `correct-is-longest rate <= ${MAX_LONGEST_RATE}`,
  longestRate <= MAX_LONGEST_RATE,
  `actual ${(longestRate * 100).toFixed(1)}%`
);

const MAX_FLAGRANT = 147;
const flagrant = optionQs.filter((q) => {
  const s = lengthStats(q);
  return s.uniquelyLongest && s.marginPct >= 40;
}).length;
check(`flagrant (>=40% margin) count <= ${MAX_FLAGRANT}`, flagrant <= MAX_FLAGRANT, `actual ${flagrant}`);

const tfShare = tfTrue / tfTotal;
check(
  "true/false balance within 0.40–0.62",
  tfShare >= 0.4 && tfShare <= 0.62,
  `actual ${(tfShare * 100).toFixed(1)}%`
);

const dupeLessonIds = [...new Set(lessonIds.filter((id, i) => lessonIds.indexOf(id) !== i))];
check("lesson ids are unique", dupeLessonIds.length === 0, dupeLessonIds.join(", "));

const short = [];
for (const course of CONTENT_DATA.courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      const n = lessonQuestionCount(lesson);
      if (n <= 3) short.push(`${course.id}/${lesson.id}=${n}`);
    }
  }
}
check("every lesson has more than 3 questions", short.length === 0, short.slice(0, 5).join(", "));

// ── describe("lesson bank guards") ───────────────────────────────────────────

const conceptIds = new Set(CONCEPTS.map((c) => c.id));
const slotIds = new Set();
const variantIds = new Set();
const dupSlots = [];
const dupVariants = [];
for (const bank of Object.values(LESSON_BANKS)) {
  for (const slot of bank.slots) {
    if (slotIds.has(slot.slotId)) dupSlots.push(slot.slotId);
    else slotIds.add(slot.slotId);
    for (const v of slot.variants) {
      if (variantIds.has(v.variantId)) dupVariants.push(v.variantId);
      else variantIds.add(v.variantId);
    }
  }
}
check("no duplicate slotId across LESSON_BANKS", dupSlots.length === 0, dupSlots.slice(0, 5).join(", "));
check("no duplicate variantId across LESSON_BANKS", dupVariants.length === 0, dupVariants.slice(0, 5).join(", "));

const missingConcept = [];
for (const bank of Object.values(LESSON_BANKS)) {
  for (const slot of bank.slots) {
    if (!slot.conceptId) missingConcept.push(`${slot.slotId} (missing conceptId)`);
    else if (!conceptIds.has(slot.conceptId)) missingConcept.push(`${slot.slotId} → ${slot.conceptId}`);
  }
}
check("every slot conceptId exists in CONCEPTS", missingConcept.length === 0, missingConcept.slice(0, 5).join(", "));

const thinSlots = [];
for (const bank of Object.values(LESSON_BANKS)) {
  for (const slot of bank.slots) {
    if (slot.variants.length < 2) thinSlots.push(`${slot.slotId}=${slot.variants.length}`);
  }
}
check("every slot has at least 2 variants", thinSlots.length === 0, thinSlots.slice(0, 5).join(", "));

// ── report ───────────────────────────────────────────────────────────────────
console.log("Standalone port of contentQuality.test.ts\n");
for (const r of results) {
  console.log(`  ${r.ok ? "✓" : "✗"} ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
}
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} assertions passed.`);
if (failures.length) {
  console.log("\nFAILED:");
  failures.forEach((f) => console.log("  ✗ " + f));
  process.exit(1);
}
console.log("RESULT: PASS");
