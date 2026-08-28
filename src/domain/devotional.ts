export type DevotionalCategorySlug = "morning-dhikr" | "evening-dhikr" | "dhikr-after-salah" | "daily-dua" | "selected-dua";

export interface DevotionalItem {
  id: string;
  category: DevotionalCategorySlug;
  categoryLabel: string;
  position: number;
  title: string;
  arabic: string;
  transliteration?: string;
  translation?: string;
  note?: string;
  benefit?: string;
  source: string;
  repeatCount: number;
  isQuran: boolean;
  provider: "Fitrahive Dua-Dhikr";
  sourceUrl: string;
}

export interface DevotionalCategory {
  slug: DevotionalCategorySlug;
  label: string;
  description: string;
  kind: "dhikr" | "dua";
  items: DevotionalItem[];
}
