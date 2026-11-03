import "server-only";

import { z } from "zod";
import type { LibraryBookDetail, LibraryBookText, LibraryGenre, LibraryPage } from "@/domain/library";
import { getIslamicSnapshotPage } from "./catalog-snapshots";

const BASE_URL = "https://api.islamic.app/v1";
// Islamic App documents the old bare-response API as a supported compatibility endpoint.
const LEGACY_BASE_URL = "https://islamic.app/api";
const genreSchema = z.enum(["tafsir", "aqeedah", "fiqh", "usul-fiqh", "tasawwuf", "seerah", "tarikh", "lughah", "mantiq", "firaq", "general"]);
const authorSchema = z.object({ id: z.string(), name_ar: z.string(), name_en: z.string().nullable().optional(), died_year_hijri: z.number().nullable().optional(), born_year_hijri: z.number().nullable().optional(), bio_ar: z.string().nullable().optional() });
const detailBookSchema = z.object({ slug: z.string(), title_ar: z.string(), title_en: z.string().nullable().optional(), genre: genreSchema, school: z.string().nullable().optional(), written_year_hijri: z.number().nullable().optional(), pages: z.number().nullable().optional(), description_ar: z.string().nullable().optional(), description_en: z.string().nullable().optional(), has_pdf: z.boolean(), has_text: z.boolean(), has_chapters: z.boolean(), author: authorSchema, sources: z.array(z.object({ source_name: z.string(), source_url: z.string().url().nullable().optional() })) });
const textSchema = z.object({ slug: z.string(), source: z.enum(["turath", "openiti"]), pageCount: z.number(), chapterCount: z.number(), bibliography: z.record(z.string(), z.union([z.string(), z.number()])).catch({}), chapters: z.array(z.object({ title: z.string(), level: z.number().int().positive().catch(1), vol: z.string().nullable().optional(), page: z.number().nullable().optional(), text: z.string() })) });

/**
 * Both the v1 envelope and the documented legacy bare-response endpoint
 * are supported. Keep the first successful, schema-valid response.
 */
async function request<T>(path: string, schema: z.ZodType<T>, revalidate: number): Promise<T> {
  let lastError: unknown;
  for (const base of [BASE_URL, LEGACY_BASE_URL]) {
    try {
      const response = await fetch(`${base}${path}`, {
        next: { revalidate },
        signal: AbortSignal.timeout(7000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload: unknown = await response.json();
      const wrapped = z.object({ code: z.number(), status: z.string(), data: schema }).safeParse(payload);
      if (wrapped.success) {
        if (wrapped.data.code !== 200) throw new Error(`API code ${wrapped.data.code}`);
        return wrapped.data.data;
      }
      return schema.parse(payload);
    } catch (error) {
      lastError = error;
      console.warn("[library] source unavailable or response invalid", {
        host: new URL(base).host,
        path: path.split("?")[0],
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }
  throw new Error("Library sources unavailable", { cause: lastError });
}

/**
 * Do not call the library catalog at runtime: Islamic App returns 403 to the
 * production Vercel region. Browse the verified metadata snapshot instead.
 * This also provides stable results to the application's global search API.
 */
export async function getLibraryBooks(options: { genre?: LibraryGenre; limit?: number; offset?: number } = {}): Promise<LibraryPage> {
  return getIslamicSnapshotPage(options);
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
