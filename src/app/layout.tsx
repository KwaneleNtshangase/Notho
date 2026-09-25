import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorReportingInit } from "@/components/ErrorReportingInit";
import { NativeAuthDeepLink } from "@/components/NativeAuthDeepLink";
import { NativeShellGuards } from "@/components/NativeShellGuards";
import { TextScaleInit } from "@/components/TextScaleInit";
import { ServiceWorkerRegistration } from "@/lib/sw/ServiceWorkerRegistration";
import { STORAGE_MIGRATION_SCRIPT } from "@/lib/storageMigration";
import { TEXT_SCALE_BOOT_SCRIPT } from "@/lib/textScale";
import "./globals.css";
import "./text-scale.css";
import "./shell-layout.css";
import "./splash-static.css";
import "./hide-advisor-cta.css";

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
    root.style.setProperty('--notho-canvas', c);
    if (document.body) document.body.style.backgroundColor = c;
  } catch (e) {}
})();`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "Notho - Master Your Money",
  description: "Interactive personal finance learning app built for South Africa.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://www.notho.co.za"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Notho",
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
    images: ["/notho-logo.png"],
    title: "Notho",
    description: "Learn to manage money the South African way",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: STORAGE_MIGRATION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TEXT_SCALE_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CANVAS_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <PostHogProvider>{children}</PostHogProvider>
          <ServiceWorkerRegistration />
          <ErrorReportingInit />
          <TextScaleInit />
          <NativeAuthDeepLink />
          <NativeShellGuards />
        </ErrorBoundary>
      </body>
    </html>
  );
}
