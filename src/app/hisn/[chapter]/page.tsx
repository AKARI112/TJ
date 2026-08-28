import { notFound } from "next/navigation";
import { HisnChapter } from "@/components/devotional/hisn-chapter";
import { getHisnChapter } from "@/lib/islamic/providers/adhkar/hisn";
export default async function HisnChapterPage({ params }: { params: Promise<{ chapter: string }> }) { const { chapter: value } = await params; const chapter = await getHisnChapter(Number(value)); if (!chapter) notFound(); return <main><HisnChapter chapter={chapter} /></main>; }
