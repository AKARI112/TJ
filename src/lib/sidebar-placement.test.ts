import { describe, expect, it } from "vitest";
import { desktopSidebarOrder } from "./sidebar-placement";

describe("desktop sidebar RTL/LTR order", () => {
  it("uses the actual right edge when side=right", () => {
    expect(desktopSidebarOrder("right")).toBe("ltr:order-last rtl:order-first");
  });
  it("uses the actual left edge when side=left", () => {
    expect(desktopSidebarOrder("left")).toBe("ltr:order-first rtl:order-last");
  });
});
