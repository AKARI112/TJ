"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/motion/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { MushafPage } from "@/domain/quran";
import { islamicAppMushafUrl } from "@/lib/islamic/quran-utils";
import { progressRepository } from "@/lib/storage/repositories";

type MushafScript = "uthmani" | "imlaei" | "indopak";

export function IslamicAppMushafPage({ page }: { page: MushafPage }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [jump, setJump] = useState(String(page.pageNumber));
  const [script, setScript] = useState<MushafScript>("uthmani");
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dhu-al-jalal:quran-script");
    if (saved === "uthmani" || saved === "imlaei" || saved === "indopak") setScript(saved);
    const [chapterId = "1", verseNumber = "1"] = (page.firstVerseKey ?? "1:1").split(":");
    void progressRepository.save({ id: "quran-current", chapterId: Number(chapterId), chapterName: "المصحف", verseNumber: Number(verseNumber), pageNumber: page.pageNumber, mushafId: 1, readingMode: page.mode, timestamp: new Date().toISOString() });
  }, [page]);

  const go = (target: number, mode = page.mode) => { if (target < 1 || target > 604) return; router.push(`/quran/page/${target}${mode === "tajweed" ? "?mode=tajweed" : ""}`); };
  const finishSwipe = (clientX: number) => { if (startX.current === null) return; const delta = clientX - startX.current; startX.current = null; if (Math.abs(delta) >= 60) go(page.pageNumber + (delta > 0 ? 1 : -1)); };
  const imageUrl = islamicAppMushafUrl(page.pageNumber, resolvedTheme === "light" ? "light" : "dark", script);

  return <main className="mushaf-reader">
    <header className="mushaf-toolbar">
      <Tabs value={page.mode} onValueChange={(value) => value === "reading" ? router.push("/quran") : go(page.pageNumber, value as MushafPage["mode"])} variant="segment"><TabsList className="bg-muted"><TabsTrigger value="mushaf">المصحف</TabsTrigger><TabsTrigger value="reading">القراءة</TabsTrigger><TabsTrigger value="tajweed">التجويد</TabsTrigger></TabsList></Tabs>
      {page.mode === "mushaf" && <Select value={script} onValueChange={(value) => { const next = value as MushafScript; setScript(next); localStorage.setItem("dhu-al-jalal:quran-script", next); }}><SelectTrigger className="mushaf-script-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="uthmani">عثماني</SelectItem><SelectItem value="imlaei">إملائي</SelectItem><SelectItem value="indopak">هندي باكستاني</SelectItem></SelectContent></Select>}
      <form className="mushaf-jump" onSubmit={(event) => { event.preventDefault(); go(Number(jump)); }}><Input aria-label="رقم صفحة المصحف" inputMode="numeric" value={jump} onChange={setJump} classNames={{ field: "h-10 rounded-xl", input: "text-center" }} /><button className="mushaf-go" type="submit">انتقال</button></form>
    </header>

    <section className="mushaf-stage" onPointerDown={(event) => { startX.current = event.clientX; }} onPointerUp={(event) => finishSwipe(event.clientX)}>
      {page.mode === "mushaf" ? <div className="islamic-mushaf-frame notranslate" translate="no"><Image src={imageUrl} alt={`صفحة ${page.pageNumber} من المصحف`} width={900} height={900} sizes="(max-width: 760px) 100vw, 900px" priority unoptimized /></div> : <div className="tajweed-page notranslate" translate="no"><div className="mushaf-page-meta"><span>تجويد عثماني ملوّن</span><span>صفحة {page.pageNumber.toLocaleString("ar-SA")}</span></div>{page.verses?.map((verse) => <article id={`ayah-${verse.verseNumber}`} key={verse.id}><a href={`/quran/${verse.verseKey.split(":")[0]}#ayah-${verse.verseNumber}`}>{verse.verseKey}</a><p dangerouslySetInnerHTML={{ __html: verse.tajweedMarkup }} /></article>) ?? <div className="mushaf-loading"><BookOpenText />لا توجد آيات في هذه الصفحة.</div>}</div>}
    </section>

    <nav className="mushaf-pagination" aria-label="التنقل بين صفحات المصحف"><button type="button" onClick={() => go(page.pageNumber - 1)} disabled={page.pageNumber === 1}><ArrowRight />الصفحة السابقة</button><span>{page.pageNumber.toLocaleString("ar-SA")} / ٦٠٤</span><button type="button" onClick={() => go(page.pageNumber + 1)} disabled={page.pageNumber === 604}>الصفحة التالية<ArrowLeft /></button></nav>
    <p className="source-line">المصدر الرئيسي: <a href={page.sourceUrl} target="_blank" rel="noreferrer">Islamic App</a> — صفحة مصحف SVG موثقة أو نص تجويد عثماني من المورد نفسه، بلا مفاتيح API.</p>
  </main>;
}
