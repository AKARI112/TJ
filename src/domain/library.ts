export type LibraryGenre = "tafsir" | "aqeedah" | "fiqh" | "usul-fiqh" | "tasawwuf" | "seerah" | "tarikh" | "lughah" | "mantiq" | "firaq" | "general";

export interface LibraryBook {
  slug: string;
  titleArabic: string;
  titleEnglish?: string;
  authorId: string;
  authorArabic: string;
  authorEnglish?: string;
  authorDiedHijri?: number;
  genre: LibraryGenre;
  school?: string;
  pages?: number;
  hasPdf: boolean;
  hasText: boolean;
  hasChapters: boolean;
}

export interface LibraryBookDetail extends LibraryBook {
  descriptionArabic?: string;
  descriptionEnglish?: string;
  writtenYearHijri?: number;
  authorBioArabic?: string;
  authorBornHijri?: number;
  sources: Array<{ name: string; url?: string }>;
}

export interface LibraryTextChapter { title: string; level: number; volume?: string; page?: number; text: string; }
export interface LibraryBookText { slug: string; source: "turath" | "openiti"; pageCount: number; chapterCount: number; bibliography: Record<string, string>; chapters: LibraryTextChapter[]; }
export interface LibraryPage { books: LibraryBook[]; total: number; limit: number; offset: number; }
