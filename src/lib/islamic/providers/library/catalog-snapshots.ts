import turathCatalog from "../../../../data/library/turath-catalog.json";
import islamicCatalog from "../../../../data/library/islamic-app-catalog.json";
import { normalizeArabicSearch } from "../../search";
import type { LibraryBook, LibraryGenre, LibraryPage } from "@/domain/library";

type TurathRow = [number, string, string, number];
type IslamicRow = [string, string, string, string, boolean, boolean, boolean];

export type LibrarySource = "all" | "turath" | "islamic-app";
export type LibraryFilter = "all" | "tafsir" | "aqeedah" | "hadith" | "fiqh" | "seerah" | "tarikh" | "lughah" | "adab" | "general";

export type CatalogEntry = {
  id: string;
  title: string;
  author: string;
  section: string;
  genre: LibraryFilter;
  source: Exclude<LibrarySource, "all">;
  url: string;
  pdf: boolean;
  text: boolean;
};

const categories = new Map<number, string>(turathCatalog.categories as [number, string][]);
const turathRows = turathCatalog.books as TurathRow[];
const islamicRows = islamicCatalog.books as IslamicRow[];

function turathGenre(id: number): LibraryFilter {
  if (id <= 2) return "aqeedah";
  if (id >= 3 && id <= 5) return "tafsir";
  if (id >= 6 && id <= 10) return "hadith";
  if ((id >= 11 && id <= 12) || (id >= 14 && id <= 22)) return "fiqh";
  if (id === 24) return "seerah";
  if (id >= 25 && id <= 28) return "tarikh";
  if (id >= 29 && id <= 31 || id === 35) return "lughah";
  if (id === 23 || (id >= 32 && id <= 34)) return "adab";
  return "general";
}

function islamicGenre(value: string): LibraryFilter {
  if (value === "tafsir") return "tafsir";
  if (value === "aqeedah") return "aqeedah";
  if (value === "fiqh" || value === "usul-fiqh") return "fiqh";
  if (value === "seerah") return "seerah";
  if (value === "tarikh") return "tarikh";
  if (value === "lughah" || value === "mantiq") return "lughah";
  if (value === "tasawwuf") return "adab";
  return "general";
}

const entries: CatalogEntry[] = [
  ...islamicRows.map(([slug, title, author, genre, pdf, text]) => ({
    id: slug, title, author, section: genre, genre: islamicGenre(genre),
    source: "islamic-app" as const, url: `/library/${encodeURIComponent(slug)}`,
    pdf, text,
  })),
  ...turathRows.map(([id, title, author, category]) => ({
    id: String(id), title, author, section: categories.get(category) ?? "تراث إسلامي",
    genre: turathGenre(category),
    source: "turath" as const, url: `/library/turath/${id}`,
    pdf: false, text: false,
  })),
];

const prepared = entries.map((entry) => ({
  entry,
  query: normalizeArabicSearch(`${entry.title} ${entry.author} ${entry.section}`),
}));

export const catalogStats = {
  islamicApp: islamicRows.length,
  turath: turathRows.length,
  total: entries.length,
  turathScannedAt: turathCatalog.scannedAt,
  islamicCapturedAt: islamicCatalog.capturedAt,
};

export function browseLibraryCatalog(filters: { q?: string; source?: LibrarySource; genre?: LibraryFilter; page?: number; pageSize?: number }) {
  const source = filters.source ?? "all";
  const genre = filters.genre ?? "all";
  const query = normalizeArabicSearch((filters.q ?? "").slice(0, 120));
  const pageSize = Math.max(1, Math.min(60, Math.trunc(filters.pageSize ?? 36)));
  const matches = prepared.filter(({ entry, query: haystack }) =>
    (source === "all" || entry.source === source) &&
    (genre === "all" || entry.genre === genre) &&
    (!query || haystack.includes(query))
  );
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.max(1, Math.min(pages, Math.trunc(filters.page ?? 1) || 1));
  return {
    books: matches.slice((page - 1) * pageSize, page * pageSize).map(({ entry }) => entry),
    total: matches.length, page, pages, pageSize,
  };
}

export function findIslamicSnapshotBook(slug: string): LibraryBook | null {
  const book = islamicRows.find((row) => row[0] === slug);
  if (!book) return null;
  const [id, titleArabic, authorArabic, genre, hasPdf, hasText, hasChapters] = book;
  return {
    slug: id, titleArabic, authorId: "", authorArabic,
    genre: (["tafsir", "aqeedah", "fiqh", "usul-fiqh", "tasawwuf", "seerah", "tarikh", "lughah", "mantiq", "firaq", "general"] as string[]).includes(genre) ? genre as LibraryGenre : "general",
    hasPdf, hasText, hasChapters,
  };
}

export function getIslamicSnapshotPage(options: { offset?: number; limit?: number; genre?: LibraryGenre } = {}): LibraryPage {
  const offset = Math.max(0, Math.trunc(options.offset ?? 0));
  const limit = Math.min(100, Math.max(1, Math.trunc(options.limit ?? 100)));
  const raw = options.genre ? islamicRows.filter((row) => row[3] === options.genre) : islamicRows;
  const books = raw.slice(offset, offset + limit).map((row) => findIslamicSnapshotBook(row[0])!).filter(Boolean);
  return { books, total: raw.length, offset, limit };
}

/**
 * Library readers use only verified book IDs from the bundled Turath index.
 * Page text itself is always fetched live from the original Turath service.
 */
export function findTurathSnapshotBook(id: number) {
  const record = turathRows.find((row) => row[0] === id);
  if (!record) return null;
  const [bookId, title, author, categoryId] = record;
  return {
    id: bookId,
    title,
    author,
    section: categories.get(categoryId) ?? "تراث إسلامي",
    sourceUrl: `https://app.turath.io/book/${bookId}`,
  };
}

function normalizedBibliography(value: string) {
  return normalizeArabicSearch(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Only offer a cross-provider alternative when *both* normalized title and
 * identifiable author match; matching a title alone can conflate distinct works.
 * We do not silently claim that Islamic App and Turath use the same edition.
 */
export function findMatchingTurathBook(title: string, author: string) {
  const wantedTitle = normalizedBibliography(title);
  const wantedAuthor = normalizedBibliography(author);
  if (!wantedTitle || wantedAuthor.length < 4) return null;
  const candidates = turathRows.filter((row) => {
    if (normalizedBibliography(row[1]) !== wantedTitle) return false;
    const foundAuthor = normalizedBibliography(row[2]);
    return foundAuthor === wantedAuthor ||
      (foundAuthor.length >= 6 && wantedAuthor.includes(foundAuthor)) ||
      (wantedAuthor.length >= 6 && foundAuthor.includes(wantedAuthor));
  });
  if (candidates.length !== 1) return null;
  return findTurathSnapshotBook(candidates[0]![0]);
}
