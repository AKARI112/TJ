import "server-only";

import { z } from "zod";
import type { DevotionalCategory, DevotionalItem } from "@/domain/devotional";
import type { HisnChapter } from "@/domain/hisn";

const BASE_URL = "https://api.islamic.app/v1";
const categoryInfoSchema = z.object({ number: z.string(), en: z.string(), ar: z.string() });
const localizedTextSchema = z.object({ body: z.string().optional(), text: z.string() });
const duaSchema = z.object({ number: z.string(), category: categoryInfoSchema, slug: z.string().optional(), repeatCount: z.number().int().positive().optional(), transliteration: z.object({ en: z.string() }).optional(), virtue: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(), source: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(), en: localizedTextSchema, ar: localizedTextSchema });
const categoryListSchema = z.object({ total_categories: z.number(), shortcuts: z.array(z.string()), categories: z.array(categoryInfoSchema.extend({ count: z.number().int().nonnegative() })) });
const categoryResponseSchema = z.object({ shortcut: z.string().optional(), label: z.string().optional(), category: categoryInfoSchema.optional(), count: z.number(), duas: z.array(duaSchema) });

async function request<T>(path: string, schema: z.ZodType<T>, revalidate: number): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate }, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Islamic App dhikr ${path}: ${response.status}`);
  return z.object({ code: z.number(), status: z.string(), data: schema }).parse(await response.json()).data;
}

function sourceText(item: z.infer<typeof duaSchema>) { return item.source?.ar?.trim() || item.source?.en?.trim() || "حصن المسلم"; }
function normalizeCategory(slug: string, data: z.infer<typeof categoryResponseSchema>, kind: "dhikr" | "dua"): DevotionalCategory {
  const category = data.category ?? data.duas[0]?.category;
  const label = category?.ar || arabicShortcutLabel(slug);
  const items: DevotionalItem[] = data.duas.map((item, index) => ({ id: item.slug ?? `${slug}-${item.number}`, category: slug, categoryLabel: label, position: index + 1, title: `${label} · ${item.number}`, arabic: item.ar.text, transliteration: item.transliteration?.en, translation: item.en.text, benefit: item.virtue?.ar ?? item.virtue?.en, source: sourceText(item), repeatCount: item.repeatCount ?? 1, repeatCountSourced: item.repeatCount !== undefined, isQuran: /(?:Quran|قرآن)\s*\d+[:：]\d+/i.test(sourceText(item)), provider: "Islamic App — Hisn al-Muslim", sourceUrl: `${BASE_URL}/dhikr/${encodeURIComponent(slug)}` }));
  return { slug, label, description: `نصوص حصن المسلم عبر Islamic App، وعدد التكرار لا يُنسب للمصدر إلا إذا ورد صراحة.`, kind, items };
}

function arabicShortcutLabel(slug: string) { return ({ morning: "أذكار الصباح", evening: "أذكار المساء", "after-prayer": "أذكار بعد الصلاة", "before-sleep": "أذكار النوم", "waking-up": "أذكار الاستيقاظ", prayer: "أدعية الصلاة", mosque: "أدعية المسجد", travel: "أدعية السفر", food: "أدعية الطعام", home: "أدعية المنزل", anxiety: "أدعية الكرب", protection: "أدعية الحفظ", forgiveness: "الاستغفار", hajj: "أدعية الحج والعمرة" } as Record<string, string>)[slug] ?? "أدعية وأذكار"; }

export const primaryDhikrCategories = ["morning", "evening", "after-prayer", "before-sleep", "waking-up"] as const;
export const primaryDuaCategories = ["prayer", "mosque", "travel", "food", "home", "anxiety", "protection", "forgiveness", "hajj"] as const;

export async function getIslamicAppDevotionalCategory(slug: string, kind: "dhikr" | "dua" = primaryDhikrCategories.includes(slug as never) ? "dhikr" : "dua") {
  if (!/^(?:[1-9]\d?|1[0-2]\d|13[0-2]|[a-z]+(?:-[a-z]+)*)$/.test(slug)) throw new Error("تصنيف غير صالح");
  return normalizeCategory(slug, await request(`/dhikr/${encodeURIComponent(slug)}`, categoryResponseSchema, 60 * 60 * 24 * 7), kind);
}

export async function getIslamicAppDevotionalCategories(kind: "dhikr" | "dua") {
  const slugs = kind === "dhikr" ? primaryDhikrCategories : primaryDuaCategories;
  const results = await Promise.allSettled(slugs.map((slug) => getIslamicAppDevotionalCategory(slug, kind)));
  const categories = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!categories.length) throw new Error("تعذر تحميل الأذكار من Islamic App");
  return categories;
}

export async function getIslamicAppHisnChapters(): Promise<HisnChapter[]> {
  const data = await request("/dhikr", categoryListSchema, 60 * 60 * 24 * 7);
  return data.categories.map((category) => ({ id: Number(category.number), title: category.ar, items: [], sourceUrl: `${BASE_URL}/dhikr/${category.number}`, provider: "Islamic App — Hisn al-Muslim" }));
}

export async function getIslamicAppHisnChapter(id: number): Promise<HisnChapter> {
  if (!Number.isInteger(id) || id < 1 || id > 132) throw new Error("باب حصن غير صالح");
  const category = await getIslamicAppDevotionalCategory(String(id), "dhikr");
  return { id, title: category.label, items: category.items.map((item) => ({ id: item.id, text: item.arabic, count: item.repeatCount, reference: item.source })), sourceUrl: `${BASE_URL}/dhikr/${id}`, provider: "Islamic App — Hisn al-Muslim" };
}
