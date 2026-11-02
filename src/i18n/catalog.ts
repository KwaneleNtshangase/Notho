import manifest from './catalogManifest.json';
import { isLocale } from './locales';
import { usableTranslation } from './validation';

type Catalog = Record<string, string>;
const catalogs = new Map<string, Catalog>();
const pending = new Map<string, Promise<void>>();
const templates = new Map<string, { source: string; target: string; parts: string[] }[]>();
const templateResults = new Map<string, Map<string, string | undefined>>();
const slotPattern = /^\{(?:value\d+|count|name|n)\}$/;

export function installCatalog(locale: string, raw: unknown): void {
  if (!isLocale(locale) || locale === 'en' || !raw || typeof raw !== 'object' || Array.isArray(raw)) return;
  const valid: Catalog = Object.create(null);
  for (const [source, target] of Object.entries(raw)) if (usableTranslation(source, target)) valid[source] = target;
  catalogs.set(locale, valid);
  templates.delete(locale);
  templateResults.delete(locale);
}
export function catalogString(locale: string, source: string): string | undefined {
  return catalogs.get(locale)?.[source];
}
export function catalogTemplate(locale: string, text: string): string | undefined {
  const catalog = catalogs.get(locale);
  if (!catalog || text.length > 8000 || text.length < 4 || !/\p{L}/u.test(text)) return undefined;
  const cached = templateResults.get(locale) ?? new Map<string, string | undefined>();
  templateResults.set(locale, cached);
  if (cached.has(text)) return cached.get(text);
  if (!templates.has(locale)) {
    templates.set(locale, Object.entries(catalog).filter(([source]) => /\{(?:value\d+|count|name|n)\}/.test(source))
      .map(([source, target]) => ({ source, target, parts: source.split(/(\{(?:value\d+|count|name|n)\})/g) }))
      .filter(row => row.source.replace(/\{[^}]+\}/g, '').trim().length >= 4
        && row.parts.length <= 17 && !/\}\{/.test(row.source))
      .sort((a, b) => b.source.length - a.source.length));
  }
  let translated: string | undefined;
  for (const row of templates.get(locale)!) {
    let offset = 0, matches = true;
    const values = new Map<string, string>();
    for (let i = 0; i < row.parts.length; i++) {
      const part = row.parts[i];
      if (!slotPattern.test(part)) {
        if (!text.startsWith(part, offset)) { matches = false; break; }
        offset += part.length;
        continue;
      }
      const next = row.parts[i + 1];
      const end = next ? text.indexOf(next, offset) : text.length;
      if (end < 0) { matches = false; break; }
      const value = text.slice(offset, end);
      if (values.has(part) && values.get(part) !== value) { matches = false; break; }
      values.set(part, value); offset = end;
    }
    if (!matches || offset !== text.length) continue;
    // This compatibility matcher handles rendered scalar values, not unknown
    // passages of prose. A broad pattern such as "{value0} year{value1}"
    // must not translate just one word inside an otherwise English lesson.
    const captured = [...values.values()];
    if (captured.some(value => value.length > 160 || /[<>{}\r\n]/.test(value))) continue;
    const fixedText = row.source.replace(/\{[^}]+\}/g, '').trim();
    if (fixedText.length < 12 && captured.some(value => !/^[\d\s.,/%+−–\-()R]+$/.test(value.trim()))) continue;
    const result = row.target.replace(/\{(?:value\d+|count|name|n)\}/g, name => values.get(name) ?? name);
    if (usableTranslation(text, result)) { translated = result; break; }
  }
  if (cached.size >= 2048) cached.clear();
  cached.set(text, translated);
  return translated;
}
export async function loadCatalog(locale: string): Promise<void> {
  if (locale === 'en' || catalogs.has(locale)) return;
  const url = (manifest.urls as Record<string, string>)[locale];
  if (!url) return;
  if (!pending.has(locale)) {
    pending.set(locale, fetch(url).then(async response => {
      if (!response.ok) throw new Error('Language pack unavailable');
      installCatalog(locale, await response.json());
    }).finally(() => { pending.delete(locale); }));
  }
  await pending.get(locale);
}
