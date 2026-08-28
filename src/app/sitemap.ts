import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

  const staticPaths = ["", "/quran", "/hadith", "/listen", "/prayer", "/qibla", "/adhkar", "/dua", "/hisn"];
  const quranPaths = Array.from({ length: 114 }, (_, index) => `/quran/${index + 1}`);
  const mushafPaths = Array.from({ length: 604 }, (_, index) => `/quran/page/${index + 1}`);
  const hisnPaths = Array.from({ length: 133 }, (_, index) => `/hisn/${index + 1}`);
  return [...staticPaths, ...quranPaths, ...mushafPaths, ...hisnPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
