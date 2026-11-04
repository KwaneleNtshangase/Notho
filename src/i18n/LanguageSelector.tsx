'use client';

import { useId } from 'react';
import { useLocale } from './LocaleProvider';
import { BETA_LABEL, LOCALES, LOCALE_NAMES, parseLocale } from './locales';

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
  const id = useId();
  return <div style={{ width: '100%', minWidth: 0, marginBottom: 12 }}>
    <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
      {t('settings.language')}{locale !== 'en' && <span lang="en"> / Language</span>}
    </label>
    <select id={id} value={locale} onChange={event => setLocale(parseLocale(event.target.value))}
      style={{ width: '100%', maxWidth: '100%', minHeight: 44, padding: '10px 8px', borderRadius: 10,
        border: '1px solid #809499', background: 'var(--color-surface, white)', color: 'var(--color-text-primary, #182c30)', fontSize: 14 }}>
      {LOCALES.map(code => <option key={code} value={code} lang={code}>
        {LOCALE_NAMES[code]}{code === 'en' ? '' : ` (${BETA_LABEL})`}
      </option>)}
    </select>
  </div>;
}
