"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  parseLocale,
  isLocale,
  localeTag,
  type Locale,
} from "./locales";
import { translate, type MessageKey } from "./messages";
import { loadCatalog } from "./catalog";
import { TranslationNotice } from "./TranslationNotice";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  catalogRevision?: number;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try { return parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY)); } catch { return DEFAULT_LOCALE; }
}

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCALE_STORAGE_KEY, locale); } catch { /* Private/restricted storage: session choice still works. */ }
  syncDocumentLocale(locale);
}

function syncDocumentLocale(locale: Locale) {
  document.documentElement.lang = localeTag(locale);
  document.cookie = `notho_locale=${locale};path=/;max-age=31536000;samesite=lax`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [catalogRevision, setCatalogRevision] = useState(0);
  useEffect(() => {
    let active = true;
    loadCatalog(locale).then(() => { if (active) setCatalogRevision(value => value + 1); }).catch(() => { /* English fallback remains usable offline. */ });
    return () => { active = false; };
  }, [locale]);
  const choiceVersion = useRef(0);
  const remoteWrite = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    const stored = readStoredLocale();
    let hasLocalChoice = false;
    try { hasLocalChoice = isLocale(localStorage.getItem(LOCALE_STORAGE_KEY)); } catch { /* unavailable */ }
    const version = choiceVersion.current;
    setLocaleState(stored);
    if (hasLocalChoice) persistLocale(stored);
    else syncDocumentLocale(stored);

    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || choiceVersion.current !== version || hasLocalChoice) return;
      const remote = data.user?.user_metadata?.notho_locale;
      if (isLocale(remote) && remote !== stored) {
        setLocaleState(remote);
        persistLocale(remote);
      }
    }).catch(() => { /* Local preference works offline. */ });
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_STORAGE_KEY) return;
      choiceVersion.current += 1;
      const next = parseLocale(event.newValue);
      setLocaleState(next);
      persistLocale(next);
    };
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    const valid = parseLocale(next);
    choiceVersion.current += 1;
    setLocaleState(valid);
    persistLocale(valid);
    // Preserve write order when the user switches quickly. Local choice wins
    // over stale remote metadata and remains usable when signed out/offline.
    remoteWrite.current = remoteWrite.current.catch(() => {}).then(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.auth.updateUser({ data: { notho_locale: valid } });
    }).catch(() => {});
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, catalogRevision }), [locale, setLocale, t, catalogRevision]);

  return <LocaleContext.Provider value={value}><TranslationNotice />{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: MessageKey, vars?: Record<string, string | number>) =>
        translate(DEFAULT_LOCALE, key, vars),
    };
  }
  return ctx;
}
