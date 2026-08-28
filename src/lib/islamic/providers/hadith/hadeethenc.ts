import "server-only";
import { z } from "zod";
import type { HadithDetail, HadithSummary } from "@/domain/hadith";
const BASE = "https://hadeethenc.com/api/v1";
export async function getHadiths(): Promise<HadithSummary[]> {
  const response = await fetch(`${BASE}/hadeeths/list/?language=ar&category_id=1&page=1&per_page=20`, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) throw new Error(); const payload = z.object({ data: z.array(z.object({ id: z.string(), title: z.string() })) }).parse(await response.json());
  return payload.data.map((item) => ({ ...item, provider: "موسوعة الأحاديث النبوية — HadeethEnc", sourceUrl: `https://hadeethenc.com/ar/browse/hadith/${item.id}` }));
}
export async function getHadith(id: string): Promise<HadithDetail> {
  const response = await fetch(`${BASE}/hadeeths/one/?language=ar&id=${encodeURIComponent(id)}`, { next: { revalidate: 60 * 60 * 24 * 30 } }); if (!response.ok) throw new Error();
  const item = z.object({ id: z.string(), title: z.string(), hadeeth: z.string(), attribution: z.string(), grade: z.string(), explanation: z.string(), hints: z.array(z.string()), reference: z.string() }).parse(await response.json());
  return { id: item.id, title: item.title, text: item.hadeeth, attribution: item.attribution, grade: item.grade, explanation: item.explanation, benefits: item.hints, reference: item.reference, provider: "موسوعة الأحاديث النبوية — HadeethEnc", sourceUrl: `https://hadeethenc.com/ar/browse/hadith/${item.id}` };
}
