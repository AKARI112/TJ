import "server-only";

import { z } from "zod";
import type { MushafPage, ProviderResult, QuranChapter, QuranChapterDetail, QuranResourceOption, QuranVerseStudy } from "@/domain/quran";
import { isMushafPage, islamicAppMushafUrl, preserveQuranText, sanitizeTajweedMarkup } from "@/lib/islamic/quran-utils";

const BASE_URL = "https://api.islamic.app/v1";
const envelope = <T extends z.ZodType>(data: T) => z.object({ code: z.number(), status: z.string(), data });
const chapterSchema = z.object({ id: z.number().int(), revelation_place: z.enum(["makkah", "madinah"]), name_simple: z.string(), name_arabic: z.string(), verses_count: z.number().int(), pages: z.tuple([z.number(), z.number()]).nullable().optional(), translated_name: z.object({ language_name: z.string(), name: z.string() }) });
const verseSchema = z.object({ id: z.number().int(), verse_number: z.number().int(), verse_key: z.string(), chapter_id: z.number().int(), page: z.number().int(), juz: z.number().int(), hizb: z.number().int(), rub: z.number().int(), text_uthmani: z.string(), text_uthmani_tajweed: z.string().optional(), translations: z.array(z.object({ resource_id: z.number(), resource_name: z.string(), language_name: z.string(), text: z.string() })).optional(), tafsirs: z.array(z.object({ resource_id: z.number(), resource_name: z.string(), language_name: z.string(), text: z.string() })).optional(), words: z.array(z.object({ position: z.number(), text_uthmani: z.string(), transliteration: z.object({ text: z.string() }).nullable().optional(), translation: z.object({ text: z.string() }).nullable().optional(), audio_url: z.string().nullable().optional(), char_type_name: z.string().optional() })).optional() });
const resourceSchema = z.object({ slug: z.string(), id: z.number().int().nullable(), name: z.string(), author_name: z.string().nullable().optional(), language_name: z.string().optional(), iso_code: z.string().nullable().optional(), direction: z.enum(["rtl", "ltr"]).optional() });

async function request<T>(path: string, schema: z.ZodType<T>, revalidate: number): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate }, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Islamic App ${path}: ${response.status}`);
  return envelope(schema).parse(await response.json()).data;
}

function plainReligiousText(value: string) { return value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim(); }
function normalizeChapter(chapter: z.infer<typeof chapterSchema>): QuranChapter { return { id: chapter.id, nameArabic: chapter.name_arabic, nameEnglish: chapter.name_simple, meaningEnglish: chapter.translated_name.name, versesCount: chapter.verses_count, revelationPlace: chapter.revelation_place, provider: "Islamic App", sourceUrl: `https://islamic.app/quran/${chapter.id}` }; }
function normalizeVerse(verse: z.infer<typeof verseSchema>) { return { id: verse.id, chapterId: verse.chapter_id, verseNumber: Number(verse.verse_key.split(":")[1]), textUthmani: preserveQuranText(verse.text_uthmani), juz: verse.juz, page: verse.page, hizbQuarter: verse.rub, provider: "Islamic App", sourceUrl: `https://islamic.app/quran/${verse.verse_key.replace(":", "/")}` }; }
function normalizeResources(items: z.infer<typeof resourceSchema>[]): QuranResourceOption[] {
  return items.flatMap((item) => item.id === null ? [] : [{ id: item.id, slug: item.slug, name: item.name, languageName: item.language_name, authorName: item.author_name ?? undefined }]);
}

export async function getIslamicAppChapters(): Promise<ProviderResult<QuranChapter[]>> {
  const data = await request("/chapters?language=ar", z.object({ chapters: z.array(chapterSchema) }), 60 * 60 * 24 * 30);
  return { data: data.chapters.map(normalizeChapter), provider: "Islamic App", sourceUrl: "https://docs.islamic.app/api-reference/chapters", cached: true };
}

export async function getIslamicAppChapter(id: number): Promise<ProviderResult<QuranChapterDetail>> {
  if (!Number.isInteger(id) || id < 1 || id > 114) throw new Error("رقم سورة غير صالح");
  const fields = "text_uthmani,text_uthmani_simple,text_imlaei,text_imlaei_simple,text_indopak,text_uthmani_tajweed";
  const [chapterData, verseData] = await Promise.all([
    request(`/chapters/${id}?language=ar`, z.object({ chapter: chapterSchema }), 60 * 60 * 24 * 30),
    request(`/verses/by_chapter/${id}?fields=${fields}&per_page=300`, z.object({ verses: z.array(verseSchema) }).passthrough(), 60 * 60 * 24 * 30),
  ]);
  return { data: { ...normalizeChapter(chapterData.chapter), verses: verseData.verses.map(normalizeVerse) }, provider: "Islamic App", sourceUrl: `https://islamic.app/quran/${id}`, cached: true };
}

