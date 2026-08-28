import { describe, expect, it } from "vitest";
import { nextPrayer } from "./prayer-utils";
const timings = [{ key: "Fajr" as const, label: "الفجر", time: "05:00", obligatory: true }, { key: "Dhuhr" as const, label: "الظهر", time: "12:00", obligatory: true }];
describe("nextPrayer", () => { it("selects the next local prayer without an API tick", () => { expect(nextPrayer(timings, new Date(2026, 7, 28, 6, 0)).key).toBe("Dhuhr"); }); it("wraps to the first prayer", () => { expect(nextPrayer(timings, new Date(2026, 7, 28, 23, 0)).key).toBe("Fajr"); }); });
