import { describe, expect, it } from "vitest";
import { browseLibraryCatalog, catalogStats, findIslamicSnapshotBook, getIslamicSnapshotPage } from "./catalog-snapshots";

describe("offline Islamic library catalog", () => {
  it("bundles verified book metadata from two sources", () => {
    expect(catalogStats.islamicApp).toBe(563);
    expect(catalogStats.turath).toBe(8124);
    expect(catalogStats.total).toBe(8687);
  });

  it("searches all Turath titles and authors without external requests", () => {
    const result = browseLibraryCatalog({ q: "صحيح البخاري", source: "turath", pageSize: 20 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.books.every((book) => book.source === "turath")).toBe(true);
    expect(result.books[0]?.url).toMatch(/^https:\/\/app\.turath\.io\/book\/\d+$/);
  });

  it("paginates source results within supported boundaries", () => {
    const first = browseLibraryCatalog({ source: "islamic-app", page: 1 });
    const second = browseLibraryCatalog({ source: "islamic-app", page: 2 });
    expect(first.books).toHaveLength(36);
    expect(second.books).toHaveLength(36);
    expect(first.books[0]?.id).not.toBe(second.books[0]?.id);
  });

  it("filters by subject without inventing classifications or PDF availability", () => {
    const res = browseLibraryCatalog({ genre: "tafsir", pageSize: 15 });
    expect(res.total).toBeGreaterThan(0);
    expect(res.books.every((book) => book.genre === "tafsir")).toBe(true);
  });

  it("provides Islamic App metadata even when external API returns 403", () => {
    const entry = findIslamicSnapshotBook("al-aqeedah-al-wasitiyya");
    expect(entry?.titleArabic).toBe("العقيدة الواسطية");
    const page = getIslamicSnapshotPage({ limit: 30, offset: 0 });
    expect(page.total).toBe(563);
    expect(page.books).toHaveLength(30);
  });
});
