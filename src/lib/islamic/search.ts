export function normalizeArabicSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").trim().toLowerCase();
}
