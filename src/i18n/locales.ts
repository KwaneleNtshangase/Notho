export const LOCALES = ["en", "af", "nr", "xh", "zu", "nso", "st", "tn", "ss", "ve", "ts"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "notho-locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English", af: "Afrikaans", nr: "isiNdebele", xh: "isiXhosa", zu: "isiZulu",
  nso: "Sepedi", st: "Sesotho", tn: "Setswana", ss: "siSwati", ve: "Tshivenda", ts: "Xitsonga",
};

export const BETA_LABEL = "under review";
export const localeTag = (locale: Locale): string => `${locale}-ZA`;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
