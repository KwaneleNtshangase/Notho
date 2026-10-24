export const SITE_URL = "https://www.notho.co.za";
export const SITE_NAME = "Notho";
export const DEFAULT_OG = `${SITE_URL}/notho-logo.png`;
export const ICON_192 = `${SITE_URL}/notho-icon-192.png`;

export const SITE_DESCRIPTION =
  "Notho is a South African financial-literacy app. Learn personal finance in short lessons, run investment and TFSA calculators in rand, and budget from your own numbers. Not an FSP and not financial advice.";

export const DISAMBIGUATION =
  "Notho (notho.co.za) is a South African financial-literacy app. It is not Notto the credit bureau, not uNotho Holdings, and not an FSCA-licensed financial services provider.";

export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/personal-finance",
  "/investment-calculator",
  "/budgeting",
  "/financial-literacy",
  "/re5",
  "/learn",
  "/calculator",
  "/budget",
  "/quests",
  "/support",
  "/privacy",
  "/terms",
  "/security",
  "/account-deletion",
] as const;

export function pageTitle(title: string): string {
  return `${title} | Notho`;
}

export function canonical(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: ICON_192,
    image: DEFAULT_OG,
    email: "hello@notho.co.za",
    description: SITE_DESCRIPTION,
    disambiguatingDescription: DISAMBIGUATION,
    foundingDate: "2026",
    areaServed: { "@type": "Country", name: "South Africa" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Durban",
      addressRegion: "KwaZulu-Natal",
      addressCountry: "ZA",
    },
    sameAs: [
      "https://www.linkedin.com/company/notho-za",
      "https://github.com/KwaneleNtshangase/Notho",
      "https://play.google.com/store/apps/details?id=za.co.notho.app",
      "https://appgallery.huawei.com/app/C118850237",
    ],
    knowsAbout: [
      "personal finance education",
      "financial literacy South Africa",
      "investment calculators",
      "TFSA",
      "retirement annuity",
      "budgeting",
      "RE5 exam prep",
    ],
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#app`,
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "PersonalFinance",
    operatingSystem: "Web, Android, iOS, HarmonyOS",
    url: SITE_URL,
    image: ICON_192,
    description: SITE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "ZAR" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-ZA",
    featureList: [
      "Short financial-literacy lessons",
      "Rand investment, TFSA, RA and living-annuity calculators",
      "Budget planner with statement import",
      "Money goals",
      "RE5 exam preparation",
    ],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function webPageJsonLd(opts: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical(opts.path)}#webpage`,
    url: canonical(opts.path),
    name: opts.title,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-ZA",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-ZA",
  };
}
