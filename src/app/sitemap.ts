import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/seo";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/about": 0.9,
  "/personal-finance": 0.9,
  "/investment-calculator": 0.9,
  "/budgeting": 0.9,
  "/financial-literacy": 0.9,
  "/re5": 0.8,
  "/learn": 0.8,
  "/calculator": 0.8,
  "/budget": 0.7,
  "/quests": 0.6,
  "/support": 0.6,
  "/privacy": 0.5,
  "/terms": 0.5,
  "/security": 0.5,
  "/account-deletion": 0.4,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/personal") || path === "/about" ? "weekly" : "monthly",
    priority: PRIORITY[path] ?? 0.5,
  }));
}
