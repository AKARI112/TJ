import { z } from "zod";
import type { DevotionalCategory, DevotionalCategorySlug, DevotionalItem } from "@/domain/devotional";
import morning from "@/data/devotional/morning-dhikr.json";
import evening from "@/data/devotional/evening-dhikr.json";
import afterSalah from "@/data/devotional/dhikr-after-salah.json";
import dailyDua from "@/data/devotional/daily-dua.json";
import selectedDua from "@/data/devotional/selected-dua.json";
import { parseRepeatCount } from "@/lib/islamic/devotional";
export { parseRepeatCount } from "@/lib/islamic/devotional";

const sourceItemSchema = z.object({
  title: z.string().min(1), arabic: z.string().min(1), latin: z.string().optional(),
  translation: z.string().nullable().optional(), notes: z.string().nullable().optional(),
  fawaid: z.string().nullable().optional(), benefits: z.string().nullable().optional(), source: z.string().nullable().optional(),
});

const definitions: Array<{ slug: DevotionalCategorySlug; label: string; description: string; kind: "dhikr" | "dua"; raw: unknown }> = [
  { slug: "morning-dhikr", label: "أذكار الصباح", description: "ورد الصباح بنصه ومصدره وعدد تكراره.", kind: "dhikr", raw: morning },
  { slug: "evening-dhikr", label: "أذكار المساء", description: "ورد المساء في جلسة هادئة قابلة للاستئناف.", kind: "dhikr", raw: evening },
  { slug: "dhikr-after-salah", label: "أذكار بعد الصلاة", description: "الأذكار الواردة بعد الصلاة المفروضة.", kind: "dhikr", raw: afterSalah },
  { slug: "daily-dua", label: "أدعية يومية", description: "أدعية للمواقف اليومية مع المرجع المتاح.", kind: "dua", raw: dailyDua },
  { slug: "selected-dua", label: "أدعية مختارة", description: "مجموعة موجزة من الأدعية المختارة.", kind: "dua", raw: selectedDua },
];

function normalize(definition: (typeof definitions)[number]): DevotionalCategory {
  const parsed = z.array(sourceItemSchema).parse(definition.raw);
  const items: DevotionalItem[] = parsed.map((item, index) => ({
    id: `${definition.slug}-${index + 1}`,
    category: definition.slug,
    categoryLabel: definition.label,
    position: index + 1,
    title: item.title,
    arabic: item.arabic,
    transliteration: item.latin,
    translation: item.translation ?? undefined,
    note: item.notes ?? undefined,
    benefit: item.fawaid ?? item.benefits ?? undefined,
    source: item.source?.trim() || "لم يذكر المصدر في مجموعة البيانات",
    repeatCount: parseRepeatCount(item.notes ?? undefined),
    isQuran: /Ayatul|Al-Ikhlas|Al-Falaq|An-Nas|Baqarah/i.test(item.title),
    provider: "Fitrahive Dua-Dhikr",
    sourceUrl: `https://github.com/fitrahive/dua-dhikr/tree/main/data/dua-dhikr/${definition.slug}`,
  }));
  return { ...definition, items };
}

const categories = definitions.map(normalize);

export function getDevotionalCategories(kind?: "dhikr" | "dua") {
  return kind ? categories.filter((category) => category.kind === kind) : categories;
}

export function getDevotionalCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getDevotionalItem(category: string, id: string) {
  return getDevotionalCategory(category)?.items.find((item) => item.id === id);
}
