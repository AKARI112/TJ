import { describe, expect, it } from "vitest";
import { normalizeArabicSearch } from "./search";
describe("normalizeArabicSearch", () => { it("removes search-only marks without changing source input", () => { const source = "ٱلْقُرْآنُ الـكَرِيم"; expect(normalizeArabicSearch(source)).toBe("القران الكريم"); expect(source).toBe("ٱلْقُرْآنُ الـكَرِيم"); }); });
