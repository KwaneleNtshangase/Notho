import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextRequest } from 'next/server';
import { parseLocale } from '@/i18n/locales';
import { resolveTranslation, type ReviewedPacks } from '@/i18n/validation';
import approved from '@/i18n/reviewed/overrides.json';
import privateApproved from '@/i18n/reviewed/private-overrides.json';
import { stringZu } from '@/i18n/stringZu';
import manifest from '@/i18n/catalogManifest.json';
import { mockJson } from './mockAttemptSecurity';

const cache = new Map<string, Promise<Record<string, string>>>();
const fields = new Set(['prompt','content','text','explanation','areaLabel','title','error','message']);
async function catalog(locale: string) {
  if (!cache.has(locale)) cache.set(locale, (async () => {
    const url = (manifest.urls as Record<string, string>)[locale];
    if (!url) return {};
    const packs = await Promise.allSettled([
      readFile(path.join(process.cwd(), 'public', url), 'utf8').then(JSON.parse),
      readFile(path.join(process.cwd(), 'src/i18n/private', `${locale}.json`), 'utf8').then(JSON.parse),
    ]);
    if (packs.some(pack => pack.status === 'rejected')) cache.delete(locale);
    return Object.assign({}, ...packs.map(pack => pack.status === 'fulfilled' ? pack.value : {})) as Record<string, string>;
  })().catch(() => { cache.delete(locale); return {}; }));
  return cache.get(locale)!;
}

/** Called only on the already-redacted response, never on stored answer keys. */
export function translateMockPresentation(value: unknown, translations: Record<string, string>, key = '', locale = 'en'): unknown {
  if (typeof value === 'string') {
    if (!fields.has(key)) return value;
    const publicWording = resolveTranslation(value, (approved as ReviewedPacks)[locale]?.[`strings:${value}`],
      locale === 'zu' ? stringZu[value] : undefined, translations[value]);
    return resolveTranslation(value, (privateApproved as ReviewedPacks)[locale]?.[`strings:${value}`], undefined, publicWording);
  }
  if (Array.isArray(value)) return value.map(item => translateMockPresentation(item, translations, key, locale));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, translateMockPresentation(item, translations, field, locale)]));
  return value;
}
export async function localizedMockJson(req: NextRequest, body: unknown, status = 200) {
  const locale = parseLocale(req.headers.get('x-notho-locale') ?? req.cookies.get('notho_locale')?.value);
  return mockJson(locale === 'en' ? body : translateMockPresentation(body, await catalog(locale), '', locale), status);
}
