import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createJiti } from 'jiti';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(root, 'src') }, fsCache: false });
const { CONTENT_DATA } = await jiti.import(path.join(root, 'src/data/content.ts'));
const { LOCALES } = await jiti.import(path.join(root, 'src/i18n/locales.ts'));
const { localizeString } = await jiti.import(path.join(root, 'src/i18n/stringZu.ts'));
const { localizeContent } = await jiti.import(path.join(root, 'src/i18n/contentZu.ts'));
const { translate } = await jiti.import(path.join(root, 'src/i18n/messages.ts'));
const rows = new Map();
const displayFields = new Set(['title','content','question','statement','prompt','instruction','tip','challenge','successMessage','skipMessage','description','insight','explanation','options']);
function add(key, source, context, visibility = 'public', candidate = false) {
  if (!/[\p{L}]/u.test(source)) return;
  const row = rows.get(key) ?? { key, source, visibility, candidate, contexts: [] };
  // A public source already visible in ordinary lessons can remain public.
  if (visibility === 'public') row.visibility = 'public';
  if (!candidate) row.candidate = false;
  if (!row.contexts.includes(context)) row.contexts.push(context);
  rows.set(key, row);
}
function walk(value, context, field = '', visibility = 'public') {
  if (typeof value === 'string') {
    if (displayFields.has(field) || field === 'feedback') add(`strings:${value}`, value, context, visibility);
  } else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${context}[${index}]`, field, visibility));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) {
    walk(item, `${context}.${key}`, field === 'feedback' || key === 'feedback' ? 'feedback' : key, visibility);
  }
}
let lessons = 0;
for (const course of CONTENT_DATA.courses) {
  add(`content:course.${course.id}`, course.title, `/course/${course.id}:title`);
  walk(course.description, `/course/${course.id}:description`, 'description');
  for (const unit of course.units) {
    add(`content:unit.${course.id}.${unit.id}`, unit.title, `/course/${course.id}:unit.${unit.id}`);
    walk(unit.description, `/course/${course.id}:unit.${unit.id}.description`, 'description');
    for (const lesson of unit.lessons) {
      lessons++;
      const context = `/lesson/${course.id}/${lesson.id}`;
      add(`content:lesson.${course.id}.${lesson.id}`, lesson.title, `${context}:title`);
      walk(lesson.steps, `${context}:steps`);
      walk(lesson.layout, `${context}:layout`);
      walk(lesson.slots, `${context}:slots`);
    }
  }
}
// The secured mock answer bank must never be published in a public locale pack.
for (const name of ['a', 'b']) {
  const bankModule = await jiti.import(path.join(root, `src/data/banks/re5-mock-${name}.ts`));
  walk(bankModule[`RE5_MOCK_${name.toUpperCase()}_BANK`], `/lesson/re5-exam-prep/re5-mock-${name}`, '', 'server');
}
const english = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/english.json'), 'utf8'));
for (const [key, source] of Object.entries(english)) add(`messages:${key}`, source, `shared:${key}`);
for (const width of ['long', 'short']) {
  for (let month = 0; month < 12; month++) {
    const source = new Intl.DateTimeFormat('en-ZA', { month: width, timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month, 1)));
    add(`strings:${source}`, source, `calendar:month-${width}`);
  }
  for (let day = 1; day <= 7; day++) {
    const source = new Intl.DateTimeFormat('en-ZA', { weekday: width, timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 5, day)));
    add(`strings:${source}`, source, `calendar:weekday-${width}`);
  }
}
for (const source of ['AM', 'PM', 'Sep', 'Sept']) add(`strings:${source}`, source, 'calendar:abbreviation');

// Capture original source locations for UI review, including complete template
// literals. Candidates are not treated as proven UI coverage until wired.
const attrs = new Set(['declineLabel','detail','emptyDetail','emptyLabel','emptyTitle','hint','lede','message','name','note','sub','subtitle','tooltip','source','one','placeholder','title','alt','aria-label','aria-description','aria-valuetext','label','description']);
const labels = new Set(['label','title','description','message','error','subtitle','sub','desc','hint','text','name','emptyMessage','buttonText']);
// Only conditional result branches are displayed; comparisons such as
// frequency === 'monthly' remain control values.
function renderedLiteral(node, sourceFile) {
  let current = node;
  while (current.parent && (ts.isParenthesizedExpression(current.parent)
    || ts.isConditionalExpression(current.parent)
      && (current.parent.whenTrue === current || current.parent.whenFalse === current))) current = current.parent;
  const expression = current.parent;
  if (!expression || !ts.isJsxExpression(expression)) return false;
  const owner = expression.parent;
  return ts.isJsxElement(owner) || ts.isJsxFragment(owner)
    || ts.isJsxAttribute(owner) && attrs.has(owner.name.getText(sourceFile));
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? /__tests__|api|emails/.test(entry.name) ? [] : files(path.join(dir, entry.name))
    : /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path.join(dir, entry.name)] : []);
}
function jsxText(raw) {
  const lines = raw.replace(/\t/g, ' ').split(/\r\n|\n|\r/);
  let last = 0; lines.forEach((line, i) => { if (/[^ ]/.test(line)) last = i; });
  return lines.map((line, i) => {
    if (i) line = line.replace(/^ +/, '');
    if (i < lines.length - 1) line = line.replace(/ +$/, '');
    return line ? line + (i < last ? ' ' : '') : '';
  }).join('');
}
for (const filename of [...files(path.join(root, 'src/components')), ...files(path.join(root, 'src/app')), ...files(path.join(root, 'src/lib')), ...files(path.join(root, 'src/hooks')), ...files(path.join(root, 'src/app/api')), ...['TranslationNotice.tsx', 'LanguageSelector.tsx'].map(name => path.join(root, 'src/i18n', name)), ...['gamificationExtras.ts','concepts.ts','content-extra.ts'].map(name => path.join(root,'src/data',name))]) {
  const code = fs.readFileSync(filename, 'utf8');
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, filename.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const isApi = filename.includes('/src/app/api/');
  function visit(node) {
    if (ts.isJsxElement(node) && ['style', 'script'].includes(node.openingElement.tagName.getText(sourceFile))) return;
    if (ts.isVariableDeclaration(node) && /(?:^|_)SCRIPT$/.test(node.name.getText(sourceFile))) return;
    if (ts.isArrayLiteralExpression(node) && node.elements.length
      && node.elements.every(item => ts.isStringLiteralLike(item) && LOCALES.includes(item.text))) return;
    if (ts.isBinaryExpression(node) && /\.style\.cssText$/.test(node.left.getText(sourceFile))) return;
    if (ts.isAsExpression(node) && /CSSProperties/.test(node.type.getText(sourceFile))) return;
    // Class templates, SVG paths and control values must stay executable.
    // Continue through event handlers and custom props: they may contain
    // user-facing messages or literal values for a translated template.
    if (ts.isJsxAttribute(node) && /^(?:className|class|style|id|key|href|src|d|fill|stroke|viewBox|htmlFor|as|type|value|data-.+)$/.test(node.name.getText(sourceFile))) return;
    // Styling is executable presentation data, never a translation source.
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === 'style') return;
    if (ts.isVariableDeclaration(node) && (/(?:^|_)css$/i.test(node.name.getText(sourceFile))
      || /CSSProperties/.test(node.type?.getText(sourceFile) ?? ''))) return;
    if (ts.isPropertyAssignment(node) && node.name.getText(sourceFile) === 'style') return;
    if (ts.isCaseClause(node)) {
      node.statements.forEach(visit); return;
    }
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(node.operatorToken.kind)) {
      if (!ts.isStringLiteralLike(node.left)) visit(node.left);
      if (!ts.isStringLiteralLike(node.right)) visit(node.right);
      return;
    }
    if (ts.isPropertyAssignment(node) && /^(?:boxShadow|border|borderTop|borderBottom|borderLeft|borderRight|background|backgroundColor|fontFamily|fontWeight|fontSize|display|position|alignItems|justifyContent|overflow|overflowX|overflowY|whiteSpace|wordBreak|textTransform|objectFit|pointerEvents|transition|transform|color|stroke|fill|letterSpacing|cursor|method|encoding|userAgent|@type|@context)$/.test(node.name.getText(sourceFile).replace(/['"]/g, ''))) return;
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile);
      if (/^(?:console\.|(?:window\.)?(?:localStorage|sessionStorage)\.)/.test(callee)) return;
      // These arguments identify browser events/elements, database fields or
      // request metadata. Their literals are not rendered copy.
      if (/\.(?:addEventListener|removeEventListener|querySelector|querySelectorAll|getElementById|getAttribute|setAttribute|createElement|createElementNS|from|rpc|select|eq|neq|order|in|ilike|includes|startsWith|endsWith|normalize)$/.test(callee)) {
        for (const argument of node.arguments) if (!ts.isStringLiteralLike(argument)) visit(argument);
        return;
      }
    }
    let source, candidate = false;
    if ((filename.endsWith('/report/pdf.tsx') || ts.isJsxElement(node) && node.openingElement.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.getText(sourceFile) === 'as' && attr.initializer?.text === 'option')) && ts.isJsxElement(node)
      && node.children.every(c => ts.isJsxText(c) || ts.isJsxExpression(c))) {
      let index = 0;
      const phrase = node.children.map(c => ts.isJsxText(c) ? jsxText(c.text) : c.expression ? `{value${index++}}` : '').join('');
      if (/[A-Za-z]/.test(phrase.replace(/\{value\d+\}/g, ''))) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
        add(`strings:${phrase}`, phrase, `${path.relative(root, filename)}:${line}`);
      }
    }
    if (ts.isJsxText(node)) source = jsxText(node.text);
    else if (ts.isStringLiteralLike(node)) {
      const parent = node.parent;
      if (ts.isJsxAttribute(parent) && attrs.has(parent.name.getText(sourceFile))) source = node.text;
      else if (ts.isPropertyAssignment(parent) && labels.has(parent.name.getText(sourceFile).replace(/['"]/g, ''))) { source = node.text; candidate = true; }
      else if (ts.isCallExpression(parent) && ((parent.expression.getText(sourceFile) === 'localizeString' && parent.arguments[1] === node) || (parent.expression.getText(sourceFile) === 'localizeClientString' && parent.arguments[0] === node))) source = node.text;
      else if (renderedLiteral(node, sourceFile)) source = node.text;
      else if (ts.isCallExpression(parent) && /^(alert|confirm|setError|setMessage|toast(?:\.\w+)?)$/.test(parent.expression.getText(sourceFile))) { source = node.text; candidate = true; }
      else if (!ts.isLiteralTypeNode(parent) && !ts.isImportDeclaration(parent) && !ts.isExportDeclaration(parent)
        && !(ts.isPropertyAssignment(parent) && parent.name === node)
        && !(ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
        && !(ts.isJsxAttribute(parent) && !attrs.has(parent.name.getText(sourceFile)))
        && !ts.isExpressionStatement(parent)
        && /[A-Za-z]/.test(node.text)
        && (/[A-Za-z]{2}\s+[A-Za-z]/.test(node.text) || /^[A-Za-z]{2,}(?:[!?…])?$/.test(node.text))) {
        source = node.text; candidate = true;
      }
    } else if (ts.isTemplateExpression(node)) {
      source = node.head.text + node.templateSpans.map((span, i) => `{value${i}}${span.literal.text}`).join('');
      candidate = true;
      if (!/\s/.test(source) || /(?:className|style)=/.test(node.parent.getText(sourceFile).slice(0, 25))) source = undefined;
    }
    // API sources are limited to literal user-facing response fields. Never
    // export system prompts, provider request text, SQL, or server identifiers.
    if (isApi && !(node.parent && ts.isPropertyAssignment(node.parent)
      && ['error', 'message'].includes(node.parent.name.getText(sourceFile).replace(/['"]/g, ''))
      && typeof source === 'string' && /\s/.test(source))) source = undefined;
    // SVG path commands and decorative icon markup are code, not prose.
    if (source && (/^[MLACQSTHVZ](?:\s+(?:\{value\d+\}|[-\d.,]+))+$/.test(source)
      || /^<svg\b/.test(source) && /aria-hidden="true"/.test(source) && !/<(?:text|title|desc)\b/.test(source))) source = undefined;
    if (source && source.trim() && !/^(?:https?:|\/[\w/]|#[a-f\d]{3,8}$)/i.test(source)) {
      const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      add(`strings:${source}`, source, `${path.relative(root, filename)}:${location.line + 1}`, 'public', candidate);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}
const catalog = [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
const resolved = (loc, row) => row.key.startsWith('messages:') ? translate(loc, row.key.slice(9)) : row.key.startsWith('content:') ? localizeContent(loc, row.key.slice(8), row.source) : localizeString(loc, row.source);
const coverage = LOCALES.filter(code => code !== 'en').map(locale => {
  const missing = catalog.filter(row => resolved(locale, row) === row.source);
  return { locale, total: catalog.length, differentFromEnglish: catalog.length - missing.length,
    englishOrUntranslated: missing.length, missingKeys: missing.map(row => row.key) };
});
const output = path.join(root, 'output/i18n-inventory');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'source.json'), JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'coverage.json'), JSON.stringify(coverage, null, 2) + '\n');
const summary = { courses: CONTENT_DATA.courses.length, lessons, sourceRows: catalog.length,
  sourceCharacters: catalog.reduce((n, row) => n + row.source.length, 0),
  serverOnlyRows: catalog.filter(row => row.visibility === 'server').length,
  uiCandidatesRequiringClassification: catalog.filter(row => row.candidate).length,
  coverage: coverage.map(({ locale, total, differentFromEnglish, englishOrUntranslated }) => ({ locale, total, differentFromEnglish, englishOrUntranslated })),
  note: 'A changed string is not proof of linguistic accuracy. Unchanged brand names and genuine shared wording need explicit classification. UI candidates require wiring review; this inventory is not a claim of complete localisation.' };
fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (process.argv.includes('--require-complete') && coverage.some(row => row.englishOrUntranslated > 0)) process.exitCode = 1;
