import type { Metadata } from "next";
import { BookOpenText, ChevronLeft, Palette, Rows3 } from "lucide-react";
import { getChapters } from "@/lib/islamic/providers/quran";

export const metadata: Metadata = { title: "القرآن الكريم", description: "اقرأ سور القرآن الكريم بنص عثماني موثّق مع حفظ موضع القراءة." };
export const dynamic = "force-dynamic";

export default async function QuranPage() {
  try {
    const result = await getChapters();
    return (
      <main>
        <header className="page-intro"><p className="eyebrow text-primary">القرآن الكريم</p><h1>المصحف والقراءة، في موضع واحد</h1><p>اختر تجربة القراءة المناسبة. يحفظ ذُو الجَلاَلْ موضعك على جهازك ويعيدك إلى الآية أو الصفحة نفسها.</p></header>
        <nav className="quran-mode-links" aria-label="أوضاع قراءة القرآن">
          <a href="/quran/page/1"><BookOpenText /><span><strong>المصحف</strong><small>Islamic App SVG · ٦٠٤ صفحات</small></span></a>
          <a href="/quran/page/1?mode=tajweed"><Palette /><span><strong>التجويد</strong><small>نص عثماني ملوّن موثّق</small></span></a>
          <a href="#surahs"><Rows3 /><span><strong>القراءة</strong><small>نص متجاوب حسب السورة</small></span></a>
        </nav>
        <div id="surahs" className="section-heading mb-4 mt-8"><div><p className="eyebrow text-muted-foreground">الفهرس</p><h2>السور</h2></div></div>
        <div className="chapter-list">
          {result.data.map((chapter) => (
            <a key={chapter.id} href={`/quran/${chapter.id}`} className="chapter-row">
              <span className="chapter-number">{chapter.id.toLocaleString("ar-SA")}</span>
              <span className="min-w-0 flex-1"><strong>{chapter.nameArabic}</strong><small>{chapter.versesCount.toLocaleString("ar-SA")} آية · {chapter.revelationPlace === "makkah" ? "مكية" : "مدنية"}</small></span>
              <ChevronLeft className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
        <p className="source-line">المصدر: <a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.provider}</a></p>
      </main>
    );
  } catch {
    return <ProviderError title="تعذر تحميل سور القرآن حاليًا" />;
  }
}

function ProviderError({ title }: { title: string }) {
  return <div className="provider-error"><BookOpenText className="size-7" /><h1>{title}</h1><p>تحقق من اتصالك ثم أعد المحاولة. لا نعرض نصًا بديلًا غير موثّق.</p><a href="/quran" className="primary-link">إعادة المحاولة</a></div>;
}
