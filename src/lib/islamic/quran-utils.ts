export function isMushafPage(value: number) { return Number.isInteger(value) && value >= 1 && value <= 604; }
export function islamicAppMushafUrl(page: number, theme: "light" | "dark" = "dark", font: "uthmani" | "imlaei" | "indopak" = "uthmani") { if (!isMushafPage(page)) throw new RangeError("صفحة المصحف بين 1 و604"); return `https://api.islamic.app/v1/mushaf/page/${page}.svg?font=${font}&theme=${theme}&width=900`; }
export function preserveQuranText(value: string) { return value.normalize("NFC"); }
export function normalizeResource(input: { id: number | string; name?: string; language_name?: string; author_name?: string }) { return { id: Number(input.id), name: input.name?.trim() || String(input.id), languageName: input.language_name?.trim() || undefined, authorName: input.author_name?.trim() || undefined }; }

const allowedTajweedClasses = new Set(["ham_wasl", "laam_shamsiyah", "madda_normal", "madda_permissible", "madda_necessary", "madda_obligatory", "qalqalah", "ikhafa", "ikhafa_shafawi", "idgham_shafawi", "iqlab", "idgham_ghunnah", "idgham_wo_ghunnah", "idgham_mutajanisayn", "idgham_mutaqaribayn", "ghunnah"]);
export function sanitizeTajweedMarkup(value: string) {
  return value
    .replace(/<tajweed\s+class=(?:"|')?([a-z_]+)(?:"|')?\s*>/gi, (_, className: string) => allowedTajweedClasses.has(className) ? `<tajweed class="${className}">` : "")
    .replace(/<span\s+class=(?:"|')?end(?:"|')?\s*>/gi, '<span class="end">')
    .replace(/<(?!\/?(?:tajweed|span)(?:\s|>))[^>]+>/gi, "")
    .replace(/<\/(?!tajweed>|span>)[^>]+>/gi, "");
}
