export const LOCALES = ["en", "zu"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "notho-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zu";
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
