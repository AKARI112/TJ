import type { Metadata } from "next";
import { ArrowRight, BookMarked } from "lucide-react";
import { VerseTools } from "@/components/quran/verse-tools";
import { getChapter } from "@/lib/islamic/providers/quran/alquran-cloud";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/quran/[surah]">): Promise<Metadata> {
  const { surah } = await params;
  return { title: `سورة رقم ${surah}`, robots: { index: true, follow: true } };
}

export default async function SurahPage({ params }: PageProps<"/quran/[surah]">) {
  const { surah } = await params; const id = Number(surah);
  if (!Number.isInteger(id) || id < 1 || id > 114) return <div className="provider-error"><h1>رقم السورة غير صالح</h1><a href="/quran">العودة إلى السور</a></div>;
  try {
    const result = await getChapter(id); const chapter = result.data;
    return (
      <main className="reading-shell">
        <a href="/quran" className="back-link"><ArrowRight className="size-4" />كل السور</a>
        <header className="surah-header"><BookMarked className="mx-auto size-5 text-accent" /><p>سورة</p><h1>{chapter.nameArabic}</h1><span>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</span></header>
        <article className="quran-reading" translate="no">
          {chapter.verses.map((verse) => (
            <section key={verse.id} id={`ayah-${verse.verseNumber}`} className="verse-block">
              <p className="quran-text">{verse.textUthmani} <span className="ayah-number">{verse.verseNumber.toLocaleString("ar-SA")}</span></p>
              <div className="verse-meta"><span>الجزء {verse.juz.toLocaleString("ar-SA")}</span><span>صفحة {verse.page.toLocaleString("ar-SA")}</span><VerseTools verse={verse} chapterName={chapter.nameArabic} /></div>
            </section>
          ))}
        </article>
        <p className="source-line">النص العثماني من <a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.provider}</a> · لم يُعدّل النص المعروض.</p>
      </main>
    );
  } catch { return <div className="provider-error"><h1>تعذر تحميل السورة حاليًا</h1><p>لا نعرض نصًا غير موثّق عند تعذر المصدر.</p><a href={`/quran/${id}`} className="primary-link">إعادة المحاولة</a></div>; }
}
