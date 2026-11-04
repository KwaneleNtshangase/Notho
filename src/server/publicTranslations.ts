import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import manifest from '@/i18n/catalogManifest.json';
import { installCatalog } from '@/i18n/catalog';
import { localizeString } from '@/i18n/stringZu';
import type { Locale } from '@/i18n/locales';

const loaded = new Map<Locale, Promise<void>>();
/** Public wording only. Secured exam explanations never enter report exports. */
export async function publicTranslator(locale: Locale): Promise<(source: string) => string> {
  if (locale === 'en') return source => source;
  if (!loaded.has(locale)) loaded.set(locale, (async () => {
    const url = (manifest.urls as Record<string, string>)[locale];
    if (url) installCatalog(locale, JSON.parse(await readFile(path.join(process.cwd(), 'public', url), 'utf8')));
  })().catch(() => { loaded.delete(locale); }));
  await loaded.get(locale);
  return source => localizeString(locale, source);
}
