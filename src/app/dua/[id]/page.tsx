import { notFound } from "next/navigation";
import { DhikrSession } from "@/components/devotional/dhikr-session";
import { getDevotionalCategory } from "@/lib/islamic/providers/adhkar/local-hisn";

export default async function DuaDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> }) { const [{ id }, query] = await Promise.all([params, searchParams]); const category = getDevotionalCategory(query.category ?? "daily-dua"); if (!category || category.kind !== "dua") notFound(); const index = category.items.findIndex((item) => item.id === id); if (index < 0) notFound(); return <main><DhikrSession category={{ ...category, items: [category.items[index]] }} /></main>; }
