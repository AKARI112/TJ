import { notFound } from "next/navigation";
import { ReciterProfile } from "@/components/audio/reciter-profile";
import { getReciter } from "@/lib/islamic/providers/audio/mp3quran";
import { getChapters } from "@/lib/islamic/providers/quran";
export const dynamic = "force-dynamic";
export default async function ReciterPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [reciter, chapters] = await Promise.all([getReciter(Number(id)), getChapters()]); if (!reciter) notFound(); return <main><ReciterProfile reciter={reciter} chapters={chapters.data} /></main>; }
