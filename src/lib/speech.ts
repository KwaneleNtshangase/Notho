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
  let out = ['nr', 'xh', 'zu', 'ss'].includes(locale) ? text : text.replace(/\bNotho\b/gi, 'Notto');

  // Normalise South African Rand amounts for speech so TTS reads them as
  // "900000 rands" instead of "R 900000" (especially with space/NBSP grouping).
  // Matches R followed by digits, spaces, NBSP, commas or periods (decimals).
  out = out.replace(/\bR\s*([\d\s\u00A0,.]+)/gi, (_, digits) => {
    const cleaned = digits.replace(/[\s\u00A0,]/g, '').replace(/\.+$/, '');
    if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) return `R${digits}`;
    const num = cleaned.includes('.') ? cleaned : cleaned.replace(/^0+/, '') || '0';
    return `${num} rands`;
  });

  return out;
}
