export interface QuranChapter {
  id: number; nameArabic: string; nameEnglish: string; meaningEnglish: string;
  versesCount: number; revelationPlace: "makkah" | "madinah"; provider: string; sourceUrl: string;
}

export interface QuranVerse {
  id: number; chapterId: number; verseNumber: number; textUthmani: string;
  juz: number; page: number; hizbQuarter: number; provider: string; sourceUrl: string;
}

export interface QuranChapterDetail extends QuranChapter { verses: QuranVerse[]; }

export interface ProviderResult<T> { data: T; provider: string; sourceUrl: string; cached: boolean; }
