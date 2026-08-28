import { z } from "zod";
import type { HisnChapter } from "@/domain/hisn";
import rawHisn from "@/data/devotional/hisn.json";

const chapterSchema = z.object({ Audio: z.string().url().optional().or(z.literal("")), Adhkar: z.array(z.object({ Text: z.string().min(1), Count: z.coerce.number().int().positive().catch(1), Reference: z.string().catch("") })) });
const hisnObject = z.record(z.string(), chapterSchema).parse(rawHisn);
const chapters: HisnChapter[] = Object.entries(hisnObject).map(([title, chapter], index) => ({ id: index + 1, title, audio: chapter.Audio || undefined, items: chapter.Adhkar.map((item, itemIndex) => ({ id: `${index + 1}-${itemIndex + 1}`, text: item.Text, count: item.Count, reference: item.Reference })), sourceUrl: "https://github.com/asellam/HisnElMuslim" }));
export function getHisnChapters() { return chapters; }
export function getHisnChapter(id: number) { return chapters.find((chapter) => chapter.id === id); }
