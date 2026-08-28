export interface QuranChapter {
  id: number; nameArabic: string; nameEnglish: string; meaningEnglish: string;
  versesCount: number; revelationPlace: "makkah" | "madinah"; provider: string; sourceUrl: string;
}

export interface QuranVerse {
  id: number; chapterId: number; verseNumber: number; textUthmani: string;
  juz: number; page: number; hizbQuarter: number; provider: string; sourceUrl: string;
}

export interface QuranChapterDetail extends QuranChapter { verses: QuranVerse[]; }

export interface ProviderResult<T> { data: T; provider: string; sourceUrl?: string; cached: boolean; }

export type MushafMode = "mushaf" | "tajweed";

export interface MushafWord {
  id: string;
  verseKey: string;
  position: number;
  pageNumber: number;
  lineNumber: number;
  charType: "word" | "end" | "pause" | "sajdah" | "rub-el-hizb";
  glyphCode?: string;
  textFallback?: string;
}

export interface MushafLine { lineNumber: number; words: MushafWord[]; }

export interface MushafPage {
  pageNumber: number;
  mushafId: 1 | 19;
  mode: MushafMode;
  lines: MushafLine[];
  fontUrl: string;
  fallbackFontUrl: string;
  provider: "Quran Foundation";
  sourceUrl: string;
}

export interface QuranResourceOption {
  id: number;
  name: string;
  languageName?: string;
  authorName?: string;
}
export interface QuranVerseStudy { verseKey: string; tafsir?: { resourceId: number; resourceName?: string; languageName?: string; text: string }; translation?: { resourceId: number; resourceName?: string; languageName?: string; text: string }; provider: "Quran Foundation"; sourceUrl: string; }
