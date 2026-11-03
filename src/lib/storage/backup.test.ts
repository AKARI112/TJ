import { describe, expect, it } from "vitest";
import { parseBackup } from "./backup";

const empty = { version: 1, app: "dhu-al-jalal", exportedAt: "2026-11-03", stores: {
  saved: [], history: [], progress: [], reminders: [], "adhkar-session": [], goals: [],
}, preferences: {} };

describe("local backup import validation", () => {
  it("accepts the local data backup format", () => expect(parseBackup(JSON.stringify(empty)).version).toBe(1));
  it("rejects invalid versions", () => expect(() => parseBackup(JSON.stringify({ ...empty, version: 9 }))).toThrow());
  it("rejects external or executable saved links", () => {
    const modified = { ...empty, stores: { ...empty.stores, saved: [{ id: "x", type: "ayah", title: "test", href: "javascript:alert(1)" }] } };
    expect(() => parseBackup(JSON.stringify(modified))).toThrow();
  });
});
