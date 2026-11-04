import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(root, 'src') }, fsCache: false });
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const { LOCALES } = await jiti.import(path.join(root, 'src/i18n/locales.ts'));
const { translate } = await jiti.import(path.join(root, 'src/i18n/messages.ts'));
const { localizeContent } = await jiti.import(path.join(root, 'src/i18n/contentZu.ts'));
const { stringZu, localizeString } = await jiti.import(path.join(root, 'src/i18n/stringZu.ts'));
const { translationIssues } = await jiti.import(path.join(root, 'src/i18n/validation.ts'));
const { preservedSourceReason } = await jiti.import(path.join(root, 'src/i18n/sourceClassification.ts'));
const { mergeReviews } = await jiti.import(path.join(root, 'src/i18n/review.ts'));
const { CONTENT_DATA } = await jiti.import(path.join(root, 'src/data/content.ts'));
const english = read('src/i18n/english.json');
const content = {}; const strings = {};
const proseFields = new Set(['title','content','question','statement','prompt','instruction','tip','challenge','successMessage','skipMessage','description','insight','explanation']);
function collect(value, key = '') {
  if (typeof value === 'string' && (proseFields.has(key) || key === 'options' || key === 'feedback')) strings[value] = value;
  else if (Array.isArray(value)) value.forEach(item => collect(item, key));
  else if (value && typeof value === 'object') for (const [field, item] of Object.entries(value)) collect(item, key === 'feedback' ? 'feedback' : field);
}
for (const course of CONTENT_DATA.courses) {
  content[`course.${course.id}`] = course.title;
  for (const unit of course.units) {
    content[`unit.${course.id}.${unit.id}`] = unit.title;
    for (const lesson of unit.lessons) content[`lesson.${course.id}.${lesson.id}`] = lesson.title;
  }
  collect(course);
}
for (const source of [...Object.keys(stringZu), ...Object.keys(read('src/i18n/drafts/strings.json').af)]) strings[source] = source;
let sources = Object.fromEntries(Object.entries({ messages: english, content, strings }).flatMap(([namespace, table]) => Object.entries(table).map(([key, source]) => [`${namespace}:${key}`, source])));
const privateMode = process.argv.includes('--private');
const bulkPath = privateMode ? 'src/i18n/private/source.json' : 'src/i18n/drafts/bulk-source.json';
const bulkRows = fs.existsSync(path.join(root, bulkPath)) ? read(bulkPath) : [];
const bulkContexts = new Map(bulkRows.map(row => [row.key, row.contexts]));
if (privateMode) sources = {};
for (const row of bulkRows) sources[row.key] = row.source;
const { installCatalog } = await jiti.import(path.join(root, 'src/i18n/catalog.ts'));
const { resolveTranslation } = await jiti.import(path.join(root, 'src/i18n/validation.ts'));
const manifest = read('src/i18n/catalogManifest.json');
const privatePacks = {};
for (const loc of LOCALES.filter(code => code !== 'en')) {
  const url = manifest.urls[loc];
  if (url && fs.existsSync(path.join(root, 'public', url))) installCatalog(loc, read(`public${url}`));
  const file = `src/i18n/private/${loc}.json`;
  if (privateMode && fs.existsSync(path.join(root, file))) privatePacks[loc] = read(file);
}
const privateReviews = read('src/i18n/reviewed/private-overrides.json');
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const command = process.argv[2] ?? 'check';
const locale = arg('--locale');
const holds = read('src/i18n/drafts/holds.json');
const priority = key => /auth\.|username|debt|invest|retire|business|tax|insurance|scam|credit|estate|re5|privacy|consent|terms|password|13\+|FAIS|POPIA|\bFSP\b|advice|licen[cs]|delet|personal information/i.test(key) ? 'priority-human-review' : 'human-review';
const resolved = (loc, key, source) => privateMode ? resolveTranslation(source, privateReviews[loc]?.[key], undefined, privatePacks[loc]?.[source]) : key.startsWith('messages:') ? translate(loc, key.slice(9)) : key.startsWith('content:') ? localizeContent(loc, key.slice(8), source) : localizeString(loc, source);
const storePath = path.join(root, privateMode ? 'src/i18n/reviewed/private-overrides.json' : 'src/i18n/reviewed/overrides.json');
if (command === 'import') {
  const file = arg('--file'); if (!file) throw new Error('Pass --file reviewed.json. Dry run is default; --apply writes.');
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  const current = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const merged = mergeReviews(current, rows, sources, process.argv.includes('--replace'));
  if (process.argv.includes('--apply')) {
    const backup = `${storePath}.${Date.now()}.bak`;
    fs.copyFileSync(storePath, backup, fs.constants.COPYFILE_EXCL);
    fs.writeFileSync(`${storePath}.tmp`, JSON.stringify(merged, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(`${storePath}.tmp`, storePath);
    console.log(`Imported ${rows.length} approvals. Backup: ${backup}`);
  } else console.log(`Validated ${rows.length} approvals; no files changed. Add --apply to import.`);
} else if (command === 'export') {
  if (!LOCALES.includes(locale) || locale === 'en') throw new Error('Pass --locale af|nr|xh|zu|nso|st|tn|ss|ve|ts.');
  const output = arg('--out'); if (!output) throw new Error('Pass --out review.json. Existing files are never overwritten.');
  const approved = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const evidenceFile = 'output/i18n-generation-v3/review-metadata.json';
  const evidence = fs.existsSync(path.join(root, evidenceFile)) ? read(evidenceFile)[locale] ?? {} : {};
  const rows = Object.entries(sources).map(([key, source]) => {
    const translation = resolved(locale, key, source);
    const draft = evidence[source];
    const applies = draft && (draft.translation === translation || translation === source && draft.issues?.length);
    return { locale, key, source, translation,
    status: approved[locale]?.[key]?.status === 'approved' && approved[locale][key].source === source ? 'approved' : 'needs-review',
    reviewer: approved[locale]?.[key]?.reviewer ?? '', reviewedAt: approved[locale]?.[key]?.reviewedAt ?? '',
    priority: priority(`${key} ${source}`), contexts: bulkContexts.get(key) ?? [],
    fallbackReason: holds[locale]?.[key] ?? (translation === source ? applies ? (draft.issues ?? []).join(', ') : 'English fallback or unchanged wording requiring classification' : ''),
    draftProvider: applies ? draft.provider : '', generationNote: applies ? draft.generationNote : '',
    promptRevision: applies ? draft.promptRevision ?? '' : '', generationJob: applies ? draft.generationJob ?? '' : '',
    sourcePreservationReason: applies && draft.status === 'preserved-source-not-a-translation' ? draft.generationNote : '',
    note: 'Generation notes are unverified provider output, not human review. Check meaning in screen context, register, spelling and accessibility. Source references do not validate generated sentences.' };
  });
  fs.writeFileSync(output, JSON.stringify(rows, null, 2) + '\n', { flag: 'wx' });
  console.log(`Exported ${rows.length} review rows for ${locale}.`);
} else if (command === 'check') {
  const failures = []; const coverage = [];
  if (privateMode) throw new Error('Use --private for review export/import only. Bulk integrity is checked by compile-i18n-drafts.mjs.');
  const sourceSnapshot = read('src/i18n/drafts/source.json');
  const titleSnapshot = read('src/i18n/drafts/content-source.json');
  const contentDrafts = read('src/i18n/drafts/content.json');
  const stringDrafts = read('src/i18n/drafts/strings.json');
  for (const loc of LOCALES.filter(code => code !== 'en')) {
    const draft = read(`src/i18n/drafts/${loc}.json`);
    for (const key of Object.keys(english)) if (!Object.hasOwn(draft, key)) failures.push(`${loc}:missing:${key}`);
    for (const [namespace, table] of Object.entries({ messages: draft, content: contentDrafts[loc], strings: stringDrafts[loc] })) for (const [key, value] of Object.entries(table)) {
      const source = sources[`${namespace}:${key}`];
      if (source === undefined) failures.push(`${loc}:unknown:${namespace}:${key}`);
      else {
        if (namespace === 'messages' && sourceSnapshot[key] !== source || namespace === 'content' && titleSnapshot[key] !== source) failures.push(`${loc}:stale:${key}`);
        for (const issue of translationIssues(source, value)) failures.push(`${loc}:${key}:${issue}`);
      }
    }
    const counts = {};
    for (const [namespace, table] of Object.entries({ messages: english, content, strings })) {
      const entries = Object.entries(table);
      counts[namespace] = { total: entries.length, translated: entries.filter(([key, source]) => resolved(loc, `${namespace}:${key}`, source) !== source).length };
    }
    coverage.push({ locale: loc, ...counts });
  }
  const approvals = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  for (const [loc, entries] of Object.entries(approvals)) for (const [key, entry] of Object.entries(entries)) {
    try { mergeReviews({}, [{ ...entry, key, locale: loc }], sources); } catch (error) { failures.push(error.message); }
  }
  const effective = LOCALES.filter(code => code !== 'en').map(loc => {
    let translated = 0, preserved = 0;
    const englishFallbackKeys = [];
    for (const [key, source] of Object.entries(sources)) {
      const value = resolved(loc, key, source);
      if (value !== source) translated++;
      else if (preservedSourceReason(source)) preserved++;
      else englishFallbackKeys.push(key);
    }
    return { locale: loc, totalKeys: Object.keys(sources).length, translated, preservedSource: preserved,
      englishFallback: englishFallbackKeys.length, englishFallbackKeys };
  });
  if (arg('--coverage-out')) fs.writeFileSync(arg('--coverage-out'), JSON.stringify(effective, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ coverage, effectiveCoverage: effective.map(({ englishFallbackKeys, ...counts }) => counts), failures,
    pluralNote: 'Rendered count phrases use Intl.PluralRules. Shared messages use simple interpolation; unsupported ICU syntax is rejected, not approximated.',
    scope: 'Effective coverage resolves all public source keys through approved, legacy and generated wording. Preserved source literals are not counted as translations. Private exam coverage is reported separately by the compiler.' }, null, 2));
  if (failures.length) process.exitCode = 1;
} else throw new Error(`Unknown command: ${command}`);
