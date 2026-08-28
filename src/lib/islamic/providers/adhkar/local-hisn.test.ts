import { describe, expect, it } from "vitest";
import { parseRepeatCount } from "../../devotional";
describe("devotional count normalization", () => { it("preserves sourced repeat targets", () => { expect(parseRepeatCount("Recite 3x")).toBe(3); expect(parseRepeatCount("Read once")).toBe(1); }); });
