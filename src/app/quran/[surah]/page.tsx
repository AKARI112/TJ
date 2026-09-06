import type { Metadata } from "next";
import { ArrowRight, BookOpenText, Share2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ReadingProgressTracker } from "@/components/quran/reading-progress-tracker";
import { VerseTools } from "@/components/quran/verse-tools";
import { getChapter } from "@/lib/islamic/providers/quran";

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
  const cardsView = requestedView === "cards" || requestedView === "detail";

  if (!Number.isInteger(id) || id < 1 || id > 114) {
    return <div className="provider-error"><h1>رقم السورة غير صالح</h1><a href="/quran">العودة إلى السور</a></div>;
  }

  let result;
  try {
    result = await getChapter(id);
  } catch {
    return <div className="provider-error"><h1>تعذر تحميل السورة حاليًا</h1><p>لا نعرض نصًا غير موثّق عند تعذر المصدر.</p><a href={`/quran/${id}?view=cards`} className="primary-link">إعادة المحاولة</a></div>;
  }

  const chapter = result.data;
  const firstPage = chapter.verses[0]?.page ?? 1;

  if (!cardsView) redirect(`/quran/page/${firstPage}?surah=${id}`);

  return (
    <main className="reading-shell quran-card-reader">
      <ReadingProgressTracker verses={chapter.verses} chapterName={chapter.nameArabic} />

      <div className="quran-card-topbar">
        <a href="/quran" className="back-link"><ArrowRight className="size-4" />كل السور</a>
        <a href={`/quran/page/${firstPage}?surah=${id}`} className="quran-card-mushaf-link"><BookOpenText />العودة إلى المصحف</a>
      </div>

      <header className="quran-card-header">
        <Share2 aria-hidden="true" />
        <p>بطاقات المشاركة</p>
        <h1>{chapter.nameArabic}</h1>
        <span>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</span>
        <small>هذا العرض مخصص للحفظ والمشاركة ودراسة الآيات. القراءة الأساسية تبقى في صفحة المصحف الكاملة.</small>
      </header>

      <article className="quran-share-cards notranslate" translate="no">
        {chapter.verses.map((verse) => (
          <section key={verse.id} id={`ayah-${verse.verseNumber}`} data-verse={verse.verseNumber} className="quran-share-card">
            <p className="quran-text">{verse.textUthmani} <span className="ayah-number">{verse.verseNumber.toLocaleString("ar-SA")}</span></p>
            <div className="quran-share-card-meta">
              <span>الجزء {verse.juz.toLocaleString("ar-SA")}</span>
              <span>صفحة {verse.page.toLocaleString("ar-SA")}</span>
              <VerseTools verse={verse} chapterName={chapter.nameArabic} />
            </div>
          </section>
        ))}
      </article>

      <p className="source-line">النص العثماني من <a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.provider}</a> · لم يُعدّل النص المعروض.</p>
    </main>
  );
}
