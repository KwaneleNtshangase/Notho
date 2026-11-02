import { contentZu, localizeContent } from './contentZu';
import { stringZu, localizeString } from './stringZu';
import { LOCALES } from './locales';
import contentSource from './drafts/content-source.json';
import stringDrafts from './drafts/strings.json';
import approved from './reviewed/overrides.json';
import type { ReviewedPacks } from './validation';

export type LocalePack = { locale: string; content: Record<string, string>; strings: Record<string, string> };

/** Search indexes the same resolved wording the screens show, including approved corrections. */
export const LOCALE_PACKS: LocalePack[] = LOCALES.filter(locale => locale !== 'en').map(locale => {
  const overrides = (approved as ReviewedPacks)[locale] ?? {};
  const sources: Record<string, string> = { ...contentSource };
  for (const [key, entry] of Object.entries(overrides)) if (key.startsWith('content:')) sources[key.slice(8)] ??= entry.source;
  const content = Object.fromEntries(Object.entries(sources).map(([key, source]) => [key, localizeContent(locale, key, source)]));
  // Keep legacy keys not present in today's title catalog searchable.
  if (locale === 'zu') for (const [key, value] of Object.entries(contentZu)) content[key] ??= value;
  const keys = new Set([...Object.keys(stringZu), ...Object.keys(stringDrafts[locale]),
    ...Object.keys(overrides).filter(key => key.startsWith('strings:')).map(key => key.slice(8))]);
  return { locale, content, strings: Object.fromEntries([...keys].map(source => [source, localizeString(locale, source)])) };
});
