import "server-only";

import { getDevotionalCategories as getLocalCategories, getDevotionalCategory as getLocalCategory } from "@/lib/islamic/providers/adhkar/local-hisn";
import { getIslamicAppDevotionalCategories, getIslamicAppDevotionalCategory } from "@/lib/islamic/providers/adhkar/islamic-app";

const localAliases: Record<string, string> = { morning: "morning-dhikr", evening: "evening-dhikr", "after-prayer": "dhikr-after-salah" };

export async function getDevotionalCategories(kind: "dhikr" | "dua") {
  try { return await getIslamicAppDevotionalCategories(kind); }
  catch { return getLocalCategories(kind); }
}

export async function getDevotionalCategory(slug: string, kind?: "dhikr" | "dua") {
  try { return await getIslamicAppDevotionalCategory(slug, kind); }
  catch { return getLocalCategory(localAliases[slug] ?? slug); }
}
