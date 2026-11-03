import { z } from "zod";
import type { LibraryBook, LibraryGenre, LibraryPage } from "@/domain/library";

/** Parses provider-owned catalog metadata without inventing religious content. */
const genres = [
  "tafsir", "aqeedah", "fiqh", "usul-fiqh", "tasawwuf",
  "seerah", "tarikh", "lughah", "mantiq", "firaq", "general",
] as const satisfies readonly LibraryGenre[];

const bookSchema = z.object({
  slug: z.string().trim().min(1),
  title_ar: z.string().trim().min(1),
  title_en: z.string().nullish(),
  author_id: z.union([z.string(), z.number()]).nullish(),
  author_name_ar: z.string().nullish(),
  author_name_en: z.string().nullish(),
  author_died_year_hijri: z.number().nullish(),
  genre: z.string().nullish(),
  school: z.string().nullish(),
  pages: z.number().nullish(),
  has_pdf: z.union([z.boolean(), z.number()]).nullish(),
  has_text: z.union([z.boolean(), z.number()]).nullish(),
  has_chapters: z.union([z.boolean(), z.number()]).nullish(),
  hasPdf: z.boolean().optional(),
  hasText: z.boolean().optional(),
  hasChapters: z.boolean().optional(),
});

const catalogSchema = z.object({
  books: z.array(z.unknown()),
  total: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

const isAvailable = (value: boolean | number | null | undefined) =>
  value === true || value === 1;

export function parseLibraryCatalog(raw: unknown, requested: { limit: number; offset: number }): LibraryPage {
  const envelope = z.object({ code: z.number(), data: z.unknown() }).safeParse(raw);
  if (envelope.success && envelope.data.code !== 200) throw new Error("Library upstream reported an error");
  const body = envelope.success ? envelope.data.data : raw;
  const parsed = catalogSchema.parse(body);
  const books: LibraryBook[] = [];
  for (const value of parsed.books) {
    const item = bookSchema.safeParse(value);
    if (!item.success) continue;
    const book = item.data;
    // Unknown future categories are represented as 'general' rather than guessing.
    const genre = genres.find((entry) => entry === book.genre) ?? "general";
    books.push({
      slug: book.slug,
      titleArabic: book.title_ar,
      titleEnglish: book.title_en ?? undefined,
      authorId: String(book.author_id ?? ""),
      authorArabic: book.author_name_ar || "المؤلف غير محدد",
      authorEnglish: book.author_name_en ?? undefined,
      authorDiedHijri: book.author_died_year_hijri ?? undefined,
      genre,
      school: book.school ?? undefined,
      pages: book.pages ?? undefined,
      hasPdf: isAvailable(book.has_pdf ?? book.hasPdf),
      hasText: isAvailable(book.has_text ?? book.hasText),
      hasChapters: isAvailable(book.has_chapters ?? book.hasChapters),
    });
  }
  if (parsed.books.length > 0 && books.length === 0) throw new Error("Library catalog response has no usable book entries");
  return {
    books, total: parsed.total ?? books.length,
    limit: parsed.limit ?? requested.limit,
    offset: parsed.offset ?? requested.offset,
  };
}
