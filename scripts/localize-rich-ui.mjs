// Convert static inline-rich phrases to a single contextual translation unit.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const inline = new Set(['strong', 'b', 'em', 'i', 'span', 'a']);
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? /api|__tests__/.test(e.name) ? [] : files(path.join(dir, e.name)) : e.name.endsWith('.tsx') ? [path.join(dir, e.name)] : []);
const changed = [];
for (const file of [...files('src/components'), ...files('src/app')]) {
  const code = fs.readFileSync(file, 'utf8');
  if (!code.includes('LocalizedText as I18nText')) continue;
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  function phrase(node, elements) {
    if (ts.isJsxText(node)) return node.text.replace(/\s+/g, ' ');
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) return node.expression.text;
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sf) === 'I18nText') {
      if (node.attributes.properties.length !== 1) return null;
      const attr = node.attributes.properties[0];
      if (!ts.isJsxAttribute(attr) || attr.name.getText(sf) !== 'source' || !attr.initializer) return null;
      const value = ts.isJsxExpression(attr.initializer) ? attr.initializer.expression : attr.initializer;
      return value && ts.isStringLiteralLike(value) ? value.text : null;
    }
    if (!ts.isJsxElement(node)) return null;
    const tag = node.openingElement.tagName.getText(sf);
    if (tag === 'I18nText') {
      const values = node.children.map(child => phrase(child, elements));
      return values.some(value => value === null) ? null : values.join('');
    }
    if (!inline.has(tag)) return null;
    const index = elements.length;
    elements.push(node.openingElement.getText(sf).replace(/>$/, ` key="inline-${index}" />`));
    const values = node.children.map(child => phrase(child, elements));
    return values.some(value => value === null) ? null : `<${tag}${index}>${values.join('')}</${tag}${index}>`;
  }
  function visit(node) {
    if (ts.isJsxElement(node) && ['p', 'label', 'li', 'div'].includes(node.openingElement.tagName.getText(sf))) {
      const elements = [];
      const values = node.children.map(child => phrase(child, elements));
      if (elements.length && values.every(value => value !== null) && values.join('').replace(/<[^>]+>/g, '').trim().length > 10) {
        const source = values.join('').trim();
        edits.push({ start: node.openingElement.end, end: node.closingElement.getStart(sf), text: `<I18nRich source={${JSON.stringify(source)}} elements={[${elements.join(', ')}]} />` });
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  if (!edits.length) continue;
  const backup = path.join('output/i18n-rich-before', file); fs.mkdirSync(path.dirname(backup), { recursive: true });
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, code);
  let output = code;
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  output = output.replace('LocalizedText as I18nText', 'LocalizedRichText as I18nRich, LocalizedText as I18nText');
  fs.writeFileSync(file, output); changed.push({ file, phrases: edits.length });
}
fs.mkdirSync('output/i18n-rich-before', { recursive: true });
fs.writeFileSync('output/i18n-rich-before/changes.json', JSON.stringify(changed, null, 2));
console.log(JSON.stringify(changed));
