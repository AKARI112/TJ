import "server-only";

import type { MushafMode } from "@/domain/quran";
import { getAlFurqanMushafLayout, getAlFurqanMushafPage } from "@/lib/islamic/providers/quran/alfurqan";
import { getChapter as getAlQuranChapter, getChapters as getAlQuranChapters, getPageVerses, searchQuran as searchAlQuran } from "@/lib/islamic/providers/quran/alquran-cloud";
import { getIslamicAppChapter, getIslamicAppChapters, getIslamicAppMushafPage, searchIslamicAppQuran } from "@/lib/islamic/providers/quran/islamic-app";

export async function getChapters() {
  try { return await getIslamicAppChapters(); }
  catch { return getAlQuranChapters(); }
}

export async function getChapter(id: number) {
  try { return await getIslamicAppChapter(id); }
  catch { return getAlQuranChapter(id); }
}

export async function getMushafPage(page: number, mode: MushafMode = "mushaf") {
  const [layoutResult, versesResult] = await Promise.allSettled([
    getAlFurqanMushafLayout(page),
    getPageVerses(page),
  ]);

  const layout = layoutResult.status === "fulfilled" ? layoutResult.value : undefined;
  const verses = versesResult.status === "fulfilled" ? versesResult.value : undefined;
  const firstVerseKey = verses?.[0]?.verseKey;

  if (layout?.length) {
    return getAlFurqanMushafPage(page, { mode, layout, verses, firstVerseKey });
  }

  if (mode === "tajweed") {
    try { return await getIslamicAppMushafPage(page, "tajweed"); }
    catch {
      // Keep the page available even when the secondary tajweed provider is unavailable.
      return getAlFurqanMushafPage(page, { mode, verses, firstVerseKey });
    }
  }

  return getAlFurqanMushafPage(page, { mode, verses, firstVerseKey });
}

export async function searchQuran(query: string) {
  try { return await searchIslamicAppQuran(query); }
  catch { return searchAlQuran(query); }
}
