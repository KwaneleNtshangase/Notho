// Audit literal JSX copy and accessibility attributes that bypass localisation.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createJiti } from 'jiti';
const root = process.cwd();
const jiti = createJiti(import.meta.url, { alias: { '@': path.join(root, 'src') }, fsCache: false });
const { preservedSourceReason } = await jiti.import(path.join(root, 'src/i18n/sourceClassification.ts'));
const findings = [];
const attrs = /^(?:title|alt|placeholder|aria-label|aria-description|aria-valuetext)$/;
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!['api', '__tests__'].includes(entry.name)) scan(file); continue; }
    if (!file.endsWith('.tsx')) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const record = (node, kind, text) => findings.push({ file: path.relative(root, file), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, kind, text });
    function visit(node) {
      if (ts.isJsxAttribute(node) && attrs.test(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer)) {
        const tag = node.parent.parent.tagName?.getText(source);
        const text = node.initializer.text;
        if (tag && /^[a-z]/.test(tag) && /[A-Za-z]{2}/.test(text) && !preservedSourceReason(text)) record(node, 'untranslated-attribute', text);
      }
      if (ts.isJsxText(node)) {
        const text = node.text.trim();
        // Character entities, code variable names and formula symbols are not prose.
        if (!/[A-Za-z]{2}/.test(text.replace(/&\w+;/g, '')) || preservedSourceReason(text)) return;
        let parent = node.parent, handled = false;
        while (parent) {
          if (ts.isJsxElement(parent)) {
            const tag = parent.openingElement.tagName.getText(source);
            // Btn is the shared analytics control; it wraps its children in I18nText.
            if (['I18nText', 'LocalizedText', 'LocalizedRichText', 'I18nRich', 'Btn', 'style', 'script', 'code'].includes(tag)) { handled = true; break; }
            if (['I18nElement', 'LocalizedElement'].includes(tag) && parent.openingElement.attributes.properties.some(a => ts.isJsxAttribute(a) && a.name.getText(source) === 'as' && a.initializer?.text === 'option')) { handled = true; break; }
          }
          parent = parent.parent;
        }
        if (!handled) record(node, 'untranslated-text', text);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
scan(path.join(root, 'src/app')); scan(path.join(root, 'src/components'));
console.log(JSON.stringify({ scope: 'Literal JSX copy and native presentation attributes. Dynamic data and custom component props require contextual checks.', findings }, null, 2));
if (findings.length) process.exitCode = 1;
