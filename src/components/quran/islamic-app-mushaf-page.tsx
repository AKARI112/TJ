"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpenText, Palette, Rows3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/motion/input";
import { MushafVerseActions } from "@/components/quran/mushaf-verse-actions";
import type { MushafLayoutWord, MushafPage, TajweedPageVerse } from "@/domain/quran";
import { islamicAppMushafUrl } from "@/lib/islamic/quran-utils";
import { progressRepository } from "@/lib/storage/repositories";

function verseKeyFromLocation(location: string) {
  const [surah, ayah] = location.split(":");
  return surah && ayah ? `${surah}:${ayah}` : "";
}

export function IslamicAppMushafPage({ page }: { page: MushafPage }) {
  const router = useRouter();
  const [jump, setJump] = useState(String(page.pageNumber));
  const startX = useRef<number | null>(null);
  const fallbackImageUrl = islamicAppMushafUrl(page.pageNumber, "light", "uthmani");
  const [imageUrl, setImageUrl] = useState(page.imageUrl ?? fallbackImageUrl);
  const [selectedVerse, setSelectedVerse] = useState<TajweedPageVerse | null>(null);
  const [chapterId = "1"] = (page.firstVerseKey ?? page.verses?.[0]?.verseKey ?? "1:1").split(":");
  const chapterNumber = Number(chapterId) || 1;
  const qcfFontName = `QCFPage${page.pageNumber}${page.mode === "tajweed" ? "T" : "P"}`;

  const versesByKey = useMemo(
    () => new Map((page.verses ?? []).map((verse) => [verse.verseKey, verse])),
    [page.verses],
  );

  useEffect(() => {
    setImageUrl(page.imageUrl ?? fallbackImageUrl);
    setJump(String(page.pageNumber));
    setSelectedVerse(null);
    const [currentChapterId = "1", verseNumber = "1"] = (page.firstVerseKey ?? page.verses?.[0]?.verseKey ?? "1:1").split(":");
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

  function selectVerseFromWord(word: MushafLayoutWord) {
    const verseKey = verseKeyFromLocation(word.location);
    if (!verseKey) return;
    const providedVerse = versesByKey.get(verseKey);
    if (providedVerse) {
      setSelectedVerse(providedVerse);
      return;
    }

    const [surah, ayah] = verseKey.split(":");
    const fallbackWords = (page.layout ?? [])
      .flatMap((line) => line.words)
      .filter((candidate) => verseKeyFromLocation(candidate.location) === verseKey && !candidate.isEnd)
      .map((candidate) => candidate.word);
    if (!fallbackWords.length) return;
    const verseNumber = Number(ayah);
    setSelectedVerse({
      id: Number(`${surah}${ayah}`),
      verseKey,
      verseNumber,
      textUthmani: fallbackWords.join(" "),
      tajweedMarkup: fallbackWords.join(" "),
    });
  }

  const hasInteractiveQcf = Boolean(page.layout?.length && page.fontUrl);

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

    {hasInteractiveQcf && (
      <p className="mushaf-interaction-hint">اضغط على أي كلمة في الصفحة لتحديد آيتها، ثم يمكنك نسخها أو فتح تفسيرها أو مشاركتها.</p>
    )}

    <section className="mushaf-stage" onPointerDown={(event) => { startX.current = event.clientX; }} onPointerUp={(event) => finishSwipe(event.clientX)}>
      {hasInteractiveQcf ? (
        <>
          <style>{`@font-face{font-family:"${qcfFontName}";src:url("${page.fontUrl}") format("truetype");font-display:block;}`}</style>
          <div className={`qcf-mushaf-page ${page.mode === "tajweed" ? "qcf-mushaf-tajweed" : ""}`}>
            <div className="qcf-mushaf-inner notranslate" translate="no">
              {page.layout?.map((line, index, lines) => {
                const duplicateWithNext = lines[index + 1]?.line === line.line;
                const gridRow = Math.max(1, Math.min(15, line.type === "surah-header" && duplicateWithNext ? line.line - 1 : line.line));

                if (line.type === "surah-header") {
                  return <div key={`${line.line}-${index}`} className="qcf-mushaf-line qcf-surah-header" style={{ gridRow }}><span>{line.text}</span></div>;
                }

                if (!line.words.length) {
                  return <div key={`${line.line}-${index}`} className="qcf-mushaf-line qcf-plain-line" style={{ gridRow }}><span>{line.text}</span></div>;
                }

                return (
                  <div key={`${line.line}-${index}`} className={`qcf-mushaf-line ${line.type === "basmala" ? "qcf-basmala-line" : ""}`} style={{ gridRow }}>
                    {line.words.map((word) => {
                      const verseKey = verseKeyFromLocation(word.location);
                      const selected = selectedVerse?.verseKey === verseKey;
                      return (
                        <button
                          type="button"
                          key={word.location}
                          className={`qcf-mushaf-word ${selected ? "qcf-mushaf-word-selected" : ""}`}
                          style={{ fontFamily: `"${qcfFontName}"` }}
                          onClick={() => selectVerseFromWord(word)}
                          aria-label={`${word.word}${verseKey ? `، الآية ${verseKey}` : ""}`}
                          title={word.word}
                        >
                          {word.qpcV2}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <span className="qcf-mushaf-page-number">{page.pageNumber.toLocaleString("ar-SA")}</span>
          </div>
        </>
      ) : (
        <div className="islamic-mushaf-frame authentic-mushaf-frame notranslate" translate="no">
          <Image
            src={imageUrl}
            alt={`صفحة ${page.pageNumber} من المصحف`}
            width={1200}
            height={1700}
            sizes="(max-width: 760px) calc(100vw - 2rem), 820px"
            priority
            unoptimized
            onError={() => { if (imageUrl !== fallbackImageUrl) setImageUrl(fallbackImageUrl); }}
          />
        </div>
      )}
    </section>

    {selectedVerse && <MushafVerseActions verse={selectedVerse} onClear={() => setSelectedVerse(null)} />}

    <nav className="mushaf-pagination" aria-label="التنقل بين صفحات المصحف">
      <button type="button" onClick={() => go(page.pageNumber - 1)} disabled={page.pageNumber === 1}><ArrowRight />الصفحة السابقة</button>
      <span>{page.pageNumber.toLocaleString("ar-SA")} / ٦٠٤</span>
      <button type="button" onClick={() => go(page.pageNumber + 1)} disabled={page.pageNumber === 604}>الصفحة التالية<ArrowLeft /></button>
    </nav>

    {hasInteractiveQcf ? (
      <p className="source-line mushaf-source-note">عرض الصفحة بخطوط QCF {page.mode === "tajweed" ? "V4 الملوّنة للتجويد" : "V2"} وتخطيط الصفحة من <a href="https://alfurqan.online/docs" target="_blank" rel="noreferrer">Al Furqan</a>. النص التفاعلي للنسخ مرتبط بآيات الصفحة الموثقة ولا يغيّر رسم المصحف.</p>
    ) : page.mode === "tajweed" ? (
      <p className="source-line mushaf-source-note">تعذر تحميل خط التجويد التفاعلي لهذه الصفحة، لذلك عُرضت الصفحة الأصلية بدل إظهار خطأ يمنع القراءة. أعد المحاولة لاحقًا لاستعادة ألوان التجويد.</p>
    ) : (
      <p className="source-line mushaf-source-note">صفحة المصحف الكاملة من <a href={page.sourceUrl} target="_blank" rel="noreferrer">Al Furqan</a> بصيغة SVG، مع <a href={`https://api.islamic.app/v1/mushaf/page/${page.pageNumber}.svg`} target="_blank" rel="noreferrer">Islamic App</a> كمصدر احتياطي.</p>
    )}
  </main>;
}
