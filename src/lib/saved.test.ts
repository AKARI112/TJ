import { describe, expect, it } from "vitest";
import { dedupeSavedItems } from "./saved";
const item = { id: "ayah:2:255", type: "ayah" as const, title: "آية الكرسي", href: "/quran/2#ayah-255", provider: "Quran Foundation", createdAt: "2026-08-28T00:00:00.000Z" };
describe("saved item deduplication", () => { it("keeps one canonical id", () => expect(dedupeSavedItems([item, { ...item, title: "محدث" }])).toHaveLength(1)); });
