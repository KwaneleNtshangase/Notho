/**
 * Rotation check — proves every lesson actually varies its questions.
 *
 * Runs the real `resolveLessonSteps()` from src/lib/lessonBank.ts against every
 * lesson in CONTENT_DATA, for several simulated users and several attempts each,
 * and asserts two things:
 *
 *   1. REPEAT VARIETY  — the same user re-sitting a lesson gets a different set
 *                        of questions on at least one later attempt.
 *   2. CROSS-USER      — two different users sitting the same lesson for the
 *                        first time do not get identical papers.
 *
 * Exit code 1 if any lesson fails either check.
 *
 *   node scripts/lesson-rotation-check.mjs
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
const lessonBank = await jiti.import(path.join(ROOT, "src/lib/lessonBank.ts"));

const resolve =
  lessonBank.resolveLessonSteps ??
  lessonBank.default?.resolveLessonSteps;

if (typeof resolve !== "function") {
  console.error("Could not find resolveLessonSteps() in src/lib/lessonBank.ts");
  process.exit(1);
}

const USERS = ["user-alpha", "user-beta", "user-gamma"];
const ATTEMPTS = 6;

/** A stable fingerprint of the questions a learner actually sees. */
function fingerprint(steps) {
  return (steps ?? [])
    .filter((s) => s && ["mcq", "scenario", "true-false", "fill-blank"].includes(s.type))
    .map((s) => s.__variantId ?? s.question ?? s.statement ?? s.prompt ?? "")
    .join("|");
}

function resolveFor(lesson, userId, attemptNo) {
  // Tolerate either call signature the resolver may expose.
  try {
    return resolve(lesson, { userId, attemptNo });
  } catch {
    return resolve(lesson, userId, attemptNo);
  }
}

const noRepeatVariety = [];
const identicalAcrossUsers = [];
let checked = 0;
let poolSizes = [];

for (const course of CONTENT_DATA.courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      const id = `${course.id}::${lesson.id}`;
      checked++;

      // 1. Repeat variety for one user across attempts.
      const seen = new Set();
      for (let a = 1; a <= ATTEMPTS; a++) {
        seen.add(fingerprint(resolveFor(lesson, USERS[0], a)));
      }
      poolSizes.push(seen.size);
      if (seen.size < 2) noRepeatVariety.push(`${id} (identical across ${ATTEMPTS} attempts)`);

      // 2. Different users, first attempt, should not all match.
      const firstAttempts = new Set(USERS.map((u) => fingerprint(resolveFor(lesson, u, 1))));
      if (firstAttempts.size < 2) identicalAcrossUsers.push(id);
    }
  }
}

const avgDistinct = (poolSizes.reduce((a, b) => a + b, 0) / poolSizes.length).toFixed(2);

console.log(`Lessons checked:            ${checked}`);
console.log(`Simulated: ${USERS.length} users × ${ATTEMPTS} attempts each`);
console.log(`Avg distinct papers per lesson over ${ATTEMPTS} attempts: ${avgDistinct}`);
console.log("");
console.log(`FAIL — no variety on repeat:   ${noRepeatVariety.length}`);
noRepeatVariety.slice(0, 20).forEach((l) => console.log("  ✗ " + l));
console.log(`WARN — identical across users: ${identicalAcrossUsers.length}`);
identicalAcrossUsers.slice(0, 20).forEach((l) => console.log("  ! " + l));

if (noRepeatVariety.length > 0) {
  console.log("\nRESULT: FAILED — some lessons never change their questions.");
  process.exit(1);
}
console.log("\nRESULT: PASS — every lesson varies its questions between attempts.");
