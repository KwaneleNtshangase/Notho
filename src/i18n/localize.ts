import { catalogString, catalogTemplate } from './catalog';
import contentDrafts from './drafts/content.json';
import stringDrafts from './drafts/strings.json';
import contentSource from './drafts/content-source.json';
import approved from './reviewed/overrides.json';
import holds from './drafts/holds.json';
import { resolveTranslation, type ReviewedPacks } from './validation';

type Packs = Record<string, Record<string, string>>;
export function resolveContent(locale: string, key: string, source: string, legacy?: string): string {
  if (locale === 'en') return source;
  const held = Boolean((holds as Packs)[locale]?.[`content:${key}`]);
  const existing = (contentSource as Record<string, string>)[key] === source ? (contentDrafts as Packs)[locale]?.[key] : undefined;
  return resolveTranslation(source, (approved as ReviewedPacks)[locale]?.[`content:${key}`], legacy,
    held ? undefined : existing ?? catalogString(locale, source));
}
export function resolveString(locale: string, source: string, legacy?: string): string {
  if (locale === 'en') return source;
  return resolveTranslation(source, (approved as ReviewedPacks)[locale]?.[`strings:${source}`], legacy,
    (holds as Packs)[locale]?.[`strings:${source}`] ? undefined : (stringDrafts as Packs)[locale]?.[source] ?? catalogString(locale, source) ?? catalogTemplate(locale, source));
}
