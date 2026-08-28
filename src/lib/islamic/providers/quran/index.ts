import "server-only";

import { getChapter as getAlQuranChapter, getChapters as getAlQuranChapters } from "@/lib/islamic/providers/quran/alquran-cloud";
import { getQuranFoundationChapter, getQuranFoundationChapters, isQuranFoundationConfigured } from "@/lib/islamic/providers/quran/quran-foundation";

export async function getChapters() {
  if (!isQuranFoundationConfigured()) return getAlQuranChapters();
  try { return await getQuranFoundationChapters(); }
  catch { return getAlQuranChapters(); }
}

export async function getChapter(id: number) {
  if (!isQuranFoundationConfigured()) return getAlQuranChapter(id);
  try { return await getQuranFoundationChapter(id); }
  catch { return getAlQuranChapter(id); }
}
