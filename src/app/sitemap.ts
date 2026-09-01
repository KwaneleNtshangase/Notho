import type { MetadataRoute } from "next";

const BASE = "https://www.notho.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: `${BASE}/learn`, lastModified: now, priority: 1.0 },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/security`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/support`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/account-deletion`, lastModified: now, priority: 0.4 },
  ];
}
