import "server-only";
import { z } from "zod";
import type { HadithCategory, HadithDetail, HadithPage } from "@/domain/hadith";
const BASE = "https://hadeethenc.com/api/v1";
const summarySchema = z.object({ id: z.string(), title: z.string() });
export async function getHadithCategories(): Promise<HadithCategory[]> {
  const response = await fetch(`${BASE}/categories/roots/?language=ar`, { next: { revalidate: 60 * 60 * 24 * 7 } }); if (!response.ok) throw new Error(`HadeethEnc categories: ${response.status}`);
  return z.array(z.object({ id: z.string(), title: z.string(), hadeeths_count: z.coerce.number(), parent_id: z.string().nullable() })).parse(await response.json()).map((item) => ({ id: item.id, title: item.title, count: item.hadeeths_count, parentId: item.parent_id }));
}
export async function getHadiths(categoryId = "5", page = 1, perPage = 20): Promise<HadithPage> {
  const params = new URLSearchParams({ language: "ar", category_id: categoryId, page: String(page), per_page: String(perPage) });
  const response = await fetch(`${BASE}/hadeeths/list/?${params}`, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) throw new Error(`HadeethEnc list: ${response.status}`); const payload = z.object({ data: z.array(summarySchema), meta: z.object({ current_page: z.coerce.number(), last_page: z.coerce.number(), total_items: z.coerce.number(), per_page: z.coerce.number() }) }).parse(await response.json());
  return { items: payload.data.map((item) => ({ ...item, provider: "موسوعة الأحاديث النبوية — HadeethEnc", sourceUrl: `https://hadeethenc.com/ar/browse/hadith/${item.id}` })), currentPage: payload.meta.current_page, lastPage: payload.meta.last_page, totalItems: payload.meta.total_items, perPage: payload.meta.per_page };
}
export async function getHadith(id: string): Promise<HadithDetail> {
  const response = await fetch(`${BASE}/hadeeths/one/?language=ar&id=${encodeURIComponent(id)}`, { next: { revalidate: 60 * 60 * 24 * 30 } }); if (!response.ok) throw new Error();
  const item = z.object({ id: z.string(), title: z.string(), hadeeth: z.string(), attribution: z.string(), grade: z.string(), explanation: z.string(), hints: z.array(z.string()), reference: z.string() }).parse(await response.json());
  return { id: item.id, title: item.title, text: item.hadeeth, attribution: item.attribution, grade: item.grade, explanation: item.explanation, benefits: item.hints, reference: item.reference, provider: "موسوعة الأحاديث النبوية — HadeethEnc", sourceUrl: `https://hadeethenc.com/ar/browse/hadith/${item.id}` };
}
