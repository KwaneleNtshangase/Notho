'use client';

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import { BETA_LABEL, LOCALE_NAMES, localeTag } from './locales';
import { localizeString } from './stringZu';
import english from './english.json';
import { translate, type MessageKey } from './messages';

const buttonStyle = { border: '1px solid #577c82', borderRadius: 8, padding: '8px 10px', minHeight: 44,
  background: '#fff', color: '#133b42', cursor: 'pointer', fontSize: 13, overflowWrap: 'anywhere' as const };

export function TranslationNotice() {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [phrase, setPhrase] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [screen, setScreen] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  if (locale === 'en') return null;
  const l = (source: string) => localizeString(locale, source);
  const close = () => dialog.current?.close();
  const report = () => {
    setPhrase(window.getSelection()?.toString().slice(0, 2000) ?? '');
    setSuggestion('');
    setDownloaded(false);
    // Path only: never capture URL query parameters, account data or screen text.
    setScreen(pathname || '/');
    dialog.current?.showModal();
  };
  const download = (event: React.FormEvent) => {
    event.preventDefault();
    const key = (Object.keys(english) as MessageKey[]).find(k => translate(locale, k) === phrase);
    const payload = { schemaVersion: 1, status: 'needs-review', locale, screen,
      phrase, suggestion, key: key ? `messages:${key}` : null, source: key ? english[key] : null,
      createdAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `notho-translation-${locale}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  return <>
    <aside className="translation-notice" aria-label={l('Translation status')} style={{ background: '#edf7f7', color: '#133b42', padding: '10px 16px', position: 'relative' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', lineHeight: 1.5, fontSize: 13, overflowWrap: 'anywhere' }}>
        <strong lang="en">{LOCALE_NAMES[locale]} ({BETA_LABEL})</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <button type="button" lang="en" onClick={() => setLocale('en')} style={buttonStyle}>Switch to English</button>
          <button type="button" onClick={report} style={buttonStyle}>{t('settings.translationFeedback')}</button>
        </div>
      </div>
    </aside>
    <dialog ref={dialog} aria-labelledby="translation-feedback-title" lang={localeTag(locale)}
      style={{ margin: 'auto', padding: 22, border: '1px solid #577c82', borderRadius: 14, maxWidth: 480, width: 'calc(100% - 24px)', maxHeight: '85vh', overflowY: 'auto', background: 'white', color: '#133b42' }}>
      <h2 id="translation-feedback-title" style={{ fontSize: 20, fontWeight: 700 }}>{l('Translation feedback')}</h2>
      <p>{LOCALE_NAMES[locale]} · {screen}</p>
      <form onSubmit={download} style={{ display: 'grid', gap: 12 }}>
        <label>{l('Phrase shown')}
          <textarea autoFocus required value={phrase} maxLength={2000} onChange={event => setPhrase(event.target.value)} lang={locale}
            style={{ width: '100%', border: '1px solid #809499', padding: 8 }} rows={3} />
        </label>
        <label>{l('Suggested correction or explanation (optional)')}
          <textarea value={suggestion} maxLength={4000} onChange={event => setSuggestion(event.target.value)}
            style={{ width: '100%', border: '1px solid #809499', padding: 8 }} rows={3} />
        </label>
        <p>{l('This saves a review file on your device. Nothing is sent automatically. Share it with your reviewer, or paste its contents into Settings → Send Feedback. Do not include personal or financial details.')}</p>
        <button type="submit" style={buttonStyle}>{l('Download feedback')}</button>
        {downloaded && <p role="status">{l('Feedback file prepared. It has not been sent.')}</p>}
        <button type="button" onClick={close} style={buttonStyle}>{t('common.close')}</button>
      </form>
    </dialog>
  </>;
}
