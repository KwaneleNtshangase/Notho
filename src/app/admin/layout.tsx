import type { Metadata } from "next";

/**
 * Layout for every /admin/* route.
 *
 * Its only job is the metadata below. There is no middleware and no robots.txt
 * in this project, so without this the admin URLs are crawlable: anyone who
 * links to /admin/analytics, or any crawler that guesses it, could get it into
 * a search index. The pages themselves fail closed on a non-admin, so this is
 * not the security boundary - it just keeps internal URLs out of public view.
 *
 * Deliberately a server component (no "use client") - Next.js only reads
 * `metadata` exports from server components. The pages underneath stay client
 * components and are unaffected.
 */
export const metadata: Metadata = {
  title: "Admin · Notho",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
