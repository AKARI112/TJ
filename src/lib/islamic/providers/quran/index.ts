import "server-only";

import type { MushafMode } from "@/domain/quran";
import { getAlFurqanMushafPage } from "@/lib/islamic/providers/quran/alfurqan";
import { getChapter as getAlQuranChapter, getChapters as getAlQuranChapters, searchQuran as searchAlQuran } from "@/lib/islamic/providers/quran/alquran-cloud";
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
  if (mode === "tajweed") return getIslamicAppMushafPage(page, "tajweed");

  let firstVerseKey: string | undefined;
  try {
    firstVerseKey = (await getIslamicAppMushafPage(page, "mushaf")).data.firstVerseKey;
  } catch {
    // The visual Mushaf page can still load from Al Furqan even if verse metadata is unavailable.
  }

  return getAlFurqanMushafPage(page, firstVerseKey);
}

export async function searchQuran(query: string) {
  try { return await searchIslamicAppQuran(query); }
  catch { return searchAlQuran(query); }
}
