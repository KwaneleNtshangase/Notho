import { parseLocale } from './locales';
import { localizeString } from './stringZu';

/** For user-triggered canvas/export helpers outside a React render. */
export function localizeClientString(source: string): string {
  const locale = typeof document === 'undefined' ? 'en' : parseLocale(document.documentElement.lang.split('-')[0]);
  return localizeString(locale, source);
}
