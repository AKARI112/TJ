export type SavedItemType =
  | "ayah"
  | "mushaf-page"
  | "surah"
  | "tafsir"
  | "hadith"
  | "dua"
  | "dhikr"
  | "reciter"
  | "recitation"
  | "daily-content";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  excerpt?: string;
  href: string;
  provider: string;
  sourceUrl?: string;
  reference?: string;
  createdAt: string;
}

export interface ReadingProgress {
  id: "quran-current";
  chapterId: number;
  chapterName: string;
  verseNumber: number;
  pageNumber: number;
  mushafId: 1 | 19;
  readingMode: "mushaf" | "reading" | "tajweed";
  timestamp: string;
}

export interface ReadingMarker extends Omit<ReadingProgress, "id"> {
  id: "quran-marker";
}

export interface HistoryItem {
  id: string;
  type: "quran" | "hadith" | "dua" | "adhkar" | "reciter" | "tafsir";
  title: string;
  href: string;
  viewedAt: string;
}

export type ReminderType = "prayer" | "quran" | "morning-adhkar" | "evening-adhkar" | "kahf" | "custom";

export interface Reminder {
  id: string;
  type: ReminderType;
  label: string;
  enabled: boolean;
  time: string;
  days: number[];
  timezone: string;
  prayerOffsetMinutes?: number;
  createdAt: string;
}

export interface AdhkarSession {
  id: string;
  category: string;
  itemId: string;
  itemIndex: number;
  count: number;
  completedItemIds: string[];
  updatedAt: string;
}
