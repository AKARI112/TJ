import { describe, expect, it } from "vitest";
import { normalizeDegrees, relativeQiblaDirection } from "./qibla";
describe("Qibla calculations", () => { it("normalizes rotations", () => expect(normalizeDegrees(-10)).toBe(350)); it("computes the relative direction without another API call", () => expect(relativeQiblaDirection(290, 20)).toBe(270)); });
