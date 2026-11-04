import { describe, it, expect } from 'vitest';
import { preferredVoice, speechText, voiceKey, voicesForLocale } from '../speech';
import { LOCALES } from '@/i18n/locales';

const voice = (lang: string, name = lang) => ({ lang, name, default: false, localService: true, voiceURI: name } as SpeechSynthesisVoice);
describe('language-specific read aloud', () => {
  it('requires an installed matching voice for every locale', () => {
    for (const locale of LOCALES) {
      expect(voicesForLocale([voice(`${locale}-ZA`)], locale)).toHaveLength(1);
      if (locale !== 'en') expect(preferredVoice([voice('en-ZA')], locale, '')).toBeNull();
    }
    expect(voicesForLocale([voice('nd-ZW')], 'nr')).toEqual([]);
    expect(voicesForLocale([voice('nso-ZA')], 'st')).toEqual([]);
    expect(voicesForLocale([], 'en')).toEqual([]);
  });
  it('ignores saved voices in a different language and prefers South African voices', () => {
    const english = voice('en-ZA');
    const af = voice('af-ZA');
    expect(preferredVoice([english, af], 'af', voiceKey(english))).toBe(af);
    expect(preferredVoice([voice('en-US'), english], 'en', '')).toBe(english);
  });
  it('honours a saved matching voice and normalizes voice language tags', () => {
    const alternative = voice('AF_za', 'Second');
    expect(preferredVoice([voice('af-ZA'), alternative], 'af', voiceKey(alternative))).toBe(alternative);
  });
  it('uses the requested speech-only brand hint without changing other words', () => {
    expect(speechText('Notho. NOTHO lessons. Noteworthy.', 'en')).toBe('Notto. Notto lessons. Noteworthy.');
    expect(speechText('Notho', 'af')).toBe('Notto');
    for (const locale of ['nr', 'xh', 'zu', 'ss'] as const) expect(speechText('Notho', locale)).toBe('Notho');
  });
});
