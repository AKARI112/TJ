import "server-only";
import { z } from "zod";
import type { ProviderResult, QuranChapter, QuranChapterDetail, TajweedPageVerse } from "@/domain/quran";

const BASE_URL = "https://api.alquran.cloud/v1";
const chapterSchema = z.object({ number: z.number(), name: z.string(), englishName: z.string(), englishNameTranslation: z.string(), numberOfAyahs: z.number(), revelationType: z.string() });
const verseSchema = z.object({ number: z.number(), text: z.string(), numberInSurah: z.number(), juz: z.number(), page: z.number(), hizbQuarter: z.number() });
const pageVerseSchema = z.object({
  number: z.number(),
  text: z.string(),
  numberInSurah: z.number(),
  surah: z.object({ number: z.number() }),
});

function normalizeChapter(chapter: z.infer<typeof chapterSchema>): QuranChapter {
  return {
    id: chapter.number, nameArabic: chapter.name, nameEnglish: chapter.englishName,
    meaningEnglish: chapter.englishNameTranslation, versesCount: chapter.numberOfAyahs,
    revelationPlace: chapter.revelationType.toLowerCase() === "medinan" ? "madinah" : "makkah",
    provider: "AlQuran Cloud", sourceUrl: "https://alquran.cloud/api",
  };
}

export async function getChapters(): Promise<ProviderResult<QuranChapter[]>> {
  const response = await fetch(`${BASE_URL}/surah`, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!response.ok) throw new Error(`AlQuran Cloud chapters: ${response.status}`);
  const payload = z.object({ data: z.array(chapterSchema) }).parse(await response.json());
  return { data: payload.data.map(normalizeChapter), provider: "AlQuran Cloud", sourceUrl: "https://alquran.cloud/api", cached: false };
}

export async function getChapter(id: number): Promise<ProviderResult<QuranChapterDetail>> {
  const response = await fetch(`${BASE_URL}/surah/${id}/quran-uthmani`, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!response.ok) throw new Error(`AlQuran Cloud surah: ${response.status}`);
  const payload = z.object({ data: chapterSchema.extend({ ayahs: z.array(verseSchema) }) }).parse(await response.json());
  const chapter = normalizeChapter(payload.data);
  return {
    data: {
      ...chapter,
      verses: payload.data.ayahs.map((verse) => ({
        id: verse.number, chapterId: id, verseNumber: verse.numberInSurah, textUthmani: verse.text,
        juz: verse.juz, page: verse.page, hizbQuarter: verse.hizbQuarter,
        provider: "AlQuran Cloud", sourceUrl: `https://alquran.cloud/ayah/${id}:${verse.numberInSurah}`,
      })),
    },
    provider: "AlQuran Cloud", sourceUrl: `https://alquran.cloud/surah/${id}`, cached: false,
  };
}

export async function getPageVerses(page: number): Promise<TajweedPageVerse[]> {
  if (!Number.isInteger(page) || page < 1 || page > 604) throw new Error("رقم صفحة غير صالح");
  const response = await fetch(`${BASE_URL}/page/${page}/quran-uthmani`, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!response.ok) throw new Error(`AlQuran Cloud page: ${response.status}`);
  const payload = z.object({ data: z.object({ ayahs: z.array(pageVerseSchema) }) }).parse(await response.json());
  return payload.data.ayahs.map((verse) => ({
    id: verse.number,
    verseKey: `${verse.surah.number}:${verse.numberInSurah}`,
    verseNumber: verse.numberInSurah,
    textUthmani: verse.text,
    tajweedMarkup: verse.text,
  }));
}

export async function searchQuran(query: string) {
  const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/quran-uthmani`, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) throw new Error(`AlQuran Cloud search: ${response.status}`);
  const payload = z.object({ data: z.object({ matches: z.array(z.object({ number: z.number(), text: z.string(), numberInSurah: z.number(), surah: z.object({ number: z.number(), name: z.string() }) })) }) }).parse(await response.json());
  return payload.data.matches.map((match) => ({ id: `quran:${match.surah.number}:${match.numberInSurah}`, title: `${match.surah.name} · ${match.surah.number}:${match.numberInSurah}`, description: match.text, href: `/quran/${match.surah.number}#ayah-${match.numberInSurah}`, type: "quran" as const }));
}
