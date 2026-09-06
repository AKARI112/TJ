"use client";

import { BookOpenText, Check, Copy, LoaderCircle, Rows3, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { ShareComposer } from "@/components/share/share-composer";
import type { TajweedPageVerse } from "@/domain/quran";

type TafsirPayload = {
  verseKey: string;
  text: string;
  name: string;
  provider: string;
  sourceUrl: string;
};

export function MushafVerseActions({ verse, onClear }: { verse: TajweedPageVerse; onClear: () => void }) {
  const [copied, setCopied] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsir, setTafsir] = useState<TafsirPayload | null>(null);
  const [tafsirError, setTafsirError] = useState("");
  const [loading, setLoading] = useState(false);
  const [surah, ayah] = verse.verseKey.split(":");

  useEffect(() => {
    setTafsir(null);
    setTafsirError("");
    setTafsirOpen(false);
    setCopied(false);
  }, [verse.verseKey]);

  useEffect(() => {
    if (!tafsirOpen || tafsir) return;
    const controller = new AbortController();
    setLoading(true);
    setTafsirError("");
    fetch(`/api/quran/tafsir/${surah}/${ayah}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "تعذر تحميل التفسير");
        return payload as TafsirPayload;
      })
      .then(setTafsir)
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setTafsirError(error instanceof Error ? error.message : "تعذر تحميل التفسير");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ayah, surah, tafsir, tafsirOpen]);

  async function copyVerse() {
    await navigator.clipboard.writeText(`${verse.textUthmani}\n\nالقرآن الكريم · ${verse.verseKey}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <aside className="mushaf-selection-bar" aria-label={`أدوات الآية ${verse.verseKey}`}>
        <div className="mushaf-selection-text notranslate" translate="no">
          <span>الآية {verse.verseKey}</span>
          <p>{verse.textUthmani}</p>
        </div>
        <div className="mushaf-selection-actions">
          <button type="button" onClick={() => void copyVerse()} aria-label="نسخ الآية">
            {copied ? <Check /> : <Copy />}
            <span>{copied ? "تم النسخ" : "نسخ"}</span>
          </button>
          <button type="button" onClick={() => setTafsirOpen(true)} aria-label="فتح تفسير الآية">
            <BookOpenText />
            <span>التفسير</span>
          </button>
          <ShareComposer text={verse.textUthmani} reference={`القرآن الكريم · ${verse.verseKey}`} title={`الآية ${verse.verseKey}`} quran />
          <a href={`/quran/${surah}?view=cards#ayah-${ayah}`} aria-label="فتح الآية في بطاقات المشاركة">
            <Rows3 />
            <span>بطاقة</span>
          </a>
          <button type="button" onClick={onClear} aria-label="إلغاء تحديد الآية" className="mushaf-selection-close">
            <X />
          </button>
        </div>
      </aside>

      <BottomSheet
        open={tafsirOpen}
        onOpenChange={setTafsirOpen}
        snapPoints={[0.62, 0.9]}
        title={`تفسير الآية ${verse.verseKey}`}
        description="التفسير الميسر من مصدر موثق"
      >
        <div className="mushaf-tafsir-sheet">
          {loading && <div className="study-loading"><LoaderCircle className="animate-spin" />جارٍ تحميل التفسير</div>}
          {tafsirError && <div className="compact-empty"><p>{tafsirError}</p><small>يبقى نص القرآن ظاهرًا كما هو دون استبدال.</small></div>}
          {tafsir && (
            <article>
              <header><BookOpenText /><div><h3>{tafsir.name}</h3><p>{tafsir.provider}</p></div></header>
              <p>{tafsir.text}</p>
              <footer className="content-attribution"><a href={tafsir.sourceUrl} target="_blank" rel="noreferrer">عرض المصدر</a></footer>
            </article>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
