import { createJiti } from 'jiti';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(ROOT, 'src') }, interopDefault: true, fsCache: false });
const content = await jiti.import(path.join(ROOT, 'src/data/content.ts'));
const banks = await jiti.import(path.join(ROOT, 'src/data/banks/index.ts'));
const conceptsMod = await jiti.import(path.join(ROOT, 'src/data/concepts.ts'));
const LESSON_BANKS = banks.LESSON_BANKS;
const CONCEPT_IDS = new Set(conceptsMod.CONCEPTS.map(c => c.id));
const DATA = content.CONTENT_DATA.courses;

const errs = [], warns = [];
const lessonKeys = new Set();
let total = 0, banked = 0; const missing = [];
for (const c of DATA) for (const u of c.units) for (const l of u.lessons) {
  total++; const key = `${c.id}::${l.id}`; lessonKeys.add(key);
  if (LESSON_BANKS[key]) banked++; else missing.push(key);
}
for (const k of Object.keys(LESSON_BANKS)) if (!lessonKeys.has(k)) errs.push(`ORPHAN bank key: ${k}`);

const slotIds = new Map(), variantIds = new Map();
let slotCount = 0, variantCount = 0;
for (const [key, bank] of Object.entries(LESSON_BANKS)) {
  const declared = new Set(bank.slots.map(s => s.slotId));
  let qCount = 0;
  for (const item of bank.layout) {
    if (item && typeof item === 'object' && 'slot' in item) {
      qCount++;
      if (!declared.has(item.slot)) errs.push(`BROKEN slotRef ${key} -> ${item.slot}`);
    } else if (['mcq','scenario','true-false','fill-blank'].includes(item.type)) qCount++;
  }
  if (qCount <= 3) errs.push(`TOO FEW questions (${qCount}) in ${key}`);
  const refd = new Set(bank.layout.filter(i => i && typeof i === 'object' && 'slot' in i).map(i => i.slot));
  for (const s of bank.slots) {
    slotCount++;
    if (!refd.has(s.slotId)) warns.push(`UNREFERENCED slot ${key} -> ${s.slotId}`);
    if (slotIds.has(s.slotId)) errs.push(`DUP slotId ${s.slotId} (${slotIds.get(s.slotId)} & ${key})`);
    slotIds.set(s.slotId, key);
    if (!s.conceptId) errs.push(`MISSING conceptId ${s.slotId}`);
    else if (!CONCEPT_IDS.has(s.conceptId)) errs.push(`UNKNOWN conceptId "${s.conceptId}" on ${s.slotId}`);
    if (!s.variants || s.variants.length < 2) errs.push(`<2 variants on ${s.slotId}`);
    for (const v of s.variants ?? []) {
      variantCount++;
      if (variantIds.has(v.variantId)) errs.push(`DUP variantId ${v.variantId} (${variantIds.get(v.variantId)} & ${s.slotId})`);
      variantIds.set(v.variantId, s.slotId);
      const st = v.step;
      if (!st || !st.type) { errs.push(`BAD step ${v.variantId}`); continue; }
      if (st.type === 'mcq' || st.type === 'scenario') {
        if (!Array.isArray(st.options) || st.options.length < 3) errs.push(`BAD options ${v.variantId}`);
        if (typeof st.correct !== 'number' || st.correct < 0 || st.correct >= st.options.length) errs.push(`BAD correct idx ${v.variantId}`);
        const lens = st.options.map(o => o.length);
        const max = Math.max(...lens);
        if (lens[st.correct] === max && lens.filter(x => x === max).length === 1) {
          const sorted = [...lens].sort((a,b)=>b-a);
          const margin = Math.round(100*(sorted[0]-sorted[1])/sorted[1]);
          if (margin >= 40) warns.push(`LONGEST-correct +${margin}% ${v.variantId}`);
        }
        if (new Set(st.options).size !== st.options.length) errs.push(`DUP options ${v.variantId}`);
      }
      if (st.type === 'true-false' && typeof st.correct !== 'boolean') errs.push(`BAD tf ${v.variantId}`);
      if (st.type === 'fill-blank' && typeof st.correct !== 'number') errs.push(`BAD fill ${v.variantId}`);
      if (!st.feedback || !st.feedback.correct || !st.feedback.incorrect) errs.push(`MISSING feedback ${v.variantId}`);
    }
  }
}
// legacy lessons still needing >3 questions
for (const c of DATA) for (const u of c.units) for (const l of u.lessons) {
  if (LESSON_BANKS[`${c.id}::${l.id}`]) continue;
  const q = (l.steps ?? []).filter(s => ['mcq','scenario','true-false','fill-blank'].includes(s.type)).length;
  if (q <= 3) errs.push(`LEGACY lesson too few questions (${q}) ${c.id}::${l.id}`);
}
console.log(`COVERAGE  ${banked}/${total} lessons banked  (missing ${missing.length})`);
console.log(`BANKS     ${Object.keys(LESSON_BANKS).length} lessons · ${slotCount} slots · ${variantCount} variants · ${CONCEPT_IDS.size} concepts`);
console.log(`ERRORS    ${errs.length}`);
errs.slice(0, 40).forEach(e => console.log('  ✗ ' + e));
console.log(`WARNINGS  ${warns.length}`);
warns.slice(0, 25).forEach(w => console.log('  ! ' + w));
if (missing.length) { console.log('\nSTILL MISSING:'); const by={}; missing.forEach(m=>{const c=m.split('::')[0]; (by[c]??=[]).push(m.split('::')[1]);}); for(const [c,a] of Object.entries(by)) console.log(`  ${c} (${a.length})`); }
