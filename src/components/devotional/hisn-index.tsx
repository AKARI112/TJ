"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import type { HisnChapter } from "@/domain/hisn";
import { Input } from "@/components/motion/input";
import { normalizeArabicSearch } from "@/lib/islamic/search";

export function HisnIndex({ chapters }: { chapters: HisnChapter[] }) { const [query, setQuery] = useState(""); const results = useMemo(() => { const needle = normalizeArabicSearch(query); return needle ? chapters.filter((chapter) => normalizeArabicSearch(`${chapter.title} ${chapter.items.map((item) => item.text).join(" ")}`).includes(needle)) : chapters; }, [chapters, query]); return <><Input value={query} onChange={setQuery} placeholder="ابحث في أبواب حصن المسلم" leftIcon={<Search />} className="mb-7 w-full sm:max-w-md" /><section className="hisn-index" aria-label="فهرس حصن المسلم">{results.map((chapter) => <Link href={`/hisn/${chapter.id}`} key={chapter.id} className="hisn-index-row"><span className="hisn-number">{chapter.id}</span><div><h2>{chapter.title}</h2><p>{chapter.items.length} {chapter.items.length === 1 ? "ذكر" : "أذكار"}</p></div><ArrowLeft /></Link>)}</section>{!results.length && <div className="compact-empty">لا توجد أبواب مطابقة.</div>}</>; }
