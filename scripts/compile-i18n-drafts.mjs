import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createJiti } from 'jiti';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(root, 'src') }, fsCache: false });
const { prepareGeneratedDraft } = await jiti.import(path.join(root, 'src/i18n/validation.ts'));
const { preservedSourceReason } = await jiti.import(path.join(root, 'src/i18n/sourceClassification.ts'));
const { LOCALES } = await jiti.import(path.join(root, 'src/i18n/locales.ts'));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const rows = read('output/i18n-inventory/source.json');
const bySource = new Map();
for (const row of rows) {
  const previous = bySource.get(row.source);
  bySource.set(row.source, { ...row, visibility: previous?.visibility === 'public' ? 'public' : row.visibility });
}
const write = (file, data) => {
  const dest = path.join(root, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(data) + '\n');
};
const hash = data => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
const manifest = { version: hash(rows), urls: {} };
const report = { generatedAt: new Date().toISOString(), status: 'incomplete', sourceRows: rows.length, uniqueSources: bySource.size, validation: 'Structural checks only. Generated drafts have not received human or cultural validation.', languages: [] };
const gaps = {};
const reviewMetadata = {};
for (const locale of LOCALES.filter(code => code !== 'en')) {
  reviewMetadata[locale] = Object.create(null);
  const candidates = new Map();
  for (const directory of ['i18n-generation-v3', 'i18n-gemini-generation', 'i18n-batch-generation']) {
    const file = path.join(root, 'output', directory, `${locale}.jsonl`);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
      try {
        const record = JSON.parse(line), previous = candidates.get(record.source);
        const next = prepareGeneratedDraft(record.source, record.translation);
        const prior = previous && prepareGeneratedDraft(record.source, previous.translation);
        if (!previous || prior.issues.length && !next.issues.length
          || prior.value === record.source && next.value !== record.source && !next.issues.length) candidates.set(record.source, record);
      }
      catch { /* An interrupted last checkpoint line is retried, never accepted. */ }
    }
  }
  const publicPack = Object.create(null), privatePack = Object.create(null);
  const rejected = [], missing = [], identical = [], preserved = [];
  for (const [source, row] of bySource) {
    const preservationReason = preservedSourceReason(source);
    if (preservationReason) {
      (row.visibility === 'server' ? privatePack : publicPack)[source] = source;
      preserved.push({ source, reason: preservationReason });
      reviewMetadata[locale][source] = { translation: source, provider: 'English source',
        generationNote: preservationReason, issues: [], status: 'preserved-source-not-a-translation' };
      continue;
    }
    const record = candidates.get(source);
    if (!record) { missing.push(source); continue; }
    const { value, issues } = prepareGeneratedDraft(source, record.translation);
    reviewMetadata[locale][source] = { translation: value, provider: record.provider ?? 'Google free translation endpoint',
      promptRevision: record.promptRevision, generationJob: record.generationJob,
      generationNote: record.reviewNote ?? '', issues, status: issues.length ? 'rejected-draft' : 'generated-unreviewed' };
    if (issues.length) { rejected.push({ source, translation: value, issues, reviewNote: record.reviewNote ?? '' }); continue; }
    if (value === source) identical.push(source);
    (row.visibility === 'server' ? privatePack : publicPack)[source] = value;
  }
  const url = `/locales/${locale}.${hash(publicPack)}.json`;
  manifest.urls[locale] = url;
  report.languages.push({ locale, acceptedPublic: Object.keys(publicPack).length, acceptedPrivate: Object.keys(privatePack).length, preservedSource: preserved.length, missing: missing.length, rejected: rejected.length, unchangedRequiringClassification: identical.length });
  gaps[locale] = { missing, rejected, unchangedRequiringClassification: identical, preservedSource: preserved };
  if (process.argv.includes('--write')) {
    write(`public${url}`, publicPack);
    write(`src/i18n/private/${locale}.json`, privatePack);
  }
}
if (process.argv.includes('--write')) {
  write('src/i18n/catalogManifest.json', manifest);
  write('src/i18n/drafts/bulk-source.json', rows.filter(row => row.visibility === 'public'));
  write('src/i18n/private/source.json', rows.filter(row => row.visibility === 'server'));
}
report.status = report.languages.some(row => row.missing || row.rejected || row.unchangedRequiringClassification)
  ? 'incomplete' : 'complete-generated-drafts-unreviewed';
write('output/i18n-generation-v3/validation.json', report);
write('output/i18n-generation-v3/gaps.json', gaps);
// Local reviewer evidence only. Includes secured exam sources and must never
// be copied into public locale assets or treated as human approval.
write('output/i18n-generation-v3/review-metadata.json', reviewMetadata);
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--require-complete') && report.languages.some(row => row.missing || row.rejected || row.unchangedRequiringClassification)) process.exitCode = 1;
