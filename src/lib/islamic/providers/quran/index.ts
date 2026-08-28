import "server-only";

import { getChapter as getAlQuranChapter, getChapters as getAlQuranChapters, searchQuran as searchAlQuran } from "@/lib/islamic/providers/quran/alquran-cloud";
import { getIslamicAppChapter, getIslamicAppChapters, searchIslamicAppQuran } from "@/lib/islamic/providers/quran/islamic-app";

export async function getChapters() {
  try { return await getIslamicAppChapters(); }
  catch { return getAlQuranChapters(); }
}

export async function getChapter(id: number) {
  try { return await getIslamicAppChapter(id); }
  catch { return getAlQuranChapter(id); }
}

export async function searchQuran(query: string) {
  try { return await searchIslamicAppQuran(query); }
  catch { return searchAlQuran(query); }
}
