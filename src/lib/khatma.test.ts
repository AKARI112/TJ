import { describe, expect, it } from "vitest";
import { khatmaPace, localIsoDate } from "./khatma";

describe("optional Quran reading plan", () => {
  const plan = { id: "khatma-plan" as const, startedAt: "2026-11-01", startPage: 1, days: 30 };
  it("targets the full 604-page mushaf without claiming completed pages", () => {
    expect(khatmaPace(plan, new Date(2026, 10, 1)).pagesPerDay).toBe(21);
    expect(khatmaPace(plan, new Date(2026, 10, 30)).targetPage).toBe(604);
  });
  it("supports starting from the currently saved page", () => {
    expect(khatmaPace({ ...plan, startPage: 501 }, new Date(2026, 10, 1)).pagesPerDay).toBe(4);
  });
  it("formats a local civil date without UTC conversion", () => {
    expect(localIsoDate(new Date(2026, 10, 3))).toBe("2026-11-03");
  });
});
