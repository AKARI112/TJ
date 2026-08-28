import { z } from "zod";
import type { HisnChapter } from "@/domain/hisn";
import rawHisn from "@/data/devotional/hisn.json";
import { getIslamicAppHisnChapter, getIslamicAppHisnChapters } from "@/lib/islamic/providers/adhkar/islamic-app";

const chapterSchema = z.object({ Audio: z.string().url().optional().or(z.literal("")), Adhkar: z.array(z.object({ Text: z.string().min(1), Count: z.coerce.number().int().positive().catch(1), Reference: z.string().catch("") })) });
const hisnObject = z.record(z.string(), chapterSchema).parse(rawHisn);
const chapters: HisnChapter[] = Object.entries(hisnObject).map(([title, chapter], index) => ({ id: index + 1, title, audio: chapter.Audio || undefined, items: chapter.Adhkar.map((item, itemIndex) => ({ id: `${index + 1}-${itemIndex + 1}`, text: item.Text, count: item.Count, reference: item.Reference })), sourceUrl: "https://github.com/asellam/HisnElMuslim", provider: "HisnElMuslim — نسخة أوفلاين" }));
export async function getHisnChapters() { try { return await getIslamicAppHisnChapters(); } catch { return chapters; } }
export async function getHisnChapter(id: number) { try { return await getIslamicAppHisnChapter(id); } catch { return chapters.find((chapter) => chapter.id === id); } }
