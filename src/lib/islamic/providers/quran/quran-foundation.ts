import "server-only";

import { Language, SearchMode, isValidChapterId, isValidQuranPage, type Verse, type VerseKey } from "@quranjs/api";
import { createServerClient, type ServerClient } from "@quranjs/api/server";
import { z } from "zod";
import type { MushafLine, MushafPage, MushafWord, ProviderResult, QuranChapter, QuranChapterDetail, QuranResourceOption, QuranVerseStudy } from "@/domain/quran";
import { qcfFontUrls } from "@/lib/islamic/quran-utils";

const environmentSchema = z.enum(["prelive", "production"]);
let client: ServerClient | null = null;

function environment() { return environmentSchema.parse(process.env.QF_ENV ?? "production"); }

export function isQuranFoundationConfigured() {
  return Boolean(process.env.QF_CLIENT_ID && process.env.QF_CLIENT_SECRET);
}

function getClient() {
  if (!isQuranFoundationConfigured()) throw new Error("Quran Foundation غير مهيأ");
  if (client) return client;
  const env = environment();
  const services = env === "prelive" ? {
    gatewayUrl: "https://apis-prelive.quran.foundation",
    contentBaseUrl: "https://apis-prelive.quran.foundation/content",
    searchBaseUrl: "https://apis-prelive.quran.foundation/search",
    oauth2BaseUrl: "https://prelive-oauth2.quran.foundation",
    tokenHost: "https://prelive-oauth2.quran.foundation",
  } : undefined;
  client = createServerClient({ clientId: process.env.QF_CLIENT_ID!, clientSecret: process.env.QF_CLIENT_SECRET!, services, defaults: { language: Language.ARABIC } });
  return client;
}

async function withSingle401Retry<T>(operation: (quranClient: ServerClient) => Promise<T>): Promise<T> {
  const quranClient = getClient();
  try { return await operation(quranClient); }
  catch (error) {
    if (!(error instanceof Error) || !/^401\b/.test(error.message)) throw error;
    quranClient.clearCachedTokens();
    return operation(quranClient);
  }
}

function normalizeChapter(chapter: Awaited<ReturnType<ServerClient["content"]["v4"]["chapters"]["list"]>>[number]): QuranChapter {
  return { id: chapter.id, nameArabic: chapter.nameArabic, nameEnglish: chapter.transliteratedName, meaningEnglish: chapter.translatedName.name, versesCount: chapter.versesCount, revelationPlace: chapter.revelationPlace.toLowerCase() === "madinah" ? "madinah" : "makkah", provider: "Quran Foundation", sourceUrl: `https://quran.com/${chapter.id}` };
}

function normalizeVerse(verse: Verse, chapterId: number) {
  return { id: verse.id, chapterId, verseNumber: verse.verseNumber, textUthmani: verse.textUthmani ?? "", juz: verse.juzNumber, page: verse.pageNumber, hizbQuarter: verse.rubElHizbNumber, provider: "Quran Foundation", sourceUrl: `https://quran.com/${verse.verseKey}` };
}

export async function getQuranFoundationChapters(): Promise<ProviderResult<QuranChapter[]>> {
  const chapters = await withSingle401Retry((quranClient) => quranClient.content.v4.chapters.list());
  return { data: chapters.map(normalizeChapter), provider: "Quran Foundation", sourceUrl: "https://quran.foundation", cached: true };
}

export async function getQuranFoundationChapter(id: number): Promise<ProviderResult<QuranChapterDetail>> {
  if (!isValidChapterId(id)) throw new Error("رقم سورة غير صالح");
  const [chapter, verses] = await Promise.all([
    withSingle401Retry((quranClient) => quranClient.content.v4.chapters.get(id, { language: "ar" })),
    withSingle401Retry((quranClient) => quranClient.content.v4.verses.byChapter(id, { perPage: 300, fields: { textUthmani: true } })),
  ]);
  return { data: { ...normalizeChapter(chapter), verses: verses.map((verse) => normalizeVerse(verse, id)) }, provider: "Quran Foundation", sourceUrl: `https://quran.com/${id}`, cached: true };
}

