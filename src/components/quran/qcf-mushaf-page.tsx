"use client";

import { ArrowLeft, ArrowRight, BookOpenText, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/motion/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { MushafPage } from "@/domain/quran";
import { progressRepository } from "@/lib/storage/repositories";

const loadedFonts = new Set<string>();

function fontName(page: number, mode: MushafPage["mode"]) { return `qcf-p${page}-${mode === "tajweed" ? "v4" : "v2"}`; }
function fontUrl(page: number, mode: MushafPage["mode"], dark = true) {
  if (mode === "tajweed") return `https://verses.quran.foundation/fonts/quran/hafs/v4/ot-svg/${dark ? "dark" : "light"}/woff2/p${page}.woff2`;
  return `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;
}

async function loadQcfFont(page: number, mode: MushafPage["mode"], preferredUrl?: string) {
  const name = fontName(page, mode);
  if (loadedFonts.has(name)) return name;
  const dark = document.documentElement.classList.contains("dark");
  const candidates = mode === "tajweed" ? [preferredUrl, fontUrl(page, mode, dark)] : [preferredUrl ?? fontUrl(page, mode)];
  for (const url of candidates.filter(Boolean) as string[]) {
    try {
      const face = new FontFace(name, `url("${url}")`, { display: "block" });
      await face.load();
      document.fonts.add(face);
      loadedFonts.add(name);
      return name;
    } catch { /* Try the documented fallback format. */ }
  }
  throw new Error("تعذر تحميل خط صفحة المصحف");
}

export function QcfMushafPage({ page }: { page: MushafPage }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [fontError, setFontError] = useState(false);
  const [jump, setJump] = useState(String(page.pageNumber));
  const startX = useRef<number | null>(null);
  const family = useMemo(() => fontName(page.pageNumber, page.mode), [page.mode, page.pageNumber]);

  useEffect(() => {
    let active = true;
    setReady(false); setFontError(false);
    const adjacent = [page.pageNumber, page.pageNumber - 1, page.pageNumber + 1].filter((value) => value >= 1 && value <= 604);
    void Promise.all(adjacent.map((value) => loadQcfFont(value, page.mode, value === page.pageNumber ? page.fontUrl : undefined))).then(() => { if (active) setReady(true); }).catch(() => { if (active) setFontError(true); });
    const idle = window.requestIdleCallback?.(() => { const extra = page.pageNumber + 2; if (extra <= 604) void loadQcfFont(extra, page.mode); });
    void progressRepository.save({ id: "quran-current", chapterId: Number(page.lines[0]?.words[0]?.verseKey.split(":")[0] ?? 1), chapterName: "المصحف", verseNumber: Number(page.lines[0]?.words[0]?.verseKey.split(":")[1] ?? 1), pageNumber: page.pageNumber, mushafId: page.mushafId, readingMode: page.mode, timestamp: new Date().toISOString() });
    return () => { active = false; if (idle) window.cancelIdleCallback?.(idle); };
  }, [page]);

  const go = (target: number, mode = page.mode) => { if (target < 1 || target > 604) return; router.push(`/quran/page/${target}${mode === "tajweed" ? "?mode=tajweed" : ""}`); };
  const finishSwipe = (clientX: number) => { if (startX.current === null) return; const delta = clientX - startX.current; startX.current = null; if (Math.abs(delta) < 60) return; go(page.pageNumber + (delta > 0 ? 1 : -1)); };

  return (
    <main className="mushaf-reader">
      <header className="mushaf-toolbar">
        <Tabs value={page.mode} onValueChange={(value) => value === "reading" ? router.push("/quran") : go(page.pageNumber, value as MushafPage["mode"])} variant="segment"><TabsList className="bg-muted"><TabsTrigger value="mushaf">المصحف</TabsTrigger><TabsTrigger value="reading">القراءة</TabsTrigger><TabsTrigger value="tajweed">التجويد</TabsTrigger></TabsList></Tabs>
        <form className="mushaf-jump" onSubmit={(event) => { event.preventDefault(); go(Number(jump)); }}><Input aria-label="رقم صفحة المصحف" inputMode="numeric" value={jump} onChange={setJump} classNames={{ field: "h-10 rounded-xl", input: "text-center" }} /><button className="mushaf-go" type="submit">انتقال</button></form>
        <button type="button" className="icon-action" aria-label="تكبير عرض المصحف"><Maximize2 /></button>
      </header>

      <section className="mushaf-stage" aria-busy={!ready} onPointerDown={(event) => { startX.current = event.clientX; }} onPointerUp={(event) => finishSwipe(event.clientX)}>
        <div className="mushaf-paper notranslate" translate="no">
          <div className="mushaf-page-meta"><span>{page.mode === "tajweed" ? "مصحف التجويد" : "مصحف المدينة"}</span><span>صفحة {page.pageNumber.toLocaleString("ar-SA")}</span></div>
          {!ready && !fontError && <div className="mushaf-loading"><BookOpenText /><span>يُحمّل خط الصفحة الموثق…</span></div>}
          {fontError && <div className="mushaf-loading"><BookOpenText /><span>تعذر تحميل خط QCF. لم نعرض رموزًا بخط غير مطابق.</span></div>}
          {ready && <div className="mushaf-lines" style={{ fontFamily: family }}>{page.lines.map((line) => <div key={line.lineNumber} className="mushaf-line" data-line={line.lineNumber}>{line.words.map((word) => word.charType === "end" ? <span key={word.id} className="mushaf-ayah-end">{word.textFallback}</span> : <span key={word.id} className="mushaf-word" data-verse-key={word.verseKey} dangerouslySetInnerHTML={{ __html: word.glyphCode ?? "" }} />)}</div>)}</div>}
          <div className="mushaf-page-number">{page.pageNumber.toLocaleString("ar-SA")}</div>
        </div>
      </section>

      <nav className="mushaf-pagination" aria-label="التنقل بين صفحات المصحف">
        <button type="button" onClick={() => go(page.pageNumber - 1)} disabled={page.pageNumber === 1}><ArrowRight />الصفحة السابقة</button>
        <span>{page.pageNumber.toLocaleString("ar-SA")} / ٦٠٤</span>
        <button type="button" onClick={() => go(page.pageNumber + 1)} disabled={page.pageNumber === 604}>الصفحة التالية<ArrowLeft /></button>
      </nav>
      <p className="source-line">الرموز والخطوط من <a href={page.sourceUrl} target="_blank" rel="noreferrer">Quran Foundation — QCF {page.mode === "tajweed" ? "Tajweed V4" : "V2"}</a>. يُحمّل خط الصفحة الحالية والمجاورتين فقط.</p>
    </main>
  );
}
