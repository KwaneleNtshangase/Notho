import { createJiti } from 'jiti';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(ROOT, 'src') }, interopDefault: true, fsCache: false });
const banks = await jiti.import(path.join(ROOT, 'src/data/banks/index.ts'));
const B = banks.LESSON_BANKS;
const NEW = /^(spx|bdx|cdx|efx|ibx|sax|ppx|txx|sfx|bmx|mpx|rtx|rex|cbx|bfx|r5a|r5b)-/;
const BANNED = [/fast-paced world/i, /it's important to note/i, /let's dive in/i, /simply put/i, /\bPerson A\b/i, /all of the above/i, /none of the above/i];
let n=0, tfTrue=0, tfTot=0; const idx={}, stems=new Map(), dupStems=[], banned=[], types={};
for (const [key,bank] of Object.entries(B)) for (const s of bank.slots) for (const v of s.variants) {
  if (!NEW.test(v.variantId)) continue;
  n++; const st=v.step; types[st.type]=(types[st.type]||0)+1;
  const text = JSON.stringify(st);
  for (const b of BANNED) if (b.test(text)) banned.push(`${v.variantId}: ${b}`);
  const stem = (st.question||st.statement||st.prompt||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
  if (stem) { if (stems.has(stem)) dupStems.push(`${v.variantId} == ${stems.get(stem)}`); else stems.set(stem, v.variantId); }
  if (st.type==='mcq'||st.type==='scenario') idx[st.correct]=(idx[st.correct]||0)+1;
  if (st.type==='true-false') { tfTot++; if (st.correct===true) tfTrue++; }
  // variants within a slot must not repeat the same stem
}
// per-slot: variants should differ in type where possible
let sameTypeSlots=0, totalNewSlots=0;
for (const bank of Object.values(B)) for (const s of bank.slots) {
  if (!s.variants.some(v=>NEW.test(v.variantId))) continue;
  totalNewSlots++;
  const t=new Set(s.variants.map(v=>v.step.type));
  if (t.size===1) sameTypeSlots++;
}
console.log(`NEW variants: ${n}  · slots: ${totalNewSlots}`);
console.log('types:', types);
console.log(`true/false balance: ${tfTrue}/${tfTot} true (${Math.round(100*tfTrue/tfTot)}%)`);
console.log('correct-index distribution (mcq/scenario):', idx);
console.log(`slots where all 3 variants share one type: ${sameTypeSlots}`);
console.log(`duplicate question stems: ${dupStems.length}`); dupStems.slice(0,40).forEach(d=>console.log('  ! '+d));
console.log(`banned-phrase hits: ${banned.length}`); banned.slice(0,10).forEach(b=>console.log('  ! '+b));
