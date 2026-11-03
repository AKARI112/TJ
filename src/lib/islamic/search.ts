export function normalizeArabicSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").trim().toLowerCase();
}

/** Score candidate labels without modifying the original displayed text. */
export function searchRank(title: string, description: string, query: string) {
  const needle = normalizeArabicSearch(query);
  const heading = normalizeArabicSearch(title);
  const body = normalizeArabicSearch(description);
  if (heading === needle) return 0;
  if (heading.startsWith(needle)) return 1;
  if (heading.includes(needle)) return 2;
  if (body.includes(needle)) return 3;
  return 10;
}
