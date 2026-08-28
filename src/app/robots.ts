import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: ["/", "/quran/", "/hadith/", "/adhkar/", "/dua/", "/hisn/", "/library/", "/reciters/"], disallow: ["/api/", "/saved", "/settings", "/reminders", "/offline"] }] };
}