export async function getQuranFoundationPage(page: number, mode: "mushaf" | "tajweed" = "mushaf"): Promise<ProviderResult<MushafPage>> {
  if (!isValidQuranPage(page)) throw new Error("رقم صفحة غير صالح");
  const mushafId = mode === "tajweed" ? 19 : 1;
  const verses = await withSingle401Retry((quranClient) => quranClient.content.v4.verses.byPage(page, { words: true, perPage: 50, mushaf: mushafId, wordFields: { codeV2: true, textUthmani: true, verseKey: true } }));
  const words: MushafWord[] = verses.flatMap((verse) => (verse.words ?? []).map((word) => ({
    id: `${verse.verseKey}-${word.position}`,
    verseKey: String(word.verseKey ?? verse.verseKey),
    position: word.position,
    pageNumber: word.pageNumber ?? verse.pageNumber,
    lineNumber: word.lineNumber ?? 1,
    charType: word.charTypeName,
    glyphCode: word.codeV2,
    textFallback: word.textUthmani ?? word.text,
  })));
  const lines = [...new Set(words.map((word) => word.lineNumber))].sort((a, b) => a - b).map<MushafLine>((lineNumber) => ({ lineNumber, words: words.filter((word) => word.lineNumber === lineNumber) }));
  const data: MushafPage = { pageNumber: page, mushafId, mode, lines, fontUrl: qcfFontUrls(page, mode).primary, fallbackFontUrl: "https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2", provider: "Quran Foundation", sourceUrl: `https://quran.com/page/${page}` };
  return { data, provider: "Quran Foundation", sourceUrl: data.sourceUrl, cached: true };
}

export async function getQuranFoundationResources() {
  const [translations, tafsirs, recitations] = await Promise.all([
    withSingle401Retry((quranClient) => quranClient.content.v4.resources.translations.list({ language: "ar" })),
    withSingle401Retry((quranClient) => quranClient.content.v4.resources.tafsirs.list({ language: "ar" })),
    withSingle401Retry((quranClient) => quranClient.content.v4.resources.recitations.list({ language: "ar" })),
  ]);
  const normalize = (items: Array<{ id?: number; name?: string; reciterName?: string; languageName?: string; authorName?: string; translatedName?: { name: string } }>): QuranResourceOption[] => items.flatMap((item) => item.id ? [{ id: item.id, name: item.name ?? item.reciterName ?? item.translatedName?.name ?? String(item.id), languageName: item.languageName, authorName: item.authorName }] : []);
  return { translations: normalize(translations), tafsirs: normalize(tafsirs), recitations: normalize(recitations) };
}

export async function searchQuranFoundation(query: string) {
  return withSingle401Retry((quranClient) => quranClient.search.v1.query({ query, mode: SearchMode.Quick, size: 20, getText: "1", highlight: "1" }));
}

function plainReligiousText(value: string) { return value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim(); }
export async function getQuranFoundationVerseStudy(verseKey: string, tafsirId?: number, translationId?: number): Promise<QuranVerseStudy> {
  if (!/^(?:[1-9]\d?|1[01]\d|114):[1-9]\d{0,2}$/.test(verseKey)) throw new Error("مرجع آية غير صالح");
  const verse = await withSingle401Retry((quranClient) => quranClient.content.v4.verses.byKey(verseKey as VerseKey, { tafsirs: tafsirId ? [tafsirId] : undefined, translations: translationId ? [translationId] : undefined }));
  const tafsir = verse.tafsirs?.[0]; const translation = verse.translations?.[0];
  return { verseKey, tafsir: tafsir?.text && tafsir.resourceId ? { resourceId: tafsir.resourceId, resourceName: tafsir.resourceName, languageName: tafsir.languageName, text: plainReligiousText(tafsir.text) } : undefined, translation: translation?.text && translation.resourceId ? { resourceId: translation.resourceId, resourceName: translation.resourceName, languageName: translation.languageName, text: plainReligiousText(translation.text) } : undefined, provider: "Quran Foundation", sourceUrl: `https://quran.com/${verseKey}` };
}
