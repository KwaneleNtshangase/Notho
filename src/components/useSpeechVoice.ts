'use client';

import { useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/locales';
import { preferredVoice, VOICE_STORAGE_KEY, voiceKey, voicesForLocale } from '@/lib/speech';

const memory = new Map<string, string>();
const CHANGE = 'notho-voice-change';
const serverSnapshot = () => '';
function savedVoice(locale: Locale): string {
  const key = `${VOICE_STORAGE_KEY}:${locale}`;
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(key) || localStorage.getItem(VOICE_STORAGE_KEY) || ''; }
  catch { return ''; }
}
function subscribe(listener: () => void) {
  window.speechSynthesis?.addEventListener('voiceschanged', listener);
  window.addEventListener(CHANGE, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.speechSynthesis?.removeEventListener('voiceschanged', listener);
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener('storage', listener);
  };
}

export function useSpeechVoice(locale: Locale) {
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify([
    window.speechSynthesis?.getVoices().map(v => [voiceKey(v), v.default, v.localService]) ?? [], savedVoice(locale),
  ]), serverSnapshot);
  const available = !snapshot || typeof window === 'undefined' ? [] : window.speechSynthesis?.getVoices() ?? [];
  const voices = voicesForLocale(available, locale);
  const voice = preferredVoice(voices, locale, typeof window === 'undefined' ? '' : savedVoice(locale));
  const choose = (key: string) => {
    if (!voices.some(v => voiceKey(v) === key)) return;
    memory.set(`${VOICE_STORAGE_KEY}:${locale}`, key);
    try { localStorage.setItem(`${VOICE_STORAGE_KEY}:${locale}`, key); } catch { /* Keep the session preference. */ }
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new Event(CHANGE));
  };
  return { voices, voice, choose };
}
