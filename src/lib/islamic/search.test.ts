import { describe, expect, it } from "vitest";
import { normalizeArabicSearch, searchRank } from "./search";
describe("normalizeArabicSearch", () => { it("removes search-only marks without changing source input", () => { const source = "ٱلْقُرْآنُ الـكَرِيم"; expect(normalizeArabicSearch(source)).toBe("القران الكريم"); expect(source).toBe("ٱلْقُرْآنُ الـكَرِيم"); }); });

describe("searchRank", () => {
  it("ranks title matches ahead of incidental description matches", () => {
    expect(searchRank("الصلاة", "", "الصلاة")).toBe(0);
    expect(searchRank("الصلاة في وقتها", "", "الصلاة")).toBe(1);
    expect(searchRank("فضل الصلاة", "", "الصلاة")).toBe(2);
    expect(searchRank("كتاب", "في أحكام الصلاة", "الصلاة")).toBe(3);
  });
  it("normalizes diacritics only for matching", () => {
    expect(searchRank("الصَّلَاة", "", "الصلاة")).toBe(0);
  });
});
