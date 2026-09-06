"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpenText, Palette, Rows3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/motion/input";
import type { MushafPage } from "@/domain/quran";
import { islamicAppMushafUrl } from "@/lib/islamic/quran-utils";
import { progressRepository } from "@/lib/storage/repositories";

export function IslamicAppMushafPage({ page }: { page: MushafPage }) {
  const router = useRouter();
  const [jump, setJump] = useState(String(page.pageNumber));
  const startX = useRef<number | null>(null);
  const fallbackImageUrl = islamicAppMushafUrl(page.pageNumber, "light", "uthmani");
  const [imageUrl, setImageUrl] = useState(page.imageUrl ?? fallbackImageUrl);
  const [chapterId = "1"] = (page.firstVerseKey ?? "1:1").split(":");
  const chapterNumber = Number(chapterId) || 1;

  useEffect(() => {
    setImageUrl(page.imageUrl ?? fallbackImageUrl);
    setJump(String(page.pageNumber));
    const [currentChapterId = "1", verseNumber = "1"] = (page.firstVerseKey ?? "1:1").split(":");
    void progressRepository.save({
      id: "quran-current",
      chapterId: Number(currentChapterId),
      chapterName: "المصحف",
      verseNumber: Number(verseNumber),
      pageNumber: page.pageNumber,
      mushafId: 1,
      readingMode: page.mode,
      timestamp: new Date().toISOString(),
    });
  }, [fallbackImageUrl, page]);

  const go = (target: number, mode = page.mode) => {
    if (target < 1 || target > 604) return;
    router.push(`/quran/page/${target}${mode === "tajweed" ? "?mode=tajweed" : ""}`);
  };

  const finishSwipe = (clientX: number) => {
    if (startX.current === null) return;
    const delta = clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) >= 60) go(page.pageNumber + (delta > 0 ? 1 : -1));
  };

  return <main className="mushaf-reader authentic-mushaf-reader">
    <header className="mushaf-toolbar">
      <nav className="mushaf-mode-switcher" aria-label="أوضاع عرض القرآن">
        <a href={`/quran/page/${page.pageNumber}`} aria-current={page.mode === "mushaf" ? "page" : undefined}><BookOpenText />المصحف التقليدي</a>
        <a href={`/quran/${chapterNumber}?view=cards`}><Rows3 />بطاقات المشاركة</a>
        <a href={`/quran/page/${page.pageNumber}?mode=tajweed`} aria-current={page.mode === "tajweed" ? "page" : undefined}><Palette />التجويد</a>
      </nav>
      <form className="mushaf-jump" onSubmit={(event) => { event.preventDefault(); go(Number(jump)); }}>
        <Input aria-label="رقم صفحة المصحف" inputMode="numeric" value={jump} onChange={setJump} classNames={{ field: "h-10 rounded-xl", input: "text-center" }} />
        <button className="mushaf-go" type="submit">انتقال</button>
      </form>
    </header>

    <section className="mushaf-stage" onPointerDown={(event) => { startX.current = event.clientX; }} onPointerUp={(event) => finishSwipe(event.clientX)}>
      {page.mode === "mushaf" ? (
        <div className="islamic-mushaf-frame authentic-mushaf-frame notranslate" translate="no">
          <Image
            src={imageUrl}
            alt={`صفحة ${page.pageNumber} من المصحف`}
            width={1200}
            height={1700}
            sizes="(max-width: 760px) 100vw, 840px"
            priority
            unoptimized
            onError={() => { if (imageUrl !== fallbackImageUrl) setImageUrl(fallbackImageUrl); }}
          />
        </div>
      ) : (
        <div className="tajweed-page notranslate" translate="no">
          <div className="mushaf-page-meta"><span>تجويد عثماني ملوّن</span><span>صفحة {page.pageNumber.toLocaleString("ar-SA")}</span></div>
          {page.verses?.map((verse) => <article id={`ayah-${verse.verseNumber}`} key={verse.id}><a href={`/quran/${verse.verseKey.split(":")[0]}?view=cards#ayah-${verse.verseNumber}`}>{verse.verseKey}</a><p dangerouslySetInnerHTML={{ __html: verse.tajweedMarkup }} /></article>) ?? <div className="mushaf-loading"><BookOpenText />لا توجد آيات في هذه الصفحة.</div>}
        </div>
      )}
    </section>

    <nav className="mushaf-pagination" aria-label="التنقل بين صفحات المصحف">
      <button type="button" onClick={() => go(page.pageNumber - 1)} disabled={page.pageNumber === 1}><ArrowRight />الصفحة السابقة</button>
      <span>{page.pageNumber.toLocaleString("ar-SA")} / ٦٠٤</span>
      <button type="button" onClick={() => go(page.pageNumber + 1)} disabled={page.pageNumber === 604}>الصفحة التالية<ArrowLeft /></button>
    </nav>

    {page.mode === "mushaf" ? (
      <p className="source-line mushaf-source-note">صفحة المصحف الكاملة من <a href={page.sourceUrl} target="_blank" rel="noreferrer">Al Furqan</a> بصيغة SVG، مع <a href={`https://api.islamic.app/v1/mushaf/page/${page.pageNumber}.svg`} target="_blank" rel="noreferrer">Islamic App</a> كمصدر احتياطي. لا يعيد الموقع تركيب أسطر المصحف أو زخارفه.</p>
    ) : (
      <p className="source-line">نص التجويد من <a href={page.sourceUrl} target="_blank" rel="noreferrer">{page.provider}</a>.</p>
    )}
  </main>;
}
