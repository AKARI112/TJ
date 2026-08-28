import "server-only";

import { z } from "zod";
import type { LibraryBook, LibraryBookDetail, LibraryBookText, LibraryGenre, LibraryPage } from "@/domain/library";

const BASE_URL = "https://api.islamic.app/v1";
const genreSchema = z.enum(["tafsir", "aqeedah", "fiqh", "usul-fiqh", "tasawwuf", "seerah", "tarikh", "lughah", "mantiq", "firaq", "general"]);
const listBookSchema = z.object({ slug: z.string(), title_ar: z.string(), title_en: z.string().nullable().optional(), author_id: z.string(), author_name_ar: z.string(), author_name_en: z.string().nullable().optional(), author_died_year_hijri: z.number().nullable().optional(), genre: genreSchema, school: z.string().nullable().optional(), pages: z.number().nullable().optional(), has_pdf: z.boolean(), has_text: z.boolean(), has_chapters: z.boolean() });
const authorSchema = z.object({ id: z.string(), name_ar: z.string(), name_en: z.string().nullable().optional(), died_year_hijri: z.number().nullable().optional(), born_year_hijri: z.number().nullable().optional(), bio_ar: z.string().nullable().optional() });
const detailBookSchema = z.object({ slug: z.string(), title_ar: z.string(), title_en: z.string().nullable().optional(), genre: genreSchema, school: z.string().nullable().optional(), written_year_hijri: z.number().nullable().optional(), pages: z.number().nullable().optional(), description_ar: z.string().nullable().optional(), description_en: z.string().nullable().optional(), has_pdf: z.boolean(), has_text: z.boolean(), has_chapters: z.boolean(), author: authorSchema, sources: z.array(z.object({ source_name: z.string(), source_url: z.string().url().nullable().optional() })) });
const textSchema = z.object({ slug: z.string(), source: z.enum(["turath", "openiti"]), pageCount: z.number(), chapterCount: z.number(), bibliography: z.record(z.string(), z.union([z.string(), z.number()])).catch({}), chapters: z.array(z.object({ title: z.string(), level: z.number().int().positive().catch(1), vol: z.string().nullable().optional(), page: z.number().nullable().optional(), text: z.string() })) });

async function request<T>(path: string, schema: z.ZodType<T>, revalidate: number): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate }, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Islamic App library ${path}: ${response.status}`);
  return z.object({ code: z.number(), status: z.string(), data: schema }).parse(await response.json()).data;
}

function normalizeBook(book: z.infer<typeof listBookSchema>): LibraryBook { return { slug: book.slug, titleArabic: book.title_ar, titleEnglish: book.title_en ?? undefined, authorId: book.author_id, authorArabic: book.author_name_ar, authorEnglish: book.author_name_en ?? undefined, authorDiedHijri: book.author_died_year_hijri ?? undefined, genre: book.genre, school: book.school ?? undefined, pages: book.pages ?? undefined, hasPdf: book.has_pdf, hasText: book.has_text, hasChapters: book.has_chapters }; }

export async function getLibraryBooks(options: { genre?: LibraryGenre; limit?: number; offset?: number } = {}): Promise<LibraryPage> {
  const params = new URLSearchParams({ limit: String(Math.min(100, Math.max(1, options.limit ?? 100))), offset: String(Math.max(0, options.offset ?? 0)) });
  if (options.genre) params.set("genre", options.genre);
  const data = await request(`/library/books?${params}`, z.object({ total: z.number(), limit: z.number(), offset: z.number(), books: z.array(listBookSchema) }), 300);
  return { ...data, books: data.books.map(normalizeBook) };
}

export async function getLibraryBook(slug: string): Promise<LibraryBookDetail> {
  if (!/^[a-z0-9.:'-]+$/.test(slug) || slug.includes("..")) throw new Error("معرف كتاب غير صالح");
  const data = await request(`/library/books/${encodeURIComponent(slug)}`, z.object({ book: detailBookSchema }), 60 * 60);
  const book = data.book;
  return { slug: book.slug, titleArabic: book.title_ar, titleEnglish: book.title_en ?? undefined, authorId: book.author.id, authorArabic: book.author.name_ar, authorEnglish: book.author.name_en ?? undefined, authorDiedHijri: book.author.died_year_hijri ?? undefined, authorBornHijri: book.author.born_year_hijri ?? undefined, authorBioArabic: book.author.bio_ar ?? undefined, genre: book.genre, school: book.school ?? undefined, pages: book.pages ?? undefined, writtenYearHijri: book.written_year_hijri ?? undefined, descriptionArabic: book.description_ar ?? undefined, descriptionEnglish: book.description_en ?? undefined, hasPdf: book.has_pdf, hasText: book.has_text, hasChapters: book.has_chapters, sources: book.sources.map((source) => ({ name: source.source_name, url: source.source_url ?? undefined })) };
}

export async function getLibraryBookText(slug: string): Promise<LibraryBookText> {
  if (!/^[a-z0-9.:'-]+$/.test(slug) || slug.includes("..")) throw new Error("معرف كتاب غير صالح");
  const data = await request(`/library/books/${encodeURIComponent(slug)}/text`, textSchema, 60 * 60 * 24);
  return { slug: data.slug, source: data.source, pageCount: data.pageCount, chapterCount: data.chapterCount, bibliography: Object.fromEntries(Object.entries(data.bibliography).map(([key, value]) => [key, String(value)])), chapters: data.chapters.map((chapter) => ({ title: chapter.title, level: chapter.level, volume: chapter.vol ?? undefined, page: chapter.page ?? undefined, text: chapter.text })) };
}

export function libraryPdfUrl(slug: string) { if (!/^[a-z0-9.:'-]+$/.test(slug) || slug.includes("..")) throw new Error("معرف كتاب غير صالح"); return `${BASE_URL}/library/books/${encodeURIComponent(slug)}/file?format=pdf&variant=primary`; }
