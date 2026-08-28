import { notFound } from "next/navigation";
import { DhikrSession } from "@/components/devotional/dhikr-session";
import { getDevotionalCategory } from "@/lib/islamic/providers/adhkar/local-hisn";

export function generateStaticParams() { return ["morning-dhikr", "evening-dhikr", "dhikr-after-salah"].flatMap((slug) => getDevotionalCategory(slug)?.items.map((item) => ({ category: slug, id: item.id })) ?? []); }
export default async function DhikrCategoryPage({ params }: { params: Promise<{ category: string; id: string }> }) { const { category: slug, id } = await params; const category = getDevotionalCategory(slug); if (!category || category.kind !== "dhikr") notFound(); const startIndex = category.items.findIndex((item) => item.id === id); if (startIndex < 0) notFound(); const rotated = { ...category, items: [...category.items.slice(startIndex), ...category.items.slice(0, startIndex)] }; return <main><DhikrSession category={rotated} /></main>; }
