import { describe, expect, it } from "vitest";
import { formatCountdown, getPrayerState, minutesFromTime } from "./prayer";
import { addCalendarDays, zonedClockToInstant, zonedIsoDate } from "./prayer-timezone";
const timings = [
  { key: "Fajr" as const, label: "الفجر", time: "05:00", obligatory: true },
  { key: "Sunrise" as const, label: "الشروق", time: "06:20", obligatory: false },
  { key: "Dhuhr" as const, label: "الظهر", time: "12:00", obligatory: true },
  { key: "Asr" as const, label: "العصر", time: "15:30", obligatory: true },
  { key: "Maghrib" as const, label: "المغرب", time: "18:10", obligatory: true },
  { key: "Isha" as const, label: "العشاء", time: "19:40", obligatory: true },
];
describe("prayer parsing and countdown", () => {
  it("parses API clock values", () => expect(minutesFromTime("15:30")).toBe(930));
  it("excludes sunrise from obligatory prayers", () => {
    const state = getPrayerState(timings, new Date("2026-11-03T02:30:00Z"), "Asia/Riyadh");
    expect(state?.current.key).toBe("Fajr");
    expect(state?.next.key).toBe("Dhuhr");
  });
  it("uses the prayer location, not the visitor browser's timezone", () => {
    expect(zonedIsoDate(new Date("2026-11-03T23:30:00Z"), "Asia/Riyadh")).toBe("2026-11-04");
    const state = getPrayerState(timings, new Date("2026-11-03T09:00:00Z"), "Asia/Riyadh");
    expect(state?.next.key).toBe("Asr");
    expect(state?.millisecondsUntilNext).toBe(3.5 * 60 * 60 * 1000);
  });
  it("selects tomorrow's actual Fajr after Isha", () => {
    const tomorrow = timings.map((p) => p.key === "Fajr" ? { ...p, time: "05:07" } : p);
    const state = getPrayerState(timings, new Date("2026-11-03T19:00:00Z"), "Asia/Riyadh", tomorrow);
    expect(state?.next.key).toBe("Fajr");
    expect(state?.millisecondsUntilNext).toBe(7 * 60 * 60 * 1000 + 7 * 60 * 1000);
  });
  it("handles calendar rollover and timezone conversion", () => {
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(zonedClockToInstant("2026-11-03", "05:00", "Asia/Riyadh").toISOString()).toBe("2026-11-03T02:00:00.000Z");
  });
  it("formats a countdown", () => expect(formatCountdown(3_661_000)).toBe("01:01:01"));
});
