import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorReportingInit } from "@/components/ErrorReportingInit";
import { NativeAuthDeepLink } from "@/components/NativeAuthDeepLink";
import { NativeShellGuards } from "@/components/NativeShellGuards";
import { TextScaleInit } from "@/components/TextScaleInit";
import { AppleAuthGuard } from "@/components/AppleAuthGuard";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { ServiceWorkerRegistration } from "@/lib/sw/ServiceWorkerRegistration";
import { STORAGE_MIGRATION_SCRIPT } from "@/lib/storageMigration";
import { TEXT_SCALE_BOOT_SCRIPT } from "@/lib/textScale";
import { JsonLd } from "@/components/JsonLd";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";
import "./text-scale.css";
import "./shell-layout.css";
import "./splash-static.css";
import "./apple-signin.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CANVAS_BOOT_SCRIPT = `(() => {
  try {
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var c = dark ? '#000000' : '#ffffff';
    var root = document.documentElement;
    root.style.backgroundColor = c;
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.setProperty('--notho-canvas', c);
    if (dark) root.classList.add('dark');
    if (document.body) document.body.style.backgroundColor = c;
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (!metas.length) {
      var meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', c);
      document.head.appendChild(meta);
    } else {
      for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', c);
    }
    var loc = '';
    try { loc = localStorage.getItem('notho-locale') || ''; } catch (e) {}
    if (loc === 'zu') root.lang = 'zu-ZA';
  } catch (e) {}
})();`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Notho \u2014 Learn personal finance in South Africa",
    template: "%s | Notho",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Notho",
    "personal finance South Africa",
    "financial literacy",
    "investment calculator",
    "TFSA calculator",
    "budget app South Africa",
    "RE5 prep",
    "Fundi Finance",
  ],
  authors: [{ name: "The Solution Org (Pty) Ltd", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: "The Solution Org (Pty) Ltd",
  category: "education",
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/notho-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/notho-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: ["/notho-logo.png"],
    title: "Notho \u2014 Learn personal finance in South Africa",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Notho \u2014 Learn personal finance in South Africa",
    description: SITE_DESCRIPTION,
    images: ["/notho-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <head>
        <script dangerouslySetInnerHTML={{ __html: STORAGE_MIGRATION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TEXT_SCALE_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CANVAS_BOOT_SCRIPT }} />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={softwareJsonLd()} />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <LocaleProvider>
            <PostHogProvider>{children}</PostHogProvider>
          </LocaleProvider>
          <ServiceWorkerRegistration />
          <ErrorReportingInit />
          <TextScaleInit />
          <NativeAuthDeepLink />
          <NativeShellGuards />
          <AppleAuthGuard />
        </ErrorBoundary>
      </body>
    </html>
  );
}
