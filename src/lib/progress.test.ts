import { describe, expect, it } from "vitest";
import { parseReadingProgress, serializeReadingProgress } from "./progress";
describe("reading progress serialization", () => { it("round trips an exact reading location", () => { const progress = { id: "quran-current" as const, chapterId: 2, chapterName: "البقرة", verseNumber: 255, pageNumber: 42, mushafId: 1 as const, readingMode: "mushaf" as const, timestamp: "2026-08-28T00:00:00.000Z" }; expect(parseReadingProgress(serializeReadingProgress(progress))).toEqual(progress); }); });
