import { localeTag, type Locale } from './locales';
import { localizeString } from './stringZu';

/** Some browsers omit nr/ss/ve/ts date data. Translate their English calendar
 * words through the same reviewed-first resolver, retaining numeric parts. */
export function localizedDate(date: Date, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  const tag = localeTag(locale);
  if (Intl.DateTimeFormat.supportedLocalesOf([tag]).length) return new Intl.DateTimeFormat(tag, options).format(date);
  return new Intl.DateTimeFormat('en-ZA', options).formatToParts(date)
    .map(part => ['month', 'weekday', 'dayPeriod'].includes(part.type) && /[a-z]/i.test(part.value) ? localizeString(locale, part.value) : part.value).join('');
}
