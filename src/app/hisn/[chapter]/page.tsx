import { notFound } from "next/navigation";
import { HisnChapter } from "@/components/devotional/hisn-chapter";
import { getHisnChapter, getHisnChapters } from "@/lib/islamic/providers/adhkar/hisn";
export function generateStaticParams() { return getHisnChapters().map((chapter) => ({ chapter: String(chapter.id) })); }
export default async function HisnChapterPage({ params }: { params: Promise<{ chapter: string }> }) { const { chapter: value } = await params; const chapter = getHisnChapter(Number(value)); if (!chapter) notFound(); return <main><HisnChapter chapter={chapter} /></main>; }
