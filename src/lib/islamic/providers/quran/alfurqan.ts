import "server-only";

import { z } from "zod";
import type { MushafLayoutLine, MushafMode, MushafPage, ProviderResult, TajweedPageVerse } from "@/domain/quran";
import { isMushafPage } from "@/lib/islamic/quran-utils";

const ALFURQAN_BASE_URL = "https://alfurqan.online";

const layoutWordSchema = z.object({
  location: z.string(),
  word: z.string(),
  qpcV2: z.string(),
  qpcV1: z.string().optional(),
  isEnd: z.boolean().optional(),
});

const layoutLineSchema = z.object({
  line: z.number().int(),
  type: z.string(),
  surah: z.number().int().optional(),
  text: z.string().optional(),
  verseRange: z.string().optional(),
  words: z.array(layoutWordSchema).optional().default([]),
});

const layoutSchema = z.object({ page: z.number().int(), lines: z.array(layoutLineSchema) });

export function alFurqanMushafPageUrl(page: number) {
  if (!isMushafPage(page)) throw new RangeError("صفحة المصحف بين 1 و604");
  return `${ALFURQAN_BASE_URL}/api/v1/quran-text/page/${page}`;
}

export function alFurqanQcfFontUrl(page: number, mode: MushafMode) {
  if (!isMushafPage(page)) throw new RangeError("صفحة المصحف بين 1 و604");
  return `${ALFURQAN_BASE_URL}/api/v1/quran-fonts/${mode === "tajweed" ? "v4" : "v2"}/${page}`;
}

export async function getAlFurqanMushafLayout(page: number): Promise<MushafLayoutLine[]> {
  if (!isMushafPage(page)) throw new RangeError("صفحة المصحف بين 1 و604");
  const response = await fetch(`${ALFURQAN_BASE_URL}/api/v1/quran-fonts/layout/${page}`, {
    next: { revalidate: 60 * 60 * 24 * 30 },
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Al Furqan layout: ${response.status}`);
  return layoutSchema.parse(await response.json()).lines;
}

export function getAlFurqanMushafPage(
  page: number,
  options: {
    mode?: MushafMode;
    firstVerseKey?: string;
    layout?: MushafLayoutLine[];
    verses?: TajweedPageVerse[];
  } = {},
): ProviderResult<MushafPage> {
  const mode = options.mode ?? "mushaf";
  const sourceUrl = alFurqanMushafPageUrl(page);
  return {
    data: {
      pageNumber: page,
      mushafId: 1,
      mode,
      imageUrl: sourceUrl,
      fontUrl: options.layout?.length ? alFurqanQcfFontUrl(page, mode) : undefined,
      layout: options.layout,
      verses: options.verses,
      firstVerseKey: options.firstVerseKey,
      provider: "Al Furqan",
      sourceUrl,
    },
    provider: "Al Furqan",
    sourceUrl,
    cached: true,
  };
}

const tafsirSchema = z.object({
  tafseer: z.object({ id: z.string().optional(), name_ar: z.string().optional(), name_en: z.string().optional(), language: z.string().optional() }).passthrough(),
  surah: z.object({ number: z.number().int() }).passthrough(),
  ayah: z.object({ ayah: z.number().int(), text: z.string() }).passthrough(),
});

export async function getAlFurqanTafsir(surah: number, ayah: number, tafsirId = "muyassar") {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
    throw new Error("مرجع آية غير صالح");
  }
  const url = `${ALFURQAN_BASE_URL}/api/v1/tafseer/${encodeURIComponent(tafsirId)}/surah/${surah}/ayah/${ayah}`;
  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 }, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Al Furqan tafsir: ${response.status}`);
  const data = tafsirSchema.parse(await response.json());
  return {
    verseKey: `${surah}:${ayah}`,
    text: data.ayah.text,
    name: data.tafseer.name_ar ?? data.tafseer.name_en ?? "التفسير الميسر",
    provider: "Al Furqan",
    sourceUrl: url,
  };
}