export async function getIslamicAppMushafPage(page: number, mode: "mushaf" | "tajweed" = "mushaf"): Promise<ProviderResult<MushafPage>> {
  if (!isMushafPage(page)) throw new Error("رقم صفحة غير صالح");
  const sourceUrl = `https://api.islamic.app/v1/mushaf/page/${page}.svg`;
  const data = await request(`/verses/by_page/${page}?fields=text_uthmani,text_uthmani_tajweed&per_page=50`, z.object({ verses: z.array(verseSchema) }).passthrough(), 60 * 60 * 24 * 30);
  const firstVerseKey = data.verses[0]?.verse_key;
  if (mode === "mushaf") return { data: { pageNumber: page, mushafId: 1, mode, imageUrl: islamicAppMushafUrl(page), firstVerseKey, provider: "Islamic App", sourceUrl }, provider: "Islamic App", sourceUrl, cached: true };
  return { data: { pageNumber: page, mushafId: 1, mode, firstVerseKey, verses: data.verses.map((verse) => ({ id: verse.id, verseKey: verse.verse_key, verseNumber: Number(verse.verse_key.split(":")[1]), textUthmani: verse.text_uthmani, tajweedMarkup: sanitizeTajweedMarkup(verse.text_uthmani_tajweed ?? verse.text_uthmani) })), provider: "Islamic App", sourceUrl: `https://docs.islamic.app/api-reference/verses` }, provider: "Islamic App", sourceUrl, cached: true };
}

export async function getIslamicAppResources() {
  const [translations, tafsirs] = await Promise.all([
    request("/resources/translations", z.object({ translations: z.array(resourceSchema) }), 60 * 60 * 24 * 7),
    request("/resources/tafsirs", z.object({ tafsirs: z.array(resourceSchema) }), 60 * 60 * 24 * 7),
  ]);
  // Recitation resources use a different provider shape and are handled by the
  // dedicated audio layer. Keeping this endpoint focused prevents an unrelated
  // audio schema change from disabling Tafsir and translation selection.
  return { translations: normalizeResources(translations.translations), tafsirs: normalizeResources(tafsirs.tafsirs), recitations: [] as QuranResourceOption[] };
}

export async function getIslamicAppVerseStudy(verseKey: string, tafsirId?: number, translationId?: number): Promise<QuranVerseStudy> {
  if (!/^(?:[1-9]\d?|1[01]\d|114):[1-9]\d{0,2}$/.test(verseKey)) throw new Error("مرجع آية غير صالح");
  const query = new URLSearchParams({ fields: "text_uthmani", words: "true" });
  if (tafsirId) query.set("tafsirs", String(tafsirId));
  if (translationId) query.set("translations", String(translationId));
  const data = await request(`/verses/by_key/${verseKey}?${query}`, z.object({ verse: verseSchema }), 60 * 60 * 24);
  const tafsir = data.verse.tafsirs?.[0]; const translation = data.verse.translations?.[0];
  return { verseKey, tafsir: tafsir ? { resourceId: tafsir.resource_id, resourceName: tafsir.resource_name, languageName: tafsir.language_name, text: plainReligiousText(tafsir.text) } : undefined, translation: translation ? { resourceId: translation.resource_id, resourceName: translation.resource_name, languageName: translation.language_name, text: plainReligiousText(translation.text) } : undefined, words: data.verse.words?.filter((word) => word.char_type_name !== "end").map((word) => ({ position: word.position, textUthmani: word.text_uthmani, translation: word.translation?.text, transliteration: word.transliteration?.text, audioUrl: word.audio_url ? new URL(word.audio_url, "https://audio.qurancdn.com/").toString() : undefined })), provider: "Islamic App", sourceUrl: `https://islamic.app/quran/${verseKey.replace(":", "/")}` };
}

export async function searchIslamicAppQuran(query: string) {
  const params = new URLSearchParams({ q: query, size: "20", translations: "qc-quran-uthmani-simple" });
  const data = await request(`/search?${params}`, z.object({ results: z.array(z.object({ verse_key: z.string(), edition: z.string(), text: z.string() })) }).passthrough(), 60 * 60 * 24);
  return data.results.map((result) => { const [surah, ayah] = result.verse_key.split(":"); return { id: `quran:${result.verse_key}`, title: `الآية ${result.verse_key}`, description: plainReligiousText(result.text), href: `/quran/${surah}#ayah-${ayah}`, type: "quran" as const }; });
}
