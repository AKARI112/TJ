export type DevotionalCategorySlug = string;

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
  repeatCountSourced?: boolean;
  isQuran: boolean;
  provider: string;
  sourceUrl: string;
}

export interface DevotionalCategory {
  slug: DevotionalCategorySlug;
  label: string;
  description: string;
  kind: "dhikr" | "dua";
  items: DevotionalItem[];
}
