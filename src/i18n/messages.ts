import type { Locale } from "./locales";

export const messages = {
  en: {
    "nav.learn": "Learn",
    "nav.calculate": "Calculate",
    "nav.budget": "Budget",
    "nav.goals": "Goals",
    "nav.profile": "Profile",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageEn": "English",
    "settings.languageZu": "isiZulu (Beta)",
    "settings.languageHint": "Beta: some words are still in English.",
    "settings.sound": "Sound effects",
    "settings.dailyGoal": "Daily XP Goal",
    "share.lessonDone": "I finished a Notho lesson.",
  },
  zu: {
    "nav.learn": "Funda",
    "nav.calculate": "Bala",
    "nav.budget": "Bhajethi",
    "nav.goals": "Imigomo",
    "nav.profile": "Iphrofayili",
    "settings.title": "Amasethingi",
    "settings.language": "Ulimi",
    "settings.languageEn": "Isingisi",
    "settings.languageZu": "isiZulu (Beta)",
    "settings.languageHint": "Beta: amanye amagama aseseyi-English.",
    "settings.sound": "Umsindo",
    "settings.dailyGoal": "Umgomo we-XP wansuku zonke",
    "share.lessonDone": "Ngiqede isifundo saNotho.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof (typeof messages)["en"];

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const table = messages[locale] ?? messages.en;
  let out: string = table[key] ?? messages.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}
