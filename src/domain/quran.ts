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

export interface TajweedPageVerse {
  id: number;
  verseKey: string;
  verseNumber: number;
  textUthmani: string;
  tajweedMarkup: string;
}

export interface MushafPage {
  pageNumber: number;
  mushafId: 1;
  mode: MushafMode;
  imageUrl?: string;
  verses?: TajweedPageVerse[];
  firstVerseKey?: string;
  provider: string;
  sourceUrl: string;
}

export interface QuranResourceOption {
  id: number;
  slug: string;
  name: string;
  languageName?: string;
  authorName?: string;
}
export interface QuranWordStudy { position: number; textUthmani: string; translation?: string; transliteration?: string; audioUrl?: string; }
export interface QuranVerseStudy { verseKey: string; tafsir?: { resourceId: number; resourceName?: string; languageName?: string; text: string }; translation?: { resourceId: number; resourceName?: string; languageName?: string; text: string }; words?: QuranWordStudy[]; provider: "Islamic App"; sourceUrl: string; }
