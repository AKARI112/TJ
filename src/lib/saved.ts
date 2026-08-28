import type { SavedItem } from "@/domain/personal";
export function dedupeSavedItems(items: SavedItem[]) { return [...new Map(items.map((item) => [item.id, item])).values()]; }
