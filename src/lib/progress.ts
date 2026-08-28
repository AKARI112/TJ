import { z } from "zod";
import type { ReadingProgress } from "@/domain/personal";
const schema = z.object({ id: z.literal("quran-current"), chapterId: z.number().int().min(1).max(114), chapterName: z.string().min(1), verseNumber: z.number().int().positive(), pageNumber: z.number().int().min(1).max(604), mushafId: z.union([z.literal(1), z.literal(19)]), readingMode: z.enum(["mushaf", "reading", "tajweed"]), timestamp: z.string().datetime() });
export function serializeReadingProgress(progress: ReadingProgress) { return JSON.stringify(schema.parse(progress)); }
export function parseReadingProgress(value: string) { return schema.parse(JSON.parse(value)) as ReadingProgress; }
