import { NextResponse } from "next/server";
import { z } from "zod";
import { getChapters, searchQuran } from "@/lib/islamic/providers/quran";
import { getDevotionalCategory } from "@/lib/islamic/providers/adhkar";
import { getHisnChapters } from "@/lib/islamic/providers/adhkar/hisn";
import { getHadiths } from "@/lib/islamic/providers/hadith/hadeethenc";
import { getLibraryBooks } from "@/lib/islamic/providers/library/islamic-app";
import { normalizeArabicSearch } from "@/lib/islamic/search";

const schema = z.object({ q: z.string().trim().min(2).max(80) });
export async function GET(request: Request) {
  const parsed = schema.safeParse({ q: new URL(request.url).searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ results: [] });
  const query = parsed.data.q; const needle = normalizeArabicSearch(query);
  const settled = await Promise.allSettled([getChapters(), searchQuran(query), getHadiths("5", 1, 50), getDevotionalCategory("morning", "dhikr"), getDevotionalCategory("travel", "dua"), getHisnChapters(), getLibraryBooks({ limit: 100 })]);
  const chapters = settled[0].status === "fulfilled" ? settled[0].value.data.filter((chapter) => normalizeArabicSearch(`${chapter.nameArabic} ${chapter.nameEnglish} ${chapter.id}`).includes(needle)).slice(0, 6).map((chapter) => ({ id: `/quran/${chapter.id}`, title: chapter.nameArabic, description: `سورة · ${chapter.versesCount} آية`, type: "surah" })) : [];
  const verses = settled[1].status === "fulfilled" ? settled[1].value.slice(0, 6).map((result) => ({ id: result.href, title: result.title, description: result.description, type: result.type })) : [];
  const devotionalCategories = [settled[3], settled[4]].flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : []);
  const devotional = devotionalCategories.flatMap((category) => category.items.filter((item) => normalizeArabicSearch(`${item.arabic} ${item.source}`).includes(needle)).slice(0, 3).map((item) => ({ id: category.kind === "dua" ? `/dua/${item.id}?category=${category.slug}` : `/adhkar/${category.slug}/${item.id}`, title: `${category.label} · ${item.position}`, description: item.arabic.slice(0, 120), type: category.kind }))).slice(0, 6);
  const hisn = settled[5].status === "fulfilled" ? settled[5].value.filter((chapter) => normalizeArabicSearch(chapter.title).includes(needle)).slice(0, 4).map((chapter) => ({ id: `/hisn/${chapter.id}`, title: chapter.title, description: `حصن المسلم · الباب ${chapter.id}`, type: "hisn" })) : [];
  const hadith = settled[2].status === "fulfilled" ? settled[2].value.items.filter((item) => normalizeArabicSearch(item.title).includes(needle)).slice(0, 5).map((item) => ({ id: `/hadith/${item.id}`, title: item.title, description: "حديث · HadeethEnc", type: "hadith" })) : [];
  const books = settled[6].status === "fulfilled" ? settled[6].value.books.filter((book) => normalizeArabicSearch(`${book.titleArabic} ${book.authorArabic} ${book.titleEnglish ?? ""}`).includes(needle)).slice(0, 5).map((book) => ({ id: `/library/${encodeURIComponent(book.slug)}`, title: book.titleArabic, description: `كتاب · ${book.authorArabic}`, type: "book" })) : [];
  const direct = /^([1-9]\d?|1[01]\d|114):([1-9]\d{0,2})$/.exec(query)?.slice(1); const page = /^(?:صفحة\s*)?(\d{1,3})$/.exec(query)?.[1];
  const shortcuts = direct ? [{ id: `/quran/${direct[0]}#ayah-${direct[1]}`, title: `الآية ${direct[0]}:${direct[1]}`, description: "انتقال مباشر إلى مرجع قرآني", type: "quran" }] : page && Number(page) <= 604 ? [{ id: `/quran/page/${page}`, title: `صفحة المصحف ${page}`, description: "انتقال مباشر إلى صفحة المصحف", type: "quran" }] : [];
  return NextResponse.json({ results: [...shortcuts, ...chapters, ...verses, ...hadith, ...devotional, ...hisn, ...books].slice(0, 24) });
}
