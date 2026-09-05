import type { Metadata } from "next";
import { ArrowRight, BookMarked } from "lucide-react";
import { VerseTools } from "@/components/quran/verse-tools";
import { ReadingProgressTracker } from "@/components/quran/reading-progress-tracker";
import type { QuranVerse } from "@/domain/quran";
import { getChapter } from "@/lib/islamic/providers/quran";
import styles from "./surah-reading.module.css";

export const dynamic = "force-dynamic";

type SurahRouteProps = {
  params: Promise<{ surah: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: SurahRouteProps): Promise<Metadata> {
  const { surah } = await params;
  return { title: `سورة رقم ${surah}`, robots: { index: true, follow: true } };
}

export default async function SurahPage({ params, searchParams }: SurahRouteProps) {
  const { surah } = await params;
  const query = await searchParams;
  const id = Number(surah);
  const requestedView = Array.isArray(query.view) ? query.view[0] : query.view;
  const detailView = requestedView === "detail";

  if (!Number.isInteger(id) || id < 1 || id > 114) {
    return <div className="provider-error"><h1>رقم السورة غير صالح</h1><a href="/quran">العودة إلى السور</a></div>;
  }

  try {
    const result = await getChapter(id);
    const chapter = result.data;
    const pages = groupVersesByPage(chapter.verses);

    return (
      <main className={styles.readerShell}>
        <ReadingProgressTracker verses={chapter.verses} chapterName={chapter.nameArabic} />

        <div className={styles.readerTopbar}>
          <a href="/quran" className="back-link"><ArrowRight className="size-4" />كل السور</a>
          <nav className={styles.viewSwitcher} aria-label="أسلوب عرض السورة">
            <a
              href={`/quran/${id}`}
              className={`${styles.viewLink} ${!detailView ? styles.viewLinkActive : ""}`}
              aria-current={!detailView ? "page" : undefined}
            >
              قراءة المصحف
            </a>
            <a
              href={`/quran/${id}?view=detail`}
              className={`${styles.viewLink} ${detailView ? styles.viewLinkActive : ""}`}
              aria-current={detailView ? "page" : undefined}
            >
              القراءة التفصيلية
            </a>
          </nav>
        </div>

        {detailView ? (
          <>
            <header className="surah-header">
              <BookMarked className="mx-auto size-5 text-accent" />
              <p>سورة</p>
              <h1>{chapter.nameArabic}</h1>
              <span>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</span>
            </header>
            <article className="quran-reading notranslate" translate="no">
              {chapter.verses.map((verse) => (
                <section key={verse.id} id={`ayah-${verse.verseNumber}`} data-verse={verse.verseNumber} className="verse-block">
                  <p className="quran-text">{verse.textUthmani} <span className="ayah-number">{verse.verseNumber.toLocaleString("ar-SA")}</span></p>
                  <div className="verse-meta">
                    <span>الجزء {verse.juz.toLocaleString("ar-SA")}</span>
                    <span>صفحة {verse.page.toLocaleString("ar-SA")}</span>
                    <VerseTools verse={verse} chapterName={chapter.nameArabic} />
                  </div>
                </section>
              ))}
            </article>
          </>
        ) : (
          <>
            <header className={styles.mushafHeader}>
              <div className={styles.headerInner}>
                <span className={styles.surahLabel}>سُورَة</span>
                <h1 className={styles.surahName}>{chapter.nameArabic}</h1>
                <span className={styles.surahMeta}>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</span>
              </div>
            </header>

            <div className={`${styles.mushafPages} notranslate`} translate="no">
              {pages.map(([pageNumber, verses]) => (
                <section key={pageNumber} className={styles.mushafPage} aria-label={`صفحة ${pageNumber.toLocaleString("ar-SA")}`}>
                  <p className={styles.pageText}>
                    {verses.map((verse) => (
                      <span key={verse.id} id={`ayah-${verse.verseNumber}`} data-verse={verse.verseNumber} className={styles.verse}>
                        {verse.textUthmani}{" "}
                        <span className={styles.ayahMark} aria-label={`الآية ${verse.verseNumber.toLocaleString("ar-SA")}`}>
                          {verse.verseNumber.toLocaleString("ar-SA")}
                        </span>{" "}
                      </span>
                    ))}
                  </p>
                  <footer className={styles.pageFooter}>
                    <span>صفحة {pageNumber.toLocaleString("ar-SA")}</span>
                    <span className={styles.pageFooterDot} aria-hidden="true" />
                    <span>{chapter.nameArabic}</span>
                  </footer>
                </section>
              ))}
            </div>
          </>
        )}

        <p className="source-line">النص العثماني من <a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.provider}</a> · لم يُعدّل النص المعروض.</p>
      </main>
    );
  } catch {
    return <div className="provider-error"><h1>تعذر تحميل السورة حاليًا</h1><p>لا نعرض نصًا غير موثّق عند تعذر المصدر.</p><a href={`/quran/${id}`} className="primary-link">إعادة المحاولة</a></div>;
  }
}

function groupVersesByPage(verses: QuranVerse[]) {
  const pages = new Map<number, QuranVerse[]>();
  for (const verse of verses) {
    const page = pages.get(verse.page);
    if (page) page.push(verse);
    else pages.set(verse.page, [verse]);
  }
  return [...pages.entries()];
}
