/**
 * A flex-row container follows document direction.
 * First child is visually right in RTL and left in LTR. Select the
 * ordering by BOTH writing direction and the requested physical sidebar side.
 */
export function desktopSidebarOrder(side: "left" | "right") {
  return side === "right"
    ? "ltr:order-last rtl:order-first"
    : "ltr:order-first rtl:order-last";
}
