import { NextResponse } from "next/server";
import { z } from "zod";
import { getChapters, searchQuran } from "@/lib/islamic/providers/quran";
import { getDevotionalCategories } from "@/lib/islamic/providers/adhkar";
import { getHisnChapters } from "@/lib/islamic/providers/adhkar/hisn";
import { getHadithCategories, getHadiths } from "@/lib/islamic/providers/hadith/hadeethenc";
import { getLibraryBooks } from "@/lib/islamic/providers/library/islamic-app";
import { normalizeArabicSearch, searchRank } from "@/lib/islamic/search";

const schema = z.object({ q: z.string().trim().min(2).max(80) });
type Hit = { id: string; title: string; description: string; type: string };

export async function GET(request: Request) {
  const parsed = schema.safeParse({ q: new URL(request.url).searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ results: [] });
  const query = parsed.data.q;
  const needle = normalizeArabicSearch(query);
  const sourceResults = await Promise.allSettled([
    getChapters(),
    searchQuran(query),
    getDevotionalCategories("dhikr"),
    getDevotionalCategories("dua"),
    getHisnChapters(),
    getHadithCategories(),
    getLibraryBooks({ offset: 0, limit: 100 }),
    getLibraryBooks({ offset: 100, limit: 100 }),
    getLibraryBooks({ offset: 200, limit: 100 }),
  ] as const);

  const chapterResult = sourceResults[0].status === "fulfilled" ? sourceResults[0].value.data : [];
  const chapterNeedle = needle.replace(/^سورة\s+/, "");
  const chapters: Hit[] = chapterResult.filter((chapter) =>
    normalizeArabicSearch(`${chapter.nameArabic} ${chapter.nameEnglish} ${chapter.id}`).includes(chapterNeedle)
  ).map((chapter) => ({
    id: `/quran/${chapter.id}`, title: chapter.nameArabic, description: `سورة · ${chapter.versesCount} آية`, type: "surah",
  }));

  const verses: Hit[] = sourceResults[1].status === "fulfilled"
    ? sourceResults[1].value.map((item) => ({ id: item.href, title: item.title, description: item.description, type: item.type }))
    : [];

  const devotionals = [sourceResults[2], sourceResults[3]]
    .flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const devotional: Hit[] = devotionals.flatMap((category) =>
    category.items.filter((item) => normalizeArabicSearch(`${category.label} ${item.title} ${item.arabic} ${item.source}`).includes(needle))
      .map((item) => ({
        id: category.kind === "dua" ? `/dua/${item.id}?category=${category.slug}` : `/adhkar/${category.slug}/${item.id}`,
        title: item.title, description: item.arabic.slice(0, 140), type: category.kind,
      }))
  );

  const hisn: Hit[] = sourceResults[4].status === "fulfilled" ? sourceResults[4].value
    .filter((chapter) => normalizeArabicSearch(chapter.title).includes(needle))
    .map((chapter) => ({ id: `/hisn/${chapter.id}`, title: chapter.title, description: `حصن المسلم · الباب ${chapter.id}`, type: "hisn" })) : [];

  const hadithIds = sourceResults[5].status === "fulfilled"
    ? sourceResults[5].value.slice(0, 8).map((category) => category.id) : ["5"];
  const hadithPages = await Promise.allSettled(hadithIds.map((id) => getHadiths(id, 1, 70)));
  const hadith: Hit[] = hadithPages.flatMap((result) => result.status === "fulfilled" ? result.value.items : [])
    .filter((item) => normalizeArabicSearch(item.title).includes(needle))
    .map((item) => ({ id: `/hadith/${item.id}`, title: item.title, description: "حديث · HadeethEnc", type: "hadith" }));

  const books: Hit[] = [sourceResults[6], sourceResults[7], sourceResults[8]].flatMap((result) => result.status === "fulfilled" ? result.value.books : [])
    .filter((book) => normalizeArabicSearch(`${book.titleArabic} ${book.authorArabic} ${book.titleEnglish ?? ""}`).includes(needle))
    .map((book) => ({
      id: `/library/${encodeURIComponent(book.slug)}`, title: book.titleArabic,
      description: `كتاب · ${book.authorArabic}`, type: "book",
    }));

  const direct = /^([1-9]\d?|1[01]\d|114):([1-9]\d{0,2})$/.exec(query);
  const matchedChapter = direct ? chapterResult.find((chapter) => chapter.id === Number(direct[1])) : undefined;
  const page = /^(?:صفحة\s*)?(\d{1,3})$/.exec(query)?.[1];
  const shortcuts: Hit[] = direct && matchedChapter && Number(direct[2]) <= matchedChapter.versesCount
    ? [{ id: `/quran/${direct[1]}?view=cards#ayah-${direct[2]}`, title: `الآية ${direct[1]}:${direct[2]}`, description: "مرجع قرآني", type: "quran" }]
    : page && Number(page) >= 1 && Number(page) <= 604
      ? [{ id: `/quran/page/${page}`, title: `صفحة المصحف ${page}`, description: "انتقال مباشر", type: "quran" }]
      : [];

  const hits = [...chapters, ...verses, ...hadith, ...devotional, ...hisn, ...books]
    .sort((a, b) => searchRank(a.title, a.description, query) - searchRank(b.title, b.description, query));
  const deduplicated = new Map<string, Hit>();
  for (const item of [...shortcuts, ...hits]) if (!deduplicated.has(item.id)) deduplicated.set(item.id, item);
  return NextResponse.json({ results: [...deduplicated.values()].slice(0, 36) });
}
