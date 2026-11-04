import type { Locale } from '@/i18n/locales';

export const VOICE_STORAGE_KEY = 'notho-tts-voice-key';
export function voiceKey(voice: SpeechSynthesisVoice): string {
  return `${voice.name}||${voice.lang}`;
}

export function voicesForLocale(voices: readonly SpeechSynthesisVoice[], locale: Locale): SpeechSynthesisVoice[] {
  return voices.filter(voice => voice.lang.toLowerCase().split(/[-_]/)[0] === locale)
    .sort((a, b) => {
      const score = (v: SpeechSynthesisVoice) => (/[-_]za$/i.test(v.lang) ? 4 : 0) + (v.default ? 2 : 0) + (v.localService ? 1 : 0);
      return score(b) - score(a);
    });
}

export function preferredVoice(voices: readonly SpeechSynthesisVoice[], locale: Locale, saved: string): SpeechSynthesisVoice | null {
  const matching = voicesForLocale(voices, locale);
  return matching.find(voice => voiceKey(voice) === saved) ?? matching[0] ?? null;
}

// Speech-only pronunciation hint requested by the brand owner. Native Nguni
// voices retain the original spelling; other voices use the approximate “Notto”.
export function speechText(text: string, locale: Locale): string {
  return ['nr', 'xh', 'zu', 'ss'].includes(locale) ? text : text.replace(/\bNotho\b/gi, 'Notto');
}
