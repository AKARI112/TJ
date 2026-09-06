import "server-only";

import type { MushafPage, ProviderResult } from "@/domain/quran";
import { isMushafPage } from "@/lib/islamic/quran-utils";

const ALFURQAN_BASE_URL = "https://alfurqan.online";

export function alFurqanMushafPageUrl(page: number) {
  if (!isMushafPage(page)) throw new RangeError("صفحة المصحف بين 1 و604");
  return `${ALFURQAN_BASE_URL}/api/v1/quran-text/page/${page}`;
}

export function getAlFurqanMushafPage(page: number, firstVerseKey?: string): ProviderResult<MushafPage> {
  const sourceUrl = alFurqanMushafPageUrl(page);
  return {
    data: {
      pageNumber: page,
      mushafId: 1,
      mode: "mushaf",
      imageUrl: sourceUrl,
      firstVerseKey,
      provider: "Al Furqan",
      sourceUrl,
    },
    provider: "Al Furqan",
    sourceUrl,
    cached: true,
  };
}
