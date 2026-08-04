/**
 * Overlap report — how different are two users' questions, really?
 *
 * The rotation check proves papers are not IDENTICAL. This goes further and
 * measures, per lesson, what share of individual questions two different users
 * actually share on the same attempt. That is the number that matters for
 * "two users doing the same lesson get different questions".
 *
 *   node scripts/lesson-overlap-report.mjs
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
const { resolveLessonSteps } = await jiti.import(path.join(ROOT, "src/lib/lessonBank.ts"));

const PAIRS = 40; // simulated user pairs per lesson
const QT = new Set(["mcq", "scenario", "true-false", "fill-blank"]);

function questionIds(lesson, userId, attemptNo) {
  const steps = resolveLessonSteps(lesson, { userId, attemptNo }) ?? [];
  return steps
    .filter((s) => s && QT.has(s.type))
    .map((s) => s.__variantId ?? s.question ?? s.statement ?? s.prompt ?? "");
}

const rows = [];
let poolTotal = 0;

for (const course of CONTENT_DATA.courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      const key = `${course.id}::${lesson.id}`;
      const bank = LESSON_BANKS[key];
      const slots = bank?.slots?.length ?? 0;
      const variants = (bank?.slots ?? []).reduce((a, s) => a + s.variants.length, 0);
      poolTotal += variants;

      // Theoretical distinct papers = product of variant counts per slot.
      let combos = 1;
      for (const s of bank?.slots ?? []) combos *= s.variants.length;

      let shareSum = 0;
      for (let i = 0; i < PAIRS; i++) {
        const a = questionIds(lesson, `u${i}a`, 1);
        const b = questionIds(lesson, `u${i}b`, 1);
        const setB = new Set(b);
        const shared = a.filter((q) => setB.has(q)).length;
        shareSum += a.length ? shared / a.length : 0;
      }
      const avgShared = shareSum / PAIRS;

      rows.push({
        key,
        slots,
        variants,
        combos,
        perSlot: slots ? (variants / slots).toFixed(1) : "0",
        overlap: avgShared,
      });
    }
  }
}

rows.sort((x, y) => y.overlap - x.overlap);

const mean = rows.reduce((a, r) => a + r.overlap, 0) / rows.length;
const fmt = (n) => `${(n * 100).toFixed(0)}%`;

console.log(`Lessons: ${rows.length}   ·   total variants in pools: ${poolTotal}`);
console.log(`\nAverage share of questions two different users see in common: ${fmt(mean)}`);
console.log(`(With 3 variants per slot, ~33% is the expected floor — one in three by chance.)`);

const byPerSlot = {};
for (const r of rows) {
  const k = r.perSlot;
  (byPerSlot[k] ??= []).push(r);
}
console.log(`\nBy pool depth (variants per slot):`);
for (const [depth, list] of Object.entries(byPerSlot).sort()) {
  const m = list.reduce((a, r) => a + r.overlap, 0) / list.length;
  console.log(`  ${depth} variants/slot — ${String(list.length).padStart(3)} lessons — avg overlap ${fmt(m)}`);
}

console.log(`\nWorst 8 lessons (most overlap between two users):`);
rows.slice(0, 8).forEach((r) =>
  console.log(`  ${fmt(r.overlap).padStart(4)}  ${r.key}  (${r.slots} slots × ${r.perSlot} variants, ${r.combos.toLocaleString()} possible papers)`)
);

console.log(`\nBest 5 (most variety):`);
rows.slice(-5).reverse().forEach((r) =>
  console.log(`  ${fmt(r.overlap).padStart(4)}  ${r.key}  (${r.combos.toLocaleString()} possible papers)`)
);

const minCombos = Math.min(...rows.map((r) => r.combos));
console.log(`\nFewest possible distinct papers for any single lesson: ${minCombos.toLocaleString()}`);
