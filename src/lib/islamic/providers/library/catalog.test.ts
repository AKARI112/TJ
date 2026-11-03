import { describe, expect, it } from "vitest";
import { parseLibraryCatalog } from "./catalog";

const book = {
  slug: "al-aqeedah-al-wasitiyya",
  title_ar: "العقيدة الواسطية",
  title_en: "Al-Aqeedah Al-Wasitiyya",
  author_id: "ibn-taymiyyah",
  author_name_ar: "ابن تيمية",
  genre: "aqeedah",
  has_pdf: true,
  has_text: true,
  has_chapters: false,
};

describe("Islamic App library catalog compatibility", () => {
  it("accepts the documented v1 enveloped response", () => {
    const catalog = parseLibraryCatalog({
      code: 200,
      status: "OK",
      data: { books: [book], total: 563, limit: 100, offset: 0 },
    }, { limit: 100, offset: 0 });
    expect(catalog.books).toHaveLength(1);
    expect(catalog.total).toBe(563);
    expect(catalog.books[0]?.titleArabic).toBe("العقيدة الواسطية");
    expect(catalog.books[0]?.hasPdf).toBe(true);
  });

  it("accepts documented legacy bare format and optional metadata", () => {
    const catalog = parseLibraryCatalog({
      books: [{ slug: "sample", title_ar: "كتاب", genre: "general", hasPdf: true }],
      total: 1,
    }, { limit: 10, offset: 0 });
    expect(catalog.books[0]).toMatchObject({ slug: "sample", titleArabic: "كتاب", hasPdf: true });
    expect(catalog.limit).toBe(10);
  });

  it("skips invalid records rather than discarding valid books", () => {
    const catalog = parseLibraryCatalog({ books: [null, {}, book], total: 3 }, { limit: 3, offset: 0 });
    expect(catalog.books).toHaveLength(1);
  });

  it("rejects a broken payload instead of inventing books", () => {
    expect(() => parseLibraryCatalog({ books: [{ slug: "missing-title" }] }, { limit: 10, offset: 0 })).toThrow();
    expect(() => parseLibraryCatalog({ code: 502, data: "upstream unavailable" }, { limit: 10, offset: 0 })).toThrow();
  });
});
